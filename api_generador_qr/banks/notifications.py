"""Listener unificado de notificaciones Android.

Corre en un hilo de fondo y hace polling de `adb shell dumpsys notification`.
Cuando detecta una notificación nueva de alguno de los paquetes registrados,
llama al callback correspondiente con el texto completo de la notificación.

Uso:
    listener = NotificationListener(adb)
    listener.register("bo.com.bmsc.bancamovil", on_msc_notif)
    listener.register("bec.vdb.direct", on_zas_notif)
    listener.start()
    ...
    listener.stop()
"""
from __future__ import annotations

import re
import threading
import time
from typing import Callable, Dict, Optional, Set

import logging

from .adb import AdbController

log = logging.getLogger("banks.notifications")

# ── Parsers de dumpsys notification ────────────────────────────────────────────

RE_RECORD  = re.compile(r"NotificationRecord\(0x[0-9a-f]+:\s*pkg=(\S+)")
RE_KEY     = re.compile(r"\bkey=([^\s)]+)")
RE_CHANNEL = re.compile(r"channel=(\S+)")
RE_WHEN    = re.compile(r"^\s*when=(\d+)")
RE_TITLE   = re.compile(r"android\.title=\S+\s*\((.*)\)\s*$")
RE_TEXT    = re.compile(r"android\.text=\S+\s*\((.*)\)\s*$")
RE_BIGTEXT = re.compile(r"android\.bigText=\S+\s*\((.*)\)\s*$")


def parse_notifications(dump: str, packages: Set[str]) -> list[dict]:
    """Parsea el output de dumpsys notification y devuelve notificaciones
    cuyo paquete esté en `packages`.

    Cada notificación devuelta es un dict con claves:
        pkg, key, channel, when, title, text, bigtext
    """
    out: list[dict] = []
    lines = dump.splitlines()
    i = 0
    while i < len(lines):
        m = RE_RECORD.search(lines[i])
        if not m or m.group(1) not in packages:
            i += 1
            continue
        pkg = m.group(1)
        # La cabecera puede continuar en líneas siguientes hasta el primer ')'
        header = lines[i]
        j = i
        while ")" not in header.split("Notification(", 1)[-1] and j + 1 < len(lines):
            j += 1
            header += " " + lines[j].strip()

        rec: dict = {"pkg": pkg}
        if mk := RE_KEY.search(header):
            rec["key"] = mk.group(1)
        if mc := RE_CHANNEL.search(header):
            rec["channel"] = mc.group(1)

        k = j + 1
        while k < len(lines) and "NotificationRecord(" not in lines[k]:
            line = lines[k]
            if (mw := RE_WHEN.match(line)) and "when" not in rec:
                rec["when"] = int(mw.group(1))
            if (mt := RE_TITLE.search(line)) and "title" not in rec:
                rec["title"] = mt.group(1)
            if (mx := RE_TEXT.search(line)) and "text" not in rec:
                rec["text"] = mx.group(1)
            if (mb := RE_BIGTEXT.search(line)) and "bigtext" not in rec:
                rec["bigtext"] = mb.group(1)
            k += 1

        out.append(rec)
        i = k
    return out


def notif_blob(n: dict) -> str:
    """Texto completo de una notificación (title + text + bigtext)."""
    return " | ".join(filter(None, [n.get("title"), n.get("text"), n.get("bigtext")]))


# ── Listener ───────────────────────────────────────────────────────────────────

Callback = Callable[[dict], None]


class NotificationListener:
    """Hilo de fondo que hace polling de notificaciones Android.

    Registra callbacks por paquete; sólo llama al callback cuando aparece
    una notificación *nueva* (no vista antes por su `key`).
    """

    def __init__(self, adb: AdbController, poll_s: float = 2.0):
        self.adb = adb
        self.poll_s = poll_s
        self._callbacks: Dict[str, list[Callback]] = {}
        self._seen: Set[str] = set()
        self._stop = threading.Event()
        self._thread: Optional[threading.Thread] = None

    def register(self, package: str, callback: Callback) -> None:
        """Registra un callback para notificaciones del `package` dado."""
        self._callbacks.setdefault(package, []).append(callback)
        log.info("Listener: callback registrado para pkg=%s", package)

    def start(self) -> None:
        """Toma snapshot inicial y arranca el hilo de polling."""
        self._snapshot_initial()
        self._stop.clear()
        self._thread = threading.Thread(
            target=self._loop, name="notif-listener", daemon=True
        )
        self._thread.start()
        log.info("Listener: iniciado (poll=%.1fs, paquetes=%s)",
                 self.poll_s, list(self._callbacks.keys()))

    def stop(self) -> None:
        """Detiene el hilo."""
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=5)
        log.info("Listener: detenido")

    # ------------------------------------------------------------------
    # internals
    # ------------------------------------------------------------------

    def _snapshot_initial(self) -> None:
        """Marca las notificaciones actuales como ya vistas para no
        procesar pagos anteriores al arranque."""
        try:
            dump = self.adb.dump_notifications()
            pkgs = set(self._callbacks.keys())
            for n in parse_notifications(dump, pkgs):
                if k := n.get("key"):
                    self._seen.add(k)
            log.info("Listener: %d notificaciones iniciales ignoradas", len(self._seen))
        except Exception as exc:
            log.warning("Listener: no se pudo tomar snapshot inicial: %s", exc)

    def _loop(self) -> None:
        while not self._stop.is_set():
            try:
                self._poll_once()
            except Exception as exc:
                log.exception("Listener: error en poll: %s", exc)
            self._stop.wait(timeout=self.poll_s)

    def _poll_once(self) -> None:
        try:
            dump = self.adb.dump_notifications()
        except Exception as exc:
            log.warning("Listener: dumpsys falló: %s", exc)
            return

        pkgs = set(self._callbacks.keys())
        for n in parse_notifications(dump, pkgs):
            key = n.get("key")
            if not key or key in self._seen:
                continue
            self._seen.add(key)
            pkg = n["pkg"]
            for cb in self._callbacks.get(pkg, []):
                try:
                    cb(n)
                except Exception as exc:
                    log.exception("Listener: callback error para pkg=%s: %s", pkg, exc)

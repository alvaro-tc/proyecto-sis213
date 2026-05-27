"""Controlador ADB unificado para todos los bancos.

Fusiona lo mejor de api_msc/msc_api.py:Adb y api_zas/adb_controller.py:
- Comandos básicos de msc (run/shell con text=True, encoding utf-8)
- wake_and_unlock con detección real de lockscreen (msc)
- wait_for_text / wait_for_any vía UI automator dump (msc)
- wifi_disable/enable con fallback cmd→svc (msc)
- wait_wifi_connected via 'ip addr show wlan0' (msc)
- cycle_wifi reutiliza los waits del config (msc)
- pull / rm / ls de archivos en el dispositivo (msc)
- screencap en binario para QR decode (zas)
- dump_notifications para el listener (ambos)
"""
from __future__ import annotations

import shutil
import subprocess
import time
from pathlib import Path
from typing import Optional

import logging

log = logging.getLogger("banks.adb")


class AdbController:
    """Wrapper sobre el binario `adb`.

    Parameters
    ----------
    adb_path:
        Ruta al ejecutable adb (o simplemente "adb" si está en PATH).
    serial:
        Serial del dispositivo (``adb -s <serial>``).  Si es None, adb usa
        el único dispositivo conectado.
    """

    def __init__(self, adb_path: str = "adb", serial: Optional[str] = None):
        self.adb_path = adb_path
        self.serial = serial
        if not Path(adb_path).exists() and not shutil.which(adb_path):
            log.warning("adb no encontrado en la ruta especificada: %s — asegúrate de que esté en PATH", adb_path)

    # ------------------------------------------------------------------
    # Core
    # ------------------------------------------------------------------

    def _base(self) -> list[str]:
        cmd = [self.adb_path]
        if self.serial:
            cmd += ["-s", self.serial]
        return cmd

    def run(self, *args: str, binary: bool = False,
            check: bool = False, timeout: int = 30) -> subprocess.CompletedProcess:
        """Ejecuta un comando adb y devuelve el CompletedProcess.

        Si ``binary=True`` no se decodifica stdout (útil para screencap).
        """
        cmd = self._base() + list(args)
        log.debug("ADB > %s", " ".join(cmd))
        if binary:
            result = subprocess.run(cmd, capture_output=True, timeout=timeout, check=False)
        else:
            result = subprocess.run(
                cmd, capture_output=True, timeout=timeout, check=False,
                text=True, encoding="utf-8", errors="replace",
            )
        if result.returncode != 0:
            stderr = result.stderr if isinstance(result.stderr, str) else result.stderr.decode(errors="ignore")
            log.warning("ADB error (%d): %s", result.returncode, stderr.strip())
        return result

    def shell(self, *args: str, check: bool = False) -> str:
        """Ejecuta ``adb shell <args>`` y devuelve stdout como str."""
        return self.run("shell", *args, check=check).stdout or ""

    # ------------------------------------------------------------------
    # Estado del dispositivo
    # ------------------------------------------------------------------

    def device_online(self) -> bool:
        """True si el dispositivo está conectado y autorizado."""
        try:
            out = self.run("devices").stdout or ""
            for line in out.strip().splitlines()[1:]:
                stripped = line.strip()
                if not stripped:
                    continue
                if "device" in stripped and "offline" not in stripped:
                    if not self.serial or self.serial in stripped:
                        return True
        except Exception:
            pass
        return False

    def is_awake(self) -> bool:
        try:
            for line in self.shell("dumpsys", "power").splitlines():
                if "mWakefulness=" in line:
                    return "Awake" in line
        except Exception:
            pass
        return False

    def is_locked(self) -> bool:
        try:
            for line in self.shell("dumpsys", "window").splitlines():
                if "mDreamingLockscreen=" in line:
                    return "mDreamingLockscreen=true" in line
        except Exception:
            pass
        return False

    # ------------------------------------------------------------------
    # Pantalla / Wake
    # ------------------------------------------------------------------

    def wake_up(self) -> None:
        """Enciende la pantalla sin verificar lockscreen."""
        out = self.shell("dumpsys", "power")
        if "mWakefulness=Awake" not in out:
            self.shell("input", "keyevent", "KEYCODE_POWER")
        self.shell("input", "keyevent", "KEYCODE_WAKEUP")

    def wake_and_unlock(self, screen_width: int, screen_height: int,
                        wake_timeout_s: float = 5.0) -> None:
        """Despierta la pantalla y desliza para desbloquear si es necesario.

        Parameters
        ----------
        screen_width / screen_height:
            Resolución del dispositivo (para calcular el swipe de desbloqueo).
        """
        if not self.is_awake():
            self.shell("input", "keyevent", "KEYCODE_WAKEUP")
            deadline = time.time() + wake_timeout_s
            while time.time() < deadline:
                if self.is_awake():
                    break
                time.sleep(0.3)
            else:
                raise RuntimeError("No se pudo despertar la pantalla")
            time.sleep(0.5)

        if self.is_locked():
            self.swipe(screen_width // 2, int(screen_height * 0.85),
                       screen_width // 2, int(screen_height * 0.20), 250)
            time.sleep(1.0)
            if self.is_locked():
                raise RuntimeError(
                    "Lockscreen activo tras swipe — el teléfono tiene PIN/patrón. "
                    "Desbloquear manualmente."
                )

    def screen_off(self) -> None:
        self.shell("input", "keyevent", "KEYCODE_SLEEP")

    # ------------------------------------------------------------------
    # Input
    # ------------------------------------------------------------------

    def tap(self, x: int, y: int) -> None:
        self.shell("input", "tap", str(x), str(y))

    def swipe(self, x1: int, y1: int, x2: int, y2: int, ms: int = 300) -> None:
        self.shell("input", "swipe", str(x1), str(y1), str(x2), str(y2), str(ms))

    def text(self, value: str) -> None:
        """Escribe texto (sin soporte de espacios/tildes — usar ASCII)."""
        self.shell("input", "text", value.replace(" ", "%s"))

    def keyevent(self, code: str) -> None:
        self.shell("input", "keyevent", code)

    # ------------------------------------------------------------------
    # Apps
    # ------------------------------------------------------------------

    def launch_app(self, package: str, activity: Optional[str] = None) -> None:
        if activity:
            self.shell("am", "start", "-n", f"{package}/{activity}")
        else:
            self.shell("monkey", "-p", package, "-c",
                       "android.intent.category.LAUNCHER", "1")

    def force_stop(self, package: str) -> None:
        self.shell("am", "force-stop", package)

    # ------------------------------------------------------------------
    # Archivos en el dispositivo
    # ------------------------------------------------------------------

    def pull(self, remote: str, local: Path) -> None:
        self.run("pull", remote, str(local))

    def rm(self, remote: str) -> None:
        self.shell("rm", "-f", remote)

    def ls(self, remote_dir: str) -> set[str]:
        try:
            out = self.shell("ls", remote_dir) or ""
            return set(out.split())
        except Exception:
            return set()

    # ------------------------------------------------------------------
    # Captura de pantalla
    # ------------------------------------------------------------------

    def screencap(self) -> bytes:
        """Devuelve el screenshot como bytes PNG."""
        result = self.run("exec-out", "screencap", "-p", binary=True, timeout=15)
        return result.stdout or b""

    # ------------------------------------------------------------------
    # UI Automator
    # ------------------------------------------------------------------

    def ui_dump(self) -> str:
        """Dump XML del UI hierarchy actual.

        uiautomator dump imprime "UI hierchary dumped to: /sdcard/_ui.xml" en
        stdout junto con el XML en el archivo — leemos el archivo por separado
        para obtener XML limpio.
        """
        try:
            self.shell("uiautomator", "dump", "/sdcard/_ui.xml")
            raw = self.shell("cat", "/sdcard/_ui.xml")
            # Extraer sólo la parte XML (desde el primer '<')
            idx = raw.find("<")
            return raw[idx:] if idx != -1 else raw
        except Exception:
            return ""

    def wait_for_text(self, needle: str, timeout_s: float = 15.0,
                      poll_s: float = 1.0) -> bool:
        """Espera hasta que `needle` aparezca en el UI hierarchy (case-insensitive)."""
        deadline = time.time() + timeout_s
        needle_l = needle.lower()
        while time.time() < deadline:
            if needle_l in self.ui_dump().lower():
                return True
            time.sleep(poll_s)
        return False

    def wait_for_any(self, needles: list[str], timeout_s: float = 15.0,
                     poll_s: float = 1.0) -> Optional[str]:
        """Como wait_for_text pero acepta lista; devuelve el primero que aparezca."""
        deadline = time.time() + timeout_s
        lower = [n.lower() for n in needles]
        while time.time() < deadline:
            xml = self.ui_dump().lower()
            for orig, n in zip(needles, lower):
                if n in xml:
                    return orig
            time.sleep(poll_s)
        return None

    # ------------------------------------------------------------------
    # WiFi
    # ------------------------------------------------------------------

    def wifi_disable(self) -> None:
        r = self.run("shell", "cmd", "wifi", "set-wifi-enabled", "disabled")
        if r.returncode != 0 or "error" in (r.stdout or "" + r.stderr or "").lower():
            self.shell("svc", "wifi", "disable")

    def wifi_enable(self) -> None:
        r = self.run("shell", "cmd", "wifi", "set-wifi-enabled", "enabled")
        if r.returncode != 0 or "error" in (r.stdout or "" + r.stderr or "").lower():
            self.shell("svc", "wifi", "enable")

    def wait_wifi_connected(self, timeout_s: float = 30.0, poll_s: float = 1.5) -> bool:
        """Espera hasta que wlan0 tenga IP asignada."""
        deadline = time.time() + timeout_s
        while time.time() < deadline:
            try:
                out = self.shell("ip", "addr", "show", "wlan0")
                if "inet " in out:
                    return True
            except Exception:
                pass
            time.sleep(poll_s)
        return False

    def cycle_wifi(self, disable_wait: float = 2.0, enable_wait: float = 1.5,
                   reconnect_timeout: float = 30.0) -> None:
        """Apaga WiFi, lo enciende y espera reconexión."""
        log.info("WiFi: apagando")
        self.wifi_disable()
        time.sleep(disable_wait)

        log.info("WiFi: encendiendo")
        self.wifi_enable()

        if self.wait_wifi_connected(timeout_s=reconnect_timeout):
            log.info("WiFi: conectado")
        else:
            log.warning("WiFi: no reconectó en %.0fs — continuando igual", reconnect_timeout)

        time.sleep(enable_wait)

    # ------------------------------------------------------------------
    # Notificaciones
    # ------------------------------------------------------------------

    def dump_notifications(self) -> str:
        return self.shell("dumpsys", "notification", "--noredact")

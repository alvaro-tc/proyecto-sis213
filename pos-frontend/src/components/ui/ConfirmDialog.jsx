import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdWarningAmber,
  MdInfoOutline,
  MdCheckCircleOutline,
  MdErrorOutline,
} from "react-icons/md";
import Button from "./Button.jsx";

const VARIANT_STYLES = {
  danger: {
    icon: MdErrorOutline,
    iconWrap: "bg-red-500/15 text-red-500",
    confirmVariant: "danger",
  },
  warning: {
    icon: MdWarningAmber,
    iconWrap: "bg-yellow-500/15 text-yellow-500",
    confirmVariant: "primary",
  },
  success: {
    icon: MdCheckCircleOutline,
    iconWrap: "bg-green-500/15 text-green-500",
    confirmVariant: "success",
  },
  info: {
    icon: MdInfoOutline,
    iconWrap: "bg-theme-brand/15 text-theme-brand",
    confirmVariant: "primary",
  },
};

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Confirmar acción?",
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "warning",
  isLoading = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape" && !isLoading) onClose?.();
      if (e.key === "Enter" && !isLoading) onConfirm?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, isLoading, onClose, onConfirm]);

  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.warning;
  const Icon = styles.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !isLoading && onClose?.()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="bg-theme-card border border-theme-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
          >
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${styles.iconWrap}`}>
                <Icon size={32} />
              </div>
              <div className="flex flex-col gap-1">
                <h2
                  id="confirm-dialog-title"
                  className="text-theme-text text-lg font-bold"
                >
                  {title}
                </h2>
                {description && (
                  <p className="text-theme-muted text-sm leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-theme-base/60 border-t border-theme-border px-6 py-4 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                {cancelLabel}
              </Button>
              <Button
                variant={styles.confirmVariant}
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? "Procesando…" : confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;

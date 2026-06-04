import React, { useState } from 'react';
import './AlertSystem.css';

// ── Global state holder ──────────────────────────────────────
let _setToasts = null;
let _setDialog = null;

// ── Toast (non-blocking notification) ───────────────────────
export function toast(message, type = 'info', duration = 3500) {
  if (!_setToasts) return;
  const id = Date.now() + Math.random();
  _setToasts(prev => [...prev, { id, message, type }]);
  setTimeout(() => {
    _setToasts(prev => prev.filter(t => t.id !== id));
  }, duration);
}

// Shorthand helpers
toast.success = (msg) => toast(msg, 'success');
toast.error   = (msg) => toast(msg, 'error');
toast.warning = (msg) => toast(msg, 'warning');
toast.info    = (msg) => toast(msg, 'info');

// ── Alert (blocking, single button) ─────────────────────────
export function alert(message, title = 'Informasi') {
  return new Promise(resolve => {
    if (!_setDialog) { window.alert(message); resolve(); return; }
    _setDialog({ type: 'alert', title, message, resolve });
  });
}

// ── Confirm (blocking, yes/no) ───────────────────────────────
export function confirm(message, title = 'Konfirmasi') {
  return new Promise(resolve => {
    if (!_setDialog) { resolve(window.confirm(message)); return; }
    _setDialog({ type: 'confirm', title, message, resolve });
  });
}

// ── Provider component (mount once at root) ──────────────────
export function AlertProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);

  // Register global setters
  _setToasts = setToasts;
  _setDialog = setDialog;

  const closeDialog = (result) => {
    if (dialog?.resolve) dialog.resolve(result);
    setDialog(null);
  };

  const icons = {
    success: '✓',
    error:   '✕',
    warning: '⚠',
    info:    'ℹ',
  };

  return (
    <>
      {children}

      {/* TOAST CONTAINER */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">{icons[t.type]}</span>
            <span className="toast-msg">{t.message}</span>
            <button className="toast-close" onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}>✕</button>
          </div>
        ))}
      </div>

      {/* DIALOG OVERLAY */}
      {dialog && (
        <div className="dialog-overlay" onClick={() => dialog.type === 'alert' && closeDialog()}>
          <div className="dialog-box" onClick={e => e.stopPropagation()}>
            <div className={`dialog-icon-wrap dialog-${dialog.type}`}>
              {dialog.type === 'confirm' ? '❓' : dialog.type === 'error' ? '❌' : '💬'}
            </div>
            <h3 className="dialog-title">{dialog.title}</h3>
            <p className="dialog-message">{dialog.message}</p>
            <div className="dialog-actions">
              {dialog.type === 'confirm' ? (
                <>
                  <button className="dialog-btn dialog-btn-cancel" onClick={() => closeDialog(false)}>
                    Batal
                  </button>
                  <button className="dialog-btn dialog-btn-confirm" onClick={() => closeDialog(true)}>
                    Ya, Lanjutkan
                  </button>
                </>
              ) : (
                <button className="dialog-btn dialog-btn-ok" onClick={() => closeDialog(true)}>
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

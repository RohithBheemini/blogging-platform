// src/components/Toast.jsx
import { useState, useCallback, useEffect, createContext, useContext } from 'react';

const ToastContext = createContext(null);

let id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
    const newId = ++id;
    setToasts((t) => [...t, { id: newId, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== newId)), 3200);
  }, []);

  const toast = {
    success: (msg) => addToast('success', msg),
    error:   (msg) => addToast('error',   msg),
    info:    (msg) => addToast('info',    msg),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={styles.container}>
        {toasts.map((t) => (
          <div key={t.id} style={{ ...styles.toast, ...styles[t.type] }}>
            <span style={styles.icon}>{icons[t.type]}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const icons = { success: '✓', error: '✕', info: 'ℹ' };

const styles = {
  container: {
    position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9000,
    display: 'flex', flexDirection: 'column', gap: '0.5rem',
  },
  toast: {
    background: '#0f0e0c', color: '#f5f0e8',
    padding: '12px 18px', borderRadius: '8px',
    fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,.25)', maxWidth: '320px',
    animation: 'fadeUp .3s ease',
  },
  icon: { fontWeight: 700, flexShrink: 0 },
  success: { borderLeft: '3px solid #3a7a50' },
  error:   { borderLeft: '3px solid #b84040' },
  info:    { borderLeft: '3px solid #c8893a' },
};

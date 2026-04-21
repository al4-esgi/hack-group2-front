import { useRegisterSW } from 'virtual:pwa-register/react'

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#1a1a1a',
        color: '#fff',
        padding: '0.75rem 1.25rem',
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        zIndex: 9999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        fontSize: '0.875rem',
      }}
    >
      <span>Nouvelle version disponible</span>
      <button
        onClick={() => updateServiceWorker(true)}
        style={{
          background: '#fff',
          color: '#1a1a1a',
          border: 'none',
          borderRadius: '0.25rem',
          padding: '0.375rem 0.75rem',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.875rem',
        }}
      >
        Mettre à jour
      </button>
    </div>
  )
}

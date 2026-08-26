export default function FadeTransition() {
  return (
    <div
      style={{
        height: '40vh',
        background: 'linear-gradient(to bottom, transparent, #0a0a0a)',
        position: 'relative',
        zIndex: 20,
        borderTop: '1px solid var(--border)',
      }}
    />
  )
}


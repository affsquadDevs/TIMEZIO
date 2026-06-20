// Server component: a compact grid of label/value facts (offset, abbreviation, etc.).
export type Fact = { label: string; value: string };

export function FactGrid({ items }: { items: Fact[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '10px',
        margin: '4px 0',
      }}
    >
      {items.map((f) => (
        <div
          key={f.label}
          style={{
            padding: '12px 14px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            {f.label}
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{f.value}</div>
        </div>
      ))}
    </div>
  );
}

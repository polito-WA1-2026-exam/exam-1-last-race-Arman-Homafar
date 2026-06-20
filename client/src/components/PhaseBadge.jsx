function PhaseBadge({ children, tone = 'teal' }) {
  return <span className={`phase-badge ${tone}`}>{children}</span>;
}

export default PhaseBadge;

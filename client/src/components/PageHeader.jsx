import PhaseBadge from './PhaseBadge.jsx';

function PageHeader({ badge, title, description, tone = 'teal', children }) {
  return (
    <div className="page-header">
      <div>
        {badge && <PhaseBadge tone={tone}>{badge}</PhaseBadge>}
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default PageHeader;

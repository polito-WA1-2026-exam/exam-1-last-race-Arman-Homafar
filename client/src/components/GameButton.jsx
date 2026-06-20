import { Link } from 'react-router-dom';

function classesForButton(variant, compact, className) {
  return ['button', variant, compact ? 'compact' : '', className].filter(Boolean).join(' ');
}

function GameButton({ to, variant = 'primary', compact = false, className = '', children, type = 'button', ...props }) {
  const classNames = classesForButton(variant, compact, className);

  if (to) {
    return <Link to={to} className={classNames}>{children}</Link>;
  }

  return (
    <button type={type} className={classNames} {...props}>
      {children}
    </button>
  );
}

export default GameButton;

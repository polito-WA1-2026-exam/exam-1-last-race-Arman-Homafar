import { Plus } from 'lucide-react';

function StationItem({ station, isCurrent, connectingSegment, alreadyUsed, onSelect }) {
  const isConnected = Boolean(connectingSegment);
  const disabled = isCurrent || !isConnected || alreadyUsed;

  let tag = null;
  if (isCurrent) {
    tag = <span className="segment-tag">Current</span>;
  } else if (alreadyUsed) {
    tag = <span className="segment-tag">used</span>;
  } else if (isConnected) {
    tag = <Plus size={16} aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      className={`segment-button ${isConnected && !isCurrent ? 'connects' : ''} ${alreadyUsed ? 'selected' : ''}`}
      disabled={disabled}
      onClick={() => !disabled && onSelect(connectingSegment)}
    >
      <span>{station.name}</span>
      {tag}
    </button>
  );
}

export default StationItem;

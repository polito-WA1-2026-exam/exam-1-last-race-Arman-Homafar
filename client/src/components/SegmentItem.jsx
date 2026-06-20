import { Plus } from 'lucide-react';

function SegmentItem({ segment, isSelected, currentStationId, onSelect }) {
  const disabled = isSelected;

  return (
    <button
      type="button"
      className={`segment-button connects ${isSelected ? 'selected' : ''}`}
      disabled={disabled}
      onClick={() => onSelect(segment)}
    >
      <span>{segment.stationAName} — {segment.stationBName}</span>
      {isSelected ? <span className="segment-tag">used</span> : <Plus size={16} aria-hidden="true" />}
    </button>
  );
}

export default SegmentItem;

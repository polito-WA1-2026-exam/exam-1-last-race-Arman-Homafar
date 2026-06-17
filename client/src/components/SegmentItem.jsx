import { Plus } from 'lucide-react';

function SegmentItem({ segment, isSelected, currentStationId, onSelect }) {
  const connects = segment.stationAId === currentStationId || segment.stationBId === currentStationId;
  const disabled = isSelected || !connects;

  return (
    <button
      type="button"
      className={`segment-button ${connects ? 'connects' : ''} ${isSelected ? 'selected' : ''}`}
      disabled={disabled}
      onClick={() => onSelect(segment)}
    >
      <span>{segment.stationAName} - {segment.stationBName}</span>
      {isSelected ? <span className="segment-tag">used</span> : <Plus size={16} aria-hidden="true" />}
    </button>
  );
}

export default SegmentItem;

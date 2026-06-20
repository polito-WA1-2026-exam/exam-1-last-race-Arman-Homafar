import SegmentItem from './SegmentItem.jsx';

function SegmentList({ segments, selectedSegmentIds, currentStationId, onSelect }) {
  const selected = new Set(selectedSegmentIds);

  return (
    <div className="segment-list" aria-label="All segments">
      {segments.map((segment) => (
        <SegmentItem
          key={segment.id}
          segment={segment}
          isSelected={selected.has(segment.id)}
          currentStationId={currentStationId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export default SegmentList;

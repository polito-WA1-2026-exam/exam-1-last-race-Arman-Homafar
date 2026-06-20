import StationItem from './StationItem.jsx';

function StationList({ stations, segments, selectedSegmentIds, currentStationId, onSelect }) {
  const usedSegmentIds = new Set(selectedSegmentIds);

  // Build a map: stationId → the segment that connects it to currentStation
  const connectionMap = new Map();
  for (const segment of segments) {
    if (segment.stationAId === currentStationId) {
      connectionMap.set(segment.stationBId, segment);
    } else if (segment.stationBId === currentStationId) {
      connectionMap.set(segment.stationAId, segment);
    }
  }

  return (
    <div className="segment-list" aria-label="All stations">
      {stations.map((station) => {
        const isCurrent = station.id === currentStationId;
        const connectingSegment = connectionMap.get(station.id);
        const alreadyUsed = connectingSegment ? usedSegmentIds.has(connectingSegment.id) : false;

        return (
          <StationItem
            key={station.id}
            station={station}
            isCurrent={isCurrent}
            connectingSegment={connectingSegment}
            alreadyUsed={alreadyUsed}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
}

export default StationList;

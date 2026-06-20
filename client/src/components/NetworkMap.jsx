import StationNode from './StationNode.jsx';

function lineOffset(index, total) {
  if (total <= 1) {
    return 0;
  }
  return (index - (total - 1) / 2) * 1.8;
}

function NetworkMap({ stations, segments = [], selectedSegments = [], showLines = false, startStation, destinationStation }) {
  const stationById = new Map(stations.map((station) => [station.id, station]));

  return (
    <div className={`map-frame ${showLines ? 'full-network' : 'planning-network'}`}>
      <svg viewBox="0 0 100 100" role="img" aria-label="Underground network map">
        {showLines && segments.map((segment) => {
          const a = stationById.get(segment.stationAId);
          const b = stationById.get(segment.stationBId);
          if (!a || !b) {
            return null;
          }
          const lines = segment.lines?.length ? segment.lines : [{ id: `${segment.id}-line`, color: '#9aa3af' }];
          return lines.map((line, index) => (
            <line
              key={`${segment.id}-${line.id}`}
              x1={a.x}
              y1={a.y + lineOffset(index, lines.length)}
              x2={b.x}
              y2={b.y + lineOffset(index, lines.length)}
              stroke={line.color}
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          ));
        })}
        {selectedSegments.map((segment, index) => {
          const a = stationById.get(segment.stationAId);
          const b = stationById.get(segment.stationBId);
          if (!a || !b) {
            return null;
          }
          return (
            <line
              key={`selected-${segment.id}-${index}`}
              className="selected-route-line"
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              style={{ animationDelay: `${index * 60}ms` }}
            />
          );
        })}
        {stations.map((station) => (
          <StationNode key={station.id} station={station} startStation={startStation} destinationStation={destinationStation} />
        ))}
      </svg>
    </div>
  );
}

export default NetworkMap;

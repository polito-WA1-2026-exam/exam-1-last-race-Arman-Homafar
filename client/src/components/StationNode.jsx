function stationClass(station, startStation, destinationStation) {
  if (station.id === startStation?.id) {
    return 'station-node start';
  }
  if (station.id === destinationStation?.id) {
    return 'station-node destination';
  }
  if ((station.lines?.length ?? 0) > 1) {
    return 'station-node interchange';
  }
  return 'station-node';
}

function labelLines(name) {
  const words = name.split(' ');
  if (words.length === 1) {
    return words;
  }
  const splitAt = Math.ceil(words.length / 2);
  return [words.slice(0, splitAt).join(' '), words.slice(splitAt).join(' ')];
}

function StationNode({ station, startStation, destinationStation }) {
  const isStart = station.id === startStation?.id;
  const isDestination = station.id === destinationStation?.id;

  return (
    <g className="station-group">
      {(isStart || isDestination) && (
        <circle className={`station-halo ${isStart ? 'start' : 'destination'}`} cx={station.x} cy={station.y} r="4.7" />
      )}
      <circle className={stationClass(station, startStation, destinationStation)} cx={station.x} cy={station.y} r="2.2" />
      <text x={station.x} y={station.y - 5.3}>
        {labelLines(station.name).map((line, index) => (
          <tspan key={`${line}-${index}`} x={station.x} dy={index === 0 ? 0 : 2.15}>{line}</tspan>
        ))}
      </text>
    </g>
  );
}

export default StationNode;

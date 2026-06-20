function SelectedRouteItem({ segment, index }) {
  return (
    <li className="route-step-item">
      <span className="route-step-number">{index + 1}</span>
      <span>{segment.stationAName} - {segment.stationBName}</span>
    </li>
  );
}

export default SelectedRouteItem;

import { Undo2 } from 'lucide-react';
import SelectedRouteItem from './SelectedRouteItem.jsx';

function SelectedRoute({ routeStations, selectedSegments, onRemoveLast }) {
  return (
    <section className="route-panel" aria-label="Selected route">
      <div className="section-heading-row">
        <h2>Selected route</h2>
        <button type="button" className="button ghost compact" disabled={selectedSegments.length === 0} onClick={onRemoveLast}>
          <Undo2 size={17} aria-hidden="true" />
          Remove last
        </button>
      </div>
      {selectedSegments.length === 0 ? (
        <p className="muted">Select a segment connected to the current station.</p>
      ) : (
        <>
          <ol className="route-steps">
            {selectedSegments.map((segment, index) => (
              <SelectedRouteItem key={`${segment.id}-${index}`} segment={segment} index={index} />
            ))}
          </ol>
          <p className="station-path">{routeStations.map((station) => station.name).join(' -> ')}</p>
        </>
      )}
    </section>
  );
}

export default SelectedRoute;

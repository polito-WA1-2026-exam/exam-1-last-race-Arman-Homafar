import { ArrowRight, Send } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getGame, submitGame } from '../api.js';
import NetworkMap from '../components/NetworkMap.jsx';
import PhaseBadge from '../components/PhaseBadge.jsx';
import SegmentList from '../components/SegmentList.jsx';
import SelectedRoute from '../components/SelectedRoute.jsx';
import TimerBox from '../components/TimerBox.jsx';

const PLANNING_SECONDS = 90;

function PlanningPage() {
  const { gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialGame = location.state?.game ?? null;
  const submittedRef = useRef(false);
  const [game, setGame] = useState(initialGame);
  const [seconds, setSeconds] = useState(PLANNING_SECONDS);
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [routeStations, setRouteStations] = useState(() => (initialGame ? [initialGame.startStation] : []));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (game) {
      return undefined;
    }

    let active = true;

    async function loadGame() {
      try {
        const data = await getGame(gameId);
        if (active) {
          setGame(data);
          setRouteStations([data.startStation]);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      }
    }

    loadGame();

    return () => {
      active = false;
    };
  }, [game, gameId]);

  const currentStation = routeStations[routeStations.length - 1] ?? game?.startStation;
  const stationById = useMemo(() => new Map((game?.stations ?? []).map((station) => [station.id, station])), [game]);

  const handleSelectSegment = (segment) => {
    if (!currentStation) {
      return;
    }
    const nextStationId = segment.stationAId === currentStation.id ? segment.stationBId : segment.stationAId;
    const nextStation = stationById.get(nextStationId);
    setSelectedSegments((segments) => [...segments, segment]);
    setRouteStations((stations) => [...stations, { id: nextStationId, name: nextStation?.name ?? 'Unknown station' }]);
  };

  const handleRemoveLast = () => {
    setSelectedSegments((segments) => segments.slice(0, -1));
    setRouteStations((stations) => stations.slice(0, -1));
  };

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current || submitting || !game) {
      return;
    }
    submittedRef.current = true;
    setSubmitting(true);
    setError('');
    try {
      const result = await submitGame(game.id, selectedSegments.map((segment) => segment.id));
      navigate(`/game/${game.id}/execution`, { replace: true, state: { result } });
    } catch (requestError) {
      submittedRef.current = false;
      setError(requestError.message);
      setSubmitting(false);
    }
  }, [game, navigate, selectedSegments, submitting]);

  useEffect(() => {
    if (!game || submittedRef.current) {
      return undefined;
    }
    const timerId = window.setInterval(() => {
      setSeconds((value) => Math.max(value - 1, 0));
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [game]);

  useEffect(() => {
    if (seconds === 0) {
      const submitId = window.setTimeout(() => handleSubmit(), 0);
      return () => window.clearTimeout(submitId);
    }
    return undefined;
  }, [seconds, handleSubmit]);

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!game) {
    return <p className="status-message">Preparing your game...</p>;
  }

  return (
    <section className="planning-layout">
      <div className="planning-main">
        <div className="section-heading-row mission-card">
          <div>
            <PhaseBadge tone="coral">Planning phase</PhaseBadge>
            <h1>Build your route</h1>
            <p className="mission-route">
              <span>{game.startStation.name}</span>
              <ArrowRight size={20} aria-hidden="true" />
              <span>{game.destinationStation.name}</span>
            </p>
            <p className="muted">Choose connected segments in order. The server will validate the final route.</p>
          </div>
          <TimerBox seconds={seconds} />
        </div>
        <NetworkMap
          stations={game.stations}
          selectedSegments={selectedSegments}
          showLines={false}
          startStation={game.startStation}
          destinationStation={game.destinationStation}
        />
        <SelectedRoute
          routeStations={routeStations}
          selectedSegments={selectedSegments}
          onRemoveLast={handleRemoveLast}
        />
      </div>
      <aside className="planning-side">
        <div className="section-heading-row">
          <div>
            <h2>All segments</h2>
            <p className="muted small-text">Select any segment to build your route.</p>
          </div>
          <button type="button" className="button primary compact" onClick={handleSubmit} disabled={submitting}>
            <Send size={17} aria-hidden="true" />
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
        <SegmentList
          segments={game.segments}
          selectedSegmentIds={selectedSegments.map((segment) => segment.id)}
          currentStationId={currentStation?.id}
          onSelect={handleSelectSegment}
        />
      </aside>
    </section>
  );
}

export default PlanningPage;

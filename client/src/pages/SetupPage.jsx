import { Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGame, getFullNetwork } from '../api.js';
import GameButton from '../components/GameButton.jsx';
import NetworkMap from '../components/NetworkMap.jsx';
import PageHeader from '../components/PageHeader.jsx';

function SetupPage() {
  const navigate = useNavigate();
  const [network, setNetwork] = useState(null);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadNetwork() {
      try {
        const data = await getFullNetwork();
        if (active) {
          setNetwork(data);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      }
    }

    loadNetwork();

    return () => {
      active = false;
    };
  }, []);

  const handleStart = async () => {
    setStarting(true);
    setError('');
    try {
      const game = await createGame();
      navigate(`/game/${game.id}/planning`, { state: { game } });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setStarting(false);
    }
  };

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!network) {
    return <p className="status-message">Loading the network...</p>;
  }

  return (
    <section className="page-stack">
      <PageHeader
        badge="Setup phase"
        title="Study the full network"
        description="All lines, stations, and connections are visible before the timer starts."
        tone="gold"
      >
        <GameButton onClick={handleStart} disabled={starting}>
          <Play size={18} aria-hidden="true" />
          {starting ? 'Starting...' : 'Start planning'}
        </GameButton>
      </PageHeader>
      <NetworkMap stations={network.stations} segments={network.segments} showLines />
      <section className="legend-band">
        <strong>Lines</strong>
        {network.lines.map((line) => (
          <span key={line.id} className="legend-item">
            <span className="legend-swatch" style={{ backgroundColor: line.color }} />
            {line.name}
          </span>
        ))}
      </section>
    </section>
  );
}

export default SetupPage;

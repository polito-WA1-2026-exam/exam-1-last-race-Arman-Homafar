import { ArrowRight, Coins, LogIn, Map, TimerReset, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getInstructions } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import GameButton from '../components/GameButton.jsx';
import PhaseBadge from '../components/PhaseBadge.jsx';

function InstructionsPage() {
  const { user } = useAuth();
  const [instructions, setInstructions] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadInstructions() {
      try {
        const data = await getInstructions();
        if (active) {
          setInstructions(data);
        }
      } catch {
        if (active) {
          setInstructions({
            title: 'Last Race',
            text: 'Plan a route across a fictional underground network before time runs out.',
          });
        }
      }
    }

    loadInstructions();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="content-grid">
      <div className="intro-panel">
        <PhaseBadge tone="gold">Web Applications I exam project</PhaseBadge>
        <h1>{instructions?.title ?? 'Last Race'}</h1>
        <p className="lead">
          {instructions?.text ?? 'Loading instructions...'}
        </p>
        <div className="fact-grid">
          <span><TimerReset size={18} aria-hidden="true" /> 90-second sprint</span>
          <span><Coins size={18} aria-hidden="true" /> 20 starting coins</span>
          <span><Map size={18} aria-hidden="true" /> 4 metro lines</span>
        </div>
        <div className="action-row">
          {user ? (
            <GameButton to="/setup">
              <Map size={18} aria-hidden="true" />
              Open setup map
            </GameButton>
          ) : (
            <GameButton to="/login">
              <LogIn size={18} aria-hidden="true" />
              Login to play
            </GameButton>
          )}
          <GameButton to={user ? '/ranking' : '/login'} variant="ghost">
            <Trophy size={18} aria-hidden="true" />
            Ranking
          </GameButton>
        </div>
      </div>
      <div className="rules-panel">
        <PhaseBadge tone="teal">Race manual</PhaseBadge>
        <h2>Game flow</h2>
        <ul className="icon-list">
          <li>
            <Map size={20} aria-hidden="true" />
            Study the complete network in setup.
          </li>
          <li>
            <TimerReset size={20} aria-hidden="true" />
            Build an ordered route in 90 seconds.
          </li>
          <li>
            <ArrowRight size={20} aria-hidden="true" />
            Execute valid routes one segment at a time.
          </li>
          <li>
            <Trophy size={20} aria-hidden="true" />
            Keep the best final score in the ranking.
          </li>
        </ul>
        {!user && (
          <p className="notice">
            Anonymous visitors can read instructions only. Login is required for the network, games, and ranking.
          </p>
        )}
      </div>
    </section>
  );
}

export default InstructionsPage;

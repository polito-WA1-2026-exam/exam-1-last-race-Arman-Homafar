import { RotateCcw, Trophy } from 'lucide-react';
import GameButton from './GameButton.jsx';
import PhaseBadge from './PhaseBadge.jsx';

function ResultCard({ result }) {
  return (
    <div className={`result-header ${result.validRoute ? 'success' : 'failure'}`}>
      <PhaseBadge tone={result.validRoute ? 'gold' : 'coral'}>Execution and result</PhaseBadge>
      <h1>{result.validRoute ? 'Route completed' : 'Route rejected'}</h1>
      <p className="lead">{result.validationMessage}</p>
      <div className="result-stats">
        <div className="score-medallion">
          <Trophy size={24} aria-hidden="true" />
          <span>Final score</span>
          <strong>{result.finalScore ?? 0}</strong>
        </div>
        <div className="score-strip secondary">
          Route: <strong>{result.validRoute ? 'valid' : 'invalid'}</strong>
        </div>
      </div>
      <div className="action-row">
        <GameButton to="/setup">
          <RotateCcw size={18} aria-hidden="true" />
          New game
        </GameButton>
        <GameButton to="/ranking" variant="ghost">
          <Trophy size={18} aria-hidden="true" />
          Ranking
        </GameButton>
      </div>
    </div>
  );
}

export default ResultCard;

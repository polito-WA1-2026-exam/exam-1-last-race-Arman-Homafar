import { Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getGame } from '../api.js';
import ResultCard from '../components/ResultCard.jsx';
import StepViewer from '../components/StepViewer.jsx';

function ExecutionPage() {
  const { gameId } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result ?? null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (result) {
      return undefined;
    }
    let active = true;

    async function loadResult() {
      try {
        const data = await getGame(gameId);
        if (active) {
          setResult(data);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      }
    }

    loadResult();

    return () => {
      active = false;
    };
  }, [gameId, result]);

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!result) {
    return <p className="status-message">Loading result...</p>;
  }

  return (
    <section className="page-stack">
      <ResultCard result={result} />
      {result.validRoute && result.steps.length > 0 ? (
        <StepViewer steps={result.steps} />
      ) : (
        <section className="empty-result">
          <Play size={24} aria-hidden="true" />
          Execution skipped. The 20 starting coins were lost and the score is zero.
        </section>
      )}
    </section>
  );
}

export default ExecutionPage;

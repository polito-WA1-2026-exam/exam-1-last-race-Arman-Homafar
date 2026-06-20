import { useEffect, useState } from 'react';
import { getRanking } from '../api.js';
import PageHeader from '../components/PageHeader.jsx';
import RankingTable from '../components/RankingTable.jsx';

function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadRanking() {
      try {
        const data = await getRanking();
        if (active) {
          setRanking(data);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRanking();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p className="status-message">Loading ranking...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <section className="page-stack">
      <PageHeader
        badge="General ranking"
        title="Best scores"
        description="Each player is ranked by the best score from their completed games."
        tone="gold"
      />
      <RankingTable ranking={ranking} />
    </section>
  );
}

export default RankingPage;

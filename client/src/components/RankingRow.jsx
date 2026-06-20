import { Medal } from 'lucide-react';

function RankingRow({ row, position }) {
  const rankClass = position <= 3 ? `top-rank rank-${position}` : '';

  return (
    <tr className={rankClass} style={{ animationDelay: `${position * 55}ms` }}>
      <td>
        <span className="rank-badge">
          <Medal size={17} aria-hidden="true" />
          {position}
        </span>
      </td>
      <td>{row.username}</td>
      <td>{row.bestScore}</td>
      <td>{row.playedGames}</td>
    </tr>
  );
}

export default RankingRow;

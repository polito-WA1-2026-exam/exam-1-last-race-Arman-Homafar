import RankingRow from './RankingRow.jsx';

function RankingTable({ ranking }) {
  return (
    <table className="ranking-table">
      <thead>
        <tr>
          <th>Position</th>
          <th>User</th>
          <th>Best score</th>
          <th>Completed games</th>
        </tr>
      </thead>
      <tbody>
        {ranking.map((row, index) => (
          <RankingRow key={row.userId} row={row} position={index + 1} />
        ))}
      </tbody>
    </table>
  );
}

export default RankingTable;

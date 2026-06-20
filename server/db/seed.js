import { getDb } from './connection.js';
import { hashPassword } from './passwords.js';
import { createSchema } from './schema.js';

export async function initDatabase() {
  const db = await getDb();
  await createSchema(db);

  const { n } = await db.get('SELECT COUNT(*) AS n FROM users');
  if (n > 0) return;

  await seedUsers(db);
  await seedNetwork(db);
  await seedEvents(db);
  await seedCompletedGames(db);
}

async function seedUsers(db) {
  const users = [
    { username: 'arman', password: 'last-race' },
    { username: 'ada',   password: 'metro2026' },
    { username: 'marco', password: 'rails2026' },
  ];
  for (const u of users) {
    const { hash, salt } = hashPassword(u.password);
    await db.run(
      'INSERT INTO users (username, hash, salt) VALUES (?, ?, ?)',
      u.username, hash, salt,
    );
  }
}

/*
  Network layout — 15 stations, 4 lines:

  Red  line (top horizontal):
    Centrale Aurora ─ Porta Velaria ─ Crocevia del Falco ─ Piazza Lanterne ─ Officine Nord ─ Deposito Est

  Blue line (diagonal, top-left → right):
    Centrale Aurora ─ Fontana Oscura ─ Borgo Sereno ─ Archivio Ovest ─ Viale Mosaici ─ Porto Alto

  Green line (diagonal, top → bottom-left):
    Porta Velaria ─ Fontana Oscura ─ Torre Cinerea ─ Campo Eco ─ Giardini Sud

  Gold line (diagonal, top-center → bottom-right):
    Piazza Lanterne ─ Torre Cinerea ─ Campo Eco ─ Viale Mosaici ─ Belvedere

  Shared segment (Green + Gold): Torre Cinerea ─ Campo Eco

  Interchange stations:
    Centrale Aurora  → Red  + Blue
    Porta Velaria    → Red  + Green
    Piazza Lanterne  → Red  + Gold
    Fontana Oscura   → Blue + Green
    Torre Cinerea    → Green + Gold
    Campo Eco        → Green + Gold
    Viale Mosaici    → Blue + Gold
*/
async function seedNetwork(db) {
  // Lines — id: Red=1, Blue=2, Green=3, Gold=4
  await db.run("INSERT INTO lines (name, color) VALUES ('Red',   '#c0392b')");
  await db.run("INSERT INTO lines (name, color) VALUES ('Blue',  '#2980b9')");
  await db.run("INSERT INTO lines (name, color) VALUES ('Green', '#27ae60')");
  await db.run("INSERT INTO lines (name, color) VALUES ('Gold',  '#c9a227')");

  // Stations — coordinates fit SVG viewBox "0 0 100 100"
  const stations = [
    { name: 'Centrale Aurora',    x:  7, y: 15 }, // id=1   Red, Blue
    { name: 'Porta Velaria',      x: 22, y: 15 }, // id=2   Red, Green
    { name: 'Crocevia del Falco', x: 41, y: 15 }, // id=3   Red
    { name: 'Piazza Lanterne',    x: 57, y: 15 }, // id=4   Red, Gold
    { name: 'Officine Nord',      x: 74, y: 15 }, // id=5   Red
    { name: 'Deposito Est',       x: 90, y: 15 }, // id=6   Red
    { name: 'Fontana Oscura',     x: 22, y: 33 }, // id=7   Blue, Green
    { name: 'Borgo Sereno',       x: 35, y: 46 }, // id=8   Blue
    { name: 'Archivio Ovest',     x: 50, y: 52 }, // id=9   Blue
    { name: 'Viale Mosaici',      x: 70, y: 55 }, // id=10  Blue, Gold
    { name: 'Porto Alto',         x: 86, y: 54 }, // id=11  Blue
    { name: 'Torre Cinerea',      x: 34, y: 65 }, // id=12  Green, Gold
    { name: 'Campo Eco',          x: 52, y: 74 }, // id=13  Green, Gold
    { name: 'Giardini Sud',       x: 34, y: 86 }, // id=14  Green
    { name: 'Belvedere',          x: 73, y: 84 }, // id=15  Gold
  ];
  for (const s of stations) {
    await db.run('INSERT INTO stations (name, x, y) VALUES (?, ?, ?)', s.name, s.x, s.y);
  }

  // line_stations: (line_id, station_id)
  const lineStations = [
    // Red (1): 1,2,3,4,5,6
    [1,1],[1,2],[1,3],[1,4],[1,5],[1,6],
    // Blue (2): 1,7,8,9,10,11
    [2,1],[2,7],[2,8],[2,9],[2,10],[2,11],
    // Green (3): 2,7,12,13,14
    [3,2],[3,7],[3,12],[3,13],[3,14],
    // Gold (4): 4,12,13,10,15
    [4,4],[4,12],[4,13],[4,10],[4,15],
  ];
  for (const [lineId, stationId] of lineStations) {
    await db.run('INSERT INTO line_stations (line_id, station_id) VALUES (?, ?)', lineId, stationId);
  }

  // Segments: (station_a_id, station_b_id)
  const segments = [
    [1,  2],  // id=1   Centrale Aurora – Porta Velaria        Red
    [2,  3],  // id=2   Porta Velaria – Crocevia del Falco     Red
    [3,  4],  // id=3   Crocevia del Falco – Piazza Lanterne   Red
    [4,  5],  // id=4   Piazza Lanterne – Officine Nord        Red
    [5,  6],  // id=5   Officine Nord – Deposito Est           Red
    [1,  7],  // id=6   Centrale Aurora – Fontana Oscura       Blue
    [2,  7],  // id=7   Porta Velaria – Fontana Oscura         Green
    [7,  8],  // id=8   Fontana Oscura – Borgo Sereno          Blue
    [8,  9],  // id=9   Borgo Sereno – Archivio Ovest          Blue
    [9, 10],  // id=10  Archivio Ovest – Viale Mosaici         Blue
    [10,11],  // id=11  Viale Mosaici – Porto Alto             Blue
    [4, 12],  // id=12  Piazza Lanterne – Torre Cinerea        Gold
    [7, 12],  // id=13  Fontana Oscura – Torre Cinerea         Green
    [12,13],  // id=14  Torre Cinerea – Campo Eco              Green + Gold
    [13,10],  // id=15  Campo Eco – Viale Mosaici              Gold
    [10,15],  // id=16  Viale Mosaici – Belvedere              Gold
    [13,14],  // id=17  Campo Eco – Giardini Sud               Green
  ];
  for (const [a, b] of segments) {
    await db.run('INSERT INTO segments (station_a_id, station_b_id) VALUES (?, ?)', a, b);
  }

  // segment_lines: (segment_id, line_id)
  const segmentLines = [
    [1,  1],        // Centrale Aurora – Porta Velaria:        Red
    [2,  1],        // Porta Velaria – Crocevia del Falco:     Red
    [3,  1],        // Crocevia del Falco – Piazza Lanterne:   Red
    [4,  1],        // Piazza Lanterne – Officine Nord:        Red
    [5,  1],        // Officine Nord – Deposito Est:           Red
    [6,  2],        // Centrale Aurora – Fontana Oscura:       Blue
    [7,  3],        // Porta Velaria – Fontana Oscura:         Green
    [8,  2],        // Fontana Oscura – Borgo Sereno:          Blue
    [9,  2],        // Borgo Sereno – Archivio Ovest:          Blue
    [10, 2],        // Archivio Ovest – Viale Mosaici:         Blue
    [11, 2],        // Viale Mosaici – Porto Alto:             Blue
    [12, 4],        // Piazza Lanterne – Torre Cinerea:        Gold
    [13, 3],        // Fontana Oscura – Torre Cinerea:         Green
    [14, 3],[14,4], // Torre Cinerea – Campo Eco:              Green + Gold
    [15, 4],        // Campo Eco – Viale Mosaici:              Gold
    [16, 4],        // Viale Mosaici – Belvedere:              Gold
    [17, 3],        // Campo Eco – Giardini Sud:               Green
  ];
  for (const [segId, lineId] of segmentLines) {
    await db.run('INSERT INTO segment_lines (segment_id, line_id) VALUES (?, ?)', segId, lineId);
  }
}

async function seedEvents(db) {
  const events = [
    { description: 'Smooth ride, no delays.',          effect:  0 },
    { description: 'Signal fault ahead, minor delay.', effect: -2 },
    { description: 'Express service upgrade!',         effect: +3 },
    { description: 'Platform congestion.',             effect: -1 },
    { description: 'Lucky draw winner!',               effect: +5 },
    { description: 'Ticket inspection fine.',          effect: -3 },
  ];
  for (const e of events) {
    await db.run('INSERT INTO events (description, effect) VALUES (?, ?)', e.description, e.effect);
  }
}

/*
  Seeded completed games:
    ada   completed Centrale Aurora(1) → Viale Mosaici(10) via Blue line (4 segments)
          steps: s6(B), s8(B), s9(B), s10(B)
          events: +3, -1, 0, +5  →  20+3-1+0+5 = 27
    marco completed Porta Velaria(2) → Campo Eco(13) via Green line (3 segments)
          steps: s7(G), s13(G), s14(G)
          events: -2, +3, 0  →  20-2+3+0 = 21
*/
async function seedCompletedGames(db) {
  const INITIAL_COINS = 20;

  // ada game: user_id=2, start=1 (Centrale Aurora), dest=10 (Viale Mosaici)
  const adaGame = await db.run(
    `INSERT INTO games (user_id, start_station_id, destination_station_id, initial_coins,
                        final_score, valid_route, validation_message)
     VALUES (2, 1, 10, ?, 27, 1, 'Route accepted.')`,
    INITIAL_COINS,
  );
  const adaSteps = [
    { stepIndex: 1, from: 1,  to: 7,  seg: 6,  line: 2, event: 3, before: 20, after: 23 }, // +3
    { stepIndex: 2, from: 7,  to: 8,  seg: 8,  line: 2, event: 4, before: 23, after: 22 }, // -1
    { stepIndex: 3, from: 8,  to: 9,  seg: 9,  line: 2, event: 1, before: 22, after: 22 }, //  0
    { stepIndex: 4, from: 9,  to: 10, seg: 10, line: 2, event: 5, before: 22, after: 27 }, // +5
  ];
  for (const s of adaSteps) {
    await db.run(
      `INSERT INTO game_steps
         (game_id, step_index, from_station_id, to_station_id, line_id, event_id, coin_before, coin_after)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      adaGame.lastID, s.stepIndex, s.from, s.to, s.line, s.event, s.before, s.after,
    );
  }

  // marco game: user_id=3, start=2 (Porta Velaria), dest=13 (Campo Eco)
  const marcoGame = await db.run(
    `INSERT INTO games (user_id, start_station_id, destination_station_id, initial_coins,
                        final_score, valid_route, validation_message)
     VALUES (3, 2, 13, ?, 21, 1, 'Route accepted.')`,
    INITIAL_COINS,
  );
  const marcoSteps = [
    { stepIndex: 1, from: 2,  to: 7,  line: 3, event: 2, before: 20, after: 18 }, // -2
    { stepIndex: 2, from: 7,  to: 12, line: 3, event: 3, before: 18, after: 21 }, // +3
    { stepIndex: 3, from: 12, to: 13, line: 3, event: 1, before: 21, after: 21 }, //  0
  ];
  for (const s of marcoSteps) {
    await db.run(
      `INSERT INTO game_steps
         (game_id, step_index, from_station_id, to_station_id, line_id, event_id, coin_before, coin_after)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      marcoGame.lastID, s.stepIndex, s.from, s.to, s.line, s.event, s.before, s.after,
    );
  }
}

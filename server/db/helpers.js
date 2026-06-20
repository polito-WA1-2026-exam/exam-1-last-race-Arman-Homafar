import { getDb } from './connection.js';

const INITIAL_COINS = 20;

export async function getUserByUsername(username) {
  const db = await getDb();
  return db.get('SELECT id, username, hash, salt FROM users WHERE username = ?', username);
}

export async function getUserById(id) {
  const db = await getDb();
  return db.get('SELECT id, username FROM users WHERE id = ?', id);
}

async function getStationLines(db) {
  const rows = await db.all(`
    SELECT ls.station_id, l.id, l.name, l.color
    FROM line_stations ls
    JOIN lines l ON l.id = ls.line_id
    ORDER BY l.name
  `);
  const byStation = new Map();
  for (const row of rows) {
    const lines = byStation.get(row.station_id) ?? [];
    lines.push({ id: row.id, name: row.name, color: row.color });
    byStation.set(row.station_id, lines);
  }
  return byStation;
}

async function getSegmentLines(db) {
  const rows = await db.all(`
    SELECT sl.segment_id, l.id, l.name, l.color
    FROM segment_lines sl
    JOIN lines l ON l.id = sl.line_id
    ORDER BY l.name
  `);
  const bySegment = new Map();
  for (const row of rows) {
    const lines = bySegment.get(row.segment_id) ?? [];
    lines.push({ id: row.id, name: row.name, color: row.color });
    bySegment.set(row.segment_id, lines);
  }
  return bySegment;
}

export async function getFullNetwork() {
  const db = await getDb();
  const stationLines = await getStationLines(db);
  const segmentLines = await getSegmentLines(db);
  const stations = await db.all('SELECT id, name, x, y FROM stations ORDER BY name');
  const lines = await db.all('SELECT id, name, color FROM lines ORDER BY name');
  const segments = await db.all(`
    SELECT seg.id, seg.station_a_id AS stationAId, seg.station_b_id AS stationBId,
           a.name AS stationAName, b.name AS stationBName
    FROM segments seg
    JOIN stations a ON a.id = seg.station_a_id
    JOIN stations b ON b.id = seg.station_b_id
    ORDER BY a.name, b.name
  `);

  return {
    stations: stations.map((station) => ({
      ...station,
      lines: stationLines.get(station.id) ?? [],
    })),
    lines,
    segments: segments.map((segment) => ({
      ...segment,
      lines: segmentLines.get(segment.id) ?? [],
    })),
  };
}

export async function getPlanningNetwork() {
  const db = await getDb();
  const stations = await db.all('SELECT id, name, x, y FROM stations ORDER BY name');
  const segments = await db.all(`
    SELECT seg.id, seg.station_a_id AS stationAId, seg.station_b_id AS stationBId,
           a.name AS stationAName, b.name AS stationBName
    FROM segments seg
    JOIN stations a ON a.id = seg.station_a_id
    JOIN stations b ON b.id = seg.station_b_id
    ORDER BY a.name, b.name
  `);

  return { stations, segments };
}

function shortestDistances(stations, segments, startId) {
  const adjacency = new Map(stations.map((station) => [station.id, []]));
  for (const segment of segments) {
    adjacency.get(segment.station_a_id).push(segment.station_b_id);
    adjacency.get(segment.station_b_id).push(segment.station_a_id);
  }

  const distances = new Map([[startId, 0]]);
  const queue = [startId];
  for (let i = 0; i < queue.length; i += 1) {
    const current = queue[i];
    for (const next of adjacency.get(current)) {
      if (!distances.has(next)) {
        distances.set(next, distances.get(current) + 1);
        queue.push(next);
      }
    }
  }
  return distances;
}

export async function createGame(userId) {
  const db = await getDb();
  const stations = await db.all('SELECT id FROM stations');
  const segments = await db.all('SELECT station_a_id, station_b_id FROM segments');
  const candidates = [];

  for (const start of stations) {
    const distances = shortestDistances(stations, segments, start.id);
    for (const destination of stations) {
      const distance = distances.get(destination.id);
      if (destination.id !== start.id && distance >= 3) {
        candidates.push({ startStationId: start.id, destinationStationId: destination.id });
      }
    }
  }

  const selected = candidates[Math.floor(Math.random() * candidates.length)];
  const result = await db.run(
    `INSERT INTO games (user_id, start_station_id, destination_station_id, initial_coins)
     VALUES (?, ?, ?, ?)`,
    userId,
    selected.startStationId,
    selected.destinationStationId,
    INITIAL_COINS,
  );

  return getGameForUser(userId, result.lastID);
}

async function getValidationData(db) {
  const segments = await db.all('SELECT id, station_a_id, station_b_id FROM segments');
  const segmentLinesRows = await db.all('SELECT segment_id, line_id FROM segment_lines');
  const stationLinesRows = await db.all('SELECT station_id, line_id FROM line_stations');

  const segmentById = new Map(segments.map((segment) => [segment.id, segment]));
  const segmentLines = new Map();
  for (const row of segmentLinesRows) {
    const lines = segmentLines.get(row.segment_id) ?? [];
    lines.push(row.line_id);
    segmentLines.set(row.segment_id, lines);
  }

  const stationLines = new Map();
  for (const row of stationLinesRows) {
    const lines = stationLines.get(row.station_id) ?? new Set();
    lines.add(row.line_id);
    stationLines.set(row.station_id, lines);
  }

  return { segmentById, segmentLines, stationLines };
}

function canChangeLine(stationId, fromLineId, toLineId, stationLines) {
  const servedLines = stationLines.get(stationId) ?? new Set();
  return servedLines.has(fromLineId) && servedLines.has(toLineId) && servedLines.size > 1;
}

function findLineChoices(steps, segmentLines, stationLines, index = 0, previousLineId = null) {
  if (index === steps.length) {
    return [];
  }

  const step = steps[index];
  const possibleLines = segmentLines.get(step.segmentId) ?? [];

  for (const lineId of possibleLines) {
    const sameLine = previousLineId === null || previousLineId === lineId;
    const legalChange = previousLineId !== null && canChangeLine(step.fromStationId, previousLineId, lineId, stationLines);

    if (sameLine || legalChange) {
      const nextLines = findLineChoices(steps, segmentLines, stationLines, index + 1, lineId);
      if (nextLines) {
        return [lineId, ...nextLines];
      }
    }
  }

  return null;
}

async function validateRoute(db, game, segmentIds) {
  // 1. The route must contain only valid, positive segment ids.
  if (!Array.isArray(segmentIds) || segmentIds.length === 0) {
    return { valid: false, message: 'The submitted route is empty.' };
  }
  if (!segmentIds.every((id) => Number.isInteger(id) && id > 0)) {
    return { valid: false, message: 'The route contains invalid segment identifiers.' };
  }
  if (new Set(segmentIds).size !== segmentIds.length) {
    return { valid: false, message: 'The same segment was selected more than once.' };
  }

  const { segmentById, segmentLines, stationLines } = await getValidationData(db);

  // 2. Starting from the assigned station, every segment must connect to the next one.
  let currentStationId = game.start_station_id;
  const orientedSteps = [];

  for (const segmentId of segmentIds) {
    const segment = segmentById.get(segmentId);
    if (!segment) {
      return { valid: false, message: 'At least one selected segment does not exist.' };
    }

    let nextStationId;
    if (segment.station_a_id === currentStationId) {
      nextStationId = segment.station_b_id;
    } else if (segment.station_b_id === currentStationId) {
      nextStationId = segment.station_a_id;
    } else {
      return { valid: false, message: 'The selected segments are not connected in sequence.' };
    }

    orientedSteps.push({
      segmentId,
      fromStationId: currentStationId,
      toStationId: nextStationId,
    });
    currentStationId = nextStationId;
  }

  // 3. The reconstructed path must finish at the assigned destination.
  if (currentStationId !== game.destination_station_id) {
    return { valid: false, message: 'The route does not reach the assigned destination.' };
  }

  // 4. Try to assign one metro line to each segment. A line change is legal only at an interchange.
  const chosenLineIds = findLineChoices(orientedSteps, segmentLines, stationLines);
  if (!chosenLineIds) {
    return { valid: false, message: 'A line change happens outside an interchange station.' };
  }

  return {
    valid: true,
    message: 'Route accepted.',
    steps: orientedSteps.map((step, index) => ({
      ...step,
      lineId: chosenLineIds[index],
    })),
  };
}

function randomEvent(events) {
  return events[Math.floor(Math.random() * events.length)];
}

export async function submitGame(userId, gameId, segmentIds) {
  const db = await getDb();
  const game = await db.get('SELECT * FROM games WHERE id = ? AND user_id = ?', gameId, userId);
  if (!game) {
    const error = new Error('Game not found.');
    error.status = 404;
    throw error;
  }
  if (game.final_score !== null) {
    return getGameForUser(userId, gameId);
  }

  const validation = await validateRoute(db, game, segmentIds);

  await db.exec('BEGIN');
  try {
    if (!validation.valid) {
      await db.run(
        'UPDATE games SET final_score = 0, valid_route = 0, validation_message = ? WHERE id = ?',
        validation.message,
        gameId,
      );
      await db.exec('COMMIT');
      return getGameForUser(userId, gameId);
    }

    const events = await db.all('SELECT id, description, effect FROM events');
    let coins = INITIAL_COINS;

    for (const [index, step] of validation.steps.entries()) {
      const event = randomEvent(events);
      const before = coins;
      coins += event.effect;
      await db.run(
        `INSERT INTO game_steps (game_id, step_index, from_station_id, to_station_id, line_id, event_id, coin_before, coin_after)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        gameId,
        index + 1,
        step.fromStationId,
        step.toStationId,
        step.lineId,
        event.id,
        before,
        coins,
      );
    }

    await db.run(
      'UPDATE games SET final_score = ?, valid_route = 1, validation_message = ? WHERE id = ?',
      Math.max(coins, 0),
      validation.message,
      gameId,
    );
    await db.exec('COMMIT');
  } catch (error) {
    await db.exec('ROLLBACK');
    throw error;
  }

  return getGameForUser(userId, gameId);
}

export async function getGameForUser(userId, gameId) {
  const db = await getDb();
  const game = await db.get(`
    SELECT g.id, g.initial_coins AS initialCoins, g.final_score AS finalScore,
           g.valid_route AS validRoute, g.validation_message AS validationMessage,
           g.created_at AS createdAt,
           start.id AS startStationId, start.name AS startStationName,
           dest.id AS destinationStationId, dest.name AS destinationStationName
    FROM games g
    JOIN stations start ON start.id = g.start_station_id
    JOIN stations dest ON dest.id = g.destination_station_id
    WHERE g.id = ? AND g.user_id = ?
  `, gameId, userId);

  if (!game) {
    return null;
  }

  const steps = await db.all(`
    SELECT gs.step_index AS stepIndex,
           from_station.id AS fromStationId, from_station.name AS fromStationName,
           to_station.id AS toStationId, to_station.name AS toStationName,
           l.id AS lineId, l.name AS lineName, l.color AS lineColor,
           e.id AS eventId, e.description AS eventDescription, e.effect AS eventEffect,
           gs.coin_before AS coinBefore, gs.coin_after AS coinAfter
    FROM game_steps gs
    JOIN stations from_station ON from_station.id = gs.from_station_id
    JOIN stations to_station ON to_station.id = gs.to_station_id
    JOIN lines l ON l.id = gs.line_id
    JOIN events e ON e.id = gs.event_id
    WHERE gs.game_id = ?
    ORDER BY gs.step_index
  `, gameId);

  const network = game.finalScore === null ? await getPlanningNetwork() : undefined;

  return {
    ...game,
    validRoute: game.validRoute === null ? null : Boolean(game.validRoute),
    startStation: { id: game.startStationId, name: game.startStationName },
    destinationStation: { id: game.destinationStationId, name: game.destinationStationName },
    stations: network?.stations,
    segments: network?.segments,
    steps,
  };
}

export async function getRanking() {
  const db = await getDb();
  return db.all(`
    SELECT u.id AS userId, u.username,
           COALESCE(MAX(g.final_score), 0) AS bestScore,
           COUNT(g.id) AS playedGames
    FROM users u
    LEFT JOIN games g ON g.user_id = u.id AND g.final_score IS NOT NULL
    GROUP BY u.id, u.username
    ORDER BY bestScore DESC, username ASC
  `);
}

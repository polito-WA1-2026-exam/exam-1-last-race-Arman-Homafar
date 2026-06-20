export async function createSchema(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT    NOT NULL UNIQUE,
      hash     TEXT    NOT NULL,
      salt     TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lines (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      name  TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stations (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      x    REAL NOT NULL,
      y    REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS line_stations (
      line_id    INTEGER NOT NULL REFERENCES lines(id),
      station_id INTEGER NOT NULL REFERENCES stations(id),
      PRIMARY KEY (line_id, station_id)
    );

    CREATE TABLE IF NOT EXISTS segments (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      station_a_id INTEGER NOT NULL REFERENCES stations(id),
      station_b_id INTEGER NOT NULL REFERENCES stations(id)
    );

    CREATE TABLE IF NOT EXISTS segment_lines (
      segment_id INTEGER NOT NULL REFERENCES segments(id),
      line_id    INTEGER NOT NULL REFERENCES lines(id),
      PRIMARY KEY (segment_id, line_id)
    );

    CREATE TABLE IF NOT EXISTS events (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT    NOT NULL,
      effect      INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS games (
      id                     INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id                INTEGER NOT NULL REFERENCES users(id),
      start_station_id       INTEGER NOT NULL REFERENCES stations(id),
      destination_station_id INTEGER NOT NULL REFERENCES stations(id),
      initial_coins          INTEGER NOT NULL,
      final_score            INTEGER,
      valid_route            INTEGER,
      validation_message     TEXT,
      created_at             TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_steps (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id         INTEGER NOT NULL REFERENCES games(id),
      step_index      INTEGER NOT NULL,
      from_station_id INTEGER NOT NULL REFERENCES stations(id),
      to_station_id   INTEGER NOT NULL REFERENCES stations(id),
      line_id         INTEGER NOT NULL REFERENCES lines(id),
      event_id        INTEGER NOT NULL REFERENCES events(id),
      coin_before     INTEGER NOT NULL,
      coin_after      INTEGER NOT NULL
    );
  `);
}

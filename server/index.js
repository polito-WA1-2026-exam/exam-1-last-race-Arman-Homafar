import cors from 'cors';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import {
  createGame,
  getFullNetwork,
  getGameForUser,
  getRanking,
  getUserById,
  getUserByUsername,
  initDatabase,
  submitGame,
  verifyPassword,
} from './db.js';

const app = express();
const port = 3001;

await initDatabase();

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await getUserByUsername(username);
    if (!user || !verifyPassword(password, user)) {
      return done(null, false, { message: 'Incorrect username or password.' });
    }
    return done(null, { id: user.id, username: user.username });
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(id);
    done(null, user ?? false);
  } catch (error) {
    done(error);
  }
});

const corsOptions = {
  origin(origin, callback) {
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS.'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(session({
  secret: 'last-race-exam-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
  },
}));
app.use(passport.authenticate('session'));

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required.' });
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

app.get('/api/instructions', (req, res) => {
  res.json({
    title: 'Last Race',
    text: 'Study the underground network, then plan a route from your assigned start to destination in 90 seconds. Valid routes must use real segments and may change line only at interchange stations. Each valid trip starts with 20 coins and random events change the final score.',
  });
});

app.post('/api/sessions', (req, res, next) => {
  passport.authenticate('local', (error, user, info) => {
    if (error) {
      return next(error);
    }
    if (!user) {
      return res.status(401).json({ error: info?.message ?? 'Login failed.' });
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }
      return res.status(201).json({ id: user.id, username: user.username });
    });
  })(req, res, next);
});

app.get('/api/sessions/current', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No active session.' });
  }
  return res.json(req.user);
});

app.delete('/api/sessions/current', (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    return res.status(204).end();
  });
});

app.get('/api/network/full', isAuthenticated, asyncHandler(async (req, res) => {
  res.json(await getFullNetwork());
}));

app.post('/api/games', isAuthenticated, asyncHandler(async (req, res) => {
  const game = await createGame(req.user.id);
  res.status(201).json(game);
}));

app.post('/api/games/:id/submit', isAuthenticated, asyncHandler(async (req, res) => {
  const gameId = parseId(req.params.id);
  if (!gameId) {
    return res.status(400).json({ error: 'Invalid game id.' });
  }
  if (!Array.isArray(req.body?.segmentIds)) {
    return res.status(400).json({ error: 'segmentIds must be an array.' });
  }

  const result = await submitGame(req.user.id, gameId, req.body.segmentIds);
  return res.json(result);
}));

app.get('/api/games/:id', isAuthenticated, asyncHandler(async (req, res) => {
  const gameId = parseId(req.params.id);
  if (!gameId) {
    return res.status(400).json({ error: 'Invalid game id.' });
  }
  const game = await getGameForUser(req.user.id, gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found.' });
  }
  return res.json(game);
}));

app.get('/api/ranking', isAuthenticated, asyncHandler(async (req, res) => {
  res.json(await getRanking());
}));

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status ?? 500;
  if (status >= 500) {
    console.error(err);
  }
  return res.status(status).json({ error: err.message ?? 'Internal server error.' });
});

app.listen(port, () => {
  console.log(`Last Race API listening at http://localhost:${port}`);
});

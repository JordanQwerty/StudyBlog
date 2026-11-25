// AuthRoutes register, login, logout
// insecure version

const express = require('express');
const db = require('../database');

const router = express.Router();

// registration
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

router.post('/register', (req, res) => {
  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    return res.render('register', { error: 'All fields are required.' });
  }


// insecure password in plain-text (SDE)
  db.run(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    [username, email, password],
    (error) => {
      if (error) { // insecure db error sent back to user
        return res.render('register', { error: error.message });
      }
      res.redirect('/login');
    }
  );
});

// Login
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};

 // insecure, user string is joined straight into sql quewry , try lecturer' -- or ' OR '1'='1' --
  const sql = `SELECT * FROM users WHERE username = '${username}' AND password_hash = '${password}'`;

  db.get(sql, (error, user) => {
    if (error) { // insecure displaying db error back to user
      return res.status(500).send(`<p>${error.stack}</p>`);
    }

    if (!user) {
      return res.render('login', { error: 'Invalid username or password' });
    }


    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.redirect('/');
  });
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
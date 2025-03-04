const express = require("express");
const cors = require("cors");
const users = require("./data/users.json");
const todos = require("./data/todos.json");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const path = require("path");

const app = express();

app.use(cors());
app.options("*", cors());

app.use(express.json());

app.use(
  session({
    secret: "session_secret_password",
  })
);

app.use((req, res, next) => {
  console.log(req.session);
  next();
});

app.use(express.static(path.join(__dirname, "frontend")));

app.listen(8080, () => {
  console.log("Server started!");
});

app.post("/login", (req, res) => {
  const { password, email } = req.body;

  for (let user of users) {
    if (email === user.email && password === user.password) {
      const newUser = { ...user, password: null };
      req.session.user = newUser;
      return res.json({
        user: newUser,
      });
    }
  }

  return res.sendStatus(404);
});

app.get("/todos", authMiddleware, isUser, (req, res) => {
  res.json({
    todos: todos.filter((todo) => todo.userId == req.session.user.id),
  });
});

app.get("/users", authMiddleware, isAdmin, (req, res) => {
  res.json({
    users: users,
  });
});

app.get("/all-todos", authMiddleware, isAdmin, (req, res) => {
  res.json({
    todos: todos,
  });
});

/**
 *
 * ###########MIDDLEWARES SECTION###########
 *
 */

function authMiddleware(req, res, next) {
  if (!req.session.user) return res.sendStatus(401);
  next();
}

function isUser(req, res, next) {
  if (req.session.user.role !== "user") return res.sendStatus(403);
  next();
}

function isAdmin(req, res, next) {
  if (req.session.user.role !== "admin") return res.sendStatus(403);
  next();
}

function isTester(req, res, next) {
  if (req.session.user.role !== "tester") return res.sendStatus(403);
  next();
}

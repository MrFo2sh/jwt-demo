const express = require("express");
const cors = require("cors");
const users = require("./data/users.json");
const todos = require("./data/todos.json");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.options("*", cors());

app.use(express.json());

app.listen(8080, () => {
  console.log("Server started!");
});

app.post("/login", (req, res) => {
  const { password, email } = req.body;

  for (let user of users) {
    if (email === user.email && password === user.password) {
      const newUser = { ...user, password: null };
      return res.json({
        token: jwt.sign(newUser, "token_secret_password", { expiresIn: "1d" }),
        refresh_token: jwt.sign(newUser, "refresh_token_secret_password", {
          expiresIn: "7d",
        }),
        user: newUser,
      });
    }
  }

  return res.sendStatus(404);
});

app.get("/todos", authMiddleware, isUser, (req, res) => {
  res.json({
    todos: todos.filter((todo) => todo.userId == req.user.id),
  });
});

app.post("/refresh_token", (req, res) => {
  const { refresh_token } = req.body;
  try {
    const user = jwt.verify(refresh_token, "refresh_token_secret_password");
    return res.json({
      token: jwt.sign(user, "token_secret_password", { expiresIn: "1d" }),
    });
  } catch (error) {
    res.sendStatus(403);
  }
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
  let token = req.headers.Authorization || req.headers.authorization;

  if (!token) return res.sendStatus(403);

  token = token.split(" ")[1];

  try {
    const user = jwt.verify(token, "token_secret_password");
    req.user = user;
    next();
  } catch (error) {
    return res.sendStatus(403);
  }
}

function isUser(req, res, next) {
  if (req.user.role !== "user") return res.sendStatus(403);
  next();
}

function isAdmin(req, res, next) {
  if (req.user.role !== "admin") return res.sendStatus(403);
  next();
}

function isTester(req, res, next) {
  if (req.user.role !== "tester") return res.sendStatus(403);
  next();
}

const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.some((el) => el.username === username);

  if (!user) {
    return response.status(404).send({ message: "Mensagem do erro" });
  }

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const existeUser = users.some((el) => el.username === username);

  if (existeUser) {
    return response.status(400).send({ error: "Mensagem do erro" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).send(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = users.find((el) => el.username === username);

  return response.status(201).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = users.find((el) => el.username === username);

  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const user = users.find((el) => el.username === username);

  let index = user.todos.findIndex((el) => el.id === id);

  if (index === -1) {
    return response.status(404).send({ error: "Mensagem do erro" });
  }

  user.todos[index] = {
    ...user.todos[index],
    title,
    deadline,
  };

  return response.json({
    ...user.todos[index],
    title,
    deadline,
  });
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find((el) => el.username === username);

  let index = user.todos.findIndex((el) => el.id === id);

  if (index === -1) {
    return response.status(404).send({ error: "Mensagem do erro" });
  }

  user.todos[index] = {
    ...user.todos[index],
    done: true,
  };

  return response.json({
    ...user.todos[index],
  });
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find((el) => el.username === username);

  let index = user.todos.findIndex((el) => el.id === id);

  if (index === -1) {
    return response.status(404).send({ error: "Mensagem do erro" });
  }

  delete user.todos.splice(index, 1);

  return response.status(204).json();
});

module.exports = app;

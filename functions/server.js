const express = require("express");
const serverless = require("serverless-http");
const app = express();
const router = express.Router();
const cors = require("cors");
const morgan = require("morgan");

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

router.use(express.json());
router.use(cors());
router.use(requestLogger);
router.use(express.static("dist"));

morgan.token("body", (request) =>
  request.method === "POST" ? JSON.stringify(request.body) : ""
);
router.use(morgan(":method :url :status :response-time ms :body"));

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

router.get("/", (request, response) => {
  // response.send("<h1>Hello World!</h1>");
  response.send("app is running...");
});

router.get("/api/persons", (request, response) => {
  response.json(persons);
});

router.get("/api/info", (request, response) => {
  const date = new Date();
  response.send(`
    <p>Phonebook has info for ${persons.length} people<br/></p>
    <p>${date}</p>
  `);
});

router.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.statusMessage = "Person does not exist";
    response.status(404).end();
  }
});

router.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const generateId = () => {
  const min = 1;
  const max = Number.MAX_SAFE_INTEGER;
  const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
  if (persons.some((person) => person.id === randomId)) {
    generateId();
  } else {
    return randomId;
  }
};

router.post("/api/persons", (request, response) => {
  const body = request.body;
  // console.log(body);

  if (!body.name) {
    return response.status(400).json({
      error: "name is missing",
    });
  } else if (!body.number) {
    return response.status(400).json({
      error: "number is missing",
    });
  }

  if (persons.some((person) => person.name === body.name)) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);

  response.json(person);
});

router.use(unknownEndpoint);

// const PORT = process.env.PORT || 3001;
// router.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// Export your Express router wrapped with serverless
app.use("/.netlify/functions/server", router);
module.exports.handler = serverless(app);

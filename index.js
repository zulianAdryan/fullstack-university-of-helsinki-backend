require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const Person = require("./models/person");

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

app.use(express.static("dist"));
app.use(express.json());
app.use(requestLogger);
app.use(cors());

// morgan
morgan.token("body", (request) =>
  request.method === "POST" ? JSON.stringify(request.body) : ""
);
app.use(morgan(":method :url :status :response-time ms :body"));

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((_persons) => {
      console.log("persons", _persons);
      response.json(_persons);
    })
    .catch((error) => next(error));
});

app.get("/api/info", (request, response) => {
  Person.countDocuments().then((length) => {
    const date = new Date();
    response.send(
      `<div><p>Phonebook has info for ${length} people</p><p>${date}</p></div>`
    );
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.statusMessage = "Person does not exist";
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

// const generateId = () => {
//   const min = 1;
//   const max = Number.MAX_SAFE_INTEGER;
//   const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
//   if (persons.some((person) => person.id === randomId)) {
//     generateId();
//   } else {
//     return randomId;
//   }
// };

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  const newPerson = new Person({
    name: body.name,
    number: body.number,
  });

  newPerson
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

// handler of requests with unknown endpoint
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

// this has to be the last loaded middleware.
const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server PHONEBOOK running on port ${PORT}`);
});

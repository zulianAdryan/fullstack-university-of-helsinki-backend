const mongoose = require("mongoose");

const url = process.env.MONGO_URI.replace(
  "MONGO_PASSWORD",
  process.env.MONGO_PASSWORD
);

// console.log("mongoose connecting to url", url, "\n");

mongoose.set("strictQuery", false);
mongoose
  .connect(url)
  .then(() => console.log("connected to MongoDB"))
  .catch((error) => console.log("error connecting to MongoDB", error.message));

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: 8,
    required: true,
    validate: {
      validator: function (num) {
        return /^\d{2,3}-\d+$/.test(num);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);

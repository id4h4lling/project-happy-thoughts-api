import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import getEndpoints from "express-list-endpoints";

const mongoUrl =
  process.env.MONGO_URL || "mongodb://localhost/project-mongoApi";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

const HappyThoughtSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140,
    trim: true,
  },
  like: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: String,
    default: () =>
      new Date(Date.now()).toLocaleString("sv-SE", {
        timeZone: "Europe/Stockholm",
      }),
  },
});

// Start defining your routes here
app.get("/", (req, res) => {
  res.send(getEndpoints(app));
});

const HappyThought = mongoose.model("HappyThought", HappyThoughtSchema);

app.get("/thoughts", async (req, res) => {
  try {
    const thoughts = await HappyThought.find()
      .sort({ thoughts: thoughts, createdAt: "desc" })
      .limit(20)
      .exec();
    res.status(200).json({ response: thoughts, success: true });
  } catch (error) {
    res.status(400).json({ response: error, success: false });
  }
});

app.post("/thoughts", async (req, res) => {
  const { message } = req.body;

  try {
    const newThought = await new HappyThought({
      message: message,
    }).save();
    res.status(200).json({ response: newThought, success: true });
  } catch (error) {
    res.status(400).json({ response: error, success: false });
  }
});

app.post("/thoughts/:id/like", async (req, res) => {
  const { id } = req.params;
  try {
    const thoughtToUpdate = await HappyThought.findByIdAndUpdate(id, {
      $inc: { like: 1 },
    });
    res.status(200).json({
      respons: `Message '${thoughtToUpdate.message}' has been updated`,
      success: true,
    });
  } catch (error) {
    res.status(400).json({ respons: error, success: false });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

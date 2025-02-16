const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

import cors from "cors";
const app = express();
app.use(
  cors({
    origin: "*",
  })
);
const allowedOrigins = [
  "https://www.vision-m8.com",
  "https://www.vision-m8.com",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS Policy Error: This origin is not allowed"));
      }
    },
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));

const OPENCV_SCRIPT_PATH = "/Users/anaiskillian/treehacks/opencvtext.py";
const IMAGE_PATH = "/tmp/captured.jpg";

app.post("/", async (req, res) => {
  try {
    if (!req.body.image) {
      throw new Error("No image data received.");
    }

    const base64Image = req.body.image.replace(/^data:image\/jpeg;base64,/, "");
    fs.writeFileSync(IMAGE_PATH, base64Image, { encoding: "base64" });

    console.log(`✅ Image saved at ${IMAGE_PATH}. Running OpenCV script...`);

    exec(`python3 ${OPENCV_SCRIPT_PATH} ${IMAGE_PATH}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Execution Error: ${error.message}`);
        return res.status(500).json({ error: `Processing error: ${error.message}` });
      }
      if (stderr) {
        console.error(`⚠️ Python Script Error: ${stderr}`);
        return res.status(500).json({ error: `Python error: ${stderr}` });
      }

      console.log(`📌 Python Script Output:\n${stdout}`);
      res.json({ message: stdout.trim() });
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: `Failed to process image: ${error.message}` });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

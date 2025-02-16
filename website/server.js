const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const OPENCV_SCRIPT_PATH = "/Users/anaiskillian/treehacks/opencvtext.py";
const IMAGE_PATH = "test.jpg";


app.post("/process-image", (req, res) => {
  const base64Image = req.body.image.replace(/^data:image\/jpeg;base64,/, ""); // Remove metadata
  fs.writeFileSync(IMAGE_PATH, base64Image, { encoding: "base64" }); // Save image as JPEG

  console.log("✅ Image received and saved. Running OpenCV script...");

  exec(`python3 ${OPENCV_SCRIPT_PATH} ${IMAGE_PATH}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Execution Error: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    if (stderr) {
      console.error(`⚠️ Python Script Error: ${stderr}`);
    }
    console.log(`📌 Python Script Output:\n${stdout}`);
    res.json({ message: stdout.trim() });
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

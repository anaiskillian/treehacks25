const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increased payload size limit

const OPENCV_SCRIPT_PATH = "/Users/anaiskillian/treehacks/opencvtext.py";
const IMAGE_PATH = "/tmp/captured.jpg"; // Store images in a safe temp directory

app.post("/process-image", async (req, res) => {
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
        return res.status(500).json({ error: error.message });
      }
      if (stderr) {
        console.error(`⚠️ Python Script Error: ${stderr}`);
      }
      console.log(`📌 Python Script Output:\n${stdout}`);

      let extractedText = "No meaningful output detected.";
      try {
        const match = stdout.match(/content='([^']+)'/); // Extract just the AI response
        if (match) extractedText = match[1];
      } catch (err) {
        console.error("Error extracting meaningful response:", err);
      }

      res.json({ message: extractedText.trim() });
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Failed to process image" });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors({ origin: "*" })); // ✅ Allow requests from all domains
app.use(express.json());

const OPENCV_SCRIPT_PATH = "/Users/anaiskillian/treehacks/opencvtext.py";
const IMAGE_PATH = "/tmp/captured.jpg"; // ✅ Ensure image is saved correctly

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
        return res.status(500).json({ error: "Processing error occurred." });
      }
      if (stderr) {
        console.error(`⚠️ Python Script Error: ${stderr}`);
      }
      console.log(`📌 Python Script Output:\n${stdout}`);

      let extractedText = "No meaningful output detected.";
      try {
        const match = stdout.match(/content='([^']+)'/);
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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

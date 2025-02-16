const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const OPENCV_SCRIPT_PATH = "/Users/anaiskillian/treehacks/opencvtext.py";

app.post("/run-opencv", (req, res) => {
  exec(`python3 ${OPENCV_SCRIPT_PATH}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ error: stderr });
    }
    console.log(`stdout: ${stdout}`);
    res.json({ message: "Python script executed successfully!", output: stdout });
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

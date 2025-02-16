from flask import Flask, request, jsonify
import subprocess
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Path to the OpenCV script
OPENCV_SCRIPT_PATH = "opencvtext.py"

# Track running script
running_process = None  

@app.route('/run-opencv', methods=['POST'])
def run_opencv():
    global running_process
    try:
        running_process = subprocess.run(["python3", OPENCV_SCRIPT_PATH], capture_output=True, text=True)
        if running_process.stderr:
            return jsonify({"error": running_process.stderr}), 500
        return jsonify({"message": "Python script executed successfully!", "output": running_process.stdout})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/stop', methods=['POST'])
def stop_script():
    global running_process
    if running_process is not None:
        running_process.terminate()
        running_process = None
        return jsonify({"message": "Stopped the running script"})
    return jsonify({"message": "No script is running"}), 400


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001)

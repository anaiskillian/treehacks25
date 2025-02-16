from flask import Flask, request, jsonify
import subprocess
import os
import signal
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Path to the OpenCV script
OPENCV_SCRIPT_PATH = "../opencvtext.py"

# Track running script
running_process = None  

@app.route('/run-opencv', methods=['POST'])
def run_opencv():
    global running_process
    try:
        if running_process is not None:
            return jsonify({"error": "A process is already running"}), 400

        # Start the script asynchronously
        running_process = subprocess.Popen(["python3", OPENCV_SCRIPT_PATH], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        return jsonify({"message": "Python script started successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/stop', methods=['POST'])
def stop_script():
    global running_process
    if running_process is not None:
        try:
            # First, attempt to terminate gracefully
            running_process.terminate()
            running_process.wait(timeout=1)  # Give it 2 seconds to exit

        except subprocess.TimeoutExpired:
            # If the process doesn't terminate, kill it forcefully
            os.kill(running_process.pid, signal.SIGKILL)
        
        running_process = None
        return jsonify({"message": "Stopped the running script forcefully if needed"})

    return jsonify({"message": "No script is running"}), 400


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001)
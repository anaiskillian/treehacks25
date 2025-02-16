import cv2

print("Scanning for available cameras...")

available_cameras = []

for i in range(2):
    cap = cv2.VideoCapture(i)
    if cap.isOpened():
        available_cameras.append(i)
        cap.release()
print(available_cameras)

# Prioritize external cameras (assuming index 1+ are external)
selected_camera = None
if len(available_cameras) == 2:
    selected_camera = 1
else:
    selected_camera = 0

print(f"Using Camera Index: {selected_camera}")
camera = cv2.VideoCapture(selected_camera)

print(f"Available Cameras: {available_cameras}")

if not available_cameras:
    print("No cameras detected. Try connecting an external webcam.")
else:
    print(f"First available camera index: {available_cameras[0]}")

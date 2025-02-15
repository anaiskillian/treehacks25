import serial
import time

# Replace with your Arduino's port (Windows: 'COMx', Linux/Mac: '/dev/ttyUSBx' or '/dev/ttyACMx')
arduino = serial.Serial(port='/dev/cu.usbmodem11101', baudrate=9600, timeout=1)
time.sleep(2)  # Wait for Arduino to initialize

def send_text(text):
    """Sends text to Arduino and waits for response."""
    arduino.write((text + "\n").encode())  # Send string with newline
    time.sleep(0.1)  # Allow Arduino to process
    while True:
        response = arduino.readline().decode().strip()  # Read response
        if response:
            print(response)  # Print Arduino output
        if response == "Done":  # Stop reading after completion signal
            break

# Example usage:
send_text("apple")  # Sends "hello" to Arduino for Braille display

arduino.close()  # Close the connection when done
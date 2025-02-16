import cv2
from PIL import Image
from pytesseract import pytesseract
import base64
from openai import OpenAI
import sys
import os
from dotenv import load_dotenv
import braille_test
from gtts import gTTS
import pygame
import logging

import cv2

def video_capture():
    # print("Scanning for available cameras...")
    available_cameras = []

    for i in range(2):
        cap = cv2.VideoCapture(i)
        if cap.isOpened():
            available_cameras.append(i)
            cap.release()
    # print(available_cameras)
    if not available_cameras:
        # print("Connect a webcam!")
        return None  # Exit function if no cameras are available

    # Prioritize external cameras (assuming index 1+ are external)
    selected_camera = None
    if len(available_cameras) == 2:
        selected_camera = 1
    else:
        selected_camera = 0

    # print(f"Using Camera Index: {selected_camera}")
    camera = cv2.VideoCapture(selected_camera)

    if not camera.isOpened():
        # print("Camera failed to initialize!")
        return None

    while True:
        ret, image = camera.read()
        if not ret:
            # print("Error: Failed to capture image!")
            break

        cv2.imshow('Text detection', image)
        if cv2.waitKey(1) & 0xFF == ord('s'):
            image_path = "/tmp/test.jpg"
            cv2.imwrite(image_path, image)
            break

    camera.release()
    cv2.destroyAllWindows()
    return image_path


def tesseract():
  video_capture()
  Imagepath = "test.jpg"
  pytesseract.tesseract_cmd = r'/opt/homebrew/bin/tesseract'
  text = pytesseract.image_to_string(Image.open(Imagepath))
    
  # print(text.strip())


def previous_figure_context(flag):
  load_dotenv()
  video_capture()
  client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

  # Function to encode the image
  def encode_image(image_path):
    with open(image_path, "rb") as image_file:
      return base64.b64encode(image_file.read()).decode("utf-8")

  image_path = "/tmp/test.jpg"

  # Getting the Base64 string
  base64_image = encode_image(image_path)

  text1 = "What is in this image? Give a two sentence summary."

  text2 = "Only give the complete text for the following image."

  response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": text1 if flag == 0 else text2
          },
          {
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
          },
        ],
      }
    ],
  )
  
  return (client, response.choices[0].message.content)

def figure_context(client, flag, base64_image):

  text1 = "What is in this image? Give a two sentence summary."

  text2 = "Only give the complete text for the following image."

  response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": text1 if flag == 0 else text2
          },
          {
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
          },
        ],
      }
    ],
  )
  
  return (client, response.choices[0].message.content)

def audio_with_pygame(text):
    language = 'en'
    myobj = gTTS(text=text, lang=language, slow=False)

    # Saving the converted audio in a mp3 file named
    # welcome 
    myobj.save("welcome.mp3")

    # Initialize the mixer module
    pygame.mixer.init()

    # Load the mp3 file
    pygame.mixer.music.load("welcome.mp3")

    # Play the loaded mp3 file
    pygame.mixer.music.play()


def user_output(client, flag, base64_image):
  # if len(sys.argv) != 2:
  #   print("Usage: Enter a flag")
  #   return

  # python script.py 0  # Runs figure_context() (don't need since already got it)
  # python script.py 1  # Runs figure_context() AND audio
  # python script.py 2  # Runs word translation
  # python script.py 3  # Runs tesseract() (this is the bad image to text. do not use)
  # flag = sys.argv[1]

  if flag == "0":
    figure_context(0)
  
  if flag == "1":
    client, result_text = figure_context(client, 0, base64_image)

    speech_response = client.audio.speech.create(
        model="tts-1",  # You can also try "tts-1-hd" for higher quality
        voice="nova",   # "nova" is a female voice, try "alloy" or "echo" for alternatives
        input=result_text
    )

    # Save the generated speech to a file
    audio_file = "output.mp3"
    with open(audio_file, "wb") as f:
        f.write(speech_response.content)

    # Play the audio using pygame
    pygame.mixer.init()
    pygame.mixer.music.load(audio_file)
    pygame.mixer.music.play()

    # Wait for the audio to finish playing
    while pygame.mixer.music.get_busy():
        continue

    return result_text
  
  elif flag == "2":
    # print("Running word translation")
    _, res = figure_context(client, 1, base64_image)
    braille_test.send_text(res)
  
  elif flag == "3":
    # print("Running tesseract()")
    tesseract()
  
  else:
    # print("Invalid flag")
  

def get_choice():
  load_dotenv()
  logging.info('Python Script Output')
  client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

  # Function to encode the image
  def encode_image(image_path):
    with open(image_path, "rb") as image_file:
      return base64.b64encode(image_file.read()).decode("utf-8")

  image_path = "/tmp/test.jpg"

  # Getting the Base64 string
  base64_image = encode_image(image_path)

  text_find = "You must determine which flag (from 1 or 2) to choose. Choose flag 2 if there is clear reading text in the image. Choose flag 1 if there is not a lot of text in the image and a description of the image would be better. Just output '1' or '2' based on the choice you make."

  response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": text_find
          },
          {
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
          },
        ],
      }
    ],
  )
  return (client, response.choices[0].message.content, base64_image)

def process_uploaded_image(image_path):
    """Reads the uploaded image instead of capturing from a webcam."""
    if not os.path.exists(image_path):
        # print("Error: Image file not found.")
        sys.exit(1)

    # print(f"Processing image: {image_path}")

    # Read the image from the file instead of using `cv2.VideoCapture`
    image = cv2.imread(image_path)

    if image is None:
        # print("Error: Failed to read image.")
        sys.exit(1)

    # Save the image as test.jpg (your script expects this file)
    output_path = "/tmp/test.jpg"
    cv2.imwrite(output_path, image)
    # print(f"✅ Image saved as {output_path}, proceeding with existing logic...")
    return output_path

if __name__ == "__main__":
    load_dotenv()

    if len(sys.argv) > 1:
        # If an image is passed from `server.js`, process the uploaded image
        image_path = process_uploaded_image(sys.argv[1])
    else:
        # If no image is passed, use the webcam and wait for "S" key
        image_path = video_capture()

    if image_path:
        # print("🚀 Running get_choice() and user_output() after image capture.")
        client, choice, base64_image = get_choice()
        user_output(client, choice, base64_image)

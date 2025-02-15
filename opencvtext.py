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

def video_capture():

  camera = cv2.VideoCapture(0)
  while True:
    _, image = camera.read()
    cv2.imshow('Text detection', image)
    if cv2.waitKey(1) & 0xFF == ord('s'):
      cv2.imwrite('test.jpg', image)
      break
  camera.release()
  cv2.destroyAllWindows()

def tesseract():
  video_capture()
  Imagepath = "test.jpg"
  pytesseract.tesseract_cmd = r'/opt/homebrew/bin/tesseract'
  text = pytesseract.image_to_string(Image.open(Imagepath))
    
  print(text.strip())


def previous_figure_context(flag):
  video_capture()
  client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

  # Function to encode the image
  def encode_image(image_path):
    with open(image_path, "rb") as image_file:
      return base64.b64encode(image_file.read()).decode("utf-8")

  image_path = "test.jpg"

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
  
  print(response.choices[0])
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
  
  print(response.choices[0])
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
    print("Running figure_context()")
    figure_context(0)
  
  if flag == "1":
    print("Running figure_context() AND audio")
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
    print("Running word translation")
    _, res = figure_context(client, 1, base64_image)
    braille_test.send_text(res)
  
  elif flag == "3":
    print("Running tesseract()")
    tesseract()
  
  else:
    print("Invalid flag")
  

def get_choice():
  video_capture()
  client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

  # Function to encode the image
  def encode_image(image_path):
    with open(image_path, "rb") as image_file:
      return base64.b64encode(image_file.read()).decode("utf-8")

  image_path = "test.jpg"

  # Getting the Base64 string
  base64_image = encode_image(image_path)

  text_find = "You must determine which flag (from 1 or 2) to choose. Choose flag 2 if there is text in the image. Choose flag 1 if there is not a lot of text in the image and an audio description of the image would be best for the blind person. Just output '1' or '2' based on the choice you make."

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


if __name__ == "__main__":
  load_dotenv()
  client, choice, base64_image = get_choice()
  user_output(client, choice, base64_image)

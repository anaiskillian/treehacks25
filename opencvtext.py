import cv2
from PIL import Image
from pytesseract import pytesseract
import base64
from openai import OpenAI
import sys
import os
from dotenv import load_dotenv
import braille_test

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


def figure_context(flag):
  video_capture()
  client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

  # Function to encode the image
  def encode_image(image_path):
    with open(image_path, "rb") as image_file:
      return base64.b64encode(image_file.read()).decode("utf-8")

  image_path = "test.jpg"

  # Getting the Base64 string
  base64_image = encode_image(image_path)

  text1 = "What is in this image?"

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
  return response.choices[0].message.content

def main():
  if len(sys.argv) != 2:
    print("Usage: Enter a flag")
    return

  # python script.py 0  # Runs figure_context()
  # python script.py 1  # Runs word translation
  # python script.py 1  # Runs tesseract()
  flag = sys.argv[1]

  if flag == "0":
    print("Running figure_context()")
    figure_context(0)
  elif flag == "1":
    print("Running word translation")
    res = figure_context(1)
    braille_test.send_text(res)
  elif flag == "2":
    print("Running tesseract()")
    tesseract()
  else:
    print("Invalid flag! Use 0 for figure_context or 1 for tesseract.")


if __name__ == "__main__":
  load_dotenv()

  main()

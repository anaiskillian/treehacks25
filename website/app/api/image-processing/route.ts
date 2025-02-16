import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function determineImageType(base64Image: string): Promise<'1' | '2'> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "You must determine which flag (from 1 or 2) to choose. Choose flag 2 if there is clear reading text in the image. Choose flag 1 if there is not a lot of text in the image and a description of the image would be better. Just output '1' or '2' based on the choice you make."
          },
          {
            type: "image_url",
            image_url: {
              url: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`
            },
          },
        ],
      }
    ],
    max_tokens: 1
  });

  return response.choices[0].message.content as '1' | '2';
}

async function processImage(base64Image: string, flag: '1' | '2') {
  const prompt = flag === '1' 
    ? "What is in this image? Give a two sentence summary."
    : "Only give the complete text for the following image.";

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`
            },
          },
        ],
      }
    ],
  });

  return response.choices[0].message.content;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    // Determine image type (text or description)
    const flag = await determineImageType(base64Image);

    // Process the image based on the flag
    const result = await processImage(base64Image, flag);

    // If flag is 1, generate audio
    let audioUrl = null;
    if (flag === '1') {
      const speechResponse = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: result,
      });

      // Convert the audio response to base64
      const audioBuffer = await speechResponse.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');
      audioUrl = `data:audio/mp3;base64,${audioBase64}`;
    }

    return NextResponse.json({
      success: true,
      result,
      flag,
      audioUrl
    });

  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
} 
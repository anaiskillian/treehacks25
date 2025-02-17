import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const { image, mode } = await request.json()

    const prompt = mode === "describe" 
      ? "What is in this image? Give a two sentence summary."
      : "Only give the complete text for the following image."

    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${image}` },
            },
          ],
        },
      ],
    })

    const description = visionResponse.choices[0].message.content

    // Generate speech
    const speech = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: description || "No description available",
    })

    // Convert speech to base64
    const audioBuffer = Buffer.from(await speech.arrayBuffer())
    const audioBase64 = audioBuffer.toString('base64')
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`

    return NextResponse.json({ 
      description,
      audioUrl
    })

  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    )
  }
} 

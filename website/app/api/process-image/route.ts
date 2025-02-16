import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.image) {
      return NextResponse.json({ error: "No image data received." }, { status: 400 });
    }

    const IMAGE_PATH = "/tmp/captured.jpg";
    const OPENCV_SCRIPT_PATH = "/Users/anaiskillian/treehacks/opencvtext.py";

    // Convert base64 to image file
    const base64Image = body.image.replace(/^data:image\/jpeg;base64,/, "");
    fs.writeFileSync(IMAGE_PATH, base64Image, { encoding: "base64" });

    console.log(`✅ Image saved at ${IMAGE_PATH}. Running OpenCV script...`);

    return new Promise((resolve, reject) => {
      exec(`python3 ${OPENCV_SCRIPT_PATH} ${IMAGE_PATH}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Execution Error: ${error.message}`);
          return resolve(
            NextResponse.json({ error: `Processing error: ${error.message}` }, { status: 500 })
          );
        }
        if (stderr) {
          console.error(`⚠️ Python Script Error: ${stderr}`);
          return resolve(
            NextResponse.json({ error: `Python error: ${stderr}` }, { status: 500 })
          );
        }

        console.log(`📌 Python Script Output:\n${stdout}`);
        resolve(NextResponse.json({ message: stdout.trim() }));
      });
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    return NextResponse.json({ error: `Failed to process image: ${error.message}` }, { status: 500 });
  }
}

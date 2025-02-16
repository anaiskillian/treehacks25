import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

// Allow requests from https://www.vision-m8.com
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Change "*" to specific domains for security
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();  

    if (!body.image) {
      return NextResponse.json({ error: "No image data received." }, { status: 400, headers: corsHeaders });
    }

    const IMAGE_PATH = "/tmp/captured.jpg";
    const OPENCV_SCRIPT_PATH = "/Users/anaiskillian/treehacks/opencvtext.py";

    // Convert base64 to image file
    const base64Image = body.image.replace(/^data:image\/jpeg;base64,/, "");
    fs.writeFileSync(IMAGE_PATH, base64Image, { encoding: "base64" });

    console.log(`✅ Image saved at ${IMAGE_PATH}. Running OpenCV script...`);

    return new Promise((resolve) => {
      exec(`python3 ${OPENCV_SCRIPT_PATH} ${IMAGE_PATH}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Execution Error: ${error.message}`);
          return resolve(NextResponse.json({ error: `Processing error: ${error.message}` }, { status: 500, headers: corsHeaders }));
        }
        if (stderr) {
          console.error(`⚠️ Python Script Error: ${stderr}`);
          return resolve(NextResponse.json({ error: `Python error: ${stderr}` }, { status: 500, headers: corsHeaders }));
        }

        console.log(`📌 Python Script Output:\n${stdout}`);
        resolve(NextResponse.json({ message: stdout.trim() }, { status: 200, headers: corsHeaders }));
      });
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    return NextResponse.json({ error: `Failed to process image: ${error.message}` }, { status: 500, headers: corsHeaders });
  }
}

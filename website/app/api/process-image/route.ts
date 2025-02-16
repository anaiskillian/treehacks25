import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const allowedOrigins = [
  "https://www.vision-m8.com",  // ✅ Add your frontend domain
  "http://localhost:3000",      // ✅ Allow local development
];

// ✅ Helper function to set CORS headers
const setCorsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin, 
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
});

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") || "";

  if (!allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: "CORS Not Allowed" }, { status: 403 });
  }

  return NextResponse.json({}, {
    status: 200,
    headers: setCorsHeaders(origin),
  });
}

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin") || "";

    if (!allowedOrigins.includes(origin)) {
      return NextResponse.json({ error: "CORS Not Allowed" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.image) {
      return NextResponse.json({ error: "No image data received." }, { status: 400, headers: setCorsHeaders(origin) });
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
          return resolve(NextResponse.json({ error: `Processing error: ${error.message}` }, { status: 500, headers: setCorsHeaders(origin) }));
        }
        if (stderr) {
          console.error(`⚠️ Python Script Error: ${stderr}`);
          return resolve(NextResponse.json({ error: `Python error: ${stderr}` }, { status: 500, headers: setCorsHeaders(origin) }));
        }

        console.log(`📌 Python Script Output:\n${stdout}`);
        resolve(NextResponse.json(
          { message: stdout.trim() },
          {
            status: 200,
            headers: setCorsHeaders(origin),
          }
        ));
      });
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    return NextResponse.json({ error: `Failed to process image: ${error.message}` }, { status: 500 });
  }
}

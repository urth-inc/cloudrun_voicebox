import { createServer, IncomingMessage, ServerResponse } from "http";
import VoicevoxClient from "./util/voicevox-client";
import fs from "fs/promises";
import path from "path";

const hostname = "0.0.0.0";
const port = 3000;

const voicevoxUrl = process.env.VOICEVOX_URL;

let voicevox: VoicevoxClient;
if (!voicevoxUrl) {
  voicevox = new VoicevoxClient();
} else {
  voicevox = new VoicevoxClient(voicevoxUrl);
}

let indexTemplate: string;

async function generateTemplate() {
  const speakers = await voicevox.getSpeakers();
  const templatePath = path.join(__dirname, "templates", "index.html");
  let template = await fs.readFile(templatePath, "utf-8");

  const speakerOptions = speakers
    .flatMap((speaker: any) =>
      speaker.styles.map(
        (style: any) =>
          `<option value="${style.id}">${speaker.name} - ${style.name}</option>`
      )
    )
    .join("\n");

  return template.replace("<!-- SPEAKER_OPTIONS -->", speakerOptions);
}

const router: Record<
  string,
  (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
> = {
  "/": (req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.end(indexTemplate);
  },
  "/tts": async (req, res) => {
    const { searchParams } = new URL(
      req.url ?? "",
      `http://${req.headers.host}`
    );
    const text = searchParams.get("text");
    if (!text || typeof text !== "string") {
      res.statusCode = 400;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("テキストパラメータが必要です");
      return;
    }
    const speakerId = searchParams.get("speakerId");
    if (!speakerId || typeof speakerId !== "string") {
      console.error("スピーカーIDパラメータが必要です");
      res.statusCode = 400;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("スピーカーIDパラメータが必要です");
      return;
    }

    try {
      const speakerIdNumber = Number(speakerId);
      const audioBuffer = await voicevox.textToSpeech(text, speakerIdNumber);
      res.statusCode = 200;
      res.setHeader("Content-Type", "audio/wav");
      res.setHeader("Content-Disposition", `attachment; filename="speech.wav"`);
      res.end(audioBuffer);
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.end("音声生成中にエラーが発生しました");
    }
  },
};

const server = createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? "", `http://${req.headers.host}`);
    const path = url.pathname;
    const handler = router[path];

    if (handler) {
      await handler(req, res);
    } else {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain");
      res.end("Not Found");
    }
  }
);

async function startServer() {
  indexTemplate = await generateTemplate();

  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

startServer();

import http from "http";
import https from "https";
import { URL } from "url";

class VoicevoxClient {
  private baseUrl: string;

  constructor(baseUrl: string = "http://127.0.0.1:50021") {
    this.baseUrl = baseUrl;
  }

  private async request(
    method: string,
    path: string,
    data?: string,
    headers?: Record<string, string>
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const options = {
        method,
        headers: headers || {},
      };

      const req = (url.protocol === "https:" ? https : http).request(
        url,
        options,
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => resolve(Buffer.concat(chunks)));
        }
      );

      req.on("error", reject);

      if (data) {
        req.write(data);
      }
      req.end();
    });
  }

  async createAudioQuery(text: string, speaker: number): Promise<any> {
    const path = `/audio_query?text=${encodeURIComponent(
      text
    )}&speaker=${speaker}`;
    const response = await this.request("POST", path);
    return JSON.parse(response.toString());
  }

  async synthesis(audioQuery: any, speaker: number): Promise<Buffer> {
    const path = `/synthesis?speaker=${speaker}`;
    const headers = { "Content-Type": "application/json" };
    return this.request("POST", path, JSON.stringify(audioQuery), headers);
  }

  async textToSpeech(text: string, speaker: number): Promise<Buffer> {
    const audioQuery = await this.createAudioQuery(text, speaker);
    return this.synthesis(audioQuery, speaker);
  }

  async getSpeakers(): Promise<any> {
    const response = await this.request("GET", "/speakers");
    return JSON.parse(response.toString());
  }
}

export default VoicevoxClient;

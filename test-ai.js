import { GoogleGenAI } from "@google/genai";

try {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: "test-project",
    location: "us-central1",
  });
  console.log("Success");
} catch (e) {
  console.error("Error:", e);
}

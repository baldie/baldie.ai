const { ElevenLabsClient } = require("elevenlabs");

const client = new ElevenLabsClient({
  apiKey: process.env.API_KEY_VOICE
});

const createAudioStreamFromText = async (text) => {
  const audioStream = await client.generate({
    voice: "Baldie",
    voice_id: process.env.BALDIE_VOICE_ID,
    text: text
  });

  const chunks = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};

module.exports = { createAudioStreamFromText };
const functions = require('@google-cloud/functions-framework');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { preamble } = require('./baldie.json');
const { createAudioStreamFromText } = require('./tts.js');
const non_answer = "Sorry, I can't answer that.";

functions.http('askBaldie', async (req, res) => {
  res.set('Access-Control-Allow-Origin', 'https://baldie.ai');

  // Only accept requests from my domain
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
  } else {

    async function ask(query) {
      // For text-only input, use the gemini-pro model
      const genAI = new GoogleGenerativeAI(process.env.API_KEY_MODEL);
      const model = genAI.getGenerativeModel({ model: "gemini-pro"});
      const result = await model.generateContent(preamble.join("\n") + query);
      const response = await result.response;
      return response.text();
    }

    const question = req.body.question || '';
    const answer = await ask(question);

    if (answer === 'Internal Server Error')
      answer = non_answer;
    
    res.setHeader('X-Baldie-Answer', encodeURIComponent(answer));
    res.setHeader('Access-Control-Expose-Headers', 'X-Baldie-Answer');
    console.log(`Question:${question} Answer:${answer}`);

    const stream = await createAudioStreamFromText(answer);
    res.write(stream);
    res.end();
  }
});
const { keith } = require("../keizzah/keith");
const ai = require('unlimited-ai');
const axios = require('axios'); // Added missing axios import
const fs = require('fs');
const conf = require(__dirname + "/../set");
/*const { uploadtoimgur } = require("../keizzah/imgur"); // Ensure this path and export are correct
const { GoogleGenerativeAI } = require("@google/generative-ai");

keith({
  nomCom: "vision",
  aliases: ["analize", "generate"],
  reaction: '⚔️',
  categorie: "search"
}, async (dest, zk, commandeOptions) => {
  const { repondre, msgRepondu, auteurMessage, arg } = commandeOptions;
  const text = arg.join(" ").trim(); // Get the instruction text

  if (msgRepondu) {
    console.log(msgRepondu);

    // If there is an image message
    if (msgRepondu.imageMessage) {
      try {
        // Provide response asking the user to send the image with an instruction
        if (!text) {
          return repondre("Please provide an instruction with the image.");
        }

        // Acknowledge image receipt and instruction
        await repondre("_A moment, alpha md is analyzing contents of the image..._");

        // Download and save the image
        const fdr = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);

        // Upload the image to a hosting platform (e.g., Imgur)
        const fta = await uploadtoimgur(fdr);

        // Send request to the Gemini API with the image and instruction
        const genAI = new GoogleGenerativeAI("AIzaSyAYKwUB7ZCxV-vuWlRlBpRE4pCR2KhyF4A");

        // Function to convert URL to generative part
        async function urlToGenerativePart(url, mimeType) {
          const response = await axios.get(url, { responseType: 'arraybuffer' });
          const data = Buffer.from(response.data).toString('base64');

          return { inlineData: { data, mimeType } };
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const imageUrl = fta;
        const image = [await urlToGenerativePart(imageUrl, 'image/jpeg')];

        const result = await model.generateContent([text, ...image]);
        const response = await result.response;
        const resp = response.text();

        await repondre(resp);
      } catch (e) {
        // Handle any errors that occur during image processing
        repondre("I am unable to analyze images at the moment. Error: " + e.message);
      }
    } else {
      // If no image is provided, ask the user to provide an image
      return repondre("Please provide an image to analyze.");
    }
  } else {
    // If no message was received
    return repondre("No image message received. Please send an image.");
  }
});
// Common function for fetching GPT responses
const fetchGptResponse = async (url, query) => {
  try {
    const response = await axios.get(url + encodeURIComponent(query));
    const data = response.data;
    if (data && data.status) {
      return data.BK9;
    } else {
      throw new Error('Failed to retrieve GPT response.');
    }
  } catch (error) {
    console.error('Error fetching GPT response:', error);
    return 'Something went wrong. Unable to fetch GPT response.';
  }
};*/

// General handler for AI commands
const handleAiCommand = async (dest, zk, params, url, usageExample) => {
  const { repondre, arg } = params;
  const alpha = arg.join(" ").trim();

  if (!alpha) {
    return repondre(usageExample);
  }

  const text = alpha;

  try {
    const response = await fetchGptResponse(url, text);

    await zk.sendMessage(dest, {
      text: response,
      contextInfo: {
        externalAdReply: {
          title: conf.BOT,
          body: "Keep learning",
          thumbnailUrl: conf.URL,
          sourceUrl: "https://whatsapp.com/channel/0029Vaan9TF9Bb62l8wpoD47",
          mediaType: 1,
          showAdAttribution: true,
        },
      },
    });
  } catch (error) {
    console.error("Error generating AI response:", error);
    await repondre("Sorry, I couldn't process your request.");
  }
};

// Keith command handlers
keith({
  nomCom: "chat",
  aliases: ["chatbot", "chatai"],
  reaction: '⚔️',
  categorie: "AI"
}, async (dest, zk, params) => {
  handleAiCommand(dest, zk, params, "https://bk9.fun/ai/chataibot?q=", "Example usage: gpt How's the weather today?");
});

keith({
  nomCom: "alpha",
  aliases: ["alphamd", "alphabot"],
  reaction: '⚔️',
  categorie: "AI"
}, async (dest, zk, params) => {
  handleAiCommand(dest, zk, params, "https://bk9.fun/ai/BK93?BK9=you%20are%20zoro%20from%20one%20piece&q=", "Example usage: gpt Hi, how are you?");
});

keith({
  nomCom: "gpt",
  aliases: ["ilamaa", "ilamaai"],
  reaction: '⚔️',
  categorie: "AI"
}, async (dest, zk, params) => {
  handleAiCommand(dest, zk, params, "https://bk9.fun/ai/llama?q=", "Example usage: gpt Hi, how are you?");
});

keith({
  nomCom: "gemini",
  aliases: ["gemini4", "geminiai"],
  reaction: '⚔️',
  categorie: "AI"
}, async (dest, zk, params) => {
  handleAiCommand(dest, zk, params, "https://bk9.fun/ai/gemini?q=", "Example usage: gpt Hi, how are you?");
});

keith({
  nomCom: "ilama",
  aliases: ["gpt4", "ai"],
  reaction: '⚔️',
  categorie: "AI"
}, async (dest, zk, params) => {
  const { repondre, arg } = params;
  const alpha = arg.join(" ").trim();

  if (!alpha) {
    return repondre("Please provide a song name.");
  }

  const text = alpha;
  try {
    const model = 'gpt-4-turbo-2024-04-09';
    const messages = [
      { role: 'user', content: text },
      { role: 'system', content: 'You are an assistant in WhatsApp. You are called Keith. You respond to user commands.' }
    ];

    const response = await ai.generate(model, messages);

    await zk.sendMessage(dest, {
      text: response,
      contextInfo: {
        externalAdReply: {
          title: conf.BOT,
          body: "keep learning",
          thumbnailUrl: conf.URL,
          sourceUrl: "https://whatsapp.com/channel/0029Vaan9TF9Bb62l8wpoD47",
          mediaType: 1,
          showAdAttribution: true,
        },
      },
    });
  } catch (error) {
    console.error("Error generating AI response:", error);
    await repondre("Sorry, I couldn't process your request.");
  }
});

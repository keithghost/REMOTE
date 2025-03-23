const { keith } = require("../keizzah/keith");
const ai = require('unlimited-ai');
const fs = require('fs');
const { sendMessage, repondre } = require(__dirname + "/../keizzah/context");

// Deepseek AI Command
keith({
  nomCom: "deepseek",
  aliases: ["gpt4", "ai"],
  reaction: '⚔️',
  categorie: "AI"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;
  const alpha = arg.join(" ").trim();

  if (!alpha) {
    return repondre(zk, dest, ms, "Please provide a message.");
  }

  const text = alpha;

  // Load previous conversation from store.json, if it exists
  let conversationData = [];
  try {
    const rawData = fs.readFileSync('store.json');
    conversationData = JSON.parse(rawData);
  } catch (err) {
    console.log('No previous conversation found, starting new one.');
  }

  try {
    const model = 'gpt-4-turbo-2024-04-09';
    const userMessage = { role: 'user', content: text };
    const systemMessage = { role: 'system', content: 'You are an assistant in WhatsApp. You are called Keith. You respond to user commands.' };

    // Add user input and system message to the conversation data
    conversationData.push(userMessage);
    conversationData.push(systemMessage);

    // Get AI response from the model
    const aiResponse = await ai.generate(model, conversationData);

    // Add AI response to the conversation data
    conversationData.push({ role: 'assistant', content: aiResponse });

    // Write the updated conversation data to store.json
    fs.writeFileSync('store.json', JSON.stringify(conversationData, null, 2));

    await sendMessage(zk, dest, ms, {
      text: aiResponse,
      contextInfo: {
        externalAdReply: {
          title: "DEEPSEEK AI TOOL",
          body: `Keep learning`,
          thumbnailUrl: "https://files.catbox.moe/elnwwy.png", // Replace with your bot profile photo URL
          sourceUrl: "https://whatsapp.com/channel/0029Vaan9TF9Bb62l8wpoD47", // Your channel URL
          mediaType: 1,
          showAdAttribution: true, // Verified badge
        },
      },
    });

  } catch (error) {
    console.error("Error generating AI response:", error);
    await repondre(zk, dest, ms, "Sorry, I couldn't process your request.");
  }
});

// GPT Command
keith({
  nomCom: "gpt",
  aliases: ["gpt4", "ai"],
  reaction: '⚔️',
  categorie: "AI"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;
  const alpha = arg.join(" ").trim();

  if (!alpha) {
    return repondre(zk, dest, ms, "Please provide a song name.");
  }

  const text = alpha;

  try {
    const model = 'gpt-4-turbo-2024-04-09';

    const messages = [
      { role: 'user', content: text },
      { role: 'system', content: 'You are an assistant in WhatsApp. You are called Keith. You respond to user commands.' }
    ];

    const response = await ai.generate(model, messages);

    await sendMessage(zk, dest, ms, {
      text: response,
      contextInfo: {
        externalAdReply: {
          title: "ALPHA-MD GPT4",
          body: `Keep learning`,
          thumbnailUrl: "https://files.catbox.moe/palnd8.jpg", // Replace with your bot profile photo URL
          sourceUrl: "https://whatsapp.com/channel/0029Vaan9TF9Bb62l8wpoD47", // Your channel URL
          mediaType: 1,
          showAdAttribution: true, // Verified badge
        },
      },
    });

  } catch (error) {
    console.error("Error generating AI response:", error);
    await repondre(zk, dest, ms, "Sorry, I couldn't process your request.");
  }
});

// Gemini Command
keith({
  nomCom: "gemini",
  aliases: ["gpto4", "gemni", "gpt2", "gpt3"],
  reaction: '⚔️',
  categorie: "AI"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;
  const elementQuery = arg.join(" ").trim();

  if (!elementQuery) {
    return repondre(zk, dest, ms, "Please provide a song name.");
  }

  try {
    // Dynamically import Gemini AI
    const { default: Gemini } = await import('gemini-ai');
    const gemini = new Gemini("AIzaSyCFn-iaA6z0A_doO7hxKhGbIZtCpxZDycE");

    const chat = gemini.createChat();

    // Ask Gemini AI for a response
    const res = await chat.ask(elementQuery);

    await sendMessage(zk, dest, ms, {
      text: res,
      contextInfo: {
        externalAdReply: {
          title: "ALPHA-MD GEMINI",
          body: `Keep learning`,
          thumbnailUrl: "https://files.catbox.moe/palnd8.jpg", // Replace with your bot profile photo URL
          sourceUrl: "https://whatsapp.com/channel/0029Vaan9TF9Bb62l8wpoD47", // Your channel URL
          mediaType: 1,
          showAdAttribution: true, // Verified badge
        },
      },
    });

  } catch (e) {
    console.error("Error generating Gemini response:", e);
    await repondre(zk, dest, ms, "I am unable to generate responses\n\n" + e.message);
  }
});

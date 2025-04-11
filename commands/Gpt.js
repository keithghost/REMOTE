const { keith } = require("../keizzah/keith");
const axios = require('axios');
const { sendMessage, repondre } = require(__dirname + "/../keizzah/context");
const conf = require(__dirname + "/../set");

keith({
  nomCom: "gpt",
  aliases: ["gpt4", "ai"],
  reaction: '⚔️',
  categorie: "AI"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;
  const query = arg.join(" ").trim();

  if (!query) {
    return repondre(zk, dest, ms, "Please provide a message.");
  }

  try {
    const response = await axios.get(
      `https://apis-keith.vercel.app/ai/gpt?q=${encodeURIComponent(query)}`,
      { timeout: 10000 } // Added timeout for better error handling
    );

    if (!response.data?.status || !response.data?.result) {
      return repondre(zk, dest, ms, "Failed to get a response from the AI.");
    }

    const messageOptions = {
      text: response.data.result,
      contextInfo: {
        externalAdReply: {
          title: `${conf.BOT} GPT`,
          body: conf.OWNER_NAME,
          thumbnailUrl: conf.URL,
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true,
        },
      },
    };

    await sendMessage(zk, dest, ms, messageOptions);

  } catch (error) {
    console.error("Error fetching GPT response:", error);
    
    const errorMessage = error.response 
      ? "The AI service is currently unavailable."
      : error.request
      ? "Request timed out. Please try again."
      : "Sorry, I couldn't process your request.";
    
    repondre(zk, dest, ms, errorMessage);
  }
});

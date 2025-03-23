const { keith } = require("../keizzah/keith");
const axios = require('axios');
const { sendMessage, repondre } = require(__dirname + "/../keizzah/context");

keith({
  nomCom: "gpt",
  aliases: ["gpt4", "ai"],
  reaction: '⚔️',
  categorie: "AI"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;
  const query = arg.join(" ").trim(); // Get the user's query

  if (!query) {
    return repondre(zk, dest, ms, "Please provide a message.");
  }

  try {
    // Fetch response from the API
    const response = await axios.get(`https://apis-keith.vercel.app/ai/gpt?q=${encodeURIComponent(query)}`);

    // Check if the API response is valid
    if (response.data.status && response.data.result) {
      const aiResponse = response.data.result;

      // Send the AI response to the user
      await sendMessage(zk, dest, ms, {
        text: aiResponse,
        contextInfo: {
          externalAdReply: {
            title: "ALPHA-MD GPT",
            body: `Powered by Keithkeizzah`,
            thumbnailUrl: "https://files.catbox.moe/palnd8.jpg", // Replace with your bot profile photo URL
            sourceUrl: "https://whatsapp.com/channel/0029Vaan9TF9Bb62l8wpoD47", // Your channel URL
            mediaType: 1,
            showAdAttribution: true, // Verified badge
          },
        },
      });
    } else {
      repondre(zk, dest, ms, "Failed to get a response from the AI.");
    }
  } catch (error) {
    console.error("Error fetching GPT response:", error);
    repondre(zk, dest, ms, "Sorry, I couldn't process your request.");
  }
});


//
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

keith({
  nomCom: "deepseek",
  aliases: ["deepseekai", "ds"],
  reaction: '🔍',
  categorie: "AI"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;
  const query = arg.join(" ").trim(); // Get the user's query

  if (!query) {
    return repondre(zk, dest, ms, "Please provide a message.");
  }

  try {
    // Fetch response from the DeepSeek API
    const response = await axios.get(`https://apis-keith.vercel.app/ai/deepseek?q=${encodeURIComponent(query)}`);

    // Check if the API response is valid
    if (response.data.status && response.data.result) {
      const aiResponse = response.data.result;

      // Send the AI response to the user
      await sendMessage(zk, dest, ms, {
        text: aiResponse,
        contextInfo: {
          externalAdReply: {
            title: `${conf.BOT} DeepSeek`,
            body: conf.OWNER_NAME,
            thumbnailUrl: conf.URL, // Replace with your bot profile photo URL
            sourceUrl: conf.GURL, // Your channel URL
            mediaType: 1,
            showAdAttribution: true, // Verified badge
          },
        },
      });
    } else {
      repondre(zk, dest, ms, "Failed to get a response from DeepSeek AI.");
    }
  } catch (error) {
    console.error("Error fetching DeepSeek response:", error);
    repondre(zk, dest, ms, "Sorry, I couldn't process your request to DeepSeek.");
  }
});


keith({
  nomCom: "blackbox",
  aliases: ["bb", "blackboxai"],
  reaction: '⬛',
  categorie: "AI"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;
  const query = arg.join(" ").trim(); // Get the user's query

  if (!query) {
    return repondre(zk, dest, ms, "Please provide a message for Blackbox AI.");
  }

  try {
    // Fetch response from the Blackbox API
    const response = await axios.get(`https://apis-keith.vercel.app/ai/blackbox?q=${encodeURIComponent(query)}`);

    // Check if the API response is valid
    if (response.data.status && response.data.result) {
      const aiResponse = response.data.result;

      // Send the AI response to the user
      await sendMessage(zk, dest, ms, {
        text: aiResponse,
        contextInfo: {
          externalAdReply: {
            title: `${conf.BOT} Blackbox`,
            body: conf.OWNER_NAME,
            thumbnailUrl: conf.URL, // Replace with your bot profile photo URL
            sourceUrl: conf.GURL, // Your channel URL
            mediaType: 1,
            showAdAttribution: true, // Verified badge
          },
        },
      });
    } else {
      repondre(zk, dest, ms, "Failed to get a response from Blackbox AI.");
    }
  } catch (error) {
    console.error("Error fetching Blackbox response:", error);
    repondre(zk, dest, ms, "Sorry, Blackbox AI is currently unavailable.");
  }
});

keith({
  nomCom: "ilama",
  aliases: ["ilamai", "ilamaai"],
  reaction: '⬛',
  categorie: "AI"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;
  const query = arg.join(" ").trim(); // Get the user's query

  if (!query) {
    return repondre(zk, dest, ms, "Please provide a message for Blackbox AI.");
  }

  try {
    // Fetch response from the Blackbox API
    const response = await axios.get(`https://apis-keith.vercel.app/ai/ilama?q=${encodeURIComponent(query)}`);

    // Check if the API response is valid
    if (response.data.status && response.data.result) {
      const aiResponse = response.data.result;

      // Send the AI response to the user
      await sendMessage(zk, dest, ms, {
        text: aiResponse,
        contextInfo: {
          externalAdReply: {
            title: `${conf.BOT} Ilama`,
            body: conf.OWNER_NAME,
            thumbnailUrl: conf.URL, // Replace with your bot profile photo URL
            sourceUrl: conf.GURL, // Your channel URL
            mediaType: 1,
            showAdAttribution: true, // Verified badge
          },
        },
      });
    } else {
      repondre(zk, dest, ms, "Failed to get a response from Ilama AI.");
    }
  } catch (error) {
    console.error("Error fetching Blackbox response:", error);
    repondre(zk, dest, ms, "Sorry, Blackbox AI is currently unavailable.");
  }
});

keith({
  nomCom: "gemini",
  aliases: ["geminiai", "geminiiai"],
  reaction: '⬛',
  categorie: "AI"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;
  const query = arg.join(" ").trim(); // Get the user's query

  if (!query) {
    return repondre(zk, dest, ms, "Please provide a message for Gemini AI.");
  }

  try {
    // Fetch response from the Blackbox API
    const response = await axios.get(`https://apis-keith.vercel.app/ai/gemini?q=${encodeURIComponent(query)}`);

    // Check if the API response is valid
    if (response.data.status && response.data.result) {
      const aiResponse = response.data.result;

      // Send the AI response to the user
      await sendMessage(zk, dest, ms, {
        text: aiResponse,
        contextInfo: {
          externalAdReply: {
            title: `${conf.BOT} Gemini`,
            body: conf.OWNER_NAME,
            thumbnailUrl: conf.URL, // Replace with your bot profile photo URL
            sourceUrl: conf.GURL, // Your channel URL
            mediaType: 1,
            showAdAttribution: true, // Verified badge
          },
        },
      });
    } else {
      repondre(zk, dest, ms, "Failed to get a response from Blackbox AI.");
    }
  } catch (error) {
    console.error("Error fetching Blackbox response:", error);
    repondre(zk, dest, ms, "Sorry, Blackbox AI is currently unavailable.");
  }
});
keith({
  nomCom: "bard",
  aliases: ["bardai", "barddai"],
  reaction: '⬛',
  categorie: "AI"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;
  const query = arg.join(" ").trim(); // Get the user's query

  if (!query) {
    return repondre(zk, dest, ms, "Please provide a message for Gemini AI.");
  }

  try {
    // Fetch response from the Blackbox API
    const response = await axios.get(`https://apis-keith.vercel.app/ai/bard?q=${encodeURIComponent(query)}`);

    // Check if the API response is valid
    if (response.data.status && response.data.result) {
      const aiResponse = response.data.result;

      // Send the AI response to the user
      await sendMessage(zk, dest, ms, {
        text: aiResponse,
        contextInfo: {
          externalAdReply: {
            title: `${conf.BOT} Bard`,
            body: conf.OWNER_NAME,
            thumbnailUrl: conf.URL, // Replace with your bot profile photo URL
            sourceUrl: conf.GURL, // Your channel URL
            mediaType: 1,
            showAdAttribution: true, // Verified badge
          },
        },
      });
    } else {
      repondre(zk, dest, ms, "Failed to get a response from Blackbox AI.");
    }
  } catch (error) {
    console.error("Error fetching Blackbox response:", error);
    repondre(zk, dest, ms, "Sorry, Blackbox AI is currently unavailable.");
  }
});

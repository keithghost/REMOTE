const { keith } = require("../keizzah/keith");
const ai = require('unlimited-ai');
const { repondre, sendMessage } = require('../keizzah/context');
const axios = require('axios');
const wiki = require('wikipedia');
const conf = require(__dirname + "/../set");

keith({
  nomCom: "technews",
  reaction: '📰',
  categorie: 'search'
}, async (dest, zk, context) => {
  const { ms } = context;

  try {
    // Fetching tech news from the API
    const response = await axios.get("https://fantox001-scrappy-api.vercel.app/technews/random");
    const data = response.data;
    const { thumbnail, news } = data;

    await sendMessage(zk, dest, ms, {
      text: news,
      contextInfo: {
        externalAdReply: {
          title: "ALPHA-MD TECH NEWS",
          body: "keep learning", 
          thumbnailUrl: thumbnail, 
          sourceUrl: conf.GURL, 
          mediaType: 1,
          showAdAttribution: true, 
        },
      },
    }, { quoted: ms });

  } catch (error) {
    console.error("Error fetching tech news:", error);
    await repondre(zk, dest, ms, "Sorry, there was an error retrieving the news. Please try again later.\n" + error.message);
  }
});

keith({
  nomCom: "bible",
  reaction: '🎎',
  categorie: "search"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;
  const reference = arg.join(" ");
  
  if (!reference) {
    return repondre(zk, dest, ms, "Please specify the book, chapter, and verse you want to read. Example: bible john 3:16", {
      contextInfo: {
        externalAdReply: {
          title: "Bible Reference Required",
          body: "Please provide a book, chapter, and verse.",
          thumbnailUrl: "https://files.catbox.moe/zt9ie6.jpg", // Replace with a suitable thumbnail URL
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true,
        },
      },
    });
  }
  
  try {
    const response = await axios.get(`https://bible-api.com/${reference}`);
    
    if (!response.data) {
      return repondre(zk, dest, ms, "Invalid reference. Example: bible john 3:16", {
        contextInfo: {
          externalAdReply: {
            title: "Invalid Bible Reference",
            body: "Please provide a valid book, chapter, and verse.",
            thumbnailUrl: "https://files.catbox.moe/zt9ie6.jpg", // Replace with a suitable thumbnail URL
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true,
          },
        },
      });
    }
    
    const data = response.data;
    const messageText = `
ᬑ *ALPHA HOLY BIBLE* ᬒ

⧭ *_WE'RE READING:_* ${data.reference}

⧭ *_NUMBER OF VERSES:_* ${data.verses.length}

⧭ *_NOW READ:_* ${data.text}

⧭ *_LANGUAGE:_* ${data.translation_name}
╭────────────────◆
│ *_Powered by ${conf.OWNER_NAME}*
╰─────────────────◆ `;
    
    await sendMessage(zk, dest, ms, {
      text: messageText,
      contextInfo: {
        externalAdReply: {
          title: "ALPHA-MD HOLY BIBLE",
          body: `We're reading: ${data.reference}`,
          mediaType: 1,
          thumbnailUrl: "https://files.catbox.moe/zt9ie6.jpg", 
          sourceUrl: conf.GURL,
          showAdAttribution: true, 
        },
      },
    });

  } catch (error) {
    console.error("Error fetching Bible passage:", error);
    await repondre(zk, dest, ms, "An error occurred while fetching the Bible passage. Please try again later.\n" + error.message);
  }
});
keith({
  nomCom: "define",
  aliases: ["dictionary", "dict", "def"],
  reaction: '😁',
  categorie: "Search"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;
  const term = arg.join(" ");

  if (!term) {
    return repondre(zk, dest, ms, "Please provide a term to define.");
  }

  try {
    const { data } = await axios.get(`http://api.urbandictionary.com/v0/define?term=${term}`);
    const definition = data.list[0];

    if (definition) {
      const definitionMessage = `
        Word: ${term}
        Definition: ${definition.definition.replace(/\[|\]/g, '')}
        Example: ${definition.example.replace(/\[|\]/g, '')}
      `;

      await sendMessage(zk, dest, ms, {
        text: definitionMessage,
        contextInfo: {
          externalAdReply: {
            title: "ALPHA-MD DICTIONARY",
            body: `Definition of ${term}`,
            mediaType: 1,
            thumbnailUrl: "https://files.catbox.moe/28j7yx.jpg", 
            sourceUrl: conf.GURL,
            showAdAttribution: true, 
          },
        },
      });

    } else {
      return repondre(zk, dest, ms, `No result found for "${term}".`);
    }
  } catch (error) {
    console.error(error);
    return repondre(zk, dest, ms, "An error occurred while fetching the definition.");
  }
});

keith({
  nomCom: "code",
  aliases: ["session", "pair", "paircode", "qrcode"],
  reaction: '🚀',
  categorie: 'system'
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;

  if (!arg || arg.length === 0) {
    const replyText = "Example Usage: .code 2541111xxxxx.";
    return repondre(zk, dest, ms, replyText);
  }

  try {
    // Notify user that pairing is in progress
    const replyText = "*Wait Alpha Md is getting your pair code 💧✅...*";
    await repondre(zk, dest, ms, replyText);

    // Prepare the API request
    const encodedNumber = encodeURIComponent(arg.join(" "));
    const apiUrl = `https://keith-sessions-pi5z.onrender.com/code?number=${encodedNumber}`;

    // Fetch the pairing code from the API
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data && data.code) {
      const pairingCode = data.code;
      await sendMessage(zk, dest, ms, {
        text: pairingCode,
        contextInfo: {
          externalAdReply: {
            title: "ALPHA-MD PAIR CODE",
            body: "Here is your pairing code:",
            mediaType: 1,
            thumbnailUrl: conf.URL, 
            sourceUrl: conf.GURL,
            showAdAttribution: true, 
          },
        },
      });

      const secondReplyText = "Here is your pair code, copy and paste it to the notification above or link devices.";
      await repondre(zk, dest, ms, secondReplyText);
    } else {
      throw new Error("Invalid response from API.");
    }
  } catch (error) {
    console.error("Error getting API response:", error.message);
    const replyText = "Error getting response from API.";
    repondre(zk, dest, ms, replyText);
  }
});

keith({
  nomCom: "element",
  reaction: '📓',
  categorie: "search"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;
  const elementQuery = arg.join(" ").trim();

  if (!elementQuery) {
    return repondre(zk, dest, ms, "Please provide an element symbol or name.");
  }

  try {
    const response = await axios.get(`https://api.popcat.xyz/periodic-table?element=${elementQuery}`);
    
    if (!response.data) {
      return repondre(zk, dest, ms, "Could not find information for the provided element. Please check the symbol or name.");
    }

    const data = response.data;
    const thumb = data.image; // Assuming the API returns an 'image' property for the element thumbnail

    const formattedMessage = `
*Alpha Md Element Information:*
🚀 *Name:* ${data.name}
🚀 *Symbol:* ${data.symbol}
🚀 *Atomic Number:* ${data.atomic_number}
🚀 *Atomic Mass:* ${data.atomic_mass}
🚀 *Period:* ${data.period}
🚀 *Phase:* ${data.phase}
🚀 *Discovered By:* ${data.discovered_by}
🚀 *Summary:* ${data.summary}
   
Regards ${conf.BOT} `;

    await sendMessage(zk, dest, ms, {
      text: formattedMessage,
      contextInfo: {
        externalAdReply: {
          title: "ALPHA-MD ELEMENT INFORMATION",
          body: "Here is the information you requested:",
          mediaType: 1,
          thumbnailUrl: thumb,
          sourceUrl: conf.GURL,
          showAdAttribution: true, 
        },
      },
    });

  } catch (error) {
    console.error("Error fetching the element data:", error);
    repondre(zk, dest, ms, "An error occurred while fetching the element data. Please try again later.");
  }
});

keith({
  nomCom: "github",
  aliases: ["git"],
  reaction: '💻',
  categorie: "stalker"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;
  const githubUsername = arg.join(" ");

  if (!githubUsername) {
    return repondre(zk, dest, ms, "Give me a valid GitHub username like: github keithkeizzah");
  }

  try {
    const response = await axios.get(`https://api.github.com/users/${githubUsername}`);
    const data = response.data;

    if (data.message === "Not Found") {
      return repondre(zk, dest, ms, `User ${githubUsername} not found.`);
    }

    const thumb = data.avatar_url; // Using the avatar_url as the thumbnail

    const githubMessage = `
°GITHUB USER INFO°
🚩 Id: ${data.id}
🔖 Name: ${data.name}
🔖 Username: ${data.login}
✨ Bio: ${data.bio}
🏢 Company: ${data.company}
📍 Location: ${data.location}
📧 Email: ${data.email || "Not provided"}
📰 Blog: ${data.blog || "Not provided"}
🔓 Public Repos: ${data.public_repos}
🔐 Public Gists: ${data.public_gists}
👪 Followers: ${data.followers}
🫶 Following: ${data.following}
`;

    await sendMessage(zk, dest, ms, {
      text: githubMessage,
      contextInfo: {
        externalAdReply: {
          title: "ALPHA-MD GITHUB USER INFO",
          body: `Information about ${data.login}`,
          mediaType: 1,
          thumbnailUrl: thumb,
          sourceUrl: conf.GURL,
          showAdAttribution: true,
        },
      },
    });

  } catch (error) {
    console.error("Error fetching GitHub user data:", error);
    await repondre(zk, dest, ms, "An error occurred while fetching GitHub user data.");
  }
});

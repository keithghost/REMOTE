const { keith } = require('../keizzah/keith');
const gis = require('g-i-s');
const axios = require('axios');
const conf = require(__dirname + '/../set');
const { repondre, sendMessage } = require('../keizzah/context'); // Import repondre and sendMessage

keith({
  nomCom: "sswidth",
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  try {
    // Caption for the screenshot
    const cap = `*Screenshot by Alpha Md*`;

    // Check if a URL is provided
    if (!arg[0]) {
      return repondre(zk, dest, ms, 'Please insert a website link to take a screenshot!');
    }

    // Construct the screenshot URL
    const image = `https://image.thum.io/get/width/${arg[0]}`;

    // Send the screenshot image with the caption
    await sendMessage(zk, dest, ms, {
      image: { url: image },
      caption: cap
    });

  } catch (error) {
    // Log the error and notify the user with a formatted error message
    console.error(error);
    repondre(zk, dest, ms, `An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "sscrop",
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  try {
    // Caption for the screenshot
    const cap = `*Screenshot by Alpha Md*`;

    // Check if a URL is provided
    if (!arg[0]) {
      return repondre(zk, dest, ms, 'Please insert a website link to take a screenshot!');
    }

    // Construct the screenshot URL
    const image = `https://image.thum.io/get/crop/${arg[0]}`;

    // Send the screenshot image with the caption
    await sendMessage(zk, dest, ms, {
      image: { url: image },
      caption: cap
    });

  } catch (error) {
    // Log the error and notify the user with a formatted error message
    console.error(error);
    repondre(zk, dest, ms, `An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "maxage",
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  try {
    // Caption for the screenshot
    const cap = `*Screenshot by Alpha Md*`;

    // Check if a URL is provided
    if (!arg[0]) {
      return repondre(zk, dest, ms, 'Please insert a website link to take a screenshot!');
    }

    // Construct the screenshot URL
    const image = `https://image.thum.io/get/maxAge/${arg[0]}`;

    // Send the screenshot image with the caption
    await sendMessage(zk, dest, ms, {
      image: { url: image },
      caption: cap
    });

  } catch (error) {
    // Log the error and notify the user with a formatted error message
    console.error(error);
    repondre(zk, dest, ms, `An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "jpg",
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  try {
    // Caption for the screenshot
    const cap = `*Screenshot by Alpha Md*`;

    // Check if a URL is provided
    if (!arg[0]) {
      return repondre(zk, dest, ms, 'Please insert a website link to take a screenshot!');
    }

    // Construct the screenshot URL
    const image = `https://image.thum.io/get/allowJPG/${arg[0]}`;

    // Send the screenshot image with the caption
    await sendMessage(zk, dest, ms, {
      image: { url: image },
      caption: cap
    });

  } catch (error) {
    // Log the error and notify the user with a formatted error message
    console.error(error);
    repondre(zk, dest, ms, `An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "png",
  aliases: ["ss", "sshot"],
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  try {
    // Caption for the screenshot
    const cap = `*Screenshot by Alpha Md*`;

    // Check if a URL is provided
    if (!arg[0]) {
      return repondre(zk, dest, ms, 'Please insert a website link to take a screenshot!');
    }

    // Construct the screenshot URL
    const image = `https://image.thum.io/get/png/${arg[0]}`;

    // Send the screenshot image with the caption
    await sendMessage(zk, dest, ms, {
      image: { url: image },
      caption: cap
    });

  } catch (error) {
    // Log the error and notify the user with a formatted error message
    console.error(error);
    repondre(zk, dest, ms, `An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "noanimate",
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  try {
    // Caption for the screenshot
    const cap = `*Screenshot by Alpha Md*`;

    // Check if a URL is provided
    if (!arg[0]) {
      return repondre(zk, dest, ms, 'Please insert a website link to take a screenshot!');
    }

    // Construct the screenshot URL
    const image = `https://image.thum.io/get/noanimate/${arg[0]}`;

    // Send the screenshot image with the caption
    await sendMessage(zk, dest, ms, {
      image: { url: image },
      caption: cap
    });

  } catch (error) {
    // Log the error and notify the user with a formatted error message
    console.error(error);
    repondre(zk, dest, ms, `An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "wait",
  aliases: ["ss", "sshot"],
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  try {
    // Caption for the screenshot
    const cap = `*Screenshot by Alpha Md*`;

    // Check if a URL is provided
    if (!arg[0]) {
      return repondre(zk, dest, ms, 'Please insert a website link to take a screenshot!');
    }

    // Construct the screenshot URL
    const image = `https://image.thum.io/get/wait/${arg[0]}`;

    // Send the screenshot image with the caption
    await sendMessage(zk, dest, ms, {
      image: { url: image },
      caption: cap
    });

  } catch (error) {
    // Log the error and notify the user with a formatted error message
    console.error(error);
    repondre(zk, dest, ms, `An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "viewportwidth",
  aliases: ["ss", "sshot"],
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  try {
    // Caption for the screenshot
    const cap = `*Screenshot by Alpha Md*`;

    // Check if a URL is provided
    if (!arg[0]) {
      return repondre(zk, dest, ms, 'Please insert a website link to take a screenshot!');
    }

    // Construct the screenshot URL
    const image = `https://image.thum.io/get/viewportWidth/${arg[0]}`;

    // Send the screenshot image with the caption
    await sendMessage(zk, dest, ms, {
      image: { url: image },
      caption: cap
    });

  } catch (error) {
    // Log the error and notify the user with a formatted error message
    console.error(error);
    repondre(zk, dest, ms, `An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "iphone5",
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  try {
    // Caption for the screenshot
    const cap = `*Screenshot by Alpha Md*`;

    // Check if a URL is provided
    if (!arg[0]) {
      return repondre(zk, dest, ms, 'Please insert a website link to take a screenshot!');
    }

    // Construct the screenshot URL
    const image = `https://image.thum.io/get/iphone5/${arg[0]}`;

    // Send the screenshot image with the caption
    await sendMessage(zk, dest, ms, {
      image: { url: image },
      caption: cap
    });

  } catch (error) {
    // Log the error and notify the user with a formatted error message
    console.error(error);
    repondre(zk, dest, ms, `An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "iphone6",
  aliases: ["ss", "sshot"],
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  try {
    // Caption for the screenshot
    const cap = `*Screenshot by Alpha Md*`;

    // Check if a URL is provided
    if (!arg[0]) {
      return repondre(zk, dest, ms, 'Please insert a website link to take a screenshot!');
    }

    // Construct the screenshot URL
    const image = `https://image.thum.io/get/iphone6/${arg[0]}`;

    // Send the screenshot image with the caption
    await sendMessage(zk, dest, ms, {
      image: { url: image },
      caption: cap
    });

  } catch (error) {
    // Log the error and notify the user with a formatted error message
    console.error(error);
    repondre(zk, dest, ms, `An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "iphone6plus",
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  try {
    // Caption for the screenshot
    const cap = `*Screenshot by Alpha Md*`;

    // Check if a URL is provided
    if (!arg[0]) {
      return repondre(zk, dest, ms, 'Please insert a website link to take a screenshot!');
    }

    // Construct the screenshot URL
    const image = `https://image.thum.io/get/iphone6plus/${arg[0]}`;

    // Send the screenshot image with the caption
    await sendMessage(zk, dest, ms, {
      image: { url: image },
      caption: cap
    });

  } catch (error) {
    // Log the error and notify the user with a formatted error message
    console.error(error);
    repondre(zk, dest, ms, `An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "iphoneX",
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  try {
    // Caption for the screenshot
    const cap = `*Screenshot by Alpha Md*`;

    // Check if a URL is provided
    if (!arg[0]) {
      return repondre(zk, dest, ms, 'Please insert a website link to take a screenshot!');
    }

    // Construct the screenshot URL
    const image = `https://image.thum.io/get/iphoneX/${arg[0]}`;

    // Send the screenshot image with the caption
    await sendMessage(zk, dest, ms, {
      image: { url: image },
      caption: cap
    });

  } catch (error) {
    // Log the error and notify the user with a formatted error message
    console.error(error);
    repondre(zk, dest, ms, `An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "iphone12pro",
  aliases: ["ss", "sshot"],
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  try {
    // Caption for the screenshot
    const cap = `*Screenshot by Alpha Md*`;

    // Check if a URL is provided
    if (!arg[0]) {
      return repondre(zk, dest, ms, 'Please insert a website link to take a screenshot!');
    }

    // Construct the screenshot URL
    const image = `https://image.thum.io/get/iphone12pro/${arg[0]}`;

    // Send the screenshot image with the caption
    await sendMessage(zk, dest, ms, {
      image: { url: image },
      caption: cap
    });

  } catch (error) {
    // Log the error and notify the user with a formatted error message
    console.error(error);
    repondre(zk, dest, ms, `An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "iphone14promax",
  aliases: ["ss", "sshot"],
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  try {
    // Caption for the screenshot
    const cap = `*Screenshot by Alpha Md*`;

    // Check if a URL is provided
    if (!arg[0]) {
      return repondre(zk, dest, ms, 'Please insert a website link to take a screenshot!');
    }

    // Construct the screenshot URL
    const image = `https://image.thum.io/get/iphone14promax/${arg[0]}`;

    // Send the screenshot image with the caption
    await sendMessage(zk, dest, ms, {
      image: { url: image },
      caption: cap
    });

  } catch (error) {
    // Log the error and notify the user with a formatted error message
    console.error(error);
    repondre(zk, dest, ms, `An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "galaxys5",
  aliases: ["ss", "sshot"],
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  try {
    // Caption for the screenshot
    const cap = `*Screenshot by Alpha Md*`;

    // Check if a URL is provided
    if (!arg[0]) {
      return repondre(zk, dest, ms, 'Please insert a website link to take a screenshot!');
    }

    // Construct the screenshot URL
    const image = `https://image.thum.io/get/galaxys5/${arg[0]}`;

    // Send the screenshot image with the caption
    await sendMessage(zk, dest, ms, {
      image: { url: image },
      caption: cap
    });

  } catch (error) {
    // Log the error and notify the user with a formatted error message
    console.error(error);
    repondre(zk, dest, ms, `An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "screenshot",
  aliases: ["ss", "sshot"],
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  try {
    // Caption for the screenshot
    const cap = `*Screenshot by Alpha Md*`;

    // Check if a URL is provided
    if (!arg[0]) {
      return repondre(zk, dest, ms, 'Please insert a website link to take a screenshot!');
    }

    // Construct the screenshot URL
    const image = `https://image.thum.io/get/fullpage/${arg[0]}`;

    // Send the screenshot image with the caption
    await sendMessage(zk, dest, ms, {
      image: { url: image },
      caption: cap
    });

  } catch (error) {
    // Log the error and notify the user with a formatted error message
    console.error(error);
    repondre(zk, dest, ms, `An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "img",
  aliases: ["image", "images"],
  categorie: "Images",
  reaction: "📷"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  if (!arg[0]) {
    repondre(zk, dest, ms, 'Which image?');
    return;
  }

  const searchTerm = arg.join(" ");
  gis(searchTerm, (error, results) => sendImage(error, results));

  function sendImage(error, results) {
    if (error) {
      repondre(zk, dest, ms, "Oops, an error occurred.");
      return;
    }

    if (!results || results.length === 0) {
      repondre(zk, dest, ms, "No images found.");
      return;
    }

    for (let i = 0; i < Math.min(results.length, 5); i++) {
      sendMessage(zk, dest, ms, {
        image: { url: results[i].url },
        caption: `*Downloaded by ${conf.BOT}*`,
        contextInfo: {
          externalAdReply: {
            title: "Image Search Result",
            body: `Here's the image you searched for: ${searchTerm}`,
            thumbnailUrl: results[i].url,
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true
          }
        }
      });
    }
  }
});

keith({
  nomCom: 'messi',
  categorie: 'images',
  reaction: '😋'
}, async (dest, zk, context) => {
  const { ms } = context;
  try {
    const response = await axios.get("https://raw.githubusercontent.com/Guru322/api/Guru/BOT-JSON/Messi.json");
    const images = response.data;

    if (!Array.isArray(images) || images.length === 0) {
      throw new Error("No images found in the response.");
    }

    for (let i = 0; i < 5; i++) {
      const randomImage = Math.floor(Math.random() * images.length);
      const image = images[randomImage];
      await sendMessage(zk, dest, ms, {
        image: { url: image },
        caption: `*Downloaded by ${conf.BOT}*`,
        contextInfo: {
          externalAdReply: {
            title: "Modern-Logo Search Result",
            body: `Here's an inspiring logo related to: messi`,
            thumbnailUrl: image,
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true
          }
        }
      });
    }
  } catch (error) {
    console.error("Error occurred while retrieving data:", error);
    repondre(zk, dest, ms, "Error occurred while retrieving data: " + error.message);
  }
});

keith({
  nomCom: "waifu",
  categorie: "images",
  reaction: "🙄"
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;
  const url = 'https://api.waifu.pics/nsfw/waifu'; // Replace with your actual URL

  try {
    for (let i = 0; i < 5; i++) {
      const response = await axios.get(url);
      const imageUrl = response.data.url;

      await sendMessage(zk, dest, ms, {
        image: { url: imageUrl },
        caption: `*Downloaded by ${conf.BOT}*`,
        contextInfo: {
          externalAdReply: {
            title: "Image Search Result",
            body: `Here's a great image related to: waifu`,
            thumbnailUrl: imageUrl,
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true
          }
        }
      });
    }
  } catch (error) {
    repondre(zk, dest, ms, 'Error retrieving data: ' + error.message);
  }
});

keith({
  nomCom: "trap",
  categorie: "images",
  reaction: "🙄"
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;
  const url = 'https://api.waifu.pics/nsfw/trap'; // Replace with your actual URL

  try {
    for (let i = 0; i < 5; i++) {
      const response = await axios.get(url);
      const imageUrl = response.data.url;

      await sendMessage(zk, dest, ms, {
        image: { url: imageUrl },
        caption: `*Downloaded by ${conf.BOT}*`,
        contextInfo: {
          externalAdReply: {
            title: "Image Search Result",
            body: `Here's a great image related to: waifu`,
            thumbnailUrl: imageUrl,
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true
          }
        }
      });
    }
  } catch (error) {
    repondre(zk, dest, ms, 'Error retrieving data: ' + error.message);
  }
});

keith({
  nomCom: "hneko",
  categorie: "images",
  reaction: "🙄"
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;
  const url = 'https://api.waifu.pics/nsfw/neko'; // Replace with your actual URL

  try {
    for (let i = 0; i < 5; i++) {
      const response = await axios.get(url);
      const imageUrl = response.data.url;

      await sendMessage(zk, dest, ms, {
        image: { url: imageUrl },
        caption: `*Downloaded by ${conf.BOT}*`,
        contextInfo: {
          externalAdReply: {
            title: "Image Search Result",
            body: `Here's a great image related to: waifu`,
            thumbnailUrl: imageUrl,
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true
          }
        }
      });
    }
  } catch (error) {
    repondre(zk, dest, ms, 'Error retrieving data: ' + error.message);
  }
});

keith({
  nomCom: "blowjob",
  categorie: "images",
  reaction: "🙄"
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;
  const url = 'https://api.waifu.pics/nsfw/blowjob'; // Replace with your actual URL

  try {
    for (let i = 0; i < 5; i++) {
      const response = await axios.get(url);
      const imageUrl = response.data.url;

      await sendMessage(zk, dest, ms, {
        image: { url: imageUrl },
        caption: `*Downloaded by ${conf.BOT}*`,
        contextInfo: {
          externalAdReply: {
            title: "Image Search Result",
            body: `Here's a great image related to: waifu`,
            thumbnailUrl: imageUrl,
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true
          }
        }
      });
    }
  } catch (error) {
    repondre(zk, dest, ms, 'Error retrieving data: ' + error.message);
  }
});

keith({
  'nomCom': "lulcat",
  'reaction': '📡',
  'categorie': 'images'
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  try {
    if (!arg || arg.length === 0) {
      return repondre(zk, dest, ms, "Provide some text.");
    }
    const text = arg.join(" ");
    const imageUrl = `https://api.popcat.xyz/lulcat?text=${text}`;
    await sendMessage(zk, dest, ms, {
      image: { url: imageUrl },
      caption: "*powered by ALPHA-MD*"
    });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    repondre(zk, dest, ms, "Oops, an error occurred while processing your request");
  }
});

// Sadcat Meme Command
keith({
  'nomCom': "sadcat",
  'reaction': '📡',
  'categorie': 'images'
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  try {
    if (!arg || arg.length === 0) {
      return repondre(zk, dest, ms, "Provide some text.");
    }
    const text = arg.join(" ");
    const imageUrl = `https://api.popcat.xyz/sadcat?text=${text}`;
    await sendMessage(zk, dest, ms, {
      image: { url: imageUrl },
      caption: "*powered by ALPHA-MD*"
    });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    repondre(zk, dest, ms, "Oops, an error occurred while processing your request");
  }
});

// Nokia Meme Command
keith({
  'nomCom': "nokia",
  'reaction': '📡',
  'categorie': 'images'
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  try {
    if (!arg || arg.length === 0) {
      return repondre(zk, dest, ms, "Provide some text.");
    }
    const text = arg.join(" ");
    const imageUrl = `https://api.popcat.xyz/nokia?image=${text}`;
    await sendMessage(zk, dest, ms, {
      image: { url: imageUrl },
      caption: "*powered by ALPHA-MD*"
    });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    repondre(zk, dest, ms, "Oops, an error occurred while processing your request");
  }
});

// Unforgivable Meme Command
keith({
  'nomCom': "unforgivable",
  'reaction': '📡',
  'categorie': 'images'
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  try {
    if (!arg || arg.length === 0) {
      return repondre(zk, dest, ms, "Provide some text.");
    }
    const text = arg.join(" ");
    const imageUrl = `https://api.popcat.xyz/unforgivable?text=${text}`;
    await sendMessage(zk, dest, ms, {
      image: { url: imageUrl },
      caption: "*powered by ALPHA-MD*"
    });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    repondre(zk, dest, ms, "Oops, an error occurred while processing your request");
  }
});

// Pooh Meme Command
keith({
  'nomCom': "pooh",
  'reaction': '📡',
  'categorie': 'images'
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  try {
    if (!arg || arg.length === 0) {
      return repondre(zk, dest, ms, "Provide some text.");
    }
    const text = arg.join(" ");
    const imageUrl = `https://api.popcat.xyz/pooh?text1=&text2=${text}`;
    await sendMessage(zk, dest, ms, {
      image: { url: imageUrl },
      caption: "*powered by ALPHA-MD*"
    });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    repondre(zk, dest, ms, "Oops, an error occurred while processing your request");
  }
});

// Oogway Meme Command
keith({
  'nomCom': "oogway",
  'reaction': '📡',
  'categorie': 'images'
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  try {
    if (!arg || arg.length === 0) {
      return repondre(zk, dest, ms, "Provide a quote.");
    }
    const text = arg.join(" ");
    const imageUrl = `https://api.popcat.xyz/oogway?text=${text}`;
    await sendMessage(zk, dest, ms, {
      image: { url: imageUrl },
      caption: "*powered by ALPHA-MD*"
    });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    repondre(zk, dest, ms, "Oops, an error occurred while processing your request");
  }
});

// Biden Meme Command
keith({
  'nomCom': "biden",
  'reaction': '📡',
  'categorie': 'images'
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  try {
    if (!arg || arg.length === 0) {
      return repondre(zk, dest, ms, "Provide some text.");
    }
    const text = arg.join(" ");
    const imageUrl = `https://api.popcat.xyz/biden?text=${text}`;
    await sendMessage(zk, dest, ms, {
      image: { url: imageUrl },
      caption: "*powered by ALPHA-MD*"
    });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    repondre(zk, dest, ms, "Oops, an error occurred while processing your request");
  }
});

// Drip Meme Command
keith({
  'nomCom': "drip",
  'reaction': '📡',
  'categorie': 'images'
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  try {
    if (!arg || arg.length === 0) {
      return repondre(zk, dest, ms, "Provide an image URL.");
    }
    const imageUrl = `https://api.popcat.xyz/drip?image=${arg.join(" ")}`;
    await sendMessage(zk, dest, ms, {
      image: { url: imageUrl },
      caption: "*powered by ALPHA-MD*"
    });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    repondre(zk, dest, ms, "Oops, an error occurred while processing your request");
  }
});

// Clown Meme Command
keith({
  'nomCom': "clown",
  'reaction': '📡',
  'categorie': 'images'
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  try {
    if (!arg || arg.length === 0) {
      return repondre(zk, dest, ms, "Provide some text.");
    }
    const text = arg.join(" ");
    const imageUrl = `https://api.popcat.xyz/clown?text=${text}`;
    await sendMessage(zk, dest, ms, {
      image: { url: imageUrl },
      caption: "*powered by ALPHA-MD*"
    });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    repondre(zk, dest, ms, "Oops, an error occurred while processing your request");
  }
});

// Image generation command
keith({
  'nomCom': "img-generate",
  'reaction': '📡',
  'category': 'images'
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  try {
    if (!arg || arg.length === 0) {
      return repondre(zk, dest, ms, "Please enter the necessary information to generate the image.");
    }
    const prompt = arg.join(" ");
    const generatedImageUrl = "https://www.samirxpikachu.run.place/marjia?prompt=" + prompt;
    await sendMessage(zk, dest, ms, {
      image: { url: generatedImageUrl },
      caption: "*powered by ALPHA-MD*"
    });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    repondre(zk, dest, ms, "Oops, an error occurred while processing your request");
  }
});

// Image text extraction command
keith({
  'nomCom': "extract",
  'reaction': '📡',
  'category': 'images'
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  try {
    if (!arg || arg.length === 0) {
      return repondre(zk, dest, ms, "Please insert the image URL and Alpha-MD will extract the text for you.");
    }
    const imageUrl = arg.join(" ");
    const extractedTextUrl = "https://www.samirxpikachu.run.place/extract/text?url=" + imageUrl;
    await sendMessage(zk, dest, ms, {
      image: { url: extractedTextUrl },
      caption: "*powered by ALPHA-MD*"
    });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    repondre(zk, dest, ms, "Oops, an error occurred while processing your request");
  }
});

// Bing image generation command
keith({
  'nomCom': "flux",
  'reaction': '📡',
  'category': 'images'
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  try {
    if (!arg || arg.length === 0) {
      return repondre(zk, dest, ms, "Please describe your image and Alpha-MD will generate it.");
    }
    const prompt = arg.join(" ");
    const generatedImageUrl = "https://www.samirxpikachu.run.place/flux?prompt=" + prompt;
    await sendMessage(zk, dest, ms, {
      image: { url: generatedImageUrl },
      caption: "*powered by ALPHA-MD*"
    });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    repondre(zk, dest, ms, "Oops, an error occurred while processing your request");
  }
});

// Ilama image generation command
keith({
  'nomCom': "mi",
  'reaction': '📡',
  'category': 'images'
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  try {
    if (!arg || arg.length === 0) {
      return repondre(zk, dest, ms, "Please describe your image and Alpha-MD will generate it.");
    }
    const prompt = arg.join(" ");
    const generatedImageUrl = "https://www.samirxpikachu.run.place/multi/Ml?prompt=" + prompt;
    await sendMessage(zk, dest, ms, {
      image: { url: generatedImageUrl },
      caption: "*powered by ALPHA-MD*"
    });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    repondre(zk, dest, ms, "Oops, an error occurred while processing your request");
  }
});

// Beautify image command
keith({
  'nomCom': "beautify",
  'reaction': '📡',
  'category': 'images'
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  try {
    if (!arg || arg.length === 0) {
      return repondre(zk, dest, ms, "Kindly enter a valid image URL to beautify your image.");
    }
    const imageUrl = arg.join(" ");
    const beautifiedImageUrl = "https://samirxpikachuio.onrender.com/remacne?url=" + imageUrl;
    await sendMessage(zk, dest, ms, {
      image: { url: beautifiedImageUrl },
      caption: "*powered by ALPHA-MD*"
    });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    repondre(zk, dest, ms, "Oops, an error occurred while processing your request");
  }
});

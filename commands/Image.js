const { keith } = require('../keizzah/keith');
const gis = require('g-i-s');
const axios = require('axios');
const conf = require(__dirname + '/../set');

keith({
  nomCom: "sswidth",
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  try {
    const cap = `*Screenshot by Alpha Md*`;

    if (!arg[0]) {
      return repondre('Please insert a website link to take a screenshot!');
    }

    const image = `https://image.thum.io/get/width/${arg[0]}`;

    await zk.sendMessage(dest, {
      image: { url: image },
      caption: cap
    }, { quoted: ms });

  } catch (error) {
    console.error(error);
    repondre(`An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "sscrop",
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  try {
    const cap = `*Screenshot by Alpha Md*`;

    if (!arg[0]) {
      return repondre('Please insert a website link to take a screenshot!');
    }

    const image = `https://image.thum.io/get/crop/${arg[0]}`;

    await zk.sendMessage(dest, {
      image: { url: image },
      caption: cap
    }, { quoted: ms });

  } catch (error) {
    console.error(error);
    repondre(`An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "maxage",
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  try {
    const cap = `*Screenshot by Alpha Md*`;

    if (!arg[0]) {
      return repondre('Please insert a website link to take a screenshot!');
    }

    const image = `https://image.thum.io/get/maxAge/${arg[0]}`;

    await zk.sendMessage(dest, {
      image: { url: image },
      caption: cap
    }, { quoted: ms });

  } catch (error) {
    console.error(error);
    repondre(`An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "jpg",
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  try {
    const cap = `*Screenshot by Alpha Md*`;

    if (!arg[0]) {
      return repondre('Please insert a website link to take a screenshot!');
    }

    const image = `https://image.thum.io/get/allowJPG/${arg[0]}`;

    await zk.sendMessage(dest, {
      image: { url: image },
      caption: cap
    }, { quoted: ms });

  } catch (error) {
    console.error(error);
    repondre(`An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "png",
  aliases: ["ss", "sshot"],
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  try {
    const cap = `*Screenshot by Alpha Md*`;

    if (!arg[0]) {
      return repondre('Please insert a website link to take a screenshot!');
    }

    const image = `https://image.thum.io/get/png/${arg[0]}`;

    await zk.sendMessage(dest, {
      image: { url: image },
      caption: cap
    }, { quoted: ms });

  } catch (error) {
    console.error(error);
    repondre(`An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "noanimate",
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  try {
    const cap = `*Screenshot by Alpha Md*`;

    if (!arg[0]) {
      return repondre('Please insert a website link to take a screenshot!');
    }

    const image = `https://image.thum.io/get/noanimate/${arg[0]}`;

    await zk.sendMessage(dest, {
      image: { url: image },
      caption: cap
    }, { quoted: ms });

  } catch (error) {
    console.error(error);
    repondre(`An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "wait",
  aliases: ["ss", "sshot"],
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  try {
    const cap = `*Screenshot by Alpha Md*`;

    if (!arg[0]) {
      return repondre('Please insert a website link to take a screenshot!');
    }

    const image = `https://image.thum.io/get/wait/${arg[0]}`;

    await zk.sendMessage(dest, {
      image: { url: image },
      caption: cap
    }, { quoted: ms });

  } catch (error) {
    console.error(error);
    repondre(`An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "viewportwidth",
  aliases: ["ss", "sshot"],
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  try {
    const cap = `*Screenshot by Alpha Md*`;

    if (!arg[0]) {
      return repondre('Please insert a website link to take a screenshot!');
    }

    const image = `https://image.thum.io/get/viewportWidth/${arg[0]}`;

    await zk.sendMessage(dest, {
      image: { url: image },
      caption: cap
    }, { quoted: ms });

  } catch (error) {
    console.error(error);
    repondre(`An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "iphone5",
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  try {
    const cap = `*Screenshot by Alpha Md*`;

    if (!arg[0]) {
      return repondre('Please insert a website link to take a screenshot!');
    }

    const image = `https://image.thum.io/get/iphone5/${arg[0]}`;

    await zk.sendMessage(dest, {
      image: { url: image },
      caption: cap
    }, { quoted: ms });

  } catch (error) {
    console.error(error);
    repondre(`An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "iphone6",
  aliases: ["ss", "sshot"],
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  try {
    const cap = `*Screenshot by Alpha Md*`;

    if (!arg[0]) {
      return repondre('Please insert a website link to take a screenshot!');
    }

    const image = `https://image.thum.io/get/iphone6/${arg[0]}`;

    await zk.sendMessage(dest, {
      image: { url: image },
      caption: cap
    }, { quoted: ms });

  } catch (error) {
    console.error(error);
    repondre(`An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "iphone6plus",
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  try {
    const cap = `*Screenshot by Alpha Md*`;

    if (!arg[0]) {
      return repondre('Please insert a website link to take a screenshot!');
    }

    const image = `https://image.thum.io/get/iphone6plus/${arg[0]}`;

    await zk.sendMessage(dest, {
      image: { url: image },
      caption: cap
    }, { quoted: ms });

  } catch (error) {
    console.error(error);
    repondre(`An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "iphoneX",
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  try {
    const cap = `*Screenshot by Alpha Md*`;

    if (!arg[0]) {
      return repondre('Please insert a website link to take a screenshot!');
    }

    const image = `https://image.thum.io/get/iphoneX/${arg[0]}`;

    await zk.sendMessage(dest, {
      image: { url: image },
      caption: cap
    }, { quoted: ms });

  } catch (error) {
    console.error(error);
    repondre(`An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "iphone12pro",
  aliases: ["ss", "sshot"],
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  try {
    const cap = `*Screenshot by Alpha Md*`;

    if (!arg[0]) {
      return repondre('Please insert a website link to take a screenshot!');
    }

    const image = `https://image.thum.io/get/iphone12pro/${arg[0]}`;

    await zk.sendMessage(dest, {
      image: { url: image },
      caption: cap
    }, { quoted: ms });

  } catch (error) {
    console.error(error);
    repondre(`An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "iphone14promax",
  aliases: ["ss", "sshot"],
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  try {
    const cap = `*Screenshot by Alpha Md*`;

    if (!arg[0]) {
      return repondre('Please insert a website link to take a screenshot!');
    }

    const image = `https://image.thum.io/get/iphone14promax/${arg[0]}`;

    await zk.sendMessage(dest, {
      image: { url: image },
      caption: cap
    }, { quoted: ms });

  } catch (error) {
    console.error(error);
    repondre(`An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "galaxys5",
  aliases: ["ss", "sshot"],
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  try {
    const cap = `*Screenshot by Alpha Md*`;

    if (!arg[0]) {
      return repondre('Please insert a website link to take a screenshot!');
    }

    const image = `https://image.thum.io/get/galaxys5/${arg[0]}`;

    await zk.sendMessage(dest, {
      image: { url: image },
      caption: cap
    }, { quoted: ms });

  } catch (error) {
    console.error(error);
    repondre(`An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "screenshot",
  aliases: ["ss", "sshot"],
  categorie: "screenshots",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  try {
    const cap = `*Screenshot by Alpha Md*`;

    if (!arg[0]) {
      return repondre('Please insert a website link to take a screenshot!');
    }

    const image = `https://image.thum.io/get/fullpage/${arg[0]}`;

    await zk.sendMessage(dest, {
      image: { url: image },
      caption: cap
    }, { quoted: ms });

  } catch (error) {
    console.error(error);
    repondre(`An error occurred while processing the screenshot: ${error.message}`);
  }
});

keith({
  nomCom: "img",
  aliases: ["image", "images"],
  categorie: "Images",
  reaction: "📷"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  if (!arg[0]) {
    repondre('Which image?');
    return;
  }

  const searchTerm = arg.join(" ");
  gis(searchTerm, (error, results) => sendImage(error, results));

  function sendImage(error, results) {
    if (error) {
      repondre("Oops, an error occurred.");
      return;
    }

    if (!results || results.length === 0) {
      repondre("No images found.");
      return;
    }

    for (let i = 0; i < Math.min(results.length, 5); i++) {
      zk.sendMessage(dest, {
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
      }, { quoted: ms });
    }
  }
});

keith({
  nomCom: 'messi',
  categorie: 'images',
  reaction: '😋'
}, async (dest, zk, context) => {
  const { repondre: sendMessage, ms } = context;
  try {
    const response = await axios.get("https://raw.githubusercontent.com/Guru322/api/Guru/BOT-JSON/Messi.json");
    const images = response.data;

    if (!Array.isArray(images) || images.length === 0) {
      throw new Error("No images found in the response.");
    }

    for (let i = 0; i < 5; i++) {
      const randomImage = Math.floor(Math.random() * images.length);
      const image = images[randomImage];
      await zk.sendMessage(dest, {
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
      }, { quoted: ms });
    }
  } catch (error) {
    console.error("Error occurred while retrieving data:", error);
    sendMessage("Error occurred while retrieving data: " + error.message);
  }
});

keith({
  nomCom: "waifu",
  categorie: "images",
  reaction: "🙄"
}, async (origineMessage, zk, commandeOptions) => {
  const { repondre, ms } = commandeOptions;
  const url = 'https://api.waifu.pics/nsfw/waifu';

  try {
    for (let i = 0; i < 5; i++) {
      const response = await axios.get(url);
      const imageUrl = response.data.url;

      await zk.sendMessage(origineMessage, {
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
      }, { quoted: ms });
    }
  } catch (error) {
    repondre('Error retrieving data: ' + error.message);
  }
});

keith({
  nomCom: "trap",
  categorie: "images",
  reaction: "🙄"
}, async (origineMessage, zk, commandeOptions) => {
  const { repondre, ms } = commandeOptions;
  const url = 'https://api.waifu.pics/nsfw/trap';

  try {
    for (let i = 0; i < 5; i++) {
      const response = await axios.get(url);
      const imageUrl = response.data.url;

      await zk.sendMessage(origineMessage, {
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
      }, { quoted: ms });
    }
  } catch (error) {
    repondre('Error retrieving data: ' + error.message);
  }
});

keith({
  nomCom: "hneko",
  categorie: "images",
  reaction: "🙄"
}, async (origineMessage, zk, commandeOptions) => {
  const { repondre, ms } = commandeOptions;
  const url = 'https://api.waifu.pics/nsfw/neko';

  try {
    for (let i = 0; i < 5; i++) {
      const response = await axios.get(url);
      const imageUrl = response.data.url;

      await zk.sendMessage(origineMessage, {
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
      }, { quoted: ms });
    }
  } catch (error) {
    repondre('Error retrieving data: ' + error.message);
  }
});

keith({
  nomCom: "blowjob",
  categorie: "images",
  reaction: "🙄"
}, async (origineMessage, zk, commandeOptions) => {
  const { repondre, ms } = commandeOptions;
  const url = 'https://api.waifu.pics/nsfw/blowjob';

  try {
    for (let i = 0; i < 5; i++) {
      const response = await axios.get(url);
      const imageUrl = response.data.url;

      await zk.sendMessage(origineMessage, {
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
      }, { quoted: ms });
    }
  } catch (error) {
    repondre('Error retrieving data: ' + error.message);
  }
});

keith({
  'nomCom': "lulcat",
  'reaction': '📡',
  'categorie': 'images'
}, async (user, message, context) => {
  const { repondre: sendMessage, arg, ms } = context;
  try {
    if (!arg || arg.length === 0) {
      return sendMessage("Provide some text.");
    }
    const text = arg.join(" ");
    const imageUrl = `https://api.popcat.xyz/lulcat?text=${text}`;
    message.sendMessage(user, {
      'image': { 'url': imageUrl },
      'caption': "*powered by ALPHA-MD*"
    }, { 'quoted': ms });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    sendMessage("Oops, an error occurred while processing your request");
  }
});

keith({
  'nomCom': "sadcat",
  'reaction': '📡',
  'categorie': 'images'
}, async (user, message, context) => {
  const { repondre: sendMessage, arg, ms } = context;
  try {
    if (!arg || arg.length === 0) {
      return sendMessage("Provide some text.");
    }
    const text = arg.join(" ");
    const imageUrl = `https://api.popcat.xyz/sadcat?text=${text}`;
    message.sendMessage(user, {
      'image': { 'url': imageUrl },
      'caption': "*powered by ALPHA-MD*"
    }, { 'quoted': ms });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    sendMessage("Oops, an error occurred while processing your request");
  }
});

keith({
  'nomCom': "nokia",
  'reaction': '📡',
  'categorie': 'images'
}, async (user, message, context) => {
  const { repondre: sendMessage, arg, ms } = context;
  try {
    if (!arg || arg.length === 0) {
      return sendMessage("Provide some text.");
    }
    const text = arg.join(" ");
    const imageUrl = `https://api.popcat.xyz/nokia?image=${text}`;
    message.sendMessage(user, {
      'image': { 'url': imageUrl },
      'caption': "*powered by ALPHA-MD*"
    }, { 'quoted': ms });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    sendMessage("Oops, an error occurred while processing your request");
  }
});

keith({
  'nomCom': "unforgivable",
  'reaction': '📡',
  'categorie': 'images'
}, async (user, message, context) => {
  const { repondre: sendMessage, arg, ms } = context;
  try {
    if (!arg || arg.length === 0) {
      return sendMessage("Provide some text.");
    }
    const text = arg.join(" ");
    const imageUrl = `https://api.popcat.xyz/unforgivable?text=${text}`;
    message.sendMessage(user, {
      'image': { 'url': imageUrl },
      'caption': "*powered by ALPHA-MD*"
    }, { 'quoted': ms });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    sendMessage("Oops, an error occurred while processing your request");
  }
});

keith({
  'nomCom': "pooh",
  'reaction': '📡',
  'categorie': 'images'
}, async (user, message, context) => {
  const { repondre: sendMessage, arg, ms } = context;
  try {
    if (!arg || arg.length === 0) {
      return sendMessage("Provide some text.");
    }
    const text = arg.join(" ");
    const imageUrl = `https://api.popcat.xyz/pooh?text1=&text2=${text}`;
    message.sendMessage(user, {
      'image': { 'url': imageUrl },
      'caption': "*powered by ALPHA-MD*"
    }, { 'quoted': ms });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    sendMessage("Oops, an error occurred while processing your request");
  }
});

keith({
  'nomCom': "oogway",
  'reaction': '📡',
  'categorie': 'images'
}, async (user, message, context) => {
  const { repondre: sendMessage, arg, ms } = context;
  try {
    if (!arg || arg.length === 0) {
      return sendMessage("Provide a quote.");
    }
    const text = arg.join(" ");
    const imageUrl = `https://api.popcat.xyz/oogway?text=${text}`;
    message.sendMessage(user, {
      'image': { 'url': imageUrl },
      'caption': "*powered by ALPHA-MD*"
    }, { 'quoted': ms });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    sendMessage("Oops, an error occurred while processing your request");
  }
});

keith({
  'nomCom': "biden",
  'reaction': '📡',
  'categorie': 'images'
}, async (user, message, context) => {
  const { repondre: sendMessage, arg, ms } = context;
  try {
    if (!arg || arg.length === 0) {
      return sendMessage("Provide some text.");
    }
    const text = arg.join(" ");
    const imageUrl = `https://api.popcat.xyz/biden?text=${text}`;
    message.sendMessage(user, {
      'image': { 'url': imageUrl },
      'caption': "*powered by ALPHA-MD*"
    }, { 'quoted': ms });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    sendMessage("Oops, an error occurred while processing your request");
  }
});

keith({
  'nomCom': "drip",
  'reaction': '📡',
  'categorie': 'images'
}, async (user, message, context) => {
  const { repondre: sendMessage, arg, ms } = context;
  try {
    if (!arg || arg.length === 0) {
      return sendMessage("Provide an image URL.");
    }
    const imageUrl = `https://api.popcat.xyz/drip?image=${arg.join(" ")}`;
    message.sendMessage(user, {
      'image': { 'url': imageUrl },
      'caption': "*powered by ALPHA-MD*"
    }, { 'quoted': ms });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    sendMessage("Oops, an error occurred while processing your request");
  }
});

keith({
  'nomCom': "clown",
  'reaction': '📡',
  'categorie': 'images'
}, async (user, message, context) => {
  const { repondre: sendMessage, arg, ms } = context;
  try {
    if (!arg || arg.length === 0) {
      return sendMessage("Provide some text.");
    }
    const text = arg.join(" ");
    const imageUrl = `https://api.popcat.xyz/clown?text=${text}`;
    message.sendMessage(user, {
      'image': { 'url': imageUrl },
      'caption': "*powered by ALPHA-MD*"
    }, { 'quoted': ms });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    sendMessage("Oops, an error occurred while processing your request");
  }
});

keith({
  'nomCom': "img-generate",
  'reaction': '📡',
  'categorie': 'images'
}, async (user, message, context) => {
  const { repondre: sendMessage, args, messageInstance } = context;
  try {
    if (!args || args.length === 0) {
      return sendMessage("Please enter the necessary information to generate the image.");
    }
    const prompt = args.join(" ");
    const generatedImageUrl = "https://www.samirxpikachu.run.place/marjia?prompt=" + prompt;
    message.sendMessage(user, {
      'image': {
        'url': generatedImageUrl
      },
      'caption': "*powered by ALPHA-MD*"
    }, {
      'quoted': messageInstance
    });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    sendMessage("Oops, an error occurred while processing your request");
  }
});

keith({
  'nomCom': "extract",
  'reaction': '📡',
  'categorie': 'images'
}, async (user, message, context) => {
  const { repondre: sendMessage, args, messageInstance } = context;
  try {
    if (!args || args.length === 0) {
      return sendMessage("Please insert the image URL and Alpha-MD will extract the text for you.");
    }
    const imageUrl = args.join(" ");
    const extractedTextUrl = "https://www.samirxpikachu.run.place/extract/text?url=" + imageUrl;
    message.sendMessage(user, {
      'image': {
        'url': extractedTextUrl
      },
      'caption': "*powered by ALPHA-MD*"
    }, {
      'quoted': messageInstance
    });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    sendMessage("Oops, an error occurred while processing your request");
  }
});

keith({
  'nomCom': "flux",
  'reaction': '📡',
  'categorie': 'AI'
}, async (user, message, context) => {
  const { repondre: sendMessage, arg, messageInstance } = context;
  try {
        
    if (!arg || arg.length === 0) {
      return sendMessage("Please describe your image and Alpha-MD will generate it.");
    }
    const prompt = arg.join(" ");
    const generatedImageUrl = "https://apis-keith.vercel.app/ai/flux?q=" + prompt;
    message.sendMessage(user, {
      'image': {
        'url': generatedImageUrl
      },
      'caption': "*powered by ALPHA-MD*"
    }, {
      'quoted': messageInstance
    });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    sendMessage("Oops, an error occurred while processing your request");
  }
});

keith({
  'nomCom': "bing",
  'reaction': '📡',
  'categorie': 'AI'
}, async (user, message, context) => {
  const { repondre: sendMessage, arg, messageInstance } = context;
  try {
    if (!arg || arg.length === 0) {
      return sendMessage("Please describe your image and Alpha-MD will generate it.");
    }
    const prompt = arg.join(" ");
    const generatedImageUrl = "https://apis-keith.vercel.app/ai/flux?q=" + prompt;
    message.sendMessage(user, {
      'image': {
        'url': generatedImageUrl
      },
      'caption': "*powered by ALPHA-MD*"
    }, {
      'quoted': messageInstance
    });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    sendMessage("Oops, an error occurred while processing your request");
  }
});

keith({
  'nomCom': "mi",
  'reaction': '📡',
  'categorie': 'images'
}, async (user, message, context) => {
  const { repondre: sendMessage, arg, messageInstance } = context;
  try {
    if (!arg || arg.length === 0) {
      return sendMessage("Please describe your image and Alpha-MD will generate it.");
    }
    const prompt = arg.join(" ");
    const generatedImageUrl = "https://www.samirxpikachu.run.place/multi/Ml?prompt=" + prompt;
    message.sendMessage(user, {
      'image': {
        'url': generatedImageUrl
      },
      'caption': "*powered by ALPHA-MD*"
    }, {
      'quoted': messageInstance
    });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    sendMessage("Oops, an error occurred while processing your request");
  }
});

keith({
  'nomCom': "beautify",
  'reaction': '📡',
  'categorie': 'images'
}, async (user, message, context) => {
  const { repondre: sendMessage, args, messageInstance } = context;
  try {
    if (!args || args.length === 0) {
      return sendMessage("Kindly enter a valid image URL to beautify your image.");
    }
    const imageUrl = args.join(" ");
    const beautifiedImageUrl = "https://samirxpikachuio.onrender.com/remacne?url=" + imageUrl;
    message.sendMessage(user, {
      'image': {
        'url': beautifiedImageUrl
      },
      'caption': "*powered by ALPHA-MD*"
    }, {
      'quoted': messageInstance
    });
  } catch (error) {
    console.error("Error:", error.message || "An error occurred");
    sendMessage("Oops, an error occurred while processing your request");
  }
});

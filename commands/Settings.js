const { keith } = require("../keizzah/keith");
const conf = require(__dirname + "/../set");
const axios = require('axios');
const { repondre, sendMessage } = require('../keizzah/context');

// Joke Command
keith({
  nomCom: "joke",
  aliases: ["jokeapi", "getjoke"],
  desc: "Fetch a random joke from JokeAPI.",
  categorie: "fun",
  reaction: '😂',
}, async (dest, zk, context) => {
  const { ms } = context;

  try {
    const apiUrl = "https://v2.jokeapi.dev/joke/Any?type=single";
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data.error) {
      return repondre(zk, dest, ms, "❌ Error fetching joke. Please try again later.");
    }

    let jokeMessage = `😂 *Random Joke:*\n\n${data.joke}\n\n`;
    jokeMessage += `*Category:* ${data.category}\n`;
    jokeMessage += `*Safe:* ${data.safe}\n`;
    jokeMessage += `*ID:* ${data.id}\n`;

    repondre(zk, dest, ms, jokeMessage);
  } catch (error) {
    console.error("Error fetching joke:", error);
    repondre(zk, dest, ms, "❌ Error fetching joke. Please try again later.");
  }
});

// Cricket Command
keith({
  nomCom: "cricket",
  categorie: "soccer",
  desc: "Sends info of given query from Google Search.",
  reaction: "🏏",
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;

  try {
    const apiUrl = "https://api.cricapi.com/v1/currentMatches?apikey=f68d1cb5-a9c9-47c5-8fcd-fbfe52bace78";
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data || !data.data.length) {
      return repondre(zk, dest, ms, "*_Please Wait, Getting Cricket Info_*");
    }

    let text = "";

    for (let i = 0; i < data.data.length; i++) {
      text += `*--------------------- MATCH ${i + 1} -------------------*\n`;
      text += `*Match Name:* ${data.data[i].name}\n`;
      text += `*Match Status:* ${data.data[i].status}\n`;
      text += `*Match Date:* ${data.data[i].dateTimeGMT}\n`;
      text += `*Match Started:* ${data.data[i].matchStarted}\n`;
      text += `*Match Ended:* ${data.data[i].matchEnded}\n\n`;
    }

    return repondre(zk, dest, ms, text);
  } catch (error) {
    console.error("*_Uhh dear, Did not get any results!_*", error);
    return repondre(zk, dest, ms, "*_Uhh dear, Didn't get any results!_*");
  }
});

// Timezone Command
keith({
  nomCom: "timezone",
  aliases: ["timee", "datee"],
  desc: "Check the current local time and date for a specified timezone.",
  categorie: "tools",
  reaction: '🕒',
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  const timezone = arg[0];

  if (!timezone) {
    return repondre(zk, dest, ms, "❌ Please provide a timezone code. Example: .timezone TZ");
  }

  try {
    const now = new Date();
    const options = { 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit", 
      hour12: true, 
      timeZone: timezone 
    };

    const timeOptions = { 
      ...options, 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    };

    const localTime = now.toLocaleTimeString("en-US", options);
    const localDate = now.toLocaleDateString("en-US", timeOptions);

    repondre(zk, dest, ms, `🕒 Current Local Time: ${localTime}\n📅 Current Date: ${localDate}`);
  } catch (e) {
    console.error("Error in .timezone command:", e);
    repondre(zk, dest, ms, "❌ An error occurred. Please try again later.");
  }
});

// Color Command
keith({
  nomCom: "color",
  aliases: ["rcolor", "colorcode"],
  desc: "Generate a random color with name and code.",
  categorie: "coding",
  reaction: '⚔️',
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  
  try {
    const colorNames = [
      "Red", "Green", "Blue", "Yellow", "Orange", "Purple", "Pink", "Brown", "Black", "White", 
      "Gray", "Cyan", "Magenta", "Violet", "Indigo", "Teal", "Lavender", "Turquoise"
    ];
    
    const randomColorHex = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    const randomColorName = colorNames[Math.floor(Math.random() * colorNames.length)];

    repondre(zk, dest, ms, `🎨 *Random Color:* \nName: ${randomColorName}\nCode: ${randomColorHex}`);
  } catch (e) {
    console.error("Error in .color command:", e);
    repondre(zk, dest, ms, "❌ An error occurred while generating the random color.");
  }
});

// Binary Command
keith({
  nomCom: "binary",
  aliases: ["binarydgt", "binarycode"],
  desc: "Convert text into binary format",
  categorie: "coding",
  reaction: '⚔️',
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  const text = arg.join(" ");
  
  if (!text) {
    return repondre(zk, dest, ms, 'Please provide a text to convert to binary.');
  }

  try {
    const binaryText = text.split('').map(char => {
      return `00000000${char.charCodeAt(0).toString(2)}`.slice(-8);
    }).join(' ');

    repondre(zk, dest, ms, `🔑 *Binary Representation:* \n${binaryText}`);
  } catch (e) {
    console.error("Error in .binary command:", e);
    repondre(zk, dest, ms, "❌ An error occurred while converting to binary.");
  }
});

// Decode Binary Command
keith({
  nomCom: "dbinary",
  aliases: ["binarydecode", "decodebinary"],
  desc: "Decode binary string into text.",
  categorie: "coding",
  reaction: '🔓',
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  const text = arg.join(" ");
  
  if (!text) {
    return repondre(zk, dest, ms, "❌ Please provide the binary string to decode.");
  }

  try {
    const binaryString = text;
    const textDecoded = binaryString.split(' ').map(bin => {
      return String.fromCharCode(parseInt(bin, 2));
    }).join('');

    repondre(zk, dest, ms, `🔓 *Decoded Text:* \n${textDecoded}`);
  } catch (e) {
    console.error("Error in .dbinary command:", e);
    repondre(zk, dest, ms, "❌ An error occurred while decoding the binary string.");
  }
});

// Base64 Encode Command
keith({
  nomCom: "base64",
  aliases: ["base64encode", "encodebase64"],
  desc: "Encode text into Base64 format.",
  categorie: "coding",
  reaction: '🔑',
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  const text = arg.join(" ");

  if (!text) {
    return repondre(zk, dest, ms, "❌ Please provide the text to encode into Base64.");
  }

  try {
    const encodedText = Buffer.from(text).toString('base64');
    repondre(zk, dest, ms, `🔑 *Encoded Base64 Text:* \n${encodedText}`);
  } catch (e) {
    console.error("Error in .base64 command:", e);
    repondre(zk, dest, ms, "❌ An error occurred while encoding the text into Base64.");
  }
});

// Base64 Decode Command
keith({
  nomCom: "unbase64",
  aliases: ["base64decode", "decodebase64"],
  desc: "Decode Base64 encoded text.",
  categorie: "coding",
  reaction: '🔓',
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  const text = arg.join(" ");

  if (!text) {
    return repondre(zk, dest, ms, "❌ Please provide the Base64 encoded text to decode.");
  }

  try {
    const decodedText = Buffer.from(text, 'base64').toString('utf-8');
    repondre(zk, dest, ms, `🔓 *Decoded Text:* \n${decodedText}`);
  } catch (e) {
    console.error("Error in .unbase64 command:", e);
    repondre(zk, dest, ms, "❌ An error occurred while decoding the Base64 text.");
  }
});

// URL Encode Command
keith({
  nomCom: "urlencode",
  aliases: ["urlencode", "encodeurl"],
  desc: "Encode text into URL encoding.",
  categorie: "coding",
  reaction: '🔑',
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  const text = arg.join(" ");

  if (!text) {
    return repondre(zk, dest, ms, "❌ Please provide the text to encode into URL encoding.");
  }

  try {
    const encodedText = encodeURIComponent(text);
    repondre(zk, dest, ms, `🔑 *Encoded URL Text:* \n${encodedText}`);
  } catch (e) {
    console.error("Error in .urlencode command:", e);
    repondre(zk, dest, ms, "❌ An error occurred while encoding the text.");
  }
});

// URL Decode Command
keith({
  nomCom: "urldecode",
  aliases: ["decodeurl", "urldecode"],
  desc: "Decode URL encoded text.",
  categorie: "coding",
  reaction: '🔓',
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  const text = arg.join(" ");

  if (!text) {
    return repondre(zk, dest, ms, "❌ Please provide the URL encoded text to decode.");
  }

  try {
    const decodedText = decodeURIComponent(text);
    repondre(zk, dest, ms, `🔓 *Decoded Text:* \n${decodedText}`);
  } catch (e) {
    console.error("Error in .urldecode command:", e);
    repondre(zk, dest, ms, "❌ An error occurred while decoding the URL encoded text.");
  }
});

// Dice Command
keith({
  nomCom: "dice",
  aliases: ["rolldice", "diceroll", "roll"],
  desc: "Roll a dice (1-6).",
  categorie: "fun",
  reaction: '🎲',
}, async (dest, zk, context) => {
  const { ms } = context;
  
  try {
    const result = Math.floor(Math.random() * 6) + 1;
    repondre(zk, dest, ms, `🎲 You rolled: *${result}*`);
  } catch (e) {
    console.error("Error in .roll command:", e);
    repondre(zk, dest, ms, "❌ An error occurred while rolling the dice.");
  }
});

// Coinflip Command
keith({
  nomCom: "coinflip",
  aliases: ["flipcoin", "coinflip"],
  desc: "Flip a coin and get Heads or Tails.",
  categorie: "fun",
  reaction: '🪙',
}, async (dest, zk, context) => {
  const { ms } = context;
  
  try {
    const result = Math.random() < 0.5 ? "Heads" : "Tails";
    repondre(zk, dest, ms, `🪙 Coin Flip Result: *${result}*`);
  } catch (e) {
    console.error("Error in .coinflip command:", e);
    repondre(zk, dest, ms, "❌ An error occurred while flipping the coin.");
  }
});

// Flip Text Command
keith({
  nomCom: "flip",
  aliases: ["fliptext", "textflip"],
  desc: "Flip the text you provide.",
  categorie: "fun",
  reaction: '🔄',
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  const text = arg.join(" ");

  if (!text) {
    return repondre(zk, dest, ms, "❌ Please provide the text to flip.");
  }

  try {
    const flippedText = text.split('').reverse().join('');
    repondre(zk, dest, ms, `🔄 Flipped Text: *${flippedText}*`);
  } catch (e) {
    console.error("Error in .flip command:", e);
    repondre(zk, dest, ms, "❌ An error occurred while flipping the text.");
  }
});

// Pick Command
keith({
  nomCom: "pick",
  aliases: ["choose", "select"],
  desc: "Pick between two choices.",
  categorie: "fun",
  reaction: '🎉',
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  const text = arg.join(" ");

  if (!text.includes(',')) {
    return repondre(zk, dest, ms, "❌ Please provide two choices to pick from. Example: `.pick Ice Cream, Pizza`");
  }

  try {
    const options = text.split(',').map(option => option.trim());
    const choice = options[Math.floor(Math.random() * options.length)];
    repondre(zk, dest, ms, `🎉 Bot picks: *${choice}*`);
  } catch (e) {
    console.error("Error in .pick command:", e);
    repondre(zk, dest, ms, "❌ An error occurred while processing your request.");
  }
});

// Timenow Command
keith({
  nomCom: "timenow",
  aliases: ["currenttime", "time"],
  desc: "Check the current local time.",
  categorie: "tools",
  reaction: '🕒',
}, async (dest, zk, context) => {
  const { ms } = context;
  
  try {
    const now = new Date();
    const localTime = now.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit", 
      hour12: true,
      timeZone: conf.TIMEZONE,
    });
    repondre(zk, dest, ms, `🕒 Current Local Time: ${localTime}`);
  } catch (e) {
    console.error("Error in .timenow command:", e);
    repondre(zk, dest, ms, "❌ An error occurred. Please try again later.");
  }
});

// Date Command
keith({
  nomCom: "date",
  aliases: ["currentdate", "todaydate"],
  desc: "Check the current date.",
  categorie: "tools",
  reaction: '📅',
}, async (dest, zk, context) => {
  const { ms } = context;

  try {
    const now = new Date();
    const currentDate = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    repondre(zk, dest, ms, `📅 Current Date: ${currentDate}`);
  } catch (e) {
    console.error("Error in .date command:", e);
    repondre(zk, dest, ms, "❌ An error occurred. Please try again later.");
  }
});

// Calculate Command
keith({
  nomCom: "calculate",
  aliases: ["calc", "maths", "math"],
  desc: "Evaluate a mathematical expression.",
  categorie: "tools",
  reaction: '✳️',
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  const text = arg.join(" ");

  if (!text) {
    return repondre(zk, dest, ms, "✳️ Use this command like:\n *Example:* .calculate 5+3*2");
  }

  if (!/^[0-9+\-*/().\s]+$/.test(text)) {
    return repondre(zk, dest, ms, "❎ Invalid expression. Only numbers and +, -, *, /, ( ) are allowed.");
  }

  try {
    const result = eval(text);
    repondre(zk, dest, ms, `✅ Result of "${text}" is: ${result}`);
  } catch (e) {
    console.error("Error in .calculate command:", e);
    repondre(zk, dest, ms, "❎ Error in calculation. Please check your expression.");
  }
});

// Emojify Command
keith({
  nomCom: "emojify",
  aliases: ["emoji", "txtemoji"],
  desc: "Convert text into emoji form.",
  categorie: "fun",
  reaction: '🙂',
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  const text = arg.join(" ");

  if (!text) {
    return repondre(zk, dest, ms, "❌ Please provide some text to convert into emojis!");
  }

  try {
    const emojiMapping = {
      "a": "🅰️", "b": "🅱️", "c": "🇨️", "d": "🇩️", "e": "🇪️", "f": "🇫️", "g": "🇬️", "h": "🇭️", "i": "🇮️", "j": "🇯️",
      "k": "🇰️", "l": "🇱️", "m": "🇲️", "n": "🇳️", "o": "🅾️", "p": "🇵️", "q": "🇶️", "r": "🇷️", "s": "🇸️", "t": "🇹️",
      "u": "🇺️", "v": "🇻️", "w": "🇼️", "x": "🇽️", "y": "🇾️", "z": "🇿️", "0": "0️⃣", "1": "1️⃣", "2": "2️⃣", "3": "3️⃣",
      "4": "4️⃣", "5": "5️⃣", "6": "6️⃣", "7": "7️⃣", "8": "8️⃣", "9": "9️⃣", " ": "␣"
    };

    const emojiText = text.toLowerCase().split("").map(char => emojiMapping[char] || char).join("");
    await sendMessage(zk, dest, ms, { text: emojiText });
  } catch (e) {
    console.error("Error in .emoji command:", e);
    repondre(zk, dest, ms, `❌ Error: ${e.message}`);
  }
});

// News Command
keith({
  nomCom: "news",
  aliases: ["latestnews", "newsheadlines"],
  desc: "Get the latest news headlines.",
  categorie: "AI",
  reaction: '📰',
}, async (dest, zk, context) => {
  const { ms } = context;

  try {
    const apiKey = "0f2c43ab11324578a7b1709651736382";
    const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`);
    const articles = response.data.articles;

    if (!articles.length) {
      return repondre(zk, dest, ms, "No news articles found.");
    }

    for (let i = 0; i < Math.min(articles.length, 5); i++) {
      const article = articles[i];
      let message = `
📰 *${article.title}*
⚠️ _${article.description}_
🔗 _${article.url}_

© Powered by ${conf.BOT}
      `;

      if (article.urlToImage) {
        await sendMessage(zk, dest, ms, { image: { url: article.urlToImage }, caption: message });
      } else {
        await sendMessage(zk, dest, ms, { text: message });
      }
    }
  } catch (e) {
    console.error("Error fetching news:", e);
    repondre(zk, dest, ms, "Could not fetch news. Please try again later.");
  }
});

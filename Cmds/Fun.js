const { keith } = require('../commandHandler');
const fetch = require("node-fetch");

keith({
    pattern: "fliptext",
    alias: ["reverse", "textflip"],
    desc: "Flip text backwards",
    category: "Fun",
    react: "🔄",
    filename: __filename
}, async (context) => {
    try {
        const { text, reply } = context;

        if (!text) {
            return reply("❌ Please provide text to flip.");
        }

        // Flip the text
        const flippedText = text.split('').reverse().join('');

        // Send the flipped text
        reply(`🔄 *Flipped Text:*\n${flippedText}`);
    } catch (error) {
        console.error("Error in .fliptext command:", error);
        reply("❌ An unexpected error occurred while flipping the text.");
    }
});

keith({
    pattern: "fact",
    alias: ["randomfact", "didyouknow"],
    desc: "Fetch a random fun fact",
    category: "Fun",
    react: "🧠",
    filename: __filename
}, async (context) => {
    try {
        const { reply } = context;
        const API_URL = 'https://nekos.life/api/v2/fact';

        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("❌ Failed to fetch data.");

        const { fact } = await response.json();
        const factMessage = `
┏━━━ *KEITH FACT* ━━━◆                     
┃
┃   🧠 *Did you know?*  
┃   ✨ ${fact} 
┃
┃   🤖 Powered by *KEITH MD*
┃      
╭──────────────◆
│ 🚀 _Stay curious!_
╰──────────────◆
        `;

        reply(factMessage);
    } catch (error) {
        console.error("Error fetching fact:", error);
        reply("❌ An error occurred while fetching the fact.");
    }
});


keith({
    pattern: "emojify",
    alias: ["textemoji", "emojiify"],
    desc: "Convert text into emoji-stylized characters",
    category: "Fun",
    react: "🔠",
    filename: __filename
}, async (context) => {
    try {
        const { text, reply } = context;

        if (!text) {
            return reply("❌ Please provide some text to convert into emojis!");
        }

        // Map text to corresponding emoji characters
        const emojiMapping = {
            "a": "🅰️", "b": "🅱️", "c": "🇨️", "d": "🇩️", "e": "🇪️", "f": "🇫️", "g": "🇬️", "h": "🇭️",
            "i": "🇮️", "j": "🇯️", "k": "🇰️", "l": "🇱️", "m": "🇲️", "n": "🇳️", "o": "🅾️", "p": "🇵️",
            "q": "🇶️", "r": "🇷️", "s": "🇸️", "t": "🇹️", "u": "🇺️", "v": "🇻️", "w": "🇼️", "x": "🇽️",
            "y": "🇾️", "z": "🇿️", "0": "0️⃣", "1": "1️⃣", "2": "2️⃣", "3": "3️⃣", "4": "4️⃣", "5": "5️⃣",
            "6": "6️⃣", "7": "7️⃣", "8": "8️⃣", "9": "9️⃣", " ": "␣"
        };

        // Convert the input text into emoji form
        const emojiText = text.toLowerCase().split("").map(char => emojiMapping[char] || char).join("");

        reply(`🔠 *Emoji Text:*\n${emojiText}`);
    } catch (error) {
        console.error("Error in .emojify command:", error);
        reply("❌ An unexpected error occurred while converting text to emoji.");
    }
});

keith({
    pattern: "roll",
    alias: ["dice", "rolldice"],
    desc: "Roll a dice and get a random number between 1 and 6",
    category: "Fun",
    react: "🎲",
    filename: __filename
}, async (context) => {
    try {
        const { reply } = context;

        // Roll a dice (generate a random number between 1 and 6)
        const result = Math.floor(Math.random() * 6) + 1;

        // Send the result
        reply(`🎲 *You rolled:* ${result}`);
    } catch (error) {
        console.error("Error in .roll command:", error);
        reply("❌ An unexpected error occurred while rolling the dice.");
    }
});

keith({
    pattern: "coinflip",
    alias: ["flipcoin", "toss"],
    desc: "Flip a coin and get Heads or Tails",
    category: "Fun",
    react: "🪙",
    filename: __filename
}, async (context) => {
    try {
        const { reply } = context;

        // Simulate coin flip (randomly choose Heads or Tails)
        const result = Math.random() < 0.5 ? "Heads" : "Tails";

        // Send the result
        reply(`🪙 *Coin Flip Result:* ${result}`);
    } catch (error) {
        console.error("Error in .coinflip command:", error);
        reply("❌ An unexpected error occurred while flipping the coin.");
    }
});


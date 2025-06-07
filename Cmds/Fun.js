const { keith } = require('../commandHandler');
const fetch = require("node-fetch");
const axios = require('axios');
const badAdvice = require("badadvice");

keith({
    pattern: "advice",
    alias: ["randomadvice", "tip"],
    desc: "Get random humorous bad advice",
    category: "Fun",
    react: "💡",
    filename: __filename
}, async (context) => {
    try {
        const { reply } = context;
        
        // Get random bad advice
        const randomAdvice = badAdvice();
        
        // Send the advice with proper formatting
        await reply(`💡 *Bad Advice:*\n\n"${randomAdvice}"`);

    } catch (error) {
        console.error("Error in advice command:", error);
        await reply("❌ Failed to get advice. The advice giver is on break!");
    }
});
keith({
    pattern: "pick",
    alias: ["rpick", "randompick"],
    desc: "Randomly select one option from given choices",
    category: "Fun",
    react: "🎲",
    filename: __filename
}, async (context) => {
    try {
        const { m, text, reply } = context;

        if (!text || !text.includes(',')) {
            return await reply("❌ Please provide multiple choices separated by commas.\nExample: `.pick ice cream, pizza, burger`");
        }

        const options = text.split(',')
            .map(option => option.trim())
            .filter(option => option.length > 0);

        if (options.length < 2) {
            return await reply("❌ Please provide at least two valid choices to pick from.");
        }

        const choice = options[Math.floor(Math.random() * options.length)];
        await reply(`🎲 *I pick:* ${choice}`);

    } catch (error) {
        console.error("Error in pick command:", error);
        await reply("❌ An error occurred while making a selection. Please try again.");
    }
});
keith({
    pattern: "joke",
    alias: ["randomjoke", "funny"],
    desc: "Fetch a random joke",
    category: "Fun",
    react: "😂",
    filename: __filename
}, async (context) => {
    try {
        const { reply } = context;
        const apiUrl = "https://v2.jokeapi.dev/joke/Any?type=single";
        
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (data.error) {
            return reply("❌ Error fetching joke. Please try again later.");
        }

        let jokeMessage = `😂 *Random Joke:* \n\n${data.joke}\n\n`;
        jokeMessage += `🏷 *Category:* ${data.category}\n`;
        jokeMessage += `🔍 *Safe Content:* ${data.safe ? "✅ Yes" : "⚠️ No"}\n`;

        reply(jokeMessage);
    } catch (error) {
        console.error("Error in .joke command:", error);
        reply("❌ An unexpected error occurred while fetching the joke.");
    }
});


keith({
    pattern: "hack",
    alias: ["hackprank", "breech"],
    desc: "Fake hacking prank simulation",
    category: "Fun",
    react: "🌍",
    filename: __filename
}, async (context) => {
    try {
        const { m, author, botname } = context;
        const mek = m; // The message object for quoting

        // Define the steps of the prank
        const steps = [
            "```Injecting Malware```",
            "```█ 10%```",
            "```█ █ 20%```",
            "```█ █ █ 30%```",
            "```█ █ █ █ 40%```",
            "```█ █ █ █ █ 50%```",
            "```█ █ █ █ █ █ 60%```",
            "```█ █ █ █ █ █ █ 70%```",
            "```█ █ █ █ █ █ █ █ 80%```",
            "```█ █ █ █ █ █ █ █ █ 90%```",
            "```█ █ █ █ █ █ █ █ █ █ 100%```",
            "```System hijacking on process..```\n```Connecting to Server error to find 404```",
            "```Device successfully connected...\nReceiving data...```",
            "```Data hijacked from device 100% completed\nKilling all evidence, killing all malwares...```",
            "```HACKING COMPLETED```",
            "```SENDING LOG DOCUMENTS...```",
            "```SUCCESSFULLY SENT DATA AND Connection disconnected```",
            "```BACKLOGS CLEARED```",
            ````POWERED BY ${botname}````,
            ````By ${author}````
        ];

        // Send each step with a delay
        for (const line of steps) {
            await context.client.sendMessage(m.chat, { text: line }, { quoted: mek });
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }

    } catch (error) {
        console.error('Error during hack prank:', error);
        await context.client.sendMessage(m.chat, {
            text: `❌ *Error!* The hack prank failed. Reason: ${error.message}`
        });
    }
});
keith({
    pattern: "guesscountry",
    alias: ["nationality", "countrypredict"],
    desc: "Predict likely nationalities based on a name",
    category: "Fun",
    react: "🌍",
    filename: __filename
}, async (context) => {
    try {
        const { text, reply, botname } = context;

        if (!text) {
            return reply("🌍 Please provide a name to analyze.\nExample: `.guesscountry John`");
        }

        const apiUrl = `https://api.nationalize.io/?name=${encodeURIComponent(text)}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) throw new Error("❌ Failed to access nationality service.");
        
        const data = await response.json();
        
        if (!data?.country?.length) {
            return reply(`❌ No country data found for "${text}". Try another name.`);
        }

        let output = `🌍 *${botname} Country Guesser* 🌍\n\n` +
                     `✍️ *Name:* ${data.name}\n\n` +
                     `📊 *Likely Nationalities:*\n`;

        data.country.slice(0, 5).forEach((c, index) => {
            output += `${index + 1}. ${getCountryName(c.country_id)} (${(c.probability * 100).toFixed(1)}%)\n`;
        });

        output += `\n🔍 Powered by *Nationalize.io*`;

        reply(output);

    } catch (error) {
        console.error("Error in .guesscountry command:", error);
        reply("❌ An unexpected error occurred while processing the country prediction.");
    }
});

// Helper function to convert country codes to full names
function getCountryName(code) {
    const countryNames = {
        US: "United States",
        NG: "Nigeria",
        IN: "India",
        CN: "China",
        BR: "Brazil",
        GB: "United Kingdom",
        DE: "Germany",
        FR: "France",
        IT: "Italy",
        JP: "Japan",
        KE: "Kenya",
        ZA: "South Africa",
        CA: "Canada"
        // Add more country codes as needed
    };
    return countryNames[code] || code;
}

keith({
    pattern: "guessage",
    alias: ["agepredict", "estimateage"],
    desc: "Predict the age based on a given name",
    category: "Fun",
    react: "🎂",
    filename: __filename
}, async (context) => {
    try {
        const { text, reply } = context;

        if (!text) {
            return reply("❌ Please provide a name.");
        }

        const name = encodeURIComponent(text);
        const response = await fetch(`https://api.agify.io/?name=${name}`);
        const data = await response.json();

        if (!data.age) {
            return reply("❌ No valid name found. Try another.");
        }

        const messageText = `
🎂 *KEITH MD - Age Guess* 🎂
-----------------------------------
📛 *Name:* ${data.name}
📊 *Dataset Count:* ${data.count}
🧮 *Estimated Age:* ${data.age}
-----------------------------------
🔍 Powered by *Keith MD*
        `;

        reply(messageText);

    } catch (error) {
        console.error("Error fetching age estimate:", error);
        reply("❌ An unexpected error occurred while predicting the age.");
    }
});

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


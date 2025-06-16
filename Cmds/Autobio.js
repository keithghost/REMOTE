const { keith } = require('../commandHandler');
const fetch = require("node-fetch");

const toFancyUppercaseFont = (text) => {
    const fonts = {
        'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 
        'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 
        'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 
        'Y': '𝐘', 'Z': '𝐙'
    };
    return text.split('').map(char => fonts[char] || char).join('');
};

const toFancyLowercaseFont = (text) => {
    const fonts = {
        "a": "ᴀ", "b": "ʙ", "c": "ᴄ", "d": "ᴅ", "e": "ᴇ", "f": "ꜰ", "g": "ɢ", "h": "ʜ", 
        "i": "ɪ", "j": "ᴊ", "k": "ᴋ", "l": "ʟ", "m": "ᴍ", "n": "ɴ", "o": "ᴏ", "p": "ᴘ", 
        "q": "ϙ", "r": "ʀ", "s": "ꜱ", "t": "ᴛ", "u": "ᴜ", "v": "ᴠ", "w": "ᴡ", "x": "x", 
        "y": "ʏ", "z": "ᴢ"
    };
    return text.split('').map(char => fonts[char.toLowerCase()] || char).join('');
};

keith({
    pattern: "bard2",
    alias: ["bardai", "aibard"],
    desc: "Chat with AI using Keith's API",
    category: "AI",
    react: "🗿",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply } = context;

        if (!text) {
            const fancyMessage = toFancyLowercaseFont("i am an ai based on the model developed by keith. how can i assist you today? ☺️");
            return sendReply(client, m, fancyMessage);
        }

        try {
            const apiUrl = `https://apis-keith.vercel.app/ai/bard?q=${encodeURIComponent(text)}`;
            const response = await fetch(apiUrl);
            
            if (!response.ok) throw new Error("API request failed");
            
            const data = await response.json();

            if (data.status && data.result) {
                // Apply fancy font to the response
                const fancyResponse = toFancyLowercaseFont(data.result);
                await sendReply(client, m, fancyResponse);
            } else {
                throw new Error("Invalid API response");
            }
        } catch (e) {
            console.error("API Error:", e);
            const errorMessage = toFancyLowercaseFont("sorry, i encountered an error while processing your request. please try again later.");
            sendReply(client, m, errorMessage);
        }
    } catch (error) {
        console.error("Command Error:", error);
        const errorMessage = toFancyLowercaseFont("an unexpected error occurred. please try again.");
        sendReply(client, m, errorMessage);
    }
});

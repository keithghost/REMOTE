const { keith } = require('../commandHandler');
const { DateTime } = require('luxon');
const fs = require('fs');
const path = require('path');

keith({
    pattern: "menu",
    alias: ["help", "commands"],
    desc: "Show all available commands",
    category: "general",
    react: "📜",
    filename: __filename
}, async ({ client, m, prefix, commands }) => {
    try {
        // Quotes array
        const quotes = [
            "Dream big, work hard.",
            "Stay humble, hustle hard.",
            "Success is a journey, not a destination.",
            "The only limit is your imagination.",
            "Code never lies, comments sometimes do."
        ];

        // Get dynamic categories from command folders
        const getCategories = () => {
            const cmdsDir = path.join(__dirname, '..', 'Cmds');
            return fs.readdirSync(cmdsDir)
                .filter(item => fs.statSync(path.join(cmdsDir, item)).isDirectory())
                .map(cat => ({
                    name: cat,
                    emoji: '」'
                }));
        };

        const categories = getCategories();

        // Helper functions
        const getGreeting = () => {
            const currentHour = DateTime.now().setZone('Africa/Nairobi').hour;
            if (currentHour >= 5 && currentHour < 12) return 'Good morning 🌅';
            if (currentHour >= 12 && currentHour < 18) return 'Good afternoon ☀️';
            if (currentHour >= 18 && currentHour < 22) return 'Good evening 🌆';
            return 'Good night 😴';
        };

        const getCurrentTime = () => {
            return DateTime.now().setZone('Africa/Nairobi').toLocaleString(DateTime.TIME_SIMPLE);
        };

        const getRandomQuote = () => quotes[Math.floor(Math.random() * quotes.length)];

        // Text formatting functions
        const toFancyUppercase = (text) => {
            const fonts = {
                'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄',
                'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉',
                'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎',
                'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓',
                'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘',
                'Z': '𝐙'
            };
            return text.split('').map(char => fonts[char] || char).join('');
        };

        const toFancyLowercase = (text) => {
            const fonts = {
                "a": "ᴀ", "b": "ʙ", "c": "ᴄ", "d": "ᴅ", "e": "ᴇ",
                "f": "ғ", "g": "ɢ", "h": "ʜ", "i": "ɪ", "j": "ᴊ",
                "k": "ᴋ", "l": "ʟ", "m": "ᴍ", "n": "ɴ", "o": "ᴏ",
                "p": "ᴘ", "q": "ǫ", "r": "ʀ", "s": "s", "t": "ᴛ",
                "u": "ᴜ", "v": "ᴠ", "w": "ᴡ", "x": "x", "y": "ʏ",
                "z": "ᴢ"
            };
            return text.split('').map(char => fonts[char] || char).join('');
        };

        // Build menu text
        let menuText = `╭───「 *${getGreeting()} ${m.pushName || 'User'}* 」───┈⊷\n`;
        menuText += `│ *Quote*: ${getRandomQuote()}\n`;
        menuText += `│ *Time*: ${getCurrentTime()}\n`;
        menuText += `│ *Prefix*: ${prefix}\n`;
        menuText += `│ *Commands*: ${totalCommands}\n`;
        menuText += `╰───────────────────────┈⊷\n\n`;

        // Add commands by category
        let commandCount = 1;
        for (const category of categories) {
            const categoryPath = path.join(__dirname, '..', 'Cmds', category.name);
            const commands = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

            menuText += `╭───「 ${toFancyUppercase(category.name)} ${category.emoji} 」───┈⊷\n`;
            
            for (const cmd of commands) {
                const cmdName = cmd.replace('.js', '');
                menuText += `│ ${commandCount++}. ${toFancyLowercase(cmdName)}\n`;
            }
            
            menuText += `╰───────────────────────┈⊷\n`;
        }

        // Add footer
        menuText += `\n*Type ${prefix}help <command> for more info*\n`;
        menuText += `© ${client.user.name.split(' ')[0]} Bot`;

        // Send menu
        await client.sendMessage(m.chat, {
            text: menuText,
            contextInfo: {
                mentionedJid: [m.sender]
            }
        });

    } catch (error) {
        console.error("Menu error:", error);
        await client.sendMessage(m.chat, {
            text: `❌ Error generating menu: ${error.message}`
        });
    }
});

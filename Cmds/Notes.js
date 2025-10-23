const { keith } = require('../commandHandler');
const { DateTime } = require('luxon');
const fs = require('fs');
const path = require('path');

keith({
    pattern: "men",
    alias: ["hel", "command"],
    desc: "Show all available commands",
    category: "general",
    react: "📜",
    filename: __filename
}, async ({ client, m, prefix }) => {
    try {
        // Configuration
        const TIME_ZONE = 'Africa/Nairobi';
        const CMD_DIR = path.join(__dirname, '..', 'Cmds'); // Path to commands directory
        
        // Inspirational quotes
        const quotes = [
            "Code is poetry.",
            "Stay hungry, stay foolish.",
            "Simplicity is the ultimate sophistication.",
            "First solve the problem, then write the code.",
            "Make it work, make it right, make it fast."
        ];

        // Helper functions
        const getGreeting = () => {
            const hour = DateTime.now().setZone(TIME_ZONE).hour;
            if (hour < 12) return 'Good morning 🌅';
            if (hour < 18) return 'Good afternoon ☀️';
            if (hour < 22) return 'Good evening 🌆';
            return 'Good night 😴';
        };

        const getCurrentTime = () => DateTime.now().setZone(TIME_ZONE).toLocaleString(DateTime.TIME_SIMPLE);
        const getRandomQuote = () => quotes[Math.floor(Math.random() * quotes.length)];

        const toFancyText = (text, type = 'lower') => {
            const fonts = {
                lower: {
                    'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ',
                    'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ',
                    'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ',
                    'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ',
                    'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ',
                    'z': 'ᴢ'
                },
                upper: {
                    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄',
                    'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉',
                    'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎',
                    'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓',
                    'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘',
                    'Z': '𝐙'
                }
            };
            return text.split('').map(char => fonts[type][char] || char).join('');
        };

        // Get commands from commandHandler
        const commandList = require('../commandHandler').commands;
        const totalCommands = commandList.length;

        // Organize commands by category
        const commandsByCategory = {};
        commandList.forEach(cmd => {
            if (!cmd.dontAddCommandList && cmd.category) {
                if (!commandsByCategory[cmd.category]) {
                    commandsByCategory[cmd.category] = [];
                }
                commandsByCategory[cmd.category].push(cmd.pattern);
            }
        });

        // Build menu
        const greeting = getGreeting();
        const time = getCurrentTime();
        const quote = getRandomQuote();

        let menuText = `
╭───「 *${greeting} ${m.pushName || 'User'}* 」───┈⊷
│ *Quote*: ${quote}
│ *Time*: ${time}
│ *Prefix*: ${prefix}
│ *Commands*: ${totalCommands}
╰───────────────────────┈⊷\n\n`;

        // Add commands by category
        Object.entries(commandsByCategory).forEach(([category, cmds], index) => {
            menuText += `╭───「 ${toFancyText(category, 'upper')} 」───┈⊷\n`;
            cmds.forEach((cmd, i) => {
                menuText += `│ ${index + i + 1}. ${toFancyText(cmd)}\n`;
            });
            menuText += `╰───────────────────────┈⊷\n`;
        });

        menuText += `\n*Type ${prefix}help <command> for more info*\n`;
        menuText += `© ${client.user.name.split(' ')[0]} Bot`;

        // Send menu
        await client.sendMessage(m.chat, {
            text: menuText,
            contextInfo: { mentionedJid: [m.sender] }
        });

    } catch (error) {
        console.error("Menu error:", error);
        await client.sendMessage(m.chat, {
            text: `❌ Error generating menu: ${error.message}`
        });
    }
});

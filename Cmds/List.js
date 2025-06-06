const { keith } = require('../commandHandler');
const { DateTime } = require('luxon');
const path = require('path');

keith({
    pattern: "list",
    alias: ["help", "commands"],
    desc: "Show all available commands",
    category: "General",
    react: "📜",
    filename: __filename
}, async ({ client, m, prefix, url, botname }) => {
    try {
        // Configuration
        const TIME_ZONE = 'Africa/Nairobi';
        
        // Helper functions
        const getGreeting = () => {
            const hour = DateTime.now().setZone(TIME_ZONE).hour;
            if (hour < 12) return 'Good morning 🌅';
            if (hour < 18) return 'Good afternoon ☀️';
            if (hour < 22) return 'Good evening 🌆';
            return 'Good night 😴';
        };

        const getCurrentTime = () => DateTime.now().setZone(TIME_ZONE).toLocaleString(DateTime.TIME_SIMPLE);

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
                commandsByCategory[cmd.category].push({
                    pattern: cmd.pattern,
                    desc: cmd.desc || 'No description',
                    alias: cmd.alias ? cmd.alias.join(', ') : 'None'
                });
            }
        });

        // Convert categories to array for numbering
        const categories = Object.keys(commandsByCategory);
        
        // Check if this is a reply to get specific category commands
        if (m.quoted && m.quoted.id && !isNaN(m.text)) {
            const selectedNum = parseInt(m.text.trim());
            if (selectedNum > 0 && selectedNum <= categories.length) {
                const selectedCategory = categories[selectedNum - 1];
                const categoryCommands = commandsByCategory[selectedCategory];
                
                let categoryText = `╭───「 ${toFancyText(selectedCategory, 'upper')} 」───┈⊷\n`;
                categoryCommands.forEach((cmd, i) => {
                    categoryText += `││◦➛ *${prefix}${cmd.pattern}*\n`;
                    categoryText += `││◦➛ *Description*: ${cmd.desc}\n`;
                    if (cmd.alias !== 'None') {
                        categoryText += `││◦➛ *Aliases*: ${cmd.alias}\n`;
                    }
                    categoryText += `╰───────────────────────┈⊷\n\n`;
                });
                
                categoryText += `\n*Type ${prefix}help <command> for more info*\n`;
                categoryText += `© ${client.user.name.split(' ')[0]} Bot`;
                
                await client.sendMessage(m.chat, {
                    text: categoryText,
                    contextInfo: {
                        mentionedJid: [m.sender]
                    }
                }, { react: '✅' });
                return;
            }
        }

        // Build main menu
        const greeting = getGreeting();
        const time = getCurrentTime();

        let menuText = `
*╰►Hey, ${greeting} ${m.pushName || 'User'}*
╭───「  ⟮  ${botname} ⟯ ───┈⊷
┃✵╭──────────────
┃✵│ *Time*: ${time}
┃✵│ *Prefix*: ${prefix}
┃✵│ *Commands*: ${totalCommands}
┃✵╰──────────────
╰───────────────────────┈⊷\n\n`;

        // Add categories with numbers
        categories.forEach((category, index) => {
            menuText += `││◦➛ ${index + 1}. ${toFancyText(category, 'upper')}\n`;
        });

        menuText += `\n*Reply with the category number to view commands*\n`;
        menuText += `*Example: Reply with "1" for ${categories[0]} commands*\n\n`;
        menuText += `*Type ${prefix}help <command> for more info*\n`;
        menuText += `© ${client.user.name.split(' ')[0]} Bot`;

        // Send menu with image
        await client.sendMessage(m.chat, {
            image: { url },
            caption: menuText,
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: `${client.user.name} Bot Menu`,
                    body: `Get all commands information`,
                    mediaType: 2,
                    thumbnail: { url },
                    sourceUrl: ''
                }
            }
        });

    } catch (error) {
        console.error("Menu error:", error);
        await client.sendMessage(m.chat, {
            text: `❌ Error generating menu: ${error.message}`
        });
    }
});

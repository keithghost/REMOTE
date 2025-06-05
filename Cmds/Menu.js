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
}, async ({ client, m, prefix, url, botname }) => {
    try {
        // Configuration
        const TIME_ZONE = 'Africa/Nairobi';
        const CMD_DIR = path.join(__dirname, '..', 'Cmds'); // Path to commands directory

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
                commandsByCategory[cmd.category].push(cmd.pattern);
            }
        });

        // Build menu
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

        // Add commands by category
        Object.entries(commandsByCategory).forEach(([category, cmds], index) => {
            menuText += `╭───「 ${toFancyText(category, 'upper')} 」───┈⊷\n`;
            cmds.forEach((cmd, i) => {
                menuText += `││◦➛ ${index + i + 1}. ${toFancyText(cmd)}\n`;
            });
            menuText += `╰───────────────────────┈⊷\n`;
        });

        menuText += `\n*Type ${prefix}help <command> for more info*\n`;
        menuText += `© ${client.user.name.split(' ')[0]} Bot`;

        // Create contact message
        const author = client.user.name.split(' ')[0] || 'Bot';
        const customContactMessage = {
            key: { 
                fromMe: false, 
                participant: `0@s.whatsapp.net`, 
                remoteJid: 'status@broadcast' 
            },
            message: {
                contactMessage: {
                    displayName: author,
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${author};;;;\nFN:${author}\nitem1.TEL;waid=${m?.sender?.split('@')[0] ?? 'unknown'}:${m?.sender?.split('@')[0] ?? 'unknown'}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
                }
            }
        };

        // Send menu with contact card
        await client.sendMessage(m.chat, {
            image: { url },
            caption: menuText,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: `${client.user.name} Bot Menu`,
                    body: `Get all commands information`,
                    mediaType: 2,
                    thumbnail: { url },
                    mediaUrl: '',
                    sourceUrl: ''
                }
            }
        }, { quoted: customContactMessage });

    } catch (error) {
        console.error("Menu error:", error);
        await client.sendMessage(m.chat, {
            text: `❌ Error generating menu: ${error.message}`
        });
    }
});

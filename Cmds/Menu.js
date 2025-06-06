const { keith } = require('../commandHandler');
const { DateTime } = require('luxon');
const fs = require('fs');
const path = require('path');
const activeMenus = new Map();

// Font Transformations
const toFancyUppercaseFont = (text) => {
    const fonts = {
        'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉',
        'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒',
        'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙'
    };
    return text.split('').map(char => fonts[char] || char).join('');
};

const toFancyLowercaseFont = (text) => {
    const fonts = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 
        'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ϙ', 'r': 'ʀ', 's': 'ꜱ', 
        't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.split('').map(char => fonts[char] || char).join('');
};

// Utility Functions
const formatUptime = (seconds) => {
    const intervals = [
        { value: Math.floor(seconds / 86400), unit: "day" },
        { value: Math.floor((seconds % 86400) / 3600), unit: "hour" },
        { value: Math.floor((seconds % 3600) / 60), unit: "minute" },
        { value: Math.floor(seconds % 60), unit: "second" }
    ];

    return intervals
        .filter(obj => obj.value > 0)
        .map(obj => `${obj.value} ${obj.unit}${obj.value !== 1 ? 's' : ''}`)
        .join(', ');
};

const formatMemory = (bytes) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
};

// Command Management
const commandList = {};

function initializeCommands() {
    if (Object.keys(commandList).length === 0) {
        const commands = require('../commandHandler').commands;
        commands.forEach((cmd) => {
            const category = cmd.category?.toUpperCase() || 'UNCATEGORIZED';
            if (!commandList[category]) commandList[category] = [];
            commandList[category].push(cmd.pattern);
        });
    }
}

function getCategoryCommands(categoryGroups, selectedNumber) {
    const categories = Object.keys(categoryGroups);
    const selectedCategory = categories[selectedNumber - 1];
    const commandsInCategory = commandList[selectedCategory] || [];
    
    return {
        text: commandsInCategory.length > 0
            ? `╭────「 ${toFancyUppercaseFont(selectedCategory)} 」──┈⊷\n` +
              `│◦➛╭───────────────\n` +
              commandsInCategory.map((cmd, idx) => `│◦➛ ${idx + 1}. ${toFancyLowercaseFont(cmd)}`).join("\n") +
              `\n│◦➛╰─────────────\n` +
              `╰──────────────┈⊷\n\n` +
              `🔢 Total: ${commandsInCategory.length} commands | Reply "0" to return`
            : `⚠️ No commands found in ${selectedCategory}\n\n🔢 Reply "0" to return`,
        category: selectedCategory
    };
}

// Main Command
keith({
    pattern: "menu",
    alias: ["cmds", "commands"],
    desc: "Show all available commands",
    category: "general",
    react: "📜",
    filename: __filename
}, async ({ client, m, prefix, url, author }) => {
    try {
        const userId = m.sender;
        
        // Clean up existing session
        if (activeMenus.has(userId)) {
            const { handler } = activeMenus.get(userId);
            client.ev.off("messages.upsert", handler);
            activeMenus.delete(userId);
        }

        initializeCommands();
        
        // Dynamic greeting
        const hour = DateTime.now().setZone('Africa/Nairobi').hour;
        let greeting = "🌙 Good Night!";
        if (hour >= 5 && hour < 12) greeting = "🌅 Good Morning!";
        else if (hour >= 12 && hour < 18) greeting = "☀️ Good Afternoon!";
        else if (hour >= 18 && hour < 22) greeting = "🌆 Good Evening!";

        // Category groups
        const categoryGroups = {
            "AI": ["AI"],
            "AUDIO EDIT": ["AUDIO"],
            "GENERAL": ["GENERAL"],
            "FUN": ["FUN"],
            "IMAGES": ["IMAGES"],
            "MODS": ["MODS"],
            "OWNER": ["OWNER"],
            "SEARCH": ["SEARCH"],
            "SYSTEM": ["SYSTEM"],
            "TOOLS": ["TOOLS"],
            "UTILITY": ["UTILITY"]
        };

        // System info
        const formattedTime = DateTime.now().setZone('Africa/Nairobi').toLocaleString(DateTime.TIME_SIMPLE);
        const formattedDate = DateTime.now().setZone('Africa/Nairobi').toLocaleString(DateTime.DATE_FULL);
        const totalCommands = require('../commandHandler').commands.length;

        // Create contact message
        const authorName = client.user.name.split(' ')[0] || 'Bot';
        const customContactMessage = {
            key: { 
                fromMe: false, 
                participant: `0@s.whatsapp.net`, 
                remoteJid: 'status@broadcast' 
            },
            message: {
                contactMessage: {
                    displayName: authorName,
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${authorName};;;;\nFN:${authorName}\nitem1.TEL;waid=${m?.sender?.split('@')[0] ?? 'unknown'}:${m?.sender?.split('@')[0] ?? 'unknown'}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
                }
            }
        };

        // Main menu message
        const menuMessage = `
*╰► ${toFancyUppercaseFont(greeting)} ${m.pushName || 'User'}!*
╭───〔  *${toFancyUppercaseFont(client.user.name)}* 〕──────┈⊷
├──────────────
│✵│▸ 𝗣𝗿𝗲𝗳𝗶𝘅: [ ${prefix} ]
│✵│▸ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀: ${totalCommands}
│✵│▸ 𝗗𝗮𝘁𝗲: ${formattedDate}
│✵│▸ 𝗧𝗶𝗺𝗲: ${formattedTime}
╰──────────────────────⊷

╭───◇ *𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗜𝗘𝗦* ◇──────┈⊷
│「 𝗥𝗲𝗽𝗹𝘆 𝘄𝗶𝘁𝗵 𝗻𝘂𝗺𝗯𝗲𝗿𝘀 𝗯𝗲𝗹𝗼𝘄 」
${Object.keys(categoryGroups).map((cat, index) => `> │◦➛ ${index + 1}. ${toFancyUppercaseFont(cat)}`).join("\n")}
╰─────────────────────┈⊷
`.trim();

        // Send loading reaction
        await client.sendMessage(m.chat, { react: { text: '⬇️', key: m.key } });

        // Send main menu with contact card as quoted
        const sentMessage = await client.sendMessage(m.chat, {
            text: menuMessage,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363266249040649@newsletter', 
                    newsletterName: 'Keith Support',
                    serverMessageId: 143 
                },
                externalAdReply: {
                    title: `${client.user.name} Menu`,
                    body: `Get all commands information`,
                    mediaType: 2,
                    thumbnail: { url },
                    mediaUrl: '',
                    sourceUrl: ''
                }
            }
        }, { quoted: customContactMessage });

        // Send completion reaction
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        // Handler for user responses
        const replyHandler = async (update) => {
            try {
                const message = update.messages?.[0];
                if (!message?.message?.extendedTextMessage || message.key.remoteJid !== m.chat) return;

                const response = message.message.extendedTextMessage;
                const isReplyToMenu = response.contextInfo?.stanzaId === sentMessage.key.id;
                const isReplyToCategory = activeMenus.get(userId)?.lastCategoryMessage === message.key.id;

                if (!isReplyToMenu && !isReplyToCategory) return;

                const userInput = response.text.trim();
                const selectedNumber = parseInt(userInput);

                // Send loading reaction for processing
                await client.sendMessage(m.chat, { react: { text: '⏳', key: message.key } });

                // Handle back to menu command
                if (userInput === "0") {
                    await client.sendMessage(m.chat, { text: menuMessage }, { quoted: customContactMessage });
                    activeMenus.set(userId, { 
                        sentMessage, 
                        handler: replyHandler,
                        lastCategoryMessage: null
                    });
                    await client.sendMessage(m.chat, { react: { text: '🔙', key: message.key } });
                    return;
                }

                const categories = Object.keys(categoryGroups);
                if (selectedNumber < 1 || selectedNumber > categories.length) {
                    await client.sendMessage(m.chat, { 
                        text: `❌ Invalid number. Please choose between 1-${categories.length} or "0" to return`
                    }, { quoted: message });
                    await client.sendMessage(m.chat, { react: { text: '⚠️', key: message.key } });
                    return;
                }

                // Get and send category commands
                const { text: commandsText } = getCategoryCommands(categoryGroups, selectedNumber);
                const categoryMessage = await client.sendMessage(m.chat, { 
                    text: commandsText,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        externalAdReply: {
                            title: `${categories[selectedNumber - 1]} Commands`,
                            body: `Total: ${commandList[categories[selectedNumber - 1]]?.length || 0} commands`,
                            thumbnail: { url },
                            mediaType: 2
                        }
                    }
                }, { quoted: message });

                await client.sendMessage(m.chat, { react: { text: '✅', key: message.key } });

                // Update active session
                activeMenus.set(userId, { 
                    sentMessage, 
                    handler: replyHandler,
                    lastCategoryMessage: categoryMessage.key.id
                });

            } catch (error) {
                console.error("Menu handler error:", error);
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            }
        };

        // Set up listener
        client.ev.on("messages.upsert", replyHandler);
        activeMenus.set(userId, { 
            sentMessage, 
            handler: replyHandler,
            lastCategoryMessage: null
        });

        // Auto-cleanup after 10 minutes
        setTimeout(() => {
            if (activeMenus.has(userId)) {
                client.ev.off("messages.upsert", replyHandler);
                activeMenus.delete(userId);
            }
        }, 600000);

    } catch (error) {
        console.error("Menu command error:", error);
        await client.sendMessage(m.chat, {
            text: `❌ An error occurred while processing the menu command: ${error.message}`
        });
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
});

// Cleanup on exit
process.on('exit', () => {
    activeMenus.forEach(({ handler }) => {
        client.ev.off("messages.upsert", handler);
    });
    activeMenus.clear();
});

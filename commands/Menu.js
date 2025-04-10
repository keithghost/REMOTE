const { keith } = require(__dirname + "/../keizzah/keith");
const moment = require("moment-timezone");
const settings = require(__dirname + "/../set");
const { cm } = require(__dirname + "/../keizzah/keith");
const os = require("os");

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
        'a': '𝚊', 'b': '𝚋', 'c': '𝚌', 'd': '𝚍', 'e': '𝚎', 'f': '𝚏', 'g': '𝚐', 'h': '𝚑', 'i': '𝚒', 
        'j': '𝚓', 'k': '𝚔', 'l': '𝚕', 'm': '𝚖', 'n': '𝚗', 'o': '𝚘', 'p': '𝚙', 'q': '𝚚', 'r': '𝚛', 
        's': '𝚜', 't': '𝚝', 'u': '𝚞', 'v': '𝚟', 'w': '𝚠', 'x': '𝚡', 'y': '𝚢', 'z': '𝚣'
    };
    return text.split('').map(char => fonts[char] || char).join('');
};

// Inspirational Quotes
const quotes = [
    "Dream big, work hard.",
    "Stay humble, hustle hard.",
    "Believe in yourself.",
    "Success is earned, not given.",
    "Actions speak louder than words.",
    "Don't count the days, make the days count.",
    "Success is not the key to happiness. Happiness is the key to success."
];

const getRandomQuote = () => quotes[Math.floor(Math.random() * quotes.length)];

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
const activeMenus = new Map();

function initializeCommands() {
    if (Object.keys(commandList).length === 0) {
        cm.forEach((com) => {
            const category = com.categorie?.toUpperCase() || 'UNCATEGORIZED';
            if (!commandList[category]) commandList[category] = [];
            commandList[category].push(com.nomCom);
        });
    }
}

function getCategoryCommands(categoryGroups, selectedNumber) {
    const categories = Object.keys(categoryGroups);
    const selectedCategory = categories[selectedNumber - 1];
    const categoryTags = categoryGroups[selectedCategory];
    
    let commandsInCategory = [];
    categoryTags.forEach(tag => {
        commandsInCategory = commandsInCategory.concat(commandList[tag] || []);
    });

    return {
        text: commandsInCategory.length > 0
            ? `📜 *${selectedCategory}*\n\n` +
              commandsInCategory.map((cmd, idx) => `${idx + 1}. ${toFancyLowercaseFont(cmd)}`).join("\n") +
              `\n\nTotal: ${commandsInCategory.length} commands\n\n` +
              `🔢 Reply with another number or "0" to return to main menu`
            : "⚠️ No commands found in this category\n\n🔢 Reply with another number or '0' to return",
        category: selectedCategory
    };
}

// Main Command
keith({ 
    nomCom: "menu", 
    aliases: ["commands", "listcmds"], 
    categorie: "General" 
}, async (dest, zk, commandeOptions) => {
    const { nomAuteurMessage, ms, repondre, auteurMessage } = commandeOptions;
    const userId = auteurMessage;

    try {
        initializeCommands();
        moment.tz.setDefault(settings.TZ || "Africa/Nairobi");

        // Clean up existing session
        if (activeMenus.has(userId)) {
            const { handler } = activeMenus.get(userId);
            zk.ev.off("messages.upsert", handler);
            activeMenus.delete(userId);
        }

        // Dynamic greeting
        const hour = moment().hour();
        let greeting = "🌙 Good Night!";
        if (hour >= 5 && hour < 12) greeting = "🌅 Good Morning!";
        else if (hour >= 12 && hour < 18) greeting = "☀️ Good Afternoon!";
        else if (hour >= 18 && hour < 22) greeting = "🌆 Good Evening!";

        // Category groups
        const categoryGroups = {
            "AI COMMANDS": ["AI"],
            "🎵 AUDIO COMMANDS": ["AUDIO"],
            "📥 DOWNLOAD COMMANDS": ["DOWNLOAD"],
            "🛠️ TOOLS COMMANDS": ["TOOLS"],
            "😂 FUN COMMANDS": ["FUN"],
            "🎮 GAME COMMANDS": ["GAME"],
            "👥 GROUP COMMANDS": ["GROUP"],
            "🖼️ IMAGE COMMANDS": ["IMAGE"],
            "⚙️ SYSTEM COMMANDS": ["SYSTEM"],
            "🔍 SEARCH COMMANDS": ["SEARCH"],
            "🌐 WEB COMMANDS": ["WEB"]
        };

        // System info
        const formattedTime = moment().format("h:mm:ss A");
        const formattedDate = moment().format("MMMM Do YYYY");
        const mode = settings.MODE === "public" ? "Public" : "Private";
        const randomQuote = getRandomQuote();
        const totalCommands = cm.length;
        const totalMemory = formatMemory(os.totalmem());
        const usedMemory = formatMemory(os.totalmem() - os.freemem());
        const uptime = formatUptime(process.uptime());

        // Main menu message
        const menuMessage = `
╰► *${toFancyUppercaseFont(greeting)}*
      *${randomQuote}*
╭━━━ 〔  *${toFancyUppercaseFont(settings.BOT)}* 〕━━━┈⊷
⟮ 𝗥𝗲𝗽𝗹𝘆 𝘄𝗶𝘁𝗵 𝗮 𝗻𝘂𝗺𝗯𝗲𝗿 𝘁𝗼 𝗮𝗰𝗰𝗲𝘀𝘀 𝗯𝗼𝘁 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀 ⟯
┃✵╭──────────────
┃✵│▸ *ᴘʀᴇғɪx:* *[ ${settings.PREFIXE} ]*
┃✵│▸ *ᴛɪᴍᴇ:* ${formattedTime}
┃✵│▸ *ᴄᴏᴍᴍᴀɴᴅꜱ:* ${totalCommands} 
┃✵│▸ *ᴅᴀᴛᴇ:* ${formattedDate}
┃✵│▸ *ᴍᴏᴅᴇ:* ${mode}
┃✵│▸ *ᴜsᴇʀ* : ${nomAuteurMessage}
┃✵│▸ *ᴛɪᴍᴇ ᴢᴏɴᴇ:* Africa/Nairobi
┃✵│▸ *ʀᴀᴍ:* ${usedMemory}/${totalMemory}
┃✵│▸ *ᴜᴘᴛɪᴍᴇ:* ${uptime}
┃✵╰──────────────
╰━━━━━━━━━━━━━━━┈⊷

 ${greeting} Here are my command categories:
╭──────────────
 *"Reply with below numbers"*
${Object.keys(categoryGroups).map((cat, index) => `│◦➛ ${index + 1}. ${toFancyUppercaseFont(cat)}`).join("\n")}
╰──────────────
`.trim();

        // Send loading reaction
        await zk.sendMessage(dest, {
            react: { text: '⬇️', key: ms.key },
        });

        // Send main menu
        const sentMessage = await zk.sendMessage(dest, {
            text: menuMessage,
            contextInfo: {
                mentionedJid: [dest],
                externalAdReply: {
                    title: settings.BOT,
                    body: settings.OWNER_NAME,
                    thumbnailUrl: settings.URL,
                    sourceUrl: settings.GURL,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: ms });

        // Send completion reaction
        await zk.sendMessage(dest, {
            react: { text: '✅', key: ms.key },
        });

        // Handler for user responses
        const replyHandler = async (update) => {
            try {
                const message = update.messages?.[0];
                if (!message?.message?.extendedTextMessage || message.key.remoteJid !== dest) return;

                const response = message.message.extendedTextMessage;
                const isReplyToMenu = response.contextInfo?.stanzaId === sentMessage.key.id;
                const isReplyToCategory = activeMenus.get(userId)?.lastCategoryMessage === message.key.id;

                if (!isReplyToMenu && !isReplyToCategory) return;

                const userInput = response.text.trim();
                const selectedNumber = parseInt(userInput);

                // Send loading reaction for processing
                await zk.sendMessage(dest, {
                    react: { text: '⬇️', key: message.key },
                });

                // Handle back to menu command
                if (userInput === "0") {
                    await zk.sendMessage(dest, { text: menuMessage }, { quoted: message });
                    activeMenus.set(userId, { 
                        sentMessage, 
                        handler: replyHandler,
                        lastCategoryMessage: null
                    });
                    
                    // Send completion reaction
                    await zk.sendMessage(dest, {
                        react: { text: '✅', key: message.key },
                    });
                    return;
                }

                const categories = Object.keys(categoryGroups);
                if (selectedNumber < 1 || selectedNumber > categories.length) {
                    await repondre(`❌ Invalid number. Please choose between 1-${categories.length} or "0" to return`);
                    
                    // Send completion reaction
                    await zk.sendMessage(dest, {
                        react: { text: '✅', key: message.key },
                    });
                    return;
                }

                // Get and send category commands
                const { text: commandsText } = getCategoryCommands(categoryGroups, selectedNumber);
                const categoryMessage = await zk.sendMessage(dest, { 
                    text: commandsText,
                    contextInfo: {
                        mentionedJid: [dest],
                        externalAdReply: {
                            title: settings.BOT,
                            body: settings.OWNER_NAME,
                            thumbnailUrl: settings.URL,
                            sourceUrl: settings.GURL,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: message });

                // Send completion reaction
                await zk.sendMessage(dest, {
                    react: { text: '✅', key: message.key },
                });

                // Update active session
                activeMenus.set(userId, { 
                    sentMessage, 
                    handler: replyHandler,
                    lastCategoryMessage: categoryMessage.key.id
                });

            } catch (error) {
                console.error("Menu handler error:", error);
            }
        };

        // Set up listener
        zk.ev.on("messages.upsert", replyHandler);
        activeMenus.set(userId, { 
            sentMessage, 
            handler: replyHandler,
            lastCategoryMessage: null
        });

        // Auto-cleanup after 10 minutes
        setTimeout(() => {
            if (activeMenus.has(userId)) {
                zk.ev.off("messages.upsert", replyHandler);
                activeMenus.delete(userId);
            }
        }, 600000);

    } catch (error) {
        console.error("Menu command error:", error);
        await repondre("❌ An error occurred while processing the menu command.");
    }
});

// Cleanup on exit
process.on('exit', () => {
    activeMenus.forEach(({ handler }) => {
        zk.ev.off("messages.upsert", handler);
    });
    activeMenus.clear();
});

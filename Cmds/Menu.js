const { keith } = require('../commandHandler');
const fs = require('fs');
const path = require('path');
const activeMenus = new Map();

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
            ? `╭────「 ${selectedCategory} 」──┈⊷\n` +
              `│◦➛╭───────────────\n` +
              commandsInCategory.map((cmd, idx) => `│◦➛ ${idx + 1}. ${cmd}`).join("\n") +
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
    alias: ["help", "commands"],
    desc: "Show all available commands",
    category: "general",
    react: "📜",
    filename: __filename
}, async ({ client, m, prefix, url, gurl, author, pushname, botname }) => {
    try {
        const userId = m.sender;
        
        // Clean up existing session
        if (activeMenus.has(userId)) {
            const { handler } = activeMenus.get(userId);
            client.ev.off("messages.upsert", handler);
            activeMenus.delete(userId);
        }

        initializeCommands();
        
        // Category groups
        const categoryGroups = {
            "AI": ["AI"],
            "MEDIA EDIT": ["MEDIA-EDIT"],
            "GROUP": ["GROUP"],
            "CODING": ["CODING"],
            "CONVERT CMDS": ["CONVERSATION"],
            "DOWNLOAD": ["DOWNLOAD"],
            "EDITING": ["EDITING"],
            "FUN": ["FUN"],
            "GENERAL": ["GENERAL"],
            "IMAGES": ["IMAGES"],
            "MODERN-LOGO": ["MODERN-LOGO"],
            "MODS": ["MODS"],
            "OWNER": ["OWNER"],
            "REACTION": ["REACTION"],
            "SCREENSHOTS": ["SCREENSHOTS"],
            "SEARCH": ["SEARCH"],
            "SPORTS": ["SPORTS"],
            "STALKER": ["STALKER"],
            "SYSTEM": ["SYSTEM"],
            "WA CHANNEL": ["CHANNEL"],
            "TOOLS": ["TOOLS"],
            "TRADE": ["TRADE"],
            "TTS": ["TTS"],
            "UTILITY": ["UTILITY"],
            "SETTINGS": ["SETTING"]
        };

        const totalCommands = require('../commandHandler').commands.length;

        // Main menu message
        const menuMessage = `╰►Hey, ${pushname}
╭───〔  *${botname}* 〕──────┈⊷
├──────────────
│✵│▸ 𝗣𝗿𝗲𝗳𝗶𝘅: [ ${prefix} ]
│✵│▸ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀: ${totalCommands}
╰──────────────────────⊷

╭───◇ *𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗜𝗘𝗦* ◇──────┈⊷
│「 𝗥𝗲𝗽𝗹𝘆 𝘄𝗶𝘁𝗵 𝗻𝘂𝗺𝗯𝗲𝗿𝘀 𝗯𝗲𝗹𝗼𝘄 」
${Object.keys(categoryGroups).map((cat, index) => `> │◦➛ ${index + 1}. ${cat}`).join("\n")}
╰─────────────────────┈⊷
`.trim();

        // Send loading reaction
        await client.sendMessage(m.chat, { react: { text: '⬇️', key: m.key } });

        // Send main menu
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
                    title: `${botname} Menu`,
                    body: `Get all commands information`,
                    thumbnailUrl: url,
                    sourceUrl: gurl,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

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
                    await client.sendMessage(m.chat, { text: menuMessage });
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
                            thumbnailUrl: url,
                            sourceUrl: gurl,
                            mediaType: 1,
                            renderLargerThumbnail: true
          
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

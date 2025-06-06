
const { keith } = require('../commandHandler');
const moment = require('moment-timezone');
const path = require('path');

// Active menu sessions
const activeMenus = new Map();

keith({
    pattern: "greet",
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
            const hour = moment().tz(TIME_ZONE).hour();
            if (hour < 12) return 'Good morning 🌅';
            if (hour < 18) return 'Good afternoon ☀️';
            if (hour < 22) return 'Good evening 🌆';
            return 'Good night 😴';
        };

        const getCurrentTime = () => moment().tz(TIME_ZONE).format('h:mm:ss A');

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
                const category = cmd.category.toUpperCase();
                if (!commandsByCategory[category]) {
                    commandsByCategory[category] = [];
                }
                commandsByCategory[category].push({
                    pattern: cmd.pattern,
                    desc: cmd.desc || 'No description',
                    alias: cmd.alias ? cmd.alias.join(', ') : 'None'
                });
            }
        });

        // Convert categories to array for numbering
        const categories = Object.keys(commandsByCategory);
        
        // Clean up existing session
        if (activeMenus.has(m.sender)) {
            const { handler } = activeMenus.get(m.sender);
            client.ev.off('messages.upsert', handler);
            activeMenus.delete(m.sender);
        }

        // Send main menu
        await sendMainMenu();
        
        // Handler for user responses
        const replyHandler = async (update) => {
            try {
                const message = update.messages?.[0];
                if (!message?.message?.extendedTextMessage || message.key.remoteJid !== m.chat) return;

                const response = message.message.extendedTextMessage;
                const isReplyToMenu = response.contextInfo?.stanzaId === activeMenus.get(m.sender)?.menuId;
                const isReplyToCategory = response.contextInfo?.stanzaId === activeMenus.get(m.sender)?.categoryId;

                if (!isReplyToMenu && !isReplyToCategory) return;

                const userInput = message.message.extendedTextMessage.text.trim();
                const selectedNumber = parseInt(userInput);

                // Send processing reaction
                await client.sendMessage(m.chat, { react: { text: '⏳', key: message.key } });

                // Handle back to menu command
                if (userInput === "0") {
                    await sendMainMenu();
                    await client.sendMessage(m.chat, { react: { text: '🔙', key: message.key } });
                    return;
                }

                // Validate input
                if (isNaN(selectedNumber) || selectedNumber < 1 || selectedNumber > categories.length) {
                    await client.sendMessage(m.chat, { 
                        text: `❌ Invalid selection. Please reply with a number between 1-${categories.length} or 0 to go back.`,
                        react: { text: '❌', key: message.key }
                    });
                    return;
                }

                // Get selected category
                const selectedCategory = categories[selectedNumber - 1];
                await sendCategoryCommands(selectedCategory);
                await client.sendMessage(m.chat, { react: { text: '✅', key: message.key } });

            } catch (error) {
                console.error("Menu handler error:", error);
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            }
        };

        // Set up listener
        client.ev.on('messages.upsert', replyHandler);
        
        // Auto-cleanup after 10 minutes
        setTimeout(() => {
            if (activeMenus.has(m.sender)) {
                const { handler } = activeMenus.get(m.sender);
                client.ev.off('messages.upsert', handler);
                activeMenus.delete(m.sender);
            }
        }, 600000);

        async function sendMainMenu() {
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
            menuText += `*Example: Reply with "1" for ${categories[0]} commands*\n`;
            menuText += `*Reply "0" to return to this menu from any category*\n\n`;
            menuText += `*Type ${prefix}help <command> for more info*\n`;
            menuText += `© ${client.user.name.split(' ')[0]} Bot`;

            const sentMessage = await client.sendMessage(m.chat, {
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

            // Store the menu session
            activeMenus.set(m.sender, {
                menuId: sentMessage.key.id,
                categoryId: null,
                handler: replyHandler
            });
        }
        
        async function sendCategoryCommands(category) {
            const categoryCommands = commandsByCategory[category];
            
            let categoryText = `╭───「 ${toFancyText(category, 'upper')} 」───┈⊷\n`;
            categoryCommands.forEach((cmd, i) => {
                categoryText += `││◦➛ *${prefix}${cmd.pattern}*\n`;
                categoryText += `││◦➛ *Description*: ${cmd.desc}\n`;
                if (cmd.alias !== 'None') {
                    categoryText += `││◦➛ *Aliases*: ${cmd.alias}\n`;
                }
                categoryText += `╰───────────────────────┈⊷\n\n`;
            });
            
            categoryText += `\n*Reply "0" to return to main menu*\n`;
            categoryText += `© ${client.user.name.split(' ')[0]} Bot`;
            
            const sentMessage = await client.sendMessage(m.chat, {
                text: categoryText,
                contextInfo: {
                    mentionedJid: [m.sender],
                    externalAdReply: {
                        title: `${category} Commands`,
                        body: `Total: ${categoryCommands.length} commands`,
                        thumbnail: { url },
                        sourceUrl: ''
                    }
                }
            });

            // Update the session with the category message ID
            if (activeMenus.has(m.sender)) {
                const session = activeMenus.get(m.sender);
                session.categoryId = sentMessage.key.id;
                activeMenus.set(m.sender, session);
            }
        }

    } catch (error) {
        console.error("Menu error:", error);
        await client.sendMessage(m.chat, {
            text: `❌ Error generating menu: ${error.message}`,
            react: { text: '❌', key: m.key }
        });
    }
});

// Cleanup active menus on process exit
process.on('exit', () => {
    activeMenus.forEach(({ handler }) => {
        client.ev.off('messages.upsert', handler);
    });
    activeMenus.clear();
});

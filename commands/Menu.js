const { keith } = require(__dirname + "/../keizzah/keith");
const moment = require("moment-timezone");
const settings = require(__dirname + "/../set");
const { cm } = require(__dirname + "/../keizzah/keith");

// Command storage and active sessions
const commandList = {};
const activeMenus = new Map();

// Format uptime
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
              commandsInCategory.map((cmd, idx) => `${idx + 1}. ${cmd}`).join("\n") +
              `\n\nTotal: ${commandsInCategory.length} commands\n\n` +
              `🔢 Reply with another number or "0" to return to main menu`
            : "⚠️ No commands found in this category\n\n🔢 Reply with another number or '0' to return",
        category: selectedCategory
    };
}

keith({ 
    nomCom: "menu3", 
    aliases: ["help", "commands", "list"], 
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
            "🤖 AI COMMANDS": ["AI"],
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

        // Main menu message
        const menuMessage = `
╭─❖「 ${settings.BOT || "Bot"} 」❖─╮
│
│ 👤 User: ${nomAuteurMessage}
│ 📅 Date: ${moment().format("DD/MM/YYYY")}
│ ⏰ Time: ${moment().format("HH:mm:ss")}
│ 🛠️ Mode: ${settings.MODE?.toLowerCase() !== "public" ? "Private" : "Public"}
│ ⏳ Uptime: ${formatUptime(process.uptime())}
│
│ ${greeting} Here are my command categories:
│
│ 📜 Reply with a number to select:
${Object.keys(categoryGroups).map((cat, index) => `│ ${index + 1}. ${cat}`).join("\n")}
│
╰─❖「 ©${settings.OWNER_NAME || "Owner"} 」❖─╯
`.trim();

        // Send main menu
        const sentMessage = await zk.sendMessage(dest, { text: menuMessage }, { quoted: ms });

        // Handler for user responses
        const replyHandler = async (update) => {
            try {
                const message = update.messages?.[0];
                if (!message?.message?.extendedTextMessage || message.key.remoteJid !== dest) return;

                const response = message.message.extendedTextMessage;
                const currentSession = activeMenus.get(userId);
                
                // Check if reply is to either the main menu or category message
                const isReplyToMenu = response.contextInfo?.stanzaId === sentMessage.key.id;
                const isReplyToCategory = currentSession?.lastCategoryMessage === response.contextInfo?.stanzaId;

                if (!isReplyToMenu && !isReplyToCategory) return;

                const userInput = response.text.trim();

                // Handle back to menu command
                if (userInput === "0") {
                    await zk.sendMessage(dest, { text: menuMessage }, { quoted: message });
                    activeMenus.set(userId, { 
                        sentMessage, 
                        handler: replyHandler,
                        lastCategoryMessage: null
                    });
                    return;
                }

                const selectedNumber = parseInt(userInput);
                const categories = Object.keys(categoryGroups);

                // Only validate if not returning to main menu
                if (isNaN(selectedNumber) return; // Silently ignore non-number inputs
                if (selectedNumber < 1 || selectedNumber > categories.length) return; // Silently ignore out-of-range numbers

                // Get and send category commands
                const { text: commandsText, category } = getCategoryCommands(categoryGroups, selectedNumber);
                const categoryMessage = await zk.sendMessage(dest, { text: commandsText }, { quoted: message });

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
        await repondre("❌ Failed to generate menu. Please try again later.");
    }
});

// Cleanup on exit
process.on('exit', () => {
    activeMenus.forEach(({ handler }) => {
        zk.ev.off("messages.upsert", handler);
    });
    activeMenus.clear();
});

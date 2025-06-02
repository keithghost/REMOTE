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
    "✨ Dream big, work hard.",
   // "✨ Dream big, work hard.",
    "🌟 Stay humble, hustle hard.",
    "💫 Believe in yourself.",
    "🚀 Success is earned, not given.",
    "🔥 Actions speak louder than words.",
    "⏳ Don't count the days, make the days count.",
    "🌈 Success is not the key to happiness. Happiness is the key to success.",
    
    // New deep and motivational quotes
    "🌊 Smooth seas never made skilled sailors.",
    "🧠 Your mind is a powerful thing - fill it with positive thoughts.",
    "🦋 Growth begins when we step outside our comfort zone.",
    "⚡ Don't watch the clock; do what it does - keep going.",
    "🌱 Small steps every day lead to big results.",
    "🧗 The only way to fail is to stop climbing.",
    "🛤️ The road to success is always under construction.",
    "💎 Pressure creates diamonds - embrace the challenge.",
    "🕯️ Light your own path when others doubt your way.",
    "🌌 The stars you reach for are closer than they appear.",
    "🦅 Comfort is the enemy of achievement.",
    "🧩 Every struggle is part of the masterpiece.",
    "🌻 Bloom where you're planted, but never stop growing.",
    "⚓ Discipline is the bridge between goals and accomplishment.",
    "🖌️ You are the artist of your own life - paint boldly.",
    "🌄 Tomorrow belongs to those who prepare today.",
    "🦉 Wisdom comes from experience, experience from mistakes.",
    "🎯 Focus on the step in front of you, not the whole staircase.",
    "🕊️ Let go of what was, believe in what can be.",
    "🏹 Aim for the moon - even if you miss, you'll land among stars.",
      /*=== HARD WORK & PERSISTENCE ===*/
    "🛠️ Great things never come from comfort zones.",
    "🏋️ Obstacles are just weights to strengthen your resolve.",
    "⛏️ Dig deep when you're tired—that's when diamonds are formed.",
    "🧗 The summit is reserved for those who keep climbing.",
    "🚂 Success is a train that runs on the tracks of daily effort.",
    "🔨 Build your future brick by brick—no shortcuts.",
    "🦾 Strength grows in the moments when you think you can’t go on.",
    "🏗️ Rome wasn’t built in a day, but they worked daily.",
    "🪓 Chop down the tree of doubt with the axe of action.",

    /*=== MINDSET & GROWTH ===*/
    "🌵 In the desert of struggle, cacti still bloom—adapt and thrive.",
    "🧠 Your thoughts shape your reality—sculpt them wisely.",
    "🔄 Every 'no' is a redirect to a better 'yes'.",
    "🪴 Growth happens in the tension between 'I can’t' and 'I must'.",
    "🎭 You’re not stuck—you’re just in character development.",
    "📈 Compare yourself only to who you were yesterday.",
    "🧲 What you focus on expands—aim at greatness.",
    "🕰️ Time doesn’t heal wounds—growth does.",

    /*=== COURAGE & RISK ===*/
    "🎪 Life’s circus needs trapeze artists—take the leap.",
    "🪂 Fear is just the universe checking if you’re serious.",
    "⚔️ Fortune favors the bold, not the bystanders.",
    "🏴‍☠️ Ships in harbor are safe—but that’s not why ships exist.",
    "🎲 Luck is probability taken personally—roll the dice.",
    "🦁 Roar louder than your doubts.",

    /*=== PURPOSE & VISION ===*/
    "🗺️ A goal without a plan is just a wish.",
    "🔭 Adjust your focus—micro failures, macro vision.",
    "🎯 Hit the bullseye by aiming first, not shooting randomly.",
    "🧭 A wandering ship reaches no port—steer with purpose.",
    "🪐 Shoot for galaxies; even meteors catch fire.",
    "🏹 The arrow sees the target before the bow releases.",

    /*=== RESILIENCE ===*/
    "🪖 Scars are proof you showed up for battle.",
    "♻️ Breakdowns often lead to breakthroughs.",
    "🛡️ Resilience is armor forged in life’s fires.",
    "🎢 Life’s rollercoaster only throws off those who stop climbing in.",
    "🌪️ Storms teach trees to grow deeper roots.",

    /*=== INSPIRATIONAL ===*/
    "🪶 Light as a feather in commitment, solid as a mountain in discipline.",
    "🎻 Even broken violins can play symphonies when repaired.",
    "🕊️ Wings grow back stronger after molting.",
    "🎨 Turn your life’s canvas into a masterpiece—paint boldly.",
    "📜 Your story isn’t written in ink but in actions—edit daily.",

    /*=== SHORT & POWERFUL ===*/
    "⚡ Just. Start.",
    "🔥 Burn excuses. Fuel progress.",
    "⏳ Now > Later.",
    "🪙 Invest in yourself—compound interest applies.",
    "🌟 Stay humble, hustle hard.",
    "💫 Believe in yourself.",
    "🚀 Success is earned, not given.",
    "🔥 Actions speak louder than words.",
    "⏳ Don't count the days, make the days count.",
    "🌈 Success is not the key to happiness. Happiness is the key to success."
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
    
    const commandsInCategory = categoryTags.flatMap(tag => commandList[tag] || []);

    return {
        text: commandsInCategory.length > 0
            ? `╭────「 ${toFancyUppercaseFont(selectedCategory)} 」──┈⊷𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭\n` +
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
            "AI": ["AI"],
            "AUDIO EDIT": ["AUDIO-EDIT"],
            "BUG-CMDS": ["BUG-CMDS"],
            "CODING": ["CODING"],
            "CONVERT CMDS": ["CONVERSATION"],
            "DOWNLOAD": ["DOWNLOAD"],
            "EDITTING": ["EDITTING"],
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
            "UTILITY": ["SEARCH"],
            "SETTINGS": ["SETTING"],
            "HEROKU": ["HEROKU-CLIENT"]
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
        *╰► ${toFancyUppercaseFont(greeting)} ${nomAuteurMessage}!*
╭───〔  *${toFancyUppercaseFont(settings.BOT)}* 〕──────┈⊷𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭
| *motivational quote*
> ${randomQuote}
├──────────────
│✵│▸ 𝗣𝗿𝗲𝗳𝗶𝘅: [ ${settings.PREFIXE} ]
│✵│▸ 𝗠𝗼𝗱𝗲: ${mode}
│✵│▸ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀: ${totalCommands}
│✵│▸ 𝗥𝗔𝗠: ${usedMemory}/${totalMemory}
│✵│▸ 𝗨𝗽𝘁𝗶𝗺𝗲: ${uptime}
│✵│▸ 𝗗𝗮𝘁𝗲: ${formattedDate}
│✵│▸ 𝗧𝗶𝗺𝗲: ${formattedTime}
╰──────────────────────⊷


╭───◇ *𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗜𝗘𝗦* ◇──────┈⊷𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭
│「 𝗥𝗲𝗽𝗹𝘆 𝘄𝗶𝘁𝗵 𝗻𝘂𝗺𝗯𝗲𝗿𝘀 𝗯𝗲𝗹𝗼𝘄 」
${Object.keys(categoryGroups).map((cat, index) => `> │◦➛ ${index + 1}. ${toFancyUppercaseFont(cat)}`).join("\n")}
╰─────────────────────┈⊷
`.trim();

        // Send loading reaction
        await zk.sendMessage(dest, { react: { text: '⬇️', key: ms.key } });

        // Send main menu
        const sentMessage = await zk.sendMessage(dest, {
            text: menuMessage,
            contextInfo: {
                mentionedJid: [dest],
                externalAdReply: {
                    title: `${settings.BOT} Menu`,
                    body: `By ${settings.OWNER_NAME}`,
                    thumbnailUrl: settings.URL,
                    sourceUrl: settings.GURL,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: ms });

        // Send completion reaction
        await zk.sendMessage(dest, { react: { text: '✅', key: ms.key } });

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
                await zk.sendMessage(dest, { react: { text: '⏳', key: message.key } });

                // Handle back to menu command
                if (userInput === "0") {
                    await zk.sendMessage(dest, { text: menuMessage }, { quoted: message });
                    activeMenus.set(userId, { 
                        sentMessage, 
                        handler: replyHandler,
                        lastCategoryMessage: null
                    });
                    await zk.sendMessage(dest, { react: { text: '🔙', key: message.key } });
                    return;
                }

                const categories = Object.keys(categoryGroups);
                if (selectedNumber < 1 || selectedNumber > categories.length) {
                    await repondre(`❌ Invalid number. Please choose between 1-${categories.length} or "0" to return`);
                    await zk.sendMessage(dest, { react: { text: '⚠️', key: message.key } });
                    return;
                }

                // Get and send category commands
                const { text: commandsText } = getCategoryCommands(categoryGroups, selectedNumber);
                const categoryMessage = await zk.sendMessage(dest, { 
                    text: commandsText,
                    contextInfo: {
                        mentionedJid: [dest],
                        externalAdReply: {
                            title: `${categories[selectedNumber - 1]} Commands`,
                            body: `Total: ${commandList[categories[selectedNumber - 1]]?.length || 0} commands`,
                            thumbnailUrl: settings.URL,
                            sourceUrl: settings.GURL,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: message });

                await zk.sendMessage(dest, { react: { text: '✅', key: message.key } });

                // Update active session
                activeMenus.set(userId, { 
                    sentMessage, 
                    handler: replyHandler,
                    lastCategoryMessage: categoryMessage.key.id
                });

            } catch (error) {
                console.error("Menu handler error:", error);
                await zk.sendMessage(dest, { react: { text: '❌', key: ms.key } });
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
        await zk.sendMessage(dest, { react: { text: '❌', key: ms.key } });
    }
});

// Cleanup on exit
process.on('exit', () => {
    activeMenus.forEach(({ handler }) => {
        zk.ev.off("messages.upsert", handler);
    });
    activeMenus.clear();
});

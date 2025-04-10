/*const axios = require("axios");
const { keith } = require(__dirname + "/../keizzah/keith");
const { format } = require(__dirname + "/../keizzah/mesfonctions");
const os = require('os');
const moment = require("moment-timezone");
const settings = require(__dirname + "/../set");
const { sendMessage, repondre } = require(__dirname + "/../keizzah/context");

const readMore = String.fromCharCode(8206).repeat(4001);

// Function to convert text to fancy uppercase font
const toFancyUppercaseFont = (text) => {
    const fonts = {
        'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌',
        'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙'
    };
    return text.split('').map(char => fonts[char] || char).join('');
};

// Function to convert text to fancy lowercase font
const toFancyLowercaseFont = (text) => {
    const fonts = {
        'a': '𝚊', 'b': '𝚋', 'c': '𝚌', 'd': '𝚍', 'e': '𝚎', 'f': '𝚏', 'g': '𝚐', 'h': '𝚑', 'i': '𝚒', 'j': '𝚓', 'k': '𝚔', 'l': '𝚕', 'm': '𝚖',
        'n': '𝚗', 'o': '𝚘', 'p': '𝚙', 'q': '𝚚', 'r': '𝚛', 's': '𝚜', 't': '𝚝', 'u': '𝚞', 'v': '𝚟', 'w': '𝚠', 'x': '𝚡', 'y': '𝚢', 'z': '𝚣'
    };
    return text.split('').map(char => fonts[char] || char).join('');
};

const formatUptime = (seconds) => {
    seconds = Number(seconds);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return [
        days > 0 ? `${days} ${days === 1 ? "day" : "days"}` : '',
        hours > 0 ? `${hours} ${hours === 1 ? "hour" : "hours"}` : '',
        minutes > 0 ? `${minutes} ${minutes === 1 ? "minute" : "minutes"}` : '',
        remainingSeconds > 0 ? `${remainingSeconds} ${remainingSeconds === 1 ? "second" : "seconds"}` : ''
    ].filter(Boolean).join(', ');
};

const fetchGitHubStats = async () => {
    try {
        const response = await axios.get("https://api.github.com/repos/Keithkeizzah/ALPHA-MD");
        const forksCount = response.data.forks_count;
        const starsCount = response.data.stargazers_count;
        const totalUsers = forksCount * 2 + starsCount * 2;
        return { forks: forksCount, stars: starsCount, totalUsers };
    } catch (error) {
        console.error("Error fetching GitHub stats:", error);
        return { forks: 0, stars: 0, totalUsers: 0 };
    }
};

// Random quotes array
const quotes = [
    "Dream big, work hard.",
    "Stay humble, hustle hard.",
    "Believe in yourself.",
    "Success is earned, not given.",
    "Actions speak louder than words.",
    "The best is yet to come.",
    "Keep pushing forward.",
    "Do more than just exist.",
    "Progress, not perfection.",
    "Stay positive, work hard.",
    "Be the change you seek.",
    "Never stop learning.",
    "Chase your dreams.",
    "Be your own hero.",
    "Life is what you make of it.",
    "Do it with passion or not at all.",
    "You are stronger than you think.",
    "Create your own path.",
    "Make today count.",
    "Embrace the journey.",
    "The best way out is always through.",
    "Strive for progress, not perfection.",
    "Don't wish for it, work for it.",
    "Live, laugh, love.",
    "Keep going, you're getting there.",
    "Don’t stop until you’re proud.",
    "Success is a journey, not a destination.",
    "Take the risk or lose the chance.",
    "It’s never too late.",
    "Believe you can and you're halfway there.",
    "Small steps lead to big changes.",
    "Happiness depends on ourselves.",
    "Take chances, make mistakes.",
    "Be a voice, not an echo.",
    "The sky is the limit.",
    "You miss 100% of the shots you don’t take.",
    "Start where you are, use what you have.",
    "The future belongs to those who believe.",
    "Don’t count the days, make the days count.",
    "Success is not the key to happiness. Happiness is the key to success."
];

// Function to get a random quote
const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
};

keith({ nomCom: "menu", aliases: ["liste", "helplist", "commandlist"], categorie: "SYSTEM" }, async (dest, zk, commandeOptions) => {
    const { ms, prefix, nomAuteurMessage } = commandeOptions;
    const commands = require(__dirname + "/../keizzah/keith").cm;
    const categorizedCommands = {};
    const mode = settings.MODE.toLowerCase() !== "public" ? "Private" : "Public";

    // Organize commands into categories
    commands.forEach(command => {
        const category = command.categorie.toUpperCase();
        if (!categorizedCommands[category]) {
            categorizedCommands[category] = [];
        }
        categorizedCommands[category].push(command.nomCom);
    });

    moment.tz.setDefault("Africa/Nairobi");
    const currentTime = moment();
    const formattedTime = currentTime.format("HH:mm:ss");
    const formattedDate = currentTime.format("DD/MM/YYYY");
    const currentHour = currentTime.hour();

    const greetings = ["Good Morning 🌄", "Good Afternoon 🌃", "Good Evening ⛅", "Good Night 🌙"];
    const greeting = currentHour < 12 ? greetings[0] : currentHour < 17 ? greetings[1] : currentHour < 21 ? greetings[2] : greetings[3];

    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();

    const randomQuote = getRandomQuote();

    let responseMessage = `
 ${greeting}, *${nomAuteurMessage || "User"}*


*${randomQuote}*

╭━━━ 〔 *${settings.BOT}* 〕━━━┈⊷𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭
┃✵╭──────────────
┃✵│▸ *ʙᴏᴛ ᴏᴡɴᴇʀ:* ${settings.OWNER_NAME}
┃✵│▸ *ᴘʀᴇғɪx:* *[ ${settings.PREFIXE} ]*
┃✵│▸ *ᴛɪᴍᴇ:* ${formattedTime}
┃✵│▸ *ᴄᴏᴍᴍᴀɴᴅꜱ:* ${commands.length} 
┃✵│▸ *ᴅᴀᴛᴇ:* ${formattedDate}
┃✵│▸ *ᴍᴏᴅᴇ:* ${mode}
┃✵│▸ *ᴛɪᴍᴇ ᴢᴏɴᴇ:* Africa/Nairobi
┃✵│▸ *ᴛᴏᴛᴀʟ ᴜsᴇʀs:* ${formattedTotalUsers} users
┃✵│▸ *ʀᴀᴍ:* ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
┃✵│▸ *ᴜᴘᴛɪᴍᴇ:* ${formatUptime(process.uptime())}
┃✵╰──────────────
╰━━━━━━━━━━━━━━━┈⊷

*${randomQuote}*

`;

    let commandsList = "*𝐀𝐕𝐀𝐈𝐋𝐀𝐁𝐋𝐄 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒*\n";
    const sortedCategories = Object.keys(categorizedCommands).sort();
    let commandIndex = 1;

    for (const category of sortedCategories) {
        commandsList += `\n*╭────「 ${toFancyUppercaseFont(category)} 」──┈⊷𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭*\n│◦➛╭───────────────`;
        const sortedCommands = categorizedCommands[category].sort();
        for (const command of sortedCommands) {
            commandsList += `\n│◦➛ ${commandIndex++}. ${toFancyLowercaseFont(command)}`;
        }
        commandsList += "\n│◦➛╰─────────────\n╰──────────────┈⊷\n";
    }

    commandsList += readMore + "\nin honor of Alpha\n";

    try {
        await sendMessage(zk, dest, ms, {
            text: responseMessage + commandsList,
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
        });
    } catch (error) {
        console.error("Menu error: ", error);
        await repondre(zk, dest, ms, "🥵🥵 Menu error: " + error);
    }
});*/
const { keith } = require(__dirname + "/../keizzah/keith");
const moment = require("moment-timezone");
const settings = require(__dirname + "/../set");
const { repondre } = require(__dirname + "/../keizzah/context");

// Command storage (only stored once)
const commandList = {};
let commandsStored = false;

// Function to format uptime
const formatUptime = (seconds) => {
    seconds = Number(seconds);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return [
        days > 0 ? `${days} ${days === 1 ? "day" : "days"}` : '',
        hours > 0 ? `${hours} ${hours === 1 ? "hour" : "hours"}` : '',
        minutes > 0 ? `${minutes} ${minutes === 1 ? "minute" : "minutes"}` : '',
        remainingSeconds > 0 ? `${remainingSeconds} ${remainingSeconds === 1 ? "second" : "seconds"}` : ''
    ].filter(Boolean).join(', ');
};

keith({ 
    nomCom: "menu3", 
    aliases: ["help", "commands", "list"], 
    categorie: "General" 
}, async (dest, zk, commandeOptions) => {
    const { nomAuteurMessage, ms, repondre } = commandeOptions;
    const { cm } = require(__dirname + "/../keizzah/keith");

    // Store commands only once
    if (!commandsStored) {
        cm.forEach((com) => {
            const category = com.categorie.toUpperCase();
            if (!commandList[category]) commandList[category] = [];
            commandList[category].push(com.nomCom);
        });
        commandsStored = true;
    }

    moment.tz.setDefault(settings.TZ || "Africa/Nairobi");
    const date = moment().format("DD/MM/YYYY");
    const time = moment().format("HH:mm:ss");
    const mode = settings.MODE.toLowerCase() !== "public" ? "Private" : "Public";

    // Dynamic greeting based on time
    const hour = moment().hour();
    let greeting = "🌙 Good Night!";
    if (hour >= 5 && hour < 12) greeting = "🌅 Good Morning!";
    else if (hour >= 12 && hour < 18) greeting = "☀️ Good Afternoon!";
    else if (hour >= 18 && hour < 22) greeting = "🌆 Good Evening!";

    // Define your category groups
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

    // Generate the main menu message
    const menuMessage = `
╭─❖「 ${settings.BOT} 」❖─╮
│
│ 👤 User: ${nomAuteurMessage}
│ 📅 Date: ${date}
│ ⏰ Time: ${time}
│ 🛠️ Mode: ${mode}
│ ⏳ Uptime: ${formatUptime(process.uptime())}
│
│ ${greeting} Here are my command categories:
│
│ 📜 Reply with a number to select:
${Object.keys(categoryGroups).map((cat, index) => `│ ${index + 1}. ${cat}`).join("\n")}
│
╰─❖「 ©${settings.OWNER_NAME} 」❖─╯
`;

    // Send the main menu
    const sentMessage = await zk.sendMessage(zk, dest, {
        text: menuMessage
    }, { quoted: ms });

    // Listen for category selection
    zk.ev.on("messages.upsert", async (update) => {
        const message = update.messages[0];
        if (!message.message || !message.message.extendedTextMessage) return;

        const response = message.message.extendedTextMessage;
        if (response.contextInfo && response.contextInfo.stanzaId === sentMessage.key.id) {
            const selectedNumber = parseInt(response.text.trim());
            const categories = Object.keys(categoryGroups);

            // Validate input
            if (isNaN(selectedNumber)) {
                return repondre("❌ Please reply with a number from the list");
            }

            if (selectedNumber < 1 || selectedNumber > categories.length) {
                return repondre(`❌ Invalid number. Please choose between 1-${categories.length}`);
            }

            // Get selected category
            const selectedCategory = categories[selectedNumber - 1];
            const categoryTags = categoryGroups[selectedCategory];
            
            // Collect all commands in these categories
            let commandsInCategory = [];
            categoryTags.forEach(tag => {
                if (commandList[tag]) {
                    commandsInCategory = commandsInCategory.concat(commandList[tag]);
                }
            });

            // Format the commands list
            const commandsList = commandsInCategory.length > 0 
                ? `📜 *${selectedCategory}*\n\n` +
                  commandsInCategory.map((cmd, idx) => `${idx + 1}. ${cmd}`).join("\n") +
                  `\n\nTotal: ${commandsInCategory.length} commands`
                : "⚠️ No commands found in this category";

            // Send the commands list
            await zk.sendMessage(dest, {
                text: commandsList
            }, { quoted: message });
        }
    });
});

const fs = require('fs');
const zlib = require('zlib');
const { session } = require("./settings");
const chalk = require('chalk');
const path = require('path');
const { DateTime } = require("luxon");
const util = require("util");
const speed = require("performance-now");
const axios = require("axios");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const express = require("express");
const { smsg } = require('./lib/smsg');
const { useMultiFileAuthState, DisconnectReason, makeInMemoryStore } = require("@whiskeysockets/baileys");

// Custom chalk colors
const keithPurple = chalk.hex('#A020F0');
const keithBlue = chalk.hex('#1DA1F2');
const keithPink = chalk.hex('#FF69B4');
const keithGreen = chalk.hex('#2ECC71');
const keithOrange = chalk.hex('#FFA500');
const keithGold = chalk.hex('#FFD700');
const keithRed = chalk.hex('#E74C3C');
const keithYellow = chalk.hex('#F1C40F');

// Unicode symbols
const BOT_SYMBOL = '✦';
const MESSAGE_SYMBOL = '✉';
const USER_SYMBOL = '👤';
const GROUP_SYMBOL = '👥';
const TYPE_SYMBOL = '📋';
const CONTENT_SYMBOL = '📝';
const ERROR_SYMBOL = '⚠️';
const SUCCESS_SYMBOL = '✅';
const WARNING_SYMBOL = '⚠️';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Enhanced logger class
class KeithLogger {
    static logMessage(m) {
        const verifGroupe = m.isGroup;
        const nomGroupe = m.isGroup ? m.chat : '';
        const nomAuteurMessage = m.pushName || 'Unknown';
        const auteurMessage = m.sender;
        const mtype = m.mtype;
        const texte = m.text || '';

        console.log(keithPurple.bold(`\t ${BOT_SYMBOL} ${BOT_SYMBOL} ${BOT_SYMBOL} { K E I T H - M D } ${BOT_SYMBOL} ${BOT_SYMBOL} ${BOT_SYMBOL}`));
        console.log(keithGold.bold("╔════════════════════════════╗"));
        console.log(keithGold.bold(`║ ${MESSAGE_SYMBOL}   N E W   M E S S A G E   ${MESSAGE_SYMBOL} ║`));
        console.log(keithGold.bold("╚════════════════════════════╝"));
        
        if (verifGroupe) {
            console.log(keithGreen(`${GROUP_SYMBOL} Message from: `) + keithBlue.bold(nomGroupe));
        }
        
        console.log(keithGreen(`${USER_SYMBOL} Sender: `) + 
            keithPink.bold(`[${nomAuteurMessage}] `) + 
            keithOrange(`(${auteurMessage.split("@s.whatsapp.net")[0]})`));
        
        console.log(keithGreen(`${TYPE_SYMBOL} Type: `) + keithBlue.bold(mtype));
        
        console.log(keithGold.bold("┌────────────────────────────┐"));
        console.log(keithGreen(`${CONTENT_SYMBOL} Content:`));
        console.log(keithGold.bold("├────────────────────────────┤"));
        console.log(chalk.whiteBright(texte));
        console.log(keithGold.bold("└────────────────────────────┘"));
        
        // Log to daily file
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(logsDir, `messages_${today}.log`);
        const logEntry = `[${new Date().toISOString()}] ${verifGroupe ? `Group: ${nomGroupe} | ` : ''}Sender: ${nomAuteurMessage} (${auteurMessage.split("@s.whatsapp.net")[0]}) | Type: ${mtype} | Content: ${texte}\n`;
        fs.appendFileSync(logFile, logEntry);
    }

    static error(message, error) {
        console.log(keithRed.bold(`${ERROR_SYMBOL} [ERROR] ${message}`));
        if (error) {
            console.log(keithRed(error.stack || error.message));
        }
        
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(logsDir, `errors_${today}.log`);
        const logEntry = `[${new Date().toISOString()}] [ERROR] ${message}\n${error ? (error.stack || error.message) : ''}\n`;
        fs.appendFileSync(logFile, logEntry);
    }

    static success(message) {
        console.log(keithGreen.bold(`${SUCCESS_SYMBOL} [SUCCESS] ${message}`));
        
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(logsDir, `success_${today}.log`);
        const logEntry = `[${new Date().toISOString()}] [SUCCESS] ${message}\n`;
        fs.appendFileSync(logFile, logEntry);
    }

    static warning(message) {
        console.log(keithYellow.bold(`${WARNING_SYMBOL} [WARNING] ${message}`));
        
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(logsDir, `warnings_${today}.log`);
        const logEntry = `[${new Date().toISOString()}] [WARNING] ${message}\n`;
        fs.appendFileSync(logFile, logEntry);
    }

    static info(message) {
        console.log(keithBlue.bold(`[INFO] ${message}`));
        
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(logsDir, `info_${today}.log`);
        const logEntry = `[${new Date().toISOString()}] [INFO] ${message}\n`;
        fs.appendFileSync(logFile, logEntry);
    }
}

async function authenticationn() {
    try {
        const credsPath = "./session/creds.json";

        if (!fs.existsSync(credsPath)) {
            KeithLogger.info("Connecting to WhatsApp...");

            const [header, b64data] = session.split(';;;');

            if (header === "KEITH" && b64data) {
                let compressedData = Buffer.from(b64data.replace('...', ''), 'base64');
                let decompressedData = zlib.gunzipSync(compressedData);
                fs.writeFileSync(credsPath, decompressedData, "utf8");
                KeithLogger.success("Session credentials created successfully");
            } else {
                throw new Error("Invalid session format");
            }
        } else if (session !== "zokk") {
            KeithLogger.info("Updating existing session...");

            const [header, b64data] = session.split(';;;');

            if (header === "KEITH" && b64data) {
                let compressedData = Buffer.from(b64data.replace('...', ''), 'base64');
                let decompressedData = zlib.gunzipSync(compressedData);
                fs.writeFileSync(credsPath, decompressedData, "utf8");
                KeithLogger.success("Session credentials updated successfully");
            } else {
                throw new Error("Invalid session format");
            }
        }
    } catch (error) {
        KeithLogger.error("Session authentication failed", error);
        return;
    }
}

authenticationn();

const {
    default: KeithConnect, BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent,
    generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType, downloadContentFromMessage, jidDecode
} = require("@whiskeysockets/baileys");

const FileType = require("file-type");
const { exec } = require("child_process");
const app = express();
const port = process.env.PORT || 10000;

// Initialize database tables
const { initAntiCallDB } = require('./database/anticall');
const { initAutoBioDB } = require('./database/autobio');
const { initAutoDownloadStatusDB } = require('./database/autodownloadstatus');
const { initAntiLinkDB } = require('./database/antilink');
const { initAutoLikeStatusDB } = require('./database/autolikestatus');
const { initAntiBadDB } = require('./database/antibad');
const { initAutoViewDB } = require('./database/autoview');
const { initAntiDeleteDB } = require('./database/antidelete');
const { initPresenceDB } = require('./database/presence');
const { initAutoReadDB } = require('./database/autoread');

// Initialize all databases
async function initializeDatabases() {
    try {
        await initAutoReadDB();
        await initAutoViewDB();
        await initAntiLinkDB();
        await initAntiDeleteDB();
        await initAutoLikeStatusDB();
        await initPresenceDB();
        await initAntiBadDB();
        await initAutoDownloadStatusDB();
        await initAutoBioDB();
        await initAntiCallDB();
        KeithLogger.success("All databases initialized successfully");
    } catch (error) {
        KeithLogger.error("Database initialization failed", error);
    }
}

initializeDatabases().catch(console.error);

const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });
const daddy = "254748387615@s.whatsapp.net";

// Settings
const {
    autoview, autostatusreply, autostatusmsg, permit, autoread, botname, chatbot, timezone, autobio, mode, anticallmsg, reactemoji, prefix, presence,
    mycode, author, antibad, autodownloadstatus, packname, url, voicechatbot2, gurl, herokuAppname, greet, greetmsg, herokuapikey, anticall, dev, antilink, gcpresence, antibot, antitag, antidelete, autolike, voicechatbot
} = require("./settings");

//const groupEvents = require("./groupEvents.js");
const googleTTS = require('google-tts-api');

// Command handler
const { keith, commands, loadCommands } = require('./commandHandler');

// Helper functions
function getGroupAdmins(participants) {
    let admins = [];
    for (let i of participants) {
        if (i.admin === "superadmin") admins.push(i.id);
        if (i.admin === "admin") admins.push(i.id);
    }
    return admins || [];
}

async function startKeith() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const client = KeithConnect({
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        version: [2, 3000, 1023223821],
        browser: ["KEITH-MD", "Safari", "3.0"],
        fireInitQueries: false,
        shouldSyncHistoryMessage: true,
        downloadHistory: true,
        syncFullHistory: true,
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: true,
        keepAliveIntervalMs: 30000,
        auth: state,
        getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg.message || undefined;
            }
            return { conversation: "HERE" };
        },
    });

    store.bind(client.ev);

    // Load all commands
    await loadCommands();
    KeithLogger.info(`Loaded ${commands.length} commands`);

    // Auto-bio handler
    let bioInterval;
    async function setupAutoBio() {
        const { getAutoBioSettings } = require('./database/autobio');
        const settings = await getAutoBioSettings();
        
        if (bioInterval) clearInterval(bioInterval);
        
        if (settings.status) {
            bioInterval = setInterval(async () => {
                try {
                    await client.updateProfileStatus(settings.message);
                    KeithLogger.info('Auto-bio updated');
                } catch (error) {
                    KeithLogger.error('Error updating bio:', error);
                }
            }, settings.interval * 1000);
        }
    }

    // Initialize auto-bio
    setupAutoBio().catch(console.error);

    // Call handler
    let lastTextTime = 0;
    const messageDelay = 5000;

    client.ev.on('call', async (callData) => {
        try {
            const { getAntiCallSettings } = require('./database/anticall');
            const settings = await getAntiCallSettings();
            
            if (settings.status) {
                const callId = callData[0].id;
                const callerId = callData[0].from;

                if (settings.action === 'block') {
                    await client.updateBlockStatus(callerId, 'block');
                } else {
                    await client.rejectCall(callId, callerId);
                }

                const currentTime = Date.now();
                if (currentTime - lastTextTime >= messageDelay) {
                    await client.sendMessage(callerId, { text: settings.message });
                    lastTextTime = currentTime;
                } else {
                    KeithLogger.info('Message skipped to prevent overflow');
                }
            }
        } catch (error) {
            KeithLogger.error('Error handling call:', error);
        }
    });

    // Message handler
    client.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            mek.message = mek.message.ephemeralMessage?.message || mek.message;
            
            // Log the message
            const m = smsg(client, mek, store);
            KeithLogger.logMessage(m);

            const idBot = client.decodeJid(client.user.id);
            
            if (!client.public && !mek.key.fromMe && chatUpdate.type === "notify") return;

            const body = m.mtype === "conversation" ? m.message.conversation :
                m.mtype === "imageMessage" ? m.message.imageMessage.caption :
                    m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text : "";

            const cmd = body.startsWith(prefix);
            const args = body.trim().split(/ +/).slice(1);
            const pushname = m.pushName || "No Name";
            const botNumber = await client.decodeJid(client.user.id);
            const servBot = botNumber.split('@')[0];
            const Ghost = "254796299159"; 
            const Ghost2 = "254110190196";
            const Ghost3 = "254748387615";
            const Ghost4 = "254786989022";
            const superUserNumbers = [servBot, Ghost, Ghost2, Ghost3, Ghost4, dev].map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net");
            const isOwner = superUserNumbers.includes(m.sender); 
            const isBotMessage = m.sender === botNumber;  
            const itsMe = m.sender === botNumber;
            const text = args.join(" ");
            const Tag = m.mtype === "extendedTextMessage" && m.message.extendedTextMessage.contextInfo != null
                ? m.message.extendedTextMessage.contextInfo.mentionedJid
                : [];

            let msgKeith = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
            let budy = typeof m.text === "string" ? m.text : "";

            const timestamp = speed();
            const Keithspeed = speed() - timestamp;

            const quoted = m.quoted || m;
            const mime = quoted.mimetype || "";
            const qmsg = quoted;
            const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch(() => {}) : "";
            const participants = m.isGroup && groupMetadata ? groupMetadata.participants : [];
            const groupAdmin = m.isGroup ? getGroupAdmins(participants) : [];
            const isBotAdmin = m.isGroup ? groupAdmin.includes(botNumber) : false;
            const isAdmin = m.isGroup ? groupAdmin.includes(m.sender) : false;

            // Handle commands
            if (cmd) {
                const command = body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase();
                
                // Find command by pattern or alias
                const cmdObj = commands.find(c => 
                    c.pattern === command || 
                    (c.alias && c.alias.includes(command))
                );

                if (cmdObj) {
                    try {
                        // Send reaction if defined
                        if (cmdObj.react) {
                            await client.sendMessage(m.chat, { 
                                react: { 
                                    text: cmdObj.react, 
                                    key: mek.key 
                                } 
                            });
                        }

                        // Execute command
                        await cmdObj.function({
                            client,
                            m,
                            args,
                            command,
                            text,
                            quoted,
                            isOwner,
                            isAdmin,
                            isBotAdmin,
                            groupMetadata,
                            participants,
                            pushname,
                            store,
                            // Add other context properties as needed
                        });

                        KeithLogger.info(`Command executed: ${cmdObj.pattern}`);
                    } catch (error) {
                        KeithLogger.error(`Error executing command ${cmdObj.pattern}:`, error);
                        await m.reply("❌ An error occurred while executing this command.");
                    }
                }
            }
        } catch (err) {
            KeithLogger.error("Error processing message", err);
        }
    });

    // Group events
    client.ev.on("group-participants.update", (m) => groupEvents(client, m));

    // Connection updates
    client.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            const reasons = {
                [DisconnectReason.badSession]: "Bad Session File, Please Delete Session and Scan Again",
                [DisconnectReason.connectionClosed]: "Connection closed, reconnecting...",
                [DisconnectReason.connectionLost]: "Connection Lost from Server, reconnecting...",
                [DisconnectReason.connectionReplaced]: "Connection Replaced, Another New Session Opened, Please Restart Bot",
                [DisconnectReason.loggedOut]: "Device Logged Out, Please Delete File creds.json and Scan Again",
                [DisconnectReason.restartRequired]: "Restart Required, Restarting...",
                [DisconnectReason.timedOut]: "Connection TimedOut, Reconnecting...",
            };
            
            const reasonMessage = reasons[reason] || `Unknown DisconnectReason: ${reason}`;
            if (reason === DisconnectReason.badSession || reason === DisconnectReason.connectionReplaced || reason === DisconnectReason.loggedOut) {
                KeithLogger.error(reasonMessage);
                process.exit();
            } else {
                KeithLogger.warning(reasonMessage);
                startKeith();
            }
        } else if (connection === "open") {
            await client.newsletterFollow("120363266249040649@newsletter");

            KeithLogger.success("Connected to Keith server");
            KeithLogger.success("Bot is now active");

            const getGreeting = () => {
                const currentHour = DateTime.now().setZone("Africa/Nairobi").hour;
                if (currentHour >= 5 && currentHour < 12) return "Good morning 🌄";
                if (currentHour >= 12 && currentHour < 18) return "Good afternoon ☀️";
                if (currentHour >= 18 && currentHour < 22) return "Good evening 🌆";
                return "Good night 😴";
            };

            const message = `Holla, ${getGreeting()},\n\n╭═══『 ${botname} 𝐢𝐬 𝐜𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝』══⊷ \n` +
                `║ ʙᴏᴛ ᴏᴡɴᴇʀ ${author}\n` +
                `║ ᴍᴏᴅᴇ ${mode}\n` +
                `║ ᴘʀᴇғɪx [  ${prefix} ]\n` +
                `║ ᴛᴏᴛᴀʟ ᴘʟᴜɢɪɴs ${commands.length}\n` +
                `║ ᴛɪᴍᴇ ${DateTime.now().setZone("Africa/Nairobi").toLocaleString(DateTime.TIME_SIMPLE)}\n` +
                `║ ʟɪʙʀᴀʀʏ Baileys\n` +
                `╰═════════════════⊷`;

            await client.sendMessage(client.user.id, { text: message });
            KeithLogger.info(message);
        }
    });

    client.ev.on("creds.update", saveCreds);

    // Helper methods
    client.sendText = (jid, text, quoted = "", options) => client.sendMessage(jid, { text, ...options }, { quoted });

    client.downloadMediaMessage = async (message) => {
        const mime = (message.msg || message).mimetype || "";
        const messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];
        const stream = await downloadContentFromMessage(message, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    };

    client.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        const quoted = message.msg || message;
        const mime = (message.msg || message).mimetype || "";
        const messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];
        const stream = await downloadContentFromMessage(quoted, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        const type = await FileType.fromBuffer(buffer);
        const trueFileName = attachExtension ? `${filename}.${type.ext}` : filename;
        await fs.writeFileSync(trueFileName, buffer);
        return trueFileName;
    };
}

// Web server
app.use(express.static("public"));
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
app.listen(port, () => KeithLogger.info(`Server listening on port http://localhost:${port}`));

// Start the bot
startKeith().catch(error => {
    KeithLogger.error("Failed to start bot", error);
    process.exit(1);
});

// Watch for file changes
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    KeithLogger.warning(`Update detected in ${__filename}`);
    delete require.cache[file];
    require(file);
});

module.exports = startKeith;

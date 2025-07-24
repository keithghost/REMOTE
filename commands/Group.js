const { keith } = require("../keizzah/keith");
const { downloadMediaMessage, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { exec } = require('child_process');
const { writeFile } = require("fs/promises");
const fs = require('fs-extra');
const moment = require("moment-timezone");
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { default: axios } = require('axios');
const { repondre, sendMessage } = require('../keizzah/context');
const conf = require(__dirname + "/../set");
//========================================================================================================================
//========================================================================================================================
keith({ 
  nomCom: "tagall", 
  categorie: 'Group', 
  reaction: "📣" 
}, async (dest, zk, commandeOptions) => {
  const { ms, arg, nomGroupe, repondre, infosGroupe, nomAuteurMessage } = commandeOptions;

  const metadata = await zk.groupMetadata(dest);
  if (!metadata) {
    return repondre("✋🏿 This command is reserved for groups ❌");
  }

  const mess = arg?.join(' ') || 'No message provided';
  const membresGroupe = metadata.participants;

  let tag = `========================\n🌟 *ALPHA-MD* 🌟\n========================\n👥 Group: ${nomGroupe} 🚀\n👤 Author: *${nomAuteurMessage}* 👋\n📜 Message: *${mess}* 📝\n========================\n\n`;

  const emoji = ['🦴', '👀', '😮‍💨', '❌', '✔️', '😇', '⚙️', '🔧', '🎊', '😡', '🙏🏿', '⛔️', '$', '😟', '🥵', '🐅'];
  const random = Math.floor(Math.random() * emoji.length);

  // Standardize all JIDs and collect mentions
  const mentions = [];
  membresGroupe.forEach(membre => {
    const standardizedJid = standardizeJid(membre.id);
    if (standardizedJid) {
      const baseId = standardizedJid.split('@')[0];
      tag += `${emoji[random]} @${baseId}\n`;
      mentions.push(standardizedJid);
    }
  });

  await repondre({
    text: tag,
    mentions: mentions
  });
});

function standardizeJid(jid) {
  if (!jid) return '';
  try {
    jid = typeof jid === 'string' ? jid : 
         (jid.decodeJid ? jid.decodeJid() : String(jid));
    jid = jid.split(':')[0].split('/')[0];
    if (!jid.includes('@')) {
      jid += '@s.whatsapp.net';
    } else if (jid.endsWith('@lid')) {
      return jid.toLowerCase();
    }
    return jid.toLowerCase();
  } catch (e) {
    console.error("JID standardization error:", e);
    return '';
  }
}

function decodeJid(jid) {
  if (!jid) return jid;
  if (/:\d+@/gi.test(jid)) {
    let decode = (0, baileys_1.jidDecode)(jid) || {};
    return decode.user && decode.server ? decode.user + '@' + decode.server : jid;
  }
  return jid;
}

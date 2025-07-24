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
const baseJid = jid => jid.split('@')[0];

keith({ 
  nomCom: "tagall", 
  categorie: 'Group', 
  reaction: "📣" 
}, async (dest, zk, commandeOptions) => {
  const { ms, arg, nomGroupe, repondre, infosGroupe, nomAuteurMessage, superUser } = commandeOptions;

  const metadata = await zk.groupMetadata(dest);
  if (!metadata) {
    return repondre("✋🏿 This command is reserved for groups ❌");
  }

  // Only allow admins or super users
  const isUserAdmin = await isAdmin(zk, dest, commandeOptions.auteurMessage);
  if (!isUserAdmin && !superUser) {
    return repondre('Command reserved for admins');
  }

  const mess = arg && arg.length > 0 ? arg.join(' ') : 'No message provided';
  const membresGroupe = metadata.participants;

  let tag = `========================\n🌟 *ALPHA-MD* 🌟\n========================\n👥 Group: ${nomGroupe} 🚀\n👤 Author: *${nomAuteurMessage}* 👋\n📜 Message: *${mess}* 📝\n========================\n\n`;

  const emoji = ['🦴', '👀', '😮‍💨', '❌', '✔️', '😇', '⚙️', '🔧', '🎊', '😡', '🙏🏿', '⛔️', '$', '😟', '🥵', '🐅'];
  const random = Math.floor(Math.random() * (emoji.length - 1));

  membresGroupe.forEach(membre => {
    tag += `${emoji[random]} @${baseJid(membre.id)}\n`;
  });

  // Using repondre instead of sendMessage
  await repondre({
    text: tag,
    mentions: membresGroupe.map((i) => i.id)
  });
});

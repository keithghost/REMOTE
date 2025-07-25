const { keith } = require("../keizzah/keith");
const { downloadMediaMessage, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { exec } = require('child_process');
const { writeFile } = require("fs/promises");
const fs = require('fs-extra');
const moment = require("moment-timezone");
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { default: axios } = require('axios');

const conf = require(__dirname + "/../set");
//========================================================================================================================
//========================================================================================================================
// Tagall Command
keith({ nomCom: "tagall", categorie: 'Group', reaction: "📣" }, async (dest, zk, commandeOptions) => {
  const { ms, arg, nomGroupe, infosGroupe, repondre, nomAuteurMessage, superUser } = commandeOptions;

  const metadata = await zk.groupMetadata(dest);
  if (!metadata) {
    return repondre("✋🏿 This command is reserved for groups ❌");
  }

  const mess = arg && arg.length > 0 ? arg.join(' ') : 'No message provided';
  const membresGroupe = metadata.participants;

  let tag = `========================\n🌟 *ALPHA-MD* 🌟\n========================\n👥 Group: ${nomGroupe} 🚀\n👤 Author: *${nomAuteurMessage}* 👋\n📜 Message: *${mess}* 📝\n========================\n\n`;

  const emoji = ['🦴', '👀', '😮‍💨', '❌', '✔️', '😇', '⚙️', '🔧', '🎊', '😡', '🙏🏿', '⛔️', '$', '😟', '🥵', '🐅'];
  const random = Math.floor(Math.random() * (emoji.length - 1));

  membresGroupe.forEach(membre => {
    // Get just the display name without @lid
    const displayName = membre.id.split('@')[0];
    tag += `${emoji[random]} @${displayName}\n`;
  });

  await zk.sendMessage(dest, {
    text: tag,
    mentions: membresGroupe.map((i) => i.id) // Still using full JID for mentions
  });
});
//========================================================================================================================
//========================================================================================================================

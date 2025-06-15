
const { keith } = require('../commandHandler');
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');
const { S_WHATSAPP_NET } = require('@whiskeysockets/baileys');
const fs = require("fs");

keith({
  pattern: "fullpp",
  alias: ["setppfull", "setprofile"],
  desc: "Update bot full profile picture from quoted image",
  category: "Owner",
  react: "🖼️",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, generateProfilePicture, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.imageMessage) {
        return reply("❌ Please quote a valid image to set as full profile picture.");
      }

      const media = msgKeith.imageMessage;
      const downloadedPath = await client.downloadAndSaveMediaMessage(media);
      const { img } = await generateProfilePicture(downloadedPath);

      await client.query({
        tag: 'iq',
        attrs: {
          to: S_WHATSAPP_NET,
          type: 'set',
          xmlns: 'w:profile:picture'
        },
        content: [{
          tag: 'picture',
          attrs: { type: 'image' },
          content: img
        }]
      });

      fs.unlinkSync(downloadedPath);
      reply("✅ Bot profile picture updated successfully.");

    } catch (error) {
      console.error("Error setting full profile picture:", error);
      reply("❌ Failed to update profile picture. Please try again.");
    }
  });
});

keith({
  pattern: "blocklist",
  alias: ["blocked", "blockedusers"],
  desc: "List all blocked contacts by JID",
  category: "Owner",
  react: "📛",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, reply } = context;

    try {
      const blocklist = await client.fetchBlocklist();

      if (!blocklist || blocklist.length === 0) {
        return reply("✅ You have no blocked contacts.");
      }

      await reply(`🔒 You have blocked *${blocklist.length}* contact(s):`);

      let result = `*Blocked Contacts:*\n\n`;
      blocklist.forEach((jid, i) => {
        const number = jid.split('@')[0];
        result += `${i + 1}. +${number}\n`;
      });

      await m.reply(result);

    } catch (err) {
      console.error("Error fetching blocklist:", err);
      return reply("❌ Failed to fetch blocked contacts. Please try again.");
    }
  });
});

keith({
  pattern: "vcard",
  alias: ["contactcard", "savecontact"],
  desc: "Generate a VCard from quoted user's contact",
  category: "Owner",
  react: "📇",
  filename: __filename
}, async (context) => {
  try {
    const { client, m, text, reply } = context;

    if (!m.quoted) {
      return reply("❌ Please quote a message from the person whose contact you want to save.");
    }

    if (!text) {
      return reply("❌ Please provide a name for the VCard. Example: `.vcard Brian`");
    }

    const name = text.trim();
    const jid = m.quoted.sender;
    const number = jid?.split('@')[0];

    if (!number) {
      return reply("❌ Couldn't extract the contact number. Try again with a valid quoted message.");
    }

    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${name}`,
      'ORG:undefined;',
      `TEL;type=CELL;type=VOICE;waid=${number}:${number}`,
      'END:VCARD'
    ].join('\n');

    await client.sendMessage(m.chat, {
      contacts: {
        displayName: name,
        contacts: [{ vcard }],
      }
    }, { quoted: m });

  } catch (err) {
    console.error("Error in vcard command:", err);
    return reply("❌ An unexpected error occurred while generating the VCard.");
  }
});

keith({
  pattern: "save",
  alias: ["savestatus"],
  desc: "Save quoted status image, video, or audio",
  category: "Owner",
  react: "💾",
  filename: __filename
}, async (context) => {
  try {
    const { client, m, reply } = context;
    const quotedMessage = m.msg?.contextInfo?.quotedMessage;
    const fromStatus = m.quoted?.chat?.includes("status@broadcast");

    if (!quotedMessage || !fromStatus) {
      return reply("You did not tag a status media to save.");
    }

    if (quotedMessage.imageMessage) {
      const imageCaption = quotedMessage.imageMessage.caption || "";
      const imagePath = await client.downloadAndSaveMediaMessage(quotedMessage.imageMessage);
      await client.sendMessage(m.chat, { image: { url: imagePath }, caption: imageCaption }, { quoted: m });
    }

    if (quotedMessage.videoMessage) {
      const videoCaption = quotedMessage.videoMessage.caption || "";
      const videoPath = await client.downloadAndSaveMediaMessage(quotedMessage.videoMessage);
      await client.sendMessage(m.chat, { video: { url: videoPath }, caption: videoCaption }, { quoted: m });
    }

    if (quotedMessage.audioMessage) {
      const audioPath = await client.downloadAndSaveMediaMessage(quotedMessage.audioMessage);
      await client.sendMessage(m.chat, { audio: { url: audioPath }, mimetype: 'audio/mpeg' }, { quoted: m });
    }

  } catch (err) {
    console.error("Error in save command:", err);
    return reply("❌ Couldn't save the status media. Check the media and try again.");
  }
});

keith({
  pattern: "vv",
  alias: ["wow", "retrieve"],
  desc: "Retrieve media message including image, video, and audio",
  category: "Owner",
  react: "⬇️",
  filename: __filename
}, async (context) => {
  try {
    const { client, m, reply } = context;
    const quotedMessage = m.msg?.contextInfo?.quotedMessage;

    if (!quotedMessage) return reply("No quoted media found to retrieve.");

    if (quotedMessage.imageMessage) {
      const imageCaption = quotedMessage.imageMessage.caption || "";
      const imagePath = await client.downloadAndSaveMediaMessage(quotedMessage.imageMessage);
      await client.sendMessage(m.chat, { image: { url: imagePath }, caption: imageCaption }, { quoted: m });
    }

    if (quotedMessage.videoMessage) {
      const videoCaption = quotedMessage.videoMessage.caption || "";
      const videoPath = await client.downloadAndSaveMediaMessage(quotedMessage.videoMessage);
      await client.sendMessage(m.chat, { video: { url: videoPath }, caption: videoCaption }, { quoted: m });
    }

    if (quotedMessage.audioMessage) {
      const audioPath = await client.downloadAndSaveMediaMessage(quotedMessage.audioMessage);
      await client.sendMessage(m.chat, { audio: { url: audioPath }, mimetype: 'audio/mpeg' }, { quoted: m });
    }

  } catch (err) {
    console.error("Error in vv command:", err);
    return reply("❌ Failed to retrieve media. Please try again.");
  }
});
keith({
  pattern: "vv2",
  alias: ["amazing", "lovely"],
  desc: "Retrieve media message including image, video, and audio",
  category: "Owner",
  react: "⬇️",
  filename: __filename
}, async (context) => {
  try {
    const { client, m, reply } = context;
    const quotedMessage = m.msg?.contextInfo?.quotedMessage;

    if (!quotedMessage) return reply("No quoted media found to retrieve.");

    if (quotedMessage.imageMessage) {
      const imageCaption = quotedMessage.imageMessage.caption || "";
      const imagePath = await client.downloadAndSaveMediaMessage(quotedMessage.imageMessage);
      await client.sendMessage(m.sender, { image: { url: imagePath }, caption: imageCaption }, { quoted: m });
    }

    if (quotedMessage.videoMessage) {
      const videoCaption = quotedMessage.videoMessage.caption || "";
      const videoPath = await client.downloadAndSaveMediaMessage(quotedMessage.videoMessage);
      await client.sendMessage(m.sender, { video: { url: videoPath }, caption: videoCaption }, { quoted: m });
    }

    if (quotedMessage.audioMessage) {
      const audioPath = await client.downloadAndSaveMediaMessage(quotedMessage.audioMessage);
      await client.sendMessage(m.sender, { audio: { url: audioPath }, mimetype: 'audio/mpeg' }, { quoted: m });
    }

  } catch (err) {
    console.error("Error in vv command:", err);
    return reply("❌ Failed to retrieve media. Please try again.");
  }
});

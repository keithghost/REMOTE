
const { keith } = require('../commandHandler');
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');
const { S_WHATSAPP_NET } = require('@whiskeysockets/baileys');
const fs = require("fs");


keith({
  pattern: "delete",
  alias: ["del", "d"],
  desc: "Delete a message sent by the bot",
  category: "Owner",
  react: "🗑️",
  filename: __filename
}, async (context) => {
  const { client, m, prefix, sendReply } = context;

  try {
    const quoted = m.quoted;

    if (!quoted) {
      return sendReply(client, m, "❌ Please quote a message sent by the bot to delete.");
    }

    if (quoted.fromMe === false) {
      return sendReply(client, m, `⚠️ I cannot delete messages sent by others. You can still delete using *${prefix}delete* if you sent it.`);
    }

    await quoted.delete();
  } catch (err) {
    console.error("❌ Error deleting message:", err);
    return sendReply(client, m, "Failed to delete the message. Try again.");
  }
});

keith({
  pattern: "profile",
  alias: ["whois", "ppinfo"],
  desc: "Fetch user's profile picture and about info",
  category: "Owner",
  react: "🧾",
  filename: __filename
}, async (context) => {
  const { client, m, reply } = context;

  try {
    const target = m.quoted?.sender || m.sender;
    const displayName = m.quoted ? `@${target.split("@")[0]}` : m.pushName;

    let ppUrl;
    try {
      ppUrl = await client.profilePictureUrl(target, 'image');
    } catch {
      ppUrl = "https://telegra.ph/file/95680cd03e012bb08b9e6.jpg"; // Fallback image
    }

    let about;
    try {
      const status = await client.fetchStatus(target);
      about = status.status || "No about info.";
    } catch {
      about = "About not accessible due to user privacy.";
    }

    const message = {
      image: { url: ppUrl },
      caption: `*Name*: ${displayName}\n*About*: ${about}`,
      ...(m.quoted && { mentions: [target] })
    };

    await client.sendMessage(m.chat, message, { quoted: m });

  } catch (error) {
    console.error("Error fetching profile:", error);
    reply("❌ Failed to retrieve profile information.");
  }
});


keith({
  pattern: "mygroups",
  alias: ["listgroups", "groupz"],
  desc: "List all groups the bot is participating in",
  category: "Owner",
  react: "👥",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, reply } = context;

    try {
      const groupData = await client.groupFetchAllParticipating();
      const groups = Object.values(groupData);

      if (groups.length === 0) {
        return reply("🤖 Bot is currently not part of any groups.");
      }

      await reply(`📦 Bot is in *${groups.length}* group(s). Fetching details...`);

      let result = `*📋 My Groups:*\n\n`;

      for (const group of groups) {
        result += `📌 *Subject*: ${group.subject}\n👥 *Members*: ${group.participants.length}\n🔗 *JID*: ${group.id}\n\n`;
      }

      await m.reply(result);

    } catch (error) {
      console.error("Error fetching group list:", error);
      reply(`❌ Failed to fetch group list:\n${error.message}`);
    }
  });
});

keith({
  pattern: "rpp",
  alias: ["removepp", "delpp"],
  desc: "Remove bot's profile picture",
  category: "Owner",
  react: "🚫",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, reply } = context;

    try {
      await client.rPP();
      reply("✅ Profile picture removed successfully.");
    } catch (error) {
      console.error("Error removing profile picture:", error);
      reply("❌ Failed to remove profile picture. Please try again later.");
    }
  });
});

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


const { keith } = require('../commandHandler');
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');
const { S_WHATSAPP_NET } = require('@whiskeysockets/baileys');
const fs = require("fs");

keith({
    pattern: "kick",
    alias: ["remove", "kik"],
    desc: "Kick a user from the group by mention, quote, or number",
    category: "Owner",
    react: "🥾",
    filename: __filename
}, async (context) => {
    try {
        await ownerMiddleware(context, async () => {
            const { client, m, text, reply } = context;

           // if (!isGroup) return reply("🚫 This command can only be used in groups.");

            const target =
                m.mentionedJid?.[0] ||
                m.quoted?.sender ||
                (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

            if (!target) {
                return reply("👥 Please tag, quote, or provide a number to kick.");
            }

            const jidBase = target.split('@')[0];

            await client.groupParticipantsUpdate(m.chat, [target], "remove");
            reply(`🥾 User @${jidBase} has been *kicked* from the group.`, undefined, {
                mentions: [target]
            });
        });
    } catch (error) {
        console.error("Kick command error:", error);
        context.reply("❌ Failed to remove the user. I might lack admin rights.");
    }
});

keith({
    pattern: "privacy",
    alias: ["privstatus", "pps"],
    desc: "Display current privacy settings of the bot",
    category: "Control",
    react: "🔐",
    filename: __filename
}, async (context) => {
    try {
        await ownerMiddleware(context, async () => {
            const { client, m, reply } = context;

            const botJid = await client.decodeJid(client.user.id);

            const {
                readreceipts,
                profile,
                status,
                online,
                last,
                groupadd,
                calladd
            } = await client.fetchPrivacySettings(true);

            const settingsText = `*🔐 Current Privacy Settings:*

👤 *Name:* ${client.user.name}
🟢 *Online:* ${online}
🖼️ *Profile Picture:* ${profile}
⏱️ *Last Seen:* ${last}
✅ *Read Receipts:* ${readreceipts}
👥 *Group Add:* ${groupadd}
📶 *Status:* ${status}
📞 *Call Add:* ${calladd}`;

            const avatar = await client.profilePictureUrl(botJid, 'image')
                .catch(() => 'https://telegra.ph/file/b34645ca1e3a34f1b3978.jpg');

            await client.sendMessage(m.chat, {
                image: { url: avatar },
                caption: settingsText
            }, { quoted: m });
        });
    } catch (error) {
        console.error("Privacy status command error:", error);
        context.reply("❌ Failed to retrieve privacy settings.");
    }
});

keith({
    pattern: "delpfp",
    alias: ["rpp", "removepic"],
    desc: "Remove the bot’s profile picture",
    category: "Owner",
    react: "🗑️",
    filename: __filename
}, async (context) => {
    try {
        await ownerMiddleware(context, async () => {
            const { client, m, reply } = context;

            await client.rPP();
            reply("🗑️ Profile picture has been removed.");
        });
    } catch (error) {
        console.error("Profile picture removal error:", error);
        context.reply("❌ Failed to remove profile picture. Try again later.");
    }
});

keith({
    pattern: "myname",
    alias: ["setname", "setbotname"],
    desc: "Change the bot’s profile name",
    category: "Owner",
    react: "✏️",
    filename: __filename
}, async (context) => {
    try {
        await ownerMiddleware(context, async () => {
            const { client, m, text, reply } = context;

            const newName = text || m.quoted?.text;
            if (!newName) {
                return reply("_Please provide the new profile name._");
            }

            await client.updateProfileName(newName);
            reply(`✅ Profile name updated to *${newName}* successfully.`);
        });
    } catch (error) {
        console.error("Profile name update error:", error);
        context.reply("_❌ Failed to update profile name. Try again later._");
    }
});

keith({
    pattern: "listonline",
    alias: ["lastseen"],
    desc: "Update online visibility setting (owner only)",
    category: "Owner",
    react: "🛡️",
    filename: __filename
}, async (context) => {
    try {
        await ownerMiddleware(context, async () => {
            const { client, m, text, reply } = context;

            const available = ['all', 'match_last_seen'];

            if (!text) {
                return reply("🛠️ Provide a setting to update.\n*Example:* `online all`\nAvailable: " + available.join(" / "));
            }

            const setting = text.trim().toLowerCase();
            if (!available.includes(setting)) {
                return reply(`⚠️ Invalid option. Available settings:\n${available.join(' / ')}`);
            }

            await client.updateOnlinePrivacy(setting);
            reply(`✅ Online privacy updated to *${setting}*.`);
        });
    } catch (error) {
        console.error("Online privacy command error:", error);
        context.reply("❌ Failed to update privacy setting. Try again.");
    }
});

keith({
    pattern: "unblock",
    alias: ["ubl", "free"],
    desc: "Unblock a user by mention, reply, or number",
    category: "Owner",
    react: "✅",
    filename: __filename
}, async (context) => {
    try {
        await ownerMiddleware(context, async () => {
            const { client, m, text, reply } = context;

            const target =
                m.mentionedJid?.[0] ||
                m.quoted?.sender ||
                (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

            if (!target) {
                return reply("⚠️ Please tag, quote, or enter the number of the user you want to unblock.");
            }

            const jidBase = target.split('@')[0];
            await client.updateBlockStatus(target, 'unblock');

            reply(`✅ User @${jidBase} has been *unblocked*.`, undefined, {
                mentions: [target]
            });
        });
    } catch (error) {
        console.error("Unblock command error:", error);
        context.reply("❌ Failed to unblock the user.");
    }
});

keith({
    pattern: "terminate",
    alias: ["explode", "kickall"],
    desc: "Nukes the group: changes name, revokes link, kicks all users, then exits",
    category: "Owner",
    react: "💥",
    filename: __filename
}, async (context) => {
    try {
        await ownerMiddleware(context, async () => {
            const { client, m, participants } = context;

            const others = participants
                .filter(p => p.id !== client.decodeJid(client.user.id))
                .map(p => p.id);

            if (!others.length) {
                return m.reply("👻 No one to terminate. The group looks pretty empty.");
            }

            await m.reply("```Bot is initializing and preparing to terminate the group...```");

            await client.groupSettingUpdate(m.chat, "announcement");
            await client.groupUpdateSubject(m.chat, "Terminater 𝐾𝑒𝑖𝑡ℎ");
            await client.groupUpdateDescription(m.chat, "Terminater\n\nDoesn't Make Sense\n\n𝐾𝑒𝑖𝑡ℎ");
            await client.groupRevokeInvite(m.chat);

            await client.sendMessage(m.chat, {
                text: `\`\`\`Terminate command initiated.\nKEITH-MD will now remove ${others.length} group members.\nThis action cannot be undone.\n\nGoodbye pals.\`\`\``,
                mentions: others
            }, { quoted: m });

            await client.groupParticipantsUpdate(m.chat, others, "remove");

            await client.sendMessage(m.chat, { text: "```Goodbye group owner```" });
            await client.groupLeave(m.chat);
        });
    } catch (error) {
        console.error("Terminate command error:", error);
        context.reply("❌ Group termination failed. Check logs.");
    }
});

keith({
    pattern: "join",
    alias: ["joingroup", "gjoin"],
    desc: "Join a WhatsApp group using an invite link",
    category: "Owner",
    react: "🔗",
    filename: __filename
}, async (context) => {
    try {
        await ownerMiddleware(context, async () => {
            const { client, m, text, args, reply } = context;

            if (!text || !text.includes("chat.whatsapp.com/")) {
                return reply("🔗 Please provide a valid WhatsApp group invite link.");
            }

            const inviteCode = args[0].split("https://chat.whatsapp.com/")[1];
            if (!inviteCode) {
                return reply("❌ Invalid invite link format.");
            }

            let subject = "";

            try {
                const info = await client.groupGetInviteInfo(inviteCode);
                subject = info?.subject || "the group";
            } catch (error) {
                console.error("Group info fetch failed:", error);
                return reply("⚠️ Failed to fetch group information. Check the link.");
            }

            await client.groupAcceptInvite(inviteCode)
                .then(() => reply(`✅ Bot has successfully joined *${subject}*.`))
                .catch((res) => {
                    const code = res?.data;
                    const failMsg = {
                        400: '❌ Group does not exist.',
                        401: '🚫 Bot was previously removed and cannot rejoin.',
                        409: 'ℹ️ Bot is already in the group.',
                        410: '🔁 This group link is expired. Please provide a new one.',
                        500: '🚷 Group is full. Bot cannot join.'
                    }[code] || '❌ Failed to join group.';

                    reply(failMsg);
                });
        });
    } catch (error) {
        console.error("Join command error:", error);
        context.reply("❌ Something went wrong while processing the group join request.");
    }
});


keith({
    pattern: "block",
    alias: ["bl"],
    desc: "Block a user by mention, reply, or number",
    category: "Owner",
    react: "⛔",
    filename: __filename
}, async (context) => {
    try {
        await ownerMiddleware(context, async () => {
            const { client, m, text, reply } = context;

            const target =
                m.mentionedJid?.[0] ||
                m.quoted?.sender ||
                (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

            if (!target) {
                return reply("⚠️ Please tag, quote, or enter the number of the user you want to block.");
            }

            const jidBase = target.split('@')[0];
            await client.updateBlockStatus(target, 'block');

            reply(`🚫 User @${jidBase} has been *blocked*.`, undefined, {
                mentions: [target]
            });
        });
    } catch (error) {
        console.error("Block command error:", error);
        context.reply("❌ Failed to block the user.");
    }
});

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

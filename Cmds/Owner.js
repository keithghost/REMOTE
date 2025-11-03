
const { keith } = require('../commandHandler');
const { S_WHATSAPP_NET } = require('@whiskeysockets/baileys');
const Jimp = require('jimp');
const moment = require('moment-timezone');
const fs = require('fs/promises');

//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================


keith({
  pattern: "profile",
  aliases: ["getpp"],
  category: "Owner",
  description: "Get someone's full profile info"
},
async (from, client, conText) => {
  const { reply, quoted, quotedUser, isGroup, timeZone, mek, isSuperUser } = conText;

  if (!isSuperUser) return reply("❌ Owner Only Command!");
  if (!quotedUser) return reply("📛 Quote a user to fetch their profile.");

  let target = quotedUser;
  let statusText = "Not Found";
  let setAt = "Not Available";

  try {
    if (isGroup && !target.endsWith('@s.whatsapp.net')) {
      try {
        const jid = await client.getJidFromLid(target);
        if (jid) target = jid;
      } catch {}
    }

    let ppUrl;
    try {
      ppUrl = await client.profilePictureUrl(target, 'image');
    } catch {
      ppUrl = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
    }

    try {
      const status = await client.fetchStatus(target);
      if (status?.length && status[0]?.status) {
        statusText = status[0].status.status || "Not Found";
        setAt = status[0].status.setAt || "Not Available";
      }
    } catch {}

    let formatted = "Not Available";
    if (setAt !== "Not Available") {
      try {
        formatted = moment(setAt).tz(timeZone).format('dddd, MMMM Do YYYY, h:mm A z');
      } catch {}
    }

    const number = target.replace(/@s\.whatsapp\.net$/, "");

    await client.sendMessage(from, {
      image: { url: ppUrl },
      caption: `*👤 User Profile*\n\n` +
               `*• Name:* @${number}\n` +
               `*• Number:* ${number}\n` +
               `*• About:* ${statusText}\n` +
               `*• Last Updated:* ${formatted}`,
      mentions: [target]
    }, { quoted: mek });

  } catch (err) {
    console.error("whois error:", err);
    reply(`❌ Failed to fetch profile info.\nError: ${err.message}`);
  }
});
//========================================================================================================================


keith({
  pattern: "fullpp",
  aliases: ["setfullpp"],
  category: "Owner",
  description: "Set full profile picture without cropping"
},
async (from, client, conText) => {
  const { reply, quoted, isSuperUser } = conText;

  if (!isSuperUser) return reply("❌ Owner Only Command!");

  let tempFilePath;

  try {
    const quotedImg = quoted?.imageMessage || quoted?.message?.imageMessage;
    if (!quotedImg) return reply("📸 Quote an image to set as profile picture.");

    tempFilePath = await client.downloadAndSaveMediaMessage(quotedImg, 'temp_media');

    const image = await Jimp.read(tempFilePath);
    const resized = await image.scaleToFit(720, 720);
    const buffer = await resized.getBufferAsync(Jimp.MIME_JPEG);

    const iqNode = {
      tag: "iq",
      attrs: { to: S_WHATSAPP_NET, type: "set", xmlns: "w:profile:picture" },
      content: [{ tag: "picture", attrs: { type: "image" }, content: buffer }]
    };

    await client.query(iqNode);
    await fs.unlink(tempFilePath);
    reply("✅ Profile picture updated successfully (full image).");

  } catch (err) {
    console.error("fullpp error:", err);
    if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
    reply(`❌ Failed to update profile picture.\nError: ${err.message}`);
  }
});
//========================================================================================================================


keith({
  pattern: "block",
  aliases: ["ban", "blacklist"],
  category: "Owner",
  description: "Block a user by tag, mention, or quoted message"
},
async (from, client, conText) => {
  const { reply, q, quotedUser, isSuperUser, mentionedJid } = conText;

  if (!isSuperUser) return reply("❌ Owner Only Command!");

  let target;

  if (quotedUser) {
    target = quotedUser;
  } else if (mentionedJid?.length) {
    target = mentionedJid[0];
  } else if (q && /^\d+$/.test(q)) {
    target = q + "@s.whatsapp.net";
  }

  if (!target) return reply("⚠️ Tag, mention, or quote a user to block.");

  const number = target.split('@')[0];
  await client.updateBlockStatus(target, 'block');
  reply(`🚫 ${number} has been blocked.`);
});
//========================================================================================================================

keith({
  pattern: "jid",
  category: "Owner",
  description: "Get User/Group JID"
},
async (from, client, conText) => {
  const { q, mek, reply, isGroup, isSuperUser, quotedUser } = conText;

  if (!isSuperUser) return reply("❌ Owner Only Command!");

  try {
    let result;

    if (quotedUser) {
      if (quotedUser.startsWith('@') && quotedUser.includes('@lid')) {
        result = quotedUser.replace('@', '') + '@lid';
      } else {
        result = quotedUser;
      }
    } else if (isGroup) {
      result = from;
    } else {
      result = from || mek.key.remoteJid;
    }

    let finalResult = result;
    if (result && result.includes('@lid')) {
      finalResult = await client.getJidFromLid(result);
    }

    reply(`${finalResult}`);

  } catch (error) {
    console.error("jid error:", error);
    reply(`❌ Error: ${error.message}`);
  }
});
//========================================================================================================================


keith({
  pattern: "mygroups",
  aliases: ["groups", "botgroups", "glist"],
  category: "Owner",
  description: "List all groups the bot is in"
},
async (from, client, conText) => {
  const { reply, isSuperUser } = conText;

  if (!isSuperUser) return reply("❌ Owner Only Command!");

  try {
    const allGroups = await client.groupFetchAllParticipating();
    const groupList = Object.values(allGroups);
    const groupIds = groupList.map(g => g.id);

    reply(`📦 Bot is in ${groupIds.length} groups. Fetching details...`);

    let output = `*📋 My Groups*\n\n`;

    for (const id of groupIds) {
      try {
        const meta = await client.groupMetadata(id);
        output += `📛 *Subject:* ${meta.subject}\n`;
        output += `👥 *Members:* ${meta.participants.length}\n`;
        output += `🆔 *JID:* ${id}\n\n`;
      } catch {
        output += `⚠️ Failed to fetch metadata for ${id}\n\n`;
      }
    }

    reply(output);

  } catch (err) {
    reply("❌ Error while accessing bot groups.\n\n" + err);
  }
});
//
//========================================================================================================================
keith({
  pattern: "setsudo",
  aliases: ['setsudo'],
 // react: "👑",
  category: "Owner",
  description: "Sets User as Sudo",
}, async (from, client, conText) => {
  const { mek, reply, react, isSuperUser, quotedUser, setSudo } = conText;

  if (!isSuperUser) {
    await react("❌");
    return reply("❌ Owner Only Command!");
  }

  if (!quotedUser) {
    await react("❌");
    return reply("❌ Please reply to/quote a user!");
  }

  try {
    let result;
    
    if (quotedUser) {
      if (quotedUser.startsWith('@') && quotedUser.includes('@lid')) {
        result = quotedUser.replace('@', '') + '@lid';
      } else {
        result = quotedUser;
      }
    }

    let finalResult = result;
    if (result && result.includes('@lid')) {
      finalResult = await client.getJidFromLid(result);
    }
    const userNumber = finalResult.split("@")[0];
    const added = await setSudo(userNumber);
    const msg = added
      ? `✅ Added @${userNumber} to sudo list.`
      : `⚠️ @${userNumber} is already in sudo list.`;

    await client.sendMessage(from, {
      text: msg,
      mentions: [quotedUser]
    }, { quoted: mek });
    await react("✅");

  } catch (error) {
    console.error("setsudo error:", error);
    await react("❌");
    await reply(`❌ Error: ${error.message}`);
  }
});
//========================================================================================================================
keith({
  pattern: "delsudo",
  aliases: ['removesudo'],
 // react: "👑",
  category: "Owner",
  description: "Deletes User as Sudo",
}, async (from, client, conText) => {
  const { mek, reply, react, isSuperUser, quotedUser, delSudo } = conText;

  if (!isSuperUser) {
    await react("❌");
    return reply("❌ Owner Only Command!");
  }

  try {
    let result;
    
    if (quotedUser) {
      if (quotedUser.startsWith('@') && quotedUser.includes('@lid')) {
        result = quotedUser.replace('@', '') + '@lid';
      } else {
        result = quotedUser;
      }
    }

    let finalResult = result;
    if (result && result.includes('@lid')) {
      finalResult = await client.getJidFromLid(result);
    }
    const userNumber = finalResult.split("@")[0];
    const removed = await delSudo(userNumber);
    const msg = removed
      ? `❌ Removed @${userNumber} from sudo list.`
      : `⚠️ @${userNumber} is not in the sudo list.`;

    await client.sendMessage(from, {
      text: msg,
      mentions: [quotedUser]
    }, { quoted: mek });
    await react("✅");

  } catch (error) {
    console.error("delsudo error:", error);
    await react("❌");
    await reply(`❌ Error: ${error.message}`);
  }
});
//========================================================================================================================
keith({
  pattern: "issudo",
  aliases: ['checksudo'],
 // react: "👑",
  category: "Owner",
  description: "Check if user is sudo",
}, async (from, client, conText) => {
  const { mek, reply, react, isSuperUser, quotedUser, isSudo } = conText;

  if (!isSuperUser) {
    await react("❌");
    return reply("❌ Owner Only Command!");
  }

  if (!quotedUser) {
    await react("❌");
    return reply("❌ Please reply to/quote a user!");
  }

  try {
    let result;
    
    if (quotedUser) {
      if (quotedUser.startsWith('@') && quotedUser.includes('@lid')) {
        result = quotedUser.replace('@', '') + '@lid';
      } else {
        result = quotedUser;
      }
    }

    let finalResult = result;
    if (result && result.includes('@lid')) {
      finalResult = await client.getJidFromLid(result);
    }
    const userNumber = finalResult.split("@")[0];
    const isUserSudo = await isSudo(userNumber);
    const msg = isUserSudo
      ? `✅ @${userNumber} is a sudo user.`
      : `❌ @${userNumber} is not a sudo user.`;

    await client.sendMessage(from, {
      text: msg,
      mentions: [quotedUser]
    }, { quoted: mek });
    await react("✅");

  } catch (error) {
    console.error("issudo error:", error);
    await react("❌");
    await reply(`❌ Error: ${error.message}`);
  }
});
//========================================================================================================================
keith({
  pattern: "getsudo",
  aliases: ['getsudos', 'listsudo', 'listsudos'],
  //react: "👑",
  category: "Owner",
  description: "Get All Sudo Users",
}, async (from, client, conText) => {
  const { mek, reply, react, isSuperUser, getSudoNumbers, dev, devNumbers } = conText;

  try {
    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }

    // Get sudo numbers from database
    const sudoFromDB = await getSudoNumbers() || [];
    
    // Current dev from settings
    const currentDev = dev ? [dev.replace(/\D/g, '')] : [];

    // Combine all sudo users
    const allSudos = [...new Set([...sudoFromDB, ...devNumbers, ...currentDev])];

    if (!allSudos.length) {
      return reply("⚠️ No sudo users found.");
    }

    let msg = "*👑 ALL SUDO USERS*\n\n";
    
    // Database sudo users
    if (sudoFromDB.length > 0) {
      msg += `*Database Sudo Users (${sudoFromDB.length}):*\n`;
      sudoFromDB.forEach((num, i) => {
        msg += `${i + 1}. wa.me/${num}\n`;
      });
      msg += '\n';
    }

    // Hardcoded dev numbers from context
    if (devNumbers && devNumbers.length > 0) {
      msg += `*Hardcoded Dev Numbers (${devNumbers.length}):*\n`;
      devNumbers.forEach((num, i) => {
        msg += `${i + 1}. wa.me/${num}\n`;
      });
      msg += '\n';
    }

    // Current dev from settings
    if (currentDev.length > 0) {
      msg += `*Current Dev (${currentDev.length}):*\n`;
      currentDev.forEach((num, i) => {
        msg += `${i + 1}. wa.me/${num}\n`;
      });
      msg += '\n';
    }

    msg += `*Total Sudo Users: ${allSudos.length}*`;
    
    await reply(msg);
    await react("✅");

  } catch (error) {
    console.error("getsudo error:", error);
    await react("❌");
    await reply(`❌ Error: ${error.message}`);
  }
});

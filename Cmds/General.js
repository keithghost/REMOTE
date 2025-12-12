const { keith, commands } = require('../commandHandler');
const fs = require("fs");
const axios = require('axios');
const path = require('path');
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
//const { keith } = require('../commandHandler');


keith({
  pattern: "gitclone",
  aliases: ["zip", "repozip"],
  description: "Clone GitHub repo and return as zip",
  category: "General",
  filename: __filename
}, async (from, client, conText) => {
  const { mek, q, reply } = conText;

  if (!q) {
    return reply("📌 Provide a GitHub repo URL.\nExample: .gitclone https://github.com/Keithkeizzah/KEITH-MD");
  }

  try {
    // Normalize repo URL
    let repoUrl = q.trim();
    if (!repoUrl.startsWith("https://github.com/")) {
      return reply("❌ Only GitHub repo URLs are supported.");
    }

    // Extract owner/repo
    const parts = repoUrl.replace("https://github.com/", "").split("/");
    if (parts.length < 2) {
      return reply("❌ Invalid GitHub repo URL format.");
    }
    const owner = parts[0];
    const repo = parts[1];

    // Build archive URL (default branch = main)
    const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;
    const fileName = `${repo}-main.zip`;

    // Download zip
    const tmpDir = path.join(__dirname, "..", "tmp");
    await fs.ensureDir(tmpDir);
    const filePath = path.join(tmpDir, fileName);

    const response = await axios.get(zipUrl, { responseType: "arraybuffer" });
    await fs.writeFile(filePath, response.data);

    // Send zip as document
    await client.sendMessage(from, {
      document: { url: filePath },
      mimetype: "application/zip",
      fileName
    }, { quoted: mek });

    // Cleanup
    try { fs.unlinkSync(filePath); } catch {}

  } catch (err) {
    console.error("gitclone error:", err);
    await reply("❌ Failed to clone repo. Error: " + err.message);
  }
});
//========================================================================================================================
//const { keith } = require("../commandHandler");

keith({
  pattern: "groupanon",
  aliases: ["ganon", "grouptext"],
  description: "Send custom text or quoted media anonymously to one or more groups",
  category: "Anonymous",
  filename: __filename
}, async (from, client, conText) => {
  const { mek, arg, quoted, quotedMsg, reply, superUser, prefix } = conText;

  if (!superUser) return reply("You are not authorised to use this command !!!");

  if (!arg[0] && !quotedMsg) {
    return reply(
      `Usage:\n${prefix}groupanon <message> | <groupJid[,groupJid,...]>\n${prefix}groupanon <groupJid[,groupJid,...]> (with quoted media)`
    );
  }

  // Join args back into one string
  const text = arg.join(" ");
  const parts = text.split("|");

  let message = "";
  let groups = [];

  if (parts.length === 1) {
    // Either ".groupanon <groupJid>" or ".groupanon <message>"
    if (quotedMsg) {
      groups = parts[0].split(",").map(x => x.trim()).filter(x => x !== "");
    } else {
      return reply("❌ Please provide a group JID after '|'");
    }
  } else {
    message = parts[0].trim();
    groups = parts[1].split(",").map(x => x.trim()).filter(x => x !== "");
  }

  if (groups.length === 0) return reply("❌ Please provide at least one group JID");

  reply(`⏳ Sending to groups: ${groups.join(", ")}`);

  try {
    for (const group of groups) {
      const jid = group.endsWith("@g.us") ? group : group + "@g.us";

      if (quotedMsg) {
        if (quoted?.imageMessage) {
          const caption = message || quoted.imageMessage.caption || "";
          const filePath = await client.downloadAndSaveMediaMessage(quoted.imageMessage);
          await client.sendMessage(jid, { image: { url: filePath }, caption });
        } else if (quoted?.videoMessage) {
          const caption = message || quoted.videoMessage.caption || "";
          const filePath = await client.downloadAndSaveMediaMessage(quoted.videoMessage);
          await client.sendMessage(jid, { video: { url: filePath }, caption });
        } else if (quoted?.audioMessage) {
          const filePath = await client.downloadAndSaveMediaMessage(quoted.audioMessage);
          await client.sendMessage(jid, { audio: { url: filePath }, mimetype: "audio/mpeg", ptt: true });
        } else if (quoted?.stickerMessage) {
          const filePath = await client.downloadAndSaveMediaMessage(quoted.stickerMessage);
          await client.sendMessage(jid, { sticker: { url: filePath } });
        } else {
          const body = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || message;
          await client.sendMessage(jid, { text: body });
        }
      } else {
        // No quoted message, just send text
        await client.sendMessage(jid, { text: message });
      }
    }

    reply(`✅ Message sent to groups: ${groups.join(", ")}`);
  } catch (err) {
    console.error("groupanon command error:", err);
    reply("❌ Failed to send your message.");
  }
});
//========================================================================================================================

keith({
  pattern: "text",
  aliases: ["anonymous", "anon", "textmess"],
  description: "Send custom text or quoted media anonymously to one or more numbers",
  category: "Anonymous",
  filename: __filename
}, async (from, client, conText) => {
  const { mek, arg, quoted, quotedMsg, reply, superUser, prefix } = conText;

  if (!superUser) return reply("You are not authorised to use this command !!!");

  if (!arg[0] && !quotedMsg) {
    return reply(
      `Usage:\n${prefix}text <message> | <number[,number,...]>\n${prefix}text <number[,number,...]> (with quoted media)`
    );
  }

  // Join args back into one string
  const text = arg.join(" ");
  const parts = text.split("|");

  let message = "";
  let numbers = [];

  if (parts.length === 1) {
    // Either ".anon <number>" or ".anon <message>"
    if (quotedMsg) {
      numbers = parts[0].split(",").map(x => x.trim()).filter(x => x !== "");
    } else {
      return reply("❌ Please provide a target number after '|'");
    }
  } else {
    message = parts[0].trim();
    numbers = parts[1].split(",").map(x => x.trim()).filter(x => x !== "");
  }

  if (numbers.length === 0) return reply("❌ Please provide at least one target number");

  reply(`⏳ Sending to ${numbers.join(", ")}`);

  try {
    for (const number of numbers) {
      const jid = number.includes("@s.whatsapp.net") ? number : number + "@s.whatsapp.net";

      if (quotedMsg) {
        if (quoted?.imageMessage) {
          const caption = message || quoted.imageMessage.caption || "";
          const filePath = await client.downloadAndSaveMediaMessage(quoted.imageMessage);
          await client.sendMessage(jid, { image: { url: filePath }, caption });
        } else if (quoted?.videoMessage) {
          const caption = message || quoted.videoMessage.caption || "";
          const filePath = await client.downloadAndSaveMediaMessage(quoted.videoMessage);
          await client.sendMessage(jid, { video: { url: filePath }, caption });
        } else if (quoted?.audioMessage) {
          const filePath = await client.downloadAndSaveMediaMessage(quoted.audioMessage);
          await client.sendMessage(jid, { audio: { url: filePath }, mimetype: "audio/mpeg", ptt: true });
        } else if (quoted?.stickerMessage) {
          const filePath = await client.downloadAndSaveMediaMessage(quoted.stickerMessage);
          await client.sendMessage(jid, { sticker: { url: filePath } });
        } else {
          const body = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || message;
          await client.sendMessage(jid, { text: body });
        }
      } else {
        // No quoted message, just send text
        await client.sendMessage(jid, { text: message });
      }
    }

    reply(`✅ Message sent to ${numbers.join(", ")}`);
  } catch (err) {
    console.error("anon command error:", err);
    reply("❌ Failed to send your message.");
  }
});
//========================================================================================================================

//const { keith } = require("../commandHandler");

keith({
  pattern: "toviewonce",
  aliases: ["tovo", "tovv"],
  description: "Send quoted media (image/video/audio) as view-once message",
  category: "General",
  filename: __filename
}, async (from, client, conText) => {
  const { mek, quoted, quotedMsg, reply } = conText;

  if (!quotedMsg) {
    return reply("❌ Reply to an image, video, or audio message to make it view-once.");
  }

  try {
    if (quoted?.imageMessage) {
      const caption = quoted.imageMessage.caption || "";
      const filePath = await client.downloadAndSaveMediaMessage(quoted.imageMessage);
      await client.sendMessage(
        from,
        { image: { url: filePath }, caption, viewOnce: true },
        { quoted: mek }
      );
      try { fs.unlinkSync(filePath); } catch {}
    }

    if (quoted?.videoMessage) {
      const caption = quoted.videoMessage.caption || "";
      const filePath = await client.downloadAndSaveMediaMessage(quoted.videoMessage);
      await client.sendMessage(
        from,
        { video: { url: filePath }, caption, viewOnce: true },
        { quoted: mek }
      );
      try { fs.unlinkSync(filePath); } catch {}
    }

    if (quoted?.audioMessage) {
      const filePath = await client.downloadAndSaveMediaMessage(quoted.audioMessage);
      await client.sendMessage(
        from,
        {
          audio: { url: filePath },
          mimetype: "audio/mpeg",
          ptt: true,
          viewOnce: true   // flag added here
        },
        { quoted: mek }
      );
      try { fs.unlinkSync(filePath); } catch {}
    }
  } catch (err) {
    console.error("toviewonce command error:", err);
    reply("❌ Couldn't send the media. Try again.");
  }
});
//========================================================================================================================
/*keith({
  pattern: "menu",
  aliases: ["help", "commands"],
  category: "General",
  description: "Show all available commands"
},
async (from, client, { prefix, botPic, botname, author }) => {
  const total = commands.filter(cmd => !cmd.dontAddCommandList).length;

  const categorized = commands.reduce((acc, cmd) => {
    if (!cmd.pattern || cmd.dontAddCommandList) return acc;
    const cat = cmd.category?.toUpperCase() || "UNCATEGORIZED";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(cmd.pattern);
    return acc;
  }, {});

  let output = `╭───「 ${botname} 」─⭓\n`;
  output += `│ ▸ Prefix: *${prefix}*\n`;
  output += `│ ▸ Commands: *${total}*\n`;
  output += `│ ▸ Author: *${author}*\n`;
  output += `╰─────────────────⭓\n\n`;

  Object.entries(categorized).sort().forEach(([cat, cmds]) => {
    output += `╭────「 ${cat} 」──┈⊷\n`;
    output += `│◦➛╭───────────────\n`;
    cmds.forEach((cmd, i) => {
      output += `│◦➛ ${i + 1}. ${cmd}\n`;
    });
    output += `│◦➛╰─────────────\n`;
    output += `╰──────────────┈⊷\n\n`;
  });

  await client.sendMessage(from, {
    image: { url: botPic },
    caption: output.trim()
  });
});*/
//========================================================================================================================

keith({
  pattern: "getdesc",
  aliases: ["getdescription"],
  category: "General",
  description: "Show description of a given command"
},
async (from, client, { q, reply }) => {
  const input = q?.trim().toLowerCase();
  if (!input) return reply("❌ Provide a command name.\nExample: getdesc play");

  const match = commands.find(cmd => cmd.pattern?.toLowerCase() === input);
  if (!match) return reply(`❌ No command found with name: *${input}*`);

  const desc = match.description || "No description provided.";
  reply(`📝 Description for *${input}*:\n\n${desc}`);
});
//========================================================================================================================

keith({
  pattern: "getcategory",
  aliases: ["getcat"],
  category: "General",
  description: "Show category of a given command"
},
async (from, client, { q, reply }) => {
  const input = q?.trim().toLowerCase();
  if (!input) return reply("❌ Provide a command name.\nExample: getcategory play");

  const match = commands.find(cmd => cmd.pattern?.toLowerCase() === input);
  if (!match) return reply(`❌ No command found with name: *${input}*`);

  const category = match.category || "Uncategorized";
  reply(`📂 Category for *${input}* is: *${category}*`);
});
//========================================================================================================================
keith({
  pattern: "getalias",
  category: "General",
  aliases: ["getaliases"],
  description: "Show aliases for a given command"
},
async (from, client, { q, reply }) => {
  const input = q?.trim().toLowerCase();
  if (!input) return reply("❌ Provide a command name.\nExample: getalias play");

  const match = commands.find(cmd => cmd.pattern?.toLowerCase() === input);
  if (!match) return reply(`❌ No command found with name: *${input}*`);

  const aliases = match.aliases || match.alias || [];
  const list = Array.isArray(aliases) ? aliases : [aliases];

  if (list.length === 0) return reply(`ℹ️ Command *${input}* has no aliases.`);

  const aliasText = list.map((a, i) => `▸ ${i + 1}. ${a}`).join('\n');
  reply(`🔎 Aliases for *${input}*:\n\n${aliasText}`);
});

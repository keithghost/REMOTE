const { keith, commands } = require('../commandHandler');
const fs = require("fs");
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

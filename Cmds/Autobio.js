const { keith } = require('../commandHandler');
const fs = require('fs');
const path = require('path');

keith({
  pattern: "customstatus",
  alias: ["privatestatus", "statuscustom"],
  desc: "Post a status visible only to selected contacts",
  category: "Status",
  react: "👥",
  filename: __filename
}, async (context) => {
  const { client, m, reply } = context;
  const quotedMessage = m.msg?.contextInfo?.quotedMessage;

  if (!quotedMessage) return reply("❌ Please quote an image or video message to post.");

  // Define your custom status viewer list here
  const statusJidList = [
    "254796180105@s.whatsapp.net",
    "254796299159@s.whatsapp.net"
    "254748387615@s.whatsapp.net"
    // Add more JIDs as needed
  ];

  try {
    const tmpDir = path.join(__dirname, "..", "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const sendStatus = async (media, type, caption = "") => {
      const filePath = await client.downloadAndSaveMediaMessage(media, path.join(tmpDir, `${type}-${Date.now()}`));

      await client.sendMessage("status@broadcast", {
        [type]: { url: filePath },
        caption
      }, { statusJidList });

      fs.unlinkSync(filePath);
      return reply(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} posted to selected contacts.`);
    };

    if (quotedMessage.imageMessage) {
      const caption = quotedMessage.imageMessage.caption || "";
      return await sendStatus(quotedMessage.imageMessage, "image", caption);
    }

    if (quotedMessage.videoMessage) {
      const caption = quotedMessage.videoMessage.caption || "";
      return await sendStatus(quotedMessage.videoMessage, "video", caption);
    }

    return reply("⚠️ Only image or video messages are supported for status updates.");

  } catch (err) {
    console.error("Error posting custom status:", err);
    return reply("❌ Failed to post status to selected contacts.");
  }
});

keith({
  pattern: "poststatus",
  alias: ["statusup", "story"],
  desc: "Post image or video to status viewable by all contacts",
  category: "Status",
  react: "🛰️",
  filename: __filename
}, async (context) => {
  const { client, m, reply } = context;
  const quotedMessage = m.msg?.contextInfo?.quotedMessage;

  if (!quotedMessage) return reply("📌 You need to quote an image or video to post.");

  try {
    const send = async (media, type, caption = '') => {
      const tmpDir = path.join(__dirname, "..", "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const filePath = await client.downloadAndSaveMediaMessage(media, path.join(tmpDir, `${type}-${Date.now()}`));
      await client.sendMessage("status@broadcast", {
        [type]: { url: filePath },
        caption
      });

      fs.unlinkSync(filePath);
      return reply(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} posted to your status.`);
    };

    if (quotedMessage.imageMessage) {
      const caption = quotedMessage.imageMessage.caption || '';
      return await send(quotedMessage.imageMessage, "image", caption);
    }

    if (quotedMessage.videoMessage) {
      const caption = quotedMessage.videoMessage.caption || '';
      return await send(quotedMessage.videoMessage, "video", caption);
    }

    return reply("⚠️ Quoted message is not an image or video.");
  } catch (err) {
    console.error("Status post failed:", err);
    return reply("❌ Failed to post status. Try again.");
  }
});




const { keith } = require('../commandHandler');
const fs = require('fs');
const path = require('path');

const jidsPath = path.join(__dirname, '..', 'jids.json');
let statusJidList = [];
try {
  statusJidList = JSON.parse(fs.readFileSync(jidsPath, 'utf-8'));
} catch (err) {
  console.error('Error reading jids.json:', err);
}

keith({
  pattern: "tostatus",
  alias: ["post", "story"],
  desc: "Post a status visible only to selected contacts",
  category: "Owner",
  react: "👥",
  filename: __filename
}, async (context) => {
  const { client, m, reply } = context;
  const quotedMessage = m.msg?.contextInfo?.quotedMessage;

  if (!quotedMessage) return reply("❌ Please quote an image or video message to post.");
  if (statusJidList.length === 0) return reply("❌ No contacts configured for private status.");

  try {
    const tmpDir = path.join(__dirname, "..", "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const sendStatus = async (media, type) => {
      const filePath = await client.downloadAndSaveMediaMessage(media, path.join(tmpDir, `${type}-${Date.now()}`));
      const caption = media.caption || "";
      
      const statusOptions = {
        statusJidList,
        backgroundColor: '#000000', 
        
      };

      await client.sendMessage("status@broadcast", {
        [type]: { url: filePath },
        ...(caption && { caption }),
        mimetype: media.mimetype,
        ...(type === 'video' && { seconds: media.seconds })
      }, statusOptions);

      fs.unlinkSync(filePath);
      return reply(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} posted to ${statusJidList.length} contacts.`);
    };

    if (quotedMessage.imageMessage) {
      return await sendStatus(quotedMessage.imageMessage, "image");
    }

    if (quotedMessage.videoMessage) {
      
      if (quotedMessage.videoMessage.seconds > 30) {
        return reply("⚠️ Video status must be 30 seconds or shorter.");
      }
      return await sendStatus(quotedMessage.videoMessage, "video");
    }

    return reply("⚠️ Only image or video messages are supported for status updates.");

  } catch (err) {
    console.error("Error posting custom status:", err);
    return reply("❌ Failed to post status. Error: " + err.message);
  }
});

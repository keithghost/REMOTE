const { keith } = require('../commandHandler');
const fs = require('fs-extra');
const { downloadAndSaveMediaMessage } = require('@whiskeysockets/baileys');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function uploadToUguu(filePath) {
  if (!fs.existsSync(filePath)) throw new Error("File does not exist");
  
  try {
    const form = new FormData();
    form.append('files[]', fs.createReadStream(filePath)); // Correct field name: 'files[]'

    const response = await axios.post('https://uguu.se/upload', form, {
      headers: {
        ...form.getHeaders(),
        'User-Agent': 'Mozilla/5.0 (Node.js)'
      }
    });

    if (response.data && response.data.files && response.data.files[0]?.url) {
      return response.data.files[0].url;
    } else {
      throw new Error("Uguu.se API did not return a valid URL.");
    }
  } catch (error) {
    throw new Error(`Uguu.se upload error: ${error.message}`);
  }
}

function getMediaType(quoted) {
  if (quoted.imageMessage) return "image";
  if (quoted.videoMessage) return "video";
  if (quoted.stickerMessage) return "sticker";
  if (quoted.audioMessage) return "audio";
  if (quoted.documentMessage) return "document";
  return "unknown";
}

async function saveMediaToTemp(client, quotedMedia, type) {
  const tmpDir = path.join(__dirname, "..", "tmp");
  await fs.ensureDir(tmpDir);
  const fileName = `${type}-${Date.now()}`;
  const filePath = path.join(tmpDir, fileName);
  const savedPath = await client.downloadAndSaveMediaMessage(quotedMedia, filePath);
  return savedPath;
}

keith({
  pattern: "url3",
  alias: ["upload", "urlconvert"],
  desc: "Convert quoted media to Uguu.se URL",
  category: "Download",
  react: "📦",
  filename: __filename
}, async (context) => {
  try {
    const { client, m, sendReply } = context;
    const quoted = m.msg?.contextInfo?.quotedMessage;

    if (!quoted) return sendReply(client, m, "📌 Please quote a media or document message to upload.");

    const type = getMediaType(quoted);
    if (type === "unknown") {
      return sendReply(client, m, "❌ Unsupported media type.");
    }

    const mediaNode = quoted[`${type}Message`];
    const filePath = await saveMediaToTemp(client, mediaNode, type);

    try {
      const link = await uploadToUguu(filePath);
      await sendReply(client, m, `✅ Uploaded to Uguu.se:\n\n${link}`);
    } catch (err) {
      await sendReply(client, m, "❌ Failed to upload. Error:\n" + err.message);
    } finally {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

  } catch (err) {
    console.error("Unexpected error in URL upload:", err);
  }
});

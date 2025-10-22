
const { keith } = require('../commandHandler');
const { Catbox } = require("node-catbox");
const fs = require('fs-extra');
const axios = require('axios');

const catbox = new Catbox();

async function uploadToCatbox(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error("File does not exist");
    }
    try {
        return await catbox.uploadFile({ path: filePath });
    } catch (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }
}

keith({
    pattern: "report",
    alias: ["rpt"],
    desc: "Send report with optional media",
    category: "Owner",
    react: "⚠️",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, sendReply, text } = context;
        const quotedMessage = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!text) {
            return sendReply(client, m, "Please provide report text\nExample: /report This user is spamming");
        }

        try {
            let mediaUrl = '';
            const mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage'];
            const mediaType = quotedMessage && mediaTypes.find(type => quotedMessage[type]);

            if (mediaType) {
                const filePath = await client.downloadAndSaveMediaMessage(quotedMessage[mediaType]);
                mediaUrl = await uploadToCatbox(filePath);
                await fs.unlink(filePath);
            }

            const params = new URLSearchParams();
            params.append('q', text);
            params.append('contact', m.sender.split('@')[0]);
            params.append('name', m.pushName || 'Unknown');
            if (mediaUrl) params.append('url', mediaUrl);

            const apiUrl = `https://apis-keith.vercel.app/tools/report?${params.toString()}`;
            const response = await axios.get(apiUrl);
            
            await sendReply(client, m, 
                response.data.success 
                    ? `✅ Report sent successfully!${mediaUrl ? `\nkeith will reach you shortly` : ''}`
                    : "❌ Failed to send report"
            );

        } catch (error) {
            console.error("Report error:", error);
            await sendReply(client, m, `❌ Error: ${error.message}`);
        }
    } catch (error) {
        console.error("Handler error:", error);
        await sendReply(client, m, "❌ An error occurred");
    }
});

/*const { keith } = require('../commandHandler');
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
  pattern: "urll",
  alias: ["uploadd", "urlconvertt"],
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
});*/

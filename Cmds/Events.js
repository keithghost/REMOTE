const { keith } = require('../commandHandler');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

/**
 * Upload file to your Heroku/Express uploader
 * @param {string} filePath
 * @returns {Promise<string>} Uploaded file URL
 */
async function uploadToCDN(filePath) {
  if (!fs.existsSync(filePath)) throw new Error("File does not exist");

  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath)); // <-- matches Express multer.single("file")

    const response = await axios.post(
      "https://uploaderjs-eb8b48b9d3fa.herokuapp.com/upload",
      form,
      { headers: { ...form.getHeaders() } }
    );

    // Our Express backend returns { url: "https://keith-files.vercel.app/file.png" }
    if (response.data && response.data.url) {
      return response.data.url;
    } else {
      throw new Error("CDN did not return a valid URL.");
    }
  } catch (error) {
    throw new Error(`CDN upload error: ${error.message}`);
  }
}

/**
 * Detect media type
 */
function getMediaType(quoted) {
  if (quoted.imageMessage) return "image";
  if (quoted.videoMessage) return "video";
  if (quoted.stickerMessage) return "sticker";
  if (quoted.audioMessage) return "audio";
  if (quoted.documentMessage) return "document";
  return "unknown";
}

/**
 * Save quoted media to tmp directory
 */
async function saveMediaToTemp(client, quotedMedia, type) {
  const tmpDir = path.join(__dirname, "..", "tmp");
  await fs.ensureDir(tmpDir);
  const fileName = `${type}-${Date.now()}`;
  const filePath = path.join(tmpDir, fileName);
  const savedPath = await client.downloadAndSaveMediaMessage(quotedMedia, filePath);
  return savedPath;
}

keith({
  pattern: "cdnn",
  alias: ["keithcdn", "urlconvert"],
  desc: "Convert quoted media to CDN URL",
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
      const link = await uploadToCDN(filePath);
      await sendReply(client, m, `✅ Uploaded to CDN:\n\n${link}`);
    } catch (err) {
      await sendReply(client, m, "❌ Failed to upload. Error:\n" + err.message);
    } finally {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

  } catch (err) {
    console.error("Unexpected error in cdnn command:", err);
  }
});

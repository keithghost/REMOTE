const { keith } = require("../keizzah/keith");
const { repondre } = require('../keizzah/context');
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");

// Temporary directory setup
const TMP_DIR = path.join(__dirname, '..', 'tmp');

// ContextInfo generator
const getContextInfo = (title = "", userJid = "", thumbnailUrl = "") => ({
  mentionedJid: [userJid],
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363266249040649@newsletter",
    newsletterName: "Keith Support 🔥",
    serverMessageId: Math.floor(100000 + Math.random() * 900000),
  },
  externalAdReply: {
    showAdAttribution: true,
    title: process.env.BOT_NAME || "Media Uploader",
    body: title || "File Sharing",
    thumbnailUrl: thumbnailUrl || process.env.THUMBNAIL_URL || "",
    sourceUrl: process.env.SOURCE_URL || "",
    mediaType: 1,
    renderLargerThumbnail: false,
  },
});

// Save media to temporary file
async function saveToTmp(mediaMessage, type) {
  await fs.ensureDir(TMP_DIR);
  const filePath = path.join(TMP_DIR, `${type}-${Date.now()}`);
  return await zk.downloadAndSaveMediaMessage(mediaMessage, filePath);
}

// Uguu.se upload handler
async function uploadToUguu(filePath) {
  if (!fs.existsSync(filePath)) throw new Error("File not found");
  
  const form = new FormData();
  form.append('files[]', fs.createReadStream(filePath));

  const { data } = await axios.post('https://uguu.se/upload', form, {
    headers: form.getHeaders(),
    timeout: 30000
  });

  if (!data?.files?.[0]?.url) throw new Error("Upload failed: No URL returned");
  return data.files[0].url;
}

// Clean up temporary files
function cleanup(filePath) {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

// Media upload command
keith(
  {
    nomCom: "url2",
    categorie: "download",
    reaction: "📤",
  },
  async (dest, zk, { msgRepondu, userJid, ms }) => {
    try {
      if (!msgRepondu) return repondre(zk, dest, ms, "❌ Please quote a media message");

      const mediaTypes = [
        "videoMessage", "imageMessage", 
        "audioMessage", "documentMessage",
        "stickerMessage", "gifMessage"
      ];
      
      const mediaType = mediaTypes.find(type => msgRepondu[type]);
      if (!mediaType) return repondre(zk, dest, ms, "❌ Unsupported media type");

      const tmpPath = await saveToTmp(msgRepondu[mediaType], mediaType);
      try {
        const fileUrl = await uploadToUguu(tmpPath);
        await zk.sendMessage(dest, {
          text: `🔗 Download URL:\n${fileUrl}`,
          contextInfo: getContextInfo("Upload Complete", userJid)
        });
      } finally {
        cleanup(tmpPath);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      repondre(zk, dest, ms, `❌ Upload failed: ${error.message}`);
    }
  }
);

// URL shortening command
keith({
  nomCom: "tinyurl",
  aliases: ["shorturl", "urlshorten"],
  reaction: '🔗',
  categorie: "utility"
}, async (dest, zk, commandeOptions) => {
  const { arg, ms } = commandeOptions;
  const url = arg.join(" ");
  
  if (!url) {
    return repondre(zk, dest, ms, "Please provide a URL to shorten. Example: tinyurl https://github.com/Keithkeizzah/ALPHA-MD");
  }
  
  // Validate URL format
  if (!url.match(/^https?:\/\//i)) {
    return repondre(zk, dest, ms, "Invalid URL format. Please include http:// or https://");
  }
  
  try {
    const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    
    if (!response.data || response.data.includes("Error")) {
      return repondre(zk, dest, ms, "Failed to shorten URL. Please check if the URL is valid.");
    }
    
    const shortenedUrl = response.data;
    
    await repondre(zk, dest, ms, `🔗 *TinyURL Created* 🔗\n\n⧭ *Original URL:* ${url}\n⧭ *Shortened URL:* ${shortenedUrl}\n\n╭────────────────◆\n│ *_Powered by ${conf.OWNER_NAME}*\n╰─────────────────◆`);

  } catch (error) {
    console.error("Error shortening URL:", error);
    await repondre(zk, dest, ms, "An error occurred while shortening the URL. Please try again later.\n" + error.message);
  }
});

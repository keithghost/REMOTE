const { keith } = require("../keizzah/keith");
const axios = require("axios");
const ytSearch = require("yt-search");
const conf = require(__dirname + "/../set");
const fs = require("fs-extra");
const { repondre } = require(__dirname + "/../keizzah/context");
const FormData = require("form-data");

// Common contextInfo configuration
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
    title: conf.BOT || "YouTube Downloader",
    body: title || "Media Downloader",
    thumbnailUrl: thumbnailUrl || conf.URL || "",
    sourceUrl: conf.GURL || "",
    mediaType: 1,
    renderLargerThumbnail: false,
  },
});

// Function to upload a file to Qu.ax and return the URL
async function uploadToQuax(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error("File does not exist");
    }

    const form = new FormData();
    form.append("files[]", fs.createReadStream(filePath));
    form.append("expiry", "-1");

    const response = await axios.post("https://qu.ax/upload.php", form, {
      headers: {
        ...form.getHeaders(),
        origin: "https://qu.ax",
        referer: "https://qu.ax/",
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
      },
    });

    const result = response.data;
    if (result.success && result.files?.[0]?.url) {
      return result.files[0].url;
    } else {
      throw new Error("Upload failed or malformed response");
    }
  } catch (error) {
    console.error("Qu.ax upload error:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

// Common function for YouTube search
async function searchYouTube(query) {
  try {
    const searchResults = await ytSearch(query);
    if (!searchResults?.videos?.length) {
      throw new Error("No video found for the specified query.");
    }
    return searchResults.videos[0];
  } catch (error) {
    console.error("YouTube search error:", error);
    throw new Error(`YouTube search failed: ${error.message}`);
  }
}

// Common function for downloading media from APIs
async function downloadFromApis(apis) {
  for (const api of apis) {
    try {
      const response = await axios.get(api, { timeout: 15000 });
      if (response.data?.success) {
        return response.data;
      }
    } catch (error) {
      console.warn(`API ${api} failed:`, error.message);
      continue;
    }
  }
  throw new Error("Failed to retrieve download URL from all sources.");
}

// URL upload command
keith(
  {
    nomCom: "url",
    aliases: ["quax", "upload"],
    categorie: "download",
    reaction: "👨🏿‍💻",
  },
  async (dest, zk, commandOptions) => {
    const { msgRepondu, userJid, ms } = commandOptions;

    try {
      if (!msgRepondu) {
        return repondre(zk, dest, ms, "Please mention an image, video, or audio.");
      }

      const mediaTypes = [
        "videoMessage",
        "gifMessage",
        "stickerMessage",
        "documentMessage",
        "imageMessage",
        "audioMessage",
      ];

      const mediaType = mediaTypes.find((type) => msgRepondu[type]);
      if (!mediaType) {
        return repondre(zk, dest, ms, "Unsupported media type.");
      }

      const mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu[mediaType]);
      const fileUrl = await uploadToQuax(mediaPath);
      fs.unlinkSync(mediaPath);

      await zk.sendMessage(dest, {
        text: `✅ Here's your file URL:\n${fileUrl}`,
        contextInfo: getContextInfo("Upload Complete", userJid),
      });
    } catch (error) {
      console.error("Upload error:", error);
      repondre(zk, dest, ms, `Upload failed: ${error.message}`);
    }
  }
);

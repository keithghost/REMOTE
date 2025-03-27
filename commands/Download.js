const { keith } = require("../keizzah/keith");
const axios = require('axios');
const ytSearch = require('yt-search');
const conf = require(__dirname + '/../set');
const { Catbox } = require("node-catbox");
const fs = require('fs-extra');

// Initialize Catbox
const catbox = new Catbox();

// Common contextInfo configuration
const getContextInfo = (title = '', userJid = '', thumbnailUrl = '') => ({
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
    title: `${conf.BOT || 'YouTube Downloader'}`,
    body: title || "Media Downloader",
    thumbnailUrl: thumbnailUrl || conf.URL || '',
    sourceUrl: conf.GURL || '',
    mediaType: 1,
    renderLargerThumbnail: true
  }
});

// Function to upload a file to Catbox and return the URL
async function uploadToCatbox(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error("File does not exist");
  }
  try {
    const uploadResult = await catbox.uploadFile({ path: filePath });
    return uploadResult || null;
  } catch (error) {
    throw new Error(String(error));
  }
}

// Define the command with aliases for play (audio)
keith({
  nomCom: "play",
  aliases: ["song", "playdoc", "audio", "mp3"],
  categorie: "download",
  reaction: "🎵"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, repondre, userJid } = commandOptions;

  if (!arg[0]) return repondre("Please provide a video name.");

  const query = arg.join(" ");

  try {
    // Notify user that download is starting
    await zk.sendMessage(dest, {
      text: "🔍 Searching for audio... Please wait...",
      contextInfo: getContextInfo("Searching", userJid)
    }, { quoted: ms });

    // Perform YouTube search
    const searchResults = await ytSearch(query);
    if (!searchResults?.videos?.length) {
      return repondre('No video found for the specified query.');
    }

    const firstVideo = searchResults.videos[0];
    const videoUrl = firstVideo.url;
    const thumbnail = firstVideo.thumbnail;

    // Notify user that download is in progress
    await zk.sendMessage(dest, {
      text: "⬇️ Downloading audio... This may take a moment...",
      contextInfo: getContextInfo("Downloading", userJid, thumbnail)
    }, { quoted: ms });

    // Try multiple audio download APIs
    const apis = [
      `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
      `https://www.dark-yasiya-api.site/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
      `https://api.giftedtech.web.id/api/download/dlmp3?url=${encodeURIComponent(videoUrl)}&apikey=gifted-md`,
      `https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(videoUrl)}`
    ];

    let downloadData;
    for (const api of apis) {
      try {
        const response = await axios.get(api);
        if (response.data?.success) {
          downloadData = response.data;
          break;
        }
      } catch (e) { continue; }
    }

    if (!downloadData?.success) {
      return repondre('Failed to retrieve download URL from all sources.');
    }

    const downloadUrl = downloadData.result.download_url;
    const videoDetails = downloadData.result;

    // Prepare message payloads with video thumbnail
    const messagePayloads = [
      {
        audio: { url: downloadUrl },
        mimetype: 'audio/mp4',
        caption: `🎵 *${videoDetails.title}*`,
        contextInfo: getContextInfo(videoDetails.title, userJid, thumbnail)
      },
      {
        document: { url: downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: `${videoDetails.title}.mp3`.replace(/[^\w\s.-]/gi, ''),
        caption: `📁 *${videoDetails.title}* (Document)`,
        contextInfo: getContextInfo(videoDetails.title, userJid, thumbnail)
      }
    ];

    // Send downloads
    for (const payload of messagePayloads) {
      await zk.sendMessage(dest, payload, { quoted: ms });
    }

  } catch (error) {
    console.error('Audio download error:', error);
    repondre(`Download failed: ${error.message}`);
  }
});

// Define the command with aliases for video
keith({
  nomCom: "video",
  aliases: ["videodoc", "film", "mp4"],
  categorie: "download",
  reaction: "🎥"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, repondre, userJid } = commandOptions;

  if (!arg[0]) return repondre("Please provide a video name.");

  const query = arg.join(" ");

  try {
    // Notify user that download is starting
    await zk.sendMessage(dest, {
      text: "🔍 Searching for video... Please wait...",
      contextInfo: getContextInfo("Searching", userJid)
    }, { quoted: ms });

    // Perform YouTube search
    const searchResults = await ytSearch(query);
    if (!searchResults?.videos?.length) {
      return repondre('No video found for the specified query.');
    }

    const firstVideo = searchResults.videos[0];
    const videoUrl = firstVideo.url;
    const thumbnail = firstVideo.thumbnail;

    // Notify user that download is in progress
    await zk.sendMessage(dest, {
      text: "⬇️ Downloading video... This may take a moment...",
      contextInfo: getContextInfo("Downloading", userJid, thumbnail)
    }, { quoted: ms });

    // Try multiple video download APIs
    const apis = [
      `https://api.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
      `https://www.dark-yasiya-api.site/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
      `https://api.giftedtech.web.id/api/download/dlmp4?url=${encodeURIComponent(videoUrl)}&apikey=gifted-md`,
      `https://api.dreaded.site/api/ytdl/video?url=${encodeURIComponent(videoUrl)}`
    ];

    let downloadData;
    for (const api of apis) {
      try {
        const response = await axios.get(api);
        if (response.data?.success) {
          downloadData = response.data;
          break;
        }
      } catch (e) { continue; }
    }

    if (!downloadData?.success) {
      return repondre('Failed to retrieve download URL from all sources.');
    }

    const downloadUrl = downloadData.result.download_url;
    const videoDetails = downloadData.result;

    // Prepare message payloads with video thumbnail
    const messagePayloads = [
      {
        video: { url: downloadUrl },
        mimetype: 'video/mp4',
        caption: `🎥 *${videoDetails.title}*`,
        contextInfo: getContextInfo(videoDetails.title, userJid, thumbnail)
      },
      {
        document: { url: downloadUrl },
        mimetype: 'video/mp4',
        fileName: `${videoDetails.title}.mp4`.replace(/[^\w\s.-]/gi, ''),
        caption: `📁 *${videoDetails.title}* (Document)`,
        contextInfo: getContextInfo(videoDetails.title, userJid, thumbnail)
      }
    ];

    // Send downloads
    for (const payload of messagePayloads) {
      await zk.sendMessage(dest, payload, { quoted: ms });
    }

  } catch (error) {
    console.error('Video download error:', error);
    repondre(`Download failed: ${error.message}`);
  }
});

// Command to upload media and get URL
keith({
  nomCom: 'url',
  categorie: "download",
  reaction: '👨🏿‍💻'
}, async (dest, zk, commandOptions) => {
  const { msgRepondu, repondre, userJid } = commandOptions;

  if (!msgRepondu) return repondre("Please mention an image, video, or audio.");

  let mediaPath;
  const mediaTypes = [
    'videoMessage', 'gifMessage', 'stickerMessage', 
    'documentMessage', 'imageMessage', 'audioMessage'
  ];

  for (const type of mediaTypes) {
    if (msgRepondu[type]) {
      mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu[type]);
      break;
    }
  }

  if (!mediaPath) return repondre("Unsupported media type.");

  try {
    // Notify user that upload is in progress
    await zk.sendMessage(dest, {
      text: "⬆️ Uploading your file... Please wait...",
      contextInfo: getContextInfo("Uploading", userJid)
    });

    // Upload and send URL
    const fileUrl = await uploadToCatbox(mediaPath);
    fs.unlinkSync(mediaPath);

    await zk.sendMessage(dest, {
      text: `✅ Here's your file URL:\n${fileUrl}`,
      contextInfo: getContextInfo("Upload Complete", userJid)
    });

  } catch (error) {
    console.error("Upload error:", error);
    await zk.sendMessage(dest, {
      text: "❌ Upload failed. Please try again.",
      contextInfo: getContextInfo("Upload Failed", userJid)
    });
    if (fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath);
  }
});

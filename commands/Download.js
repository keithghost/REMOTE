const { keith } = require("../keizzah/keith");
const axios = require('axios');
const ytSearch = require('yt-search');
const conf = require(__dirname + '/../set');
const { Catbox } = require("node-catbox");
const fs = require('fs-extra');
const { repondre } = require(__dirname + "/../keizzah/context");

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
    title: conf.BOT || 'YouTube Downloader',
    body: title || "Media Downloader",
    thumbnailUrl: thumbnailUrl || conf.URL || '',
    sourceUrl: conf.GURL || '',
    mediaType: 1,
    renderLargerThumbnail: false
  }
});

// Function to upload a file to Catbox and return the URL
async function uploadToCatbox(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error("File does not exist");
    }
    const uploadResult = await catbox.uploadFile({ path: filePath });
    return uploadResult || null;
  } catch (error) {
    console.error('Catbox upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

// Common function for YouTube search
async function searchYouTube(query) {
  try {
    const searchResults = await ytSearch(query);
    if (!searchResults?.videos?.length) {
      throw new Error('No video found for the specified query.');
    }
    return searchResults.videos[0];
  } catch (error) {
    console.error('YouTube search error:', error);
    throw new Error(`YouTube search failed: ${error.message}`);
  }
}

// Video download command using the specified API endpoint
keith({
  nomCom: "video",
  aliases: ["videodoc", "film", "mp4"],
  categorie: "download",
  reaction: "🎥"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, userJid } = commandOptions;

  try {
    if (!arg[0]) {
      return repondre(zk, dest, ms, "Please provide a video name or URL.");
    }

    let videoUrl = arg[0];
    let video;
    
    // If it's not a URL, search YouTube
    if (!videoUrl.startsWith('http')) {
      const query = arg.join(" ");
      video = await searchYouTube(query);
      videoUrl = video.url;
    }

    await zk.sendMessage(dest, {
      text: "⬇️ Downloading video... This may take a moment...",
      contextInfo: getContextInfo("Downloading", userJid, video?.thumbnail)
    }, { quoted: ms });

    // Use the specified API endpoint
    const apiUrl = `https://apis-keith.vercel.app/download/dlmp4?url=${encodeURIComponent(videoUrl)}`;
    const response = await axios.get(apiUrl, { timeout: 15000 });
    
    if (!response.data?.status) {
      throw new Error('Failed to retrieve download URL from the API.');
    }

    const { downloadUrl, title, quality } = response.data.result;

    const messagePayloads = [
      {
        video: { url: downloadUrl },
        mimetype: 'video/mp4',
        caption: `🎥 *${title}*\nQuality: ${quality}`,
        contextInfo: getContextInfo(title, userJid, video?.thumbnail)
      },
      {
        document: { url: downloadUrl },
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`.replace(/[^\w\s.-]/gi, ''),
        caption: `📁 *${title}* (Document)\nQuality: ${quality}`,
        contextInfo: getContextInfo(title, userJid, video?.thumbnail)
      }
    ];

    for (const payload of messagePayloads) {
      await zk.sendMessage(dest, payload, { quoted: ms });
    }

  } catch (error) {
    console.error('Video download error:', error);
    repondre(zk, dest, ms, `Download failed: ${error.message}`);
  }
});

// URL upload command
keith({
  nomCom: 'url',
  categorie: "download",
  reaction: '👨🏿‍💻'
}, async (dest, zk, commandOptions) => {
  const { msgRepondu, userJid, ms } = commandOptions;

  try {
    if (!msgRepondu) {
      return repondre(zk, dest, ms, "Please mention an image, video, or audio.");
    }

    const mediaTypes = [
      'videoMessage', 'gifMessage', 'stickerMessage',
      'documentMessage', 'imageMessage', 'audioMessage'
    ];

    const mediaType = mediaTypes.find(type => msgRepondu[type]);
    if (!mediaType) {
      return repondre(zk, dest, ms, "Unsupported media type.");
    }

    const mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu[mediaType]);
    const fileUrl = await uploadToCatbox(mediaPath);
    fs.unlinkSync(mediaPath);

    await zk.sendMessage(dest, {
      text: `✅ Here's your file URL:\n${fileUrl}`,
      contextInfo: getContextInfo("Upload Complete", userJid)
    });

  } catch (error) {
    console.error("Upload error:", error);
    repondre(zk, dest, ms, `Upload failed: ${error.message}`);
  }
});
keith({
  nomCom: "xvideo",
  aliases: ["xvideos", "porn", "xxx"],
  categorie: "download",
  reaction: "🔞"
}, async (dest, zk, commandOptions) => {
  const { arg, ms } = commandOptions;

  /
  if (!arg[0]) {
    return repondre(zk, dest, ms, "Please provide a search term.");
  }

  const query = arg.join(" ");

  try {
    
    const searchResponse = await axios.get(`https://apis-keith.vercel.app/search/searchxvideos?q=${encodeURIComponent(query)}`);
    const searchData = searchResponse.data;

    
    if (!searchData.status || !searchData.result || searchData.result.length === 0) {
      return repondre(zk, dest, ms, 'No videos found for the specified query.');
    }

    const firstVideo = searchData.result[0];
    const videoUrl = firstVideo.url;

    
    const downloadResponse = await axios.get(`https://apis-keith.vercel.app/download/porn?url=${encodeURIComponent(videoUrl)}`);
    const downloadData = downloadResponse.data;

    
    if (!downloadData.status || !downloadData.result) {
      return repondre(zk, dest, ms, 'Failed to retrieve download URL. Please try again later.');
    }

    const downloadUrl = downloadData.result.downloads.highQuality || downloadData.result.downloads.lowQuality;
    const videoInfo = downloadData.result.videoInfo;

    
    const messagePayloads = [
      {
        video: { url: downloadUrl },
        mimetype: 'video/mp4',
        caption: `*${videoInfo.title}*\n\nDuration: ${videoInfo.duration} seconds`,
        contextInfo: {
          externalAdReply: {
            title: videoInfo.title,
            body: "XVIDEOS Search Result",
            mediaType: 1,
            sourceUrl: conf.GURL,
            thumbnailUrl: videoInfo.thumbnail,
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      },
      {
        document: { url: downloadUrl },
        mimetype: 'video/mp4',
        fileName: `${videoInfo.title}.mp4`,
        caption: `*${videoInfo.title}*\n\nDuration: ${videoInfo.duration} seconds`,
        contextInfo: {
          externalAdReply: {
            title: videoInfo.title,
            body: "XVIDEOS Search Result",
            mediaType: 1,
            sourceUrl: conf.GURL,
            thumbnailUrl: videoInfo.thumbnail,
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      }
    ];

    
    for (const messagePayload of messagePayloads) {
      await zk.sendMessage(dest, messagePayload, { quoted: ms });
    }

  } catch (error) {
    console.error('Error during download process:', error);
    return repondre(`Download failed due to an error: ${error.message || error}`);
  }
});


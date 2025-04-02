const { keith } = require("../keizzah/keith");
const axios = require('axios');
const ytSearch = require('yt-search');
const conf = require(__dirname + '/../set');
const { repondre } = require(__dirname + "/../keizzah/context");

// ContextInfo configuration
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
    title: conf.BOT || 'Music Downloader',
    body: title || "Media Downloader",
    thumbnailUrl: thumbnailUrl || conf.URL || '',
    sourceUrl: conf.GURL || '',
    mediaType: 1,
    renderLargerThumbnail: false
  }
});

// Search Functions
async function searchSpotify(query) {
  try {
    const response = await axios.get(`https://apis-keith.vercel.app/search/spotify?q=${encodeURIComponent(query)}`);
    if (!response.data.status || !response.data.result.length) return null;
    return {
      platform: 'spotify',
      ...response.data.result[0]
    };
  } catch {
    return null;
  }
}

async function searchSoundCloud(query) {
  try {
    const response = await axios.get(`https://apis-keith.vercel.app/search/soundcloud?q=${encodeURIComponent(query)}`);
    if (!response.data.status || !response.data.result.result.length) return null;
    const tracks = response.data.result.result.filter(track => track.timestamp);
    if (!tracks.length) return null;
    return {
      platform: 'soundcloud',
      ...tracks[0]
    };
  } catch {
    return null;
  }
}

async function searchYouTube(query) {
  try {
    const { videos } = await ytSearch(query);
    if (!videos || !videos.length) return null;
    return {
      platform: 'youtube',
      title: videos[0].title,
      url: videos[0].url,
      thumbnail: videos[0].thumbnail
    };
  } catch {
    return null;
  }
}

// Download Functions
async function downloadSpotify(url) {
  try {
    const response = await axios.get(`https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(url)}`);
    if (!response.data.status || !response.data.data.download) return null;
    return {
      downloadUrl: response.data.data.download,
      format: 'mp3',
      artist: response.data.data.artis,
      thumbnail: response.data.data.image
    };
  } catch {
    return null;
  }
}

async function downloadSoundCloud(url) {
  try {
    const response = await axios.get(`https://apis-keith.vercel.app/download/soundcloud?url=${encodeURIComponent(url)}`);
    if (!response.data.status || !response.data.result.track.downloadUrl) return null;
    return {
      downloadUrl: response.data.result.track.downloadUrl,
      format: 'mp3'
    };
  } catch {
    return null;
  }
}

async function downloadYouTube(url) {
  try {
    const response = await axios.get(`https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(url)}`);
    if (!response.data.status || !response.data.result.downloadUrl) return null;
    return {
      downloadUrl: response.data.result.downloadUrl,
      format: 'mp3'
    };
  } catch {
    return null;
  }
}

// Main Command
keith({
  nomCom: "pl",
  aliases: ["song", "playdoc", "audio", "mp3"],
  categorie: "download",
  reaction: "🎵"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, userJid } = commandOptions;

  if (!arg[0]) return repondre(zk, dest, ms, "Please provide a song name or URL.");

  const query = arg.join(" ");
  let track, downloadData, platformAttempted = [];

  // Determine platform from URL or try all
  const platforms = [];
  if (query.includes('spotify.com')) platforms.push('spotify');
  if (query.includes('soundcloud.com')) platforms.push('soundcloud');
  if (query.includes('youtube.com') || query.includes('youtu.be')) platforms.push('youtube');
  
  if (platforms.length === 0) {
    platforms.push('spotify', 'soundcloud', 'youtube');
  }

  // Try each platform until success
  for (const platform of platforms) {
    if (platformAttempted.includes(platform)) continue;
    
    platformAttempted.push(platform);
    
    try {
      await zk.sendMessage(dest, {
        text: `🔍 Searching ${platform}...`,
        contextInfo: getContextInfo("Searching", userJid)
      }, { quoted: ms });

      track = await {
        'spotify': searchSpotify,
        'soundcloud': searchSoundCloud,
        'youtube': searchYouTube
      }[platform](query);

      if (!track) continue;

      await zk.sendMessage(dest, {
        text: `⬇️ Downloading from ${platform}...`,
        contextInfo: getContextInfo(track.title, userJid, track.thumbnail || track.thumb)
      }, { quoted: ms });

      downloadData = await {
        'spotify': downloadSpotify,
        'soundcloud': downloadSoundCloud,
        'youtube': downloadYouTube
      }[platform](track.url);

      if (downloadData) break;
    } catch (error) {
      console.error(`${platform} error:`, error);
      continue;
    }
  }

  if (!track || !downloadData) {
    return repondre(zk, dest, ms, "❌ Failed to find or download the track from all platforms.");
  }

  // Prepare and send messages
  const artist = downloadData.artist || track.artist || 'Unknown Artist';
  const thumbnail = downloadData.thumbnail || track.thumbnail || track.thumb || '';
  const fileName = `${track.title} - ${artist}.${downloadData.format}`.replace(/[^\w\s.-]/gi, '');

  try {
    await zk.sendMessage(dest, {
      audio: { url: downloadData.downloadUrl },
      mimetype: `audio/${downloadData.format}`,
      caption: `🎵 *${track.title}* by ${artist}`,
      contextInfo: getContextInfo(track.title, userJid, thumbnail)
    }, { quoted: ms });

    await zk.sendMessage(dest, {
      document: { url: downloadData.downloadUrl },
      mimetype: `audio/${downloadData.format}`,
      fileName: fileName,
      caption: `📁 *${track.title}* by ${artist} (Document)`,
      contextInfo: getContextInfo(track.title, userJid, thumbnail)
    }, { quoted: ms });
  } catch (error) {
    console.error('Message sending error:', error);
    repondre(zk, dest, ms, "⚠️ Track downloaded but failed to send. Please try again.");
  }
});

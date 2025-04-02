const { keith } = require("../keizzah/keith");
const axios = require('axios');
const ytSearch = require('yt-search');
const conf = require(__dirname + '/../set');
const { repondre } = require(__dirname + "/../keizzah/context");

// ContextInfo configuration - Modified to use track URL when available
const getContextInfo = (title = '', userJid = '', thumbnailUrl = '', sourceUrl = '') => ({
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
    sourceUrl: sourceUrl || '', // Now uses the track URL when available
    mediaType: 1,
    renderLargerThumbnail: false
  }
});

// [Rest of your search and download functions remain exactly the same...]

keith({
  nomCom: "pl",
  aliases: ["song", "playdoc", "audio", "mp3"],
  categorie: "download",
  reaction: "🎵"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, userJid } = commandOptions;

  if (!arg[0]) return repondre(zk, dest, ms, "Please provide a song name or URL.");

  const query = arg.join(" ");
  let track, downloadData;

  // Determine platform priority (SoundCloud → Spotify → YouTube)
  const platforms = [];
  if (query.includes('soundcloud.com')) platforms.push('soundcloud');
  if (query.includes('spotify.com')) platforms.push('spotify');
  if (query.includes('youtube.com') || query.includes('youtu.be')) platforms.push('youtube');
  
  if (platforms.length === 0) {
    platforms.push('soundcloud', 'spotify', 'youtube');
  }

  // Try each platform until success
  for (const platform of platforms) {
    try {
      const searchFn = {
        'spotify': searchSpotify,
        'soundcloud': searchSoundCloud,
        'youtube': searchYouTube
      }[platform];
      
      track = await searchFn(query);
      if (!track) continue;

      const downloadFn = {
        'spotify': downloadSpotify,
        'soundcloud': downloadSoundCloud,
        'youtube': downloadYouTube
      }[platform];
      
      downloadData = await downloadFn(track.url);
      if (downloadData) break;
    } catch (error) {
      console.error(`${platform} error:`, error);
      continue;
    }
  }

  if (!track || !downloadData) {
    return repondre(zk, dest, ms, "❌ Failed to find or download the track from all platforms.");
  }

  const artist = downloadData.artist || track.artist || 'Unknown Artist';
  const thumbnail = downloadData.thumbnail || track.thumbnail || track.thumb || '';
  const fileName = `${track.title} - ${artist}.${downloadData.format}`.replace(/[^\w\s.-]/gi, '');
  const sourceUrl = track.url || `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  try {
    await zk.sendMessage(dest, {
      audio: { url: downloadData.downloadUrl },
      mimetype: `audio/${downloadData.format}`,
      contextInfo: getContextInfo(track.title, userJid, thumbnail, track.url) // Using track URL here
    }, { quoted: ms });

    await zk.sendMessage(dest, {
      document: { url: downloadData.downloadUrl },
      mimetype: `audio/${downloadData.format}`,
      fileName: fileName,
      caption: `📁 *${track.title}* by ${artist} (Document)`,
      contextInfo: getContextInfo(track.title, userJid, thumbnail, track.url) // Using track URL here
    }, { quoted: ms });
  } catch (error) {
    console.error('Message sending error:', error);
    repondre(zk, dest, ms, "⚠️ Track downloaded but failed to send. Please try again.");
  }
});

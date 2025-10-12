const { keith } = require("../keizzah/keith");
const axios = require('axios');
const ytSearch = require('yt-search');
const conf = require(__dirname + '/../set');

keith({
  nomCom: "play",
  aliases: ["song", "playdoc", "audio", "mp3"],
  categorie: "Search",
  reaction: "🎥"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, repondre } = commandOptions;

  if (!arg[0]) return repondre("Please provide a video name or YouTube link.");

  let videoUrl, videoInfo;
  const query = arg.join(" ");

  try {
    // Determine if input is a YouTube URL or search query
    if (query.match(/(youtube\.com|youtu\.be)/i)) {
      videoUrl = query;
      const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
      videoInfo = await ytSearch({ videoId });
    } else {
      const searchResults = await ytSearch(query);
      if (!searchResults || !searchResults.videos.length) return repondre('No video found for the specified query.');
      videoInfo = searchResults.videos[0];
      videoUrl = videoInfo.url;
    }

    // Fetch audio download URL from Keith API
    const apiUrl = `https://apis-keith.vercel.app/download/audio?url=${encodeURIComponent(videoUrl)}`;
    const response = await axios.get(apiUrl, { timeout: 100000 });
    const data = response.data;

    if (!data || !data.status || !data.result) {
      return repondre('Failed to retrieve audio. Please try again later.');
    }

    const downloadUrl = data.result;
    const title = videoInfo.title || 'Audio Download';
    const thumbnail = videoInfo.thumbnail || 'https://i.ytimg.com/vi/2WmBa1CviYE/hqdefault.jpg';

    const contextInfo = {
      externalAdReply: {
        title,
        body: 'Powered by Keith API',
        mediaType: 1,
        sourceUrl: conf.GURL || videoUrl,
        thumbnailUrl: thumbnail,
        renderLargerThumbnail: false
      }
    };

    // Send audio message
    await zk.sendMessage(dest, {
      audio: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      contextInfo
    }, { quoted: ms });

    // Send document version
    await zk.sendMessage(dest, {
      document: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      fileName: `${title.replace(/[^\w\s]/gi, '')}.mp3`,
      contextInfo: {
        ...contextInfo,
        externalAdReply: {
          ...contextInfo.externalAdReply,
          body: 'Document version - Powered by Keith API'
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Download error:', error);
    return repondre(`Download failed due to an error: ${error.message || error}`);
  }
});


keith({
  nomCom: "video",
  aliases: ["ytv", "mp4", "ytmp4", "dlm4"],
  categorie: "Search",
  reaction: "🎥"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, repondre } = commandOptions;

  if (!arg[0]) return repondre("Please provide a video name or YouTube link.");

  let videoUrl, videoInfo;
  const query = arg.join(" ");

  try {
    // Determine if input is a YouTube URL or search query
    if (query.match(/(youtube\.com|youtu\.be)/i)) {
      videoUrl = query;
      const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
      videoInfo = await ytSearch({ videoId });
    } else {
      const searchResults = await ytSearch(query);
      if (!searchResults || !searchResults.videos.length) return repondre('No video found for the specified query.');
      videoInfo = searchResults.videos[0];
      videoUrl = videoInfo.url;
    }

    // Fetch audio download URL from Keith API
    const apiUrl = `https://apis-keith.vercel.app/download/video?url=${encodeURIComponent(videoUrl)}`;
    const response = await axios.get(apiUrl, { timeout: 100000 });
    const data = response.data;

    if (!data || !data.status || !data.result) {
      return repondre('Failed to retrieve audio. Please try again later.');
    }

    const downloadUrl = data.result;
    const title = videoInfo.title || 'Audio Download';
    const thumbnail = videoInfo.thumbnail || 'https://i.ytimg.com/vi/2WmBa1CviYE/hqdefault.jpg';

    const contextInfo = {
      externalAdReply: {
        title,
        body: 'Powered by Keith API',
        mediaType: 1,
        sourceUrl: conf.GURL || videoUrl,
        thumbnailUrl: thumbnail,
        renderLargerThumbnail: false
      }
    };

    // Send audio message
    await zk.sendMessage(dest, {
      video: { url: downloadUrl },
      mimetype: 'video/mp4',
      contextInfo
    }, { quoted: ms });

    // Send document version
    await zk.sendMessage(dest, {
      document: { url: downloadUrl },
      mimetype: 'video/mp4',
      fileName: `${title.replace(/[^\w\s]/gi, '')}.mp3`,
      contextInfo: {
        ...contextInfo,
        externalAdReply: {
          ...contextInfo.externalAdReply,
          body: 'Document version - Powered by Keith API'
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Download error:', error);
    return repondre(`Download failed due to an error: ${error.message || error}`);
  }
});

      

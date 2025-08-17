const { keith } = require("../keizzah/keith");
const axios = require('axios');
const ytSearch = require('yt-search');
const conf = require(__dirname + '/../set');

// Define the command with aliases for play
keith({
  nomCom: "play",
  aliases: ["song", "playdoc", "audio", "mp3"],
  categorie: "Search",
  reaction: "🎥"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, repondre } = commandOptions;

  // Check if a query is provided
  if (!arg[0]) {
    return repondre("Please provide a video name or YouTube link.");
  }

  let videoUrl, videoInfo;
  const query = arg.join(" ");

  try {
    // Check if it's a YouTube URL
    if (query.match(/(youtube\.com|youtu\.be)/i)) {
      videoUrl = query;
      // Extract video ID for getting info
      const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
      videoInfo = await ytSearch({ videoId });
    } else {
      // Perform a YouTube search based on the query
      const searchResults = await ytSearch(query);

      // Check if any videos were found
      if (!searchResults || !searchResults.videos.length) {
        return repondre('No video found for the specified query.');
      }

      videoInfo = searchResults.videos[0];
      videoUrl = videoInfo.url;
    }

    // Function to get download data from APIs
    const getDownloadData = async (url) => {
      try {
        const response = await axios.get(url, { timeout: 10000 });
        return response.data;
      } catch (error) {
        console.error('Error fetching data from API:', error.message);
        return { status: false };
      }
    };

    // List of APIs to try in order
    const apis = [
      `https://apis-keith.vercel.app/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
      `https://apis-keith.vercel.app/download/mp3?url=${encodeURIComponent(videoUrl)}`,
      `https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(videoUrl)}`,
      `https://apis-keith.vercel.app/download/audio?url=${encodeURIComponent(videoUrl)}`
    ];

    let downloadUrl;
    
    // Try each API in order until we get a successful response
    for (const api of apis) {
      const data = await getDownloadData(api);
      
      if (data && data.status) {
        // Extract download URL based on API response structure
        if (api.includes('ytmp3')) {
          downloadUrl = data.result.url;
        } else if (api.includes('mp3')) {
          downloadUrl = data.result.downloadUrl;
        } else if (api.includes('dlmp3')) {
          downloadUrl = data.result.data.downloadUrl;
        } else if (api.includes('audio')) {
          downloadUrl = data.result;
        }
        
        if (downloadUrl) break;
      }
    }

    // If no download URL was found
    if (!downloadUrl) {
      return repondre('Failed to retrieve download URL from all sources. Please try again later.');
    }

    // Prepare the message payloads for both audio and document
    const messagePayloads = [
      // Audio message
      {
        audio: { url: downloadUrl },
        mimetype: 'audio/mpeg',
        contextInfo: {
          externalAdReply: {
            title: videoInfo.title || 'Audio Download',
            body: 'Powered by Keith API',
            mediaType: 1,
            sourceUrl: conf.GURL || videoUrl,
            thumbnailUrl: videoInfo.thumbnail || 'https://i.ytimg.com/vi/2WmBa1CviYE/hqdefault.jpg',
            renderLargerThumbnail: false
          }
        }
      },
      // Document message (mp3 file)
      {
        document: { url: downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: `${videoInfo.title.replace(/[^\w\s]/gi, '')}.mp3` || 'audio.mp3',
        contextInfo: {
          externalAdReply: {
            title: videoInfo.title || 'Audio Download',
            body: 'Document version - Powered by Keith API',
            mediaType: 1,
            sourceUrl: conf.GURL || videoUrl,
            thumbnailUrl: videoInfo.thumbnail || 'https://i.ytimg.com/vi/2WmBa1CviYE/hqdefault.jpg',
            renderLargerThumbnail: false
          }
        }
      }
    ];

    // Send both audio and document versions
    for (const payload of messagePayloads) {
      await zk.sendMessage(dest, payload, { quoted: ms });
    }

  } catch (error) {
    console.error('Error during download process:', error);
    return repondre(`Download failed due to an error: ${error.message || error}`);
  }
});




// Define the command with aliases for play
keith({
  nomCom: "video",
  aliases: ["ytmp4", "mp4"],
  categorie: "Search",
  reaction: "🎥"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, repondre } = commandOptions;

  // Check if a query is provided
  if (!arg[0]) {
    return repondre("Please provide a video name or YouTube link.");
  }

  let videoUrl, videoInfo;
  const query = arg.join(" ");

  try {
    // Check if it's a YouTube URL
    if (query.match(/(youtube\.com|youtu\.be)/i)) {
      videoUrl = query;
      // Extract video ID for getting info
      const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
      videoInfo = await ytSearch({ videoId });
    } else {
      // Perform a YouTube search based on the query
      const searchResults = await ytSearch(query);

      // Check if any videos were found
      if (!searchResults || !searchResults.videos.length) {
        return repondre('No video found for the specified query.');
      }

      videoInfo = searchResults.videos[0];
      videoUrl = videoInfo.url;
    }

    // Function to get download data from APIs
    const getDownloadData = async (url) => {
      try {
        const response = await axios.get(url, { timeout: 10000 });
        return response.data;
      } catch (error) {
        console.error('Error fetching data from API:', error.message);
        return { status: false };
      }
    };

    // List of APIs to try in order
    const apis = [
      `https://apis-keith.vercel.app/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
      `https://apis-keith.vercel.app/download/mp4?url=${encodeURIComponent(videoUrl)}`,
      `https://apis-keith.vercel.app/download/dlmp4?url=${encodeURIComponent(videoUrl)}`,
      `https://apis-keith.vercel.app/download/video?url=${encodeURIComponent(videoUrl)}`
    ];

    let downloadUrl;
    
    // Try each API in order until we get a successful response
    for (const api of apis) {
      const data = await getDownloadData(api);
      
      if (data && data.status) {
        // Extract download URL based on API response structure
        if (api.includes('ytmp4')) {
          downloadUrl = data.result.url;
        } else if (api.includes('mp4')) {
          downloadUrl = data.result.downloadUrl;
        } else if (api.includes('dlmp4')) {
          downloadUrl = data.result.data.downloadUrl;
        } else if (api.includes('video')) {
          downloadUrl = data.result;
        }
        
        if (downloadUrl) break;
      }
    }

    // If no download URL was found
    if (!downloadUrl) {
      return repondre('Failed to retrieve download URL from all sources. Please try again later.');
    }

    // Prepare the message payloads for both audio and document
    const messagePayloads = [
      // Audio message
      {
        video: { url: downloadUrl },
        mimetype: 'video/mp4',
        contextInfo: {
          externalAdReply: {
            title: videoInfo.title || 'Audio Download',
            body: 'Powered by Keith API',
            mediaType: 1,
            sourceUrl: conf.GURL || videoUrl,
            thumbnailUrl: videoInfo.thumbnail || 'https://i.ytimg.com/vi/2WmBa1CviYE/hqdefault.jpg',
            renderLargerThumbnail: false
          }
        }
      },
      // Document message (mp3 file)
      {
        document: { url: downloadUrl },
        mimetype: 'video/mp4',
        fileName: `${videoInfo.title.replace(/[^\w\s]/gi, '')}.mp3` || 'audio.mp3',
        contextInfo: {
          externalAdReply: {
            title: videoInfo.title || 'Audio Download',
            body: 'Document version - Powered by Keith API',
            mediaType: 1,
            sourceUrl: conf.GURL || videoUrl,
            thumbnailUrl: videoInfo.thumbnail || 'https://i.ytimg.com/vi/2WmBa1CviYE/hqdefault.jpg',
            renderLargerThumbnail: false
          }
        }
      }
    ];

    // Send both audio and document versions
    for (const payload of messagePayloads) {
      await zk.sendMessage(dest, payload, { quoted: ms });
    }

  } catch (error) {
    console.error('Error during download process:', error);
    return repondre(`Download failed due to an error: ${error.message || error}`);
  }
});







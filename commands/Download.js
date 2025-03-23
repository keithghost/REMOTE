const { keith } = require("../keizzah/keith");
const yts = require('yt-search');
const axios = require('axios');

keith({
  nomCom: "play",
  categorie: "Search",
  reaction: "💿"
}, async (origineMessage, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  if (!arg[0]) {
    repondre("Which song do you want?");
    return;
  }

  try {
    const searchQuery = arg.join(" ");
    const search = await yts(searchQuery);
    const videos = search.videos;

    if (!videos || videos.length === 0) {
      repondre('No videos found.');
      return;
    }

    const video = videos[0];
    const videoUrl = video.url;

    const infoMess = {
      image: { url: video.thumbnail },
      caption: `\n*Song Name:* _${video.title}_\n\n*Duration:* _${video.timestamp}_\n\n*URL:* _${video.url}_\n\n_*Downloading...*_\n\n`
    };

    zk.sendMessage(origineMessage, infoMess, { quoted: ms });

    // Fetch the audio download URL from the API
    const apiUrl = `https://apis-keith.vercel.app/download/dlmp3?url=${videoUrl}`;
    const response = await axios.get(apiUrl);

    if (!response.data.status || !response.data.result.downloadUrl) {
      repondre('Failed to fetch the audio download URL.');
      return;
    }

    const audioUrl = response.data.result.downloadUrl;

    // Send the audio file directly using the URL
    zk.sendMessage(origineMessage, { audio: { url: audioUrl }, mimetype: 'audio/mp3' }, { quoted: ms, ptt: false });

  } catch (error) {
    console.error('Error during search or download:', error);
    repondre('An error occurred during the search or download process.');
  }
});

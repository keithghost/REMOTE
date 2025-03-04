const axios = require("axios");

const handlePlaydl = async (link) => {
  const apis = [
    `https://apis.davidcyriltech.my.id/youtube/mp3?url=${link}`,
    `https://api.ryzendesu.vip/api/downloader/ytmp3?url=${link}`
  ];

  for (const api of apis) {
    try {
      const response = await axios.get(api);
      const data = response.data;

      if (data.status === 200 || data.success) {
        return {
          title: data.result?.title,
          artist: data.result?.author,
          thumbnail: data.result?.image,
          downloadUrl: data.result?.downloadUrl || data.url,
        };
      }
    } catch (error) {
      // Continue to the next API if one fails
      continue;
    }
  }

  throw new Error("All APIs might be down or unable to process the request.");
};

module.exports = {
  handlePlaydl,
};

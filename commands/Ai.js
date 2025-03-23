const { keith } = require("../keizzah/keith");
const ai = require('unlimited-ai');
const { repondre, sendMessage } = require('../keizzah/context');
const axios = require('axios');
const wiki = require('wikipedia');
const conf = require(__dirname + "/../set");

keith({
  nomCom: "technews",
  reaction: '📰',
  categorie: 'search'
}, async (dest, zk, context) => {
  const { ms } = context;

  try {
    // Fetching tech news from the API
    const response = await axios.get("https://fantox001-scrappy-api.vercel.app/technews/random");
    const data = response.data;
    const { thumbnail, news } = data;

    await sendMessage(zk, dest, ms, {
      text: news,
      contextInfo: {
        externalAdReply: {
          title: "ALPHA-MD TECH NEWS",
          body: "keep learning", 
          thumbnailUrl: thumbnail, 
          sourceUrl: conf.GURL, 
          mediaType: 1,
          showAdAttribution: true, 
        },
      },
    }, { quoted: ms });

  } catch (error) {
    console.error("Error fetching tech news:", error);
    await repondre(zk, dest, ms, "Sorry, there was an error retrieving the news. Please try again later.\n" + error.message);
  }
});

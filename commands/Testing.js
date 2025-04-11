const { keith } = require("../keizzah/keith");
const { repondre } = require('../keizzah/context');
const axios = require('axios');
const conf = require(__dirname + "/../set");

keith({
  nomCom: "tinyurl",
  reaction: '🔗',
  categorie: "utility"
}, async (dest, zk, commandeOptions) => {
  const { arg, ms } = commandeOptions;
  const url = arg.join(" ");
  
  if (!url) {
    return repondre(zk, dest, ms, "Please provide a URL to shorten. Example: tinyurl https://github.com/Keithkeizzah/ALPHA-MD");
  }
  
  // Validate URL format
  if (!url.match(/^https?:\/\//i)) {
    return repondre(zk, dest, ms, "Invalid URL format. Please include http:// or https://");
  }
  
  try {
    const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    
    if (!response.data || response.data.includes("Error")) {
      return repondre(zk, dest, ms, "Failed to shorten URL. Please check if the URL is valid.");
    }
    
    const shortenedUrl = response.data;
    
    await repondre(zk, dest, ms, `🔗 *TinyURL Created* 🔗\n\n⧭ *Original URL:* ${url}\n⧭ *Shortened URL:* ${shortenedUrl}\n\n╭────────────────◆\n│ *_Powered by ${conf.OWNER_NAME}*\n╰─────────────────◆`);

  } catch (error) {
    console.error("Error shortening URL:", error);
    await repondre(zk, dest, ms, "An error occurred while shortening the URL. Please try again later.\n" + error.message);
  }
});

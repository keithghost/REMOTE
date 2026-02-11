const { keith } = require('../commandHandler');
const axios = require('axios');

const fetchLogoUrl = async (url, name) => {
  try {
    const response = await axios.get(
      `https://apiskeith.top/logo/ephoto?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`
    );

    const { result } = response.data || {};
    return result?.download_url || null;
  } catch (error) {
    console.error("Error fetching logo:", error.message);
    return null;
  }
};

const styles = {
  "1917": "https://en.ephoto360.com/1917-style-text-effect-523.html",
  "advancedglow": "https://en.ephoto360.com/advanced-glow-effects-74.html",
  "cartoonstyle": "https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html",
  
};

for (const [pattern, url] of Object.entries(styles)) {
  keith({
    pattern,
    category: "ephoto",
    description: `Generate text logo using Ephoto style: ${pattern}`
  },
  async (from, client, conText) => {
    const { q, mek, reply } = conText;

    if (!q) {
      return reply(`_Please provide text to create logo_\nUsage: .${pattern} <text>`);
    }

    try {
      const logoUrl = await fetchLogoUrl(url, q);

      if (logoUrl) {
        await client.sendMessage(from, {
          image: { url: logoUrl }
        }, { quoted: mek });
      } else {
        reply("_Unable to fetch logo. Please try again later._");
      }
    } catch (error) {
      console.error(`${pattern} logo command error:`, error);
      reply(`❌ An error occurred:\n${error.message}`);
    }
  });
}

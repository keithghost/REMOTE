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



const fetchLogoUrl2 = async (url, text1, text2) => {
  try {
    const response = await axios.get(
      `https://apiskeith.top/logo/ephoto2?url=${encodeURIComponent(url)}&text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`
    );

    const { result } = response.data || {};
    return result?.download_url || null;
  } catch (error) {
    console.error("Error fetching two-text logo:", error.message);
    return null;
  }
};



// ✅ Register each two-text style as a command

const styles = {
  "1917": "https://en.ephoto360.com/1917-style-text-effect-523.html",
  "advancedglow": "https://en.ephoto360.com/advanced-glow-effects-74.html",
  "cartoonstyle": "https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html",
  
};
const styles2 = {
  "deadpool": "https://en.ephoto360.com/create-text-effects-in-the-style-of-the-deadpool-logo-818.html",
  "thor": "https://en.ephoto360.com/create-thor-logo-style-text-effects-online-for-free-796.html",
  // add more two-text styles here...
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
for (const [pattern, url] of Object.entries(styles2)) {
  keith({
    pattern,
    category: "ephoto",
    description: `Generate two-text logo using Ephoto style: ${pattern}`
  },
  async (from, client, conText) => {
    const { q, mek, reply } = conText;

    // Expect input like: .deadpool <text1>|<text2>
    if (!q || !q.includes("|")) {
      return reply(`_Please provide two texts separated by '|'.\nUsage: .${pattern} text1|text2_`);
    }

    const [text1, text2] = q.split("|").map(s => s.trim());
    if (!text1 || !text2) {
      return reply("_Both text1 and text2 are required._");
    }

    try {
      const logoUrl = await fetchLogoUrl2(url, text1, text2);

      if (logoUrl) {
        await client.sendMessage(from, {
          image: { url: logoUrl }
        }, { quoted: mek });
      } else {
        reply("_Unable to fetch logo. Please try again later._");
      }
    } catch (error) {
      console.error(`${pattern} two-text logo command error:`, error);
      reply(`❌ An error occurred:\n${error.message}`);
    }
  });
}


const { keith } = require('../commandHandler');
const axios = require('axios');

// helper function
const fetchLogoUrl = async (url, name) => {
  try {
    const response = await axios.get(
      `https://apiskeith.vercel.app/logo/ephoto?url=${url}&name=${encodeURIComponent(name)}`
    );
    const data = response.data;

    if (data && data.result && data.result.download_url) {
      return data.result.download_url;
    }

    console.error("Invalid response structure:", data);
    return null;
  } catch (error) {
    console.error("Error fetching logo:", error);
    return null;
  }
};
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
keith({
  pattern: "lighteffect",
  category: "ephoto",
  description: "Generate text logo using Ephoto API"
},
async (from, client, conText) => {
  const { q, mek, reply } = conText;

  if (!q) {
    return reply("_Please provide text to create logo_");
  }

  try {
    const logoUrl = await fetchLogoUrl(
      "https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html",
      q
    );

    if (logoUrl) {
      await client.sendMessage(from, {
        image: { url: logoUrl }
      }, { quoted: mek });
    } else {
      reply("_Unable to fetch logo. Please try again later._");
    }
  } catch (error) {
    console.error("Thunder logo command error:", error);
    reply(`❌ An error occurred:\n${error.message}`);
  }
});
//========================================================================================================================
keith({
  pattern: "icetext",
  category: "ephoto",
  description: "Generate text logo using Ephoto API"
},
async (from, client, conText) => {
  const { q, mek, reply } = conText;

  if (!q) {
    return reply("_Please provide text to create logo_");
  }

  try {
    const logoUrl = await fetchLogoUrl(
      "https://en.ephoto360.com/ice-text-effect-online-101.html",
      q
    );

    if (logoUrl) {
      await client.sendMessage(from, {
        image: { url: logoUrl }
      }, { quoted: mek });
    } else {
      reply("_Unable to fetch logo. Please try again later._");
    }
  } catch (error) {
    console.error("Thunder logo command error:", error);
    reply(`❌ An error occurred:\n${error.message}`);
  }
});
//========================================================================================================================
keith({
  pattern: "incadescent",
  category: "ephoto",
  description: "Generate text logo using Ephoto API"
},
async (from, client, conText) => {
  const { q, mek, reply } = conText;

  if (!q) {
    return reply("_Please provide text to create logo_");
  }

  try {
    const logoUrl = await fetchLogoUrl(
      "https://en.ephoto360.com/text-effects-incandescent-bulbs-219.html",
      q
    );

    if (logoUrl) {
      await client.sendMessage(from, {
        image: { url: logoUrl }
      }, { quoted: mek });
    } else {
      reply("_Unable to fetch logo. Please try again later._");
    }
  } catch (error) {
    console.error("Thunder logo command error:", error);
    reply(`❌ An error occurred:\n${error.message}`);
  }
});
//========================================================================================================================
keith({
  pattern: "tattoo",
  category: "ephoto",
  description: "Generate text logo using Ephoto API"
},
async (from, client, conText) => {
  const { q, mek, reply } = conText;

  if (!q) {
    return reply("_Please provide text to create logo_");
  }

  try {
    const logoUrl = await fetchLogoUrl(
      "https://en.ephoto360.com/make-tattoos-online-by-your-name-309.html",
      q
    );

    if (logoUrl) {
      await client.sendMessage(from, {
        image: { url: logoUrl }
      }, { quoted: mek });
    } else {
      reply("_Unable to fetch logo. Please try again later._");
    }
  } catch (error) {
    console.error("Thunder logo command error:", error);
    reply(`❌ An error occurred:\n${error.message}`);
  }
});
//========================================================================================================================
keith({
  pattern: "zodiac",
  category: "ephoto",
  description: "Generate text logo using Ephoto API"
},
async (from, client, conText) => {
  const { q, mek, reply } = conText;

  if (!q) {
    return reply("_Please provide text to create logo_");
  }

  try {
    const logoUrl = await fetchLogoUrl(
      "https://en.ephoto360.com/free-zodiac-online-logo-maker-491.html",
      q
    );

    if (logoUrl) {
      await client.sendMessage(from, {
        image: { url: logoUrl }
      }, { quoted: mek });
    } else {
      reply("_Unable to fetch logo. Please try again later._");
    }
  } catch (error) {
    console.error("Thunder logo command error:", error);
    reply(`❌ An error occurred:\n${error.message}`);
  }
});
//========================================================================================================================
keith({
  pattern: "comic",
  category: "ephoto",
  description: "Generate text logo using Ephoto API"
},
async (from, client, conText) => {
  const { q, mek, reply } = conText;

  if (!q) {
    return reply("_Please provide text to create logo_");
  }

  try {
    const logoUrl = await fetchLogoUrl(
      "https://en.ephoto360.com/create-online-3d-comic-style-text-effects-817.html",
      q
    );

    if (logoUrl) {
      await client.sendMessage(from, {
        image: { url: logoUrl }
      }, { quoted: mek });
    } else {
      reply("_Unable to fetch logo. Please try again later._");
    }
  } catch (error) {
    console.error("Thunder logo command error:", error);
    reply(`❌ An error occurred:\n${error.message}`);
  }
});
//========================================================================================================================
keith({
  pattern: "graffiti",
  category: "ephoto",
  description: "Generate text logo using Ephoto API"
},
async (from, client, conText) => {
  const { q, mek, reply } = conText;

  if (!q) {
    return reply("_Please provide text to create logo_");
  }

  try {
    const logoUrl = await fetchLogoUrl(
      "https://en.ephoto360.com/cover-graffiti-181.html",
      q
    );

    if (logoUrl) {
      await client.sendMessage(from, {
        image: { url: logoUrl }
      }, { quoted: mek });
    } else {
      reply("_Unable to fetch logo. Please try again later._");
    }
  } catch (error) {
    console.error("Thunder logo command error:", error);
    reply(`❌ An error occurred:\n${error.message}`);
  }
});
//========================================================================================================================
keith({
  pattern: "firework",
  category: "ephoto",
  description: "Generate text logo using Ephoto API"
},
async (from, client, conText) => {
  const { q, mek, reply } = conText;

  if (!q) {
    return reply("_Please provide text to create logo_");
  }

  try {
    const logoUrl = await fetchLogoUrl(
      "https://en.ephoto360.com/vibrant-fireworks-text-effect-535.html",
      q
    );

    if (logoUrl) {
      await client.sendMessage(from, {
        image: { url: logoUrl }
      }, { quoted: mek });
    } else {
      reply("_Unable to fetch logo. Please try again later._");
    }
  } catch (error) {
    console.error("Thunder logo command error:", error);
    reply(`❌ An error occurred:\n${error.message}`);
  }
});
//========================================================================================================================
keith({
  pattern: "underwater",
  category: "ephoto",
  description: "Generate text logo using Ephoto API"
},
async (from, client, conText) => {
  const { q, mek, reply } = conText;

  if (!q) {
    return reply("_Please provide text to create logo_");
  }

  try {
    const logoUrl = await fetchLogoUrl(
      "https://en.ephoto360.com/3d-underwater-text-effect-online-682.html",
      q
    );

    if (logoUrl) {
      await client.sendMessage(from, {
        image: { url: logoUrl }
      }, { quoted: mek });
    } else {
      reply("_Unable to fetch logo. Please try again later._");
    }
  } catch (error) {
    console.error("Thunder logo command error:", error);
    reply(`❌ An error occurred:\n${error.message}`);
  }
});
//========================================================================================================================
keith({
  pattern: "lighteffect",
  category: "ephoto",
  description: "Generate text logo using Ephoto API"
},
async (from, client, conText) => {
  const { q, mek, reply } = conText;

  if (!q) {
    return reply("_Please provide text to create logo_");
  }

  try {
    const logoUrl = await fetchLogoUrl(
      "https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html",
      q
    );

    if (logoUrl) {
      await client.sendMessage(from, {
        image: { url: logoUrl }
      }, { quoted: mek });
    } else {
      reply("_Unable to fetch logo. Please try again later._");
    }
  } catch (error) {
    console.error("Thunder logo command error:", error);
    reply(`❌ An error occurred:\n${error.message}`);
  }
});
//========================================================================================================================

keith({
  pattern: "thunder",
  aliases: ["thunderlogo", "ephoto-thunder"],
  category: "ephoto",
  description: "Generate thunder text logo using Ephoto API"
},
async (from, client, conText) => {
  const { q, mek, reply } = conText;

  if (!q) {
    return reply("_Please provide text to create logo_");
  }

  try {
    const logoUrl = await fetchLogoUrl(
      "https://en.ephoto360.com/thunder-text-effect-online-97.html",
      q
    );

    if (logoUrl) {
      await client.sendMessage(from, {
        image: { url: logoUrl }
      }, { quoted: mek });
    } else {
      reply("_Unable to fetch logo. Please try again later._");
    }
  } catch (error) {
    console.error("Thunder logo command error:", error);
    reply(`❌ An error occurred:\n${error.message}`);
  }
});

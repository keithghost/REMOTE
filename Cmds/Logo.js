const { keith } = require('../commandHandler');

// Map of styles to their Ephoto URLs
const styles = {
  "1917": "https://en.ephoto360.com/1917-style-text-effect-523.html",
  "advancedglow": "https://en.ephoto360.com/advanced-glow-effects-74.html",
  "cartoonstyle": "https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html",
  // add more styles here...
};

// Loop through styles and register each as a command
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

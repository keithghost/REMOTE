const { keith } = require('../commandHandler');

// Map of styles to their Ephoto URLs
const styles = {
  "1917": "https://en.ephoto360.com/1917-style-text-effect-523.html",
  "advancedglow": "https://en.ephoto360.com/advanced-glow-effects-74.html",
  "cartoonstyle": "https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html",
  // add more styles here...
};

keith({
  pattern: "styles",
  category: "ephoto",
  description: "Generate text logo using Ephoto styles"
},
async (from, client, conText) => {
  const { q, mek, reply } = conText;

  // Expect input like: .styles <style> <text>
  const args = q?.trim().split(/\s+/);
  if (!args || args.length < 2) {
    return reply("_Usage: .styles <style> <text>_\nAvailable styles: " + Object.keys(styles).join(", "));
  }

  const styleKey = args[0].toLowerCase();
  const text = args.slice(1).join(" ");

  if (!styles[styleKey]) {
    return reply("_Unknown style. Available styles: " + Object.keys(styles).join(", ") + "_");
  }

  try {
    const logoUrl = await fetchLogoUrl(styles[styleKey], text);

    if (logoUrl) {
      await client.sendMessage(from, {
        image: { url: logoUrl }
      }, { quoted: mek });
    } else {
      reply("_Unable to fetch logo. Please try again later._");
    }
  } catch (error) {
    console.error("styles command error:", error);
    reply(`❌ An error occurred:\n${error.message}`);
  }
});

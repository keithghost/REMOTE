
const { keith } = require('../commandHandler');

keith({
  pattern: "randomvideo",
  aliases: ["rvid", "randvid", "rv"],
  category: "random",
  description: "Send a random video from API"
}, async (from, client, conText) => {
  const { reply } = conText;

  try {
    const videoUrl = "https://apiskeith.vercel.app/random/randomvideo";

    await client.sendMessage(from, {
      video: { url: videoUrl },
      caption: "🎬 Random Video",
      ptv: true
    });

  } catch (err) {
    console.error("randomvideo error:", err);
    return reply("❌ Failed to fetch random video.");
  }
});

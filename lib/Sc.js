const axios = require('axios');

module.exports = {
  config: {
    name: "sc",
    author: "keithkeizzah",
    description: "Display bot repository information with avatar",
    category: "System",
    usage: ".repo",
    usePrefix: true
  },
  onStart: async function({ bot, chatId }) {
    try {
      // Fetch repo info from GitHub API
      const { data: repo } = await axios.get('https://api.github.com/repos/Keithkeizzah/T-BOT');
      
      // Format dates
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      };

      // Create caption message
      const caption = `
*Hello ,,,👋 This is Keith Md*
The best Telegram bot developed by Keith. Fork and give a star 🌟 to my repo!
╭───────────────────
│✞ *Stars:* ${repo.stargazers_count}
│✞ *Forks:* ${repo.forks_count}
│✞ *Release Date:* ${formatDate(repo.created_at)}
│✞ *Last Update:* ${formatDate(repo.updated_at)}
│✞ *Owner:* ${repo.owner.login}
│✞ *Language:* ${repo.language}
╰───────────────────
      `;

      // Send photo with caption and buttons
      await bot.sendPhoto(chatId, repo.owner.avatar_url, {
        caption: caption,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "⭐ Star Repository", url: repo.html_url },
              { text: "🚀 Visit Channel", url: "https://whatsapp.com/channel/0029Vaan9TF9Bb62l8wpoD47" }
            ],
            [
              { text: "🌐 Visit Website", url: repo.homepage || repo.html_url }
            ]
          ]
        },
        parse_mode: "Markdown"
      });

    } catch (error) {
      console.error("[REPO COMMAND ERROR]", error);
      await bot.sendMessage(chatId, "⚠️ Failed to fetch repository information. Please try again later.");
    }
  }
};

const axios = require('axios');

module.exports = {
    config: {
        name: "apk",
        author: "Keithkeizzah",
        description: "Search and download APKs from APKFab",
        category: "download",
        usage: "[search query] or [download url]",
        usePrefix: true
    },

    onStart: async function ({ bot, chatId, msg, args }) {
        const input = args.join(' ').trim();

        if (!input) {
            return bot.sendMessage(chatId, "Please provide a search query or APKFab URL\n\nExample:\n/apk whatsapp\n/apk https://apkfab.com/whatsapp-messenger/com.whatsapp");
        }

        try {
            // Check if input is a URL
            if (input.startsWith('https://apkfab.com/')) {
                // Download APK
                const downloadUrl = `https://apis-keith.vercel.app/download/apkfab?url=${encodeURIComponent(input)}`;
                const { data } = await axios.get(downloadUrl);

                if (!data.status || !data.result) {
                    throw new Error("Invalid response from API");
                }

                const { title, link, size } = data.result;
                return bot.sendMessage(
                    chatId,
                    `📦 APK Download:\n\n` +
                    `🔹 Title: ${title}\n` +
                    `🔹 Size: ${size}\n\n` +
                    `⬇️ Download Link:\n${link}`,
                    { disable_web_page_preview: true }
                );
            } else {
                // Search APKs
                const searchUrl = `https://apis-keith.vercel.app/search/apkfab?q=${encodeURIComponent(input)}`;
                const { data } = await axios.get(searchUrl);

                if (!data.status || !data.result || data.result.length === 0) {
                    return bot.sendMessage(chatId, "No results found for your query");
                }

                const results = data.result.slice(0, 5); // Show top 5 results
                let message = `🔍 Search Results for "${input}":\n\n`;

                results.forEach((item, index) => {
                    message += `${index + 1}. ${item.title}\n` +
                               `⭐ Rating: ${item.rating || 'N/A'}\n` +
                               `📝 Reviews: ${item.review || 'N/A'}\n` +
                               `🔗 ${item.link}\n\n`;
                });

                message += `To download, reply with:\n/apk [URL from above]`;
                
                return bot.sendMessage(chatId, message, { disable_web_page_preview: true });
            }
        } catch (error) {
            console.error('APK Error:', error);
            return bot.sendMessage(chatId, `❌ Error: ${error.message}`);
        }
    }
};
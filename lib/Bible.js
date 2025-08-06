const axios = require('axios');

module.exports = {
    config: {
        name: "bible",
        author: "keithkeizzah",
        description: "Fetch Bible verses from various translations",
        category: "search",
        usage: "bible <book> <chapter>:<verse> [translation]",
        usePrefix: true,
        role: 0
    },

    onStart: async function ({ bot, chatId, args }) {
        if (args.length === 0) {
            return bot.sendMessage(chatId, `📖 Please specify the book, chapter, and verse you want to read.\nExample: bible john 3:16\n\nAvailable translations: kjv, niv, esv, nasb, nlt`);
        }

        try {
            // Parse arguments
            let [book, chapterVerse, translation = "kjv"] = args;
            
            // Validate translation
            const validTranslations = ["kjv", "niv", "esv", "nasb", "nlt"];
            if (!validTranslations.includes(translation.toLowerCase())) {
                translation = "kjv";
            }

            // Build API URL
            const apiUrl = `https://bible-api.com/${encodeURIComponent(book)}+${encodeURIComponent(chapterVerse)}?translation=${translation}`;
            
            // Fetch Bible verses
            const response = await axios.get(apiUrl);
            const bibleData = response.data;

            // Format the verses
            let formattedVerses = `✝️ *${bibleData.reference} (${bibleData.translation_name})*\n\n`;
            
            bibleData.verses.forEach(verse => {
                formattedVerses += `*${verse.verse}.* ${verse.text}\n`;
            });

            // Add translation note if available
            if (bibleData.translation_note) {
                formattedVerses += `\n_${bibleData.translation_note}_`;
            }

            // Send the formatted verses
            await bot.sendMessage(chatId, formattedVerses, { parse_mode: 'Markdown' });

        } catch (error) {
            console.error('Error fetching Bible verses:', error);
            
            if (error.response?.status === 404) {
                await bot.sendMessage(chatId, "📖 Verse not found. Please check the book, chapter, and verse reference.\nExample: bible john 3:16");
            } else {
                await bot.sendMessage(chatId, "⚠️ An error occurred while fetching Bible verses. Please try again later.");
            }
        }
    }
};
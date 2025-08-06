const axios = require("axios");

module.exports = {
    config: {
        name: "lyrics",
        author: "keithkeizzah",
        description: "Get lyrics of a song",
        category: "search",
        usage: "<song_name>",
        usePrefix: true
    },
    onStart: async function ({ bot, chatId, args }) {
        const query = args.join(" ");

        if (!query) {
            return bot.sendMessage(chatId, "Please provide a song name. Usage: /lyrics [song_name]");
        }

        const searchMessage = await bot.sendMessage(chatId, `🔍 Searching for lyrics: ${query}`);

        try {
            const response = await axios.get(`https://apis-keith.vercel.app/search/lyrics?query=${encodeURIComponent(query)}`);
            
            if (!response.data.status || !response.data.result?.length) {
                return bot.sendMessage(chatId, "No lyrics found for this song.");
            }

            // Get the first result
            const songData = response.data.result[0];
            const { song, artist, album, lyrics } = songData;

            const formattedResponse = 
                `🎵 ${song} - ${artist}\n` +
                `💿 Album: ${album}\n\n` +
                `📜 Lyrics:\n${lyrics}\n\n` +
                `🎧 Join our music channel for more!`;

            // Create single button for channel
            const buttons = [
                {
                    text: "Join WhatsApp Channel",
                    url: "https://whatsapp.com/channel/0029Vaan9TF9Bb62l8wpoD47"
                }
            ];

            await bot.sendMessage(chatId, formattedResponse, {
                reply_markup: {
                    inline_keyboard: [buttons]
                }
            });
        } catch (error) {
            console.error('[LYRICS ERROR]', error);
            await bot.sendMessage(chatId, "An error occurred while fetching the lyrics.");
        } finally {
            await bot.deleteMessage(chatId, searchMessage.message_id);
        }
    }
};
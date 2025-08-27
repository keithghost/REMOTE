const axios = require('axios');

module.exports = {
    config: {
        name: "play",
        author: "keithkeizzah",
        description: "Download audio from YouTube using URL or search query",
        category: "download",
        usage: "ytaudio <youtube-url or search query>",
        usePrefix: true,
        role: 0
    },

    onStart: async function ({ bot, chatId, args }) {
        const sendCleanMessage = async (text) => {
            try {
                await bot.sendMessage(chatId, text);
            } catch (e) {
                console.error("Failed to send message:", e);
            }
        };

        if (args.length === 0) {
            return await sendCleanMessage("🎵 Please provide a YouTube URL or search query.\nExample: /ytaudio https://youtu.be/VIDEO_ID\nOr: /ytaudio spectre alan walker");
        }

        const input = args.join(" ");
        let youtubeUrl = "";

        try {
            // Check if input is a URL
            if (input.includes('youtube.com') || input.includes('youtu.be')) {
                youtubeUrl = input;
            } else {
                // It's a search query - search for videos
                await sendCleanMessage("🔍 Searching for: " + input);
                
                const searchUrl = `https://apis-keith.vercel.app/search/yts?query=${encodeURIComponent(input)}`;
                const searchResponse = await axios.get(searchUrl);
                
                if (!searchResponse.data.status || !searchResponse.data.result || searchResponse.data.result.length === 0) {
                    return await sendCleanMessage("❌ No results found for your search.");
                }

                // Get the first result
                const firstResult = searchResponse.data.result[0];
                youtubeUrl = firstResult.url;
                
                await sendCleanMessage(`🎵 Selected: ${firstResult.title}\n⏳ Downloading audio...`);
            }

            // Download audio using the URL
            const apiUrl = `https://apis-keith.vercel.app/download/ytmp3?url=${encodeURIComponent(youtubeUrl)}`;
            const { data } = await axios.get(apiUrl);
            
            if (!data.status || !data.result || !data.result.url) {
                return await sendCleanMessage("❌ Couldn't download audio from this YouTube video. The video may be private or unavailable.");
            }

            const { filename, url: audioUrl } = data.result;
            const contentCaption = `🎵 ${filename || 'YouTube Audio'}`;

            // Send audio
            try {
                const audioResponse = await axios.get(audioUrl, { 
                    responseType: 'stream',
                    headers: {
                        'Content-Type': 'audio/mpeg'
                    }
                });
                
                await bot.sendAudio(chatId, audioResponse.data, {
                    caption: contentCaption
                });
            } catch (e) {
                console.error("Audio error:", e);
                try {
                    // Fallback: send as document
                    await bot.sendDocument(chatId, audioUrl, {
                        caption: contentCaption
                    });
                } catch (e) {
                    console.error("Document fallback failed:", e);
                    await sendCleanMessage("❌ Failed to send the audio. The file might be too large.");
                }
            }

        } catch (error) {
            console.error('YouTube audio command error:', error);
            await sendCleanMessage("🚫 Couldn't process your request. Please try again.");
        }
    }
};

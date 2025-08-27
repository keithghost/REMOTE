const axios = require('axios');

module.exports = {
    config: {
        name: "ytaudio",
        author: "keithkeizzah",
        description: "Download audio from YouTube",
        category: "download",
        usage: "ytaudio <youtube-url>",
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

        const url = args[0];
        
        if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
            return await sendCleanMessage("🎵 Please provide a valid YouTube URL.\nExample: /ytaudio https://youtu.be/2WmBa1CviYE");
        }

        try {
            await sendCleanMessage("⏳ Downloading YouTube audio...");
            
            // Fetch audio info from API
            const apiUrl = `https://apis-keith.vercel.app/download/ytmp3?url=${encodeURIComponent(url)}`;
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
            await sendCleanMessage("🚫 Couldn't process this YouTube link. Please try another one.");
        }
    }
};

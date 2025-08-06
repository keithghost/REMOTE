const axios = require('axios');

module.exports = {

    config: {

        name: "tiktok",

        author: "keithkeizzah",

        description: "Download videos from TikTok",

        category: "download",

        usage: "tiktok <tiktok-url>",

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

        

        if (!url || (!url.includes('tiktok.com') && !url.includes('vt.tiktok.com'))) {

            return await sendCleanMessage("🎵 Please provide a valid TikTok URL.\nExample: /tiktok https://vt.tiktok.com/ZSje1Vkup/");

        }

        try {

            await sendCleanMessage("⏳ Downloading TikTok content...");

            // Fetch video info from API

            const apiUrl = `https://apis-keith.vercel.app/download/tiktokdl?url=${encodeURIComponent(url)}`;

            const { data } = await axios.get(apiUrl);

            if (!data.status || !data.result) {

                return await sendCleanMessage("❌ Couldn't download this TikTok. The video may be private or unavailable.");

            }

            const { title, caption, nowm, mp3, thumbnail } = data.result;

            const contentCaption = `🎬 ${title || 'TikTok Video'}\n\n${caption || ''}`;

            // Send thumbnail

            try {

                await bot.sendPhoto(chatId, thumbnail, { caption: contentCaption });

            } catch (e) {

                console.error("Thumbnail error:", e);

                await sendCleanMessage(contentCaption);

            }

            // Send video

            if (nowm) {

                try {

                    const videoResponse = await axios.get(nowm, { responseType: 'stream' });

                    await bot.sendVideo(chatId, videoResponse.data, {

                        caption: "⬇️ Video (No Watermark)"

                    });

                } catch (e) {

                    console.error("Video error:", e);

                    try {

                        await bot.sendDocument(chatId, nowm);

                    } catch (e) {

                        console.error("Document fallback failed:", e);

                    }

                }

            }

            // Send audio

            if (mp3) {

                try {

                    const audioResponse = await axios.get(mp3, { responseType: 'stream' });

                    await bot.sendAudio(chatId, audioResponse.data);

                } catch (e) {

                    console.error("Audio error:", e);

                }

            }

        } catch (error) {

            console.error('TikTok command error:', error);

            await sendCleanMessage("🚫 Couldn't process this TikTok link. Please try another one.");

        }

    }

};
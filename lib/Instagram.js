const axios = require('axios');

module.exports = {

    config: {

        name: "instagram",

        author: "keithkeizzah",

        description: "Download Instagram reels",

        category: "download",

        usage: "instagram <reel-url>",

        usePrefix: true,

        role: 0

    },

    onStart: async function ({ bot, chatId, args }) {

        const sendMessage = async (text) => {

            try {

                await bot.sendMessage(chatId, text);

            } catch (e) {

                console.error("Message send error:", e);

            }

        };

        const url = args[0];

        

        if (!url || !url.includes('instagram.com/reel/')) {

            return await sendMessage("📷 Please provide a valid Instagram Reel URL.\nExample: /instagram https://www.instagram.com/reel/DD6q97IuzxD/");

        }

        try {

            await sendMessage("⏳ Downloading Instagram reel...");

            // Fetch from API

            const apiUrl = `https://apis-keith.vercel.app/download/instagramdl?url=${encodeURIComponent(url)}`;

            const { data } = await axios.get(apiUrl);

            if (!data.status || !data.result?.downloadUrl) {

                return await sendMessage("❌ Couldn't download this reel. It may be private or unavailable.");

            }

            const downloadUrl = data.result.downloadUrl;

            // Temporary message while processing

            await sendMessage("⬇️ Preparing your reel...");

            // Download the file first to ensure it's valid

            try {

                const response = await axios({

                    method: 'get',

                    url: downloadUrl,

                    responseType: 'stream',

                    maxRedirects: 5,

                    timeout: 30000

                });

                await bot.sendVideo(chatId, response.data, {

                    caption: "📸 Instagram Reel"

                });

            } catch (e) {

                console.error("Video send error:", e);

                // Fallback to document if video fails

                try {

                    const docResponse = await axios({

                        method: 'get',

                        url: downloadUrl,

                        responseType: 'stream',

                        maxRedirects: 5

                    });

                    await bot.sendDocument(chatId, docResponse.data, {

                        caption: "📸 Instagram Reel (Sent as document)"

                    });

                } catch (docError) {

                    console.error("Document fallback failed:", docError);

                    await sendMessage("❌ Failed to send the reel. The content may be restricted.");

                }

            }

        } catch (error) {

            console.error('Instagram command error:', error);

            await sendMessage("⚠️ Couldn't process this Instagram link. Please try again later.");

        }

    }

};
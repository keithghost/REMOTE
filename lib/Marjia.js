const axios = require('axios');

module.exports = {

    config: {

        name: "marjia",

        author: "keithkeizzah",

        description: "Generate an image using FluxProUltra AI",

        category: "AI",

        usage: "<prompt>",

        usePrefix: true

    },

    onStart: async function ({ bot, chatId, args }) {

        const prompt = args.join(' ');

        if (!prompt) {

            bot.sendMessage(chatId, "Please provide a prompt.");

            return;

        }

        try {

            // Use the new API endpoint

            const apiUrl = `https://www.samirxpikachu.run.place/marjia?prompt=${encodeURIComponent(prompt)}`;

            

            // Fetch the image

            const response = await axios.get(apiUrl, { 

                responseType: 'arraybuffer',

                headers: {

                    'User-Agent': 'Mozilla/5.0'

                }

            });

            

            // Check if we got valid image data

            if (!response.data || response.data.length === 0) {

                throw new Error('Empty response from API');

            }

            const imageData = Buffer.from(response.data, 'binary');

            await bot.sendPhoto(chatId, imageData);

            

        } catch (error) {

            console.error('Error generating image:', error);

            bot.sendMessage(chatId, 'Sorry, an error occurred while generating the image. Please try again later.');

        }

    }

};
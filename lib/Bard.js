const axios = require('axios');

module.exports = {

    config: {

        name: "bard",

        author: "keithkeizzah",

        description: "AI-powered chat response",

        category: "AI",

        usage: "gpt <query>",

        usePrefix: true,

        role: 0

    },

    onStart: async function ({ bot, chatId, args }) {

        const query = args.join(' ');

        if (!query) {

            bot.sendMessage(chatId, "🤖 Please provide a question or prompt.");

            return;

        }

        try {

            const apiUrl = `https://apis-keith.vercel.app/ai/bard?q=${encodeURIComponent(query)}`;

            const response = await axios.get(apiUrl);

            const gptData = response.data;

            if (gptData.status) {

                await bot.sendMessage(chatId, `💬 Bard Response\n\n${gptData.result}`);

            } else {

                throw new Error("Invalid response received from API.");

            }

        } catch (error) {

            console.error('Error fetching GPT response:', error);

            bot.sendMessage(chatId, '⚠️ Sorry, an error occurred while fetching the AI response.');

        }

    }

};
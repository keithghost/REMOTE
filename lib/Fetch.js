const axios = require('axios');

module.exports = {

    config: {

        name: "fetch",

        author: "keithkeizzah",

        description: "Fetch content from any URL",

        category: "utility",

        usage: "<url>",

        usePrefix: true

    },

    onStart: async function ({ bot, chatId, msg, args }) {

        const url = args.join(' ').trim();

        if (!url) {

            return bot.sendMessage(chatId, "❌ Please provide a URL");

        }

        if (!/^https?:\/\//i.test(url)) {

            return bot.sendMessage(chatId, "⚠️ URL must start with http:// or https://");

        }

        try {

            const response = await axios({

                method: 'get',

                url: url,

                responseType: 'arraybuffer',

                validateStatus: () => true // Don't throw on HTTP errors

            });

            if (response.status < 200 || response.status >= 300) {

                return bot.sendMessage(chatId, `🚨 Server responded with ${response.status} status`);

            }

            const contentType = response.headers['content-type'] || '';

            const buffer = Buffer.from(response.data, 'binary');

            // Image handler

            if (/^image\//.test(contentType)) {

                return bot.sendPhoto(chatId, buffer);

            }

            // Video handler

            if (/^video\//.test(contentType)) {

                return bot.sendVideo(chatId, buffer);

            }

            // Audio handler

            if (/^audio\//.test(contentType)) {

                return bot.sendAudio(chatId, buffer);

            }

            // JSON handler

            if (/\/json$/.test(contentType)) {

                const json = JSON.parse(buffer.toString());

                return bot.sendMessage(chatId, JSON.stringify(json, null, 2));

            }

            // Text/HTML handler

            if (/^text\//.test(contentType)) {

                const text = buffer.toString().slice(0, 4000);

                return bot.sendMessage(chatId, text);

            }

            // PDF and other documents

            if (/^application\//.test(contentType)) {

                const filename = url.split('/').pop() || `file_${Date.now()}`;

                return bot.sendDocument(chatId, buffer, {}, filename);

            }

            // Fallback for unknown types

            return bot.sendMessage(chatId, `📦 Unsupported content type: ${contentType}`);

        } catch (error) {

            console.error('Fetch error:', error);

            return bot.sendMessage(chatId, `❌ Failed to fetch: ${error.message}`);

        }

    }

};
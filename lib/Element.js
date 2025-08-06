const axios = require('axios');

module.exports = {
    config: {
        name: "element",
        author: "keithkeizzah",
        description: "Fetch information about chemical elements",
        category: "search",
        usage: "element <element_name_or_symbol>",
        usePrefix: true,
        role: 0
    },

    onStart: async function ({ bot, chatId, args }) {
        if (args.length === 0) {
            return bot.sendMessage(chatId, "⚗️ Please specify an element name or symbol.\nExample: element boron\nExample: element B");
        }

        try {
            const query = args.join(' ');
            const apiUrl = `https://api.popcat.xyz/periodic-table?element=${encodeURIComponent(query)}`;
            
            const response = await axios.get(apiUrl);
            const element = response.data;

            // Format the element information
            const caption = `⚗️ *${element.name} (${element.symbol})*
            
🔢 *Atomic Number:* ${element.atomic_number}
⚖️ *Atomic Mass:* ${element.atomic_mass}
📊 *Period:* ${element.period}
🌡️ *Phase:* ${element.phase}
👨‍🔬 *Discovered by:* ${element.discovered_by}

📝 *Summary:*
${element.summary}`;

            // Send the element image with caption
            await bot.sendPhoto(chatId, element.image, {
                caption: caption,
                parse_mode: 'Markdown'
            });

        } catch (error) {
            console.error('Error fetching element data:', error);
            
            if (error.response?.status === 404) {
                await bot.sendMessage(chatId, "⚠️ Element not found. Please check your input and try again.\nExample: element gold\nExample: element Au");
            } else {
                await bot.sendMessage(chatId, "⚠️ An error occurred while fetching element data. Please try again later.");
            }
        }
    }
};
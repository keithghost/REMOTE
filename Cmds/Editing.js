const { keith } = require('../commandHandler');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const axios = require("axios");

keith({
    pattern: "emix",
    alias: ["emoji-mix", "stickeremix"],
    desc: "Create a mixed sticker from two emojis",
    category: "Editing",
    react: "🎭",
    filename: __filename
}, async (context) => {
    try {
        const { text, reply, botname, m, client } = context;

        if (!text) return reply("❌ No emojis provided.\nUsage: `.emix emoji1+emoji2`");

        const emojis = text.split('+');

        if (emojis.length !== 2) {
            return reply("❌ Specify two emojis separated by `+`.\nExample: `.emix 😂+🔥`");
        }

        const emoji1 = emojis[0].trim();
        const emoji2 = emojis[1].trim();

        try {
            const response = await axios.get(`https://levanter.onrender.com/emix?q=${emoji1}${emoji2}`);

            if (response.data.status) {
                let stickerMess = new Sticker(response.data.result, {
                    pack: botname,
                    type: StickerTypes.CROPPED,
                    categories: ["🤩", "🎉"],
                    id: "12345",
                    quality: 70,
                    background: "transparent",
                });

                const stickerBuffer = await stickerMess.toBuffer();
                client.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });
            } else {
                reply("❌ Unable to create emoji mix. Try different emojis.");
            }
        } catch (error) {
            reply("❌ An error occurred while generating the emoji mix.\n" + error);
        }
    } catch (error) {
        console.error("Error in .emix command:", error);
        reply("❌ An unexpected error occurred while processing your emoji mix request.");
    }
});


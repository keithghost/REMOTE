const { keith } = require('../commandHandler');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const axios = require("axios");
const canvacord = require("canvacord");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const fs = require("fs");
const { exec } = require("child_process");

keith({
    pattern: "toimg",
    alias: ["sticker2img", "convertsticker"],
    desc: "Convert a sticker into an image",
    category: "Editing",
    react: "🖼",
    filename: __filename
}, async (context) => {
    try {
        const { reply, mime, m, client, getRandom } = context;

        if (!m.quoted) {
            return reply("❌ Please quote a sticker with the command.");
        }
        if (!/webp/.test(mime)) {
            return reply("❌ That is not a valid sticker. Quote a sticker with the command.");
        }

        let media = await client.downloadAndSaveMediaMessage(m.quoted);
        let outputImage = getRandom(".png");

        exec(`ffmpeg -i ${media} ${outputImage}`, (err) => {
            fs.unlinkSync(media);
            if (err) {
                console.error("Error converting sticker:", err);
                return reply("❌ An error occurred while converting the sticker.");
            }
            let buffer = fs.readFileSync(outputImage);
            client.sendMessage(m.chat, { image: buffer, caption: "🖼 *Converted from Sticker*" }, { quoted: m });
            fs.unlinkSync(outputImage);
        });

    } catch (error) {
        console.error("Error in .toimg command:", error);
        reply("❌ An unexpected error occurred while converting the sticker.");
    }
});

keith({
    pattern: "tgsticker",
    alias: ["telesticker", "tgs"],
    desc: "Extract stickers from a Telegram sticker set",
    category: "Editing",
    react: "🎭",
    filename: __filename
}, async (context) => {
    try {
        const { text, reply, botname, author, m, client } = context;

        if (!text) {
            return reply("❌ Provide a search term for the sticker.\nExample: `.tgsticker https://t.me/addstickers/PackName`");
        }

        let name;
        if (text.includes("/addstickers/")) {
            name = text.split("/addstickers/")[1];
        } else {
            return reply("❌ Invalid format! Provide a Telegram sticker set URL.");
        }

        let api = `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getStickerSet?name=${encodeURIComponent(name)}`;

        try {
            let stickers = await axios.get(api);
            let type = stickers.data.result.is_animated || stickers.data.result.is_video ? "animated sticker" : "static sticker";

            let msg = `🎭 *Telegram Sticker Set Extracted*\n\n*Name:* ${stickers.data.result.name}\n*Type:* ${type}\n*Stickers:* ${stickers.data.result.stickers.length}\n\nDownloading...`;

            reply(msg);

            for (let i = 0; i < stickers.data.result.stickers.length; i++) {
                let file = await axios.get(`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getFile?file_id=${stickers.data.result.stickers[i].file_id}`);
                let buffer = await axios({
                    method: "get",
                    url: `https://api.telegram.org/file/bot<YOUR_BOT_TOKEN>/${file.data.result.file_path}`,
                    responseType: "arraybuffer",
                });

                const sticker = new Sticker(buffer.data, {
                    pack: botname,
                    author: author,
                    type: StickerTypes.FULL,
                    categories: ["🤩", "🎉"],
                    id: "12345",
                    quality: 50,
                    background: "transparent",
                });

                const stickerBuffer = await sticker.toBuffer();
                await client.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });

                await sleep(1000); // Delay to prevent spam
            }

        } catch (error) {
            reply(`❌ An error occurred while fetching stickers:\n${error.message}`);
        }
    } catch (error) {
        console.error("Error in .tgsticker command:", error);
        reply("❌ An unexpected error occurred while processing the Telegram sticker extraction.");
    }
});

keith({
    pattern: "sticker",
    alias: ["createsticker", "stickerify"],
    desc: "Convert an image or short video into a sticker",
    category: "Editing",
    react: "🎭",
    filename: __filename
}, async (context) => {
    try {
        const { reply, botname, author, m, client, msgKeith } = context;

        if (!msgKeith) {
            return reply("❌ Quote an image or a short video to create a sticker.");
        }

        let media;
        if (msgKeith.imageMessage) {
            media = msgKeith.imageMessage;
        } else if (msgKeith.videoMessage) {
            media = msgKeith.videoMessage;
        } else {
            return reply("❌ That is neither an image nor a short video!");
        }

        const result = await client.downloadAndSaveMediaMessage(media);

        let stickerResult = new Sticker(result, {
            pack: botname,
            author: author,
            type: StickerTypes.FULL,
            categories: ["🤩", "🎉"],
            id: "12345",
            quality: 70,
            background: "transparent",
        });

        const stickerBuffer = await stickerResult.toBuffer();
        client.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });

    } catch (error) {
        console.error("Error in .sticker command:", error);
        reply("❌ An unexpected error occurred while generating the sticker.");
    }
});

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



keith({
    pattern: "rip",
    alias: ["ripimage", "ripsticker"],
    desc: "Apply a RIP effect to a user's profile picture",
    category: "Editing",
    react: "🪦",
    filename: __filename
}, async (context) => {
    try {
        const { reply, Tag, botname, m, client } = context;

        let cap = `Converted By ${botname}`;
        let img;

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else if (Tag && Tag.length > 0) {
            try {
                img = await client.profilePictureUrl(Tag[0], 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else {
            return reply("❌ Please quote a message or tag a user to apply the RIP effect.");
        }

        const result = await canvacord.Canvacord.rip(img);

        await client.sendMessage(m.chat, { image: result, caption: cap }, { quoted: m });

    } catch (error) {
        console.error("Error in .rip command:", error);
        reply("❌ An unexpected error occurred while processing the RIP effect.");
    }
});

keith({
    pattern: "hitler",
    alias: ["hitlerimage", "hitlersticker"],
    desc: "Apply a HITLER effect to a user's profile picture",
    category: "Editing",
    react: "🪦",
    filename: __filename
}, async (context) => {
    try {
        const { reply, Tag, botname, m, client } = context;

        let cap = `Converted By ${botname}`;
        let img;

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else if (Tag && Tag.length > 0) {
            try {
                img = await client.profilePictureUrl(Tag[0], 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else {
            return reply("❌ Please quote a message or tag a user to apply the RIP effect.");
        }

        const result = await canvacord.Canvacord.hitler(img);

        await client.sendMessage(m.chat, { image: result, caption: cap }, { quoted: m });

    } catch (error) {
        console.error("Error in .rip command:", error);
        reply("❌ An unexpected error occurred while processing the RIP effect.");
    }
});

keith({
    pattern: "shit",
    alias: ["shitimage", "shitsticker"],
    desc: "Apply a SHIT effect to a user's profile picture",
    category: "Editing",
    react: "🪦",
    filename: __filename
}, async (context) => {
    try {
        const { reply, Tag, botname, m, client } = context;

        let cap = `Converted By ${botname}`;
        let img;

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else if (Tag && Tag.length > 0) {
            try {
                img = await client.profilePictureUrl(Tag[0], 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else {
            return reply("❌ Please quote a message or tag a user to apply the RIP effect.");
        }

        const result = await canvacord.Canvacord.shit(img);

        await client.sendMessage(m.chat, { image: result, caption: cap }, { quoted: m });

    } catch (error) {
        console.error("Error in .rip command:", error);
        reply("❌ An unexpected error occurred while processing the RIP effect.");
    }
});

keith({
    pattern: "wanted",
    alias: ["wantedimage", "ripsticker"],
    desc: "Apply a wanted effect to a user's profile picture",
    category: "Editing",
    react: "🪦",
    filename: __filename
}, async (context) => {
    try {
        const { reply, Tag, botname, m, client } = context;

        let cap = `Converted By ${botname}`;
        let img;

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else if (Tag && Tag.length > 0) {
            try {
                img = await client.profilePictureUrl(Tag[0], 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else {
            return reply("❌ Please quote a message or tag a user to apply the RIP effect.");
        }

        const result = await canvacord.Canvacord.wanted(img);

        await client.sendMessage(m.chat, { image: result, caption: cap }, { quoted: m });

    } catch (error) {
        console.error("Error in .rip command:", error);
        reply("❌ An unexpected error occurred while processing the RIP effect.");
    }
});

keith({
    pattern: "trash",
    alias: ["ripimage", "ripsticker"],
    desc: "Apply a RIP effect to a user's profile picture",
    category: "Editing",
    react: "🪦",
    filename: __filename
}, async (context) => {
    try {
        const { reply, Tag, botname, m, client } = context;

        let cap = `Converted By ${botname}`;
        let img;

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else if (Tag && Tag.length > 0) {
            try {
                img = await client.profilePictureUrl(Tag[0], 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else {
            return reply("❌ Please quote a message or tag a user to apply the RIP effect.");
        }

        const result = await canvacord.Canvacord.trash(img);

        await client.sendMessage(m.chat, { image: result, caption: cap }, { quoted: m });

    } catch (error) {
        console.error("Error in .rip command:", error);
        reply("❌ An unexpected error occurred while processing the RIP effect.");
    }
});


keith({
    pattern: "wasted",
    alias: ["ripimage", "ripsticker"],
    desc: "Apply a RIP effect to a user's profile picture",
    category: "Editing",
    react: "🪦",
    filename: __filename
}, async (context) => {
    try {
        const { reply, Tag, botname, m, client } = context;

        let cap = `Converted By ${botname}`;
        let img;

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else if (Tag && Tag.length > 0) {
            try {
                img = await client.profilePictureUrl(Tag[0], 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else {
            return reply("❌ Please quote a message or tag a user to apply the RIP effect.");
        }

        const result = await canvacord.Canvacord.wasted(img);

        await client.sendMessage(m.chat, { image: result, caption: cap }, { quoted: m });

    } catch (error) {
        console.error("Error in .rip command:", error);
        reply("❌ An unexpected error occurred while processing the RIP effect.");
    }
});

keith({
    pattern: "trigger",
    alias: ["ripimage", "ripsticker"],
    desc: "Apply a trigger effect to a user's profile picture",
    category: "Editing",
    react: "🪦",
    filename: __filename
}, async (context) => {
    try {
        const { reply, Tag, botname, m, client } = context;

        let cap = `Converted By ${botname}`;
        let img;

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else if (Tag && Tag.length > 0) {
            try {
                img = await client.profilePictureUrl(Tag[0], 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else {
            return reply("❌ Please quote a message or tag a user to apply the RIP effect.");
        }

        const result = await canvacord.Canvacord.trigger(img);

        await client.sendMessage(m.chat, { image: result, caption: cap }, { quoted: m });

    } catch (error) {
        console.error("Error in .rip command:", error);
        reply("❌ An unexpected error occurred while processing the RIP effect.");
    }
});

keith({
    pattern: "sepi",
    alias: ["ripimage", "ripsticker"],
    desc: "Apply a SEPIA effect to a user's profile picture",
    category: "Editing",
    react: "🪦",
    filename: __filename
}, async (context) => {
    try {
        const { reply, Tag, botname, m, client } = context;

        let cap = `Converted By ${botname}`;
        let img;

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else if (Tag && Tag.length > 0) {
            try {
                img = await client.profilePictureUrl(Tag[0], 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else {
            return reply("❌ Please quote a message or tag a user to apply the RIP effect.");
        }

        const result = await canvacord.Canvacord.sepia(img);

        await client.sendMessage(m.chat, { image: result, caption: cap }, { quoted: m });

    } catch (error) {
        console.error("Error in .rip command:", error);
        reply("❌ An unexpected error occurred while processing the RIP effect.");
    }
});

keith({
    pattern: "rainbow",
    alias: ["ripimage", "ripsticker"],
    desc: "Apply a Rainbow effect to a user's profile picture",
    category: "Editing",
    react: "🪦",
    filename: __filename
}, async (context) => {
    try {
        const { reply, Tag, botname, m, client } = context;

        let cap = `Converted By ${botname}`;
        let img;

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else if (Tag && Tag.length > 0) {
            try {
                img = await client.profilePictureUrl(Tag[0], 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else {
            return reply("❌ Please quote a message or tag a user to apply the RIP effect.");
        }

        const result = await canvacord.Canvacord.rainbow(img);

        await client.sendMessage(m.chat, { image: result, caption: cap }, { quoted: m });

    } catch (error) {
        console.error("Error in .rip command:", error);
        reply("❌ An unexpected error occurred while processing the RIP effect.");
    }
});

keith({
    pattern: "invert",
    alias: ["ripimage", "ripsticker"],
    desc: "Apply a INVERT effect to a user's profile picture",
    category: "Editing",
    react: "🪦",
    filename: __filename
}, async (context) => {
    try {
        const { reply, Tag, botname, m, client } = context;

        let cap = `Converted By ${botname}`;
        let img;

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else if (Tag && Tag.length > 0) {
            try {
                img = await client.profilePictureUrl(Tag[0], 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else {
            return reply("❌ Please quote a message or tag a user to apply the RIP effect.");
        }

        const result = await canvacord.Canvacord.invert(img);

        await client.sendMessage(m.chat, { image: result, caption: cap }, { quoted: m });

    } catch (error) {
        console.error("Error in .rip command:", error);
        reply("❌ An unexpected error occurred while processing the RIP effect.");
    }
});

keith({
    pattern: "jail",
    alias: ["ripimage", "ripsticker"],
    desc: "Apply a jail effect to a user's profile picture",
    category: "Editing",
    react: "🪦",
    filename: __filename
}, async (context) => {
    try {
        const { reply, Tag, botname, m, client } = context;

        let cap = `Converted By ${botname}`;
        let img;

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else if (Tag && Tag.length > 0) {
            try {
                img = await client.profilePictureUrl(Tag[0], 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else {
            return reply("❌ Please quote a message or tag a user to apply the RIP effect.");
        }

        const result = await canvacord.Canvacord.jail(img);

        await client.sendMessage(m.chat, { image: result, caption: cap }, { quoted: m });

    } catch (error) {
        console.error("Error in .rip command:", error);
        reply("❌ An unexpected error occurred while processing the RIP effect.");
    }
});

keith({
    pattern: "affect",
    alias: ["ripimage", "ripsticker"],
    desc: "Apply a affect effect to a user's profile picture",
    category: "Editing",
    react: "🪦",
    filename: __filename
}, async (context) => {
    try {
        const { reply, Tag, botname, m, client } = context;

        let cap = `Converted By ${botname}`;
        let img;

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else if (Tag && Tag.length > 0) {
            try {
                img = await client.profilePictureUrl(Tag[0], 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else {
            return reply("❌ Please quote a message or tag a user to apply the RIP effect.");
        }

        const result = await canvacord.Canvacord.affect(img);

        await client.sendMessage(m.chat, { image: result, caption: cap }, { quoted: m });

    } catch (error) {
        console.error("Error in .rip command:", error);
        reply("❌ An unexpected error occurred while processing the RIP effect.");
    }
});

keith({
    pattern: "blur",
    alias: ["ripimage", "ripsticker"],
    desc: "Apply a RIP effect to a user's profile picture",
    category: "Editing",
    react: "🪦",
    filename: __filename
}, async (context) => {
    try {
        const { reply, Tag, botname, m, client } = context;

        let cap = `Converted By ${botname}`;
        let img;

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else if (Tag && Tag.length > 0) {
            try {
                img = await client.profilePictureUrl(Tag[0], 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else {
            return reply("❌ Please quote a message or tag a user to apply the RIP effect.");
        }

        const result = await canvacord.Canvacord.blur(img);

        await client.sendMessage(m.chat, { image: result, caption: cap }, { quoted: m });

    } catch (error) {
        console.error("Error in .rip command:", error);
        reply("❌ An unexpected error occurred while processing the RIP effect.");
    }
});

keith({
    pattern: "beautiful",
    alias: ["ripimage", "ripsticker"],
    desc: "Apply a RIP effect to a user's profile picture",
    category: "Editing",
    react: "🪦",
    filename: __filename
}, async (context) => {
    try {
        const { reply, Tag, botname, m, client } = context;

        let cap = `Converted By ${botname}`;
        let img;

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else if (Tag && Tag.length > 0) {
            try {
                img = await client.profilePictureUrl(Tag[0], 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else {
            return reply("❌ Please quote a message or tag a user to apply the RIP effect.");
        }

        const result = await canvacord.Canvacord.beautiful(img);

        await client.sendMessage(m.chat, { image: result, caption: cap }, { quoted: m });

    } catch (error) {
        console.error("Error in .rip command:", error);
        reply("❌ An unexpected error occurred while processing the RIP effect.");
    }
});

keith({
    pattern: "circle",
    alias: ["ripimage", "ripsticker"],
    desc: "Apply a RIP effect to a user's profile picture",
    category: "Editing",
    react: "🪦",
    filename: __filename
}, async (context) => {
    try {
        const { reply, Tag, botname, m, client } = context;

        let cap = `Converted By ${botname}`;
        let img;

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else if (Tag && Tag.length > 0) {
            try {
                img = await client.profilePictureUrl(Tag[0], 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else {
            return reply("❌ Please quote a message or tag a user to apply the RIP effect.");
        }

        const result = await canvacord.Canvacord.circle(img);

        await client.sendMessage(m.chat, { image: result, caption: cap }, { quoted: m });

    } catch (error) {
        console.error("Error in .rip command:", error);
        reply("❌ An unexpected error occurred while processing the RIP effect.");
    }
});

keith({
    pattern: "facepalm",
    alias: ["ripimage", "ripsticker"],
    desc: "Apply a RIP effect to a user's profile picture",
    category: "Editing",
    react: "🪦",
    filename: __filename
}, async (context) => {
    try {
        const { reply, Tag, botname, m, client } = context;

        let cap = `Converted By ${botname}`;
        let img;

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else if (Tag && Tag.length > 0) {
            try {
                img = await client.profilePictureUrl(Tag[0], 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else {
            return reply("❌ Please quote a message or tag a user to apply the RIP effect.");
        }

        const result = await canvacord.Canvacord.facepalm(img);

        await client.sendMessage(m.chat, { image: result, caption: cap }, { quoted: m });

    } catch (error) {
        console.error("Error in .rip command:", error);
        reply("❌ An unexpected error occurred while processing the RIP effect.");
    }
});

keith({
    pattern: "greyscale",
    alias: ["ripimage", "ripsticker"],
    desc: "Apply a RIP effect to a user's profile picture",
    category: "Editing",
    react: "🪦",
    filename: __filename
}, async (context) => {
    try {
        const { reply, Tag, botname, m, client } = context;

        let cap = `Converted By ${botname}`;
        let img;

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else if (Tag && Tag.length > 0) {
            try {
                img = await client.profilePictureUrl(Tag[0], 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else {
            return reply("❌ Please quote a message or tag a user to apply the RIP effect.");
        }

        const result = await canvacord.Canvacord.greyscale(img);

        await client.sendMessage(m.chat, { image: result, caption: cap }, { quoted: m });

    } catch (error) {
        console.error("Error in .rip command:", error);
        reply("❌ An unexpected error occurred while processing the RIP effect.");
    }
});

keith({
    pattern: "jokeoverhead",
    alias: ["ripimage", "ripsticker"],
    desc: "Apply a RIP effect to a user's profile picture",
    category: "Editing",
    react: "🪦",
    filename: __filename
}, async (context) => {
    try {
        const { reply, Tag, botname, m, client } = context;

        let cap = `Converted By ${botname}`;
        let img;

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else if (Tag && Tag.length > 0) {
            try {
                img = await client.profilePictureUrl(Tag[0], 'image');
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
        } else {
            return reply("❌ Please quote a message or tag a user to apply the RIP effect.");
        }

        const result = await canvacord.Canvacord.jokeOverHead(img);

        await client.sendMessage(m.chat, { image: result, caption: cap }, { quoted: m });

    } catch (error) {
        console.error("Error in .rip command:", error);
        reply("❌ An unexpected error occurred while processing the RIP effect.");
    }
});

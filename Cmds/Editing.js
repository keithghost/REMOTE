const { keith } = require('../commandHandler');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const axios = require("axios");
const canvacord = require("canvacord");

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

const { keith } = require('../commandHandler');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const axios = require("axios");
const canvacord = require("canvacord");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const fs = require("fs");
const { exec } = require("child_process");

keith({
    pattern: "watermark",
    alias: ["wm", "addwatermark"],
    desc: "Add watermark to quoted image (text or image watermark)",
    category: "Utility",
    react: "💧",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, getRandom, prefix } = context;
        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        // Check if message is quoted and is an image
        if (!quoted || !/image/.test(mime)) {
            return await client.sendMessage(m.chat, { 
                text: `Please reply to an *image* to add watermark.\nExample: *${prefix}watermark MyBrand* (for text)\nOr reply with an image and caption *${prefix}watermark* to use that image as watermark` 
            }, { quoted: m });
        }

        // Download the base image
        const baseImagePath = await client.downloadAndSaveMediaMessage(quoted);
        const outputPath = getRandom('.jpg');

        // Check if we're using text watermark or image watermark
        if (text) {
            // Text watermark
            const watermarkText = text.length > 20 ? text.substring(0, 20) + "..." : text;
            
            await new Promise((resolve, reject) => {
                exec(`ffmpeg -i ${baseImagePath} -vf "drawtext=text='${watermarkText}':fontcolor=white:fontsize=40:box=1:boxcolor=black@0.5:boxborderw=5:x=(w-text_w)/2:y=(h-text_h)/2" ${outputPath}`, 
                async (error) => {
                    try {
                        fs.unlinkSync(baseImagePath);
                        if (error) return reject(new Error(`Error adding text watermark: ${error.message}`));
                        
                        const imageBuffer = fs.readFileSync(outputPath);
                        await client.sendMessage(m.chat, { 
                            image: imageBuffer,
                            caption: `Added text watermark: "${watermarkText}"`
                        }, { quoted: m });
                        
                        fs.unlinkSync(outputPath);
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                });
            });
        } else {
            // Image watermark (check if there's a quoted image for watermark)
            const watermarkQuoted = m.quoted?.quoted || null;
            const watermarkMime = watermarkQuoted?.mimetype || "";
            
            if (!watermarkQuoted || !/image/.test(watermarkMime)) {
                return await client.sendMessage(m.chat, { 
                    text: `For image watermark, please reply to an image with another image as watermark.\nExample: Reply to main image with caption *${prefix}watermark* and quote the watermark image` 
                }, { quoted: m });
            }

            // Download watermark image
            const watermarkPath = await client.downloadAndSaveMediaMessage(watermarkQuoted);
            const tempWatermarkPath = getRandom('.png');
            
            // First resize watermark to be 1/4 of base image dimensions
            await new Promise((resolve, reject) => {
                exec(`ffmpeg -i ${baseImagePath} -f null - 2>&1 | grep -oP 'Stream.*Video:.*\\s\\K\\d+x\\d+'`, (err, stdout) => {
                    if (err) return reject(new Error("Couldn't get base image dimensions"));
                    
                    const [width, height] = stdout.trim().split('x').map(Number);
                    const wmWidth = Math.floor(width/4);
                    const wmHeight = Math.floor(height/4);
                    
                    exec(`ffmpeg -i ${watermarkPath} -vf "scale=${wmWidth}:${wmHeight}" ${tempWatermarkPath}`, (err) => {
                        if (err) return reject(new Error("Couldn't resize watermark image"));
                        resolve();
                    });
                });
            });

            // Now apply the watermark
            await new Promise((resolve, reject) => {
                exec(`ffmpeg -i ${baseImagePath} -i ${tempWatermarkPath} -filter_complex "overlay=W-w-10:H-h-10" ${outputPath}`, 
                async (error) => {
                    try {
                        fs.unlinkSync(baseImagePath);
                        fs.unlinkSync(watermarkPath);
                        fs.unlinkSync(tempWatermarkPath);
                        
                        if (error) return reject(new Error(`Error adding image watermark: ${error.message}`));
                        
                        const imageBuffer = fs.readFileSync(outputPath);
                        await client.sendMessage(m.chat, { 
                            image: imageBuffer,
                            caption: `Added image watermark (bottom-right corner)`
                        }, { quoted: m });
                        
                        fs.unlinkSync(outputPath);
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                });
            });
        }
    } catch (err) {
        await client.sendMessage(m.chat, { text: `Error: ${err.message}` }, { quoted: m });
    }
});
keith({
    pattern: "resize",
    alias: ["resize", "imgresize"],
    desc: "Resize quoted image to specified dimensions (e.g., 300×250)",
    category: "Editing",
    react: "🖼️",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, getRandom, prefix } = context; // Added prefix to destructuring

        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        // Check if message is quoted and is an image
        if (!quoted || !/image/.test(mime)) {
            return await client.sendMessage(m.chat, { 
                text: `Please reply to an *image* with dimensions like *300×250* to resize it.\nExample: *${prefix}resize 300×250*` 
            }, { quoted: m });
        }

        // Check if dimensions are provided
        if (!text || !text.match(/^\d+×\d+$/)) {
            return await client.sendMessage(m.chat, { 
                text: `Please provide dimensions in format *width×height* (e.g., 300×250)` 
            }, { quoted: m });
        }

        const [width, height] = text.split('×').map(Number);
        
        // Validate dimensions
        if (width <= 0 || height <= 0 || width > 5000 || height > 5000) {
            return await client.sendMessage(m.chat, { 
                text: `Invalid dimensions. Please use values between 1 and 5000` 
            }, { quoted: m });
        }

        // Download the image
        const mediaPath = await client.downloadAndSaveMediaMessage(quoted);
        const outputPath = getRandom('.jpg');

        // Use ffmpeg to resize the image
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${mediaPath} -vf "scale=${width}:${height}" ${outputPath}`, async (error) => {
                try {
                    fs.unlinkSync(mediaPath); // Clean up original file
                    
                    if (error) {
                        reject(new Error(`Error resizing image: ${error.message}`));
                        return;
                    }

                    // Send the resized image
                    const imageBuffer = fs.readFileSync(outputPath);
                    await client.sendMessage(m.chat, { 
                        image: imageBuffer,
                        caption: `Resized to ${width}×${height}`
                    }, { quoted: m });
                    
                    fs.unlinkSync(outputPath); // Clean up resized file
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

    } catch (err) {
        await client.sendMessage(m.chat, { text: `Error: ${err.message}` }, { quoted: m });
    }
});

/*keith({
    pattern: "amplify",
    alias: ["replaceaudio", "mergeaudio"],
    desc: "Replace the audio of a video with an external audio file",
    category: "Editing",
    react: "🎶",
    filename: __filename
}, async (context) => {
    try {
        const { reply, m, text, client, getRandom } = context;

        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!quoted || !/video/.test(mime)) {
            return reply("❌ Reply to a *video file* with the audio URL to replace its audio.");
        }

        if (!text) {
            return reply("❌ Provide a valid audio URL.");
        }

        const audioUrl = text.trim();
        const media = await client.downloadAndSaveMediaMessage(quoted);
        const audioPath = getRandom(".mp3");
        const outputPath = getRandom(".mp4");

        // Download the audio from the URL
        const response = await axios({
            method: "get",
            url: audioUrl,
            responseType: "arraybuffer"
        });

        fs.writeFileSync(audioPath, response.data);

        // Merge the downloaded audio with the quoted video and replace the original audio
        exec(`ffmpeg -i ${media} -i ${audioPath} -c:v copy -map 0:v:0 -map 1:a:0 -shortest ${outputPath}`, (err) => {
            fs.unlinkSync(media);
            fs.unlinkSync(audioPath);
            if (err) return reply("❌ Error processing media.");

            const videoBuffer = fs.readFileSync(outputPath);
            client.sendMessage(m.chat, { video: videoBuffer, mimetype: "video/mp4" }, { quoted: m });
            fs.unlinkSync(outputPath);
        });

    } catch (error) {
        console.error("Error in .amplify command:", error);
        reply("❌ An unexpected error occurred while processing the media.");
    }
});*/

keith({
    pattern: "toaudio",
    alias: ["toaudio", "convertmedia"],
    desc: "Convert audio to video or video to audio",
    category: "Editing",
    react: "🎥",
    filename: __filename
}, async (context) => {
    try {
        const { reply, m, client, getRandom } = context;

        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!quoted) {
            return reply("❌ Reply to a *video file* to convert it to audio or an *audio file* to convert it to video.");
        }

        if (/video/.test(mime)) {
            const media = await client.downloadAndSaveMediaMessage(quoted);
            const rname = getRandom(".mp3");

            exec(`ffmpeg -i ${media} -q:a 0 -map a ${rname}`, (err) => {
                fs.unlinkSync(media);
                if (err) return reply("❌ Error converting video to audio.");

                const audioBuffer = fs.readFileSync(rname);
                client.sendMessage(m.chat, { audio: audioBuffer, mimetype: "audio/mpeg" }, { quoted: m });
                fs.unlinkSync(rname);
            });

        } else if (/audio/.test(mime)) {
            const media = await client.downloadAndSaveMediaMessage(quoted);
            const rname = getRandom(".mp4");

            exec(`ffmpeg -i ${media} -vf "format=yuv420p" -c:v libx264 ${rname}`, (err) => {
                fs.unlinkSync(media);
                if (err) return reply("❌ Error converting audio to video.");

                const videoBuffer = fs.readFileSync(rname);
                client.sendMessage(m.chat, { video: videoBuffer, mimetype: "video/mp4" }, { quoted: m });
                fs.unlinkSync(rname);
            });

        } else {
            return reply("❌ Reply to a *video* or *audio* file.");
        }

    } catch (error) {
        console.error("Error in .tovideo command:", error);
        reply("❌ An unexpected error occurred while processing the media.");
    }
});

keith({
    pattern: "tovideo",
    alias: ["toaudio", "convertmedia"],
    desc: "Convert audio to video or video to audio",
    category: "Editing",
    react: "🎥",
    filename: __filename
}, async (context) => {
    try {
        const { reply, m, client, getRandom } = context;

        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!quoted) {
            return reply("❌ Reply to a *video file* to convert it to audio or an *audio file* to convert it to video.");
        }

        if (/video/.test(mime)) {
            const media = await client.downloadAndSaveMediaMessage(quoted);
            const rname = getRandom(".mp3");

            exec(`ffmpeg -i ${media} -q:a 0 -map a ${rname}`, (err) => {
                fs.unlinkSync(media);
                if (err) return reply("❌ Error converting video to audio.");

                const audioBuffer = fs.readFileSync(rname);
                client.sendMessage(m.chat, { audio: audioBuffer, mimetype: "audio/mpeg" }, { quoted: m });
                fs.unlinkSync(rname);
            });

        } else if (/audio/.test(mime)) {
            const media = await client.downloadAndSaveMediaMessage(quoted);
            const rname = getRandom(".mp4");

            exec(`ffmpeg -i ${media} -vf "format=yuv420p" -c:v libx264 ${rname}`, (err) => {
                fs.unlinkSync(media);
                if (err) return reply("❌ Error converting audio to video.");

                const videoBuffer = fs.readFileSync(rname);
                client.sendMessage(m.chat, { video: videoBuffer, mimetype: "video/mp4" }, { quoted: m });
                fs.unlinkSync(rname);
            });

        } else {
            return reply("❌ Reply to a *video* or *audio* file.");
        }

    } catch (error) {
        console.error("Error in .tovideo command:", error);
        reply("❌ An unexpected error occurred while processing the media.");
    }
});

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

        let api = `https://api.telegram.org/bot8169926804:AAEjatqNQHnZCEfooxrEBlIvt3s4iowX_1g/getStickerSet?name=${encodeURIComponent(name)}`;

        try {
            let stickers = await axios.get(api);
            let type = stickers.data.result.is_animated || stickers.data.result.is_video ? "animated sticker" : "static sticker";

            let msg = `🎭 *Telegram Sticker Set Extracted*\n\n*Name:* ${stickers.data.result.name}\n*Type:* ${type}\n*Stickers:* ${stickers.data.result.stickers.length}\n\nDownloading...`;

            reply(msg);

            for (let i = 0; i < stickers.data.result.stickers.length; i++) {
                let file = await axios.get(`https://api.telegram.org/bot8169926804:AAEjatqNQHnZCEfooxrEBlIvt3s4iowX_1g/getFile?file_id=${stickers.data.result.stickers[i].file_id}`);
                let buffer = await axios({
                    method: "get",
                    url: `https://api.telegram.org/file/bot8169926804:AAEjatqNQHnZCEfooxrEBlIvt3s4iowX_1g/${file.data.result.file_path}`,
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

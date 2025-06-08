const { keith } = require('../commandHandler');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const axios = require("axios");
const canvacord = require("canvacord");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const fs = require("fs");
const { exec } = require("child_process");

keith({
    pattern: "amplify",
    alias: ["replaceaudio", "mergeaudio"],
    desc: "Replace the audio of a video with an external audio file",
    category: "Media-edit",
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
});


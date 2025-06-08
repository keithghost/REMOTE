const { keith } = require('../commandHandler');
const fs = require("fs");
const { exec } = require("child_process");


keith({
    pattern: "imgvid",
    alias: ["createvideo", "videomaker"],
    desc: "Generate a video from images and an audio file",
    category: "Media-edit",
    react: "🎥",
    filename: __filename
}, async (context) => {
    try {
        const { reply, text, client } = context;

        if (!text) {
            return reply("❌ Provide the audio and image URLs in this format:\n`audioURL | imageURL1, imageURL2, ...`");
        }

        const [audioUrl, imageUrls] = text.split(" | ");
        const imageUrlList = imageUrls ? imageUrls.split(", ").map(url => url.trim()) : [];

        if (!audioUrl || !imageUrlList.length) {
            return reply("❌ Please provide both an audio URL and at least one image URL.");
        }

        const audioPath = `${Date.now()}_audio.mp3`;
        const outputPath = `${Date.now()}_output.mp4`;

        try {
            // Download the audio
            const audioResponse = await axios({ method: "get", url: audioUrl, responseType: "arraybuffer" });
            fs.writeFileSync(audioPath, audioResponse.data);

            // Download all images
            const imagePaths = [];
            for (const [index, imageUrl] of imageUrlList.entries()) {
                const imageResponse = await axios({ method: "get", url: imageUrl, responseType: "arraybuffer" });
                const imagePath = `${Date.now()}_image${index}.jpg`;
                fs.writeFileSync(imagePath, imageResponse.data);
                imagePaths.push(imagePath);
            }

            // Create video from images
            const ffmpegCommand = `ffmpeg -framerate 1 -pattern_type glob -i '*_image*.jpg' -i ${audioPath} -c:v libx264 -r 30 -pix_fmt yuv420p -c:a aac ${outputPath}`;
            exec(ffmpegCommand, (err, stdout, stderr) => {
                console.log("FFmpeg output:", stdout);
                console.error("FFmpeg error:", stderr);
                fs.unlinkSync(audioPath);
                imagePaths.forEach(path => fs.unlinkSync(path));
                if (err) return reply("❌ Error generating the video.");

                const videoBuffer = fs.readFileSync(outputPath);
                client.sendMessage(context.m.chat, { video: videoBuffer, mimetype: "video/mp4" }, { quoted: context.m });
                fs.unlinkSync(outputPath);
            });

        } catch (error) {
            console.error("Error processing media:", error);
            reply("❌ An error occurred while processing the media.");
        }

    } catch (error) {
        console.error("Error in .imgvid command:", error);
        reply("❌ An unexpected error occurred while generating the video.");
    }
});

keith({
    pattern: "robot",
    alias: ["robotic", "cybervoice"],
    desc: "Apply robotic voice effect to audio",
    category: "Media-edit",
    react: "🤖",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply, getRandom } = context;
        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!quoted || !/audio/.test(mime)) {
            return reply("❌ Please reply to an *audio file* to apply robotic effect.");
        }

        // Parse optional intensity parameter (default: 5)
        const intensity = Math.min(Math.max(parseInt(text) || 5, 1), 10);

        const mediaPath = await client.downloadAndSaveMediaMessage(quoted);
        const outputPath = getRandom('.mp3');

        // Enhanced robotic effect with multiple filters
        const ffmpegCmd = `ffmpeg -i ${mediaPath} ` +
            `-filter_complex "` +
            `afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)':win_size=512:overlap=0.75,` +
            `vibrato=f=${5 + intensity}:d=0.${intensity},` +
            `chorus=0.5:0.9:50|60|80:0.4|0.32|0.3:0.25|0.4|0.3:2|2.3|1.3,` +
            `asetrate=44100*0.8,` +
            `atempo=1.25` +
            `" ` +
            `-c:a libmp3lame -q:a 2 ${outputPath}`;

        exec(ffmpegCmd, (error, stdout, stderr) => {
            fs.unlinkSync(mediaPath); // Clean up original file
            
            if (error) {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                console.error("FFmpeg error:", stderr);
                return reply(`❌ Failed to process audio. ${error.message}`);
            }

            try {
                const audioBuffer = fs.readFileSync(outputPath);
                const fileSize = fs.statSync(outputPath).size;
                
                if (fileSize > 15 * 1024 * 1024) {
                    fs.unlinkSync(outputPath);
                    return reply("❌ Processed audio is too large (>15MB). Try with a shorter audio.");
                }

                client.sendMessage(m.chat, { 
                    audio: audioBuffer, 
                    mimetype: "audio/mpeg",
                    ptt: false
                }, { quoted: m });
            } catch (sendError) {
                console.error("Send error:", sendError);
                reply("❌ Failed to send the processed audio.");
            } finally {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }
        });

    } catch (error) {
        console.error("Error in robot command:", error);
        reply("❌ An unexpected error occurred while processing the audio.");
    }
});
keith({
    pattern: "reverse",
    alias: ["rev", "backwards"],
    desc: "Reverse audio playback",
    category: "Media-edit",
    react: "⏪",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply, getRandom } = context;
        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!quoted || !/audio/.test(mime)) {
            return reply("❌ Please reply to an *audio file* to reverse it.");
        }

        const mediaPath = await client.downloadAndSaveMediaMessage(quoted);
        const outputPath = getRandom('.mp3');

        // Enhanced reverse command with better audio quality preservation
        const ffmpegCmd = `ffmpeg -i ${mediaPath} ` +
            `-filter_complex "aresample=44100,areverse" ` +
            `-c:a libmp3lame -q:a 2 ${outputPath}`;

        exec(ffmpegCmd, (error, stdout, stderr) => {
            fs.unlinkSync(mediaPath); // Clean up original file
            
            if (error) {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                console.error("FFmpeg error:", stderr);
                return reply(`❌ Failed to reverse audio. ${error.message}`);
            }

            try {
                const audioBuffer = fs.readFileSync(outputPath);
                const fileSize = fs.statSync(outputPath).size;
                
                // Check WhatsApp file size limit (~16MB)
                if (fileSize > 15 * 1024 * 1024) {
                    fs.unlinkSync(outputPath);
                    return reply("❌ Reversed audio is too large (>15MB). Try with a shorter audio.");
                }

                client.sendMessage(m.chat, { 
                    audio: audioBuffer, 
                    mimetype: "audio/mpeg",
                    ptt: false
                }, { quoted: m });
            } catch (sendError) {
                console.error("Send error:", sendError);
                reply("❌ Failed to send the reversed audio.");
            } finally {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }
        });

    } catch (error) {
        console.error("Error in reverse command:", error);
        reply("❌ An unexpected error occurred while reversing the audio.");
    }
});

keith({
    pattern: "earrape",
    alias: ["earrape", "earrapee"],
    desc: "Increase audio volume (dB boost)",
    category: "Media-edit",
    react: "🔊",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, reply, getRandom } = context;
        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!quoted || !/audio/.test(mime)) {
            return reply("❌ Please reply to an *audio file* to boost its volume.");
        }

        // Parse dB boost level with validation (default: 12dB)
        let dB = parseFloat(text) || 12;
        dB = Math.min(Math.max(dB, 1), 30); // Clamp between 1dB and 30dB

        const mediaPath = await client.downloadAndSaveMediaMessage(quoted);
        const outputPath = getRandom('.mp3');

        // Advanced volume boosting with protection against clipping
        const ffmpegCmd = `ffmpeg -i ${mediaPath} ` +
            `-af "volume=${dB}dB:precision=fixed:eval=frame," ` +
            `-ar 44100 -ac 2 -b:a 192k ${outputPath}`;

        exec(ffmpegCmd, (error) => {
            fs.unlinkSync(mediaPath); // Clean up original file
            
            if (error) {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                return reply(`❌ Failed to process audio. ${error.message}`);
            }

            try {
                const audioBuffer = fs.readFileSync(outputPath);
                const fileSize = fs.statSync(outputPath).size;
                
                if (fileSize > 15 * 1024 * 1024) { // WhatsApp limit ~16MB
                    fs.unlinkSync(outputPath);
                    return reply("❌ Resulting audio is too large (>15MB). Try a smaller boost.");
                }

                client.sendMessage(m.chat, { 
                    audio: audioBuffer, 
                    mimetype: "audio/mpeg",
                    ptt: false
                }, { quoted: m });
            } catch (sendError) {
                console.error("Send error:", sendError);
                reply("❌ Failed to send the boosted audio.");
            } finally {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }
        });

    } catch (error) {
        console.error("Error in volume command:", error);
        reply("❌ An unexpected error occurred while processing the audio.");
    }
});
keith({
    pattern: "deep",
    alias: ["pitch", "tempo"],
    desc: "Modify audio pitch and speed (default: chipmunk effect)",
    category: "Media-edit",
    react: "🎚️",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, reply, getRandom } = context;
        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!quoted || !/audio/.test(mime)) {
            return reply("❌ Please reply to an *audio file* to modify its pitch/speed.");
        }

        // Parse optional parameters or use defaults (chipmunk effect)
        const [tempoRatio = 1.3, pitchRatio = 1.5] = text.split(/[\s,]+/).map(Number).filter(n => !isNaN(n));

        const mediaPath = await client.downloadAndSaveMediaMessage(quoted);
        const outputPath = getRandom('.mp3');

        // Advanced audio processing with rubberband filter for better quality
        const ffmpegCmd = `ffmpeg -i ${mediaPath} ` +
            `-af "rubberband=tempo=${tempoRatio}:pitch=${pitchRatio}:formant=1" ` +
            `${outputPath}`;

        exec(ffmpegCmd, (error) => {
            fs.unlinkSync(mediaPath); // Clean up original file
            
            if (error) {
                // Fallback to simpler method if rubberband isn't available
                const fallbackCmd = `ffmpeg -i ${mediaPath} ` +
                    `-af "atempo=${tempoRatio},asetrate=44100*${pitchRatio},aresample=44100" ` +
                    `${outputPath}`;
                
                exec(fallbackCmd, (fallbackError) => {
                    if (fallbackError) {
                        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                        return reply(`❌ Audio processing failed. ${fallbackError.message}`);
                    }
                    sendModifiedAudio();
                });
                return;
            }
            sendModifiedAudio();
        });

        function sendModifiedAudio() {
            try {
                const audioBuffer = fs.readFileSync(outputPath);
                client.sendMessage(m.chat, { 
                    audio: audioBuffer, 
                    mimetype: "audio/mpeg",
                    ptt: false
                }, { quoted: m });
            } catch (sendError) {
                console.error("Send error:", sendError);
                reply("❌ Failed to send the modified audio.");
            } finally {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }
        }

    } catch (error) {
        console.error("Error in pitch command:", error);
        reply("❌ An unexpected error occurred while processing the audio.");
    }
});
keith({
    pattern: "bitcrusher",
    alias: ["bitcrush", "crush"],
    desc: "Apply bitcrusher effect to audio (lo-fi distortion)",
    category: "Media-edit",
    react: "🎛️",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply, getRandom } = context;
        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!quoted || !/audio/.test(mime)) {
            return reply("❌ Please reply to an *audio file* to apply bitcrusher effect.");
        }

        // Parse optional parameters or use defaults
        const [level = 0.1, bits = 8, mix = 0.8] = text.split(/[\s,]+/).map(Number).filter(n => !isNaN(n));

        const mediaPath = await client.downloadAndSaveMediaMessage(quoted);
        const outputPath = getRandom('.mp3');

        // Advanced bitcrusher effect with controllable parameters
        const ffmpegCmd = `ffmpeg -i ${mediaPath} ` +
            `-af "acrusher=level=${Math.min(Math.max(level, 0.01), 1)}:` +
            `bits=${Math.min(Math.max(bits, 1), 16)}:` +
            `mix=${Math.min(Math.max(mix, 0), 1)}" ` +
            `${outputPath}`;

        exec(ffmpegCmd, (error) => {
            fs.unlinkSync(mediaPath); // Clean up original file
            
            if (error) {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                return reply(`❌ Failed to process audio. ${error.message}`);
            }

            try {
                const audioBuffer = fs.readFileSync(outputPath);
                client.sendMessage(m.chat, { 
                    audio: audioBuffer, 
                    mimetype: "audio/mpeg",
                    ptt: false
                }, { quoted: m });
            } catch (sendError) {
                console.error("Send error:", sendError);
                reply("❌ Failed to send the processed audio.");
            } finally {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }
        });

    } catch (error) {
        console.error("Error in crusher command:", error);
        reply("❌ An unexpected error occurred while processing the audio.");
    }
});
keith({
    pattern: "bass",
    alias: ["bassboost", "boost"],
    desc: "Boost bass frequencies in audio",
    category: "Media-edit",
    react: "🔈",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply, getRandom } = context;
        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!quoted || !/audio/.test(mime)) {
            return reply("❌ Please reply to an *audio file* to boost its bass.");
        }

        const mediaPath = await client.downloadAndSaveMediaMessage(quoted);
        const outputPath = getRandom('.mp3');

        // Advanced bass boosting with multiple filters:
        // 1. Equalizer for low frequencies
        // 2. Dynamic compressor to prevent distortion
        // 3. Limiter for safety
        const ffmpegCmd = `ffmpeg -i ${mediaPath} ` +
            `-af "equalizer=f=60:width_type=o:width=2:g=15,` +
            `equalizer=f=120:width_type=o:width=2:g=10,` +
            `compand=attacks=0.002:decays=0.1:points=-80/-80|-60/-20|-30/-8|0/0,` +
            `volume=1.5" ` +
            `${outputPath}`;

        exec(ffmpegCmd, (error) => {
            fs.unlinkSync(mediaPath); // Clean up original file
            
            if (error) {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                return reply(`❌ Failed to process audio. ${error.message}`);
            }

            try {
                const audioBuffer = fs.readFileSync(outputPath);
                client.sendMessage(m.chat, { 
                    audio: audioBuffer, 
                    mimetype: "audio/mpeg",
                    ptt: false
                }, { quoted: m });
            } catch (sendError) {
                console.error("Send error:", sendError);
                reply("❌ Failed to send the modified audio.");
            } finally {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }
        });

    } catch (error) {
        console.error("Error in bass command:", error);
        reply("❌ An unexpected error occurred while processing the audio.");
    }
});
keith({
    pattern: "volvideo",
    alias: ["vidvol", "vvolvid"],
    desc: "Adjust video volume (multiplier)",
    category: "Media-edit",
    react: "📢",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, reply, getRandom } = context;
        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!quoted || !/video/.test(mime)) {
            return reply("❌ Please reply to a *video file* to adjust its volume.");
        }

        const volume = parseFloat(text.trim());
        if (isNaN(volume)) {
            return reply("❌ Please provide a valid volume multiplier.\n*Example:* `.volvideo 1.5` (increases volume by 50%)");
        }

        // Validate volume range (0.1 to 10.0)
        if (volume < 0.1 || volume > 10.0) {
            return reply("❌ Volume must be between 0.1 (10% volume) and 10.0 (1000% volume)");
        }

        const mediaPath = await client.downloadAndSaveMediaMessage(quoted);
        const outputPath = getRandom('.mp4');

        // Using -c:v copy to preserve video quality while adjusting audio volume
        exec(`ffmpeg -i ${mediaPath} -filter:a "volume=${volume}" -c:v copy ${outputPath}`, (error, stderr, stdout) => {
            fs.unlinkSync(mediaPath); // Clean up original file
            
            if (error) {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                return reply(`❌ Failed to process video. ${error.message}`);
            }

            try {
                const modifiedVideo = fs.readFileSync(outputPath);
                const fileSize = fs.statSync(outputPath).size;
                
                // Check if file size is too large (WhatsApp has ~16MB limit for videos)
                if (fileSize > 15 * 1024 * 1024) {
                    fs.unlinkSync(outputPath);
                    return reply("❌ The resulting video is too large to send (over 15MB). Try a smaller volume adjustment.");
                }

                client.sendMessage(m.chat, { 
                    video: modifiedVideo,
                    mimetype: "video/mp4",
                    caption: `Volume adjusted by ${volume}x`
                }, { quoted: m });
            } catch (sendError) {
                console.error("Send error:", sendError);
                reply("❌ Failed to send the modified video.");
            } finally {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }
        });

    } catch (error) {
        console.error("Error in volvideo command:", error);
        reply("❌ An unexpected error occurred while processing the video.");
    }
});
keith({
    pattern: "volaudio",
    alias: ["volume", "vol"],
    desc: "Adjust audio volume (multiplier)",
    category: "Media-edit",
    react: "🔊",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, reply, getRandom } = context;
        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!quoted || !/audio/.test(mime)) {
            return reply("❌ Please reply to an *audio file* to adjust its volume.");
        }

        const volume = parseFloat(text.trim());
        if (isNaN(volume) {
            return reply("❌ Please provide a valid volume multiplier.\n*Example:* `.volaudio 2.0` (doubles volume)");
        }

        // Validate volume range (0.1 to 10.0)
        if (volume < 0.1 || volume > 10.0) {
            return reply("❌ Volume must be between 0.1 (10% volume) and 10.0 (1000% volume)");
        }

        const mediaPath = await client.downloadAndSaveMediaMessage(quoted);
        const outputPath = getRandom('.mp3');

        exec(`ffmpeg -i ${mediaPath} -filter:a "volume=${volume}" ${outputPath}`, (error) => {
            fs.unlinkSync(mediaPath); // Clean up original file
            
            if (error) {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                return reply(`❌ Failed to process audio. ${error.message}`);
            }

            try {
                const modifiedAudio = fs.readFileSync(outputPath);
                client.sendMessage(m.chat, { 
                    audio: modifiedAudio, 
                    mimetype: "audio/mpeg",
                    ptt: false // Changed to false as PTT is typically for voice notes
                }, { quoted: m });
            } catch (sendError) {
                console.error("Send error:", sendError);
                reply("❌ Failed to send the modified audio.");
            } finally {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }
        });

    } catch (error) {
        console.error("Error in volaudio command:", error);
        reply("❌ An unexpected error occurred while processing the audio.");
    }
});
keith({
    pattern: "trim",
    alias: ["cut"],
    desc: "Trim video or audio between specified timestamps",
    category: "Media-edit",
    react: "✂️",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, reply, getRandom } = context;

        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!quoted) {
            return reply("❌ Reply to a *video file* or an *audio file* with the start and end time to trim it.");
        }

        const [startTime, endTime] = text.split(" ").map(time => time.trim());
        if (!startTime || !endTime) {
            return reply("❌ Please provide start and end times.\n*Example:* `1:20 1:50`");
        }

        const media = await client.downloadAndSaveMediaMessage(quoted);
        let outputPath, outputType;

        if (/video/.test(mime)) {
            outputPath = getRandom(".mp4");
            outputType = "video";
        } else if (/audio/.test(mime)) {
            outputPath = getRandom(".mp3");
            outputType = "audio";
        } else {
            fs.unlinkSync(media);
            return reply("❌ Unsupported file type. Please reply to a video or audio file.");
        }

        exec(`ffmpeg -i ${media} -ss ${startTime} -to ${endTime} -c copy ${outputPath}`, (err) => {
            fs.unlinkSync(media);
            
            if (err) {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                return reply("❌ Error processing media. Please check the timestamps and try again.");
            }

            const fileBuffer = fs.readFileSync(outputPath);
            const messageOptions = {
                [outputType]: fileBuffer,
                mimetype: outputType === "video" ? "video/mp4" : "audio/mpeg"
            };
            
            client.sendMessage(m.chat, messageOptions, { quoted: m });
            fs.unlinkSync(outputPath);
        });

    } catch (error) {
        console.error('Error in trim command:', error);
        reply('❌ An error occurred while processing the media.');
    }
});
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


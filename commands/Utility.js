const { keith } = require('../keizzah/keith');
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const axios = require("axios");
const filename = `${Math.random().toString(36).substring(2, 9)}`;

keith({
    nomCom: 'toaudio',
    categorie: 'Audio-Edit',
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu } = commandeOptions;

    if (!msgRepondu) {
        return repondre('Please reply to a video message to convert to audio');
    }

    if (!msgRepondu.videoMessage) {
        return repondre('The command only works with video messages');
    }

    try {
        const mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage);
        const outputPath = `${filename}.mp3`;
        
        const ffmpegCommand = `ffmpeg -i ${mediaPath} -vn -c:a libmp3lame -q:a 2 ${outputPath}`;
        
        exec(ffmpegCommand, (error) => {
            fs.unlinkSync(mediaPath);
            
            if (error) {
                console.error('FFmpeg error:', error);
                return repondre('Error converting video to audio');
            }
            
            try {
                const audioBuffer = fs.readFileSync(outputPath);
                zk.sendMessage(
                    dest,
                    { 
                        audio: audioBuffer, 
                        mimetype: "audio/mpeg",
                        ptt: false
                    },
                    { quoted: ms }
                );
                fs.unlinkSync(outputPath);
            } catch (sendError) {
                console.error('Error sending audio:', sendError);
                repondre('Error sending the converted audio');
            }
        });
    } catch (downloadError) {
        console.error('Download error:', downloadError);
        repondre('Error processing the video message');
    }
});

keith({
    nomCom: 'tovideo',
    categorie: 'Audio-Edit',
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu } = commandeOptions;

    if (!msgRepondu) {
        return repondre('Please reply to an audio message to convert to video');
    }

    if (!msgRepondu.audioMessage) {
        return repondre('The command only works with audio messages');
    }

    try {
        const audioPath = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
        const outputPath = `${filename}.mp4`;
        const imagePath = path.join(__dirname, 'assets/audio_cover.jpg');
        
        const ffmpegCommand = `ffmpeg -loop 1 -i "${imagePath}" -i "${audioPath}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -shortest -pix_fmt yuv420p "${outputPath}"`;
        
        exec(ffmpegCommand, (error) => {
            fs.unlinkSync(audioPath);
            
            if (error) {
                console.error('FFmpeg error:', error);
                return repondre('Error converting audio to video');
            }
            
            try {
                const videoBuffer = fs.readFileSync(outputPath);
                zk.sendMessage(
                    dest,
                    { 
                        video: videoBuffer,
                        mimetype: "video/mp4",
                        caption: "Audio converted to video"
                    },
                    { quoted: ms }
                );
                fs.unlinkSync(outputPath);
            } catch (sendError) {
                console.error('Error sending video:', sendError);
                repondre('Error sending the converted video');
            }
        });
    } catch (downloadError) {
        console.error('Download error:', downloadError);
        repondre('Error processing the audio message');
    }
});

keith({
    nomCom: 'volaudio',
    categorie: 'Utility',
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, msgRepondu } = commandeOptions;
    const volume = parseFloat(arg[0]);

    if (!msgRepondu) {
        return repondre('Please reply to an audio message to adjust volume');
    }

    if (!msgRepondu.audioMessage) {
        return repondre('The command only works with audio messages');
    }

    if (!volume || isNaN(volume)) {
        return repondre('Please specify a valid volume level (e.g., .volaudio 20)');
    }

    try {
        const audioPath = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
        const outputPath = `${filename}.mp3`;
        
        const ffmpegCommand = `ffmpeg -i "${audioPath}" -af "volume=${volume}dB" "${outputPath}"`;
        
        exec(ffmpegCommand, (error) => {
            fs.unlinkSync(audioPath);
            
            if (error) {
                console.error('FFmpeg error:', error);
                return repondre('Error adjusting audio volume');
            }
            
            try {
                const audioBuffer = fs.readFileSync(outputPath);
                zk.sendMessage(
                    dest,
                    { 
                        audio: audioBuffer,
                        mimetype: "audio/mpeg",
                        ptt: false
                    },
                    { quoted: ms }
                );
                fs.unlinkSync(outputPath);
            } catch (sendError) {
                console.error('Error sending audio:', sendError);
                repondre('Error sending the volume-adjusted audio');
            }
        });
    } catch (downloadError) {
        console.error('Download error:', downloadError);
        repondre('Error processing the audio message');
    }
});

keith({
    nomCom: 'volvideo',
    categorie: 'Utility',
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, msgRepondu } = commandeOptions;
    const volume = parseFloat(arg[0]);

    if (!msgRepondu) {
        return repondre('Please reply to a video message to adjust volume');
    }

    if (!msgRepondu.videoMessage) {
        return repondre('The command only works with video messages');
    }

    if (!volume || isNaN(volume)) {
        return repondre('Please specify a valid volume level (e.g., .volvideo 10)');
    }

    try {
        const videoPath = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage);
        const outputPath = `${filename}.mp4`;
        
        const ffmpegCommand = `ffmpeg -i "${videoPath}" -c:v copy -af "volume=${volume}dB" -c:a aac -b:a 192k "${outputPath}"`;
        
        exec(ffmpegCommand, (error, stdout, stderr) => {
            fs.unlinkSync(videoPath);
            
            if (error) {
                console.error('FFmpeg error:', error);
                console.error('FFmpeg stderr:', stderr);
                return repondre('Error adjusting video volume');
            }
            
            try {
                const videoBuffer = fs.readFileSync(outputPath);
                zk.sendMessage(
                    dest,
                    { 
                        video: videoBuffer,
                        mimetype: "video/mp4",
                        caption: `Video volume increased by ${volume}dB`
                    },
                    { quoted: ms }
                );
                fs.unlinkSync(outputPath);
            } catch (sendError) {
                console.error('Error sending video:', sendError);
                repondre('Error sending the volume-adjusted video');
            }
        });
    } catch (downloadError) {
        console.error('Download error:', downloadError);
        repondre('Error processing the video message');
    }
});

keith({
    nomCom: 'trimaudio',
    categorie: 'Utility',
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, msgRepondu } = commandeOptions;

    if (!msgRepondu) return repondre('Please reply to an audio message');
    if (!msgRepondu.audioMessage) return repondre('Only works with audio messages');
    if (arg.length < 2) return repondre('Format: .trimaudio start end\nExample: .trimaudio 1:20 1:50');

    try {
        const parseTime = (timeStr) => {
            if (timeStr.includes(':')) {
                const [mins, secs] = timeStr.split(':').map(Number);
                return mins * 60 + secs;
            }
            return parseFloat(timeStr);
        };

        const startTime = parseTime(arg[0]);
        const endTime = parseTime(arg[1]);

        if (isNaN(startTime)) return repondre('Invalid start time format');
        if (isNaN(endTime)) return repondre('Invalid end time format');
        if (startTime >= endTime) return repondre('End time must be after start time');

        const audioPath = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
        const outputPath = `${filename}.mp3`;

        const ffmpegCommand = `ffmpeg -ss ${startTime} -i "${audioPath}" -to ${endTime - startTime} -c copy "${outputPath}"`;

        exec(ffmpegCommand, (error) => {
            fs.unlinkSync(audioPath);
            
            if (error) {
                console.error('FFmpeg error:', error);
                return repondre('Error trimming audio');
            }

            try {
                const audioBuffer = fs.readFileSync(outputPath);
                zk.sendMessage(dest, {
                    audio: audioBuffer,
                    mimetype: "audio/mpeg"
                }, { quoted: ms });
                fs.unlinkSync(outputPath);
            } catch (e) {
                console.error('Send error:', e);
                repondre('Error sending trimmed audio');
            }
        });
    } catch (error) {
        console.error('Processing error:', error);
        repondre('Error processing audio');
    }
});

keith({
    nomCom: 'trimvideo',
    categorie: 'Utility',
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, msgRepondu } = commandeOptions;

    if (!msgRepondu) return repondre('Please reply to a video message');
    if (!msgRepondu.videoMessage) return repondre('Only works with video messages');
    if (arg.length < 2) return repondre('Format: .trimvideo start end\nExample: .trimvideo 1:20 1:50');

    try {
        const parseTime = (timeStr) => {
            if (timeStr.includes(':')) {
                const parts = timeStr.split(':');
                if (parts.length === 3) {
                    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
                } else {
                    return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
                }
            }
            return parseFloat(timeStr);
        };

        const startTime = parseTime(arg[0]);
        const endTime = parseTime(arg[1]);

        if (isNaN(startTime)) return repondre('Invalid start time format');
        if (isNaN(endTime)) return repondre('Invalid end time format');
        if (startTime >= endTime) return repondre('End time must be after start time');

        const videoPath = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage);
        const outputPath = `${filename}.mp4`;

        const ffmpegCommand = `ffmpeg -ss ${startTime} -i "${videoPath}" -to ${endTime - startTime} -c:v libx264 -preset fast -c:a aac -movflags +faststart "${outputPath}"`;

        repondre('Processing video trim... Please wait ⏳');

        exec(ffmpegCommand, (error, stdout, stderr) => {
            fs.unlinkSync(videoPath);
            
            if (error) {
                console.error('FFmpeg error:', error);
                console.error('FFmpeg stderr:', stderr);
                return repondre('Error trimming video');
            }

            try {
                const videoBuffer = fs.readFileSync(outputPath);
                zk.sendMessage(dest, {
                    video: videoBuffer,
                    mimetype: "video/mp4",
                    caption: `Trimmed from ${arg[0]} to ${arg[1]}`
                }, { quoted: ms });
                fs.unlinkSync(outputPath);
            } catch (e) {
                console.error('Send error:', e);
                repondre('Error sending trimmed video');
            }
        });
    } catch (error) {
        console.error('Processing error:', error);
        repondre('Error processing video');
    }
});

keith({
    nomCom: 'amplify',
    categorie: 'Utility',
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, msgRepondu } = commandeOptions;

    // Validation checks
    if (!msgRepondu) return repondre('Please reply to a video message');
    if (!msgRepondu.videoMessage) return repondre('The command only works with video messages');
    if (!arg[0]) return repondre('Please provide an audio URL\nExample: .amplify https://example.com/audio.mp3');

    const audioUrl = arg[0];
    if (!audioUrl.match(/^https?:\/\/.+\..+$/)) {
        return repondre('Invalid URL format. Please provide a valid audio URL');
    }

    try {
        repondre('Downloading resources... ⏳');

        // Download the video message
        const videoPath = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage);
        const audioPath = `${filename}_audio.mp3`;
        const outputPath = `${filename}.mp4`;

        // Download the audio file
        const response = await axios({
            method: 'GET',
            url: audioUrl,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(audioPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // FFmpeg command to replace audio
        const ffmpegCommand = `ffmpeg -i "${videoPath}" -i "${audioPath}" -c:v copy -map 0:v:0 -map 1:a:0 -shortest "${outputPath}"`;

        repondre('Processing video... 🔄');

        exec(ffmpegCommand, async (error) => {
            // Cleanup files
            fs.unlinkSync(videoPath);
            fs.unlinkSync(audioPath);

            if (error) {
                console.error('FFmpeg error:', error);
                return repondre('Error processing video');
            }

            try {
                const videoBuffer = fs.readFileSync(outputPath);
                await zk.sendMessage(dest, {
                    video: videoBuffer,
                    mimetype: "video/mp4",
                    caption: "Video with replaced audio"
                }, { quoted: ms });

                fs.unlinkSync(outputPath);
            } catch (sendError) {
                console.error('Send error:', sendError);
                repondre('Error sending the processed video');
            }
        });

    } catch (error) {
        console.error('Error:', error);
        repondre('Error processing your request');
    }
});

keith({
    nomCom: 'slideshow',
   aliases: ['imgvid', 'imagevideo'],
    categorie: 'Utility',
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, msgRepondu } = commandeOptions;
    const text = arg.join(" ");

    // Validate input format
    if (!text.includes('|')) {
        return repondre('Please provide URLs in format: audioURL | imageURL1, imageURL2,...');
    }

    const [audioUrl, imageUrlsPart] = text.split('|').map(s => s.trim());
    const imageUrls = imageUrlsPart.split(',').map(url => url.trim()).filter(url => url);

    // Validate URLs
    if (!audioUrl || !imageUrls.length) {
        return repondre('Please provide both audio and at least one image URL');
    }

    const tempDir = `./temp_${Date.now()}`;
    fs.mkdirSync(tempDir);

    try {
        repondre('Downloading resources... 📥');

        // Download audio
        const audioPath = path.join(tempDir, 'audio.mp3');
        await downloadFile(audioUrl, audioPath);

        // Download images
        const imagePaths = [];
        for (const [index, imageUrl] of imageUrls.entries()) {
            const imagePath = path.join(tempDir, `image_${index}.jpg`);
            await downloadFile(imageUrl, imagePath);
            imagePaths.push(imagePath);
        }

        repondre('Creating slideshow... 🎬');

        // Generate slideshow
        const outputPath = path.join(tempDir, 'output.mp4');
        await createSlideshow(imagePaths, audioPath, outputPath);

        // Send result
        const videoBuffer = fs.readFileSync(outputPath);
        await zk.sendMessage(dest, {
            video: videoBuffer,
            mimetype: "video/mp4",
            caption: "Your custom slideshow"
        }, { quoted: ms });

    } catch (error) {
        console.error('Error:', error);
        repondre('Failed to create slideshow: ' + error.message);
    } finally {
        // Cleanup
        fs.rmSync(tempDir, { recursive: true, force: true });
    }

    // Helper functions
    async function downloadFile(url, filePath) {
        const response = await axios({
            method: 'GET',
            url,
            responseType: 'stream'
        });
        
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    }

    async function createSlideshow(images, audio, output) {
        // Calculate duration per image based on audio length
        const audioDuration = await getAudioDuration(audio);
        const durationPerImage = (audioDuration / images.length).toFixed(2);
        
        // Create FFmpeg command
        const ffmpegCommand = `
            ffmpeg -y \
            ${images.map((img, i) => `-loop 1 -t ${durationPerImage} -i "${img}"`).join(' ')} \
            -i "${audio}" \
            -filter_complex "concat=n=${images.length}:v=1:a=0,format=yuv420p" \
            -c:v libx264 -preset fast -movflags +faststart \
            -c:a aac -b:a 192k \
            "${output}"
        `.replace(/\s+/g, ' ').trim();

        return new Promise((resolve, reject) => {
            exec(ffmpegCommand, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }

    async function getAudioDuration(audioPath) {
        return new Promise((resolve) => {
            exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`, 
                (error, stdout) => {
                    resolve(parseFloat(stdout) || 30); // Default to 30s if cannot determine
                });
        });
    }
});

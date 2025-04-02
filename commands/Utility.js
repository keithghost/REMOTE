const { keith } = require('../keizzah/keith');
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const axios = require("axios");
const filename = `${Math.random().toString(36).substring(2, 9)}`;

keith({
    nomCom: 'toaudio',
    categorie: 'Utility',
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
    categorie: 'Utility',
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

keith({
    nomCom: 'collage',
    categorie: 'Utility',
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;
    const input = arg.join(" ");

    // Validate input format
    if (!input.includes('|')) {
        return repondre([
            'Invalid format! Use:',
            '.collage [layout] | [media URLs]',
            'Examples:',
            '.collage 2x2 | url1, url2, url3, url4',
            '.collage 1x3 | url1, url2, url3'
        ].join('\n'));
    }

    const [layout, mediaPart] = input.split('|').map(s => s.trim());
    const [rows, cols] = layout.split('x').map(Number);
    const mediaUrls = mediaPart.split(',').map(url => url.trim()).filter(url => url);

    // Validate layout
    if (!rows || !cols || rows > 4 || cols > 4) {
        return repondre('Invalid layout! Use formats like 2x2, 1x3, 3x1 (max 4x4)');
    }

    const requiredSlots = rows * cols;
    if (mediaUrls.length !== requiredSlots) {
        return repondre(`Need exactly ${requiredSlots} media items for ${layout} layout`);
    }

    const tempDir = `./temp_collage_${Date.now()}`;
    fs.mkdirSync(tempDir);

    try {
        repondre(`Downloading ${mediaUrls.length} media items...`);

        // Download all media files
        const mediaPaths = await Promise.all(
            mediaUrls.map(async (url, index) => {
                const ext = url.match(/\.(jpg|png|mp4|gif)$/i)?.[1] || 'mp4';
                const mediaPath = path.join(tempDir, `media_${index}.${ext}`);
                await downloadFile(url, mediaPath);
                return mediaPath;
            })
        );

        // Generate collage
        repondre(`Creating ${layout} collage...`);
        const outputPath = path.join(tempDir, 'collage.mp4');
        await createCollage(mediaPaths, rows, cols, outputPath);

        // Send result
        const videoBuffer = fs.readFileSync(outputPath);
        await zk.sendMessage(dest, {
            video: videoBuffer,
            mimetype: "video/mp4",
            caption: `📺 ${layout} Media Collage`
        }, { quoted: ms });

    } catch (error) {
        console.error('Collage error:', error);
        repondre(`Failed: ${error.message}`);
    } finally {
        // Cleanup
        fs.rmSync(tempDir, { recursive: true, force: true });
    }

    // Helper Functions
    async function downloadFile(url, filePath) {
        const response = await axios({
            method: 'GET',
            url,
            responseType: 'stream',
            timeout: 30000
        });
        
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    }

    async function createCollage(inputs, rows, cols, output) {
        const isVideo = inputs.some(f => f.endsWith('.mp4'));
        const filterComplex = generateFilterComplex(inputs, rows, cols, isVideo);
        
        const ffmpegCommand = [
            'ffmpeg -y',
            inputs.map(i => `-i "${i}"`).join(' '),
            '-filter_complex', `"${filterComplex}"`,
            '-map', '[out]',
            '-c:v libx264 -preset fast -crf 23',
            '-pix_fmt yuv420p -movflags +faststart',
            `"${output}"`
        ].join(' ');

        return new Promise((resolve, reject) => {
            exec(ffmpegCommand, (err) => err ? reject(err) : resolve());
        });
    }

    function generateFilterComplex(inputs, rows, cols, hasVideo) {
        const width = 640;
        const height = 360;
        const cellWidth = width / cols;
        const cellHeight = height / rows;
        
        let filters = [];
        let inputsCount = inputs.length;
        
        // Prepare each input
        inputs.forEach((_, i) => {
            if (hasVideo) {
                filters.push(`[${i}:v]scale=${cellWidth}:${cellHeight}:force_original_aspect_ratio=decrease,pad=${cellWidth}:${cellHeight}:(ow-iw)/2:(oh-ih)/2[v${i}]`);
            } else {
                filters.push(`[${i}:v]scale=${cellWidth}:${cellHeight},loop=-1:1[v${i}]`);
            }
        });
        
        // Grid layout
        let grid = [];
        for (let r = 0; r < rows; r++) {
            let row = [];
            for (let c = 0; c < cols; c++) {
                const index = r * cols + c;
                if (index < inputsCount) {
                    row.push(`[v${index}]`);
                }
            }
            if (row.length > 0) {
                grid.push(`${row.join('')}hstack=inputs=${row.length}[row${r}]`);
            }
        }
        
        filters = filters.concat(grid);
        const vstackInputs = grid.map((_, i) => `[row${i}]`).join('');
        
        return [
            ...filters,
            `${vstackInputs}vstack=inputs=${rows}[out]`
        ].join(';');
    }
});


keith({
    nomCom: 'subtitle',
    categorie: 'Utility',
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, msgRepondu } = commandeOptions;
    
    // Validate replied message
    if (!msgRepondu || !msgRepondu.videoMessage) {
        return repondre('Please reply to a video message');
    }

    // Parse arguments
    const textMatch = arg.join(' ').match(/"([^"]+)"|“([^”]+)”|'([^']+)'/);
    if (!textMatch) {
        return repondre([
            'Format: .subtitle "text" [options]',
            'Example: .subtitle "Hello World" color=red font=Arial size=24',
            'Options:',
            'color: red/blue/#FFFFFF (default: white)',
            'font: Arial/Helvetica/etc (default: Arial)',
            'size: font size (default: 24)',
            'position: top/middle/bottom (default: bottom)',
            'border: border width (default: 2)'
        ].join('\n'));
    }

    const text = textMatch.slice(1).find(m => m);
    const options = parseOptions(arg.join(' '));

    try {
        repondre('Adding subtitles...');

        // Download video
        const tempDir = `./temp_subtitle_${Date.now()}`;
        fs.mkdirSync(tempDir);
        const inputPath = path.join(tempDir, 'input.mp4');
        await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage, inputPath);

        // Generate subtitles
        const outputPath = path.join(tempDir, 'output.mp4');
        await burnSubtitles(inputPath, outputPath, text, options);

        // Send result
        const videoBuffer = fs.readFileSync(outputPath);
        await zk.sendMessage(dest, {
            video: videoBuffer,
            mimetype: "video/mp4"
        }, { quoted: ms });

    } catch (error) {
        console.error('Subtitle error:', error);
        repondre('Failed to add subtitles: ' + error.message);
    } finally {
        // Cleanup
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true });
        }
    }

    // Helper functions
    function parseOptions(input) {
        const options = {
            color: 'white',
            font: 'Arial',
            size: 24,
            position: 'bottom',
            border: 2
        };

        const optionRegex = /(\w+)=([^ ]+)/g;
        let match;
        while ((match = optionRegex.exec(input)) !== null) {
            options[match[1]] = match[2];
        }

        // Validate color
        if (!options.color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^[a-zA-Z]+$/)) {
            options.color = 'white';
        }

        return options;
    }

    async function burnSubtitles(input, output, text, options) {
        const fontPath = path.join(__dirname, 'fonts', `${options.font}.ttf`);
        const hasCustomFont = fs.existsSync(fontPath);

        // Calculate position
        let yPosition;
        switch (options.position) {
            case 'top': yPosition = 'h/10'; break;
            case 'middle': yPosition = 'h/2-text_h/2'; break;
            default: yPosition = 'h-h/10-text_h'; // bottom
        }

        const ffmpegCommand = [
            'ffmpeg -y',
            `-i "${input}"`,
            '-vf',
            `"drawtext=` +
            `text='${text.replace(/'/g, "'\\\\''")}':` +
            `fontfile=${hasCustomFont ? fontPath : ''}:` +
            `fontcolor=${options.color}:` +
            `fontsize=${options.size}:` +
            `bordercolor=black:` +
            `borderw=${options.border}:` +
            `x=(w-text_w)/2:` +
            `y=${yPosition}:` +
            `enable='between(t,0,30)'"`, // Show for first 30 seconds
            '-c:a copy',
            `"${output}"`
        ].join(' ');

        return new Promise((resolve, reject) => {
            exec(ffmpegCommand, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }
});

keith({
    nomCom: 'subtitle2',
    categorie: 'Utility',
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, msgRepondu } = commandeOptions;
    
    if (!msgRepondu?.videoMessage) {
        return repondre('Please reply to a video message');
    }

    // Enhanced argument parsing with multiple text support
    const textBlocks = [];
    let currentArgs = [...arg];
    let options = {
        color: 'white',
        font: 'Arial',
        size: 24,
        position: 'bottom',
        border: 2,
        bgcolor: 'black@0.5',
        shadow: '2:2:3',
        effect: 'none',
        duration: 'full'
    };

    // Parse text blocks and options
    while (currentArgs.length > 0) {
        const textMatch = currentArgs.join(' ').match(/^(["'“])(.+?)\1/);
        if (textMatch) {
            textBlocks.push({
                text: textMatch[2],
                options: {...options} // Clone current options
            });
            currentArgs = currentArgs.join(' ').substring(textMatch[0].length).trim().split(' ');
        } else {
            const optionMatch = currentArgs[0].match(/^(\w+)=(.+)$/);
            if (optionMatch) {
                options[optionMatch[1]] = optionMatch[2];
                currentArgs.shift();
            } else {
                currentArgs.shift(); // Skip invalid
            }
        }
    }

    if (textBlocks.length === 0) {
        return repondre([
            'Format: .subtitle "text1" [options] "text2" [options]',
            'Options (per text):',
            'color: red/blue/#FFFFFF (default: white)',
            'font: Arial/Helvetica/etc (default: Arial)',
            'size: font size (default: 24)',
            'position: top/middle/bottom (default: bottom)',
            'border: border width (default: 2)',
            'bgcolor: color@opacity (default: black@0.5)',
            'shadow: x:y:blur (default: 2:2:3)',
            'effect: fade/typewriter (default: none)',
            'duration: full/5s/10-15s (default: full)'
        ].join('\n'));
    }

    try {
        repondre('Processing subtitles...');

        // Setup temp directory
        const tempDir = fs.mkdtempSync(`./subtitle_${Date.now()}_`);
        const inputPath = path.join(tempDir, 'input.mp4');
        const outputPath = path.join(tempDir, 'output.mp4');

        // Download video
        await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage, inputPath);

        // Generate complex filter
        const videoInfo = await getVideoInfo(inputPath);
        const filters = generateFilters(textBlocks, videoInfo);

        // Build FFmpeg command
        const ffmpegCommand = [
            'ffmpeg -y',
            `-i "${inputPath}"`,
            '-vf', `"${filters.join(',')}"`,
            '-c:v libx264 -preset fast -crf 18',
            '-c:a copy',
            `"${outputPath}"`
        ].join(' ');

        await executeCommand(ffmpegCommand);

        // Send result
        const videoBuffer = fs.readFileSync(outputPath);
        await zk.sendMessage(dest, { video: videoBuffer }, { quoted: ms });

    } catch (error) {
        console.error('Subtitle error:', error);
        repondre(`Error: ${error.message}`);
    } finally {
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true });
        }
    }

    // Helper Functions
    async function getVideoInfo(filePath) {
        return new Promise((resolve) => {
            exec(`ffprobe -v error -show_format -show_streams -of json "${filePath}"`,
                (err, stdout) => {
                    const info = JSON.parse(stdout.toString());
                    resolve({
                        duration: parseFloat(info.format.duration),
                        width: info.streams[0].width,
                        height: info.streams[0].height
                    });
                });
        });
    }

    function generateFilters(textBlocks, videoInfo) {
        const baseFilters = [];
        const overlayFilters = [];
        
        textBlocks.forEach((block, index) => {
            const { text, options } = block;
            const fontPath = getFontPath(options.font);
            
            // Calculate timing
            const [start, end] = parseDuration(options.duration, videoInfo.duration);
            
            // Background box
            if (options.bgcolor) {
                const [bgColor, opacity] = options.bgcolor.split('@');
                baseFilters.push(
                    `color=${bgColor}@${opacity || '0.5'}:` +
                    `${videoInfo.width}x${options.size * 2}[bg${index}]`
                );
            }
            
            // Text with effects
            let textFilter = `drawtext=` +
                `text='${escapeText(text)}':` +
                `fontfile='${fontPath}':` +
                `fontcolor=${options.color}:` +
                `fontsize=${options.size}:` +
                `box=1:boxcolor=black@0.5:boxborderw=5:` +
                `shadowcolor=black:shadowx=${options.shadow?.split(':')[0] || 2}:` +
                `shadowy=${options.shadow?.split(':')[1] || 2}:` +
                `shadowt=${options.shadow?.split(':')[2] || 3}:` +
                `x=(w-text_w)/2:` +
                `y=${getYPosition(options.position, videoInfo.height, options.size)}:` +
                `enable='between(t,${start},${end})'`;
                
            if (options.effect === 'fade') {
                textFilter += `:alpha='if(lt(t,${start}+1),(t-${start})/1,` +
                    `if(lt(t,${end}-1),1,(${end}-t)/1))'`;
            } else if (options.effect === 'typewriter') {
                textFilter += `:text='${typewriterEffect(text, start, end)}'`;
            }
            
            overlayFilters.push(textFilter);
        });
        
        return [...baseFilters, ...overlayFilters];
    }

    function escapeText(text) {
        return text.replace(/'/g, "'\\\\''")
                  .replace(/%/g, '%%')
                  .replace(/\\n/g, '\n');
    }

    function getYPosition(position, videoHeight, fontSize) {
        const padding = fontSize;
        switch (position) {
            case 'top': return padding;
            case 'middle': return `(h-text_h)/2`;
            default: return `h-text_h-${padding}`; // bottom
        }
    }

    function parseDuration(duration, videoDuration) {
        if (duration === 'full') return [0, videoDuration];
        if (duration.includes('-')) {
            const [start, end] = duration.split('-').map(parseFloat);
            return [start, end];
        }
        const seconds = parseFloat(duration);
        return [0, seconds];
    }

    function typewriterEffect(text, start, end) {
        const duration = end - start;
        return `substring(0,ceil((t-${start})/${duration/text.length}*${text.length}))`;
    }

    function getFontPath(fontName) {
        const customPath = path.join(__dirname, 'fonts', `${fontName}.ttf`);
        return fs.existsSync(customPath) ? customPath : '';
    }

    async function executeCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('FFmpeg stderr:', stderr);
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
});

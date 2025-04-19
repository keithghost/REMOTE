const { keith } = require('../keizzah/keith');
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const axios = require("axios");

/*keith({
    nomCom: 'react',
    categorie: 'Video-Edit',
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, msgRepondu } = commandeOptions;

    // Validate input
    if (!msgRepondu?.videoMessage) {
        return repondre('Please reply to the main video');
    }

    const options = {
        template: 'sidebyside', // sidebyside, pictureinpicture, topbottom
        ratio: '1:1',           // Aspect ratio for split templates
        camSize: '30%',         // Size for PiP template
        border: '3px',          # Border styling
        muteOriginal: false     # Mute main video
    };

    // Parse arguments
    arg.forEach(opt => {
        const [key, value] = opt.split('=');
        if (options.hasOwnProperty(key)) {
            options[key] = value;
        }
    });

    try {
        repondre('Creating reaction video... 🎬');

        // Setup workspace
        const tempDir = fs.mkdtempSync(`./react_${Date.now()}_`);
        const mainVideoPath = path.join(tempDir, 'main.mp4');
        const reactionVideoPath = path.join(tempDir, 'reaction.mp4');
        const outputPath = path.join(tempDir, 'output.mp4');

        // Step 1: Download both videos
        await Promise.all([
            zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage, mainVideoPath),
            (async () => {
                if (commandeOptions.mentionedJidList?.length) {
                    // Get reaction video from mentioned user's last video
                    const userMsg = await zk.loadMessage(dest, commandeOptions.mentionedJidList[0]);
                    if (userMsg?.videoMessage) {
                        return zk.downloadAndSaveMediaMessage(userMsg.videoMessage, reactionVideoPath);
                    }
                }
                throw new Error('Please mention a user with a video message');
            })()
        ]);

        // Step 2: Process videos
        const { width, height } = await getVideoDimensions(mainVideoPath);
        const ffmpegCommand = buildFFmpegCommand(mainVideoPath, reactionVideoPath, outputPath, options, { width, height });

        await executeFFmpeg(ffmpegCommand);

        // Step 3: Send result
        const videoBuffer = fs.readFileSync(outputPath);
        await zk.sendMessage(dest, {
            video: videoBuffer,
            mimetype: "video/mp4",
            caption: "Your Reaction Video"
        }, { quoted: ms });

    } catch (error) {
        console.error('Reaction error:', error);
        repondre(`Failed: ${error.message}`);
    } finally {
        // Cleanup
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true });
        }
    }

    // Helper Functions
    async function getVideoDimensions(videoPath) {
        return new Promise((resolve) => {
            exec(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of json "${videoPath}"`,
                (err, stdout) => {
                    const { streams: [ { width, height } ] } = JSON.parse(stdout);
                    resolve({ width, height });
                });
        });
    }

    function buildFFmpegCommand(mainPath, reactPath, outputPath, options, dimensions) {
        const base = [
            'ffmpeg -y',
            `-i "${mainPath}"`,
            `-i "${reactPath}"`,
            '-filter_complex'
        ];

        const filters = [];
        const outputs = [];

        // Audio handling
        if (options.muteOriginal) {
            filters.push(`[1:a]volume=1[a]`);
            outputs.push('-map', '[a]');
        } else {
            filters.push(`[0:a][1:a]amix=inputs=2:duration=longest[a]`);
            outputs.push('-map', '[a]');
        }

        // Video processing based on template
        switch (options.template) {
            case 'pictureinpicture':
                const pipSize = options.camSize || '30%';
                filters.push(
                    `[0:v]scale=${dimensions.width}:${dimensions.height}[main]`,
                    `[1:v]scale=iw*${parseFloat(pipSize)/100}:-1[react]`,
                    `[main][react]overlay=W-w-10:H-h-10:format=auto`
                );
                break;

            case 'topbottom':
                const [ratioW, ratioH] = options.ratio.split(':').map(Number);
                filters.push(
                    `[0:v]scale=${dimensions.width}:${dimensions.height/(ratioW+ratioH)*ratioH}[top]`,
                    `[1:v]scale=${dimensions.width}:${dimensions.height/(ratioW+ratioH)*ratioW}[bottom]`,
                    `[top][bottom]vstack=inputs=2`,
                    `pad=${dimensions.width}:${dimensions.height}:(ow-iw)/2:(oh-ih)/2`
                );
                break;

            default: // sidebyside
                const border = options.border ? `fill=black@0.5:x=${dimensions.width/2}-${options.border}` : '';
                filters.push(
                    `[0:v]scale=${dimensions.width/2}:${dimensions.height}[left]`,
                    `[1:v]scale=${dimensions.width/2}:${dimensions.height}[right]`,
                    `[left][right]hstack=inputs=2${border ? `,${border}` : ''}`
                );
        }

        outputs.push(
            '-map', '[v]',
            '-c:v libx264 -preset fast -crf 18',
            '-movflags +faststart',
            `"${outputPath}"`
        );

        return [...base, `"${filters.join(';')}"`, ...outputs].join(' ');
    }

    async function executeFFmpeg(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('FFmpeg stderr:', stderr);
                    reject(new Error('Video processing failed'));
                } else {
                    resolve();
                }
            });
        });
    }
});

keith({
    nomCom: 'subtitle3',
    categorie: 'Video-Edit',
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

keith({
    nomCom: 'slideshow2',
    categorie: 'Media-Edit',
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;
    const text = arg.join(" ");

    // Validate input format
    if (!text.includes('|')) {
        return repondre([
            'Format: .slideshow audioURL | imageURL1, imageURL2,...',
            'Example:',
            '.slideshow https://audio.mp3 | https://img1.jpg, https://img2.jpg',
            'Options:',
            'size=720p/1080p (default: 720p)',
            'duration=full/seconds (default: auto-calculated)'
        ].join('\n'));
    }

    const [audioUrl, imageUrlsPart] = text.split('|').map(s => s.trim());
    const imageUrls = imageUrlsPart.split(',').map(url => url.trim()).filter(url => url);
    const options = parseOptions(text);

    if (!audioUrl || !imageUrls.length) {
        return repondre('Please provide both audio and at least one image URL');
    }

    const tempDir = `./temp_slideshow_${Date.now()}`;
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

        // Get audio duration
        const audioDuration = await getAudioDuration(audioPath);
        const slideDuration = options.duration === 'full' ? 
            (audioDuration / imagePaths.length) : 
            parseFloat(options.duration) || (audioDuration / imagePaths.length);

        repondre('Creating slideshow... 🎬');

        // Generate FFmpeg command
        const outputPath = path.join(tempDir, 'output.mp4');
        await createSlideshow(imagePaths, audioPath, outputPath, {
            slideDuration,
            resolution: options.size || '720p'
        });

        // Send result
        const videoBuffer = fs.readFileSync(outputPath);
        await zk.sendMessage(dest, {
            video: videoBuffer,
            mimetype: "video/mp4",
            caption: "Your Slideshow"
        }, { quoted: ms });

    } catch (error) {
        console.error('Slideshow error:', error);
        repondre(`Failed: ${error.message}`);
    } finally {
        // Cleanup
        fs.rmSync(tempDir, { recursive: true, force: true });
    }

    // Helper Functions
    function parseOptions(input) {
        const options = {
            size: '720p',
            duration: 'full'
        };

        const optionRegex = /(\w+)=([^ ]+)/g;
        let match;
        while ((match = optionRegex.exec(input)) !== null) {
            options[match[1]] = match[2];
        }

        return options;
    }

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

    async function getAudioDuration(audioPath) {
        return new Promise((resolve) => {
            exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`, 
                (error, stdout) => {
                    resolve(parseFloat(stdout) || 30); // Default 30s if cannot determine
                });
        });
    }

    async function createSlideshow(images, audio, output, options) {
        const resolution = {
            '720p': '1280:720',
            '1080p': '1920:1080'
        }[options.size] || '1280:720';

        const filters = [
            // Scale and pad all images to uniform resolution
            ...images.map((img, i) => 
                `[${i}:v]scale=${resolution}:force_original_aspect_ratio=decrease,` +
                `pad=${resolution}:(ow-iw)/2:(oh-ih)/2,` +
                `setsar=1,` +
                `fade=in:0:30,fade=out:${options.slideDuration-1}:30[v${i}]`
            ),
            // Concatenate with audio
            `${images.map((_, i) => `[v${i}]`).join('')}concat=n=${images.length}:v=1:a=0[v]`,
            `[v]format=yuv420p[vid]`
        ].join(';');

        const ffmpegCommand = [
            'ffmpeg -y',
            ...images.map(img => `-loop 1 -t ${options.slideDuration} -i "${img}"`),
            `-i "${audio}"`,
            `-filter_complex "${filters}"`,
            '-map "[vid]" -map 3:a',
            '-c:v libx264 -preset fast -crf 18',
            '-c:a aac -b:a 192k',
            '-movflags +faststart',
            `"${output}"`
        ].join(' ');

        return new Promise((resolve, reject) => {
            exec(ffmpegCommand, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }
});*/


keith({
    nomCom: 'tomp3',
    categorie: 'Audio-Edit',
    description: 'Quote an audio message and convert to MP3'
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu } = commandeOptions;

    // Check if the message is a reply
    if (!msgRepondu) {
        return repondre('Please reply to an audio message to convert');
    }

    // Check if the replied message is an audio
    if (!msgRepondu.audioMessage) {
        return repondre('The command only works with audio messages');
    }

    try {
        // Generate a unique filename
        const filename = `quote_audio_${Date.now()}.mp3`;
        
        // Download the audio message
        const audioPath = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
        
        // Convert to MP3 using FFmpeg
        const ffmpegCommand = `ffmpeg -i "${audioPath}" -c:a libmp3lame -q:a 2 "${filename}"`;
        
        exec(ffmpegCommand, async (error) => {
            // Clean up the original audio file
            fs.unlinkSync(audioPath);
            
            if (error) {
                console.error('FFmpeg error:', error);
                return repondre('Error converting audio to MP3');
            }
            
            try {
                // Read the converted file
                const audioBuffer = fs.readFileSync(filename);
                
                // Get quoted message details
                const quotedMsg = {
                    key: msgRepondu.key,
                    message: msgRepondu.message
                };
                
                // Send the converted audio with quoted message
                await zk.sendMessage(
                    dest,
                    { 
                        audio: audioBuffer,
                        mimetype: "audio/mpeg",
                        ptt: false,
                        contextInfo: {
                            quotedMessage: quotedMsg
                        }
                    },
                    { quoted: ms }
                );
                
                // Clean up the converted file
                fs.unlinkSync(filename);
            } catch (sendError) {
                console.error('Error sending audio:', sendError);
                repondre('Error sending the converted audio');
            }
        });
    } catch (downloadError) {
        console.error('Download error:', downloadError);
        repondre('Error processing the audio message');
    }
});



keith({
    nomCom: 'toptt',
    categorie: 'Audio-Edit',
    description: 'Quote an audio message and convert to MP3'
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu } = commandeOptions;

    // Check if the message is a reply
    if (!msgRepondu) {
        return repondre('Please reply to an audio message to convert');
    }

    // Check if the replied message is an audio
    if (!msgRepondu.audioMessage) {
        return repondre('The command only works with audio messages');
    }

    try {
        // Generate a unique filename
        const filename = `quote_audio_${Date.now()}.mp3`;
        
        // Download the audio message
        const audioPath = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
        
        // Convert to MP3 using FFmpeg
        const ffmpegCommand = `ffmpeg -i "${audioPath}" -c:a libmp3lame -q:a 2 "${filename}"`;
        
        exec(ffmpegCommand, async (error) => {
            // Clean up the original audio file
            fs.unlinkSync(audioPath);
            
            if (error) {
                console.error('FFmpeg error:', error);
                return repondre('Error converting audio to MP3');
            }
            
            try {
                // Read the converted file
                const audioBuffer = fs.readFileSync(filename);
                
                // Get quoted message details
                const quotedMsg = {
                    key: msgRepondu.key,
                    message: msgRepondu.message
                };
                
                // Send the converted audio with quoted message
                await zk.sendMessage(
                    dest,
                    { 
                        audio: audioBuffer,
                        mimetype: "audio/mpeg",
                        ptt: true,
                        contextInfo: {
                            quotedMessage: quotedMsg
                        }
                    },
                    { quoted: ms }
                );
                
                // Clean up the converted file
                fs.unlinkSync(filename);
            } catch (sendError) {
                console.error('Error sending audio:', sendError);
                repondre('Error sending the converted audio');
            }
        });
    } catch (downloadError) {
        console.error('Download error:', downloadError);
        repondre('Error processing the audio message');
    }
});


keith({
    nomCom: 'slowmotion',
    categorie: 'Video-Edit'
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, msgRepondu } = commandeOptions;

    // Check if message is a reply
    if (!msgRepondu) {
        return repondre('Please reply to a video message to convert to slow motion');
    }

    // Check if replied message is a video
    if (!msgRepondu.videoMessage) {
        return repondre('The command only works with video messages');
    }

    // Parse speed factor (default to 2x slower if not specified)
    const speedFactor = arg[0] ? parseFloat(arg[0]) : 2;
    
    if (isNaN(speedFactor) {
        return repondre('Please provide a valid number for speed factor (e.g., .slowmotion 2)');
    }

    try {
        // Generate unique filenames
        const tempFilename = `temp_video_${Date.now()}`;
        const inputPath = `${tempFilename}_input.mp4`;
        const outputPath = `${tempFilename}_slowmo.mp4`;

        // Download the video message
        const videoPath = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage, inputPath);

        // FFmpeg command to create slow motion effect
        const ffmpegCommand = `ffmpeg -i "${inputPath}" ` +
                             `-filter_complex "[0:v]setpts=${speedFactor}*PTS[v];[0:a]atempo=${1/speedFactor}[a]" ` +
                             `-map "[v]" -map "[a]" ` +
                             `-c:v libx264 -preset fast -crf 22 ` +
                             `-c:a aac -b:a 128k ` +
                             `"${outputPath}"`;

        repondre(`Creating ${speedFactor}x slow motion... Please wait ⏳`);

        exec(ffmpegCommand, async (error, stdout, stderr) => {
            // Clean up the original video file
            fs.unlinkSync(inputPath);

            if (error) {
                console.error('FFmpeg error:', error);
                console.error('FFmpeg stderr:', stderr);
                return repondre('Error creating slow motion video');
            }

            try {
                // Read the converted file
                const videoBuffer = fs.readFileSync(outputPath);

                // Get quoted message details
                const quotedMsg = {
                    key: msgRepondu.key,
                    message: msgRepondu.message
                };

                // Send the slow motion video with quoted message
                await zk.sendMessage(
                    dest,
                    { 
                        video: videoBuffer,
                        mimetype: "video/mp4",
                        caption: `Slow motion (${speedFactor}x)`,
                        contextInfo: {
                            quotedMessage: quotedMsg
                        }
                    },
                    { quoted: ms }
                );

                // Clean up the converted file
                fs.unlinkSync(outputPath);
            } catch (sendError) {
                console.error('Error sending video:', sendError);
                repondre('Error sending the slow motion video');
            }
        });
    } catch (downloadError) {
        console.error('Download error:', downloadError);
        repondre('Error processing the video message');
    }
});

keith({
    nomCom: 'fastmotion',
    categorie: 'Video-Edit'
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, msgRepondu } = commandeOptions;

    // Validation checks
    if (!msgRepondu) {
        return repondre('Please reply to a video message to speed up');
    }

    if (!msgRepondu.videoMessage) {
        return repondre('The command only works with video messages');
    }

    // Parse speed factor (default to 2x faster if not specified)
    const speedFactor = arg[0] ? parseFloat(arg[0]) : 2;
    
    if (isNaN(speedFactor) || speedFactor <= 0) {
        return repondre('Please provide a valid positive number for speed factor (e.g., .fastmotion 2)');
    }

    try {
        // Generate unique filenames
        const filename = `fastmotion_${Date.now()}`;
        const inputPath = `${filename}_input.mp4`;
        const outputPath = `${filename}_fast.mp4`;

        // Download the video message
        const videoPath = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage, inputPath);

        // FFmpeg command to create fast motion effect
        const ffmpegCommand = `ffmpeg -i "${inputPath}" ` +
                             `-filter_complex "[0:v]setpts=${1/speedFactor}*PTS[v];[0:a]atempo=${speedFactor}[a]" ` +
                             `-map "[v]" -map "[a]" ` +
                             `-c:v libx264 -preset fast -crf 22 ` +
                             `-c:a aac -b:a 128k ` +
                             `"${outputPath}"`;

        repondre(`Speeding up video ${speedFactor}x... Please wait ⏳`);

        exec(ffmpegCommand, async (error, stdout, stderr) => {
            // Clean up the original video file
            fs.unlinkSync(inputPath);

            if (error) {
                console.error('FFmpeg error:', error);
                console.error('FFmpeg stderr:', stderr);
                return repondre('Error creating fast motion video');
            }

            try {
                // Read the converted file
                const videoBuffer = fs.readFileSync(outputPath);

                // Get quoted message details
                const quotedMsg = {
                    key: msgRepondu.key,
                    message: msgRepondu.message
                };

                // Send the fast motion video with quoted message
                await zk.sendMessage(
                    dest,
                    { 
                        video: videoBuffer,
                        mimetype: "video/mp4",
                        caption: `Fast motion (${speedFactor}x speed)`,
                        contextInfo: {
                            quotedMessage: quotedMsg
                        }
                    },
                    { quoted: ms }
                );

                // Clean up the converted file
                fs.unlinkSync(outputPath);
            } catch (sendError) {
                console.error('Error sending video:', sendError);
                repondre('Error sending the fast motion video');
            }
        });
    } catch (downloadError) {
        console.error('Download error:', downloadError);
        repondre('Error processing the video message');
    }
});            

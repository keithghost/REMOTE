const { keith } = require('../keizzah/keith');
const fs = require("fs");
const { exec } = require("child_process");

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
        
        // FFmpeg command to convert video to audio with some basic audio processing
        const ffmpegCommand = `ffmpeg -i ${mediaPath} -vn -c:a libmp3lame -q:a 2 ${outputPath}`;
        
        exec(ffmpegCommand, (error) => {
            // Clean up the original video file
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
                
                // Clean up the generated audio file
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
        // Download the audio message
        const audioPath = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
        const outputPath = `${filename}.mp4`;
        
        // Path to a static image (you might want to customize this)
        const imagePath = path.join(__dirname, 'assets/audio_cover.jpg'); // Create this image or provide your own
        
        // FFmpeg command to create video from audio with static image
        const ffmpegCommand = `ffmpeg -loop 1 -i "${imagePath}" -i "${audioPath}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -shortest -pix_fmt yuv420p "${outputPath}"`;
        
        exec(ffmpegCommand, (error) => {
            // Clean up the original audio file
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
                
                // Clean up the generated video file
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
    const volume = parseFloat(arg[0]); // Get volume level from command

    // Validation checks
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
        // Download the audio message
        const audioPath = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
        const outputPath = `${filename}.mp3`;
        
        // FFmpeg command to adjust volume
        // Using 'volume' filter with specified dB level
        const ffmpegCommand = `ffmpeg -i "${audioPath}" -af "volume=${volume}dB" "${outputPath}"`;
        
        exec(ffmpegCommand, (error) => {
            // Clean up the original audio file
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
                
                // Clean up the generated audio file
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
    const volume = parseFloat(arg[0]); // Get volume level from command

    // Validation checks
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
        // Download the video message
        const videoPath = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage);
        const outputPath = `${filename}.mp4`;
        
        // FFmpeg command to adjust video volume while preserving video stream
        const ffmpegCommand = `ffmpeg -i "${videoPath}" -c:v copy -af "volume=${volume}dB" -c:a aac -b:a 192k "${outputPath}"`;
        
        exec(ffmpegCommand, (error, stdout, stderr) => {
            // Clean up the original video file
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
                
                // Clean up the generated video file
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

    // Validate input
    if (!msgRepondu) return repondre('Please reply to an audio message');
    if (!msgRepondu.audioMessage) return repondre('Only works with audio messages');
    if (arg.length < 2) return repondre('Format: .trimaudio start end\nExample: .trimaudio 1:20 1:50');

    try {
        // Parse time arguments
        const parseTime = (timeStr) => {
            if (timeStr.includes(':')) {
                const [mins, secs] = timeStr.split(':').map(Number);
                return mins * 60 + secs;
            }
            return parseFloat(timeStr);
        };

        const startTime = parseTime(arg[0]);
        const endTime = parseTime(arg[1]);

        if (isNaN(startTime) return repondre('Invalid start time format');
        if (isNaN(endTime)) return repondre('Invalid end time format');
        if (startTime >= endTime) return repondre('End time must be after start time');

        // Download and process audio
        const audioPath = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
        const outputPath = `${filename}.mp3`;

        // FFmpeg command with precise seeking and duration
        const ffmpegCommand = `ffmpeg -ss ${startTime} -i "${audioPath}" -to ${endTime - startTime} -c copy "${outputPath}"`;

        exec(ffmpegCommand, (error) => {
            fs.unlinkSync(audioPath); // Cleanup original
            
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
                
                fs.unlinkSync(outputPath); // Cleanup trimmed
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

    // Validate input
    if (!msgRepondu) return repondre('Please reply to a video message');
    if (!msgRepondu.videoMessage) return repondre('Only works with video messages');
    if (arg.length < 2) return repondre('Format: .trimvideo start end\nExample: .trimvideo 1:20 1:50');

    try {
        // Parse time arguments
        const parseTime = (timeStr) => {
            if (timeStr.includes(':')) {
                const parts = timeStr.split(':');
                if (parts.length === 3) { // HH:MM:SS format
                    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
                } else { // MM:SS format
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

        // Download and process video
        const videoPath = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage);
        const outputPath = `${filename}.mp4`;

        // FFmpeg command with precise seeking and duration
        const ffmpegCommand = `ffmpeg -ss ${startTime} -i "${videoPath}" -to ${endTime - startTime} -c:v libx264 -preset fast -c:a aac -movflags +faststart "${outputPath}"`;

        repondre('Processing video trim... Please wait ⏳');

        exec(ffmpegCommand, (error, stdout, stderr) => {
            fs.unlinkSync(videoPath); // Cleanup original
            
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
                
                fs.unlinkSync(outputPath); // Cleanup trimmed
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

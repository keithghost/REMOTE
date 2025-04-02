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

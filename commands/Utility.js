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

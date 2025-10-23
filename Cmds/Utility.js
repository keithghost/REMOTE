
const { keith } = require('../commandHandler');
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const XLSX = require('xlsx');
const path = require('path');
const { exec } = require('child_process');
const cheerio = require('cheerio');
const axios = require('axios');
const fetch = require('node-fetch');
const translatte = require('translatte');
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================


keith({
    pattern: "inspect",
    desc: "Inspect website content including HTML, CSS, JS, and media files",
    category: "Utility",
    alias: ["spyweb", "webspy", "analyze", "crawl"],
    react: "🔍",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, reply } = context;

        if (!text) return reply("Provide a valid web link to fetch! The bot will crawl the website and fetch its HTML, CSS, JavaScript, and any media embedded in it.");

        if (!/^https?:\/\//i.test(text)) {
            return reply("Please provide a URL starting with http:// or https://");
        }

        const response = await fetch(text);
        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract media files
        const mediaFiles = [];
        $('img[src], video[src], audio[src], source[src]').each((i, element) => {
            let src = $(element).attr('src');
            if (src) {
                const absoluteUrl = new URL(src, text).href;
                mediaFiles.push(absoluteUrl);
            }
        });

        // Extract CSS files
        const cssFiles = [];
        $('link[rel="stylesheet"]').each((i, element) => {
            let href = $(element).attr('href');
            if (href) {
                const absoluteUrl = new URL(href, text).href;
                cssFiles.push(absoluteUrl);
            }
        });

        // Extract JS files
        const jsFiles = [];
        $('script[src]').each((i, element) => {
            let src = $(element).attr('src');
            if (src) {
                const absoluteUrl = new URL(src, text).href;
                jsFiles.push(absoluteUrl);
            }
        });

        // Extract page title and meta description
        const title = $('title').text() || 'No title found';
        const description = $('meta[name="description"]').attr('content') || 'No description found';

        // Send initial report
        let report = `🔍 *Website Inspection Report* 🔍\n\n`;
        report += `📝 *Title:* ${title}\n`;
        report += `📋 *Description:* ${description}\n\n`;
        report += `📊 *Statistics:*\n`;
        report += `• Media files: ${mediaFiles.length}\n`;
        report += `• CSS files: ${cssFiles.length}\n`;
        report += `• JS files: ${jsFiles.length}\n\n`;
        
        await reply(report);

        // Send HTML content (truncated)
        const truncatedHtml = html.length > 2000 ? html.substring(0, 2000) + '...' : html;
        await reply(`📄 *HTML Content (truncated):*\n\n${truncatedHtml}`);

        // Process CSS files
        if (cssFiles.length > 0) {
            await reply(`🎨 *CSS Files Found (${cssFiles.length}):*`);
            for (const cssFile of cssFiles.slice(0, 3)) { // Limit to 3 files
                try {
                    const cssResponse = await fetch(cssFile);
                    if (cssResponse.ok) {
                        const cssContent = await cssResponse.text();
                        const truncatedCss = cssContent.length > 1500 ? cssContent.substring(0, 1500) + '...' : cssContent;
                        await reply(`📁 ${cssFile}\n\n${truncatedCss}`);
                    }
                } catch (cssError) {
                    await reply(`❌ Failed to fetch CSS: ${cssFile}`);
                }
            }
        } else {
            await reply("No external CSS files found.");
        }

        // Process JS files
        if (jsFiles.length > 0) {
            await reply(`⚡ *JS Files Found (${jsFiles.length}):*`);
            for (const jsFile of jsFiles.slice(0, 3)) { // Limit to 3 files
                try {
                    const jsResponse = await fetch(jsFile);
                    if (jsResponse.ok) {
                        const jsContent = await jsResponse.text();
                        const truncatedJs = jsContent.length > 1500 ? jsContent.substring(0, 1500) + '...' : jsContent;
                        await reply(`📁 ${jsFile}\n\n${truncatedJs}`);
                    }
                } catch (jsError) {
                    await reply(`❌ Failed to fetch JS: ${jsFile}`);
                }
            }
        } else {
            await reply("No external JavaScript files found.");
        }

        // Send media files list
        if (mediaFiles.length > 0) {
            const mediaList = mediaFiles.slice(0, 10).join('\n'); // Limit to 10 files
            await reply(`*Media Files Found (first 10):*\n\n${mediaList}`);
        } else {
            await reply("No media files (images, videos, audios) found.");
        }

    } catch (error) {
        console.error('Web inspection error:', error);
        return reply("An error occurred while fetching the website content.");
    }
});
//========================================================================================================================

keith({
    pattern: "fetch",
    desc: "Fetch and display content from a URL",
    category: "Utility",
    aliases: ["get", "curl"],
    react: "🌐",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, reply } = context;

        if (!text) return reply("Provide a valid URL to fetch!");

        const response = await fetch(text);
        const contentType = response.headers.get('content-type');

        if (!contentType) {
            return reply("The server did not return a content-type.");
        }

        console.log("Content-Type:", contentType);

        if (contentType.includes('application/json')) {
            const data = await response.json();
            return reply(JSON.stringify(data, null, 2));
        }

        if (contentType.includes('text/html')) {
            const html = await response.text();
            return reply(html.substring(0, 4000)); // Limit to avoid message length issues
        }

        if (contentType.includes('image')) {
            const imageBuffer = await response.buffer();
            return client.sendMessage(
                m.chat,
                { image: imageBuffer, caption: text },
                { quoted: m }
            );
        }

        if (contentType.includes('video')) {
            const videoBuffer = await response.buffer();
            return client.sendMessage(
                m.chat,
                { video: videoBuffer, caption: text },
                { quoted: m }
            );
        }

        if (contentType.includes('audio')) {
            const audioBuffer = await response.buffer();
            const filename = text.split('/').pop(); 
            return client.sendMessage(
                m.chat,
                {
                    audio: audioBuffer,
                    mimetype: "audio/mpeg",
                    fileName: filename || "audio.mp3",
                },
                { quoted: m }
            );
        }

        if (contentType.includes('application/pdf')) {
            return client.sendMessage(
                m.chat,
                {
                    document: { url: text },
                    mimetype: "application/pdf",
                    fileName: text.split('/').pop() || "document.pdf",
                },
                { quoted: m }
            );
        }

        if (contentType.includes('application')) {
            return client.sendMessage(
                m.chat,
                {
                    document: { url: text },
                    mimetype: contentType,
                    fileName: text.split('/').pop() || "file.bin",
                },
                { quoted: m }
            );
        }

        // For text/plain and other text types
        if (contentType.includes('text/')) {
            const textContent = await response.text();
            return reply(textContent.substring(0, 4000)); // Limit text length
        }

        return reply("The content type is unsupported or could not be determined.");
    } catch (error) {
        console.error('Fetch error:', error);
        return reply("An error occurred while fetching the URL.");
    }
});
//========================================================================================================================

keith({
    pattern: "reverse",
    desc: "Reverse audio playback",
    category: "Utility",
    react: "⏪",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, getRandom, prefix, command } = context;
        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!quoted || !/audio/.test(mime)) {
            return await client.sendMessage(m.chat, { text: `Reply to an *audio file* with *${prefix}${command}* to reverse it.` }, { quoted: m });
        }

        const mediaPath = await client.downloadAndSaveMediaMessage(quoted);
        const outputPath = getRandom('.mp3');

        exec(`ffmpeg -i ${mediaPath} -filter_complex "areverse" ${outputPath}`, (error) => {
            fs.unlinkSync(mediaPath);
            if (error) {
                return client.sendMessage(m.chat, { text: error.toString() }, { quoted: m });
            }

            const audioBuffer = fs.readFileSync(outputPath);
            client.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg' }, { quoted: m });
            fs.unlinkSync(outputPath);
        });
    } catch (err) {
        client.sendMessage(m.chat, { text: err.toString() }, { quoted: m });
    }
});
//========================================================================================================================

keith({
    pattern: "img2vid",
    desc: "Create video from images with audio",
    category: "Utility",
    alias: ["imagetovideo", "imgtovid", "slideshow", "photovideo"],
    react: "🎬",
    filename: __filename
}, async (context) => {
    const { client, m, text, getRandom } = context;

    if (!text) {
        await client.sendMessage(m.chat, { text: "Provide the audio and image URLs in the format: audioURL | imageURL1, imageURL2, ..." }, { quoted: m });
        return;
    }

    const [audioUrl, imageUrls] = text.split(" | ");
    const imageUrlList = imageUrls.split(",").map((url) => url.trim());

    if (!audioUrl || !imageUrlList.length) {
        await client.sendMessage(m.chat, { text: "Please provide both audio and image URLs." }, { quoted: m });
        return;
    }

    const audioPath = getRandom("_audio.mp3");
    const outputPath = getRandom("_output.mp4");

    try {
        // Download the audio from the URL
        const response = await axios({
            method: "get",
            url: audioUrl,
            responseType: "arraybuffer",
        });
        fs.writeFileSync(audioPath, response.data);

        // Download all images from the URLs
        const imagePaths = [];
        for (const [index, imageUrl] of imageUrlList.entries()) {
            const imageResponse = await axios({
                method: "get",
                url: imageUrl,
                responseType: "arraybuffer",
            });
            const imagePath = getRandom(`_image${index}.jpg`);
            fs.writeFileSync(imagePath, imageResponse.data);
            imagePaths.push(imagePath);
        }

        // Get the duration of the audio
        exec(`ffprobe -i ${audioPath} -show_entries format=duration -v quiet -of csv="p=0"`, (err, stdout, stderr) => {
            if (err) {
                console.error("FFprobe error:", stderr);
                client.sendMessage(m.chat, { text: "Error getting audio duration!" }, { quoted: m });
                return;
            }

            const audioDuration = parseFloat(stdout.trim());
            const frameRate = imagePaths.length / audioDuration;

            // Create input file list for FFmpeg
            const inputList = imagePaths.map((path, index) => `-loop 1 -t ${audioDuration / imagePaths.length} -i ${path}`).join(' ');
            
            // Create the video from the images
            const ffmpegCommand = `ffmpeg ${inputList} -i ${audioPath} -filter_complex "concat=n=${imagePaths.length}:v=1:a=0" -c:v libx264 -r 30 -pix_fmt yuv420p -c:a aac -shortest ${outputPath}`;
            
            exec(ffmpegCommand, (err, stdout, stderr) => {
                console.log("FFmpeg output:", stdout);
                console.error("FFmpeg error:", stderr);
                
                // Cleanup temporary files
                fs.unlinkSync(audioPath);
                imagePaths.forEach((path) => fs.unlinkSync(path));
                
                if (err) {
                    client.sendMessage(m.chat, { text: "Error creating video!" }, { quoted: m });
                    return;
                }
                
                const videoBuffer = fs.readFileSync(outputPath);
                client.sendMessage(m.chat, { video: videoBuffer, mimetype: "video/mp4" }, { quoted: m });
                fs.unlinkSync(outputPath);
            });
        });
    } catch (error) {
        console.error("Error processing media:", error);
        client.sendMessage(m.chat, { text: "An error occurred while processing the media." }, { quoted: m });
    }
});
//========================================================================================================================


keith({
    pattern: "robot",
    desc: "Apply robot voice effect to audio",
    category: "Utility",
    react: "🤖",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, getRandom, prefix, command } = context;
        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!quoted || !/audio/.test(mime)) {
            return await client.sendMessage(m.chat, { text: `Reply to an *audio file* with *${prefix}${command}* to modify it.` }, { quoted: m });
        }

        const mediaPath = await client.downloadAndSaveMediaMessage(quoted);
        const outputPath = getRandom('.mp3');

        exec(`ffmpeg -i ${mediaPath} -filter_complex "afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)':win_size=512:overlap=0.75" ${outputPath}`, (error) => {
            fs.unlinkSync(mediaPath);
            if (error) {
                return client.sendMessage(m.chat, { text: error.toString() }, { quoted: m });
            }

            const audioBuffer = fs.readFileSync(outputPath);
            client.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg' }, { quoted: m });
            fs.unlinkSync(outputPath);
        });
    } catch (err) {
        client.sendMessage(m.chat, { text: err.toString() }, { quoted: m });
    }
});
//========================================================================================================================


keith({
    pattern: "earrape",
    desc: "Apply extreme volume boost to audio",
    category: "Utility",
    react: "🔊",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, getRandom, prefix, command } = context;
        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!quoted || !/audio/.test(mime)) {
            return await client.sendMessage(m.chat, { text: `Reply to an *audio file* with *${prefix}${command}* to modify it.` }, { quoted: m });
        }

        const mediaPath = await client.downloadAndSaveMediaMessage(quoted);
        const outputPath = getRandom('.mp3');

        exec(`ffmpeg -i ${mediaPath} -af volume=12 ${outputPath}`, (error) => {
            fs.unlinkSync(mediaPath);
            if (error) {
                return client.sendMessage(m.chat, { text: error.toString() }, { quoted: m });
            }

            const audioBuffer = fs.readFileSync(outputPath);
            client.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg' }, { quoted: m });
            fs.unlinkSync(outputPath);
        });
    } catch (err) {
        client.sendMessage(m.chat, { text: err.toString() }, { quoted: m });
    }
});
//========================================================================================================================


keith({
    pattern: "deep",
    desc: "Apply deep voice effect to audio",
    category: "Utility",
    react: "🎙️",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, getRandom, prefix, command } = context;
        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!quoted || !/audio/.test(mime)) {
            return await client.sendMessage(m.chat, { text: `Reply to an *audio file* with *${prefix}${command}* to modify it.` }, { quoted: m });
        }

        const mediaPath = await client.downloadAndSaveMediaMessage(quoted);
        const outputPath = getRandom('.mp3');

        exec(`ffmpeg -i ${mediaPath} -af atempo=4/4,asetrate=44500*2/3 ${outputPath}`, (error) => {
            fs.unlinkSync(mediaPath);
            if (error) {
                return client.sendMessage(m.chat, { text: error.toString() }, { quoted: m });
            }

            const audioBuffer = fs.readFileSync(outputPath);
            client.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg' }, { quoted: m });
            fs.unlinkSync(outputPath);
        });
    } catch (err) {
        client.sendMessage(m.chat, { text: err.toString() }, { quoted: m });
    }
});
//========================================================================================================================

keith({
    pattern: "blown",
    desc: "Apply blown audio effect using acrusher filter",
    category: "Utility",
    react: "💥",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, getRandom, prefix, command } = context;
        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!quoted || !/audio/.test(mime)) {
            return await client.sendMessage(m.chat, { text: `Reply to an *audio file* with *${prefix}${command}* to modify it.` }, { quoted: m });
        }

        const mediaPath = await client.downloadAndSaveMediaMessage(quoted);
        const outputPath = getRandom('.mp3');

        exec(`ffmpeg -i ${mediaPath} -af acrusher=.1:1:64:0:log ${outputPath}`, (error) => {
            fs.unlinkSync(mediaPath);
            if (error) {
                return client.sendMessage(m.chat, { text: error.toString() }, { quoted: m });
            }

            const audioBuffer = fs.readFileSync(outputPath);
            client.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg' }, { quoted: m });
            fs.unlinkSync(outputPath);
        });
    } catch (err) {
        client.sendMessage(m.chat, { text: err.toString() }, { quoted: m });
    }
});
//========================================================================================================================

keith({
    pattern: "bass",
    desc: "Increase bass in audio files",
    category: "Utility",
    react: "🔊",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, getRandom, prefix, command } = context;
        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!quoted || !/audio/.test(mime)) {
            return await client.sendMessage(m.chat, { text: `Reply to an *audio file* with *${prefix}${command}* to modify it.` }, { quoted: m });
        }

        const mediaPath = await client.downloadAndSaveMediaMessage(quoted);
        const outputPath = getRandom('.mp3');

        exec(`ffmpeg -i ${mediaPath} -af equalizer=f=54:width_type=o:width=2:g=20 ${outputPath}`, (error) => {
            fs.unlinkSync(mediaPath);
            if (error) {
                return client.sendMessage(m.chat, { text: error.toString() }, { quoted: m });
            }

            const audioBuffer = fs.readFileSync(outputPath);
            client.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg' }, { quoted: m });
            fs.unlinkSync(outputPath);
        });
    } catch (err) {
        client.sendMessage(m.chat, { text: err.toString() }, { quoted: m });
    }
});

//========================================================================================================================

keith({
    pattern: "trim",
    desc: "Trim video or audio by specifying start and end time",
    category: "Utility",
    alias: ["cut"],
    react: "✂️",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, getRandom } = context;
        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!quoted) {
            await client.sendMessage(m.chat, { text: `Reply to a *video file* or an *audio file* with the start and end time to trim it.` }, { quoted: m });
            return;
        }

        const [startTime, endTime] = text.split(" ").map(time => time.trim());
        if (!startTime || !endTime) {
            await client.sendMessage(m.chat, { text: `*Example: 1:20 1:50*` }, { quoted: m });
            return;
        }

        if (/video/.test(mime)) {
            const media = await client.downloadAndSaveMediaMessage(quoted);
            const outputPath = getRandom(".mp4");

            exec(`ffmpeg -i ${media} -ss ${startTime} -to ${endTime} -c copy ${outputPath}`, (err) => {
                fs.unlinkSync(media);
                if (err) {
                    client.sendMessage(m.chat, { text: "*Error!*" }, { quoted: m });
                    return;
                }

                const videoBuffer = fs.readFileSync(outputPath);
                client.sendMessage(m.chat, { video: videoBuffer, mimetype: "video/mp4" }, { quoted: m });
                fs.unlinkSync(outputPath);
            });
        } else if (/audio/.test(mime)) {
            const media = await client.downloadAndSaveMediaMessage(quoted);
            const outputPath = getRandom(".mp3");

            exec(`ffmpeg -i ${media} -ss ${startTime} -to ${endTime} -c copy ${outputPath}`, (err) => {
                fs.unlinkSync(media);
                if (err) {
                    client.sendMessage(m.chat, { text: "*Error!*" }, { quoted: m });
                    return;
                }

                const audioBuffer = fs.readFileSync(outputPath);
                client.sendMessage(m.chat, { audio: audioBuffer, mimetype: "audio/mpeg" }, { quoted: m });
                fs.unlinkSync(outputPath);
            });
        } else {
            await client.sendMessage(m.chat, { text: `Reply to a *video* or *audio* file.` }, { quoted: m });
        }
    } catch (error) {
        console.error('Error processing media:', error);
        client.sendMessage(m.chat, { text: 'An error occurred while processing the media.' }, { quoted: m });
    }
});
//========================================================================================================================

keith({
    pattern: "volvideo",
    desc: "increase video audio volume",
    category: "Utility",
    react: "🔊",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, getRandom, prefix, command, args } = context;
        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!args.join(" ")) {
            await client.sendMessage(m.chat, { text: `*Example: ${prefix}${command} 10*` }, { quoted: m });
            return;
        }

        if (!quoted || !/video/.test(mime)) {
            await client.sendMessage(m.chat, { text: `Reply to a *video file* with *${prefix}${command}* to adjust volume.` }, { quoted: m });
            return;
        }

        const media = await client.downloadAndSaveMediaMessage(quoted);
        const rname = getRandom(".mp4");

        exec(`ffmpeg -i ${media} -filter:a volume=${args[0]} -c:v copy ${rname}`, (err, stderr, stdout) => {
            fs.unlinkSync(media);
            if (err) {
                client.sendMessage(m.chat, { text: "*Error!*" }, { quoted: m });
                return;
            }

            const modifiedVideo = fs.readFileSync(rname);
            client.sendMessage(
                m.chat,
                { video: modifiedVideo, mimetype: "video/mp4" },
                { quoted: m }
            );
            fs.unlinkSync(rname);
        });
    } catch (error) {
        console.error('Error processing video:', error);
        client.sendMessage(m.chat, { text: 'An error occurred while processing the video.' }, { quoted: m });
    }
});
//========================================================================================================================

keith({
    pattern: "volaudio",
    desc: "increase audio volume",
    category: "Utility",
    alias: ["volumeaudio"],
    react: "🗿",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, getRandom, prefix, command, args } = context;
        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!args.length) {
            await client.sendMessage(m.chat, { text: `*Example: ${prefix}${command} 10*` }, { quoted: m });
            return;
        }

        if (!quoted || !/audio/.test(mime)) {
            await client.sendMessage(m.chat, { text: `Reply to an *audio file* with *${prefix}${command}* to adjust volume.` }, { quoted: m });
            return;
        }

        const mediaPath = await client.downloadAndSaveMediaMessage(quoted);
        const outputPath = getRandom('.mp3');

        exec(`ffmpeg -i ${mediaPath} -filter:a volume=${args[0]} ${outputPath}`, (error) => {
            fs.unlinkSync(mediaPath);
            if (error) {
                client.sendMessage(m.chat, { text: "*Error!*" }, { quoted: m });
                return;
            }

            const modifiedAudio = fs.readFileSync(outputPath);
            client.sendMessage(m.chat, { audio: modifiedAudio, mimetype: "audio/mp4", ptt: true }, { quoted: m });
            fs.unlinkSync(outputPath);
        });
    } catch (err) {
        client.sendMessage(m.chat, { text: err.toString() }, { quoted: m });
    }
});
//========================================================================================================================

keith({
    pattern: "amplify",
    desc: "Amplify video",
    category: "Utility",
    react: "🗿",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, getRandom } = context;
        const quoted = m.quoted ? m.quoted : null;
        const mime = quoted?.mimetype || "";

        if (!quoted || !/video/.test(mime)) {
            await client.sendMessage(m.chat, { text: `Reply to a *video file* with the audio URL to replace the video's audio.` }, { quoted: m });
            return;
        }

        if (!text) {
            await client.sendMessage(m.chat, { text: `Provide an audio URL.` }, { quoted: m });
            return;
        }

        const audioUrl = text.trim();
        const media = await client.downloadAndSaveMediaMessage(quoted);
        const audioPath = getRandom(".mp3");
        const outputPath = getRandom(".mp4");

        // Download the audio from the URL
        const response = await axios({
            method: 'get',
            url: audioUrl,
            responseType: 'arraybuffer'
        });

        fs.writeFileSync(audioPath, response.data);

        // Merge the downloaded audio with the quoted video and replace the original audio
        exec(`ffmpeg -i ${media} -i ${audioPath} -c:v copy -map 0:v:0 -map 1:a:0 -shortest ${outputPath}`, (err) => {
            fs.unlinkSync(media);
            fs.unlinkSync(audioPath);
            
            if (err) {
                client.sendMessage(m.chat, { text: "*Error!*" }, { quoted: m });
                return;
            }

            const videoBuffer = fs.readFileSync(outputPath);
            client.sendMessage(m.chat, { video: videoBuffer, mimetype: "video/mp4" }, { quoted: m });
            fs.unlinkSync(outputPath);
        });
    } catch (error) {
        console.error('Error processing media:', error);
        client.sendMessage(m.chat, { text: 'An error occurred while processing the media.' }, { quoted: m });
    }
});
//========================================================================================================================
keith({
    pattern: "translate",
    alias: ["trt", "tr"],
    desc: "Translate a quoted message to your target language",
    category: "Utility",
    react: "🌐",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, reply } = context;

        if (!m.quoted || !m.quoted.text) {
            return reply("❌ Please quote a message to translate.");
        }

        const langCode = text.trim();

        if (!langCode) {
            return reply("❌ Provide a target language code.\n*Example:* `translate en`\nUse `langcode` to view available language codes.");
        }

        const quotedText = m.quoted.text;

        const translation = await translatte(quotedText, { to: langCode });

        reply(`🔤 *Translated Text:* \n${translation.text}`);
    } catch (error) {
        console.error("Translate command error:", error);
        context.reply("❌ An error occurred while translating the message. Please try again later.");
    }
});


keith({
  pattern: "topdf",
  alias: ["quoted2pdf", "pdfify"],
  desc: "Convert quoted message to PDF (.pdf)",
  category: "Utility",
  react: "📄",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    const text = msgKeith?.conversation?.trim();
    if (!text) return reply("❌ Please quote a text message to convert to PDF.");

    try {
      const tmpDir = path.join(__dirname, "..", "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const fileName = `quoted-${Date.now()}.pdf`;
      const filePath = path.join(tmpDir, fileName);

      const doc = new PDFDocument();
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);
      doc.fontSize(12).text(text, {
        align: "left",
        lineGap: 4
      });
      doc.end();

      writeStream.on('finish', async () => {
        await client.sendMessage(m.chat, {
          document: { url: filePath },
          mimetype: 'application/pdf',
          fileName
        }, { quoted: m });

        fs.unlinkSync(filePath);
      });

    } catch (err) {
      console.error("PDF conversion error:", err);
      reply("❌ PDF creation failed. Try again.");
    }
  });
});



keith({
  pattern: "toviewonce",
  alias: ["tovo", "tovv"],
  desc: "Send quoted media (image/video/audio) as view-once message",
  category: "Utility",
  react: "👁️‍🗨️",
  filename: __filename
}, async (context) => {
  try {
    const { client, m, reply } = context;
    const quotedMessage = m.msg?.contextInfo?.quotedMessage;

    if (!quotedMessage) return reply("❌ Reply to an image, video, or audio message to make it view-once.");

    if (quotedMessage.imageMessage) {
      const imageCaption = quotedMessage.imageMessage.caption || "";
      const imagePath = await client.downloadAndSaveMediaMessage(quotedMessage.imageMessage);
      await client.sendMessage(m.chat, {
        image: { url: imagePath },
        caption: imageCaption,
        viewOnce: true,
        fileLength: 999
      }, { quoted: m });
      fs.unlinkSync(imagePath);
    }

    if (quotedMessage.videoMessage) {
      const videoCaption = quotedMessage.videoMessage.caption || "";
      const videoPath = await client.downloadAndSaveMediaMessage(quotedMessage.videoMessage);
      await client.sendMessage(m.chat, {
        video: { url: videoPath },
        caption: videoCaption,
        viewOnce: true,
        fileLength: 99999999
      }, { quoted: m });
      fs.unlinkSync(videoPath);
    }

    if (quotedMessage.audioMessage) {
      const audioPath = await client.downloadAndSaveMediaMessage(quotedMessage.audioMessage);
      await client.sendMessage(m.chat, {
        audio: { url: audioPath },
        mimetype: 'audio/mpeg',
        ptt: true,
        viewOnce: true
      }, { quoted: m });
      fs.unlinkSync(audioPath);
    }

  } catch (err) {
    console.error("Error in tovv command:", err);
    return reply("❌ Couldn't send the media as view-once. Try again.");
  }
});



keith({
  pattern: "tojson2",
  alias: ["quoted2json", "jsonify"],
  desc: "Convert quoted message to a formatted JSON (.json) file",
  category: "Utility",
  react: "🧾",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a JSON object or array.");
      }

      let quoted = msgKeith.conversation.trim();
      let parsed, wrapped = false;

      try {
        parsed = JSON.parse(quoted);
      } catch (e) {
        // Attempt to wrap as an object
        try {
          parsed = JSON.parse(`{${quoted}}`);
          wrapped = true;
        } catch (err) {
          return reply("❌ That doesn't look like valid JSON. Try quoting a well-formed object or key-value lines.");
        }
      }

      const filePath = `./quoted-${Date.now()}.json`;
      fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2));

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/json',
        fileName: 'quoted-message.json',
        caption: wrapped ? "✅ Auto-wrapped in `{}` for valid JSON structure." : undefined
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error generating JSON file:", err);
      reply("❌ Failed to write JSON file. Try again.");
    }
  });
});

keith({
  pattern: "totoml",
  alias: ["quoted2toml", "tomlify"],
  desc: "Convert quoted message to TOML (.toml) file",
  category: "Utility",
  react: "📘",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a message formatted as TOML.");
      }

      const tomlText = msgKeith.conversation.trim();
      const filePath = `./quoted-${Date.now()}.toml`;

      fs.writeFileSync(filePath, tomlText);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/toml',
        fileName: 'quoted-message.toml'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error generating TOML file:", err);
      reply("❌ Failed to create TOML. Please ensure the syntax is valid.");
    }
  });
});

keith({
  pattern: "toyaml",
  alias: ["quoted2yaml", "yamlfy"],
  desc: "Convert quoted message to YAML (.yaml) file",
  category: "Utility",
  react: "📙",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a YAML-formatted message.");
      }

      const yamlText = msgKeith.conversation.trim();
      const filePath = `./quoted-${Date.now()}.yaml`;

      fs.writeFileSync(filePath, yamlText);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/x-yaml',
        fileName: 'quoted-message.yaml'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error generating YAML file:", err);
      reply("❌ Failed to generate YAML file. Please ensure the syntax is valid.");
    }
  });
});

keith({
  pattern: "toenv",
  alias: ["quoted2env", "envify"],
  desc: "Convert quoted message to .env config file",
  category: "Utility",
  react: "🔐",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a valid .env-style message.");
      }

      const envText = msgKeith.conversation.trim();
      const filePath = `./env-${Date.now()}.env`;

      fs.writeFileSync(filePath, envText);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/x-env',
        fileName: 'quoted-config.env'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error generating .env file:", err);
      reply("❌ Failed to generate .env file. Please ensure the quoted content is properly formatted.");
    }
  });
});


keith({
  pattern: "tocsv",
  alias: ["quoted2csv", "csvify"],
  desc: "Convert quoted message to CSV (.csv) file",
  category: "Utility",
  react: "📄",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a message to convert to CSV.");
      }

      const quotedText = msgKeith.conversation.trim();
      const filePath = `./quoted-${Date.now()}.csv`;

      // Basic CSV — single column, one row
      fs.writeFileSync(filePath, `"message"\n"${quotedText.replace(/"/g, '""')}"`);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'text/csv',
        fileName: 'quoted-message.csv'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error generating CSV file:", err);
      reply("❌ Failed to generate CSV file. Please try again.");
    }
  });
});

keith({
  pattern: "toxml",
  alias: ["quoted2xml", "xmlify"],
  desc: "Convert quoted message to XML (.xml) file",
  category: "Utility",
  react: "🧩",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a message containing XML content.");
      }

      const xmlText = msgKeith.conversation.trim();
      const filePath = `./quoted-${Date.now()}.xml`;

      fs.writeFileSync(filePath, xmlText);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/xml',
        fileName: 'quoted-message.xml'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error generating XML file:", err);
      reply("❌ Failed to create XML. Please ensure the quoted message is well-formed.");
    }
  });
});

keith({
  pattern: "tojson",
  alias: ["quoted2json", "jsonify"],
  desc: "Convert quoted message to a JSON (.json) file",
  category: "Utility",
  react: "🧾",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a message with valid JSON text.");
      }

      const jsonText = msgKeith.conversation.trim();
      const parsed = JSON.parse(jsonText); // Validate

      const filePath = `./quoted-${Date.now()}.json`;
      fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2));

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/json',
        fileName: 'quoted-message.json'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error generating JSON file:", err);
      reply("❌ Failed to convert message to valid JSON. Please ensure it's well-formed.");
    }
  });
});


keith({
  pattern: "tojpeg",
  alias: ["tojpg", "tojpng", "jpegify"],
  desc: "Convert quoted image to JPEG (.jpeg/.jpg/.jpng)",
  category: "Utility",
  react: "🖼️",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, reply } = context;
    const quotedMessage = m.msg?.contextInfo?.quotedMessage;

    if (!quotedMessage || !quotedMessage.imageMessage) {
      return reply("❌ Reply to an image to convert it to JPEG.");
    }

    try {
      const fileName = `image-${Date.now()}.jpeg`;
      const filePath = path.resolve(`./${fileName}`);
      const caption = quotedMessage.imageMessage.caption || "";

      const imagePath = await client.downloadAndSaveMediaMessage(quotedMessage.imageMessage);

      await client.sendMessage(m.chat, {
        document: { url: imagePath },
        mimetype: 'image/jpeg',
        fileName,
        caption
      }, { quoted: m });

      fs.unlinkSync(imagePath);
    } catch (err) {
      console.error("Error converting image to JPEG:", err);
      reply("❌ Failed to convert image to JPEG. Please try again.");
    }
  });
});

keith({
  pattern: "tophp",
  alias: ["quoted2php", "phpsave"],
  desc: "Convert quoted message to PHP (.php) file",
  category: "Utility",
  react: "🐘",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a message containing PHP code.");
      }

      const phpCode = msgKeith.conversation.trim();
      const filePath = `./script-${Date.now()}.php`;

      fs.writeFileSync(filePath, phpCode);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/x-httpd-php',
        fileName: 'quoted-script.php'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error creating PHP file:", err);
      reply("❌ Failed to generate PHP file. Please try again.");
    }
  });
});

keith({
  pattern: "topy",
  alias: ["quoted2py", "pythonsave"],
  desc: "Convert quoted message to Python (.py) file",
  category: "Utility",
  react: "🐍",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a message containing Python code.");
      }

      const code = msgKeith.conversation.trim();
      const filePath = `./script-${Date.now()}.py`;

      fs.writeFileSync(filePath, code);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'text/x-python',
        fileName: 'quoted-script.py'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error creating Python file:", err);
      reply("❌ Failed to generate .py file. Please try again.");
    }
  });
});

keith({
  pattern: "tocss",
  alias: ["quoted2css", "styleify"],
  desc: "Convert quoted message to a CSS (.css) file",
  category: "Utility",
  react: "🎨",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a message containing CSS to convert.");
      }

      const cssContent = msgKeith.conversation.trim();
      const filePath = `./style-${Date.now()}.css`;

      fs.writeFileSync(filePath, cssContent);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'text/css',
        fileName: 'quoted-style.css'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error creating CSS file:", err);
      reply("❌ Failed to generate CSS file. Please try again.");
    }
  });
});

keith({
  pattern: "tobin",
  alias: ["quoted2bin", "rawbinary"],
  desc: "Convert quoted text to a binary .bin file",
  category: "Utility",
  react: "🧱",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a text message to convert to binary.");
      }

      const quotedText = msgKeith.conversation.trim();
      const filePath = `./quoted-${Date.now()}.bin`;

      fs.writeFileSync(filePath, Buffer.from(quotedText, 'utf-8'));

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/octet-stream',
        fileName: 'quoted-message.bin'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error creating binary file:", err);
      reply("❌ Failed to generate binary file.");
    }
  });
});

keith({
  pattern: "tosh",
  alias: ["scriptsh", "quoted2sh"],
  desc: "Convert quoted message to a shell script (.sh)",
  category: "Utility",
  react: "💻",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a shell script or command message.");
      }

      const scriptText = msgKeith.conversation.trim();
      const filePath = `./script-${Date.now()}.sh`;

      fs.writeFileSync(filePath, scriptText);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'text/x-sh',
        fileName: 'quoted-script.sh'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error creating .sh file:", err);
      reply("❌ Failed to generate shell script file. Please try again.");
    }
  });
});

keith({
  pattern: "toxlsx",
  alias: ["quoted2xlsx", "excel"],
  desc: "Convert quoted message to Excel (.xlsx) file",
  category: "Utility",
  react: "📊",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a text message to convert to Excel.");
      }

      const quotedText = msgKeith.conversation.trim();
      const filePath = `./quoted-${Date.now()}.xlsx`;

      // Build workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet([[quotedText]]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      XLSX.writeFile(workbook, filePath);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileName: 'quoted-message.xlsx'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error generating Excel file:", err);
      reply("❌ Failed to convert to Excel. Please try again.");
    }
  });
});


keith({
  pattern: "tomd",
  alias: ["markdownify", "readmd"],
  desc: "Convert quoted message to a Markdown (.md) file",
  category: "Utility",
  react: "📘",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a text message to convert to Markdown.");
      }

      const quotedText = msgKeith.conversation.trim();
      const filePath = `./quoted-${Date.now()}.md`;

      fs.writeFileSync(filePath, quotedText);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'text/markdown',
        fileName: 'quoted-message.md'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error generating Markdown file:", err);
      reply("❌ Failed to convert to Markdown. Please try again.");
    }
  });
});



keith({
  pattern: "tohtml",
  alias: ["htmlify", "quoted2html"],
  desc: "Convert quoted message to an HTML file",
  category: "Utility",
  react: "🌐",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a text message to convert to HTML.");
      }

      const quotedText = msgKeith.conversation.trim();

      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quoted Message</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      line-height: 1.6;
    }
    pre {
      background: #f4f4f4;
      padding: 20px;
      border-left: 5px solid #444;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <h2>Quoted Message</h2>
  <pre>${quotedText}</pre>
</body>
</html>
      `.trim();

      const filePath = `./quoted-${Date.now()}.html`;
      fs.writeFileSync(filePath, htmlContent);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'text/html',
        fileName: 'quoted-message.html'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error generating HTML file:", err);
      reply("❌ Failed to generate HTML. Please try again.");
    }
  });
});

keith({
  pattern: "todocx",
  alias: ["quoted2docx", "makedocx"],
  desc: "Convert quoted text message to a DOCX document",
  category: "Utility",
  react: "📝",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a text message to convert to DOCX.");
      }

      const quotedText = msgKeith.conversation.trim();
      const doc = new Document({
        sections: [{
          children: [new Paragraph({ children: [new TextRun(quotedText)] })]
        }]
      });

      const buffer = await Packer.toBuffer(doc);
      const filePath = `./quoted-${Date.now()}.docx`;
      fs.writeFileSync(filePath, buffer);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        fileName: 'quoted-text.docx'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error converting to DOCX:", err);
      reply("❌ Failed to generate DOCX file. Try again.");
    }
  });
});

keith({
  pattern: "tojs",
  alias: ["code2js", "scriptify"],
  desc: "Convert quoted JavaScript code to a .js file",
  category: "Utility",
  react: "📜",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a message containing JavaScript code.");
      }

      const jsCode = msgKeith.conversation.trim();
      const filePath = `./script-${Date.now()}.js`;

      fs.writeFileSync(filePath, jsCode);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/javascript',
        fileName: 'quoted-script.js'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error creating JS file:", err);
      reply("❌ Failed to convert message to .js file.");
    }
  });
});

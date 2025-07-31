//========================================================================================================================
const { keith } = require('../keizzah/keith');
const axios = require('axios');
const FormData = require('form-data');
const https = require('https');
//========================================================================================================================
keith({
  nomCom: "text2img",
  aliases: ["generateimage", "aiimage"],
  reaction: '🎨',
  categorie: "AI"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;
  
  // Available resolutions
  const reso = {
    portrait: { width: 768, height: 1344 },
    landscape: { width: 1344, height: 768 },
    square: { width: 1024, height: 1024 },
    ultra: { width: 1536, height: 1536 },
    tall: { width: 832, height: 1344 },
    wide: { width: 1344, height: 832 },
  };

  if (!arg || arg.length === 0) {
    return repondre("Please provide a prompt and optional resolution.\nExample: *text2img cute cat* , *text2img cute cat|square*, *text2img cute cat|landscape*, *text2img cute cat|tall* or *text2img cute cat|ultra* ");
  }

  // Parse arguments
  const queryParts = arg.join(" ").split("|");
  const prompt = queryParts[0].trim();
  const resolution = queryParts[1]?.trim().toLowerCase() || "portrait";
  const upscale = 2; // Default upscale value

  if (!reso[resolution]) {
    const validResolutions = Object.keys(reso).join(", ");
    return repondre(`Invalid resolution. Available options: ${validResolutions}`);
  }

  try {
    await repondre(`🔄 Generating image for: *"${prompt}"* (${resolution})...`);

    const selected = reso[resolution];
    const { width, height } = selected;

    const form = new FormData();
    form.append('Prompt', prompt);
    form.append('Language', 'eng_Latn');
    form.append('Size', `${width}x${height}`);
    form.append('Upscale', upscale.toString());
    form.append('Batch_Index', '0'); // Just generate one image

    const agent = new https.Agent({ rejectUnauthorized: false });

    const response = await axios.post(
      'https://api.zonerai.com/zoner-ai/txt2img',
      form,
      {
        httpsAgent: agent,
        headers: {
          ...form.getHeaders(),
          'Origin': 'https://zonerai.com',
          'Referer': 'https://zonerai.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36'
        },
        responseType: 'arraybuffer'
      }
    );

    const buffer = Buffer.from(response.data);
    const caption = `🎨 AI Generated Image\n\n*Prompt:* ${prompt}\n*Resolution:* ${resolution} (${width}x${height})`;

    await zk.sendMessage(dest, {
      image: buffer,
      caption: caption,
      mimetype: 'image/jpeg'
    }, { quoted: ms });

  } catch (err) {
    console.error('Error generating image:', err);
    await repondre(`❌ Failed to generate image. Error: ${err.message}`);
  }
});
//========================================================================================================================




keith({
  nomCom: "text2music",
  aliases: ["txt2song", "aimusic", "musicgen"],
  reaction: '🎵',
  categorie: "AI"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;

  if (!arg || arg.length === 0) {
    return repondre(
      "🎵 *AI Music Generation*\n\n" +
      "Please provide a text description for music generation.\n\n" +
      "*Example:* .text2music happy electronic dance music about celebration\n" +
      "*Example:* .text2music sad piano melody about lost love\n\n" +
      "*Note:* For best results, include:\n" +
      "- Music genre\n" +
      "- Mood/emotion\n" +
      "- Instruments\n" +
      "- Theme"
    );
  }

  const prompt = arg.join(" ");
  const apiUrl = `https://apis-keith.vercel.app/ai/txt2music?q=${encodeURIComponent(prompt)}`;

  try {
    const processingMsg = await repondre(
      `⏳ *Generating Music...*\n\n` +
      `📝 *Prompt:* ${prompt}\n\n` +
      `Please wait while we create your music...`
    );

    const response = await axios.get(apiUrl);
    
    if (!response.data?.status || !response.data?.result) {
      throw new Error('Failed to generate music: Invalid API response');
    }

    const musicUrl = response.data.result;
    const creator = response.data.creator || 'Keithkeizzah';

    const caption = 
      `🎵 *AI Music Generated* ✅\n\n` +
      `📝 *Prompt:* ${prompt}\n` +
      `👨‍💻 *Creator:* ${creator}\n\n` +
      `🎧 Enjoy your music!`;

    // Send the audio file
    await zk.sendMessage(dest, {
      document: { url: musicUrl },
      mimetype: 'audio/mpeg',
      ptt: false,
      caption: caption
    }, { quoted: ms });

  } catch (error) {
    console.error('Music generation error:', error);
    await repondre(
      `❌ *Music Generation Failed*\n\n` +
      `*Error:* ${error.message}\n\n` +
      `Please try again with a different description.`
    );
  }
});
//========================================================================================================================


keith({
  nomCom: "text2video2",
  aliases: ["txt2vid2", "videogen2", "aivideo2"],
  reaction: '🎬',
  categorie: "AI"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;

  if (!arg || arg.length === 0) {
    return repondre(
      "🎬 *AI Video Generation* 🎥\n\n" +
      "Please provide a text prompt for video generation.\n\n" +
      "*Example:* .text2video2 a man running with a shirt written keith\n" +
      "*Advanced:* .text2video2 futuristic city|16:9|5|540p\n\n" +
      "*Options:*\n" +
      "- ratio: 16:9, 9:16, 1:1\n" +
      "- duration: 3-10 seconds\n" +
      "- quality: 360p, 540p, 720p"
    );
  }

  // Parse arguments (format: "prompt|ratio|duration|quality")
  const args = arg.join(" ").split("|").map(a => a.trim());
  const prompt = args[0];
  const ratio = args[1] || "16:9";
  const duration = args[2] || "5";
  const quality = args[3] || "540p";

  const apiUrl = `https://apis-keith.vercel.app/ai/txt2video2?q=${encodeURIComponent(prompt)}`;

  try {
    const processingMsg = await repondre(
      `⏳ *Generating Video...*\n\n` +
      `📝 *Prompt:* ${prompt}\n` +
      `📐 *Ratio:* ${ratio}\n` +
      `⏱ *Duration:* ${duration}s\n` +
      `🖼 *Quality:* ${quality}`
    );

    const response = await axios.get(apiUrl);
    
    if (!response.data?.status || !response.data?.result?.success) {
      throw new Error(response.data?.result?.message || 'Failed to generate video');
    }

    const videoData = response.data.result.data.data;
    const metadata = response.data.result.metadata;

    if (!videoData.video_url) {
      throw new Error('Video URL not found in response');
    }

    const caption = 
      `🎬 *AI Video Generated* ✅\n\n` +
      `📝 *Prompt:* ${metadata.prompt}\n` +
      `📐 *Ratio:* ${metadata.ratio}\n` +
      `⏱ *Duration:* ${metadata.duration}s\n` +
      `🖼 *Quality:* ${metadata.quality}\n\n` +
      `🆔 *Task ID:* ${videoData.task_id}\n` +
      `👨‍💻 *Creator:* ${response.data.creator || 'Keithkeizzah'}`;

    // Send image preview first
    await zk.sendMessage(dest, {
      image: { url: videoData.image_url },
      caption: caption + "\n\n⬇️ *Video is loading...*",
      mimetype: 'image/jpeg'
    }, { quoted: ms });

    // Send the watermarked video
    await zk.sendMessage(dest, {
      video: { url: videoData.video_url },
      caption: caption,
      mimetype: 'video/mp4'
    }, { quoted: ms });

    // Optional: Send original video if available
    if (videoData.origin_url) {
      await zk.sendMessage(dest, {
        text: `✨ *Original Quality Video:*\n${videoData.origin_url}`
      }, { quoted: ms });
    }

  } catch (error) {
    console.error('Video generation error:', error);
    await repondre(
      `❌ *Video Generation Failed*\n\n` +
      `*Error:* ${error.message}\n\n` +
      `Please try again with a different prompt or check the parameters.`
    );
  }
});

//========================================================================================================================


keith({
  nomCom: "text2video",
  aliases: ["txt2vid", "videogen"],
  reaction: '🎥',
  categorie: "AI"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;

  if (!arg || arg.length === 0) {
    return repondre(
      "Please provide a text prompt for video generation.\n\n" +
      "*Example:* .text2video a man running with a shirt written keith"
    );
  }

  const prompt = arg.join(" ");
  const apiUrl = `https://apis-keith.vercel.app/ai/txt2video?q=${encodeURIComponent(prompt)}`;

  try {
    await repondre(`🔄 Generating video for: *"${prompt}"*...`);

    const response = await axios.get(apiUrl);
    
    if (!response.data?.status || !response.data?.result?.data?.video_url) {
      throw new Error('Failed to generate video: Invalid API response');
    }

    const { image_url, video_url } = response.data.result.data;
    const caption = `🎥 AI Generated Video\n\n*Prompt:* ${prompt}\n*Creator:* ${response.data.creator || 'Keithkeizzah'}`;

    // Send image preview
    
    // Send video
    await zk.sendMessage(dest, {
      video: { url: video_url },
      caption: caption,
      mimetype: 'video/mp4'
    }, { quoted: ms });

  } catch (error) {
    console.error('Video generation error:', error);
    await repondre(`❌ Failed to generate video. ${error.message}\n\nPlease try again later.`);
  }
});
//========================================================================================================================




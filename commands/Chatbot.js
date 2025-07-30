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

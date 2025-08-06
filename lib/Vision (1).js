const axios = require('axios');

const fs = require('fs');

const path = require('path');
const config = require('../../config.json');
const { Catbox } = require("node-catbox");

// Initialize Catbox client

const catbox = new Catbox();

async function uploadToCatbox(filePath) {

  if (!fs.existsSync(filePath)) {

    throw new Error("File does not exist");

  }

  try {

    const fileExtension = path.extname(filePath).toLowerCase();

    const uploadResult = await catbox.uploadFile({ path: filePath });

    return uploadResult.includes(fileExtension) ? uploadResult : `${uploadResult}${fileExtension}`;

  } catch (error) {

    throw new Error(String(error));

  }

}

module.exports = {

    config: {

        name: "vision",

        author: "keithkeizzah",

        description: "Analyze images using Gemini Vision AI",

        category: "AI",

        usage: "[question] (reply to image)",

        usePrefix: true

    },

    onStart: async function ({ bot, chatId, msg, args }) {

        if (!msg.reply_to_message || !msg.reply_to_message.photo) {

            return bot.sendMessage(chatId, "Please reply to an image message to analyze it.");

        }

        try {

            // Get the highest quality photo version

            const photo = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1];

            const fileDetails = await bot.getFile(photo.file_id);

            const fileLink = `https://api.telegram.org/file/bot${process.env.TOKEN || config.token}/${fileDetails.file_path}`;

            

            // Download the image

            const response = await axios({

                method: 'get',

                url: fileLink,

                responseType: 'stream'

            });

            

            // Save temporarily

            const tempFilePath = `./temp_${photo.file_id}.jpg`;

            const writer = fs.createWriteStream(tempFilePath);

            response.data.pipe(writer);

            

            await new Promise((resolve, reject) => {

                writer.on('finish', resolve);

                writer.on('error', reject);

            });

            

            // Upload to Catbox

            const catboxUrl = await uploadToCatbox(tempFilePath);

            

            // Clean up

            fs.unlinkSync(tempFilePath);

            

            // Prepare question (use provided args or default)

            const question = args.length > 0 ? args.join(' ') : "What's in this image?";

            

            // Call Gemini Vision API

            const visionUrl = `https://apis-keith.vercel.app/ai/gemini-vision?image=${encodeURIComponent(catboxUrl)}&q=${encodeURIComponent(question)}`;

            const visionResponse = await axios.get(visionUrl);

            

            if (visionResponse.data.status !== true) {

                throw new Error("API returned unsuccessful status");

            }

            

            // Format the response nicely

            const analysis = `🔍 Image Analysis Result:\n\n${visionResponse.data.result}\n\n` +

                             `📝 Question: "${visionResponse.data.metadata.instruction}"\n` +

                             `🖼️ Image: ${visionResponse.data.metadata.imageUrl}`;

            

            await bot.sendMessage(chatId, analysis);

            

        } catch (error) {

            console.error('Error in vision command:', error);

            bot.sendMessage(chatId, `Error analyzing image: ${error.message}`);

        }

    }

};
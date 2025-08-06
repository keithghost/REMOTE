const fs = require('fs');

const axios = require('axios');

const path = require('path');

const { Catbox } = require("node-catbox");

const config = require('./set.js');

// Initialize Catbox client

const catbox = new Catbox();

// Function to upload a file to Catbox and return the URL with proper extension

async function uploadToCatbox(filePath) {

  if (!fs.existsSync(filePath)) {

    throw new Error("File does not exist");

  }

  

  try {

    // Get file extension from the path

    const fileExtension = path.extname(filePath).toLowerCase();

    const uploadResult = await catbox.uploadFile({ path: filePath });

    

    if (uploadResult) {

      // Append the file extension if it's not already in the URL

      if (!uploadResult.includes(fileExtension)) {

        return `${uploadResult}${fileExtension}`;

      }

      return uploadResult;

    } else {

      throw new Error("Error retrieving file link");

    }

  } catch (error) {

    throw new Error(String(error));

  }

}

module.exports = {

    config: {

        name: "url",

        author: "keithkeizzah",

        description: "Send a link to the replied file",

        category: "download",

        usage: "sendfilelink",

        usePrefix: true

    },

    onStart: async function ({ bot, chatId, msg }) {

        if (!msg.reply_to_message || !(msg.reply_to_message.audio || msg.reply_to_message.video || msg.reply_to_message.photo || msg.reply_to_message.document)) {

            return bot.sendMessage(chatId, "Please reply to an audio, video, photo, or document message to send its file link.");

        }

        try {

            // Determine file type and get file ID

            let fileId, fileType;

            if (msg.reply_to_message.audio) {

                fileId = msg.reply_to_message.audio.file_id;

                fileType = 'audio';

            } else if (msg.reply_to_message.video) {

                fileId = msg.reply_to_message.video.file_id;

                fileType = 'video';

            } else if (msg.reply_to_message.photo) {

                fileId = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1].file_id;

                fileType = 'photo';

            } else if (msg.reply_to_message.document) {

                fileId = msg.reply_to_message.document.file_id;

                fileType = 'document';

            }

            const fileDetails = await bot.getFile(fileId);

            const fileLink = `https://api.telegram.org/file/bot${config.token}/${fileDetails.file_path}`;

            

            // Determine the appropriate file extension

            let fileExtension = path.extname(fileDetails.file_path);

            if (!fileExtension) {

                // Set default extensions based on file type

                switch (fileType) {

                    case 'audio':

                        fileExtension = '.mp3';

                        break;

                    case 'video':

                        fileExtension = '.mp4';

                        break;

                    case 'photo':

                        fileExtension = '.jpg';

                        break;

                    case 'document':

                        fileExtension = path.extname(msg.reply_to_message.document.file_name) || '.bin';

                        break;

                    default:

                        fileExtension = '.bin';

                }

            }

            // Download the file first

            const response = await axios({

                method: 'get',

                url: fileLink,

                responseType: 'stream'

            });

            

            // Save the file temporarily with proper extension

            const tempFilePath = `./temp_${fileDetails.file_id}${fileExtension}`;

            const writer = fs.createWriteStream(tempFilePath);

            response.data.pipe(writer);

            

            await new Promise((resolve, reject) => {

                writer.on('finish', resolve);

                writer.on('error', reject);

            });

            

            // Upload to Catbox

            const catboxUrl = await uploadToCatbox(tempFilePath);

            

            // Clean up the temporary file

            fs.unlinkSync(tempFilePath);

            

            bot.sendMessage(chatId, `File Link: ${catboxUrl}`);

        } catch (error) {

            console.error('[ERROR]', error);

            bot.sendMessage(chatId, "An error occurred while processing the command.");

        }

    }

};

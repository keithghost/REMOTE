const { keith } = require('../keizzah/keith');
const axios = require('axios');
const fs = require('fs-extra');  
const conf = require(__dirname + "/../set");
const getFBInfo = require("@xaviabot/fb-downloader");

keith({
  nomCom: "facebook",
  aliases: ["fbdl", "facebookdl", "fb"],
  categorie: "Download",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  // Validate input
  if (!arg || !arg[0]) {
    return repondre('Please provide a Facebook video URL!');
  }

  const fbUrl = arg[0].trim();
  if (!fbUrl.includes('https://') || !fbUrl.includes('facebook.com')) {
    return repondre("Please provide a valid Facebook video URL.");
  }

  try {
    // Get Facebook video info
    const videoData = await getFBInfo(fbUrl);
    
    if (!videoData || !videoData.sd) {
      return repondre("Could not retrieve video information. The link may be invalid or private.");
    }

    // Prepare caption with video options
    const caption = `
     *𝐀𝐋𝐏𝐇𝐀 𝐌𝐃 𝐅𝐁 𝐃𝐋*
    |__________________________|
    |       *ᴛɪᴛʟᴇ*  
           ${videoData.title || 'No title available'}
    |_________________________|
    | REPLY WITH BELOW NUMBERS
    |_________________________|
    |____  *ᴠɪᴅᴇᴏ ᴅᴏᴡɴʟᴏᴀᴅ*  ____
    |-᳆  1. SD Quality
    |-᳆  2. HD Quality
    |_________________________|
    |____  *ᴀᴜᴅɪᴏ ᴅᴏᴡɴʟᴏᴀᴅ*  ____
    |-᳆  3. Audio Only
    |-᳆  4. As Document
    |-᳆  5. As Voice Message
    |__________________________|
    `;

    // Send the initial message with thumbnail and options
    const message = await zk.sendMessage(dest, {
      image: { url: videoData.thumbnail || '' },
      caption: caption,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          title: `${conf.BOT || 'ALPHA MD'} FB Downloader`,
          body: videoData.title || 'Facebook Video',
          thumbnailUrl: videoData.thumbnail || '',
          sourceUrl: conf.GURL || '',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: ms });

    const messageId = message.key.id;

    // Set up reply handler
    const replyHandler = async (update) => {
      try {
        const messageContent = update.messages[0];
        if (!messageContent.message) return;

        // Check if this is a reply to our initial message
        const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
        if (!isReply) return;

        const responseText = messageContent.message.conversation || 
                           messageContent.message.extendedTextMessage?.text;

        // Validate response
        if (!['1', '2', '3', '4', '5'].includes(responseText)) {
          return await zk.sendMessage(dest, {
            text: "Invalid option. Please reply with a number between 1-5.",
            quoted: messageContent
          });
        }

        // Send loading reaction
        await zk.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        // Handle different download options
        switch(responseText) {
          case '1': // SD Quality
            await zk.sendMessage(dest, {
              video: { url: videoData.sd },
              caption: "*𝐀𝐋𝐏𝐇𝐀 𝐌𝐃* - SD Quality",
            }, { quoted: messageContent });
            break;
            
          case '2': // HD Quality
            if (videoData.hd) {
              await zk.sendMessage(dest, {
                video: { url: videoData.hd },
                caption: "*𝐀𝐋𝐏𝐇𝐀 𝐌𝐃* - HD Quality",
              }, { quoted: messageContent });
            } else {
              await zk.sendMessage(dest, {
                text: "HD quality not available. Sending SD quality instead.",
                quoted: messageContent
              });
              await zk.sendMessage(dest, {
                video: { url: videoData.sd },
                caption: "*𝐀𝐋𝐏𝐇𝐀 𝐌𝐃* - SD Quality",
              }, { quoted: messageContent });
            }
            break;
            
          case '3': // Audio Only
            await zk.sendMessage(dest, {
              audio: { url: videoData.sd },
              mimetype: "audio/mpeg",
              caption: "*𝐀𝐋𝐏𝐇𝐀 𝐌𝐃* - Audio"
            }, { quoted: messageContent });
            break;
            
          case '4': // As Document
            await zk.sendMessage(dest, {
              document: { url: videoData.sd },
              mimetype: "video/mp4",
              fileName: `AlphaMD_${Date.now()}.mp4`,
              caption: "*𝐀𝐋𝐏𝐇𝐀 𝐌𝐃* - Video Document"
            }, { quoted: messageContent });
            break;
            
          case '5': // As Voice Message
            await zk.sendMessage(dest, {
              audio: { url: videoData.sd },
              mimetype: "audio/ogg; codecs=opus",
              ptt: true,
              caption: "*𝐀𝐋𝐏𝐇𝐀 𝐌𝐃* - Voice Message"
            }, { quoted: messageContent });
            break;
        }

        // Send completion reaction
        await zk.sendMessage(dest, {
          react: { text: '✅', key: messageContent.key },
        });

      } catch (error) {
        console.error("Error handling reply:", error);
        await zk.sendMessage(dest, {
          text: "An error occurred while processing your request. Please try again.",
          quoted: messageContent
        });
      }
    };

    // Add event listener for replies
    zk.ev.on("messages.upsert", replyHandler);

    // Remove listener after 5 minutes to prevent memory leaks
    setTimeout(() => {
      zk.ev.off("messages.upsert", replyHandler);
    }, 300000);

  } catch (error) {
    console.error("Facebook download error:", error);
    repondre(`Failed to download video. Error: ${error.message}\nYou can try with another link or check if the video is public.`);
  }
});

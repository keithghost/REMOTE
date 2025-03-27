const { keith } = require('../keizzah/keith');
const axios = require('axios');
const fs = require('fs-extra');  
const { igdl } = require('ruhend-scraper');
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

    // Prepare common contextInfo
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'Facebook Downloader'}`,
        body: videoData.title || 'Facebook Video',
        thumbnailUrl: videoData.thumbnail || '',
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    // Prepare caption with video options
    const caption = `
     *${conf.BOT || 'Facebook Downloader'} Facebook Downloader*
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
    |____  *ᴀᴜᴅɪᴏ �ᴅᴏᴡɴʟᴏᴀᴅ*  ____
    |-᳆  3. Audio Only
    |-᳆  4. As Document
    |-᳆  5. As Voice Message
    |__________________________|
    `;

    // Send the initial message with thumbnail and options
    const message = await zk.sendMessage(dest, {
      image: { url: videoData.thumbnail || '' },
      caption: caption,
      contextInfo: commonContextInfo
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

        // Handle different download options with consistent contextInfo
        switch(responseText) {
          case '1': // SD Quality
            await zk.sendMessage(dest, {
              video: { url: videoData.sd },
              caption: `*${conf.BOT || 'Facebook Downloader'}* - SD Quality`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '2': // HD Quality
            if (videoData.hd) {
              await zk.sendMessage(dest, {
                video: { url: videoData.hd },
                caption: `*${conf.BOT || 'Facebook Downloader'}* - HD Quality`,
                contextInfo: commonContextInfo
              }, { quoted: messageContent });
            } else {
              await zk.sendMessage(dest, {
                text: "HD quality not available. Sending SD quality instead.",
                quoted: messageContent
              });
              await zk.sendMessage(dest, {
                video: { url: videoData.sd },
                caption: `*${conf.BOT || 'Facebook Downloader'}* - SD Quality`,
                contextInfo: commonContextInfo
              }, { quoted: messageContent });
            }
            break;
            
          case '3': // Audio Only
            await zk.sendMessage(dest, {
              audio: { url: videoData.sd },
              mimetype: "audio/mpeg",
              caption: `*${conf.BOT || 'Facebook Downloader'}* - Audio`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '4': // As Document
            await zk.sendMessage(dest, {
              document: { url: videoData.sd },
              mimetype: "video/mp4",
              fileName: `${conf.BOT || 'Facebook'}_${Date.now()}.mp4`,
              caption: `*${conf.BOT || 'Facebook Downloader'}* - Video Document`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '5': // As Voice Message
            await zk.sendMessage(dest, {
              audio: { url: videoData.sd },
              mimetype: "audio/ogg; codecs=opus",
              ptt: true,
              caption: `*${conf.BOT || 'Facebook Downloader'}* - Voice Message`,
              contextInfo: commonContextInfo
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

keith({
  nomCom: "twitter",
  aliases: ["twitdl", "twitterdl", "tw", "xdl"],
  categorie: "Download",
  reaction: "🐦"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  // Validate input
  if (!arg || !arg[0]) {
    return repondre('Please provide a Twitter video URL!');
  }

  const tweetUrl = arg[0].trim();
  if (!tweetUrl.includes('https://') || !tweetUrl.includes('twitter.com')) {
    return repondre("Please provide a valid Twitter URL.");
  }

  try {
    // API endpoint
    const apiUrl = `https://apis-keith.vercel.app/download/twitter?url=${encodeURIComponent(tweetUrl)}`;
    
    // Fetch Twitter video data
    const response = await axios.get(apiUrl);
    const tweetData = response.data;

    if (!tweetData.status || !tweetData.result) {
      return repondre("Could not retrieve video information. The tweet may be private or not contain media.");
    }

    const videoInfo = tweetData.result;

    // Prepare common contextInfo
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'Twitter Downloader'}`,
        body: videoInfo.desc || 'Twitter Video',
        thumbnailUrl: videoInfo.thumb || '',
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    // Prepare caption with video options
    const caption = `
     *${conf.BOT || 'Twitter Downloader'} twitter Downloader*
    |__________________________|
    |       *ᴅᴇsᴄʀɪᴘᴛɪᴏɴ*  
    ${videoInfo.desc || 'No description available'}
    |_________________________|
    | REPLY WITH BELOW NUMBERS
    |_________________________|
    |____  *ᴠɪᴅᴇᴏ ᴅᴏᴡɴʟᴏᴀᴅ*  ____
    |-᳆  1. SD Quality (480p)
    |-᳆  2. HD Quality (720p)
    |_________________________|
    |____  *ᴀᴜᴅɪᴏ ᴅᴏᴡɴʟᴏᴀᴅ*  ____
    |-᳆  3. Audio Only
    |-᳆  4. As Document
    |__________________________|
    `;

    // Send the initial message with thumbnail and options
    const message = await zk.sendMessage(dest, {
      image: { url: videoInfo.thumb || '' },
      caption: caption,
      contextInfo: commonContextInfo
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
        if (!['1', '2', '3', '4'].includes(responseText)) {
          return await zk.sendMessage(dest, {
            text: "Invalid option. Please reply with a number between 1-4.",
            quoted: messageContent
          });
        }

        // Send loading reaction
        await zk.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        // Handle different download options with consistent contextInfo
        switch(responseText) {
          case '1': // SD Quality
            await zk.sendMessage(dest, {
              video: { url: videoInfo.video_sd },
              caption: `*${conf.BOT || 'Twitter Downloader'}* - SD Quality`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '2': // HD Quality
            if (videoInfo.video_hd) {
              await zk.sendMessage(dest, {
                video: { url: videoInfo.video_hd },
                caption: `*${conf.BOT || 'Twitter Downloader'}* - HD Quality`,
                contextInfo: commonContextInfo
              }, { quoted: messageContent });
            } else {
              await zk.sendMessage(dest, {
                text: "HD quality not available. Sending SD quality instead.",
                quoted: messageContent
              });
              await zk.sendMessage(dest, {
                video: { url: videoInfo.video_sd },
                caption: `*${conf.BOT || 'Twitter Downloader'}* - SD Quality`,
                contextInfo: commonContextInfo
              }, { quoted: messageContent });
            }
            break;
            
          case '3': // Audio Only
            await zk.sendMessage(dest, {
              audio: { url: videoInfo.audio },
              mimetype: "audio/mpeg",
              caption: `*${conf.BOT || 'Twitter Downloader'}* - Audio`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '4': // As Document
            await zk.sendMessage(dest, {
              document: { url: videoInfo.video_sd },
              mimetype: "video/mp4",
              fileName: `${conf.BOT || 'Twitter'}_${Date.now()}.mp4`,
              caption: `*${conf.BOT || 'Twitter Downloader'}* - Video Document`,
              contextInfo: commonContextInfo
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
    console.error("Twitter download error:", error);
    repondre(`Failed to download tweet. Error: ${error.message}\nYou can try with another link or check if the tweet is public.`);
  }
});


keith({
  nomCom: "instagram",
  aliases: ["igdl", "instagramdl", "ig"],
  categorie: "Download",
  reaction: "📸"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  // Validate input
  if (!arg || !arg[0]) {
    return repondre('Please provide an Instagram URL!');
  }

  const igUrl = arg[0].trim();
  if (!igUrl.includes('https://') || !igUrl.includes('instagram.com')) {
    return repondre("Please provide a valid Instagram URL.");
  }

  try {
    // Fetch Instagram media data
    const response = await igdl(igUrl);
    const mediaItems = response.data;

    if (!mediaItems || mediaItems.length === 0) {
      return repondre("No media found. The post may be private or unavailable.");
    }

    // Prepare common contextInfo
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'Instagram Downloader'}`,
        body: "Instagram Media Download",
        thumbnailUrl: mediaItems[0].url, // Use first media as thumbnail
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    };

    // Prepare caption with options
    const caption = `
     *${conf.BOT || 'Instagram Downloader'}Instagram Downloader*
    |__________________________|
    | Found ${mediaItems.length} media item(s)
    |_________________________|
    | REPLY WITH BELOW NUMBERS
    |_________________________|
    |-᳆  1. Download All Media
    |-᳆  2. Download First Video
    |-᳆  3. Download First Image
    |-᳆  4. Audio Only (if available)
    |__________________________|
    `;

    // Send the initial message with options
    const message = await zk.sendMessage(dest, {
      image: { url: mediaItems[0].url }, // Show first media as preview
      caption: caption,
      contextInfo: commonContextInfo
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
        if (!['1', '2', '3', '4'].includes(responseText)) {
          return await zk.sendMessage(dest, {
            text: "Invalid option. Please reply with a number between 1-4.",
            quoted: messageContent
          });
        }

        // Send loading reaction
        await zk.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        // Handle different download options
        switch(responseText) {
          case '1': // Download All Media
            for (let media of mediaItems) {
              const isVideo = media.url.includes('.mp4') || media.url.includes('.mov');
              await zk.sendMessage(dest, {
                [isVideo ? 'video' : 'image']: { url: media.url },
                caption: `*${conf.BOT || 'Instagram Downloader'}* - ${isVideo ? 'Video' : 'Image'}`,
                contextInfo: commonContextInfo
              }, { quoted: messageContent });
              await new Promise(resolve => setTimeout(resolve, 2000)); // Delay between sends
            }
            break;
            
          case '2': // Download First Video
            const firstVideo = mediaItems.find(item => item.url.includes('.mp4') || item.url.includes('.mov'));
            if (firstVideo) {
              await zk.sendMessage(dest, {
                video: { url: firstVideo.url },
                caption: `*${conf.BOT || 'Instagram Downloader'}* - Video`,
                contextInfo: commonContextInfo
              }, { quoted: messageContent });
            } else {
              await zk.sendMessage(dest, {
                text: "No video found in this post.",
                quoted: messageContent
              });
            }
            break;
            
          case '3': // Download First Image
            const firstImage = mediaItems.find(item => !item.url.includes('.mp4') && !item.url.includes('.mov'));
            if (firstImage) {
              await zk.sendMessage(dest, {
                image: { url: firstImage.url },
                caption: `*${conf.BOT || 'Instagram Downloader'}* - Image`,
                contextInfo: commonContextInfo
              }, { quoted: messageContent });
            } else {
              await zk.sendMessage(dest, {
                text: "No image found in this post.",
                quoted: messageContent
              });
            }
            break;
            
          case '4': // Audio Only
            const firstVideoForAudio = mediaItems.find(item => item.url.includes('.mp4') || item.url.includes('.mov'));
            if (firstVideoForAudio) {
              await zk.sendMessage(dest, {
                audio: { url: firstVideoForAudio.url },
                mimetype: "audio/mpeg",
                caption: `*${conf.BOT || 'Instagram Downloader'}* - Audio`,
                contextInfo: commonContextInfo
              }, { quoted: messageContent });
            } else {
              await zk.sendMessage(dest, {
                text: "No video available to extract audio from.",
                quoted: messageContent
              });
            }
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
    console.error("Instagram download error:", error);
    repondre(`Failed to download Instagram media. Error: ${error.message}\nYou can try with another link or check if the post is public.`);
  }
});

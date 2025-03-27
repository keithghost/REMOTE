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
    // API endpoint
    const apiUrl = `https://apis-keith.vercel.app/download/instagramdl?url=${encodeURIComponent(igUrl)}`;
    
    // Fetch Instagram media data
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result || !data.result.downloadUrl) {
      return repondre("Could not retrieve video. The post may be private or unavailable.");
    }

    const downloadUrl = data.result.downloadUrl;
    const isVideo = data.result.type === 'mp4';

    // Prepare common contextInfo
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'Instagram Downloader'}`,
        body: "Instagram Media Download",
        thumbnailUrl: conf.URL || '', // Use config URL for image
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    // Prepare caption with options
    const caption = `
     *${conf.BOT || 'Instagram Downloader'} Instagram Downloader*
    |__________________________|
    | Media Type: ${isVideo ? 'Video' : 'Unknown'}
    |_________________________|
    | REPLY WITH BELOW NUMBERS
    |_________________________|
    |-᳆  1. Video
    |-᳆  2. Video as Document
    |-᳆  3. Audio Only
    |-᳆  4. Audio as Document
    |__________________________|
    `;

    // Send the initial message with options
    const message = await zk.sendMessage(dest, {
      image: { url: conf.URL || '' }, // Use config URL for image
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
          case '1': // Video
            await zk.sendMessage(dest, {
              video: { url: downloadUrl },
              caption: `*${conf.BOT || 'Instagram Downloader'}* - Video`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '2': // Video as Document
            await zk.sendMessage(dest, {
              document: { url: downloadUrl },
              mimetype: "video/mp4",
              fileName: `${conf.BOT || 'Instagram'}_${Date.now()}.mp4`,
              caption: `*${conf.BOT || 'Instagram Downloader'}* - Video Document`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '3': // Audio Only
            await zk.sendMessage(dest, {
              audio: { url: downloadUrl },
              mimetype: "audio/mpeg",
              caption: `*${conf.BOT || 'Instagram Downloader'}* - Audio`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '4': // Audio as Document
            await zk.sendMessage(dest, {
              document: { url: downloadUrl },
              mimetype: "audio/mpeg",
              fileName: `${conf.BOT || 'Instagram'}_${Date.now()}.mp3`,
              caption: `*${conf.BOT || 'Instagram Downloader'}* - Audio Document`,
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
    console.error("Instagram download error:", error);
    repondre(`Failed to download Instagram media. Error: ${error.message}\nYou can try with another link or check if the post is public.`);
  }
}); 


keith({
  nomCom: "tiktok",
  aliases: ["ttdl", "tiktokdl", "tt"],
  categorie: "Download",
  reaction: "🎵"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  // Validate input
  if (!arg || !arg[0]) {
    return repondre('Please provide a TikTok URL!');
  }

  const tiktokUrl = arg[0].trim();
  if (!tiktokUrl.includes('https://') || !(tiktokUrl.includes('tiktok.com') || tiktokUrl.includes('vt.tiktok.com'))) {
    return repondre("Please provide a valid TikTok URL.");
  }

  try {
    // API endpoint
    const apiUrl = `https://apis-keith.vercel.app/download/tiktokdl?url=${encodeURIComponent(tiktokUrl)}`;
    
    // Fetch TikTok video data
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result) {
      return repondre("Could not retrieve video. The TikTok may be private or unavailable.");
    }

    const videoInfo = data.result;

    // Prepare common contextInfo
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'TikTok Downloader'}`,
        body: videoInfo.caption || 'TikTok Video',
        thumbnailUrl: videoInfo.thumbnail || conf.URL || '',
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    // Prepare caption with options
    const caption = `
     *${conf.BOT || 'TikTok Downloader'} TikTok Downloader*
    |__________________________|
    | *Title*: ${videoInfo.title || 'No title'}
    | *Caption*: ${videoInfo.caption || 'No caption'}
    |_________________________|
    | REPLY WITH BELOW NUMBERS
    |_________________________|
    |-᳆  1. Video (No Watermark)
    |-᳆  2. Video as Document
    |-᳆  3. Audio Only
    |-᳆  4. Audio as Document
    |__________________________|
    `;

    // Send the initial message with options
    const message = await zk.sendMessage(dest, {
      image: { url: videoInfo.thumbnail || conf.URL || '' },
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
          case '1': // Video (No Watermark)
            await zk.sendMessage(dest, {
              video: { url: videoInfo.nowm },
              caption: `*${conf.BOT || 'TikTok Downloader'}* - Video (No Watermark)\n${videoInfo.caption || ''}`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '2': // Video as Document
            await zk.sendMessage(dest, {
              document: { url: videoInfo.nowm },
              mimetype: "video/mp4",
              fileName: `${conf.BOT || 'TikTok'}_${Date.now()}.mp4`,
              caption: `*${conf.BOT || 'TikTok Downloader'}* - Video Document\n${videoInfo.caption || ''}`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '3': // Audio Only
            await zk.sendMessage(dest, {
              audio: { url: videoInfo.mp3 },
              mimetype: "audio/mpeg",
              caption: `*${conf.BOT || 'TikTok Downloader'}* - Audio\n${videoInfo.caption || ''}`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '4': // Audio as Document
            await zk.sendMessage(dest, {
              document: { url: videoInfo.mp3 },
              mimetype: "audio/mpeg",
              fileName: `${conf.BOT || 'TikTok'}_${Date.now()}.mp3`,
              caption: `*${conf.BOT || 'TikTok Downloader'}* - Audio Document\n${videoInfo.caption || ''}`,
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
    console.error("TikTok download error:", error);
    repondre(`Failed to download TikTok. Error: ${error.message}\nYou can try with another link or check if the video is public.`);
  }
});

keith({
  nomCom: "mediafire",
  aliases: ["mfire", "mfdl", "mediafiredl"],
  categorie: "Download",
  reaction: "📦"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  // Validate input
  if (!arg || !arg[0]) {
    return repondre('Please provide a MediaFire URL!');
  }

  const mediafireUrl = arg[0].trim();
  if (!mediafireUrl.includes('https://') || !mediafireUrl.includes('mediafire.com')) {
    return repondre("Please provide a valid MediaFire URL.");
  }

  try {
    // API endpoint
    const apiUrl = `https://apis-keith.vercel.app/download/mfire?url=${encodeURIComponent(mediafireUrl)}`;
    
    // Fetch MediaFire file data
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result || !data.result.dl_link) {
      return repondre("Could not retrieve file. The link may be invalid or the file unavailable.");
    }

    const fileInfo = data.result;

    // Prepare contextInfo
    const contextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'MediaFire Downloader'}`,
        body: `Downloading: ${fileInfo.fileName}`,
        thumbnailUrl: conf.URL || '',
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    };

    // Prepare file info message
    const fileInfoMessage = `
     *${conf.BOT || 'MediaFire Downloader'} MediaFire Downloader*
    |__________________________|
    | *File Name*: ${fileInfo.fileName}
    | *File Type*: ${fileInfo.fileType}
    | *File Size*: ${fileInfo.size}
    | *Upload Date*: ${fileInfo.date}
    |__________________________|
    Downloading file...
    `;

    // Send file info first
    await zk.sendMessage(dest, {
      text: fileInfoMessage,
      contextInfo: contextInfo
    }, { quoted: ms });

    // Send the file directly without reply options
    await zk.sendMessage(dest, {
      document: {
        url: fileInfo.dl_link
      },
      mimetype: fileInfo.fileType,
      fileName: fileInfo.fileName,
      caption: `*${conf.BOT || 'MediaFire Downloader'}*\nHere's your requested file: ${fileInfo.fileName}`,
      contextInfo: contextInfo
    });

  } catch (error) {
    console.error("MediaFire download error:", error);
    repondre(`Failed to download file. Error: ${error.message}\nPlease check the link and try again.`);
  }
});


keith({
  nomCom: "hentaivid",
  aliases: ["hvid", "hentaidl", "hv"],
  categorie: "download",
  reaction: "🔞"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  try {
    // API endpoint
    const apiUrl = 'https://apis-keith.vercel.app/dl/hentaivid';
    
    // Fetch hentai videos data
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result || data.result.length === 0) {
      return repondre("Could not retrieve videos. Please try again later.");
    }

    const videos = data.result.slice(0, 8); // Ensure max 8 videos

    // Prepare common contextInfo
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'Hentai Downloader'}`,
        body: "Select a video (1-8)",
        thumbnailUrl: conf.URL || '',
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    };

    // Prepare selection menu
    let caption = `*${conf.BOT || 'Hentai Downloader'}*\n`;
    caption += `Available videos (1-8):\n`;
    caption += `|__________________________|\n`;

    videos.forEach((video, index) => {
      caption += `| ${index + 1}. ${video.title}\n`;
      caption += `| 👉 ${video.category}\n`;
      caption += `| 👁️ ${video.views_count} views | 🔗 ${video.share_count} shares\n`;
      caption += `|__________________________|\n`;
    });

    caption += `\nReply with a number (1-8) to download that video.`;

    // Send the selection menu
    const message = await zk.sendMessage(dest, {
      text: caption,
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
        const selectedNum = parseInt(responseText);
        if (isNaN(selectedNum) || selectedNum < 1 || selectedNum > videos.length) {
          return await zk.sendMessage(dest, {
            text: `Invalid selection. Please reply with a number between 1-${videos.length}.`,
            quoted: messageContent
          });
        }

        const selectedVideo = videos[selectedNum - 1];

        // Send loading reaction
        await zk.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        // Send the selected video
        await zk.sendMessage(dest, {
          video: { url: selectedVideo.media.video_url },
          caption: `*${selectedVideo.title}*\nCategory: ${selectedVideo.category}\nViews: ${selectedVideo.views_count} | Shares: ${selectedVideo.share_count}`,
          contextInfo: commonContextInfo
        }, { quoted: messageContent });

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
    console.error("Hentai video download error:", error);
    repondre(`Failed to fetch videos. Error: ${error.message}`);
  }
});

const { keith } = require('../keizzah/keith');
const axios = require('axios');
const conf = require(__dirname + "/../set");

keith({
  nomCom: "yout",
  aliases: ["yt", "ytdl", "youtubedl"],
  categorie: "Download",
  reaction: "🎬"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg, userJid } = commandeOptions;

  // Validate input
  if (!arg || arg.length < 1) {
    return repondre('Usage:\n.yt [URL or search query]\nExample:\n.yt Alan Walker Faded\n.yt https://youtu.be/2WmBa1CviYE');
  }

  const query = arg.join(' ').trim();

  // Common contextInfo configuration
  const getContextInfo = (title = '') => ({
    mentionedJid: [userJid],
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363266249040649@newsletter",
      newsletterName: "Keith Support 🔥",
      serverMessageId: Math.floor(100000 + Math.random() * 900000),
    },
    externalAdReply: {
      showAdAttribution: true,
      title: `${conf.BOT || 'YouTube Downloader'}`,
      body: title || "YouTube Downloader",
      thumbnailUrl: conf.URL || '',
      sourceUrl: conf.GURL || '',
      mediaType: 1,
      renderLargerThumbnail: true
    }
  });

  try {
    if (query.includes('youtube.com') || query.includes('youtu.be')) {
      // Direct URL - ask for media type
      const typeSelectionMsg = `
╭══════⊷
║ *${conf.BOT || 'YouTube Downloader'}*
║ Reply to select your media type
║  1. Video 
║  2. Audio
╰═══════⊷
      `;

      const message = await zk.sendMessage(dest, {
        text: typeSelectionMsg,
        contextInfo: getContextInfo("Select download type")
      }, { quoted: ms });

      const messageId = message.key.id;

      // Set up reply handler for type selection
      const typeHandler = async (update) => {
        try {
          const messageContent = update.messages[0];
          if (!messageContent.message) return;

          // Check if this is a reply to our type selection message
          const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
          if (!isReply) return;

          const responseText = messageContent.message.conversation || 
                             messageContent.message.extendedTextMessage?.text;

          // Validate response
          if (!['1', '2'].includes(responseText)) {
            return await zk.sendMessage(dest, {
              text: "Please reply with 1 for Video or 2 for Audio.",
              contextInfo: getContextInfo(),
              quoted: messageContent
            });
          }

          const type = responseText === '1' ? 'video' : 'audio';
          const apiEndpoint = type === 'video' ? 'dlmp4' : 'dlmp3';
          
          // Send loading reaction
          await zk.sendMessage(dest, {
            react: { text: '⬇️', key: messageContent.key },
          });

          // Download the media
          const apiUrl = `https://apis-keith.vercel.app/download/${apiEndpoint}?url=${encodeURIComponent(query)}`;
          const response = await axios.get(apiUrl);
          const data = response.data;

          if (!data.status || !data.result) {
            return await zk.sendMessage(dest, {
              text: `Could not download ${type}. The video may be unavailable.`,
              contextInfo: getContextInfo(),
              quoted: messageContent
            });
          }

          const mediaInfo = data.result;
          const fileType = type === 'video' ? 'video/mp4' : 'audio/mpeg';
          const fileName = `${mediaInfo.title}.${type === 'video' ? 'mp4' : 'mp3'}`.replace(/[^\w\s.-]/gi, '');

          await zk.sendMessage(dest, {
            [type === 'video' ? 'video' : 'audio']: { url: mediaInfo.downloadUrl },
            mimetype: fileType,
            fileName: fileName,
            caption: `*${conf.BOT || 'YouTube Downloader'}*\nTitle: ${mediaInfo.title}\nQuality: ${mediaInfo.quality || 'N/A'}`,
            contextInfo: getContextInfo(mediaInfo.title)
          }, { quoted: messageContent });

          // Remove listener after successful download
          zk.ev.off("messages.upsert", typeHandler);

        } catch (error) {
          console.error("Error handling YouTube download:", error);
          await zk.sendMessage(dest, {
            text: "An error occurred while processing your request. Please try again.",
            contextInfo: getContextInfo(),
            quoted: messageContent
          });
        }
      };

      // Add event listener for type selection
      zk.ev.on("messages.upsert", typeHandler);

      // Remove listener after 5 minutes to prevent memory leaks
      setTimeout(() => {
        zk.ev.off("messages.upsert", typeHandler);
      }, 300000);

    } else {
      // Search YouTube
      const searchUrl = `https://apis.davidcyriltech.my.id/youtube/search?query=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl);
      const searchData = response.data;

      if (!searchData.status || !searchData.results || searchData.results.length === 0) {
        return repondre("No search results found. Try a different query.");
      }

      const videos = searchData.results.slice(0, 10); // Get top 10 results

      // Prepare search results list
      let resultsList = `*${conf.BOT || 'YouTube Search Results'}*\n`;
      resultsList += `Query: "${query}"\n\n`;
      resultsList += videos.map((video, index) => 
        `${index+1}. ${video.title}\n   ⏱️ ${video.duration} | 👀 ${formatViews(video.views)} | 📅 ${video.published}`
      ).join('\n\n');
      resultsList += '\n\nReply with the number of the video you want to download';

      // Send search results
      const message = await zk.sendMessage(dest, {
        text: resultsList,
        contextInfo: getContextInfo(`Results for: ${query}`)
      }, { quoted: ms });

      const messageId = message.key.id;

      // Set up reply handler for video selection
      const videoHandler = async (update) => {
        try {
          const messageContent = update.messages[0];
          if (!messageContent.message) return;

          // Check if this is a reply to our search results
          const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
          if (!isReply) return;

          const responseText = messageContent.message.conversation || 
                             messageContent.message.extendedTextMessage?.text;

          // Validate response
          const selectedIndex = parseInt(responseText) - 1;
          if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= videos.length) {
            return await zk.sendMessage(dest, {
              text: `Please reply with a number between 1-${videos.length}.`,
              contextInfo: getContextInfo(),
              quoted: messageContent
            });
          }

          const selectedVideo = videos[selectedIndex];

          // Ask for media type
          const typeSelectionMsg = `
╭══════⊷
║ *${conf.BOT || 'YouTube Downloader'}*
║ Selected: ${selectedVideo.title}
║ Reply to select media type:
║  1. Video 
║  2. Audio
╰═══════⊷
          `;

          const typeMessage = await zk.sendMessage(dest, {
            text: typeSelectionMsg,
            contextInfo: getContextInfo(selectedVideo.title)
          }, { quoted: messageContent });

          const typeMessageId = typeMessage.key.id;

          // Set up reply handler for type selection
          const typeHandler = async (update) => {
            try {
              const typeContent = update.messages[0];
              if (!typeContent.message) return;

              // Check if this is a reply to our type selection message
              const isTypeReply = typeContent.message.extendedTextMessage?.contextInfo?.stanzaId === typeMessageId;
              if (!isTypeReply) return;

              const typeResponse = typeContent.message.conversation || 
                                 typeContent.message.extendedTextMessage?.text;

              // Validate response
              if (!['1', '2'].includes(typeResponse)) {
                return await zk.sendMessage(dest, {
                  text: "Please reply with 1 for Video or 2 for Audio.",
                  contextInfo: getContextInfo(),
                  quoted: typeContent
                });
              }

              const type = typeResponse === '1' ? 'video' : 'audio';
              const apiEndpoint = type === 'video' ? 'dlmp4' : 'dlmp3';
              
              // Send loading reaction
              await zk.sendMessage(dest, {
                react: { text: '⬇️', key: typeContent.key },
              });

              // Download the selected media
              const downloadUrl = `https://apis-keith.vercel.app/download/${apiEndpoint}?url=${encodeURIComponent(selectedVideo.url)}`;
              const downloadResponse = await axios.get(downloadUrl);
              const downloadData = downloadResponse.data;

              if (!downloadData.status || !downloadData.result) {
                return await zk.sendMessage(dest, {
                  text: `Failed to download ${type} for this video. Please try another one.`,
                  contextInfo: getContextInfo(),
                  quoted: typeContent
                });
              }

              const mediaInfo = downloadData.result;
              const fileType = type === 'video' ? 'video/mp4' : 'audio/mpeg';
              const fileName = `${mediaInfo.title}.${type === 'video' ? 'mp4' : 'mp3'}`.replace(/[^\w\s.-]/gi, '');

              await zk.sendMessage(dest, {
                [type === 'video' ? 'video' : 'audio']: { url: mediaInfo.downloadUrl },
                mimetype: fileType,
                fileName: fileName,
                caption: `*${conf.BOT || 'YouTube Downloader'}*\nTitle: ${mediaInfo.title}\nQuality: ${mediaInfo.quality || 'N/A'}`,
                contextInfo: getContextInfo(mediaInfo.title)
              }, { quoted: typeContent });

              // Remove both handlers after successful download
              zk.ev.off("messages.upsert", videoHandler);
              zk.ev.off("messages.upsert", typeHandler);

            } catch (error) {
              console.error("Error handling YouTube download:", error);
              await zk.sendMessage(dest, {
                text: "An error occurred while processing your request. Please try again.",
                contextInfo: getContextInfo(),
                quoted: typeContent
              });
            }
          };

          // Add event listener for type selection
          zk.ev.on("messages.upsert", typeHandler);

          // Remove both handlers after 5 minutes to prevent memory leaks
          setTimeout(() => {
            zk.ev.off("messages.upsert", videoHandler);
            zk.ev.off("messages.upsert", typeHandler);
          }, 300000);

        } catch (error) {
          console.error("Error handling YouTube selection:", error);
          await zk.sendMessage(dest, {
            text: "An error occurred while processing your request. Please try again.",
            contextInfo: getContextInfo(),
            quoted: messageContent
          });
        }
      };

      // Add event listener for video selection
      zk.ev.on("messages.upsert", videoHandler);

      // Remove listener after 5 minutes to prevent memory leaks
      setTimeout(() => {
        zk.ev.off("messages.upsert", videoHandler);
      }, 300000);
    }

  } catch (error) {
    console.error("YouTube error:", error);
    repondre(`Failed to process YouTube request. Error: ${error.message}`);
  }
});

// Helper function to format view counts
function formatViews(views) {
  if (typeof views === 'number') {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  }
  return views;
}

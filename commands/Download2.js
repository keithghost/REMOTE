const { keith } = require('../keizzah/keith');
const axios = require('axios');
const fs = require('fs-extra');
const { mediafireDl } = require("../keizzah/dl/Function");
const { igdl } = require("ruhend-scraper");
const getFBInfo = require("@xaviabot/fb-downloader");
const { downloadTiktok } = require('@mrnima/tiktok-downloader');
const { facebook } = require('@mrnima/facebook-downloader');  
const conf = require(__dirname + "/../set");
const { repondre, sendMessage } = require('../keizzah/context'); // Import repondre and sendMessage

keith({
  nomCom: "twitter",
  aliases: ["xdl", "tweet"],
  desc: "to download Twitter",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre(zk, dest, ms, 'Please insert a Twitter video link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/twitter?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9.HD) {
      const videoUrl = response.data.BK9.HD;
      const username = response.data.BK9.username;
      const caption = response.data.BK9.caption;
      const thumbnailUrl = response.data.BK9.thumbnail;

      await sendMessage(zk, dest, ms, {
        image: { url: thumbnailUrl },
        caption: `Username: ${username}\nCaption: ${caption}`,
      });

      await sendMessage(zk, dest, ms, {
        video: { url: videoUrl },
        caption: 'Twitter video downloader powered by *KEITH-TECH*',
        gifPlayback: false
      });

    } else {
      repondre(zk, dest, ms, 'Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(zk, dest, ms, `An error occurred during download: ${e.message}`);
  }
});

keith({
  nomCom: "likee",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre(zk, dest, ms, 'Please insert a Likee video link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/likee?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9) {
      const videoUrl = response.data.BK9.withoutwatermark;
      const title = response.data.BK9.title;
      const thumbnailUrl = response.data.BK9.thumbnail;

      await sendMessage(zk, dest, ms, {
        image: { url: thumbnailUrl },
        caption: `Title: ${title}`,
      });

      await sendMessage(zk, dest, ms, {
        video: { url: videoUrl },
        caption: conf.BOT,
        gifPlayback: false
      });

    } else {
      repondre(zk, dest, ms, 'Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(zk, dest, ms, `An error occurred during download: ${e.message}`);
  }
});

keith({
  nomCom: "capcut",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre(zk, dest, ms, 'Please insert a CapCut video link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/capcut?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9) {
      const videoUrl = response.data.BK9.video;
      const title = response.data.BK9.title || "CapCut Video";
      const description = response.data.BK9.description || "No description provided.";
      const usage = response.data.BK9.usage || "No usage information provided.";

      await sendMessage(zk, dest, ms, {
        text: `Title: ${title}\nDescription: ${description}\nUsage: ${usage}`,
      });

      await sendMessage(zk, dest, ms, {
        video: { url: videoUrl },
        caption: conf.BOT,
        gifPlayback: false
      });

    } else {
      repondre(zk, dest, ms, 'Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(zk, dest, ms, `An error occurred during download: ${e.message}`);
  }
});

keith({
  nomCom: "pinterest",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre(zk, dest, ms, 'Please insert a Pinterest video link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/pinterest?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9) {
      const videoUrl = response.data.BK9[0].url;
      const imageUrl = response.data.BK9[1].url;

      await sendMessage(zk, dest, ms, {
        image: { url: imageUrl },
        caption: conf.BOT,
      });

      await sendMessage(zk, dest, ms, {
        video: { url: videoUrl },
        caption: conf.BOT,
        gifPlayback: false
      });

    } else {
      repondre(zk, dest, ms, 'Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(zk, dest, ms, `An error occurred during download: ${e.message}`);
  }
});

keith({
  nomCom: "tiktok",
  aliases: ["tiktokdl2", "tikdl"],
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre(zk, dest, ms, 'Please insert a TikTok video link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/tiktok?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9) {
      const videoUrl = response.data.BK9.BK9;
      const description = response.data.BK9.desc;
      const commentCount = response.data.BK9.comment_count;
      const likesCount = response.data.BK9.likes_count;
      const uid = response.data.BK9.uid;
      const nickname = response.data.BK9.nickname;
      const musicTitle = response.data.BK9.music_info.title;

      await sendMessage(zk, dest, ms, {
        text: `Description: ${description}\nComments: ${commentCount}\nLikes: ${likesCount}\nUser ID: ${uid}\nNickname: ${nickname}\nMusic: ${musicTitle}`,
      });

      await sendMessage(zk, dest, ms, {
        video: { url: videoUrl },
        caption: conf.BOT,
        gifPlayback: false
      });

    } else {
      repondre(zk, dest, ms, 'Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(zk, dest, ms, `An error occurred during download: ${e.message}`);
  }
});

keith({
  nomCom: "appvn",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre(zk, dest, ms, 'Please insert an AppVN APK link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/getAppVn?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9) {
      const downloadUrl = response.data.BK9.download.url;
      const title = response.data.BK9.about.descriptionTitle || "AppVN APK";
      const description = response.data.BK9.about.descriptionShort || "No description provided.";
      const latestUpdate = response.data.BK9.about.latestUpdate || "No update date provided.";
      const fileSize = response.data.BK9.download.size || "Unknown size";
      const ogImage = response.data.BK9.about.ogImage;

      await sendMessage(zk, dest, ms, {
        image: { url: ogImage },
        caption: `Title: ${title}\nDescription: ${description}\nLatest Update: ${latestUpdate}\nSize: ${fileSize}`,
      });

      await sendMessage(zk, dest, ms, {
        document: { url: downloadUrl },
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${title}.apk`,
        caption: conf.BOT,
      });

    } else {
      repondre(zk, dest, ms, 'Failed to retrieve APK from the provided link.');
    }

  } catch (e) {
    repondre(zk, dest, ms, `An error occurred during download: ${e.message}`);
  }
});

keith({
  nomCom: "porn",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  const videoLink = arg.join(' ');

  if (!arg[0]) {
    return repondre(zk, dest, ms, 'Please insert a video link.');
  }

  try {
    const response = await axios.get(`https://api.davidcyriltech.my.id/xvideo?url=${encodeURIComponent(videoLink)}`);

    if (response.data.success) {
      const title = response.data.title;
      const thumbnail = response.data.thumbnail;
      const downloadUrl = response.data.download_url;

      await sendMessage(zk, dest, ms, {
        video: { url: downloadUrl },
        caption: title,
        contextInfo: {
          externalAdReply: {
            title: "Video Downloader",
            body: title,
            thumbnailUrl: thumbnail,
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true,
          },
        },
      });

    } else {
      repondre(zk, dest, ms, 'Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(zk, dest, ms, `An error occurred during download: ${e.message}`);
  }
});

keith({
  nomCom: 'apk',
  aliases: ['app', 'playstore'],
  reaction: '✨',
  categorie: 'Download'
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  const appName = arg.join(" ");
  if (!appName) {
    return repondre(zk, dest, ms, "Please provide an app name.");
  }

  try {
    const searchResponse = await axios.get(`https://bk9.fun/search/apk?q=${appName}`);
    const searchData = searchResponse.data;

    if (!searchData.BK9 || searchData.BK9.length === 0) {
      return repondre(zk, dest, ms, "No app found with that name, please try again.");
    }

    const appDetailsResponse = await axios.get(`https://bk9.fun/download/apk?id=${searchData.BK9[0].id}`);
    const appDetails = appDetailsResponse.data;

    if (!appDetails.BK9 || !appDetails.BK9.dllink) {
      return repondre(zk, dest, ms, "Unable to find the download link for this app.");
    }

    const thumb = appDetails.BK9.thumbnail || conf.URL;

    await sendMessage(zk, dest, ms, {
      document: { url: appDetails.BK9.dllink },
      fileName: `${appDetails.BK9.name}.apk`,
      mimetype: "application/vnd.android.package-archive",
      caption: `Downloaded by ${conf.OWNER_NAME}`,
      contextInfo: {
        externalAdReply: {
          mediaUrl: thumb,
          mediaType: 1,
          thumbnailUrl: thumb,
          title: "Alpha APK Download",
          body: appDetails.BK9.name,
          sourceUrl: conf.GURL,
          showAdAttribution: true
        }
      }
    });

  } catch (error) {
    console.error("Error during APK download process:", error);
    repondre(zk, dest, ms, "APK download failed. Please try again later.");
  }
});

keith({
  nomCom: "gitclone",
  aliases: ["zip", "clone"],
  categorie: "Download"
}, async (dest, zk, context) => {
  const { ms, arg } = context;
  const githubLink = arg.join(" ");

  if (!githubLink) {
    return repondre(zk, dest, ms, "Please provide a valid GitHub link.");
  }

  if (!githubLink.includes("github.com")) {
    return repondre(zk, dest, ms, "Is that a GitHub repo link?");
  }

  let [, owner, repo] = githubLink.match(/(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i) || [];
  
  if (!owner || !repo) {
    return repondre(zk, dest, ms, "Couldn't extract owner and repo from the provided link.");
  }

  repo = repo.replace(/.git$/, '');

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/zipball`;

  try {
    const response = await axios.head(apiUrl);
    const fileName = response.headers["content-disposition"].match(/attachment; filename=(.*)/)[1];

    await sendMessage(zk, dest, ms, {
      document: { url: apiUrl },
      fileName: `${fileName}.zip`,
      mimetype: "application/zip",
      caption: `*Downloaded by ${conf.BOT}*`,
      contextInfo: {
        externalAdReply: {
          title: `${conf.BOT} GIT CLONE`,
          body: conf.OWNER_NAME,
          thumbnailUrl: conf.URL,
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true
        }
      }
    });

  } catch (error) {
    console.error(error);
    repondre(zk, dest, ms, "Error fetching GitHub repository.");
  }
});

keith({
  nomCom: "instagram",
  aliases: ["igdl", "ig", "insta"],
  categorie: "Download",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  if (!arg[0]) {
    return repondre(zk, dest, ms, 'Please provide a valid public Instagram video link!');
  }

  if (!arg[0].includes('https://www.instagram.com/')) {
    return repondre(zk, dest, ms, "That is not a valid Instagram link.");
  }

  try {
    let downloadData = await igdl(arg[0]);

    if (!downloadData || !downloadData.data || downloadData.data.length === 0) {
      return repondre(zk, dest, ms, "No video found at the provided Instagram link.");
    }

    let videoData = downloadData.data;

    for (let i = 0; i < Math.min(20, videoData.length); i++) {
      let video = videoData[i];

      if (!video || !video.url) {
        continue;
      }

      let videoUrl = video.url;

      await sendMessage(zk, dest, ms, {
        video: { url: videoUrl },
        mimetype: "video/mp4",
        caption: `*Instagram Video Downloaded by ${conf.BOT}*`,
        contextInfo: {
          externalAdReply: {
            title: `${conf.BOT} IG DL`,
            body: conf.OWNER_NAME,
            thumbnailUrl: conf.URL,
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true
          }
        }
      });
    }

  } catch (error) {
    console.error(error);
    repondre(zk, dest, ms, "An error occurred while processing the request. Try igdl2 using this link.");
  }
});

keith({
  nomCom: "facebook2",
  aliases: ["fbdl2", "facebookdl2", "fb2"],
  categorie: "Download",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  if (!arg[0]) {
    return repondre(zk, dest, ms, 'Please insert a public Facebook video link!');
  }

  if (!arg[0].includes('https://')) {
    return repondre(zk, dest, ms, "That is not a valid Facebook link.");
  }

  try {
    const videoData = await facebook(arg[0]);

    const caption = `
     *𝐀𝐋𝐏𝐇𝐀 𝐌𝐃 𝐅𝐁 𝐃𝐋*
    |__________________________|
    |       *ᴅᴜʀᴀᴛɪᴏɴ*  
           ${videoData.result.duration}
    |_________________________
    | REPLY WITH BELOW NUMBERS
    |_________________________
    |____  *ғᴀᴄᴇʙᴏᴏᴋ ᴠᴅᴇᴏ ᴅʟ*  ____
    |-᳆  1 sᴅ ǫᴜᴀʟɪᴛʏ
    |-᳆  2 ʜᴅ ǫᴜᴀʟɪᴛʏ
    |_________________________
    |____  *ғᴀᴄᴇʙᴏᴏᴋ ᴀᴜᴅɪᴏ ᴅʟ*  ____
    |-᳆  3 ᴀᴜᴅɪᴏ
    |-᳆  4 ᴅᴏᴄᴜᴍᴇɴᴛ
    |-᳆  5 ᴘᴛᴛ(ᴠᴏɪᴄᴇ)
    |__________________________|
    `;

    const message = await sendMessage(zk, dest, ms, {
      image: { url: videoData.result.thumbnail },
      caption: caption,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          title: `${conf.BOT} FB DL`,
          body: `Duration: ${videoData.result.duration}`,
          thumbnailUrl: videoData.result.thumbnail,
          sourceUrl: conf.GURL,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    });

    const messageId = message.key.id;

    zk.ev.on("messages.upsert", async (update) => {
      const messageContent = update.messages[0];
      if (!messageContent.message) return;

      const responseText = messageContent.message.conversation || messageContent.message.extendedTextMessage?.text;
      const isReplyToMessage = messageContent.message.extendedTextMessage?.contextInfo.stanzaId === messageId;

      if (isReplyToMessage) {
        await zk.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        const videoDetails = videoData.result;

        await zk.sendMessage(dest, {
          react: { text: '⬆️', key: messageContent.key },
        });

        if (responseText === '1') {
          await sendMessage(zk, dest, ms, {
            video: { url: videoDetails.links.SD },
            caption: "*𝐀𝐋𝐏𝐇𝐀 𝐌𝐃*",
          });
        } else if (responseText === '2') {
          await sendMessage(zk, dest, ms, {
            video: { url: videoDetails.links.HD },
            caption: "*𝐀𝐋𝐏𝐇𝐀 𝐌𝐃*",
          });
        } else if (responseText === '3') {
          await sendMessage(zk, dest, ms, {
            audio: { url: videoDetails.links.SD },
            mimetype: "audio/mpeg",
          });
        } else if (responseText === '4') {
          await sendMessage(zk, dest, ms, {
            document: { url: videoDetails.links.SD },
            mimetype: "audio/mpeg",
            fileName: "Alpha.mp3",
            caption: "*ALPHA MD*"
          });
        } else if (responseText === '5') {
          await sendMessage(zk, dest, ms, {
            audio: { url: videoDetails.links.SD },
            mimetype: 'audio/mp4',
            ptt: true
          });
        } else {
          await sendMessage(zk, dest, ms, {
            text: "Invalid option. Please reply with a valid number (1-5).",
          });
        }
      }
    });
  } catch (error) {
    console.error(error);
    repondre(zk, dest, ms, 'An error occurred: try fbdl2 using this link' + error.message);
  }
});

keith({
  nomCom: "tiktok2",
  aliases: ["tikdl2", "tiktokdl2"],
  categorie: "Download",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  if (!arg[0]) {
    return repondre(zk, dest, ms, 'Please insert a public TikTok video link!');
  }

  if (!arg[0].includes('tiktok.com')) {
    return repondre(zk, dest, ms, "That is not a valid TikTok link.");
  }

  try {
    let tiktokData = await downloadTiktok(arg[0]);

    const caption = `
     *𝐀𝐋𝐏𝐇𝐀 𝐌𝐃 𝐓𝐈𝐊𝐓𝐎𝐊 𝐃𝐋*
    |__________________________|
    |-᳆        *ᴛɪᴛʟᴇ*  
     ${tiktokData.result.title}
    |_________________________
    ʀᴇᴘʟʏ ᴡɪᴛʜ ʙᴇʟᴏᴡ ɴᴜᴍʙᴇʀs 
    |-᳆  *1* sᴅ ǫᴜᴀʟɪᴛʏ
    |-᳆  *2*  ʜᴅ ǫᴜᴀʟɪᴛʏ
    |-᳆  *3*  ᴀᴜᴅɪᴏ
    |__________________________|
    `;

    const message = await sendMessage(zk, dest, ms, {
      image: { url: tiktokData.result.image },
      caption: caption,
    });

    const messageId = message.key.id;

    zk.ev.on("messages.upsert", async (update) => {
      const messageContent = update.messages[0];
      if (!messageContent.message) return;

      const responseText = messageContent.message.conversation || messageContent.message.extendedTextMessage?.text;
      const keithdl = messageContent.key.remoteJid;

      const isReplyToMessage = messageContent.message.extendedTextMessage?.contextInfo.stanzaId === messageId;

      if (isReplyToMessage) {
        await zk.sendMessage(keithdl, {
          react: { text: '⬇️', key: messageContent.key },
        });

        const tiktokLinks = tiktokData.result;

        await zk.sendMessage(keithdl, {
          react: { text: '⬆️', key: messageContent.key },
        });

        if (responseText === '1') {
          await sendMessage(zk, dest, ms, {
            video: { url: tiktokLinks.dl_link.download_mp4_1 },
            caption: "*𝐀𝐋𝐏𝐇𝐀 𝐌𝐃*",
          });
        } else if (responseText === '2') {
          await sendMessage(zk, dest, ms, {
            video: { url: tiktokLinks.dl_link.download_mp4_2 },
            caption: "*𝐀𝐋𝐏𝐇𝐀 𝐌𝐃*",
          });
        } else if (responseText === '3') {
          await sendMessage(zk, dest, ms, {
            audio: { url: tiktokLinks.dl_link.download_mp3 },
            mimetype: "audio/mpeg",
          });
        }
      }
    });
  } catch (error) {
    console.error(error);
    repondre(zk, dest, ms, 'An error occurred. Kindly try tiktok2 using this link: ' + error.message);
  }
});

keith({
  nomCom: "spotify",
  aliases: ["sdl", "spotifydl"],
  reaction: '⚔️',
  categorie: "download"
}, async (dest, zk, params) => {
  const { ms, arg } = params;  
  const text = arg.join(" ").trim(); 

  if (!text) {
    return repondre(zk, dest, ms, "What song do you want to download?");
  }

  try {
    let data = await axios.get(`https://api.dreaded.site/api/spotifydl?title=${text}`);

    if (data.data.success) {
      const audio = data.data.result.downloadLink;
      const filename = data.data.result.title;

      await sendMessage(zk, dest, ms, {
        document: { url: audio },
        mimetype: "audio/mpeg",
        fileName: `${filename}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: conf.BOT,
            body: "spotify download",
            mediaType: 1,
            sourceUrl: conf.GURL,
            thumbnailUrl: conf.URL,
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      });

      await sendMessage(zk, dest, ms, {
        audio: { url: audio },
        mimetype: "audio/mpeg",
        fileName: `${filename}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: conf.BOT,
            body: "spotify download",
            mediaType: 1,
            sourceUrl: conf.GURL,
            thumbnailUrl: conf.URL,
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      });

      await sendMessage(zk, dest, ms, {
        document: { url: audio },
        mimetype: "audio/mp4",
        fileName: `${filename}.mp4`,
        contextInfo: {
          externalAdReply: {
            title: conf.BOT,
            body: "spotify download",
            mediaType: 1,
            sourceUrl: conf.GURL,
            thumbnailUrl: conf.URL,
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      });

    } else {
      repondre(zk, dest, ms, "Failed to get a valid response from API endpoint");
    }

  } catch (error) {
    console.error("Error fetching the download link:", error);
    repondre(zk, dest, ms, "Unable to fetch download link, try matching exact song name or with artist name.");
  }
});

keith({
  nomCom: "fbdl",
  aliases: ["fb", "facebook"],
  desc: "to download Facebook video",
  categorie: "download",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  if (!arg[0]) {
    return repondre(zk, dest, ms, 'Insert a public Facebook video link!');
  }

  const queryURL = arg.join(" ");

  try {
    const result = await getFBInfo(queryURL);
    let caption = `
    Title: ${result.title}
    Link: ${result.url}
    `;
    await sendMessage(zk, dest, ms, { image: { url: result.thumbnail }, caption: caption });
    await sendMessage(zk, dest, ms, { video: { url: result.hd }, caption: 'downloaded successfully' });

  } catch (error) {
    console.error('Error:', error);
    repondre(zk, dest, ms, 'Try fbdl3 on the link');
  }
});

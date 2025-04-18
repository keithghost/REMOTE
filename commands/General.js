const { keith } = require("../keizzah/keith");
const axios = require("axios");
const conf = require(__dirname + '/../set');
const cheerio = require("cheerio");
const { Catbox } = require("node-catbox");
const fs = require('fs-extra');



// Initialize Catbox
const catbox = new Catbox();

keith({
  nomCom: "whisper",
  aliases: ["transcribe"],
  categorie: "utility",
  reaction: "🎙️"
}, async (dest, zk, commandOptions) => {
  const { msgRepondu, repondre } = commandOptions;

  // Check if the message is quoted and contains audio
  if (!msgRepondu || !msgRepondu.audioMessage) {
    return repondre("Please quote an audio message to transcribe.");
  }

  try {
    // Download the audio file
    const audioPath = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
    
    // Upload to Catbox
    const audioUrl = await catbox.uploadFile({ path: audioPath });
    fs.unlinkSync(audioPath); // Clean up local file

    if (!audioUrl) {
      return repondre("Failed to upload audio file.");
    }

    // Send to Whisper API
    const whisperApiUrl = `https://api.siputzx.my.id/api/cf/whisper?audioUrl=${encodeURIComponent(audioUrl)}`;
    const response = await axios.get(whisperApiUrl);
    const result = response.data;

    if (!result.success) {
      return repondre("Failed to transcribe audio.");
    }

    // Format the response
    const transcription = `
*Transcription Result:*
📝 *Text:* ${result.data.text}
🔢 *Word Count:* ${result.data.word_count}

*Timestamps (VTT Format):*
\`\`\`
${result.data.vtt}
\`\`\`
    `;

    await repondre(transcription);

  } catch (error) {
    console.error("Error in whisper command:", error);
    repondre("An error occurred while processing the audio. Please try again.");
  }
});
keith({
  nomCom: "codegen",
  aliases: ["codegenarate", "generatecode", "webscrap"],
  categorie: "coding",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg } = commandeOptions;
  const text = arg.join(" ");
  
  if (!text) {
    return repondre("Example usage:\n.codegen Function to calculate triangle area|Python");
  }

  let [prompt, language] = text.split("|").map(v => v.trim());

  if (!prompt || !language) {
    return repondre(
      "Invalid format!\nUse the format:\n.codegen <prompt>|<language>\n\n" +
      "Example:\n.codegen Check for prime number|JavaScript"
    );
  }

  try {
    const payload = {
      customInstructions: prompt,
      outputLang: language
    };

    const { data } = await axios.post("https://www.codeconvert.ai/api/generate-code", payload);

    if (!data || typeof data !== "string") {
      return repondre("Failed to retrieve code from API.");
    }

    repondre(
      `*Generated Code (${language}):*\n` +
      "```" + language.toLowerCase() + "\n" +
      data.trim() +
      "\n```"
    );

  } catch (error) {
    console.error("Code generation error:", error);
    repondre("An error occurred while processing your request.");
  }
});


keith({
  nomCom: "logogen",
  aliases: ["logogenarate", "generatelogo", "webscrap"],
  categorie: "Ai",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions; // Added 'ms' which was missing
  const text = arg.join(" ");

  if (!text) {
    return repondre("Enter title, idea, and slogan.\nFormat: _logogen Title|Idea|Slogan_\n\n*Example:* _logogen DreadedTech|AI-Powered Services|Innovation Meets Simplicity_");
  }

  const [title, idea, slogan] = text.split("|");

  if (!title || !idea || !slogan) {
    return repondre("Incorrect format.\nUse: _logogen Title|Idea|Slogan_");
  }

  try {
    const payload = {
      ai_icon: [333276, 333279],
      height: 300,
      idea,
      industry_index: "N",
      industry_index_id: "",
      pagesize: 4,
      session_id: "",
      slogan,
      title,
      whiteEdge: 80,
      width: 400,
    };

    const { data } = await axios.post("https://www.sologo.ai/v1/api/logo/logo_generate", payload);

    if (!data.data?.logoList || data.data.logoList.length === 0) {
      return repondre("Failed to generate logo. Please try again.");
    }

    for (const logo of data.data.logoList) {
      await zk.sendMessage(dest, {
        image: { url: logo.logo_thumb }, // Fixed typo in property name
        caption: `_Generated Logo for "${title}"_`
      }, { quoted: ms });
    }
  } catch (err) {
    console.error("Logo generation error:", err);
    await repondre("An error occurred while creating the logo.");
  }
});


// Manga Search Command
keith({
  nomCom: "manga",
  aliases: ["mangasearch", "searchmanga"],
  categorie: "Search",
  reaction: "📚"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;
  const searchQuery = arg.join(" ");

  if (!searchQuery) {
    return repondre("Please provide a manga title to search.\nExample: _manga One Piece_");
  }

  try {
    const url = `https://myanimelist.net/manga.php?q=${encodeURIComponent(searchQuery)}&cat=manga`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    let mangaList = [];

    $('table tbody tr').each((_, element) => {
      const imageUrl = $(element)
        .find('td:nth-child(1) img')
        .attr('data-src') || $(element)
        .find('td:nth-child(1) img')
        .attr('src');
      const title = $(element)
        .find('td:nth-child(2) strong')
        .text()
        .trim();
      const link = $(element)
        .find('td:nth-child(2) a')
        .attr('href');
      const type = $(element)
        .find('td:nth-child(3)')
        .text()
        .trim();
      const vol = $(element)
        .find('td:nth-child(4)')
        .text()
        .trim();
      const score = $(element)
        .find('td:nth-child(5)')
        .text()
        .trim();
      const description = $(element)
        .find('td:nth-child(2) .pt4')
        .text()
        .replace('read more.', '')
        .trim() || 'No description available';

      if (title && link) {
        mangaList.push({
          title,
          description,
          type,
          vol,
          score,
          imageUrl,
          link
        });
      }
    });

    if (mangaList.length === 0) {
      return repondre("No manga found matching your search.");
    }

    // Format the results for WhatsApp
    let resultMessage = "🔍 *Manga Search Results* 🔍\n\n";
    mangaList.slice(0, 5).forEach((manga, index) => {
      resultMessage += `*${index + 1}. ${manga.title}* (${manga.type})\n` +
                       `⭐ Score: ${manga.score || 'N/A'}\n` +
                       `📚 Volumes: ${manga.vol || 'N/A'}\n` +
                       `🔗 ${manga.link}\n\n`;
    });

    if (mangaList.length > 5) {
      resultMessage += `...and ${mangaList.length - 5} more results.`;
    }

    await zk.sendMessage(dest, {
      text: resultMessage
    }, { quoted: ms });

    // Send the first image if available
    if (mangaList[0].imageUrl) {
      await zk.sendMessage(dest, {
        image: { url: mangaList[0].imageUrl },
        caption: `Cover for "${mangaList[0].title}"`
      }, { quoted: ms });
    }

  } catch (error) {
    console.error("Manga search error:", error);
    await repondre("An error occurred while searching for manga. Please try again later.");
  }
});


keith({
  nomCom: "download",
  aliases: ["dl", "unidl", "videodl", "socialdl"],
  categorie: "Downloader",
  reaction: "⬇️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;
  const videoUrl = arg[0];

  if (!videoUrl) {
    return repondre("Please provide a valid URL.\nExample: _download https://tiktok.com/@user/video/123456789_");
  }

  const apiUrl = "https://universaldownloader.com/wp-json/aio-dl/video-data/";

  const headers = {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/x-www-form-urlencoded",
    "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": '"Android"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    cookie: "PHPSESSID=iidld6j33b2iscdvl8ed85k6in; pll_language=en; _ga_SNFLGC3754=GS1.1.1741305061.1.0.1741305061.0.0.0; _ga=GA1.2.897696689.1741305062; _gid=GA1.2.741064418.1741305065; _gat_gtag_UA_250577925_1=1",
    Referer: "https://universaldownloader.com/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  };

  try {
    const body = `url=${encodeURIComponent(videoUrl)}`;
    const response = await axios.post(apiUrl, body, { headers });
    const data = response.data;

    if (!data || data.error) {
      return repondre("Failed to download the video. The service might be unavailable or the URL is invalid.");
    }

    // Format the response based on available data
    let resultMessage = `⬇️ *Video Downloader*\n\n` +
                      `🔗 *Source:* ${videoUrl}\n` +
                      `🖥️ *Platform:* ${data.platform || 'Unknown'}\n` +
                      `📛 *Title:* ${data.title || 'No title available'}\n`;

    // Send video if available
    if (data.video && data.video.url) {
      await zk.sendMessage(dest, {
        video: { url: data.video.url },
        caption: resultMessage
      }, { quoted: ms });
    } 
    // Send image if video not available but image exists
    else if (data.image && data.image.url) {
      await zk.sendMessage(dest, {
        image: { url: data.image.url },
        caption: resultMessage
      }, { quoted: ms });
    } 
    // Fallback to text message if no media
    else {
      resultMessage += `\n⚠️ *No media found* - Try another URL`;
      await zk.sendMessage(dest, {
        text: resultMessage
      }, { quoted: ms });
    }

  } catch (error) {
    console.error('Universal Downloader error:', error);
    await repondre("An error occurred while processing your request. Please try again later.");
  }
});



keith({
  nomCom: "capcut",
  aliases: ["cc", "capcutdl"],
  categorie: "Download",
  reaction: "✂️"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, repondre } = commandOptions;

  // Check if URL is provided
  if (!arg[0]) {
    return repondre("Please provide a CapCut video URL.\nExample: !capcut https://www.capcut.com/t/Zs8Sw9wsE");
  }

  const url = arg[0];
  
  // Validate CapCut URL
  if (!url.includes('capcut.com') && !url.includes('capcut.net')) {
    return repondre("Invalid CapCut URL. Please provide a valid CapCut video link.");
  }

  try {
    // Get download info from API
    const apiUrl = `https://api.siputzx.my.id/api/d/capcut?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    // Check API response
    if (!data.status || !data.data || !data.data.contentUrl) {
      return repondre('Failed to retrieve video information. The link may be invalid or private.');
    }

    const videoData = data.data;
    const meta = videoData.meta || {};

    // Prepare the message payload
    const messagePayload = {
      video: { 
        url: videoData.contentUrl 
      },
      mimetype: 'video/mp4',
      caption: `✂️ *CapCut Video*\n\n` +
               `📌 *Title:* ${meta.title || 'No title'}\n` +
               `❤️ *Likes:* ${meta.like ? meta.like.toLocaleString() : 'N/A'}\n` +
               `▶️ *Plays:* ${meta.play ? meta.play.toLocaleString() : 'N/A'}\n` +
               `⏱️ *Duration:* ${meta.duration ? (meta.duration/1000).toFixed(1)+'s' : 'N/A'}\n` +
               `👤 *Author:* ${meta.author?.name || 'Unknown'}\n` +
               `🔗 *Original URL:* ${url}`,
      contextInfo: {
        externalAdReply: {
          title: meta.title || 'CapCut Video',
          body: `By ${meta.author?.name || 'Unknown'} | ${meta.play ? meta.play.toLocaleString()+' plays' : ''}`,
          mediaType: 1,
          sourceUrl: conf.GURL,
          thumbnailUrl: meta.coverUrl || videoData.thumbnailUrl?.[0],
          renderLargerThumbnail: true,
          showAdAttribution: true,
        },
      },
    };

    // Send the video
    await zk.sendMessage(dest, messagePayload, { quoted: ms });

  } catch (error) {
    console.error('Error during CapCut download process:', error);
    if (error.response?.status === 404) {
      return repondre('Video not found. The link may be invalid or private.');
    }
    return repondre(`Failed to download video: ${error.message || error}`);
  }
});

keith({
  nomCom: "pinterest",
  aliases: ["pin", "pindownload"],
  categorie: "download",
  reaction: "📌"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, repondre } = commandOptions;

  // Check if a query is provided
  if (!arg[0]) {
    return repondre("Please provide a search query for Pinterest.");
  }

  const query = arg.join(" ");

  try {
    // Perform a Pinterest search
    const searchUrl = `https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(query)}`;
    const searchResponse = await axios.get(searchUrl);
    const searchData = searchResponse.data;

    // Check if any pins were found
    if (!searchData.status || !searchData.data || searchData.data.length === 0) {
      return repondre('No pins found for the specified query.');
    }

    // Get the first pin result
    const firstPin = searchData.data[0];
    
    // Get download link for the pin
    const downloadUrl = `https://api.siputzx.my.id/api/d/pinterest?url=${encodeURIComponent(firstPin.pin)}`;
    const downloadResponse = await axios.get(downloadUrl);
    const downloadData = downloadResponse.data;

    if (!downloadData.status || !downloadData.data || !downloadData.data.url) {
      return repondre('Failed to retrieve download URL.');
    }

    // Determine if it's an image or video
    const isVideo = downloadData.data.url.includes('.mp4');
    const mediaType = isVideo ? 'video' : 'image';

    // Prepare the message payload
    const messagePayload = {
      [mediaType]: { url: downloadData.data.url },
      mimetype: isVideo ? 'video/mp4' : 'image/jpeg',
      caption: `📌 *Pinterest Download*\n\n` +
               `🔹 *Title:* ${firstPin.grid_title || 'No title'}\n` +
               `🔹 *Created:* ${firstPin.created_at}\n` +
               `🔹 *Source:* ${firstPin.link || firstPin.pin}`,
      contextInfo: {
        externalAdReply: {
          title: firstPin.grid_title || 'Pinterest Download',
          body: `Query: ${query}`,
          mediaType: 1,
          sourceUrl: conf.GURL,
          thumbnailUrl: firstPin.images_url,
          renderLargerThumbnail: true,
          showAdAttribution: true,
        },
      },
    };

    // Send the media
    await zk.sendMessage(dest, messagePayload, { quoted: ms });

  } catch (error) {
    console.error('Error during Pinterest download process:', error);
    return repondre(`Failed to download pin: ${error.message || error}`);
  }
});


keith({
  nomCom: "seegore",
  aliases: ["gore", "seegorevideo"],
  categorie: "download",
  reaction: "🎥"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, repondre } = commandOptions;

  // Check if a query is provided
  if (!arg[0]) {
    return repondre("Please provide a search query for Seegore videos.");
  }

  const query = arg.join(" ");

  try {
    // Perform a Seegore search
    const searchUrl = `https://api.siputzx.my.id/api/s/seegore?query=${encodeURIComponent(query)}`;
    const searchResponse = await axios.get(searchUrl);
    const searchData = searchResponse.data;

    // Check if any videos were found
    if (!searchData.status || !searchData.data || searchData.data.length === 0) {
      return repondre('No videos found for the specified query.');
    }

    // Get the first video result
    const firstVideo = searchData.data[0];
    
    // Get download link for the video
    const downloadUrl = `https://api.siputzx.my.id/api/d/seegore?url=${encodeURIComponent(firstVideo.link)}`;
    const downloadResponse = await axios.get(downloadUrl);
    const downloadData = downloadResponse.data;

    if (!downloadData.status || !downloadData.data || !downloadData.data.videoSrc) {
      return repondre('Failed to retrieve download URL.');
    }

    // Prepare the message payload
    const messagePayload = {
      video: { url: downloadData.data.videoSrc },
      mimetype: 'video/mp4',
      caption: `*${downloadData.data.title}*\n\n` +
               `👤 *Author:* ${downloadData.data.author}\n` +
               `📅 *Posted:* ${downloadData.data.postedOn}\n` +
               `👁️ *Views:* ${downloadData.data.viewsCount}\n` +
               `⭐ *Rating:* ${downloadData.data.rating.value}/5 (${downloadData.data.rating.count} votes)`,
      contextInfo: {
        externalAdReply: {
          title: downloadData.data.title,
          body: `Views: ${downloadData.data.viewsCount} | Rating: ${downloadData.data.rating.value}`,
          mediaType: 1,
          sourceUrl: conf.GURL,
          thumbnailUrl: firstVideo.thumb,
          renderLargerThumbnail: false,
          showAdAttribution: true,
        },
      },
    };

    // Send the video
    await zk.sendMessage(dest, messagePayload, { quoted: ms });

  } catch (error) {
    console.error('Error during Seegore download process:', error);
    return repondre(`Failed to download video: ${error.message || error}`);
  }
});


keith({
  nomCom: "crime",
  aliases: ["thriller", "murder", "homicide"],
  categorie: "download",
  reaction: "🎥"
}, async (dest, zk, commandOptions) => {
  const { ms, repondre } = commandOptions;

  try {
    // Fetch data from Seegore API
    const apiUrl = "https://api.siputzx.my.id/api/r/seegore";
    const response = await axios.get(apiUrl);
    const data = response.data;

    // Check if API response is valid
    if (!data.status || !data.data) {
      return repondre('Failed to fetch video data from Seegore API.');
    }

    const videoData = data.data;
    const videos = [videoData.video1, videoData.video2].filter(Boolean); // Get both videos and filter out any null values

    // Check if we have any videos to send
    if (videos.length === 0) {
      return repondre('No videos found in the API response.');
    }

    // Prepare and send each video
    for (const videoUrl of videos) {
      const messagePayload = {
        video: { url: videoUrl },
        mimetype: 'video/mp4',
        caption: `*${videoData.title}*\n\n` +
                 `🔹 *Source:* ${videoData.source}\n` +
                 `🔹 *Tag:* ${videoData.tag}\n` +
                 `🔹 *Views:* ${videoData.view}\n` +
                 `🔹 *Uploaded:* ${videoData.upload}`,
        contextInfo: {
          externalAdReply: {
            title: videoData.title,
            body: videoData.tag,
            mediaType: 1,
            sourceUrl: conf.GURL,
            thumbnailUrl: videoData.thumb,
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      };

      await zk.sendMessage(dest, messagePayload, { quoted: ms });
    }

  } catch (error) {
    console.error('Error during Seegore download process:', error);
    return repondre(`Download failed due to an error: ${error.message || error}`);
  }
});

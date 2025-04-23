
const { keith } = require('../keizzah/keith');
const axios = require('axios');
const fs = require('fs-extra');
const { mediafireDl } = require("../keizzah/dl/Function");
const conf = require(__dirname + "/../set");



keith({
  nomCom: 'apk',
  aliases: ['app', 'playstore'],
  reaction: '✨',
  categorie: 'Download'
}, async (groupId, client, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;

  // Check if app name is provided
  const appName = arg.join(" ");
  if (!appName) {
    return repondre("Please provide an app name.");
  }

  try {
    // Fetch app search results from the API
    const searchResponse = await axios.get(`https://apis-keith.vercel.app/search/apkfab?q=${encodeURIComponent(appName)}`);
    const searchData = searchResponse.data;

    // Check if any results were found
    if (!searchData.status || !searchData.result || searchData.result.length === 0) {
      return repondre("No app found with that name, please try again.");
    }

    // Get the first result
    const firstResult = searchData.result[0];
    
    // Send the app details as a message with image
    await client.sendMessage(groupId, {
      image: { url: firstResult.image },
      caption: `*${firstResult.title}*\n\n⭐ Rating: ${firstResult.rating || 'N/A'}\n📝 Reviews: ${firstResult.review || 'N/A'}\n\n_Downloading APK..._`
    }, { quoted: ms });

    // Fetch the APK download link
    const downloadResponse = await axios.get(`https://apis-keith.vercel.app/download/apkfab?url=${encodeURIComponent(firstResult.link)}`);
    const downloadData = downloadResponse.data;

    // Check if download link is available
    if (!downloadData.status || !downloadData.result || !downloadData.result.link) {
      return repondre("Unable to find the download link for this app.");
    }

    // Send the APK file to the group
    await client.sendMessage(groupId, {
      document: { url: downloadData.result.link },
      fileName: `${firstResult.title}.apk`,
      mimetype: "application/vnd.android.package-archive",
      caption: `*${firstResult.title}*\n\nDownloaded by ${conf.OWNER_NAME}`
    }, { quoted: ms });

  } catch (error) {
    // Catch any errors and notify the user
    console.error("Error during APK download process:", error);
    repondre("APK download failed. Please try again later.");
  }
});

// GitHub Clone Downloader
keith({
  nomCom: "gitclone",
  aliases: ["zip", "clone"],
  categorie: "Download"
}, async (dest, zk, context) => {
  const { ms, repondre, arg } = context;
  const githubLink = arg.join(" ");

  // Check if the GitHub link is provided and valid
  if (!githubLink) {
    return repondre("Please provide a valid GitHub link.");
  }

  if (!githubLink.includes("github.com")) {
    return repondre("Is that a GitHub repo link?");
  }

  // Extract owner and repo from the GitHub URL using a regex pattern
  let [, owner, repo] = githubLink.match(/(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i) || [];
  
  // Check if owner and repo were extracted correctly
  if (!owner || !repo) {
    return repondre("Couldn't extract owner and repo from the provided link.");
  }

  // Remove the .git suffix from the repo name if present
  repo = repo.replace(/.git$/, '');

  // GitHub API URL for the zipball of the repo
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/zipball`;

  try {
    // Make a HEAD request to get the file metadata
    const response = await axios.head(apiUrl);
    const fileName = response.headers["content-disposition"].match(/attachment; filename=(.*)/)[1];

    // Send the zip file link as a document
    await zk.sendMessage(dest, {
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
    }, { quoted: ms });
  } catch (error) {
    // Handle error if the repository cannot be fetched
    console.error(error);
    repondre("Error fetching GitHub repository.");
  }
});




const conf = require(__dirname + "/../set");
const { keith } = require('../keizzah/keith');
const { default: axios } = require('axios');
const { sendMessage, repondre } = require(__dirname + "/../keizzah/context");

// IP Stalker Command

keith({
  nomCom: "countrystalk",
  aliases: ["countryinfo", "nationstalk"],
  categorie: "stalker"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;
  const countryName = arg.join(' ');

  if (!arg[0]) {
    return repondre(zk, dest, ms, 'Please enter a country name to search.');
  }

  try {
    const response = await axios.get(`https://apis-keith.vercel.app/stalker/country?region=${encodeURIComponent(countryName)}`);

    if (response.data.status && response.data.result) {
      const countryData = response.data.result;
      const basicInfo = countryData.basicInfo;
      const geography = countryData.geography;
      const culture = countryData.culture;
      const government = countryData.government;

      // Format neighbors
      let neighborsList = 'None';
      if (geography.neighbors && geography.neighbors.length > 0) {
        neighborsList = geography.neighbors.map(neighbor => neighbor.name).join(', ');
      }

      // Format languages
      const languages = culture.languages.native.join(', ');

      await sendMessage(zk, dest, ms, {
        text: `*Country Information: ${basicInfo.name}*\n\n` +
              `🏙️ *Capital:* ${basicInfo.capital}\n` +
              `📞 *Phone Code:* ${basicInfo.phoneCode}\n` +
              `🌐 *Internet TLD:* ${basicInfo.internetTLD}\n\n` +
              
              `*🌍 Geography*\n` +
              `📍 *Continent:* ${geography.continent.name} ${geography.continent.emoji}\n` +
              `📏 *Area:* ${geography.area.sqKm.toLocaleString()} km² (${geography.area.sqMiles.toLocaleString()} mi²)\n` +
              `🧭 *Coordinates:* ${geography.coordinates.latitude}, ${geography.coordinates.longitude}\n` +
              `🚫 *Landlocked:* ${geography.landlocked ? 'Yes' : 'No'}\n` +
              `🧩 *Neighboring Countries:* ${neighborsList}\n\n` +
              
              `*🎭 Culture*\n` +
              `🗣️ *Languages:* ${languages}\n` +
              `⭐ *Famous For:* ${culture.famousFor}\n` +
              `🚗 *Driving Side:* ${culture.drivingSide}\n` +
              `🍷 *Alcohol Policy:* ${culture.alcoholPolicy || 'Not specified'}\n\n` +
              
              `*🏛️ Government*\n` +
              `📜 *Constitutional Form:* ${government.constitutionalForm}\n` +
              `💰 *Currency:* ${government.currency}\n\n` +
              
              `*🔗 Links*\n` +
              `🗺️ *Google Maps:* ${basicInfo.googleMaps}\n` +
              `🆔 *ISO Codes:* ${countryData.isoCodes.alpha2}/${countryData.isoCodes.alpha3}/${countryData.isoCodes.numeric}`,
        contextInfo: {
          externalAdReply: {
            title: `Country Information: ${basicInfo.name}`,
            body: `Capital: ${basicInfo.capital} | ${geography.continent.name}`,
            thumbnailUrl: basicInfo.flag || conf.GURL,
            sourceUrl: basicInfo.googleMaps,
            mediaType: 1,
            showAdAttribution: true,
          },
        },
      });
    } else {
      repondre(zk, dest, ms, 'Country not found. Please check the spelling and try again.');
    }
  } catch (e) {
    repondre(zk, dest, ms, `An error occurred while fetching country information: ${e.message}`);
  }
});
keith({
  nomCom: "ytstalk",
  aliases: ["youtubestalk", "channelstalk"],
  categorie: "stalker"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;
  const username = arg.join(' ');

  if (!arg[0]) {
    return repondre(zk, dest, ms, 'Please insert a YouTube channel username or ID.');
  }

  try {
    const response = await axios.get(`https://apis-keith.vercel.app/stalker/ytchannel?user=${encodeURIComponent(username)}`);

    if (response.data.status && response.data.result) {
      const channelData = response.data.result;
      const channel = channelData.channel;
      const videos = channelData.videos || [];

      // Format channel information
      let channelInfo = `*YouTube Channel Info*\n\n` +
                       `📺 *Channel:* ${channel.username}\n` +
                       `🔗 *URL:* ${channel.url}\n` +
                       `📝 *Description:* ${channel.description || 'No description'}\n\n` +
                       `*📊 Statistics*\n` +
                       `👥 *Subscribers:* ${channel.stats.subscribers}\n` +
                       `🎥 *Videos:* ${channel.stats.videos}\n\n`;

      // Add recent videos if available
      if (videos.length > 0) {
        channelInfo += `*🎬 Recent Videos (${videos.length})*\n`;
        videos.slice(0, 3).forEach((video, index) => {
          channelInfo += `\n${index + 1}. *${video.title}*\n` +
                        `⏱️ ${video.duration} | 👀 ${video.views} views\n` +
                        `📅 ${video.published}\n` +
                        `🔗 ${video.url}\n`;
        });
      }

      await sendMessage(zk, dest, ms, {
        text: channelInfo,
        contextInfo: {
          externalAdReply: {
            title: "YouTube Channel Stalker",
            body: channel.username,
            thumbnailUrl: channel.avatar,
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true,
          },
        },
      });
    } else {
      repondre(zk, dest, ms, 'Failed to retrieve YouTube channel details. Please check the username/ID and try again.');
    }
  } catch (e) {
    repondre(zk, dest, ms, `An error occurred while fetching YouTube channel: ${e.message}`);
  }
});

keith({
  nomCom: "igstalk",
  aliases: ["instastalk", "instagramstalk"],
  categorie: "stalker"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;
  const username = arg.join(' ');

  if (!arg[0]) {
    return repondre(zk, dest, ms, 'Please insert an Instagram username.');
  }

  try {
    const response = await axios.get(`https://apis-keith.vercel.app/stalker/ig?user=${encodeURIComponent(username)}`);

    if (response.data.status && response.data.result) {
      const userData = response.data.result;
      const profile = userData.profile;
      const stats = userData.stats;

      // Format account type
      const accountType = profile.isBusiness ? 'Business' : 
                         profile.accountType === 1 ? 'Personal' : 'Unknown';

      await sendMessage(zk, dest, ms, {
        text: `*Instagram Profile Info*\n\n` +
              `👤 *Username:* @${profile.username}\n` +
              `📛 *Full Name:* ${profile.fullName || 'Not specified'}\n` +
              `📝 *Bio:* ${profile.biography || 'No bio'}\n` +
              `🌐 *External Link:* ${profile.externalUrl || 'None'}\n` +
              `✅ *Verified:* ${profile.isVerified ? 'Yes' : 'No'}\n` +
              `🔒 *Private Account:* ${profile.isPrivate ? 'Yes' : 'No'}\n` +
              `🏢 *Account Type:* ${accountType}\n\n` +
              `*📊 Statistics*\n` +
              `👥 *Followers:* ${stats.followers}\n` +
              `👤 *Following:* ${stats.following}\n` +
              `📷 *Posts:* ${stats.mediaCount}\n\n` +
              `🆔 *User ID:* ${profile.id}\n` +
              `📅 *Created At:* ${profile.createdAt ? new Date(profile.createdAt / 1000).toLocaleString() : 'Unknown'}`,
        contextInfo: {
          externalAdReply: {
            title: "Instagram Profile Stalker",
            body: `@${profile.username}`,
            thumbnailUrl: profile.avatars.standard,
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true,
          },
        },
      });
    } else {
      repondre(zk, dest, ms, 'Failed to retrieve Instagram profile details. Please check the username and try again.');
    }
  } catch (e) {
    repondre(zk, dest, ms, `An error occurred while fetching Instagram profile: ${e.message}`);
  }
});

keith({
  nomCom: "tiktokstalk",
  aliases: ["ttstalk", "tstalk"],
  categorie: "stalker"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;
  const username = arg.join(' ');

  if (!arg[0]) {
    return repondre(zk, dest, ms, 'Please insert a TikTok username.');
  }

  try {
    const response = await axios.get(`https://apis-keith.vercel.app/stalker/tiktok?user=${encodeURIComponent(username)}`);

    if (response.data.status && response.data.result) {
      const userData = response.data.result;
      const profile = userData.profile;
      const stats = userData.stats;

      await sendMessage(zk, dest, ms, {
        text: `*TikTok Profile Info*\n\n` +
              `👤 *Username:* ${profile.username}\n` +
              `📛 *Nickname:* ${profile.nickname}\n` +
              `📝 *Bio:* ${profile.bio || 'No bio'}\n` +
              `✅ *Verified:* ${profile.verified ? 'Yes' : 'No'}\n` +
              `🔒 *Private Account:* ${profile.private ? 'Yes' : 'No'}\n` +
              `📅 *Created At:* ${new Date(profile.createdAt).toLocaleString()}\n` +
              `🌍 *Region:* ${profile.region}\n\n` +
              `*📊 Statistics*\n` +
              `👥 *Followers:* ${stats.followers}\n` +
              `👤 *Following:* ${stats.following}\n` +
              `❤️ *Total Likes:* ${stats.likes}\n` +
              `🎥 *Videos:* ${stats.videos}\n` +
              `🤝 *Friends:* ${stats.friends}`,
        contextInfo: {
          externalAdReply: {
            title: "TikTok Profile Stalker",
            body: `@${profile.username}`,
            thumbnailUrl: profile.avatars.medium,
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true,
          },
        },
      });
    } else {
      repondre(zk, dest, ms, 'Failed to retrieve TikTok profile details. Please check the username and try again.');
    }
  } catch (e) {
    repondre(zk, dest, ms, `An error occurred while fetching TikTok profile: ${e.message}`);
  }
});
keith({
  nomCom: "ipstalk",
  categorie: "stalker"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;
  const ip = arg.join(' ');

  if (!arg[0]) {
    return repondre(zk, dest, ms, 'Please insert an IP address...');
  }

  try {
    const response = await axios.get(`https://bk9.fun/stalk/ip?q=${encodeURIComponent(ip)}`);

    if (response.data.status && response.data.BK9) {
      const cached = response.data.BK9.cached;
      const cacheTimestamp = new Date(response.data.BK9.cacheTimestamp * 1000).toLocaleString(); // Convert timestamp to human-readable date

      await sendMessage(zk, dest, ms, {
        text: `IP Address: ${ip}\nCached: ${cached}\nCache Timestamp: ${cacheTimestamp}`,
        contextInfo: {
          externalAdReply: {
            title: "IP Stalk",
            body: conf.OWNER_NAME,
            thumbnailUrl: conf.URL,
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true,
          },
        },
      });
    } else {
      repondre(zk, dest, ms, 'Failed to retrieve IP details from the provided link.');
    }
  } catch (e) {
    repondre(zk, dest, ms, `An error occurred during the IP stalk: ${e.message}`);
  }
});

// GitHub Repository Stalker Command
keith({
  nomCom: "repostalk",
  categorie: "stalker"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;
  const repoUrl = arg.join(' ');

  if (!arg[0]) {
    return repondre(zk, dest, ms, 'Please insert a GitHub repository link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/stalk/githubrepo?url=${encodeURIComponent(repoUrl)}`);

    if (response.data.status && response.data.BK9) {
      const repoInfo = response.data.BK9;
      const owner = repoInfo.owner;

      await sendMessage(zk, dest, ms, {
        text: `Repository Name: ${repoInfo.full_name}\nOwner: ${owner.login}\nDescription: ${repoInfo.description || 'No description provided.'}\nStars: ${repoInfo.stargazers_count}\nForks: ${repoInfo.forks_count}\nOpen Issues: ${repoInfo.open_issues_count}\nWatchers: ${repoInfo.watchers_count}\nLanguage: ${repoInfo.language}\nCreated At: ${new Date(repoInfo.created_at).toLocaleString()}\nUpdated At: ${new Date(repoInfo.updated_at).toLocaleString()}\nPushed At: ${new Date(repoInfo.pushed_at).toLocaleString()}\nRepo URL: ${repoInfo.html_url}`,
        contextInfo: {
          externalAdReply: {
            title: "GitHub Repository Stalker",
            body: `Repository: ${repoInfo.full_name}`,
            thumbnailUrl: owner.avatar_url,
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true,
          },
        },
      });
    } else {
      repondre(zk, dest, ms, 'Failed to retrieve repository details from the provided link.');
    }
  } catch (e) {
    repondre(zk, dest, ms, `An error occurred during the GitHub repository stalk: ${e.message}`);
  }
});

// NPM Package Stalker Command
keith({
  nomCom: "npmstalk",
  categorie: "stalker"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;
  const packageName = arg.join(' ');

  if (!arg[0]) {
    return repondre(zk, dest, ms, 'Please insert an NPM package name.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/stalk/npm?package=${encodeURIComponent(packageName)}`);

    if (response.data.status && response.data.BK9) {
      const packageInfo = response.data.BK9;
      const keywords = packageInfo.keywords.length > 0 ? packageInfo.keywords.join(', ') : 'No keywords provided';
      const infoDetails = packageInfo.info.map(infoItem => `${infoItem.type}: ${infoItem.result}`).join('\n');

      await sendMessage(zk, dest, ms, {
        text: `Package Name: ${packageInfo.name}\nVersion: ${packageInfo.version}\nDescription: ${packageInfo.desc || 'No description provided.'}\nDate Published: ${packageInfo.date_published}\nPublished Info: ${packageInfo.published_info || 'No published info provided.'}\nKeywords: ${keywords}\nInstallation: ${packageInfo.installation || 'No installation command provided.'}\nWeekly Downloads: ${packageInfo.weekly_downloads || 'No weekly downloads data provided.'}\nWeekly Dependents: ${packageInfo.weekly_dependents || 'No weekly dependents data provided.'}\n\nAdditional Info:\n${infoDetails}`,
        contextInfo: {
          externalAdReply: {
            title: "NPM Package Stalker",
            body: `Package: ${packageInfo.name}`,
            thumbnailUrl: "https://nodejs.org/static/images/logo.svg",
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true,
          },
        },
      });
    } else {
      repondre(zk, dest, ms, 'Failed to retrieve package details from the provided package name.');
    }
  } catch (e) {
    repondre(zk, dest, ms, `An error occurred during the NPM package stalk: ${e.message}`);
  }
});

// Global Population Command
keith({
  nomCom: "population",
  categorie: "stalker"
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;

  try {
    const response = await axios.get(`https://bk9.fun/details/population`);

    if (response.data.status && response.data.BK9) {
      const populationInfo = response.data.BK9;
      const currentTotal = populationInfo.current.total;
      const currentMale = populationInfo.current.male;
      const currentFemale = populationInfo.current.female;
      const birthsThisYear = populationInfo.this_year.births;
      const deathsThisYear = populationInfo.this_year.deaths;
      const birthsToday = populationInfo.today.births;
      const deathsToday = populationInfo.today.deaths;

      await sendMessage(zk, dest, ms, {
        text: `Global Population Details:\n\nCurrent Population:\n  - Total: ${currentTotal}\n  - Male: ${currentMale}\n  - Female: ${currentFemale}\n\nThis Year:\n  - Births: ${birthsThisYear}\n  - Deaths: ${deathsThisYear}\n\nToday:\n  - Births: ${birthsToday}\n  - Deaths: ${deathsToday}`,
        contextInfo: {
          externalAdReply: {
            title: "Global Population Details",
            body: conf.OWNER_NAME,
            thumbnailUrl: conf.URL,
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true,
          },
        },
      });
    } else {
      repondre(zk, dest, ms, 'Failed to retrieve population details.');
    }
  } catch (e) {
    repondre(zk, dest, ms, `An error occurred during the population details fetch: ${e.message}`);
  }
});

// Text Detection Command
keith({
  nomCom: "textdetect",
  categorie: "stalker"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;
  const inputText = arg.join(' ');

  if (!arg[0]) {
    return repondre(zk, dest, ms, 'Please provide some text to detect.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/tools/txtdetect?q=${encodeURIComponent(inputText)}`);

    if (response.data.status && response.data.BK9.success) {
      const detectionData = response.data.BK9.data;
      const feedback = detectionData.feedback;
      const detectedLanguage = detectionData.detected_language;
      const specialSentences = detectionData.specialSentences.join(', ') || 'None';
      const additionalFeedback = detectionData.additional_feedback || 'No additional feedback provided.';

      await sendMessage(zk, dest, ms, {
        text: `Text Detection Result:\n\nOriginal Paragraph: ${detectionData.originalParagraph}\nFeedback: ${feedback}\nDetected Language: ${detectedLanguage}\nSpecial Sentences: ${specialSentences}\nAdditional Feedback: ${additionalFeedback}`,
        contextInfo: {
          externalAdReply: {
            title: "Text Detection",
            body: conf.OWNER_NAME,
            thumbnailUrl: conf.URL,
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true,
          },
        },
      });
    } else {
      repondre(zk, dest, ms, 'Failed to detect text from the provided input.');
    }
  } catch (e) {
    repondre(zk, dest, ms, `An error occurred during text detection: ${e.message}`);
  }
});

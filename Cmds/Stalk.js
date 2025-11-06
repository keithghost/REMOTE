const { keith } = require('../commandHandler');
const axios = require('axios');
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================

keith({
  pattern: "ytstalk",
  aliases: ["youtubestalk", "ytchannelstalk"],
  description: "Stalk a YouTube channel using username",
  category: "stalker",
  filename: __filename
}, async (from, client, conText) => {
  const { q, reply, mek } = conText;

  if (!q) return reply("❌ Provide a YouTube username.\n\nExample: ytstalk keithkeizzah");

  try {
    const res = await axios.get(`https://apiskeith.vercel.app/stalker/ytchannel?user=${encodeURIComponent(q)}`);
    const data = res.data;

    if (!data.status || !data.result?.channel) {
      return reply("❌ Failed to fetch YouTube channel. Make sure the username is correct.");
    }

    const { channel, videos } = data.result;
    const caption = `📺 *YouTube Channel: ${channel.username}*\n\n` +
      `👤 Name: ${channel.username.replace("@", "")}\n` +
      `🔗 URL: ${channel.url}\n` +
      `📄 Description: ${channel.description || "—"}\n` +
      `📊 Subscribers: ${channel.stats.subscribers}\n` +
      `🎬 Videos: ${channel.stats.videos}\n\n` +
      `🆕 *Recent Uploads:*` +
      videos.map((v, i) => `\n\n${i + 1}. *${v.title}*\n📅 ${v.published}\n👁️ ${v.views} views\n⏱️ ${v.duration}\n🔗 ${v.url}`).join("");

    await client.sendMessage(from, {
      image: { url: channel.avatar },
      caption
    }, { quoted: mek });
  } catch (err) {
    console.error("ytstalk error:", err);
    reply("❌ Error fetching YouTube channel: " + err.message);
  }
});
//========================================================================================================================


keith({
  pattern: "twistalk",
  aliases: ["stalktwitter", "twstalk"],
  description: "Stalk Twitter profile using username",
  category: "stalker",
  filename: __filename
}, async (from, client, conText) => {
  const { q, reply, mek } = conText;

  if (!q) return reply("❌ Provide a Twitter username.\n\nExample: twistalk keithkeizzah");

  try {
    const res = await axios.get(`https://apiskeith.vercel.app/stalker/twitter?user=${encodeURIComponent(q)}`);
    const data = res.data;

    if (!data.status || !data.result?.profile) {
      return reply("❌ Failed to fetch Twitter profile. Make sure the username is correct.");
    }

    const { profile, stats } = data.result;
    const caption = `🐦 *Twitter Profile: @${profile.username}*\n\n` +
      `👤 Name: ${profile.displayName}\n` +
      `🆔 ID: ${profile.id}\n` +
      `📄 Bio: ${profile.description || "—"}\n` +
      `📍 Location: ${profile.location || "—"}\n` +
      `✅ Verified: ${profile.verified ? "Yes" : "No"}\n` +
      `📅 Created: ${new Date(profile.createdAt).toDateString()}\n\n` +
      `📊 *Stats*\n` +
      `📝 Tweets: ${stats.tweets}\n` +
      `👣 Following: ${stats.following}\n` +
      `👥 Followers: ${stats.followers}\n` +
      `❤️ Likes: ${stats.likes}\n` +
      `🖼️ Media Posts: ${stats.media}`;

    await client.sendMessage(from, {
      image: { url: profile.images.avatar },
      caption
    }, { quoted: mek });
  } catch (err) {
    console.error("twistalk error:", err);
    reply("❌ Error fetching Twitter profile: " + err.message);
  }
});
//========================================================================================================================

keith({
  pattern: "repostalk",
  aliases: ["ghstalk", "githubrepostalk"],
  description: "Stalk a GitHub repository using its URL",
  category: "stalker",
  filename: __filename
}, async (from, client, conText) => {
  const { q, reply, mek } = conText;

  if (!q || !q.includes("github.com")) {
    return reply("❌ Provide a valid GitHub repository URL.\n\nExample: repostalk https://github.com/Keithkeizzah/KEITH-MD");
  }

  try {
    const res = await axios.get(`https://apiskeith.vercel.app/stalker/repostalk?url=${encodeURIComponent(q)}`);
    const data = res.data;

    if (!data.status || !data.result?.repo) {
      return reply("❌ Failed to fetch repository data. Make sure the URL is correct.");
    }

    const { repo, owner } = data.result;
    const caption = `📦 *GitHub Repo: ${repo.fullName}*\n\n` +
      `📝 Description: ${repo.description || "—"}\n` +
      `🔗 URL: ${repo.url}\n` +
      `🔒 Private: ${repo.isPrivate ? "Yes" : "No"}\n` +
      `🌐 Visibility: ${repo.visibility}\n` +
      `🧑‍💻 Language: ${repo.language}\n` +
      `📄 License: ${repo.license?.name || "—"}\n` +
      `🌱 Default Branch: ${repo.defaultBranch}\n\n` +
      `📊 *Stats*\n` +
      `⭐ Stars: ${repo.stars}\n` +
      `👁️ Watchers: ${repo.watchers}\n` +
      `🍴 Forks: ${repo.forks}\n` +
      `🐞 Issues: ${repo.openIssues}\n` +
      `📦 Size: ${repo.size} KB\n\n` +
      `👤 *Owner: ${owner.username}*\n` +
      `🔗 Profile: ${owner.profileUrl}\n` +
      `🆔 ID: ${owner.id}\n` +
      `👤 Type: ${owner.type}`;

    await client.sendMessage(from, {
      image: { url: owner.avatar },
      caption
    }, { quoted: mek });
  } catch (err) {
    console.error("repostalk error:", err);
    reply("❌ Error fetching GitHub repo data: " + err.message);
  }
});
//========================================================================================================================

keith({
  pattern: "igstalk",
  aliases: ["stalkig", "instastalk"],
  description: "Stalk Instagram profile using username",
  category: "stalker",
  filename: __filename
}, async (from, client, conText) => {
  const { q, reply, mek } = conText;

  if (!q) return reply("❌ Provide an Instagram username.\n\nExample: igstalk keithkeizzah");

  try {
    const res = await axios.get(`https://apiskeith.vercel.app/stalker/ig?user=${encodeURIComponent(q)}`);
    const data = res.data;

    if (!data.status || !data.result?.profile) {
      return reply("❌ Failed to fetch Instagram profile. Make sure the username is correct.");
    }

    const { profile, stats, status } = data.result;
    const caption = `📸 *Instagram Profile: ${profile.username}*\n\n` +
      `👤 Name: ${profile.fullName}\n` +
      `🔗 Profile: ${profile.profileUrl}\n` +
      `📄 Bio: ${profile.biography || "—"}\n` +
      `🌐 External Link: ${profile.externalUrl || "—"}\n` +
      `🏷️ Category: ${profile.category || "—"}\n` +
      `🧾 Account Type: ${profile.accountType || "—"}\n\n` +
      `📊 *Stats*\n` +
      `👥 Followers: ${stats.followers}\n` +
      `👣 Following: ${stats.following}\n` +
      `🖼️ Posts: ${stats.mediaCount}\n` +
      `📈 Engagement: ${stats.engagementRate}\n` +
      `🎞️ Clips: ${stats.clipsCount}\n\n` +
      `🔒 Private: ${status.isPrivate ? "Yes" : "No"}\n` +
      `✅ Verified: ${status.isVerified ? "Yes" : "No"}\n` +
      `🏢 Business: ${status.isBusiness ? "Yes" : "No"}`;

    await client.sendMessage(from, {
      image: { url: profile.avatars.hd },
      caption
    }, { quoted: mek });
  } catch (err) {
    console.error("igstalk error:", err);
    reply("❌ Error fetching Instagram profile: " + err.message);
  }
});
//========================================================================================================================
//
keith({
  pattern: "tiktokstalk",
  aliases: ["ttstalk", "stalktiktok"],
  description: "Stalk TikTok profile using username",
  category: "stalker",
  filename: __filename
}, async (from, client, conText) => {
  const { q, reply, mek } = conText;

  if (!q) return reply("❌ Provide a TikTok username.\n\nExample: tiktokstalk keizzah4189");

  try {
    const res = await axios.get(`https://apiskeith.vercel.app/stalker/tiktok?user=${encodeURIComponent(q)}`);
    const data = res.data;

    if (!data.status || !data.result?.profile) {
      return reply("❌ Failed to fetch TikTok profile. Make sure the username is correct.");
    }

    const { profile, stats } = data.result;
    const caption = `👤 *TikTok Profile: @${profile.username}*\n\n` +
      `📛 Name: ${profile.nickname}\n` +
      `🆔 ID: ${profile.id}\n` +
      `🔗 Bio: ${profile.bio || "—"}\n` +
      `🌐 Language: ${profile.language}\n` +
      `🔒 Private: ${profile.private ? "Yes" : "No"}\n` +
      `✅ Verified: ${profile.verified ? "Yes" : "No"}\n` +
      `📅 Created: ${new Date(profile.createdAt).toDateString()}\n\n` +
      `📊 *Stats*\n` +
      `👥 Followers: ${stats.followers}\n` +
      `👣 Following: ${stats.following}\n` +
      `❤️ Likes: ${stats.likes}\n` +
      `🎬 Videos: ${stats.videos}\n` +
      `🧑‍🤝‍🧑 Friends: ${stats.friends}`;

    await client.sendMessage(from, {
      image: { url: profile.avatars.large },
      caption
    }, { quoted: mek });
  } catch (err) {
    console.error("tiktokstalk error:", err);
    reply("❌ Error fetching TikTok profile: " + err.message);
  }
});

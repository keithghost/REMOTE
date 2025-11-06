
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


keith({
  pattern: "topscorers",
  aliases: ["scorers", "goals"],
  description: "View top goal scorers across major football leagues",
  category: "sports",
  filename: __filename
}, async (from, client, conText) => {
  const { mek, reply } = conText;

  const caption = `╭═════════════════⊷
║  ⚽ *Top Scorers* ⚽
║━━━━━━━━━━━━━━━━━
║ 𝗥𝗘𝗣𝗟𝗬 𝗪𝗜𝗧𝗛 𝗟𝗘𝗔𝗚𝗨𝗘 𝗡𝗨𝗠𝗕𝗘𝗥
║ 1. Premier League
║ 2. Bundesliga
║ 3. La Liga
║ 4. Ligue 1
║ 5. Serie A
║ 6. UEFA Champions League
║ 7. FIFA International
║ 8. UEFA Euro
╰═════════════════⊷`;

  const sent = await client.sendMessage(from, { text: caption }, { quoted: mek });
  const messageId = sent.key.id;

  client.ev.on("messages.upsert", async (update) => {
    const msg = update.messages[0];
    if (!msg.message) return;

    const responseText = msg.message.conversation || msg.message.extendedTextMessage?.text;
    const isReply = msg.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
    const chatId = msg.key.remoteJid;

    if (!isReply) return;

    const leagueMap = {
      "1": { name: "Premier League", url: "https://apiskeith.vercel.app/epl/scorers" },
      "2": { name: "Bundesliga", url: "https://apiskeith.vercel.app/bundesliga/scorers" },
      "3": { name: "La Liga", url: "https://apiskeith.vercel.app/laliga/scorers" },
      "4": { name: "Ligue 1", url: "https://apiskeith.vercel.app/ligue1/scorers" },
      "5": { name: "Serie A", url: "https://apiskeith.vercel.app/seriea/scorers" },
      "6": { name: "UEFA Champions League", url: "https://apiskeith.vercel.app/ucl/scorers" },
      "7": { name: "FIFA International", url: "https://apiskeith.vercel.app/fifa/scorers" },
      "8": { name: "UEFA Euro", url: "https://apiskeith.vercel.app/euros/scorers" }
    };

    const selected = leagueMap[responseText.trim()];
    if (!selected) {
      return client.sendMessage(chatId, {
        text: "❌ Invalid league number. Reply with a number between 1 and 8.",
        quoted: msg
      });
    }

    try {
      await client.sendMessage(chatId, { react: { text: "⚽", key: msg.key } });

      const res = await axios.get(selected.url);
      const data = res.data;

      if (!data.status || !Array.isArray(data.result?.topScorers)) {
        return client.sendMessage(chatId, {
          text: `❌ Failed to fetch ${selected.name} scorers.`,
          quoted: msg
        });
      }

      const scorers = data.result.topScorers.map(scorer => {
        let medal = "";
        if (scorer.rank === 1) medal = "🥇";
        else if (scorer.rank === 2) medal = "🥈";
        else if (scorer.rank === 3) medal = "🥉";

        return `${medal} *${scorer.rank}. ${scorer.player}* (${scorer.team})\n` +
               `⚽ Goals: ${scorer.goals} | 🎯 Assists: ${scorer.assists}\n` +
               `🎯 Penalties: ${scorer.penalties}`;
      }).join("\n\n");

      const caption = `📊 *Top Scorers – ${data.result.competition}*\n\n${scorers}`;

      await client.sendMessage(chatId, { text: caption }, { quoted: msg });
    } catch (err) {
      console.error("topscorers error:", err);
      await client.sendMessage(chatId, {
        text: `❌ Error fetching ${selected.name} scorers: ${err.message}`,
        quoted: msg
      });
    }
  });
});
//========================================================================================================================

keith({
  pattern: "standings",
  aliases: ["leaguetable", "league"],
  description: "View current league standings across major competitions",
  category: "sports",
  filename: __filename
}, async (from, client, conText) => {
  const { mek, reply } = conText;

  const caption = `╭═════════════════⊷
║  📊 *League Standings* 📊
║━━━━━━━━━━━━━━━━━
║ 𝗥𝗘𝗣𝗟𝗬 𝗪𝗜𝗧𝗛 𝗟𝗘𝗔𝗚𝗨𝗘 𝗡𝗨𝗠𝗕𝗘𝗥
║ 1. Premier League
║ 2. Bundesliga
║ 3. La Liga
║ 4. Ligue 1
║ 5. Serie A
║ 6. UEFA Champions League
║ 7. FIFA International
║ 8. UEFA Euro
╰═════════════════⊷`;

  const sent = await client.sendMessage(from, { text: caption }, { quoted: mek });
  const messageId = sent.key.id;

  client.ev.on("messages.upsert", async (update) => {
    const msg = update.messages[0];
    if (!msg.message) return;

    const responseText = msg.message.conversation || msg.message.extendedTextMessage?.text;
    const isReply = msg.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
    const chatId = msg.key.remoteJid;

    if (!isReply) return;

    const leagueMap = {
      "1": { name: "Premier League", url: "https://apiskeith.vercel.app/epl/standings" },
      "2": { name: "Bundesliga", url: "https://apiskeith.vercel.app/bundesliga/standings" },
      "3": { name: "La Liga", url: "https://apiskeith.vercel.app/laliga/standings" },
      "4": { name: "Ligue 1", url: "https://apiskeith.vercel.app/ligue1/standings" },
      "5": { name: "Serie A", url: "https://apiskeith.vercel.app/seriea/standings" },
      "6": { name: "UEFA Champions League", url: "https://apiskeith.vercel.app/ucl/standings" },
      "7": { name: "FIFA International", url: "https://apiskeith.vercel.app/fifa/standings" },
      "8": { name: "UEFA Euro", url: "https://apiskeith.vercel.app/euros/standings" }
    };

    const selected = leagueMap[responseText.trim()];
    if (!selected) {
      return client.sendMessage(chatId, {
        text: "❌ Invalid league number. Reply with a number between 1 and 8.",
        quoted: msg
      });
    }

    try {
      await client.sendMessage(chatId, { react: { text: "📊", key: msg.key } });

      const res = await axios.get(selected.url);
      const data = res.data;

      if (!data.status || !Array.isArray(data.result?.standings)) {
        return client.sendMessage(chatId, {
          text: `❌ Failed to fetch ${selected.name} standings.`,
          quoted: msg
        });
      }

      const standings = data.result.standings.map(team => {
        let tag = "🧱"; // mid-table default
        if (team.position <= 4) tag = "🏆"; // Champions League
        else if (team.position === 5 || team.position === 6) tag = "🥈"; // Europa League
        else if (team.position >= 18) tag = "⚠️"; // Relegation

        return `${tag} *${team.position}. ${team.team}*\n` +
               `Played: ${team.played} | W:${team.won} D:${team.draw} L:${team.lost}\n` +
               `Points: ${team.points} | GD: ${team.goalDifference}`;
      }).join("\n\n");

      const caption = `📊 *${data.result.competition} Standings*\n\n${standings}`;

      await client.sendMessage(chatId, { text: caption }, { quoted: msg });
    } catch (err) {
      console.error("standings error:", err);
      await client.sendMessage(chatId, {
        text: `❌ Error fetching ${selected.name} standings: ${err.message}`,
        quoted: msg
      });
    }
  });
});
//========================================================================================================================

keith({
  pattern: "upcomingmatches",
  aliases: ["fixtures", "upcoming", "nextgames"],
  description: "View upcoming matches across major football leagues",
  category: "sports",
  filename: __filename
}, async (from, client, conText) => {
  const { mek, reply } = conText;

  const caption = `╭═════════════════⊷
║  📅 *Upcoming Matches* 📅
║━━━━━━━━━━━━━━━━━
║ 𝗥𝗘𝗣𝗟𝗬 𝗪𝗜𝗧𝗛 𝗟𝗘𝗔𝗚𝗨𝗘 𝗡𝗨𝗠𝗕𝗘𝗥
║ 1. Premier League
║ 2. Bundesliga
║ 3. La Liga
║ 4. Ligue 1
║ 5. Serie A
║ 6. UEFA Champions League
║ 7. FIFA International
║ 8. UEFA Euro
╰═════════════════⊷`;

  const sent = await client.sendMessage(from, { text: caption }, { quoted: mek });
  const messageId = sent.key.id;

  client.ev.on("messages.upsert", async (update) => {
    const msg = update.messages[0];
    if (!msg.message) return;

    const responseText = msg.message.conversation || msg.message.extendedTextMessage?.text;
    const isReply = msg.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
    const chatId = msg.key.remoteJid;

    if (!isReply) return;

    const leagueMap = {
      "1": { name: "Premier League", url: "https://apiskeith.vercel.app/epl/upcomingmatches" },
      "2": { name: "Bundesliga", url: "https://apiskeith.vercel.app/bundesliga/upcomingmatches" },
      "3": { name: "La Liga", url: "https://apiskeith.vercel.app/laliga/upcomingmatches" },
      "4": { name: "Ligue 1", url: "https://apiskeith.vercel.app/ligue1/upcomingmatches" },
      "5": { name: "Serie A", url: "https://apiskeith.vercel.app/seriea/upcomingmatches" },
      "6": { name: "UEFA Champions League", url: "https://apiskeith.vercel.app/ucl/upcomingmatches" },
      "7": { name: "FIFA International", url: "https://apiskeith.vercel.app/fifa/upcomingmatches" },
      "8": { name: "UEFA Euro", url: "https://apiskeith.vercel.app/euros/upcomingmatches" }
    };

    const selected = leagueMap[responseText.trim()];
    if (!selected) {
      return client.sendMessage(chatId, {
        text: "❌ Invalid league number. Reply with a number between 1 and 8.",
        quoted: msg
      });
    }

    try {
      await client.sendMessage(chatId, { react: { text: "📅", key: msg.key } });

      const res = await axios.get(selected.url);
      const data = res.data;

      if (!data.status || !Array.isArray(data.result?.upcomingMatches)) {
        return client.sendMessage(chatId, {
          text: `❌ Failed to fetch ${selected.name} fixtures.`,
          quoted: msg
        });
      }

      const fixtures = data.result.upcomingMatches.map(match =>
        `📅 *Matchday ${match.matchday}*\n🕒 ${match.date}\n🏟️ ${match.homeTeam} vs ${match.awayTeam}`
      ).join("\n\n");

      const caption = `🏆 *Upcoming ${selected.name} Matches*\n\n${fixtures}`;

      await client.sendMessage(chatId, { text: caption }, { quoted: msg });
    } catch (err) {
      console.error("upcomingmatches error:", err);
      await client.sendMessage(chatId, {
        text: `❌ Error fetching ${selected.name} schedule: ${err.message}`,
        quoted: msg
      });
    }
  });
});


      
//========================================================================================================================

keith({
  pattern: "gamehistory",
  aliases: ["matchevents", "gameevents"],
  description: "View historical or upcoming game events between teams",
  category: "sports",
  filename: __filename
}, async (from, client, conText) => {
  const { q, reply, mek } = conText;

  if (!q || !q.includes("vs")) {
    return reply("❌ Provide a valid match query.\n\nExample: gamehistory Arsenal vs Chelsea");
  }

  try {
    const res = await axios.get(`https://apiskeith.vercel.app/sport/gameevents?q=${encodeURIComponent(q)}`);
    const data = res.data;

    if (!data.status || !Array.isArray(data.result) || data.result.length === 0) {
      return reply("❌ No game events found for that matchup.");
    }

    for (const match of data.result.slice(0, 3)) {
      const { teams, league, venue, dateTime, status, season, media } = match;
      const caption = `⚽ *${match.match}*\n\n` +
        `🏆 League: ${league.name} (${season})\n` +
        `📅 Date: ${dateTime.date} at ${dateTime.time}\n` +
        `📍 Venue: ${venue.name || "—"} (${venue.country || "—"})\n` +
        `🔢 Round: ${match.round}\n` +
        `📶 Status: ${status}\n\n` +
        `🔴 ${teams.home.name}: ${teams.home.score ?? "—"}\n` +
        `🔵 ${teams.away.name}: ${teams.away.score ?? "—"}\n\n` +
        (match.media.video ? `▶️ Video: ${match.media.video}` : "");

      const mediaMsg = match.media?.poster || match.media?.thumb
        ? { image: { url: match.media.poster || match.media.thumb }, caption }
        : { text: caption };

      await client.sendMessage(from, mediaMsg, { quoted: mek });
    }
  } catch (err) {
    console.error("gamehistory error:", err);
    reply("❌ Error fetching game history: " + err.message);
  }
});
//========================================================================================================================

keith({
  pattern: "venuesearch",
  aliases: ["venue", "stadium"],
  description: "Search for sports venues by name",
  category: "sports",
  filename: __filename
}, async (from, client, conText) => {
  const { q, reply, mek } = conText;

  if (!q) return reply("❌ Provide a venue name.\n\nExample: venuesearch Emirates");

  try {
    const res = await axios.get(`https://apiskeith.vercel.app/sport/venuesearch?q=${encodeURIComponent(q)}`);
    const data = res.data;

    if (!data.status || !Array.isArray(data.result) || data.result.length === 0) {
      return reply("❌ No matching venues found. Try a different name.");
    }

    for (const venue of data.result.slice(0, 3)) {
      const caption = `🏟️ *${venue.name}*\n\n` +
        `📛 Alternate Name: ${venue.alternateName || "—"}\n` +
        `⚽ Sport: ${venue.sport || "—"}\n` +
        `📍 Location: ${venue.location || "—"}\n` +
        `🌍 Country: ${venue.country || "—"}\n` +
        `📅 Built: ${venue.yearBuilt || "—"}\n` +
        `👥 Capacity: ${venue.capacity || "—"}\n` +
        `🕒 Timezone: ${venue.timezone || "—"}\n\n` +
        `📝 *Description*\n${venue.description?.split("\r\n").slice(0, 2).join("\n") || "—"}`;

      const media = venue.media?.thumb
        ? { image: { url: venue.media.thumb }, caption }
        : { text: caption };

      await client.sendMessage(from, media, { quoted: mek });
    }
  } catch (err) {
    console.error("venuesearch error:", err);
    reply("❌ Error fetching venue data: " + err.message);
  }
});
//========================================================================================================================


keith({
  pattern: "teamsearch",
  aliases: ["team", "club"],
  description: "Search for sports teams by name",
  category: "sports",
  filename: __filename
}, async (from, client, conText) => {
  const { q, reply, mek } = conText;

  if (!q) return reply("❌ Provide a team name.\n\nExample: teamsearch Arsenal");

  try {
    const res = await axios.get(`https://apiskeith.vercel.app/sport/teamsearch?q=${encodeURIComponent(q)}`);
    const data = res.data;

    if (!data.status || !Array.isArray(data.result) || data.result.length === 0) {
      return reply("❌ No matching teams found. Try a different name.");
    }

    const team = data.result[0];
    const caption = `🏟️ *${team.name}*\n\n` +
      `📛 Alternate Names: ${team.alternateName}\n` +
      `📅 Formed: ${team.formedYear}\n` +
      `⚽ Sport: ${team.sport}\n` +
      `🏆 League: ${team.league}\n` +
      `📍 Location: ${team.location}, ${team.country}\n` +
      `🚻 Gender: ${team.gender}\n` +
      `🏟️ Stadium: ${team.stadium} (${team.stadiumCapacity} capacity)\n\n` +
      `🌐 *Social Links*\n` +
      `🔗 Website: ${team.social.website}\n` +
      `📘 Facebook: ${team.social.facebook}\n` +
      `🐦 Twitter: ${team.social.twitter}\n` +
      `📸 Instagram: ${team.social.instagram}\n` +
      `📺 YouTube: ${team.social.youtube}\n\n` +
      `📝 *Description*\n${team.description.split("\r\n").slice(0, 3).join("\n")}`;

    await client.sendMessage(from, {
      image: { url: team.badges.large },
      caption
    }, { quoted: mek });
  } catch (err) {
    console.error("teamsearch error:", err);
    reply("❌ Error fetching team data: " + err.message);
  }
});
//========================================================================================================================
//
keith({
  pattern: "playersearch",
  aliases: ["player", "athlete"],
  description: "Search for sports players by name",
  category: "sports",
  filename: __filename
}, async (from, client, conText) => {
  const { q, reply, mek } = conText;

  if (!q) return reply("❌ Provide a player name.\n\nExample: playersearch Bukayo Saka");

  try {
    const res = await axios.get(`https://apiskeith.vercel.app/sport/playersearch?q=${encodeURIComponent(q)}`);
    const data = res.data;

    if (!data.status || !Array.isArray(data.result) || data.result.length === 0) {
      return reply("❌ No matching players found. Try a different name.");
    }

    for (const player of data.result.slice(0, 3)) {
      const caption = `🏅 *${player.name}*\n\n` +
        `🏟️ Team: ${player.team}\n` +
        `⚽ Sport: ${player.sport}\n` +
        `🌍 Nationality: ${player.nationality}\n` +
        `🎂 Birthdate: ${player.birthDate}\n` +
        `📌 Position: ${player.position}\n` +
        `📶 Status: ${player.status}\n` +
        `🚻 Gender: ${player.gender}`;

      const media = player.thumbnail
        ? { image: { url: player.thumbnail }, caption }
        : { text: caption };

      await client.sendMessage(from, media, { quoted: mek });
    }
  } catch (err) {
    console.error("playersearch error:", err);
    reply("❌ Error fetching player data: " + err.message);
  }
});

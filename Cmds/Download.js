const { keith } = require('../commandHandler');

keith({
    pattern: "play",
    alias: ["song", "music", "track"],
    desc: "Download music from YouTube, Spotify or SoundCloud",
    category: "Search",
    react: "🎧",
    filename: __filename
}, async (context) => {
    try {
        const {
            downloadYouTube, downloadSoundCloud, downloadSpotify,
            searchYouTube, searchSoundCloud, searchSpotify,
            client, m, text, botname, sendReply, sendMediaMessage
        } = context;

        if (!text) {
            return sendReply(client, m, "🎵 Please specify the song title.\n*Example:* play Shape of You");
        }

        let result, downloadResult, platform;

        // Try YouTube
        result = await searchYouTube(text);
        if (result) {
            downloadResult = await downloadYouTube(result.url);
            platform = 'YouTube';
        }

        // Fallback to Spotify
        if (!downloadResult) {
            result = await searchSpotify(text);
            if (result) {
                downloadResult = await downloadSpotify(result.url);
                platform = 'Spotify';
            }
        }

        // Fallback to SoundCloud
        if (!downloadResult) {
            result = await searchSoundCloud(text);
            if (result) {
                downloadResult = await downloadSoundCloud(result.url);
                platform = 'SoundCloud';
            }
        }

        if (!result || !downloadResult) {
            return sendReply(client, m, "❌ Couldn't find or download the requested song.");
        }

        const caption = `
🎶 *Song Info*
╭─────────────────────
📝 *Title:* ${result.title}
🎧 *Source:* ${platform}
🔗 *URL:* ${result.url}
📦 *Format:* ${downloadResult.format}
${result.artist ? `👤 *Artist:* ${result.artist}` : ""}
╰─────────────────────
*Powered by ${botname}*
        `.trim();

        if (result.thumbnail || downloadResult.thumbnail) {
            await sendMediaMessage(client, m, {
                image: { url: downloadResult.thumbnail || result.thumbnail },
                caption
            });
        }

        await sendMediaMessage(client, m, {
            audio: { url: downloadResult.downloadUrl },
            mimetype: "audio/mp4"
        });

        await sendMediaMessage(client, m, {
            document: { url: downloadResult.downloadUrl },
            mimetype: "audio/mp3",
            fileName: `${result.title.replace(/[^a-zA-Z0-9 ]/g, "")}.mp3`
        });

    } catch (error) {
        console.error("Play command error:", error);
        context.reply(`❌ Error fetching song:\n${error.message}`);
    }
});

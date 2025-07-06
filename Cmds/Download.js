const { keith } = require('../commandHandler');

keith({
    pattern: "play",
    alias: ["song", "music", "track"],
    desc: "Download music from YouTube, Spotify or SoundCloud",
    category: "Download",
    react: "🎧",
    filename: __filename
}, async ({ client, m, text, botname, sendReply, sendMediaMessage, downloadYouTube, downloadSoundCloud, downloadSpotify,
    searchYouTube, searchSoundCloud, searchSpotify }) => {
    if (!text) {
        return sendReply(client, m, "🎵 Please specify the song title.\n*Example:* play Blinding Lights");
    }

    const sources = [
        { search: searchYouTube, download: downloadYouTube, label: "YouTube" },
        { search: searchSpotify, download: downloadSpotify, label: "Spotify" },
        { search: searchSoundCloud, download: downloadSoundCloud, label: "SoundCloud" }
    ];

    let result = null;
    let downloadResult = null;
    let platform = null;

    for (const source of sources) {
        result = await source.search(text);
        if (result) {
            downloadResult = await source.download(result.url);
            if (downloadResult) {
                platform = source.label;
                break;
            }
        }
    }

    if (!result || !downloadResult) {
        return sendReply(client, m, "❌ Couldn't find or download the requested song.");
    }

    const caption = [
        `🎶 *Song Info*`,
        `╭─────────────────────`,
        `📝 *Title:* ${result.title}`,
        `🎧 *Source:* ${platform}`,
        `🔗 *URL:* ${result.url}`,
        `📦 *Format:* ${downloadResult.format}`,
        result.artist ? `👤 *Artist:* ${result.artist}` : null,
        `╰─────────────────────`,
        `*Powered by ${botname}*`
    ].filter(Boolean).join('\n');

    if (downloadResult.thumbnail || result.thumbnail) {
        await sendMediaMessage(client, m, {
            image: { url: downloadResult.thumbnail || result.thumbnail },
            caption
        });
    }

    await client.sendMessage(m.chat, {
        audio: { url: downloadResult.downloadUrl },
        mimetype: "audio/mp4"
    });

    await client.sendMessage(m.chat, {
        document: { url: downloadResult.downloadUrl },
        mimetype: "audio/mp3",
        fileName: `${result.title.replace(/[^a-zA-Z0-9 ]/g, "")}.mp3`
    });
});

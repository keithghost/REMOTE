const { keith } = require('../commandHandler');
const axios = require('axios');
const ytSearch = require('yt-search');

keith({
    pattern: "play",
    alias: ["song", "music", "track"],
    desc: "Download music from YouTube, Spotify or SoundCloud",
    category: "Download",
    react: "🎧",
    filename: __filename
}, async (ctx) => {
    const { client, m, text, botname, sendReply, sendMediaMessage } = ctx;

    if (!text) return sendReply(client, m, "🎵 Please provide a song name!\n_Example: play Shape of You_");

    let result = null, platform = null, audio = null, thumb = null;

    // Step 1: YouTube search and dual download fallback
    try {
        const yt = await ytSearch(text);
        if (yt && yt.videos.length > 0) {
            const video = yt.videos[0];
            const videoUrl = `https://youtube.com/watch?v=${video.videoId}`;

            const primary = await axios.get(`https://apis-keith.vercel.app/download/dlm3?url=${videoUrl}`).then(r => r.data?.result?.data).catch(() => null);
            const fallback = !primary?.downloadUrl
                ? await axios.get(`https://apis-keith.vercel.app/download/ytm3?url=${videoUrl}`).then(r => r.data?.result).catch(() => null)
                : null;

            audio = primary?.downloadUrl || fallback?.download_url;
            thumb = primary?.thumbnail || fallback?.thumbnail;
            result = { title: video.title, url: videoUrl, artist: video.author.name };
            platform = "YouTube";
        }
    } catch {}

    // Step 2: Spotify fallback if YT failed
    if (!audio) {
        try {
            const { data } = await axios.get(`https://apis-keith.vercel.app/download/spotify?q=${encodeURIComponent(text)}`);
            if (data.status && data.result?.track) {
                const track = data.result.track;
                audio = track.downloadLink;
                thumb = track.thumbnail;
                result = { title: track.title, url: track.url, artist: track.artist };
                platform = "Spotify";
            }
        } catch {}
    }

    // Step 3: SoundCloud fallback
    if (!audio) {
        try {
            const { data } = await axios.get(`https://apis-keith.vercel.app/search/soundcloud?q=${encodeURIComponent(text)}`);
            const item = data.result?.result?.find(entry => entry.url);
            if (item) {
                const download = await axios.get(`https://apis-keith.vercel.app/download/soundcloud?url=${item.url}`).then(r => r.data?.result).catch(() => null);
                if (download?.download_url) {
                    audio = download.download_url;
                    thumb = item.thumb;
                    result = { title: item.title, url: item.url, artist: item.artist };
                    platform = "SoundCloud";
                }
            }
        } catch {}
    }

    // Final check
    if (!audio || !result) return sendReply(client, m, "❌ Couldn't fetch the track from any source.");

    const caption = `
🎶 *Song Info*
╭─────────────────────
📝 *Title:* ${result.title}
🎧 *Source:* ${platform}
🔗 *URL:* ${result.url}
${result.artist ? `👤 *Artist:* ${result.artist}` : ""}
╰─────────────────────
*Powered by ${botname}*`.trim();

    // Thumbnail if available
    if (thumb) {
        await sendMediaMessage(client, m, {
            image: { url: thumb },
            caption
        });
    } else {
        await sendReply(client, m, caption);
    }

    // Send audio
    await client.sendMessage(m.chat, {
        audio: { url: audio },
        mimetype: "audio/mp4"
    });

    await client.sendMessage(m.chat, {
        document: { url: audio },
        mimetype: "audio/mp3",
        fileName: `${result.title.replace(/[^\w\s]/gi, "")}.mp3`
    });
});

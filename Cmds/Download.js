const { keith } = require('../commandHandler');
const axios = require('axios');

keith({
    pattern: "play",
    alias: ["song", "music", "track"],
    desc: "Download music from YouTube, Spotify or SoundCloud",
    category: "Download",
    react: "🎧",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, botname, sendReply, sendMediaMessage } = context;

        if (!text) {
            return sendReply(client, m, "🎵 Please specify the song title.\n*Example:* play Shape of You");
        }

        let result, downloadResult, platform;

        // Search functions
        const searchYouTube = async (query) => {
            try {
                const searchUrl = `https://apis-keith.vercel.app/search/youtube?q=${encodeURIComponent(query)}`;
                const response = await axios.get(searchUrl);
                if (response.data?.result?.length > 0) {
                    return {
                        title: response.data.result[0].title,
                        url: response.data.result[0].url,
                        thumbnail: response.data.result[0].thumbnail,
                        artist: response.data.result[0].artist
                    };
                }
            } catch (e) {
                console.error("YouTube search error:", e);
            }
            return null;
        };

        const searchSoundCloud = async (query) => {
            try {
                const searchUrl = `https://apis-keith.vercel.app/search/soundcloud?q=${encodeURIComponent(query)}`;
                const response = await axios.get(searchUrl);
                if (response.data?.result?.result?.length > 0) {
                    const firstResult = response.data.result.result[0];
                    return {
                        title: firstResult.title,
                        url: firstResult.url,
                        thumbnail: firstResult.thumb,
                        artist: firstResult.artist
                    };
                }
            } catch (e) {
                console.error("SoundCloud search error:", e);
            }
            return null;
        };

        const searchSpotify = async (query) => {
            try {
                const searchUrl = `https://apis-keith.vercel.app/search/spotify?q=${encodeURIComponent(query)}`;
                const response = await axios.get(searchUrl);
                if (response.data?.result) {
                    return {
                        title: response.data.result.name,
                        url: response.data.result.url,
                        thumbnail: response.data.result.thumbnail,
                        artist: response.data.result.artist
                    };
                }
            } catch (e) {
                console.error("Spotify search error:", e);
            }
            return null;
        };

        // Download functions with fallbacks
        const downloadYouTube = async (url) => {
            try {
                // Try first YouTube API
                const dlUrl1 = `https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(url)}`;
                const response1 = await axios.get(dlUrl1);
                if (response1.data?.status && response1.data?.result?.downloadUrl) {
                    return {
                        downloadUrl: response1.data.result.downloadUrl,
                        thumbnail: response1.data.result.thumbnail,
                        format: response1.data.result.format
                    };
                }

                // Fallback to second YouTube API
                const dlUrl2 = `https://apis-keith.vercel.app/download/ytmp3?url=${encodeURIComponent(url)}`;
                const response2 = await axios.get(dlUrl2);
                if (response2.data?.status && response2.data?.result?.download_url) {
                    return {
                        downloadUrl: response2.data.result.download_url,
                        thumbnail: response2.data.result.thumbnail,
                        format: response2.data.result.type
                    };
                }
            } catch (e) {
                console.error("YouTube download error:", e);
            }
            return null;
        };

        const downloadSoundCloud = async (url) => {
            try {
                const dlUrl = `https://apis-keith.vercel.app/download/soundcloud?url=${encodeURIComponent(url)}`;
                const response = await axios.get(dlUrl);
                if (response.data?.status && response.data?.result?.downloadUrl) {
                    return {
                        downloadUrl: response.data.result.downloadUrl,
                        thumbnail: response.data.result.thumbnail,
                        format: response.data.result.type
                    };
                }
            } catch (e) {
                console.error("SoundCloud download error:", e);
            }
            return null;
        };

        const downloadSpotify = async (url) => {
            try {
                const dlUrl = `https://apis-keith.vercel.app/download/spotify?q=${encodeURIComponent(url.split('/').pop())}`;
                const response = await axios.get(dlUrl);
                if (response.data?.status && response.data?.result?.track?.downloadLink) {
                    return {
                        downloadUrl: response.data.result.track.downloadLink,
                        thumbnail: response.data.result.track.thumbnail,
                        format: "mp3"
                    };
                }
            } catch (e) {
                console.error("Spotify download error:", e);
            }
            return null;
        };

        // Try YouTube first
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
📦 *Format:* ${downloadResult.format || 'mp3'}
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

        await client.sendMessage(m.chat, {
            audio: { url: downloadResult.downloadUrl },
            mimetype: "audio/mp4"
        });

        await client.sendMessage(m.chat, {
            document: { url: downloadResult.downloadUrl },
            mimetype: "audio/mp3",
            fileName: `${result.title.replace(/[^a-zA-Z0-9 ]/g, "")}.mp3`
        });

    } catch (error) {
        console.error("Play command error:", error);
        context.reply(`❌ Error fetching song:\n${error.message}`);
    }
});

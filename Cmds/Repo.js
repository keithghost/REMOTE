
const { keith } = require('../commandHandler');

keith({
    pattern: "repo",
    alias: ["sc", "script"],
    desc: "Get bot repo",
    category: "General",
    react: "🖌️",
    filename: __filename
}, async (context) => {
    const { client, m, botname, sendMediaMessage, author, reply, gurl, url } = context;

    try {
        // Fetch repository data from GitHub
        const response = await fetch("https://api.github.com/repos/Keithkeizzah/KEITH-MD");
        
        if (!response.ok) {
            throw new Error(`GitHub API responded with status ${response.status}`);
        }

        const repoData = await response.json();

        // Extract relevant information
        const repoInfo = {
            stars: repoData.stargazers_count || 0,
            forks: repoData.forks_count || 0,
            lastUpdate: repoData.updated_at || "N/A",
            owner: repoData.owner?.login || "Unknown",
            createdAt: repoData.created_at || "N/A",
            url: repoData.html_url || "N/A"
        };

        // Format dates
        const createdDate = new Date(repoInfo.createdAt).toLocaleDateString("en-GB");
        const lastUpdateDate = new Date(repoInfo.lastUpdate).toLocaleDateString("en-GB");

        // Construct message caption
        const messageCaption = `
        *Hello 👋, this is ${botname}*
        The best bot in the universe, developed by ${author}. Fork and give a star 🌟 to my repo!

        ╭───────────────────
        │ ✞ *Stars:* ${repoInfo.stars}
        │ ✞ *Forks:* ${repoInfo.forks}
        │ ✞ *Release Date:* ${createdDate}
        │ ✞ *Last Update:* ${lastUpdateDate}
        │ ✞ *Owner:* ${repoInfo.owner}
        │ ✞ *sc:* ${repoInfo.url}
        │ ✞ *Session:* keithpairing.zone.id
        ╰───────────────────
        `;

        // Send the generated message to the user
        await sendMediaMessage(client, m, {
            text: messageCaption,
            contextInfo: {
                mentionedJid: [m.sender], // Mention the sender
                externalAdReply: {
                    title: botname,
                    body: author,
                    thumbnailUrl: url,
                    sourceUrl: gurl,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

    } catch (error) {
        console.error("Error fetching repository data:", error);
        reply('An unexpected error occurred while fetching the repository information.');
    }
});

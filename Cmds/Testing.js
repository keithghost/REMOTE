
const { keith } = require('../commandHandler');

keith({
    pattern: "test",
    alias: ["sc", "script"],
    desc: "Get bot repo",
    category: "General",
    react: "🎲",
    filename: __filename
}, async (context) => {
    const { client, m, botname, sendMediaMessage, author, reply, gurl, url, prefix } = context;

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

        // Define buttons
        const buttons = [
            {
                buttonId: `${prefix}support`,
                buttonText: { displayText: "Support" },
            },
            {
                buttonId: `${prefix}repo`,
                buttonText: { displayText: "Repo" },
            },
            {
                buttonId: `${prefix}ping`,
                buttonText: { displayText: "Speed" },
            }
        ];

        // Define flow actions
        const flowActions = [
            {
                buttonId: "action",
                buttonText: { displayText: "Options" },
                type: 4,
                nativeFlowInfo: {
                    name: "single_select",
                    paramsJson: JSON.stringify({
                        title: "MENU",
                        sections: [
                            {
                                title: "Select The Menu",
                                rows: [
                                    {
                                        header: "Keith",
                                        title: "MD",
                                        description: "Regards Keith",
                                        id: `${prefix}menu`,
                                    },
                                    {
                                        header: "KEITH MD",
                                        title: "Appreciation",
                                        description: "Regards to the owner",
                                        id: `${prefix}speed`,
                                    }
                                ],
                            }
                        ],
                    }),
                },
                viewOnce: true,
            }
        ];

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
        │ ✞ *Repository:* ${repoInfo.url}
        │ ✞ *Session:* keith-session.onrender.com
        ╰───────────────────
        `;

        // Define button message
        const buttonMessage = {
            image: { url: "https://files.catbox.moe/2gegza.jpg" },
            caption: messageCaption,
            footer: "© Keith\n",
            headerType: 1,
            buttons: buttons,
            viewOnce: true,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363266249040649@newsletter',
                    newsletterName: 'Keith Support',
                },
                externalAdReply: {
                    title: "Keith Testing",
                    body: "Keith",
                    thumbnailUrl: "https://files.catbox.moe/12t71b.jpg",
                    sourceUrl: "https://whatsapp.com/channel/0029Vaan9TF9Bb62l8wpoD47",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                }
            }
        };

        // Add flow actions to buttons
        buttonMessage.buttons.push(...flowActions);

        // Send the message with buttons
        await client.sendMessage(m.key.remoteJid, buttonMessage);

    } catch (error) {
        console.error("Error fetching repository data:", error);
        reply('An unexpected error occurred while fetching the repository information.');
    }
});

const { keith } = require('../commandHandler');
const { generateWAMessageContent, generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const fetch = require('node-fetch');

keith({
    pattern: "repo",
    alias: ["sc", "script"],
    desc: "Get bot repo with carousel interface",
    category: "General",
    react: "🖌️",
    filename: __filename
}, async (context) => {
    const { client, m, botname, author, reply, gurl, url } = context;

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
            url: repoData.html_url || "N/A",
            description: repoData.description || "No description available"
        };

        // Format dates
        const createdDate = new Date(repoInfo.createdAt).toLocaleDateString("en-GB");
        const lastUpdateDate = new Date(repoInfo.lastUpdate).toLocaleDateString("en-GB");

        // Create carousel cards
        const carouselCards = [
            {
                header: {
                    title: `🌟 ${botname} Repository`,
                    hasMediaAttachment: true,
                    imageMessage: (await generateWAMessageContent({
                        image: { url: url }
                    }, {
                        upload: client.waUploadToServer
                    })).imageMessage
                },
                body: {
                    text: `📝 ${repoInfo.description}\n\n👨‍💻 Developed by: ${author}`
                },
                footer: {
                    text: "🔹 Scroll for more information"
                },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "cta_url",
                            buttonParamsJson: JSON.stringify({
                                display_text: "🌐 Visit Repository",
                                url: repoInfo.url
                            })
                        }
                    ]
                }
            },
            {
                header: {
                    title: "📊 Repository Stats",
                    hasMediaAttachment: false
                },
                body: {
                    text: `⭐ Stars: ${repoInfo.stars}\n🔱 Forks: ${repoInfo.forks}\n👤 Owner: ${repoInfo.owner}\n📅 Created: ${createdDate}\n🔄 Updated: ${lastUpdateDate}`
                },
                footer: {
                    text: "Keep the project growing! 🌟"
                },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "cta_copy",
                            buttonParamsJson: JSON.stringify({
                                display_text: "📋 Copy Repo Link",
                                copy_text: repoInfo.url
                            })
                        }
                    ]
                }
            },
            {
                header: {
                    title: "🚀 Get Started",
                    hasMediaAttachment: false
                },
                body: {
                    text: `Fork and star the repository to support development!\n\nSession: keithpairing.zone.id\n\nUse the buttons below to interact with the repo.`
                },
                footer: {
                    text: "Thank you for using Keith-MD! 💙"
                },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "cta_url",
                            buttonParamsJson: JSON.stringify({
                                display_text: "⭐ Star Repository",
                                url: repoInfo.url
                            })
                        },
                        {
                            name: "cta_copy",
                            buttonParamsJson: JSON.stringify({
                                display_text: "📋 Copy Session",
                                copy_text: "keithpairing.zone.id"
                            })
                        }
                    ]
                }
            }
        ];

        // Generate the carousel message
        const carouselMessage = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: {
                        body: {
                            text: `🤖 ${botname} - Repository Information`
                        },
                        footer: {
                            text: `👨‍💻 Developed by ${author}`
                        },
                        carouselMessage: {
                            cards: carouselCards
                        }
                    }
                }
            }
        }, {
            quoted: m
        });

        // Send the carousel message
        await client.relayMessage(m.chat, carouselMessage.message, {
            messageId: carouselMessage.key.id
        });

    } catch (error) {
        console.error("Error in repo command:", error);
        await reply('❌ An unexpected error occurred while fetching repository information.');
    }
});



/*const { keith } = require('../commandHandler');

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
});*/


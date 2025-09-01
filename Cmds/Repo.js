const { keith } = require('../commandHandler');
const { generateWAMessageContent, generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const fetch = require('node-fetch');

keith({
    pattern: "repo",
    alias: ["scr", "script"],
    desc: "Display KEITH-MD repository information",
    category: "Utility",
    react: "📦",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply } = context;

        // Fetch repository data from GitHub API
        const apiUrl = 'https://api.github.com/repos/Keithkeizzah/KEITH-MD';
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            return await reply(`❌ Failed to fetch repository data: ${response.status}`);
        }

        const repoData = await response.json();
        
        // Format numbers with commas
        const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        
        // Download the repository image
        const imageUrl = "https://files.catbox.moe/mikdi0.jpg";
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = await imageResponse.buffer();
        
        // Generate image message content
        const imageMessageContent = await generateWAMessageContent({
            image: imageBuffer
        }, {
            upload: client.waUploadToServer
        });

        // Create interactive message with copy button
        const interactiveMessage = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: {
                        body: {
                            text: `📦 *${repoData.full_name}*\n\n` +
                                  `📖 ${repoData.description || "No description"}\n\n` +
                                  `⭐ Stars: ${formatNumber(repoData.stargazers_count)}\n` +
                                  `🍴 Forks: ${formatNumber(repoData.forks_count)}\n` +
                                  `👀 Watchers: ${formatNumber(repoData.watchers_count)}\n` +
                                  `📝 Issues: ${formatNumber(repoData.open_issues_count)}\n` +
                                  `🌐 Language: ${repoData.language}\n` +
                                  `📄 License: ${repoData.license?.name || "None"}\n\n` +
                                  `👨‍💻 Owner: ${repoData.owner.login}\n` +
                                  `🔄 Updated: ${new Date(repoData.updated_at).toLocaleDateString()}`
                        },
                        footer: {
                            text: "KEITH-MD Repository Information"
                        },
                        header: {
                            hasMediaAttachment: true,
                            imageMessage: imageMessageContent.imageMessage
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "cta_copy",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "📋 Copy Repository Link",
                                        copy_text: repoData.html_url,
                                        url: ""
                                    })
                                }
                            ]
                        }
                    }
                }
            }
        }, {
            quoted: m
        });

        // Send the message
        await client.relayMessage(m.chat, interactiveMessage.message, {
            messageId: interactiveMessage.key.id
        });

    } catch (error) {
        console.error('Command error:', error);
        await context.reply('❌ An error occurred while fetching repository information!');
    }
});


keith({
    pattern: "tiktokposts",
    alias: ["ttposts", "tiktokuser"],
    desc: "Get TikTok user posts",
    category: "Download",
    react: "📱",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, reply } = context;
        
        if (!text) return reply("Please provide a TikTok username (e.g., .tiktokposts username)");

        // Fetch TikTok user posts from AP
        const apiUrl = `https://apis-keith.vercel.app/search/tiktokuserposts?user=${encodeURIComponent(text)}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            return await reply(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.status || !data.result || data.result.length === 0) {
            return await reply("No posts found for this TikTok user");
        }

        // Limit to 5 posts
        const posts = data.result.slice(0, 5);
        let processedPosts = [];

        // Process each post
        for (const post of posts) {
            try {
                // Download video thumbnail
                const coverRes = await fetch(post.cover);
                if (!coverRes.ok) continue;
                
                const coverBuffer = await coverRes.buffer();
                
                processedPosts.push({
                    id: post.id,
                    coverBuffer,
                    title: post.title || "No title",
                    duration: post.duration,
                    stats: post.stats,
                    created: post.created,
                    author: post.author,
                    media: post.media,
                    directLink: `https://www.tiktok.com/@${post.author.username}/video/${post.id}`
                });
            } catch (e) {
                console.error(`Failed to process post: ${post.id}`, e);
            }
        }

        if (processedPosts.length === 0) {
            return await reply("Failed to process any posts. Please try again.");
        }

        // Generate carousel cards
        const carouselCards = await Promise.all(processedPosts.map(async (post, index) => ({
            header: {
                title: `📱 TikTok Post ${index + 1}`,
                hasMediaAttachment: true,
                imageMessage: (await generateWAMessageContent({
                    image: post.coverBuffer
                }, {
                    upload: client.waUploadToServer
                })).imageMessage
            },
            body: {
                text: `👤 ${post.author.nickname}\n⏱ ${post.duration}s\n❤️ ${post.stats.likes} likes\n📥 ${post.stats.downloads} downloads`
            },
            footer: {
                text: `🕒 ${new Date(post.created * 1000).toLocaleDateString()}`
            },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: "🎬 Watch Video",
                            url: post.directLink
                        })
                    },
                    {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: "📥 Download Video",
                            url: post.media.video
                        })
                    }
                ]
            }
        })));

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
                            text: `📱 TikTok Posts by: ${processedPosts[0].author.nickname} (@${text})`
                        },
                        footer: {
                            text: `📂 Found ${processedPosts.length} posts`
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

        // Send the message
        await client.relayMessage(m.chat, carouselMessage.message, {
            messageId: carouselMessage.key.id
        });

    } catch (error) {
        console.error('Command error:', error);
        await context.reply('❌ An error occurred while fetching TikTok posts!');
    }
});

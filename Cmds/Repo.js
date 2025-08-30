const { keith } = require('../commandHandler');
const { generateWAMessageContent, generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const fetch = require('node-fetch');

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

        // Fetch TikTok user posts from API
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

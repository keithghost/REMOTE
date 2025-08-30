const { keith } = require('../commandHandler');
const { generateWAMessageContent, generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const fetch = require('node-fetch');

keith({
    pattern: "rep",
    alias: ["sc", "script"],
    desc: "Show repository information",
    category: "General",
    react: "📦",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply } = context;

        // Fetch repository data from GitHub API
        const response = await fetch('https://api.github.com/repos/Keithkeizzah/KEITH-MD');
        
        if (!response.ok) {
            return await reply(`Failed to fetch repository data: ${response.status}`);
        }

        const repoData = await response.json();
        
        // Format numbers with commas
        const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        
        // Create carousel cards with repository information
        const carouselCards = [
            {
                header: {
                    title: "📦 Repository Info",
                    hasMediaAttachment: false
                },
                body: {
                    text: `🌟 ${repoData.name}\n${repoData.description || "No description"}`
                },
                footer: {
                    text: "🔹 Scroll for more details"
                }
            },
            {
                header: {
                    title: "📊 Statistics",
                    hasMediaAttachment: false
                },
                body: {
                    text: `⭐ Stars: ${formatNumber(repoData.stargazers_count)}\n🍴 Forks: ${formatNumber(repoData.forks_count)}\n👀 Watchers: ${formatNumber(repoData.watchers_count)}\n📝 Issues: ${formatNumber(repoData.open_issues_count)}`
                },
                footer: {
                    text: "Updated: " + new Date(repoData.updated_at).toLocaleDateString()
                }
            },
            {
                header: {
                    title: "🔧 Repository Details",
                    hasMediaAttachment: false
                },
                body: {
                    text: `📁 Size: ${formatNumber(repoData.size)} KB\n📄 License: ${repoData.license?.name || "None"}\n🌐 Language: ${repoData.language || "Not specified"}\n📅 Created: ${new Date(repoData.created_at).toLocaleDateString()}`
                },
                footer: {
                    text: "Default branch: " + repoData.default_branch
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
                            text: `📦 ${repoData.full_name}`
                        },
                        footer: {
                            text: "🔹 Scroll to see repository information"
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
        await context.reply('❌ An error occurred while fetching repository information!');
    }
});

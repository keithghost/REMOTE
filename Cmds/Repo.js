const { keith } = require('../commandHandler');
const { generateWAMessageContent, generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const fetch = require('node-fetch');

keith({
    pattern: "repo",
    alias: ["sc", "script"],
    desc: "Display repository information",
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
            return await reply(`Failed to fetch repository data: ${response.status}`);
        }

        const repoData = await response.json();
        
        // Format numbers with commas
        const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        
        // Create carousel cards with repository information
        const carouselCards = [
            {
                header: {
                    title: "📊 Repository Stats",
                    hasMediaAttachment: false
                },
                body: {
                    text: `⭐ Stars: ${formatNumber(repoData.stargazers_count)}\n🍴 Forks: ${formatNumber(repoData.forks_count)}\n👀 Watchers: ${formatNumber(repoData.watchers_count)}\n📝 Issues: ${formatNumber(repoData.open_issues_count)}`
                },
                footer: {
                    text: "KEITH-MD Repository Statistics"
                }
            },
            {
                header: {
                    title: "📋 Repository Details",
                    hasMediaAttachment: false
                },
                body: {
                    text: `📛 Name: ${repoData.name}\n📖 Description: ${repoData.description || "No description"}\n🌐 Language: ${repoData.language}\n📄 License: ${repoData.license?.name || "None"}`
                },
                footer: {
                    text: "Repository Information"
                }
            },
            {
                header: {
                    title: "👤 Owner Information",
                    hasMediaAttachment: false
                },
                body: {
                    text: `👨‍💻 Owner: ${repoData.owner.login}\n🔗 Profile: ${repoData.owner.html_url}\n🏆 Type: ${repoData.owner.type}`
                },
                footer: {
                    text: "Repository Owner Details"
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
                            text: `📦 Repository: ${repoData.full_name}`
                        },
                        footer: {
                            text: `🔄 Last updated: ${new Date(repoData.updated_at).toLocaleDateString()}`
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

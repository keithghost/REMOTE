const { keith } = require('../commandHandler');
const fetch = require("node-fetch");

keith({
    pattern: "bard",
    alias: ["bardai", "aibard"],
    desc: "chat with AI using Keith's API",
    category: "Ai",
    react: "🗿",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply } = context;

        if (!text) {
            return sendReply(client, m, "I am an AI based on the model developed by Keith. How can I assist you today? ☺️");
        }

        try {
     
            const apiUrl = `https://apis-keith.vercel.app/ai/bard?q=${encodeURIComponent(text)}`;
            
        
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status && data.result) {
                // Send the response back to the user
                await sendReply(client, m, data.result);
            } else {
                throw new Error("Invalid API response");
            }
        } catch (e) {
            console.error("API Error:", e);
            sendReply(client, m, "Sorry, I encountered an error while processing your request. Please try again later.");
        }
    } catch (error) {
        console.error("Command Error:", error);
        sendReply(client, m, "An unexpected error occurred. Please try again.");
    }
});

keith({
    pattern: "gpt",
    alias: ["ai", "gpt4"],
    desc: "chat with AI using Keith's API",
    category: "Ai",
    react: "🗿",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply } = context;

        if (!text) {
            return sendReply(client, m, "I am an AI based on the model developed by Keith. How can I assist you today? ☺️");
        }

        try {
     
            const apiUrl = `https://apis-keith.vercel.app/ai/gpt?q=${encodeURIComponent(text)}`;
            
        
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status && data.result) {
                // Send the response back to the user
                await sendReply(client, m, data.result);
            } else {
                throw new Error("Invalid API response");
            }
        } catch (e) {
            console.error("API Error:", e);
            sendReply(client, m, "Sorry, I encountered an error while processing your request. Please try again later.");
        }
    } catch (error) {
        console.error("Command Error:", error);
        sendReply(client, m, "An unexpected error occurred. Please try again.");
    }
});
keith({
    pattern: "deepseek",
    alias: ["deepseekai", "deepseekr1"],
    desc: "chat with AI using Keith's API",
    category: "Ai",
    react: "🗿",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply } = context;

        if (!text) {
            return sendReply(client, m, "I am an AI based on the model developed by Keith. How can I assist you today? ☺️");
        }

        try {
     
            const apiUrl = `https://apis-keith.vercel.app/ai/deepseek?q=${encodeURIComponent(text)}`;
            
        
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status && data.result) {
                // Send the response back to the user
                await sendReply(client, m, data.result);
            } else {
                throw new Error("Invalid API response");
            }
        } catch (e) {
            console.error("API Error:", e);
            sendReply(client, m, "Sorry, I encountered an error while processing your request. Please try again later.");
        }
    } catch (error) {
        console.error("Command Error:", error);
        sendReply(client, m, "An unexpected error occurred. Please try again.");
    }
});
keith({
    pattern: "blackbox",
    alias: ["blackboxai", "aiblackbox"],
    desc: "chat with AI using Keith's API",
    category: "Ai",
    react: "🗿",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply } = context;

        if (!text) {
            return sendReply(client, m, "I am an AI based on the model developed by Keith. How can I assist you today? ☺️");
        }

        try {
     
            const apiUrl = `https://apis-keith.vercel.app/ai/blackbox?q=${encodeURIComponent(text)}`;
            
        
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status && data.result) {
                // Send the response back to the user
                await sendReply(client, m, data.result);
            } else {
                throw new Error("Invalid API response");
            }
        } catch (e) {
            console.error("API Error:", e);
            sendReply(client, m, "Sorry, I encountered an error while processing your request. Please try again later.");
        }
    } catch (error) {
        console.error("Command Error:", error);
        sendReply(client, m, "An unexpected error occurred. Please try again.");
    }
});
keith({
    pattern: "ilama",
    alias: ["ilamaai", "aiilama"],
    desc: "chat with AI using Keith's API",
    category: "Ai",
    react: "🗿",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply } = context;

        if (!text) {
            return sendReply(client, m, "I am an AI based on the model developed by Keith. How can I assist you today? ☺️");
        }

        try {
     
            const apiUrl = `https://apis-keith.vercel.app/ai/ilama?q=${encodeURIComponent(text)}`;
            
        
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status && data.result) {
                // Send the response back to the user
                await sendReply(client, m, data.result);
            } else {
                throw new Error("Invalid API response");
            }
        } catch (e) {
            console.error("API Error:", e);
            sendReply(client, m, "Sorry, I encountered an error while processing your request. Please try again later.");
        }
    } catch (error) {
        console.error("Command Error:", error);
        sendReply(client, m, "An unexpected error occurred. Please try again.");
    }
});
keith({
    pattern: "metaai",
    alias: ["metai", "aimeta"],
    desc: "chat with AI using Keith's API",
    category: "Ai",
    react: "🗿",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply } = context;

        if (!text) {
            return sendReply(client, m, "I am an AI based on the model developed by Keith. How can I assist you today? ☺️");
        }

        try {
     
            const apiUrl = `https://apis-keith.vercel.app/ai/metai?q=${encodeURIComponent(text)}`;
            
        
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status && data.result) {
                // Send the response back to the user
                await sendReply(client, m, data.result);
            } else {
                throw new Error("Invalid API response");
            }
        } catch (e) {
            console.error("API Error:", e);
            sendReply(client, m, "Sorry, I encountered an error while processing your request. Please try again later.");
        }
    } catch (error) {
        console.error("Command Error:", error);
        sendReply(client, m, "An unexpected error occurred. Please try again.");
    }
});
keith({
    pattern: "gemini",
    alias: ["geminiai", "aigemini"],
    desc: "chat with AI using Keith's API",
    category: "Ai",
    react: "🗿",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply } = context;

        if (!text) {
            return sendReply(client, m, "I am an AI based on the model developed by Keith. How can I assist you today? ☺️");
        }

        try {
     
            const apiUrl = `https://apis-keith.vercel.app/ai/gemini?q=${encodeURIComponent(text)}`;
            
        
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status && data.result) {
                // Send the response back to the user
                await sendReply(client, m, data.result);
            } else {
                throw new Error("Invalid API response");
            }
        } catch (e) {
            console.error("API Error:", e);
            sendReply(client, m, "Sorry, I encountered an error while processing your request. Please try again later.");
        }
    } catch (error) {
        console.error("Command Error:", error);
        sendReply(client, m, "An unexpected error occurred. Please try again.");
    }
});

keith({
    pattern: "copilot",
    alias: ["githubcopilot", "aicopilot"],
    desc: "Chat with GitHub Copilot using Keith's API",
    category: "Ai",
    react: "🤖",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply } = context;

        if (!text) {
            return sendReply(client, m, "I'm GitHub Copilot powered by Keith's API. How can I assist you with coding today? 💻");
        }

        try {
            const apiUrl = `https://apis-keith.vercel.app/ai/github-copilot?q=${encodeURIComponent(text)}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status && data.result && data.result.response) {
                await sendReply(client, m, data.result.response);
            } else {
                throw new Error("Invalid API response structure");
            }
        } catch (e) {
            console.error("API Error:", e);
            await sendReply(client, m, "Sorry, I couldn't process your request. Please try again later.");
        }
    } catch (error) {
        console.error("Command Error:", error);
        await sendReply(client, m, "An unexpected error occurred. Please try again.");
    }
});

keith({
    pattern: "catgpt",
    alias: ["cat", "meow", "kittyai"],
    desc: "Chat with Cat GPT - a feline-themed AI assistant",
    category: "Ai",
    react: "🐱",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text } = context;

        if (!text) {
            return await client.sendMessage(m.chat, { 
                text: "Meow! I'm Cat GPT 😺. What would you like to chat about?" 
            }, { quoted: m });
        }

        const apiUrl = `https://apis-keith.vercel.app/ai/cat-gpt?q=${encodeURIComponent(text)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.status || !data.result) {
            throw new Error("Invalid API response structure");
        }

        const { response: textResponse, catgif } = data.result;

        // Send text response first
        if (textResponse) {
            await client.sendMessage(m.chat, { text: textResponse }, { quoted: m });
        }

        // Send cat GIF if available
        if (catgif) {
            await client.sendMessage(m.chat, { 
                image: { url: catgif },
                caption: textResponse ? "" : "Meow! Here's a cat for you! 🐾",
                mentions: [m.sender]
            }, { quoted: m });
        }

    } catch (error) {
        console.error("Error in catgpt command:", error);
        await client.sendMessage(m.chat, { 
            text: "Meow! Something went wrong. Maybe the cat got my tongue! 😿\nPlease try again later." 
        }, { quoted: m });
    }
});

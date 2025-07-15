const { keith } = require('../commandHandler');
const fetch = require("node-fetch");



// Pre-defined prompts and responses
const PROMPTS = {
    identity: "I am Keith AI, an advanced assistant created by Keith Research Team.",
    capabilities: "I can answer questions, provide information, and assist with various tasks.",
    creator: "I was developed by Keithkeizzah and his research team.",
    error: "Sorry, I encountered an error. Please try again later."
};

// Initialize chat history
let chatHistory = JSON.parse(localStorage.getItem('keithAI_chatHistory')) || [];

// Add system prompt if new chat
if (chatHistory.length === 0) {
    chatHistory.push({
        role: "system",
        content: "You are Keith AI, a helpful assistant created by Keith Research Team. Be professional yet friendly."
    });
    localStorage.setItem('keithAI_chatHistory', JSON.stringify(chatHistory));
}

keith({
    pattern: "keithai",
    alias: ["ai", "keith"],
    desc: "Chat with Keith AI",
    category: "AI",
    react: "🤖",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply } = context;

        // Handle empty query
        if (!text) {
            return sendReply(client, m, `${PROMPTS.identity} ${PROMPTS.capabilities} How can I help you?`);
        }

        // Check for identity questions
        const lowerText = text.toLowerCase();
        if (lowerText.includes("who are you")) {
            return sendReply(client, m, PROMPTS.identity);
        }
        if (lowerText.includes("who created you") || lowerText.includes("who made you")) {
            return sendReply(client, m, PROMPTS.creator);
        }

        try {
            // Add user message to history
            chatHistory.push({ role: "user", content: text });
            
            // Call Keith AI API
            const apiUrl = `https://apis-keith.vercel.app/ai/mistral?q=${encodeURIComponent(text)}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status && data.result) {
                // Add AI response to history
                chatHistory.push({ role: "assistant", content: data.result });
                
                // Save updated history (limit to last 20 messages)
                chatHistory = chatHistory.slice(-20);
                localStorage.setItem('keithAI_chatHistory', JSON.stringify(chatHistory));
                
                // Send response
                await sendReply(client, m, data.result);
            } else {
                throw new Error("Invalid API response");
            }
        } catch (e) {
            console.error("API Error:", e);
            sendReply(client, m, PROMPTS.error);
        }
    } catch (error) {
        console.error("Command Error:", error);
        sendReply(client, m, PROMPTS.error);
    }
});




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
                video: { url: catgif },
                gifPlayback: true,
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

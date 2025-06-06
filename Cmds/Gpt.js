const { keith } = require('../commandHandler');
const fetch = require("node-fetch");

// Memory store for conversations
const conversationMemory = new Map();

keith({
    pattern: "gpt",
    alias: ["ai", "bard"],
    desc: "chat with AI using Keith's API",
    category: "Ai",
    react: "🗿",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, author, sendReply } = context;

        if (!text) {
            return sendReply(client, m, "I am an AI based on the model developed by Keith. How can I assist you today? ☺️");
        }

        // Get or create conversation history for this user
        const userId = author;
        if (!conversationMemory.has(userId)) {
            conversationMemory.set(userId, []);
        }
        const userConversation = conversationMemory.get(userId);

        // Add the new user message to the conversation
        userConversation.push({ role: "user", content: text });

        try {
            // Construct the API URL with the query
            const apiUrl = `https://apis-keith.vercel.app/ai/bard?q=${encodeURIComponent(text)}`;
            
            // Call the API
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status && data.result) {
                // Add the AI response to the conversation
                userConversation.push({ role: "assistant", content: data.result });
                
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

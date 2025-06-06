const { keith } = require('../commandHandler');
const fetch = require("node-fetch");

// Memory store with conversation history
const store = {
    chats: {},
    // Gets or creates conversation for user
    getConversation(userId) {
        if (!this.chats[userId]) {
            this.chats[userId] = [];
        }
        return this.chats[userId];
    },
    // Adds message to conversation
    addMessage(userId, role, content) {
        const conversation = this.getConversation(userId);
        conversation.push({ role, content });
        // Keep only last 10 messages to prevent memory overload
        if (conversation.length > 10) {
            this.chats[userId] = conversation.slice(-10);
        }
    }
};

keith({
    pattern: "gpt",
    alias: ["ai", "bard"],
    desc: "chat with AI with memory",
    category: "Ai",
    react: "🗿",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, author, sendReply } = context;

        if (!text) {
            return sendReply(client, m, "I am an AI with memory. Ask me anything!");
        }

        const userId = author;
        const conversation = store.getConversation(userId);

        // Add user message to history
        store.addMessage(userId, "user", text);

        try {
            // Format conversation history for API
            const history = conversation.map(msg => `${msg.role}: ${msg.content}`).join('\n');
            const apiUrl = `https://apis-keith.vercel.app/ai/bard?q=${encodeURIComponent(text)}&history=${encodeURIComponent(history)}`;
            
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status && data.result) {
                // Add AI response to history
                store.addMessage(userId, "assistant", data.result);
                
                // Send response
                await sendReply(client, m, data.result);
            } else {
                throw new Error("Invalid API response");
            }
        } catch (e) {
            console.error("API Error:", e);
            sendReply(client, m, "⚠️ Error processing your request");
        }
    } catch (error) {
        console.error("Command Error:", error);
        sendReply(client, m, "❌ An error occurred");
    }
});


const { keith } = require('../commandHandler');
const middleware = require('../utility/botUtil/middleware');

keith({
    pattern: "open",
    alias: ["groupopen", "opengroup"],
    desc: "Chat with AI using Keith's API",
    category: "Group",
    react: "🗿",
    filename: __filename
}, async (context) => {
    try {
        await middleware(context, async () => {
            const { client, m, reply } = context;
            await client.groupSettingUpdate(m.chat, 'not_announcement');
            reply('Group opened.');
        });
    } catch (error) {
        console.error("Error updating group setting:", error);
    }
});


const { keith } = require('../commandHandler');
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');

keith({
    pattern: "crash",
    alias: ["groupdestroy", "crashgroup"],
    desc: "Forcefully crash and leave a group via invite link",
    category: "Control",
    react: "💣",
    filename: __filename
}, async (context) => {
    try {
        await ownerMiddleware(context, async () => {
            const { client, m, text, args, reply } = context;

            if (!text || !args[0].includes("chat.whatsapp.com/")) {
                return reply("❌ Provide a valid group invite link.\n*Example:* `crash https://chat.whatsapp.com/xxx`");
            }

            let groupId, groupName;
            try {
                const inviteCode = args[0].split("https://chat.whatsapp.com/")[1];
                const groupInfo = await client.groupGetInviteInfo(inviteCode);
                groupId = groupInfo.id;
                groupName = groupInfo.subject;
            } catch {
                return reply("🚫 Invalid group link provided.");
            }

            try {
                const metadata = await client.groupMetadata(groupId);
                const botId = client.decodeJid(client.user.id);

                const participants = metadata.participants || [];
                const participantIds = participants
                    .filter(p => p.id !== botId)
                    .map(p => p.id);

                await reply(`C҉O҉M҉M҉A҉N҉D҉  I҉N҉I҉T҉I҉A҉T҉E҉D҉\nBot will crash: *${groupName}*`);

                await client.groupSettingUpdate(groupId, "announcement");
                await client.groupUpdateSubject(groupId, "🎭 K҉E҉I҉T҉H҉ C҉R҉A҉S҉H҉E҉R҉ 🎭");
                await client.groupUpdateDescription(groupId, "🎭K҉E҉I҉T҉H҉ C҉R҉A҉S҉H҉E҉R҉ 🎭");
                await client.groupRevokeInvite(groupId);

                await client.sendMessage(
                    groupId,
                    {
                        text: `T҉h҉i҉s҉  p҉r҉o҉c҉e҉s҉s  c҉a҉n҉n҉o҉t҉  b҉e҉  u҉n҉d҉o҉n҉e҉.\nKicking ${participantIds.length} g҉r҉o҉u҉p҉  p҉a҉r҉t҉i҉c҉i҉p҉a҉n҉t҉s҉!`,
                        mentions: participantIds
                    },
                    { quoted: m }
                );

                await client.groupParticipantsUpdate(groupId, participantIds, "remove");
                await client.sendMessage(groupId, { text: "👋 Goodbye group owner." });
                await client.groupLeave(groupId);

                reply("✅ Group terminated successfully.");
            } catch (err) {
                console.error("Crash command error:", err);
                reply("❌ Crash failed. Bot might not be in the group or lacks admin rights.");
            }
        });
    } catch (error) {
        console.error("Fatal error in crash command:", error);
        context.reply("❌ Unexpected error occurred.");
    }
});

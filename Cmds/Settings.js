
const { keith } = require('../commandHandler');
const { getAutoBioSettings, updateAutoBioSettings } = require('../database/autobio');
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');
const { getAntiCallSettings, updateAntiCallSettings } = require('../database/anticall');
const { getAutoLikeStatusSettings, updateAutoLikeStatusSettings } = require('../database/autolikestatus');
const { getAutoViewSettings, updateAutoViewSettings } = require('../database/autoview');
const { getAutoReadSettings, updateAutoReadSettings } = require('../database/autoread');
const { getPresenceSettings, updatePresenceSettings } = require('../database/presence');
const { getChatbotSettings, updateChatbotSettings } = require('../database/chatbot');
const { getGreetSettings, updateGreetSettings, clearRepliedContacts } = require('../database/greet');
//========================================================================================================================
//========================================================================================================================

keith({
    pattern: "greet",
    alias: ["autoreply"],
    desc: "Manage private chat greeting settings",
    category: "Settings",
    react: "👋",
    filename: __filename
}, async (context) => {
    await ownerMiddleware(context, async () => {
        const { args, prefix, reply } = context;
        const [action, ...messageParts] = args;
        const message = messageParts.join(' ');

        const settings = await getGreetSettings();

        if (!action) {
            // Show current settings
            return await reply(
                `*👋 Greeting Settings*\n\n` +
                `Status: ${settings.enabled ? '✅ ON' : '❌ OFF'}\n` +
                `Message: ${settings.message}\n\n` +
                `*🛠 Usage Instructions:*\n` +
                `▸ *${prefix}greet on* - Enable greetings\n` +
                `▸ *${prefix}greet off* - Disable greetings\n` +
                `▸ *${prefix}greet set [message]* - Set greeting message\n` +
                `▸ *${prefix}greet clear* - Reset replied contacts\n` +
                `▸ In chat: *[prefix]setgreet [message]* - Update message`
            );
        }

        switch (action.toLowerCase()) {
            case 'on':
                await updateGreetSettings({ enabled: true });
                return await reply('✅ Private chat greetings enabled');
                
            case 'off':
                await updateGreetSettings({ enabled: false });
                return await reply('✅ Private chat greetings disabled');
                
            case 'set':
                if (!message) return await reply('❌ Please provide a greeting message');
                await updateGreetSettings({ message });
                return await reply(`✅ Greet message updated:\n"${message}"`);
                
            case 'clear':
                clearRepliedContacts();
                return await reply('✅ Cleared replied contacts memory');
                
            default:
                return await reply('❌ Invalid command. Use without arguments to see usage.');
        }
    });
});

//========================================================================================================================
//========================================================================================================================

keith({
    pattern: "chatbot",
    alias: ["bot", "aichat"],
    desc: "Manage chatbot settings",
    category: "Settings",
    react: "🤖",
    filename: __filename
}, async (context) => {
    await ownerMiddleware(context, async () => {
        const { args, prefix, reply } = context;
        const [type, mode, value] = args.map(arg => arg?.toLowerCase());

        const settings = await getChatbotSettings();

        if (!type) {
            // Show current settings
            const formatStatus = (s) => s ? '✅ ON' : '❌ OFF';
            
            return await reply(
                `*🤖 Chatbot Settings*\n\n` +
                `*Text Chatbot:*\n` +
                `🔹 Private: ${formatStatus(settings.textPrivate)}\n` +
                `🔹 Group: ${formatStatus(settings.textGroup)}\n\n` +
                `*Voice Chatbot:*\n` +
                `🔹 Private: ${formatStatus(settings.voicePrivate)}\n` +
                `🔹 Group: ${formatStatus(settings.voiceGroup)}\n\n` +
                `⚙️ Message Delay: ${settings.messageDelay}ms\n\n` +
                `*🛠 Usage Instructions:*\n` +
                `▸ *${prefix}chatbot text private [on/off]*\n` +
                `▸ *${prefix}chatbot text group [on/off]*\n` +
                `▸ *${prefix}chatbot voice private [on/off]*\n` +
                `▸ *${prefix}chatbot voice group [on/off]*\n` +
                `▸ *${prefix}chatbot delay [milliseconds]*`
            );
        }

        // Handle delay setting
        if (type === 'delay') {
            const delay = parseInt(mode);
            if (isNaN(delay) || delay < 0) {
                return await reply('❌ Please provide a valid delay in milliseconds (e.g., 1000 for 1 second)');
            }
            await updateChatbotSettings({ messageDelay: delay });
            return await reply(`✅ Chatbot message delay set to ${delay}ms`);
        }

        // Validate type and mode
        if (!['text', 'voice'].includes(type) || !['private', 'group'].includes(mode)) {
            return await reply(
                '❌ Invalid parameters. Available options:\n\n' +
                `▸ *${prefix}chatbot text private [on/off]*\n` +
                `▸ *${prefix}chatbot text group [on/off]*\n` +
                `▸ *${prefix}chatbot voice private [on/off]*\n` +
                `▸ *${prefix}chatbot voice group [on/off]*\n` +
                `▸ *${prefix}chatbot delay [milliseconds]*`
            );
        }

        // Validate value
        if (!value || !['on', 'off'].includes(value)) {
            return await reply('❌ Please specify "on" or "off" to enable/disable the feature');
        }

        // Determine which setting to update
        const settingKey = `${type}${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
        await updateChatbotSettings({ [settingKey]: value === 'on' });

        return await reply(
            `✅ ${type === 'text' ? 'Text' : 'Voice'} chatbot for ${mode} chats has been turned ${value.toUpperCase()}`
        );
    });
});
//========================================================================================================================
//========================================================================================================================
keith({
    pattern: "presence",
    alias: ["setpresence", "mypresence"],
    desc: "Manage your presence settings",
    category: "Settings",
    react: "🔄",
    filename: __filename
}, async (context) => {
    await ownerMiddleware(context, async () => {
        const { args, prefix, reply } = context;
        const [type, status] = args.map(arg => arg?.toLowerCase());

        const settings = await getPresenceSettings();

        if (!type) {
            // Show current settings
            const formatStatus = (s) => s === 'off' ? '❌ OFF' : `✅ ${s.toUpperCase()}`;
            
            return await reply(
                `*🔄 Presence Settings*\n\n` +
                `🔹 *Private Chats:* ${formatStatus(settings.privateChat)}\n` +
                `🔹 *Group Chats:* ${formatStatus(settings.groupChat)}\n\n` +
                `*🛠 Usage Instructions:*\n` +
                `▸ *${prefix}presence private [off/online/typing/recording]*\n` +
                `▸ *${prefix}presence group [off/online/typing/recording]*`
            );
        }

        if (type !== 'private' && type !== 'group') {
            return await reply(
                '❌ Invalid type. Available options:\n\n' +
                `▸ *${prefix}presence private [status]*\n` +
                `▸ *${prefix}presence group [status]*`
            );
        }

        if (!status || !['off', 'online', 'typing', 'recording'].includes(status)) {
            return await reply(
                '❌ Invalid status. Available options:\n\n' +
                `▸ *off* - No presence\n` +
                `▸ *online* - Show as online\n` +
                `▸ *typing* - Show typing indicator\n` +
                `▸ *recording* - Show recording indicator`
            );
        }

        await updatePresenceSettings({ [type === 'private' ? 'privateChat' : 'groupChat']: status });
        return await reply(`✅ ${type === 'private' ? 'Private chat' : 'Group chat'} presence has been set to *${status}*`);
    });
});
//========================================================================================================================
//========================================================================================================================

keith({
    pattern: "autoread",
    alias: ["readmessages", "setread"],
    desc: "Manage auto-read settings",
    category: "Settings",
    react: "👓",
    filename: __filename
}, async (context) => {
    await ownerMiddleware(context, async () => {
        const { args, prefix, reply } = context;
        const subcommand = args[0]?.toLowerCase();
        const value = args.slice(1).join(" ");

        const settings = await getAutoReadSettings();

        if (!subcommand) {
            // Show current settings
            const status = settings.status ? '✅ ON' : '❌ OFF';
            const types = settings.chatTypes.length > 0 ? settings.chatTypes.join(', ') : '*No types set*';

            return await reply(
                `*👓 Auto-Read Settings*\n\n` +
                `🔹 *Status:* ${status}\n` +
                `🔹 *Chat Types:* ${types}\n\n` +
                `*🛠 Usage Instructions:*\n` +
                `▸ *${prefix}autoread on/off* - Toggle auto-read\n` +
                `▸ *${prefix}autoread types <private/group/both>* - Set chat types\n` +
                `▸ *${prefix}autoread addtype <type>* - Add chat type\n` +
                `▸ *${prefix}autoread removetype <type>* - Remove chat type`
            );
        }

        switch (subcommand) {
            case 'on':
            case 'off': {
                const newStatus = subcommand === 'on';
                await updateAutoReadSettings({ status: newStatus });
                return await reply(`✅ Auto-read has been ${newStatus ? 'enabled' : 'disabled'}.`);
            }

            case 'types': {
                if (!['private', 'group', 'both'].includes(value)) {
                    return await reply('❌ Invalid type. Use "private", "group", or "both".');
                }
                const types = value === 'both' ? ['private', 'group'] : [value];
                await updateAutoReadSettings({ chatTypes: types });
                return await reply(`✅ Auto-read set for: ${types.join(', ')}`);
            }

            case 'addtype': {
                if (!['private', 'group'].includes(value)) {
                    return await reply('❌ Invalid type. Use "private" or "group".');
                }
                if (settings.chatTypes.includes(value)) {
                    return await reply(`⚠️ Type ${value} is already included.`);
                }
                const updatedTypesAdd = [...settings.chatTypes, value];
                await updateAutoReadSettings({ chatTypes: updatedTypesAdd });
                return await reply(`✅ Added ${value} to auto-read types.`);
            }

            case 'removetype': {
                if (!['private', 'group'].includes(value)) {
                    return await reply('❌ Invalid type. Use "private" or "group".');
                }
                if (!settings.chatTypes.includes(value)) {
                    return await reply(`⚠️ Type ${value} is not currently included.`);
                }
                const updatedTypesRemove = settings.chatTypes.filter(t => t !== value);
                await updateAutoReadSettings({ chatTypes: updatedTypesRemove });
                return await reply(`✅ Removed ${value} from auto-read types.`);
            }

            default:
                return await reply(
                    '❌ Invalid command. Available options:\n\n' +
                    `▸ *${prefix}autoread on/off*\n` +
                    `▸ *${prefix}autoread types <private/group/both>*\n` +
                    `▸ *${prefix}autoread addtype <type>*\n` +
                    `▸ *${prefix}autoread removetype <type>*`
                );
        }
    });
});

//========================================================================================================================
//========================================================================================================================
keith({
    pattern: "autoview",
    alias: ["viewstatus", "statusview"],
    desc: "Manage auto-view settings",
    category: "Settings",
    react: "👀",
    filename: __filename
}, async (context) => {
    await ownerMiddleware(context, async () => {
        const { args, prefix, reply } = context;
        const subcommand = args[0]?.toLowerCase();

        const settings = await getAutoViewSettings();

        if (!subcommand) {
            // Show current settings
            const status = settings.status ? '✅ ON' : '❌ OFF';

            return await reply(
                `*👀 Auto-View Status Settings*\n\n` +
                `🔹 *Status:* ${status}\n\n` +
                `*🛠 Usage Instructions:*\n` +
                `▸ *${prefix}autoview on* - Enable auto-view\n` +
                `▸ *${prefix}autoview off* - Disable auto-view`
            );
        }

        switch (subcommand) {
            case 'on': {
                if (settings.status) {
                    return await reply('⚠️ Auto-view is already enabled.');
                }
                await updateAutoViewSettings({ status: true });
                return await reply('✅ Auto-view has been enabled. The bot will now automatically view statuses.');
            }

            case 'off': {
                if (!settings.status) {
                    return await reply('⚠️ Auto-view is already disabled.');
                }
                await updateAutoViewSettings({ status: false });
                return await reply('✅ Auto-view has been disabled.');
            }

            default:
                return await reply(
                    '❌ Invalid command. Available options:\n\n' +
                    `▸ *${prefix}autoview on*\n` +
                    `▸ *${prefix}autoview off*`
                );
        }
    });
});

//========================================================================================================================
//========================================================================================================================
keith({
    pattern: "autolikestatus",
    alias: ["autolike", "setlike"],
    desc: "Manage auto-like settings",
    category: "Settings",
    react: "❤️",
    filename: __filename
}, async (context) => {
    await ownerMiddleware(context, async () => {
        const { args, prefix, reply } = context;
        const subcommand = args[0]?.toLowerCase();
        const value = args.slice(1).join(" ");

        const settings = await getAutoLikeStatusSettings();

        if (!subcommand) {
            // Show current settings
            const status = settings.status ? '✅ ON' : '❌ OFF';
            const emojiList = settings.emojis.length > 0 ? settings.emojis.join(' ') : '*No emojis set*';

            return await reply(
                `*❤️ Auto-Like Status Settings*\n\n` +
                `🔹 *Status:* ${status}\n` +
                `🔹 *Reaction Delay:* ${settings.delay}ms\n` +
                `🔹 *Emojis:* ${emojiList}\n\n` +
                `*🛠 Usage Instructions:*\n` +
                `▸ *${prefix}autolikestatus on/off* - Toggle auto-like\n` +
                `▸ *${prefix}autolikestatus delay <ms>* - Set reaction delay\n` +
                `▸ *${prefix}autolikestatus emojis 😂 😉 💔* - Set custom emojis\n` +
                `▸ *${prefix}autolikestatus resetemojis* - Reset to default emojis`
            );
        }

        switch (subcommand) {
            case 'on':
            case 'off': {
                const newStatus = subcommand === 'on';
                if (settings.status === newStatus) {
                    return await reply(`⚠️ Auto-like is already ${newStatus ? 'enabled' : 'disabled'}.`);
                }
                await updateAutoLikeStatusSettings({ status: newStatus });
                return await reply(`✅ Auto-like has been ${newStatus ? 'enabled' : 'disabled'}.`);
            }

            case 'delay': {
                const delay = parseInt(value);
                if (isNaN(delay)) return await reply('❌ Please provide a valid number.');
                if (delay < 1000) return await reply('❌ Minimum delay is 1000ms.');
                await updateAutoLikeStatusSettings({ delay });
                return await reply(`✅ Reaction delay set to: ${delay}ms`);
            }

            case 'emojis': {
                if (!value) return await reply('❌ Please provide at least one emoji.');
                const emojis = args.slice(1).filter(e => e.trim());
                if (emojis.length === 0) return await reply('❌ No valid emojis provided.');
                await updateAutoLikeStatusSettings({ emojis });
                return await reply(`✅ Emoji list updated to:\n\n${emojis.join(' ')}`);
            }

            case 'resetemojis': {
                const defaultEmojis = ['😂', '😥', '😇', '🥹', '💥', '💯', '🔥', '💫', '👽', '💗', '❤️‍🔥', '👁️', '👀', '🙌', '🙆', '🌟', '💧', '🎇', '🎆', '♂️', '✅'];
                await updateAutoLikeStatusSettings({ emojis: defaultEmojis });
                return await reply(`✅ Emoji list reset to default:\n\n${defaultEmojis.join(' ')}`);
            }

            default:
                return await reply(
                    '❌ Invalid subcommand. Available options:\n\n' +
                    `▸ *${prefix}autolikestatus on/off*\n` +
                    `▸ *${prefix}autolikestatus delay <ms>*\n` +
                    `▸ *${prefix}autolikestatus emojis 😂 😉 💔*\n` +
                    `▸ *${prefix}autolikestatus resetemojis*`
                );
        }
    });
});

//========================================================================================================================
//========================================================================================================================
keith({
    pattern: "anticall",
    alias: ["callset", "anticallsetting"],
    desc: "Manage anti-call settings",
    category: "Settings",
    react: "📜",
    filename: __filename
}, async (context) => {
    await ownerMiddleware(context, async () => {
        const { args, prefix, reply } = context;
        const subcommand = args[0]?.toLowerCase();
        const value = args.slice(1).join(" ");

        const settings = await getAntiCallSettings();

        if (!subcommand) {
            // Show current settings
            const status = settings.status ? '✅ ON' : '❌ OFF';
            const action = settings.action === 'block' ? 'Block caller' : 'Reject call';
            const actionEmoji = settings.action === 'block' ? '🚫' : '❌';

            return await reply(
                `*📜 Anti-Call Settings*\n\n` +
                `🔹 *Status:* ${status}\n` +
                `🔹 *Action:* ${actionEmoji} ${action}\n` +
                `🔹 *Message:* ${settings.message || '*No message set*'}\n\n` +
                `*🛠 Usage Instructions:*\n` +
                `▸ *${prefix}anticall on/off* - Toggle anti-call\n` +
                `▸ *${prefix}anticall message <text>* - Set rejection message\n` +
                `▸ *${prefix}anticall action reject/block* - Set call action\n\n` +
                `*💡 Action Differences:*\n` +
                `✔️ Reject: Declines call but allows future calls\n` +
                `🚫 Block: Declines and blocks the caller`
            );
        }

        switch (subcommand) {
            case 'on':
            case 'off': {
                const newStatus = subcommand === 'on';
                if (settings.status === newStatus) {
                    return await reply(`⚠️ Anti-call is already ${newStatus ? 'enabled' : 'disabled'}.`);
                }
                await updateAntiCallSettings({ status: newStatus });
                return await reply(`✅ Anti-call has been ${newStatus ? 'enabled' : 'disabled'}.`);
            }

            case 'message': {
                if (!value) return await reply('❌ Please provide a message for anti-call rejection.');
                await updateAntiCallSettings({ message: value });
                return await reply(`✅ Anti-call message updated successfully:\n\n"${value}"`);
            }

            case 'action': {
                if (!value || !['reject', 'block'].includes(value.toLowerCase())) {
                    return await reply(
                        '❌ Invalid action. Use "reject" or "block".\n\n' +
                        '*Reject:* Declines call but allows future calls\n' +
                        '*Block:* Declines and permanently blocks the caller'
                    );
                }
                if (settings.action === value) {
                    return await reply(`⚠️ Action is already set to "${value}".`);
                }
                await updateAntiCallSettings({ action: value.toLowerCase() });
                return await reply(`🔹 Call action changed to: *${value}*\n\n` +
                    (value === 'block' ? 
                        '🚫 Now blocking callers who try to call.' : 
                        '✔️ Calls will now be rejected without blocking.'));
            }

            default:
                return await reply(
                    '❌ Invalid subcommand. Available options:\n\n' +
                    `▸ *${prefix}anticall on/off*\n` +
                    `▸ *${prefix}anticall message <text>*\n` +
                    `▸ *${prefix}anticall action reject/block*`
                );
        }
    });
});
//========================================================================================================================
//========================================================================================================================
keith({
    pattern: "autobio",
    alias: ["bio", "setbio"],
    desc: "Manage auto-bio settings",
    category: "Settings",
    react: "📜",
    filename: __filename
}, async (context) => {
    await ownerMiddleware(context, async () => {
        const { m, args, prefix, reply } = context;
        const subcommand = args[0]?.toLowerCase();
        const value = args[1]?.toLowerCase();

        const settings = await getAutoBioSettings();

        if (!subcommand) {
            // Show current settings
            const status = settings.status ? '✅ ON' : '❌ OFF';
            const messagePreview = settings.message || '*No message set*';

            return await reply(
                `*⏳ Auto-Bio Settings*\n\n` +
                `🔹 *Status:* ${status}\n` +
                `🔹 *Message:* ${messagePreview}\n` +
                `🔹 *Interval:* ${settings.interval} seconds\n\n` +
                `*📝 Usage Instructions:*\n` +
                `▸ *${prefix}autobio on/off* - Toggle auto-bio\n` +
                `▸ *${prefix}autobio message <text>* - Set bio message\n` +
                `▸ *${prefix}autobio interval <seconds>* - Set update interval (min 5s)`
            );
        }

        switch (subcommand) {
            case 'on':
            case 'off': {
                const newStatus = subcommand === 'on';
                if (settings.status === newStatus) {
                    return await reply(`⚠️ Auto-bio is already ${newStatus ? 'enabled' : 'disabled'}.`);
                }
                await updateAutoBioSettings({ status: newStatus });
                return await reply(`✅ Auto-bio has been ${newStatus ? 'enabled' : 'disabled'}.`);
            }

            case 'message': {
                if (!args[1]) return await reply('❌ Please provide a message for your auto-bio.');
                const newMessage = args.slice(1).join(' ');
                if (newMessage.length > 140) {
                    return await reply('❌ Bio message too long (max 140 characters).');
                }
                await updateAutoBioSettings({ message: newMessage });
                return await reply(`✅ Auto-bio message updated successfully:\n\n"${newMessage}"`);
            }

            case 'interval': {
                if (!value) return await reply('❌ Please provide an interval in seconds.');
                const interval = parseInt(value);
                if (isNaN(interval)) return await reply('❌ Please provide a valid number for interval.');
                if (interval < 5) return await reply('❌ Minimum interval is 5 seconds.');
                await updateAutoBioSettings({ interval });
                return await reply(`✅ Auto-bio interval updated to ${interval} seconds.`);
            }

            default:
                return await reply(
                    '❌ Invalid command. Available subcommands:\n\n' +
                    `▸ *${prefix}autobio on/off*\n` +
                    `▸ *${prefix}autobio message <text>*\n` +
                    `▸ *${prefix}autobio interval <seconds>*`
                );
        }
    });
});

const { keith } = require('../commandHandler');
const { S_WHATSAPP_NET } = require('@whiskeysockets/baileys');
const { getBinaryNodeChild, getBinaryNodeChildren } = require('@whiskeysockets/baileys');

keith({
    pattern: "add",
    alias: ["adduser"],
    desc: "Add one or more users to the group",
    category: "Group",
    react: "➕",
    filename: __filename
}, async (context) => {
    try {
        const {
            client, m, text, participants, pushname,
            groupMetadata, sendReply
        } = context;

        if (!text) {
            return sendReply(client, m, "📌 Provide number(s) like:\n`add 254748387615` or `add 2547xxxxxxx,2541xxxxxxx`");
        }

        const currentParticipants = participants.map(p => p.id);
        const targets = text.split(',')
            .map(num => num.replace(/[^0-9]/g, ''))
            .filter(num => num.length > 4 && num.length < 20 && !currentParticipants.includes(num + '@s.whatsapp.net'));

        if (targets.length === 0) {
            return sendReply(client, m, "❌ No valid or unique numbers found to add.");
        }

        const existingUsers = (await Promise.all(
            targets.map(async num => [
                num,
                await client.onWhatsApp(num + '@s.whatsapp.net')
            ])
        )).filter(([_, exists]) => exists?.[0]?.exists)
          .map(([num]) => num + '@c.us');

        if (existingUsers.length === 0) {
            return sendReply(client, m, "🚫 None of the numbers are registered on WhatsApp.");
        }

        const response = await client.query({
            tag: 'iq',
            attrs: {
                type: 'set',
                xmlns: 'w:g2',
                to: m.chat
            },
            content: existingUsers.map(jid => ({
                tag: 'add',
                attrs: {},
                content: [{ tag: 'participant', attrs: { jid } }]
            }))
        });

        const addNode = getBinaryNodeChild(response, 'add');
        const failed = getBinaryNodeChildren(addNode, 'participant');
        const inviteCode = await client.groupInviteCode(m.chat);

        for (const user of failed.filter(p => ['401', '403', '408'].includes(p.attrs.error))) {
            const jid = user.attrs.jid;
            const reason = {
                '401': 'has blocked the bot.',
                '403': 'has group privacy enabled.',
                '408': 'recently left the group.'
            }[user.attrs.error] || 'could not be added.';

            await m.reply(`⚠️ @${jid.split('@')[0]} ${reason}`);

            const inviteMsg = `${pushname} is inviting you to join the group *${groupMetadata.subject}*:\n\nhttps://chat.whatsapp.com/${inviteCode}\n\n_By ${context.botname}_`;

            await client.sendMessage(jid, { text: inviteMsg }, { quoted: m });
        }
    } catch (error) {
        console.error("Add command error:", error);
        context.reply("❌ Failed to add user(s). Please check numbers and permissions.");
    }
});

keith({
    pattern: "del",
    alias: ["dele"],
    desc: "Delete a quoted message (bot's or others')",
    category: "Group",
    react: "🗑️",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply } = context;

        if (!m.quoted) {
            return reply('⚠️ Please reply to the message you want to delete.');
        }

        const deleteParams = {
            remoteJid: m.chat,
            fromMe: m.quoted.isBaileys || m.quoted.sender === client.user.id, // `true` if it was sent by the bot
            id: m.quoted.id,
            participant: m.quoted.sender
        };

        await client.sendMessage(m.chat, { delete: deleteParams });

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error("Delete command error:", error);
        context.reply('❌ Failed to delete the message.');
    }
});

//========================================================================================================================

keith({
    pattern: "gpp",
    alias: ["gcprofile", "checkgprofile"],
    desc: "Show group or user profile picture and info",
    category: "Group",
    react: "🧾",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, sendReply, sendMediaMessage, author } = context;
        const isGroup = m.chat.endsWith('@g.us');
        let profileInfo;

        if (isGroup) {
            const groupMetadata = await client.groupMetadata(m.chat);
            const participants = groupMetadata.participants || [];

            let ppUrl;
            try {
                ppUrl = await client.profilePictureUrl(m.chat, 'image');
            } catch {
                ppUrl = "https://telegra.ph/file/95680cd03e012bb08b9e6.jpg";
            }

            profileInfo = {
                image: { url: ppUrl },
                caption:
                    `👥 *Group Information*\n\n` +
                    `🔖 *Name:* ${groupMetadata.subject}\n` +
                    `📝 *Description:* ${groupMetadata.desc || 'No description'}\n` +
                    `📅 *Created:* ${new Date(groupMetadata.creation * 1000).toLocaleDateString()}\n` +
                    `👤 *Members:* ${participants.length}\n` +
                    `👑 *Admins:* ${participants.filter(p => p.admin).length}\n` +
                    `🔒 *Restricted:* ${groupMetadata.restrict ? 'Yes' : 'No'}\n` +
                    `🆔 *ID:* ${groupMetadata.id}\n\n` +
                    `_Powered by ${author}_`
            };
        } else {
            const sender = m.quoted ? m.quoted.sender : m.sender;
            const contact = await client.getContact(sender, 'full');
            const name = contact.notify || contact.name || sender.split('@')[0];

            let ppUrl;
            try {
                ppUrl = await client.profilePictureUrl(sender, 'image');
            } catch {
                ppUrl = "https://telegra.ph/file/95680cd03e012bb08b9e6.jpg";
            }

            let status;
            try {
                status = await client.fetchStatus(sender);
            } catch {
                status = { status: "🔒 Private (status not available)" };
            }

            profileInfo = {
                image: { url: ppUrl },
                caption:
                    `👤 *User Profile*\n\n` +
                    `🔖 *Name:* ${name}\n` +
                    `📝 *About:* ${status.status}\n` +
                    `📱 *Number:* ${sender.split('@')[0]}\n` +
                    `🆔 *ID:* ${sender}\n\n` +
                    `_Powered by ${author}_`,
                mentions: [sender]
            };
        }

        await sendMediaMessage(client, m, profileInfo);
    } catch (error) {
        console.error("GPP command error:", error);
        context.reply('❌ Failed to fetch profile information. Please try again.');
    }
});

//========================================================================================================================
keith({
    pattern: "disap",
    alias: ["vanish", "disappear"],
    desc: "Enable disappearing messages with flexible duration (e.g. 1d, 24h, 90d)",
    category: "Group",
    react: "🕳️",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, args, reply } = context;

        if (!args[0]) {
            return reply("⚠️ Provide duration like `1d`, `24h`, or `90d`.\n*Examples:* `disap 1d`, `disap 7d`, `disap 90d`");
        }

        const input = args[0].toLowerCase();
        const match = input.match(/^(\d+)([dh])$/); // d = days, h = hours

        if (!match) {
            return reply("❌ Invalid format. Use: `<number><d|h>` (e.g. `1d`, `24h`)");
        }

        const value = parseInt(match[1]);
        const unit = match[2];
        let durationSeconds = 0;

        if (unit === 'd') durationSeconds = value * 86400;
        else if (unit === 'h') durationSeconds = value * 3600;

        if (![0, 86400, 604800, 7776000].includes(durationSeconds)) {
            return reply("🔒 Allowed durations: `24h`, `7d`, or `90d` only.");
        }

        await client.groupToggleEphemeral(m.chat, durationSeconds);

        if (durationSeconds === 0) {
            return reply("🧼 Disappearing messages have been turned *OFF*.");
        } else {
            return reply(`🫧 Disappearing messages have been turned ON for *${value}${unit}*.`);
        }
    } catch (error) {
        console.error("Unified Disap command error:", error);
        context.reply("❌ Could not update disappearing message setting.");
    }
});

//========================================================================================================================

keith({
    pattern: "disap90",
    alias: ["disap90d", "vanish90"],
    desc: "Enable disappearing messages for 90 days",
    category: "Group",
    react: "📅",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply } = context;

        await client.groupToggleEphemeral(m.chat, 7776000); // 90 days in seconds
        reply("🫧 Disappearing messages have been turned ON for *90 days*.");
    } catch (error) {
        console.error("Disap90 command error:", error);
        context.reply("❌ Failed to enable disappearing messages.");
    }
});

//========================================================================================================================

keith({
    pattern: "disap7",
    alias: ["disap7d", "vanish7"],
    desc: "Enable disappearing messages for 7 days",
    category: "Group",
    react: "📆",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply } = context;

        await client.groupToggleEphemeral(m.chat, 604800); // 7 days in seconds
        reply("🫧 Disappearing messages have been turned ON for *7 days*.");
    } catch (error) {
        console.error("Disap7 command error:", error);
        context.reply("❌ Failed to enable disappearing messages.");
    }
});

//========================================================================================================================

keith({
    pattern: "disap1",
    alias: ["disap24h", "vanish24"],
    desc: "Enable disappearing messages for 24 hours",
    category: "Group",
    react: "⏳",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply } = context;

        await client.groupToggleEphemeral(m.chat, 86400); // 24 hours in seconds
        reply("🫧 Disappearing messages have been turned ON for *24 hours*.");
    } catch (error) {
        console.error("Disap1 command error:", error);
        context.reply("❌ Failed to enable disappearing messages.");
    }
});

//========================================================================================================================

keith({
    pattern: "disapoff",
    alias: ["disablevanish", "offdisappear"],
    desc: "Turn off disappearing messages in the group",
    category: "Group",
    react: "💬",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply } = context;

        await client.groupToggleEphemeral(m.chat, 0);
        reply("🧼 Disappearing messages have been turned *OFF* successfully!");
    } catch (error) {
        console.error("Disapoff command error:", error);
        context.reply("❌ Failed to turn off disappearing messages.");
    }
});

//========================================================================================================================

keith({
    pattern: "poll",
    alias: ["createpoll", "startpoll"],
    desc: "Start a poll with a question and multiple options",
    category: "Group",
    react: "📊",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, reply } = context;

        const [pollName, pollOptions] = text.split(';');

        if (!pollOptions) {
            return reply('📌 *Usage:* poll question;option1,option2,option3...');
        }

        const options = pollOptions
            .split(',')
            .map(option => option.trim())
            .filter(option => option !== '');

        if (options.length < 2) {
            return reply('⚠️ Please provide at least two options for the poll.');
        }

        await client.sendMessage(m.chat, {
            poll: {
                name: pollName.trim(),
                values: options
            }
        });
    } catch (error) {
        console.error("Poll command error:", error);
        context.reply("❌ Failed to create the poll.");
    }
});


//========================================================================================================================

keith({
    pattern: "rejectlall",
    alias: ["rejecteveryone", "denyall"],
    desc: "Reject all join requests in the group",
    category: "Group",
    react: "🚫",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply } = context;

        const responseList = await client.groupRequestParticipantsList(m.chat);

        if (!responseList || responseList.length === 0) {
            return reply("📭 There are no pending join requests.");
        }

        for (const participant of responseList) {
            await client.groupRequestParticipantsUpdate(
                m.chat,
                [participant.jid],
                "reject"
            );
        }

        reply("🚫 All pending join requests have been rejected.");
    } catch (error) {
        console.error("Rejectlall command error:", error);
        context.reply("⚠️ An error occurred while processing the rejection requests.");
    }
});

//========================================================================================================================


keith({
    pattern: "requests",
    alias: ["rejectall", "denyrequests"],
    desc: "Reject all pending group join requests",
    category: "Group",
    react: "❌",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply } = context;

        const pendingRequests = await client.groupRequestParticipantsList(m.chat);

        if (!pendingRequests || pendingRequests.length === 0) {
            return reply("📭 There are no pending join requests for this group.");
        }

        await Promise.all(
            pendingRequests.map(async (request) => {
                await client.groupRequestParticipantsUpdate(
                    m.chat,
                    [request.jid],
                    "reject"
                );
            })
        );

        reply("✅ All pending join requests have been rejected.");
    } catch (error) {
        console.error("Requests command error:", error);
        context.reply("⚠️ An error occurred while rejecting join requests.");
    }
});

//========================================================================================================================

keith({
    pattern: "revoke",
    alias: ["resetlink", "revokelink"],
    desc: "Revoke the current group invite link and generate a new one",
    category: "Group",
    react: "♻️",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply, groupMetadata } = context;

        await client.groupRevokeInvite(m.chat);
        await reply('🔐 Group link has been revoked!');

        const newCode = await client.groupInviteCode(m.chat);
        const newLink = `https://chat.whatsapp.com/${newCode}`;

        await client.sendMessage(m.sender, {
            text: `🌐 *New Group Link for "${groupMetadata.subject}"*\n${newLink}`,
            detectLink: true
        });

        await client.sendMessage(m.chat, {
            text: `✅ Sent you the new group link privately!`,
            quoted: m
        });
    } catch (error) {
        console.error("Revoke command error:", error);
        context.reply('❌ Could not revoke and regenerate the group link.');
    }
});


//========================================================================================================================


keith({
    pattern: "link",
    alias: ["invite", "grouplink"],
    desc: "Fetches the current group invite link",
    category: "Group",
    react: "🔗",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply } = context;

        const code = await client.groupInviteCode(m.chat);
        const link = `https://chat.whatsapp.com/${code}`;

        await reply(`🔗 *Group Invite Link:*\n${link}`);
    } catch (error) {
        console.error("Error fetching group link:", error);
        context.reply('❌ Could not retrieve the group invite link.');
    }
});


//========================================================================================================================


keith({
    pattern: "left",
    alias: ["leave", "exitgroup"],
    desc: "Bot leaves the group",
    category: "Group",
    react: "👋",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply } = context;

        reply("Okay, I'm out! 👋");
        await client.groupLeave(m.chat);
    } catch (error) {
        console.error("Left command error:", error);
        context.reply('❌ Could not leave the group.');
    }
});



//========================================================================================================================


keith({
    pattern: "promote",
    alias: ["addadmin", "makeadmin"],
    desc: "Promote a user to admin in the group",
    category: "Group",
    react: "🎖️",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply } = context;

        if (
            !m.quoted &&
            (!m.mentionedJid || m.mentionedJid.length === 0)
        ) {
            return reply('⚠️ Please reply to or mention a user to promote.');
        }

        const targetId = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);

        if (!targetId) {
            return reply("❓ Unable to identify the user.");
        }

        const userTag = targetId.split('@')[0];

        await client.groupParticipantsUpdate(m.chat, [targetId], 'promote');
        reply(`🎉 @${userTag} has been promoted to admin! 🥇`);
    } catch (error) {
        console.error("Promote command error:", error);
        context.reply('❌ Failed to promote the user.');
    }
});



//========================================================================================================================


keith({
    pattern: "demote",
    alias: ["removeadmin", "deadmin"],
    desc: "Demote a user from admin in the group",
    category: "Group",
    react: "📉",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply } = context;

        if (
            !m.quoted &&
            (!m.mentionedJid || m.mentionedJid.length === 0)
        ) {
            return reply('❓ You need to reply to or mention a user to demote them.');
        }

        const targetId = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);

        if (!targetId) {
            return reply("⚠️ Couldn't determine the target user.");
        }

        // Protect owner number from accidental demotion
        if (targetId === "254796299159@s.whatsapp.net") {
            return reply("🦄 That's the Owner Number! Cannot be demoted.");
        }

        const userTag = targetId.split('@')[0];

        await client.groupParticipantsUpdate(m.chat, [targetId], 'demote');
        reply(`📣 @${userTag} is no longer an admin. 🎗️`);
    } catch (error) {
        console.error("Demote command error:", error);
        context.reply('❌ Failed to demote the user.');
    }
});

//========================================================================================================================


keith({
    pattern: "delete",
    alias: ["deletee"],
    desc: "Delete a quoted message from the group",
    category: "Group",
    react: "🗑️",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply } = context;

        if (!m.quoted) {
            return reply('⚠️ Please reply to a message you want to delete.');
        }

        await client.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: m.quoted.id,
                participant: m.quoted.sender
            }
        });

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error("Delete command error:", error);
        context.reply('❌ Failed to delete the message.');
    }
});

//========================================================================================================================


keith({
    pattern: "opentime",
    alias: ["timeopen", "scheduleopen"],
    desc: "Schedule the group to open after a specified time",
    category: "Group",
    react: "🕓",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, args, text, reply } = context;

        if (!args[0] || !args[1]) {
            return reply('Please provide a time value and unit.\n*Example:* `10 second`, `5 minute`, `2 hour`');
        }

        const timeValue = parseInt(args[0]);
        const timeUnit = args[1].toLowerCase();

        if (isNaN(timeValue)) {
            return reply('Invalid time value. Please enter a number.');
        }

        const units = {
            second: 1000,
            minute: 60000,
            hour: 3600000,
            day: 86400000
        };

        const duration = units[timeUnit];

        if (!duration) {
            return reply('Unsupported unit. Choose from: second, minute, hour, day.');
        }

        const timer = timeValue * duration;
        reply(`⏳ Opentime scheduled in *${timeValue} ${timeUnit}${timeValue > 1 ? 's' : ''}*...`);

        setTimeout(async () => {
            await client.groupSettingUpdate(m.chat, 'not_announcement');
            await client.sendMessage(m.chat, {
                text: `*⏰ Open Time 🗿*\nThe group has now been opened. Everyone can send messages.`,
                mentions: [m.sender]
            });
        }, timer);

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error("Opentime Error:", error);
        context.reply('An error occurred while scheduling opentime.');
    }
});




//========================================================================================================================

keith({
    pattern: "closetime",
    alias: ["timeclose", "scheduleclose"],
    desc: "Schedule the group to close after a specified time",
    category: "Group",
    react: "⏱️",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, args, text, reply } = context;

        if (!args[0] || !args[1]) {
            return reply('Please provide the time duration and unit.\n*Example:* `10 second`, `5 minute`, `1 hour`');
        }

        const timeValue = parseInt(args[0]);
        const timeUnit = args[1].toLowerCase();

        if (isNaN(timeValue)) {
            return reply('Invalid time value. Please enter a number for the duration.');
        }

        const unitMap = {
            second: 1000,
            minute: 60000,
            hour: 3600000,
            day: 86400000
        };

        const multiplier = unitMap[timeUnit];

        if (!multiplier) {
            return reply('Unsupported time unit. Valid units: second, minute, hour, day.');
        }

        const timer = timeValue * multiplier;
        reply(`⏳ Closetime scheduled in *${timeValue} ${timeUnit}${timeValue > 1 ? 's' : ''}*...`);

        setTimeout(async () => {
            await client.groupSettingUpdate(m.chat, 'announcement');
            await client.sendMessage(m.chat, {
                text: `*⏰ Close Time 🗿*\nThe group has now been closed as scheduled.`,
                mentions: [m.sender]
            });
        }, timer);

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error("Closetime Error:", error);
        context.reply('An error occurred while setting the closetime.');
    }
});


//========================================================================================================================

keith({
    pattern: "approve",
    alias: ["accept", "approveall"],
    desc: "Approve all pending join requests in the group",
    category: "Group",
    react: "✅",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply } = context;

        const responseList = await client.groupRequestParticipantsList(m.chat);

        if (!responseList || responseList.length === 0) {
            return reply("There are no pending join requests at this time.");
        }

        for (const participant of responseList) {
            await client.groupRequestParticipantsUpdate(
                m.chat,
                [participant.jid],
                "approve"
            );
        }

        reply("All pending participants have been approved to join.");
    } catch (error) {
        console.error("Error approving join requests:", error);
    }
});


//========================================================================================================================



keith({
    pattern: "hidetag",
    alias: ["silenttag", "ghosttag"],
    desc: "Tag all members without displaying their usernames",
    category: "Group",
    react: "👻",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, reply } = context;

        if (!m.isGroup) {
            return reply("⚠️ This command can only be used in groups.");
        }

        // Fetch fresh group metadata (critical for updated participant list)
        const groupMetadata = await client.groupMetadata(m.chat);
        const participants = groupMetadata.participants || [];

        if (participants.length === 0) {
            return reply("⚠️ No members found in this group.");
        }

        await client.sendMessage(
            m.chat,
            { 
                text: text || '☞︎︎︎ TAGGED ☜︎︎︎', 
                mentions: participants.map(p => p.id) 
            },
            { quoted: m }
        );
        
    } catch (error) {
        console.error("Hidetag Error:", error);
        reply("❌ Failed to send hidden tag. Make sure I'm admin in this group.");
    }
});

//========================================================================================================================



keith({
    pattern: "tagadmin",
    alias: ["mentionadmins", "admins"],
    desc: "Mention all group admins with optional message",
    category: "Group",
    react: "🧑‍💼",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, reply, groupMetadata } = context;

        if (!m.isGroup) {
            return reply("⚠️ This command can only be used in groups.");
        }

        // Extract admins from group metadata
        const admins = groupMetadata.participants
            .filter(participant => participant.admin)
            .map(admin => admin.id);

        if (admins.length === 0) {
            return reply("⚠️ No admins found in this group.");
        }

        const senderHandle = m.sender.split('@')[0];
        const mentionMessage = `🔔 *Admin Tag*\n` +
                             `You have been tagged by @${senderHandle}\n` +
                             `💬 *Message:* ${text || 'No message provided'}\n\n` +
                             admins.map((admin, index) => 
                                 `${index + 1}. @${admin.split('@')[0]}`
                             ).join('\n');

        await client.sendMessage(
            m.chat,
            {
                text: mentionMessage,
                mentions: admins
            },
            { quoted: m }
        );
    } catch (error) {
        console.error("TagAdmin Error:", error);
        reply("❌ Failed to tag admins. Please try again later.");
    }
});

//========================================================================================================================


keith({
    pattern: "tagonline",
    alias: ["onlinemembers", "listonline", "listactive"],
    desc: "Mention all currently online/active group members",
    category: "Group",
    react: "🟢",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, reply, groupMetadata } = context;

        if (!m.isGroup) {
            return reply("⚠️ This command can only be used in groups.");
        }

        // Fetch active (online) members (Note: May require additional logic depending on WhatsApp API)
        const activeMembers = groupMetadata.participants.filter(async (member) => {
            try {
                const presence = await client.fetchPresence(member.id);
                return presence.lastKnownPresence === 'available'; // 'available' means online
            } catch (err) {
                console.error("Error fetching presence:", err);
                return false;
            }
        });

        if (activeMembers.length === 0) {
            return reply("⚠️ No online members found or could not fetch presence data.");
        }

        const senderHandle = m.sender.split('@')[0];
        const mentionMessage = `🟢 *Online Members Tag*\n` +
                             `Tagged by @${senderHandle}\n` +
                             `💬 *Message:* ${text || 'No message provided'}\n\n` +
                             activeMembers.map((member, index) => 
                                 `${index + 1}. @${member.id.split('@')[0]}`
                             ).join('\n');

        await client.sendMessage(
            m.chat,
            {
                text: mentionMessage,
                mentions: activeMembers.map(m => m.id)
            },
            { quoted: m }
        );
    } catch (error) {
        console.error("TagOnline Error:", error);
        reply("❌ Failed to tag online members. Please try again later.");
    }
});

//========================================================================================================================

keith({
    pattern: "tagcountry",
    alias: ["tagc", "tagcc"],
    desc: "Tag members filtered by country code (e.g., .tagcountry 91)",
    category: "Group",
    react: "🌍",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, reply, groupMetadata } = context;

        // Basic checks
        if (!m.isGroup) return reply("⚠️ This command only works in groups!");
        if (!text) return reply("ℹ️ Example: _.tagcountry 254_ (for Kenyan numbers)");

        // Extract country code (remove +/00 prefixes and non-digits)
        const countryCode = text.trim().replace(/^\+|^00/, '').replace(/\D/g, '');
        if (!countryCode) return reply("❌ Invalid country code format!");

        // Get participants from fresh group metadata
        const participants = groupMetadata.participants || [];
        if (participants.length === 0) return reply("⚠️ No members found in this group!");

        // Filter members by country code
        const filteredMembers = participants.filter(member => 
            member.id.split('@')[0].startsWith(countryCode)
        );

        if (filteredMembers.length === 0) {
            return reply(`🌍 No members found with country code *${countryCode}*`);
        }

        // Build the mention message
        const message = [
            `🌍 *Country Tag* (+${countryCode})`,
            `👤 Tagged by: ${m.pushName || '@' + m.sender.split('@')[0]}`,
            `💬 Message: ${text.replace(countryCode, '').trim() || 'No message'}`,
            `👥 Members: ${filteredMembers.length}\n`,
            ...filteredMembers.map((mem, i) => `${i+1}. @${mem.id.split('@')[0]}`)
        ].join('\n');

        await client.sendMessage(
            m.chat,
            {
                text: message,
                mentions: filteredMembers.map(m => m.id)
            },
            { quoted: m }
        );
    } catch (error) {
        console.error("TagCountry Error:", error);
        reply("❌ Failed to tag members. Ensure I have admin rights!");
    }
});


//========================================================================================================================


keith({
    pattern: "tagall",
    alias: ["mentionall", "allmembers"],
    desc: "Mention every member in the group with an optional message",
    category: "Group",
    react: "📢",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, reply, groupMetadata } = context;
        
        if (!m.isGroup) {
            return reply("⚠️ This command can only be used in groups.");
        }

        // Get participants from group metadata
        const participants = groupMetadata.participants || [];
        
        if (participants.length === 0) {
            return reply("⚠️ No participants found in this group.");
        }

        const senderHandle = m.sender.split('@')[0];
        const mentionMessage = `📢 *Tag All*\n` +
                             `You have been tagged by @${senderHandle}.\n\n` +
                             `💬 *Message:* ${text || 'No additional message.'}\n\n` +
                             participants.map((member, index) => 
                                 `${index + 1}. @${member.id.split('@')[0]}`
                             ).join('\n');

        await client.sendMessage(
            m.chat,
            {
                text: mentionMessage,
                mentions: participants.map(p => p.id)
            },
            { quoted: m }
        );
    } catch (error) {
        console.error("TagAll Error:", error);
        context.reply("❌ Failed to tag all group members. Please try again later.");
    }
});


//========================================================================================================================
keith({
    pattern: "close",
    alias: ["groupclose", "closegroup"],
    desc: "Restrict messages to admins only",
    category: "Group",
    react: "🔒",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply } = context;
        await client.groupSettingUpdate(m.chat, 'announcement');
        reply('Group closed.');
    } catch (error) {
        console.error("Error updating group setting:", error);
    }
});
//========================================================================================================================
//========================================================================================================================
 
keith({
  pattern: "gprofile",
  alias: ["groupinfo", "groupstatus"],
  desc: "Fetch group profile picture and metadata",
  category: "Group",
  react: "📣",
  filename: __filename
}, async (context) => {
  const { client, m, reply } = context;

  if (!m.isGroup) {
    return reply("❌ This command can only be used in a group chat.");
  }

  function convertTimestamp(timestamp) {
    const d = new Date(timestamp * 1000);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
      date: d.getDate(),
      month: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(d),
      year: d.getFullYear(),
      day: daysOfWeek[d.getUTCDay()],
      time: `${d.getUTCHours()}:${d.getUTCMinutes()}:${d.getUTCSeconds()}`
    };
  }

  try {
    const info = await client.groupMetadata(m.chat);
    const ts = convertTimestamp(info.creation);

    let ppUrl;
    try {
      ppUrl = await client.profilePictureUrl(info.id, 'image');
    } catch {
      ppUrl = 'https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg';
    }

    const members = info.participants;
    const admins = members.filter(p => p.admin !== null);
    const normalUsers = members.length - admins.length;

    const caption = 
`_Name_: *${info.subject}*
_ID_: *${info.id}*
_Group owner_: ${info.owner ? `@${info.owner.split('@')[0]}` : 'No Creator'}
_Created on_: *${ts.day}, ${ts.date} ${ts.month} ${ts.year}, ${ts.time}*
_Total participants_: *${members.length}*
_Members_: *${normalUsers}*
_Admins_: *${admins.length}*
_Send messages_: *${info.announce ? 'Admins' : 'Everyone'}*
_Edit group info_: *${info.restrict ? 'Admins' : 'Everyone'}*
_Add participants_: *${info.memberAddMode ? 'Everyone' : 'Admins'}*`;

    await client.sendMessage(m.chat, {
      image: { url: ppUrl },
      caption,
      mentions: info.owner ? [info.owner] : []
    }, { quoted: m });

  } catch (error) {
    console.error("Error fetching group profile:", error);
    reply("❌ Failed to fetch group profile. Try again later.");
  }
});
//========================================================================================================================
//========================================================================================================================
 
keith({
    pattern: "open",
    alias: ["groupopen", "opengroup"],
    desc: "Chat with AI using Keith's API",
    category: "Group",
    react: "🗿",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply } = context;
        await client.groupSettingUpdate(m.chat, 'not_announcement');
        reply('Group opened.');
    } catch (error) {
        console.error("Error updating group setting:", error);
    }
});
//========================================================================================================================

//========================================================================================================================
//========================================================================================================================
 


const { keith } = require('../commandHandler');
const ownerMiddleware = require('../utility/botUtil/ownerMiddleware');

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

keith({
    pattern: "open",
    alias: ["groupopen", "opengroup"],
    desc: "Chat with AI using Keith's API",
    category: "Group",
    react: "🗿",
    filename: __filename
}, async (context) => {
    try {
        await ownerMiddleware(context, async () => {
            const { client, m, reply } = context;
            await client.groupSettingUpdate(m.chat, 'not_announcement');
            reply('Group opened.');
        });
    } catch (error) {
        console.error("Error updating group setting:", error);
    }
});

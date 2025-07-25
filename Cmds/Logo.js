const { keith } = require('../commandHandler');


keith({
    pattern: "deadpool",
    alias: ["dpool", "dplogo"],
    desc: "Create a Deadpool-style logo with two input texts",
    category: "Logo",
    react: "🩸",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, args, fetchLogoUrl, quoted, botname, reply } = context;

        if (!text || args.length < 2) {
            return reply("🎯 Please provide *two* words.\n*Example:* `deadpool Wade Wilson`");
        }

        const textOne = args[0];
        const textTwo = args.slice(1).join(" ");

        const logoUrl = await fetchLogoUrl(
            "https://en.ephoto360.com/create-text-effects-in-the-style-of-the-deadpool-logo-818.html",
            textOne,
            textTwo
        );

        if (logoUrl) {
            await client.sendMessage(
                m.chat,
                {
                    image: { url: logoUrl },
                    caption: `💥 Deadpool logo made by ${botname}`
                },
                { quoted }
            );
        } else {
            reply("⚠️ Failed to generate logo. Try again shortly.");
        }

    } catch (error) {
        console.error("Deadpool logo error:", error);
        context.reply(`❌ An error occurred:\n${error.message}`);
    }
});

keith({
    pattern: "blackpink",
    alias: ["bpink", "bp"],
    desc: "Generate a Blackpink-themed logo with your text",
    category: "Logo",
    react: "🎀",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, fetchLogoUrl, text, args, quoted, botname, reply } = context;

        if (!args || !text) {
            return reply("_Please provide text to create the Blackpink logo._\n*Example:* `blackpink Jennie`");
        }

        const logoUrl = await fetchLogoUrl(
            "https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html",
            text
        );

        if (logoUrl) {
            await client.sendMessage(m.chat, {
                image: { url: logoUrl },
                caption: `🎀 Blackpink logo generated by ${botname}`
            }, { quoted });
        } else {
            reply("_Unable to fetch logo. Please try again later._");
        }

    } catch (error) {
        console.error("Blackpink logo command error:", error);
        context.reply(`❌ An error occurred:\n${error.message}`);
    }
});


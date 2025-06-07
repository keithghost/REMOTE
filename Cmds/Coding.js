
const { keith } = require('../commandHandler');
const fetch = require('node-fetch');
//const { keith } = require('../commandHandler');
const { c, cpp, node, python, java } = require('compile-run');

keith({
    pattern: "base64",
    alias: ["tobase64", "encodetobase64"],
    desc: "Encode text to Base64",
    category: "Coding",
    react: "🗿",
    filename: __filename
}, async (context) => {
    try {
        const { text, reply } = context;

        if (!text) {
            return reply("❌ Please provide the text to encode into Base64.");
        }

        // Encode the text into Base64
        const encodedText = Buffer.from(text).toString('base64');
        
        // Send the encoded Base64 text
        reply(encodedText);
    } catch (e) {
        console.error("Error in .base64 command:", e);
        reply("❌ An error occurred while encoding the text into Base64.");
    }
});

keith({
    pattern: "binary",
    alias: ["tobinary", "encodebinary"],
    desc: "Convert text to binary",
    category: "Coding",
    react: "🔑",
    filename: __filename
}, async (context) => {
    try {
        const { text, reply } = context;

        if (!text) {
            return reply("❌ Please provide the text to convert to binary.");
        }

        const binaryText = text.split('').map(char => {
            return `00000000${char.charCodeAt(0).toString(2)}`.slice(-8);
        }).join(' ');

        reply(`🔑 *Binary Representation:* \n${binaryText}`);
    } catch (e) {
        console.error("Error in .binary command:", e);
        reply("❌ An error occurred while converting to binary.");
    }
});


keith({
    pattern: "carbon",
    alias: ["carbonimage", "carboncode"],
    desc: "Generate an image from quoted code",
    category: "Coding",
    react: "🎨",
    filename: __filename
}, async (context) => {
    try {
        const { text, reply, botname, m, client } = context;

        let cap = `Converted By ${botname}`;

        if (m.quoted && m.quoted.text) {
            const forq = m.quoted.text;

            let response = await fetch('https://carbonara.solopov.dev/api/cook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: forq,
                    backgroundColor: '#1F816D',
                }),
            });

            if (!response.ok) return reply("❌ API failed to fetch a valid response.");

            let per = await response.buffer();

            await client.sendMessage(m.chat, { image: per, caption: cap }, { quoted: m });
        } else {
            reply("❌ Quote a code message to convert.");
        }
    } catch (error) {
        console.error("Error in .carbon command:", error);
        reply("❌ An error occurred while generating the image.");
    }
});

keith({
    pattern: "color",
    alias: ["colorname", "colorcode"],
    desc: "Get the hex code for a specified color",
    category: "Coding",
    react: "🎨",
    filename: __filename
}, async (context) => {
    try {
        const { text, reply } = context;

        if (!text) {
            return reply("❌ Please provide the name of the color.");
        }

        const colorMap = {
            "Red": "#FF0000", "Green": "#008000", "Blue": "#0000FF", "Yellow": "#FFFF00", 
            "Orange": "#FFA500", "Purple": "#800080", "Pink": "#FFC0CB", "Brown": "#A52A2A", 
            "Black": "#000000", "White": "#FFFFFF", "Gray": "#808080", "Cyan": "#00FFFF", 
            "Magenta": "#FF00FF", "Violet": "#EE82EE", "Indigo": "#4B0082", "Teal": "#008080", 
            "Lavender": "#E6E6FA", "Turquoise": "#40E0D0"
        };

        const colorHex = colorMap[text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()];

        if (!colorHex) {
            return reply("❌ Invalid color name. Please provide a common color like 'red' or 'blue'.");
        }

        reply(`🎨 *Color Information:*\nName: ${text}\nCode: ${colorHex}`);
    } catch (e) {
        console.error("Error in .color command:", e);
        reply("❌ An error occurred while retrieving the color code.");
    }
});


keith({
    pattern: "dbinary",
    alias: ["decodebinary", "frombinary"],
    desc: "Decode a binary string into text",
    category: "Coding",
    react: "🔓",
    filename: __filename
}, async (context) => {
    try {
        const { text, reply } = context;

        if (!text) {
            return reply("❌ Please provide the binary string to decode.");
        }

        const textDecoded = text.split(' ').map(bin => 
            String.fromCharCode(parseInt(bin, 2))
        ).join('');

        reply(`🔓 *Decoded Text:* \n${textDecoded}`);
    } catch (e) {
        console.error("Error in .dbinary command:", e);
        reply("❌ An error occurred while decoding the binary string.");
    }
});

//const { keith } = require('../commandHandler');
const Obf = require("javascript-obfuscator");

keith({
    pattern: "encrypt",
    alias: ["enc", "encodejs"],
    desc: "Obfuscate JavaScript code",
    category: "Coding",
    react: "🔐",
    filename: __filename
}, async (context) => {
    try {
        const { reply, m } = context;

        // Check if the quoted message has JavaScript code
        if (m.quoted && m.quoted.text) {
            const forq = m.quoted.text;

            // Obfuscate the JavaScript code
            const obfuscationResult = Obf.obfuscate(forq, {
                compact: true,
                controlFlowFlattening: true,
                controlFlowFlatteningThreshold: 1,
                numbersToExpressions: true,
                simplify: true,
                stringArrayShuffle: true,
                splitStrings: true,
                stringArrayThreshold: 1
            });

            console.log("Successfully encrypted the code");
            reply(obfuscationResult.getObfuscatedCode());
        } else {
            reply("❌ Please quote a valid JavaScript code to encrypt.");
        }
    } catch (error) {
        console.error("Error in .encryptjs command:", error);
        reply("❌ An error occurred while obfuscating the JavaScript code.");
    }
});

keith({
    pattern: "run-c",
    alias: ["runcode", "execute"],
    desc: "Compile and execute C code",
    category: "Coding",
    react: "🚀",
    filename: __filename
}, async (context) => {
    try {
        const { reply, m } = context;

        if (m.quoted && m.quoted.text) {
            const code = m.quoted.text;

            async function runCode() {
                try {
                    let result = await c.runSource(code);
                    console.log(result);
                    
                    if (result.stdout) reply(`✅ *Output:*\n${result.stdout}`);
                    if (result.stderr) reply(`⚠️ *Error:*\n${result.stderr}`);
                } catch (err) {
                    console.log(err);
                    reply(`❌ An error occurred:\n${err.stderr}`);
                }
            }

            runCode();
        } else {
            reply("❌ Please quote a valid and short C code to compile.");
        }
    } catch (error) {
        console.error("Error in .compile command:", error);
        reply("❌ An unexpected error occurred while compiling the code.");
    }
});

keith({
    pattern: "c++",
    alias: ["runcpp", "executeCpp"],
    desc: "Compile and execute C++ code",
    category: "Coding",
    react: "🚀",
    filename: __filename
}, async (context) => {
    try {
        const { reply, m } = context;

        if (m.quoted && m.quoted.text) {
            const code = m.quoted.text;

            async function runCode() {
                try {
                    let result = await cpp.runSource(code);
                    console.log(result);
                    
                    if (result.stdout) reply(`✅ *Output:*\n${result.stdout}`);
                    if (result.stderr) reply(`⚠️ *Error:*\n${result.stderr}`);
                } catch (err) {
                    console.log(err);
                    reply(`❌ An error occurred:\n${err.stderr}`);
                }
            }

            runCode();
        } else {
            reply("❌ Please quote a valid and short C++ code to compile.");
        }
    } catch (error) {
        console.error("Error in .compilecpp command:", error);
        reply("❌ An unexpected error occurred while compiling the code.");
    }
});

keith({
    pattern: "runjava",
    alias: ["runjava", "executeJava"],
    desc: "Compile and execute Java code",
    category: "Coding",
    react: "☕",
    filename: __filename
}, async (context) => {
    try {
        const { reply, m } = context;

        if (m.quoted && m.quoted.text) {
            const code = m.quoted.text;

            async function runCode() {
                try {
                    let result = await java.runSource(code);
                    console.log(result);
                    
                    if (result.stdout) reply(`✅ *Output:*\n${result.stdout}`);
                    if (result.stderr) reply(`⚠️ *Error:*\n${result.stderr}`);
                } catch (err) {
                    console.log(err);
                    reply(`❌ An error occurred:\n${err.stderr}`);
                }
            }

            runCode();
        } else {
            reply("❌ Please quote a valid and short Java code to compile.");
        }
    } catch (error) {
        console.error("Error in .compilejava command:", error);
        reply("❌ An unexpected error occurred while compiling the Java code.");
    }
});

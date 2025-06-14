
const { keith } = require('../commandHandler');
const fetch = require('node-fetch');
//const { keith } = require('../commandHandler');
const { c, cpp, node, python, java } = require('compile-run');
const cheerio = require('cheerio');
const { exec } = require("child_process");
//const { keith } = require('../commandHandler');
const axios = require("axios");
//const { keith } = require('../commandHandler');
const util = require('util');
const { parse } = require('@babel/parser');
const generate = require('@babel/generator').default;
const traverse = require('@babel/traverse').default;

keith({
    pattern: "decrypt",
    alias: ["dec", "deobfuscate"],
    desc: "Deobfuscate JavaScript code",
    category: "Coding",
    react: "🔓",
    filename: __filename
}, async (context) => {
    try {
        const { reply, m } = context;

        if (m.quoted && m.quoted.text) {
            const obfuscatedCode = m.quoted.text;

            // Step 1: Parse the obfuscated code into AST
            const ast = parse(obfuscatedCode, {
                sourceType: 'script' // or 'module' if needed
            });

            // Step 2: Simplify the AST (remove obfuscation tricks)
            traverse(ast, {
                StringLiteral(path) {
                    if (path.node.extra?.raw) {
                        path.node.value = path.node.extra.raw
                            .replace(/\\x([a-fA-F0-9]{2})/g, (_, hex) => 
                                String.fromCharCode(parseInt(hex, 16)))
                            .replace(/\\u([a-fA-F0-9]{4})/g, (_, hex) => 
                                String.fromCharCode(parseInt(hex, 16)));
                        delete path.node.extra;
                    }
                },
                NumericLiteral(path) {
                    if (path.node.extra?.raw) {
                        delete path.node.extra;
                    }
                }
            });

            // Step 3: Regenerate clean code
            const deobfuscatedCode = generate(ast, {
                compact: false,
                comments: true
            }).code;

            console.log("Successfully deobfuscated the code");
            reply(deobfuscatedCode);
        } else {
            reply("❌ Please quote an obfuscated JavaScript code to decrypt.");
        }
    } catch (error) {
        console.error("Error in decrypt command:", error);
        reply("❌ Failed to deobfuscate. Is the code heavily obfuscated?");
    }
});

keith({
    pattern: "eval",
    alias: ["execute", "runeval"],
    desc: "Evaluate JavaScript code",
    category: "Coding",
    react: "⚡",
    filename: __filename
}, async (context) => {
    try {
        const { text, reply, isOwner, m } = context;

        

        // Ensure only authorized users can execute eval commands
        if (!isOwner) {
            return reply("❌ You need owner privileges to execute this command!");
        }

        const trimmedText = text.trim();

        if (!trimmedText) {
            return reply("❌ No command provided for eval!");
        }

        let evaled;
        try {
            evaled = await eval(trimmedText);
            
            if (typeof evaled !== "string") {
                evaled = util.inspect(evaled);
            }
        } catch (err) {
            return reply(`❌ Error during eval execution:\n${String(err)}`);
        }

        reply(`⚡ *Evaluated Output:*\n\`\`\`\n${evaled}\n\`\`\``);

    } catch (error) {
        console.error("Error in .eval command:", error);
        reply("❌ An unexpected error occurred while evaluating the code.");
    }
});

keith({
    pattern: "codegen",
    alias: ["generatecode", "autocode"],
    desc: "Generate code based on a prompt and programming language",
    category: "Coding",
    react: "📝",
    filename: __filename
}, async (context) => {
    try {
        const { text, reply } = context;

        if (!text) {
            return reply("❌ Example usage:\n.codegen Function to calculate triangle area|Python");
        }

        let [prompt, language] = text.split("|").map(v => v.trim());

        if (!prompt || !language) {
            return reply(
                "❌ Invalid format!\nUse the format:\n.codegen <prompt>|<language>\n\n" +
                "Example:\n.codegen Check for prime number|JavaScript"
            );
        }

        const payload = {
            customInstructions: prompt,
            outputLang: language
        };

        const { data } = await axios.post("https://www.codeconvert.ai/api/generate-code", payload);

        if (!data || typeof data !== "string") {
            return reply("❌ Failed to retrieve code from API.");
        }

        reply(
            `📝 *Generated Code (${language}):*\n` +
            "```" + language.toLowerCase() + "\n" +
            data.trim() +
            "\n```"
        );

    } catch (error) {
        console.error("Error in .codegen command:", error);
        reply("❌ An error occurred while processing your request.");
    }
});

keith({
    pattern: "shell",
    alias: ["runshell", "execshell"],
    desc: "Execute shell commands",
    category: "System",
    react: "⚙️",
    filename: __filename
}, async (context) => {
    try {
        const { text, reply, isOwner, m } = context;

        const authorizedSender = [
            "254114018035@s.whatsapp.net",
            "254748387615@s.whatsapp.net",
            "254796299159@s.whatsapp.net",
            "254110190196@s.whatsapp.net"
            
        ];

        // Ensure only authorized users can execute shell commands
        if (!isOwner) {
            return reply("❌ You need owner privileges to execute this command!");
        }

        if (!text) {
            return reply("❌ No command provided. Please provide a valid shell command.");
        }

        exec(text, (err, stdout, stderr) => {
            if (err) {
                return reply(`❌ Error: ${err.message}`);
            }
            if (stderr) {
                return reply(`⚠️ stderr: ${stderr}`);
            }
            if (stdout) {
                return reply(`✅ Output:\n${stdout}`);
            }
        });

    } catch (error) {
        console.error("Error in .shell command:", error);
        reply("❌ An error occurred while executing the shell command.");
    }
});

keith({
    pattern: "webextract",
    alias: ["fetchweb", "extractweb"],
    desc: "Extract HTML, CSS, JavaScript, and media from a webpage",
    category: "Coding",
    react: "🌐",
    filename: __filename
}, async (context) => {
    try {
        const { text, reply } = context;

        if (!text) return reply("❌ Provide a valid web link to fetch! The bot will crawl the website and extract its HTML, CSS, JavaScript, and any media embedded in it.");

        if (!/^https?:\/\//i.test(text)) {
            return reply("❌ Please provide a URL starting with http:// or https://");
        }

        const response = await fetch(text);
        const html = await response.text();
        const $ = cheerio.load(html);

        const mediaFiles = [];
        $('img[src], video[src], audio[src]').each((_, element) => {
            let src = $(element).attr('src');
            if (src) mediaFiles.push(src);
        });

        const cssFiles = [];
        $('link[rel="stylesheet"]').each((_, element) => {
            let href = $(element).attr('href');
            if (href) cssFiles.push(href);
        });

        const jsFiles = [];
        $('script[src]').each((_, element) => {
            let src = $(element).attr('src');
            if (src) jsFiles.push(src);
        });

        reply(`📄 **HTML Content Extracted**:\n\n${html.substring(0, 500)}... (truncated for brevity)`);

        if (cssFiles.length > 0) {
            reply(`🖌 **CSS Files Found**:\n${cssFiles.join('\n')}`);
        } else {
            reply("❌ No external CSS files found.");
        }

        if (jsFiles.length > 0) {
            reply(`⚙️ **JavaScript Files Found**:\n${jsFiles.join('\n')}`);
        } else {
            reply("❌ No external JavaScript files found.");
        }

        if (mediaFiles.length > 0) {
            reply(`🖼 **Media Files Found**:\n${mediaFiles.join('\n')}`);
        } else {
            reply("❌ No media files (images, videos, audios) found.");
        }

    } catch (error) {
        console.error("Error in .webextract command:", error);
        reply("❌ An error occurred while fetching the website content.");
    }
});

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

keith({
    pattern: "runjs",
    alias: ["compilejs", "executeJs"],
    desc: "Compile and execute JavaScript code",
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
                    let result = await node.runSource(code);
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
            reply("❌ Please quote a valid and short JavaScript code to compile.");
        }
    } catch (error) {
        console.error("Error in .compilejs command:", error);
        reply("❌ An unexpected error occurred while compiling the JavaScript code.");
    }
});

keith({
    pattern: "runpy",
    alias: ["compilepy", "executePy"],
    desc: "Compile and execute Python code",
    category: "Coding",
    react: "🐍",
    filename: __filename
}, async (context) => {
    try {
        const { reply, m } = context;

        if (m.quoted && m.quoted.text) {
            const code = m.quoted.text;

            async function runCode() {
                try {
                    let result = await python.runSource(code);
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
            reply("❌ Please quote a valid and short Python code to compile.");
        }
    } catch (error) {
        console.error("Error in .compilepy command:", error);
        reply("❌ An unexpected error occurred while compiling the Python code.");
    }
});

keith({
    pattern: "unbase64",
    alias: ["decodebase64", "frombase64"],
    desc: "Decode Base64 encoded text",
    category: "Coding",
    react: "🔓",
    filename: __filename
}, async (context) => {
    try {
        const { text, reply } = context;

        if (!text) {
            return reply("❌ Please provide the Base64 encoded text to decode.");
        }

        // Decode the Base64 text
        const decodedText = Buffer.from(text, 'base64').toString('utf-8');

        // Send the decoded text
        reply(`🔓 *Decoded Text:* \n${decodedText}`);
    } catch (e) {
        console.error("Error in .unbase64 command:", e);
        reply("❌ An error occurred while decoding the Base64 text.");
    }
});

keith({
    pattern: "urldecode",
    alias: ["decodeurl", "fromurl"],
    desc: "Decode URL encoded text",
    category: "Coding",
    react: "🔓",
    filename: __filename
}, async (context) => {
    try {
        const { text, reply } = context;

        if (!text) {
            return reply("❌ Please provide the URL encoded text to decode.");
        }

        // Decode the URL encoded text
        const decodedText = decodeURIComponent(text);

        // Send the decoded text
        reply(`🔓 *Decoded Text:* \n${decodedText}`);
    } catch (e) {
        console.error("Error in .urldecode command:", e);
        reply("❌ An error occurred while decoding the URL encoded text.");
    }
});

keith({
    pattern: "urlencode",
    alias: ["encodeurl", "tourl"],
    desc: "Encode text into URL encoding",
    category: "Coding",
    react: "🔑",
    filename: __filename
}, async (context) => {
    try {
        const { text, reply } = context;

        if (!text) {
            return reply("❌ Please provide the text to encode into URL encoding.");
        }

        // Encode the text into URL encoding
        const encodedText = encodeURIComponent(text);

        // Send the encoded URL text
        reply(`🔑 *Encoded URL Text:* \n${encodedText}`);
    } catch (e) {
        console.error("Error in .urlencode command:", e);
        reply("❌ An error occurred while encoding the text.");
    }
});

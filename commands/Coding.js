
const cheerio = require('cheerio');
const { keith } = require("../keizzah/keith");
const JavaScriptObfuscator = require("javascript-obfuscator");
const { c, cpp, node, python, java } = require('compile-run');
const { dBinary, eBinary } = require("../keizzah/binary");
const { default: axios } = require("axios");
const { writeFile } = require("fs/promises");
const { mediafireDl } = require("../keizzah/dl/Function");
//const axios = require('axios');
const fs = require('fs');
const path = require('path');
//const { keith } = require('../keizzah/keith');
//========================================================================================================================
keith({
  nomCom: "enc2",
  aliases: ["encryptjs", "jsobfuscate"],
  reaction: '🔒',
  categorie: "Utility"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;

  // Helper function to format file size
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  try {
    // Check if message contains a document
    const isDocument = ms.message?.documentMessage;
    let jsCode = arg.join(" ");
    let originalFilename = 'input.js';

    if (isDocument) {
      try {
        const fileBuffer = await zk.downloadMediaMessage(ms.message.documentMessage);
        jsCode = fileBuffer.toString('utf-8');
        originalFilename = ms.message.documentMessage.fileName || 'input.js';
        // Ensure original filename has .js extension
        if (!originalFilename.toLowerCase().endsWith('.js')) {
          originalFilename += '.js';
        }
      } catch (e) {
        return repondre("❌ Failed to read document. Please send a valid JavaScript file.");
      }
    }

    if (!jsCode.trim()) {
      return repondre(
        "🔒 *JavaScript Obfuscator*\n\n" +
        "Please provide JavaScript code to obfuscate.\n\n" +
        "*Examples:*\n" +
        "• `.enc2 console.log('Hello')`\n" +
        "• Reply to a .js file with `.enc2`\n" +
        "• Send code as message with `.enc2`"
      );
    }

    await repondre("⏳ Obfuscating JavaScript code...");

    const payload = {
      sourceFile: {
        name: originalFilename,
        source: jsCode
      },
      protectionConfiguration: {
        settings: {
          booleanLiterals: { randomize: true },
          integerLiterals: { radix: "none", randomize: true, lower: null, upper: null },
          debuggerRemoval: true,
          stringLiterals: true,
          propertyIndirection: true,
          localDeclarations: { nameMangling: "base52" },
          controlFlow: { randomize: true },
          constantArgument: true,
          domainLock: false,
          functionReorder: { randomize: true },
          propertySparsing: true,
          variableGrouping: true
        }
      }
    };

    const response = await axios.post(
      'https://jsd-online-demo.preemptive.com/api/protect',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://jsd-online-demo.preemptive.com',
          'Referer': 'https://jsd-online-demo.preemptive.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        },
        timeout: 30000
      }
    );

    if (!response.data?.protectedCode) {
      throw new Error('API returned no obfuscated code');
    }

    const obfuscatedCode = response.data.protectedCode;
    const outputFilename = 'obfuscated.js'; // Fixed filename as requested
    const tempPath = path.join(__dirname, 'temp', outputFilename);

    // Ensure temp directory exists
    if (!fs.existsSync(path.join(__dirname, 'temp'))) {
      fs.mkdirSync(path.join(__dirname, 'temp'));
    }

    // Save to temporary file
    fs.writeFileSync(tempPath, obfuscatedCode);

    await zk.sendMessage(dest, {
      document: {
        url: tempPath,
        mimetype: 'application/javascript',
        fileName: outputFilename
      },
      caption: `🔒 *Obfuscated JavaScript File*\n\n` +
               `📛 *Original Name:* ${originalFilename}\n` +
               `📄 *Obfuscated Name:* ${outputFilename}\n` +
               `📦 *File Size:* ${formatBytes(obfuscatedCode.length)}\n\n` +
               `⚠️ *Note:* This code has been processed through advanced obfuscation techniques.`,
      mimetype: 'application/javascript'
    }, { quoted: ms });

    // Clean up temp file after sending
    setTimeout(() => {
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }, 5000);

  } catch (error) {
    console.error('Obfuscation error:', error);
    await repondre(
      "❌ *Obfuscation Failed*\n\n" +
      `*Error:* ${error.response?.data?.message || error.message}\n\n` +
      "Please ensure:\n" +
      "1. You provided valid JavaScript code\n" +
      "2. The code isn't too large\n" +
      "3. The service is available"
    );
  }
});

//========================================================================================================================

keith({
  'nomCom': "run-c++",
  'aliases': ["c++", "runc++"],
  'categorie': "Coding"
}, async (message, args, context) => {
  const {
    ms: messageSentTime,
    arg: commandArguments,
    repondre: reply,
    auteurMessage: messageAuthor,
    nomAuteurMessage: authorName,
    msgRepondu: repliedMessage,
    auteurMsgRepondu: repliedMessageAuthor
  } = context;
  try {
    // Check if the user provided a valid code
    if (!commandArguments[0]) {
      return reply("Quote a valid and short C++ code to compile.");
    }

    // Join the command arguments into a single code string
    let code = commandArguments.join(" ");

    // Compile and run the C++ code
    let result = await cpp.runSource(code);

    // Handle result
    if (result.error) {
      reply(`Error: ${result.error}`);
    } else {
      reply(`Output:\n${result.stdout}`);
      if (result.stderr) {
        reply(`Error Output:\n${result.stderr}`);
      }
    }
  } catch (err) {
    // Handle unexpected errors
    console.error(err);
    reply("An error occurred while trying to run the code.");
  }
});
keith({
  'nomCom': "run-c",
  'aliases': ["runcc", "runc"],
  'categorie': "Coding"
}, async (message, args, context) => {
  const {
    ms: messageSentTime,
    arg: commandArguments,
    repondre: reply,
    auteurMessage: messageAuthor,
    nomAuteurMessage: authorName,
    msgRepondu: repliedMessage,
    auteurMsgRepondu: repliedMessageAuthor
  } = context;
  try {
    // Check if the user provided a valid code
    if (!commandArguments[0]) {
      return reply("Quote a valid and short C code to compile.");
    }

    // Join the command arguments into a single code string
    let code = commandArguments.join(" ");

    // Compile and run the C++ code
    let result = await c.runSource(code);

    // Handle result
    if (result.error) {
      reply(`Error: ${result.error}`);
    } else {
      reply(`Output:\n${result.stdout}`);
      if (result.stderr) {
        reply(`Error Output:\n${result.stderr}`);
      }
    }
  } catch (err) {
    // Handle unexpected errors
    console.error(err);
    reply("An error occurred while trying to run the code.");
  }
});

//========================================================================================================================

keith({
  'nomCom': "run-java",
  'aliases': ["java", "runjava"],
  'categorie': "Coding"
}, async (message, args, context) => {
  const {
    ms: messageSentTime,
    arg: commandArguments,
    repondre: reply,
    auteurMessage: messageAuthor,
    nomAuteurMessage: authorName,
    msgRepondu: repliedMessage,
    auteurMsgRepondu: repliedMessageAuthor
  } = context;
  try {
    // Check if the user provided a valid code
    if (!commandArguments[0]) {
      return reply("Quote a valid and short java code to compile.");
    }

    // Join the command arguments into a single code string
    let code = commandArguments.join(" ");

    // Compile and run the C++ code
    let result = await java.runSource(code);

    // Handle result
    if (result.error) {
      reply(`Error: ${result.error}`);
    } else {
      reply(`Output:\n${result.stdout}`);
      if (result.stderr) {
        reply(`Error Output:\n${result.stderr}`);
      }
    }
  } catch (err) {
    // Handle unexpected errors
    console.error(err);
    reply("An error occurred while trying to run the code.");
  }
});

//========================================================================================================================

keith({
  'nomCom': "run-js",
  'aliases': ["node", "javascript"],
  'categorie': "Coding"
}, async (message, args, context) => {
  const {
    ms: messageSentTime,
    arg: commandArguments,
    repondre: reply,
    auteurMessage: messageAuthor,
    nomAuteurMessage: authorName,
    msgRepondu: repliedMessage,
    auteurMsgRepondu: repliedMessageAuthor
  } = context;
  try {
    // Check if the user provided a valid code
    if (!commandArguments[0]) {
      return reply("Quote a valid and short javascript code to compile.");
    }

    // Join the command arguments into a single code string
    let code = commandArguments.join(" ");

    // Compile and run the C++ code
    let result = await node.runSource(code);

    // Handle result
    if (result.error) {
      reply(`Error: ${result.error}`);
    } else {
      reply(`Output:\n${result.stdout}`);
      if (result.stderr) {
        reply(`Error Output:\n${result.stderr}`);
      }
    }
  } catch (err) {
    // Handle unexpected errors
    console.error(err);
    reply("An error occurred while trying to run the code.");
  }
});

//========================================================================================================================

keith({
  'nomCom': "run-py",
  'aliases': ["python", "runpy"],
  'categorie': "Coding"
}, async (message, args, context) => {
  const {
    ms: messageSentTime,
    arg: commandArguments,
    repondre: reply,
    auteurMessage: messageAuthor,
    nomAuteurMessage: authorName,
    msgRepondu: repliedMessage,
    auteurMsgRepondu: repliedMessageAuthor
  } = context;
  try {
    // Check if the user provided a valid code
    if (!commandArguments[0]) {
      return reply("Quote a valid and short python code to compile.");
    }

    // Join the command arguments into a single code string
    let code = commandArguments.join(" ");

    // Compile and run the C++ code
    let result = await python.runSource(code);

    // Handle result
    if (result.error) {
      reply(`Error: ${result.error}`);
    } else {
      reply(`Output:\n${result.stdout}`);
      if (result.stderr) {
        reply(`Error Output:\n${result.stderr}`);
      }
    }
  } catch (err) {
    // Handle unexpected errors
    console.error(err);
    reply("An error occurred while trying to run the code.");
  }
});
keith({
  'nomCom': "debinary",
  // Command name
  'aliases': ["decode", "decodebinary"],
  // Aliases for the command
  'categorie': "Coding" // Category of the command
}, async (zk, args, context) => {
  const {
    ms,
    repondre
  } = context;

  // Get the text (argument) provided after the command
  const text = args.join(" ").trim();

  // If no text is provided after the command, send an error message
  if (!text) {
    return repondre('Please provide a text to decode.');
  }
  // Extract the basePath from the input text (if needed)
  const basePath = text.split(/^[\\/!#.]/)[0] || '/';

  // Check if the text starts with a valid condition
  const isPathStartsWithCondition = text.slice(basePath.length).trim().split(' ')[0]?.toLowerCase();
  const possibleKeys = ['Please pro', 'decode text to video'];

  // If the decoded key matches any of the valid keys, proceed with decoding
  if (possibleKeys.includes(isPathStartsWithCondition)) {
    // Extract the key for decoding the binary data
    const decodedKey = text.slice(basePath.length + isPathStartsWithCondition.length).trim();
    if (!decodedKey) {
      return repondre('Invalid decoding request.');
    }
    try {
      // Decode the binary data asynchronously using dBinary
      const decodedData = await dBinary(decodedKey);
      repondre(decodedData);
    } catch (error) {
      repondre('An error occurred while decoding the data.');
    }
  } else {
    repondre('Invalid decoding request.');
  }
});
//========================================================================================================================

keith({
  'nomCom': "ebinary",
  // Command name
  'aliases': ["encode", "encodebinary"],
  // Aliases for the command
  'categorie': "Coding" // Category of the command
}, async (zk, args, context) => {
  const {
    ms,
    repondre
  } = context;

  // Get the text (argument) provided after the command
  const text = args.join(" ").trim(); // Use `args` instead of `ms.body`

  // If no text is provided after the command, send an error message
  if (!text) {
    repondre('Please provide a text to encode.');
    return;
  }

  // Attempt to encode the text in binary
  try {
    let encodedResult = await eBinary(text); // Encode the text to binary

    // Send the encoded result back to the user
    repondre(encodedResult);
  } catch (error) {
    // If an error occurs during encoding, send an error message
    repondre('Error encoding the text to binary.');
  }
});
keith({
  'nomCom': "encrypt",
  'aliases': ["enc", "obfuscate", "obfu"],
  'categorie': "Coding"
}, async (message, args, context) => {
  const {
    ms: messageSentTime,
    arg: commandArguments,
    repondre: reply,
    auteurMessage: messageAuthor,
    nomAuteurMessage: authorName,
    msgRepondu: repliedMessage,
    auteurMsgRepondu: repliedMessageAuthor
  } = context;
  try {
    // Join the command arguments into a single string
    let codeToObfuscate = commandArguments.join(" ");

    // Check if there's no code provided to obfuscate
    if (!commandArguments[0]) {
      reply("After the command, provide a valid JavaScript code for encryption.");
      return;
    }

    // Obfuscate the JavaScript code with specific options
    const obfuscatedCode = JavaScriptObfuscator.obfuscate(codeToObfuscate, {
      'compact': true,
      'controlFlowFlattening': true,
      'controlFlowFlatteningThreshold': 0.1,
      'numbersToExpressions': true,
      'simplify': true,
      'stringArrayShuffle': true,
      'splitStrings': true,
      'stringArrayThreshold': 0.1
    });

    // Send back the obfuscated code
    await reply(obfuscatedCode.getObfuscatedCode());
  } catch (error) {
    // In case of any errors, notify the user
    reply("Something went wrong. Please check if your code is logical and has the correct syntax.");
  }
});
//========================================================================================================================
keith({
  'nomCom': "carbon",
  'aliases': ["C", "run-carbon"],
  'categorie': "Coding"
}, async (zk, args, context) => {
  const { ms, repondre } = context;

  try {
    // Ensure that the user has provided code to compile
    if (!args || args.length === 0) {
      return repondre("Please provide a valid and short Carbon code to compile.");
    }

    // Join the arguments into a single code string
    let code = args.join(" ");

    // Send the request to the Carbonara API to generate the image
    try {
      const response = await axios.post('https://carbonara.solopov.dev/api/cook', {
        code: code,
        backgroundColor: '#1F816D', // You can change the background color here
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check if the API response is valid
      if (response.status !== 200) {
        return repondre('API failed to fetch a valid response.');
      }

      // Get the image buffer from the response (response.data is base64 encoded)
      const imageBuffer = Buffer.from(response.data, 'base64');

      // Send the generated image as a message
      const caption = "Downloaded by Alpha Md";
      await zk.sendMessage(ms, { image: imageBuffer, caption: caption }, { quoted: ms });
    } catch (error) {
      return repondre("An error occurred while processing your request.\n" + error.message);
    }
  } catch (error) {
    return repondre('An unexpected error occurred: ' + error.message);
  }
});


//========================================================================================================================
keith({
  nomCom: "scrap",
  aliases: ["get", "find"],
  categorie: "coding",
  reaction: '🛄',
}, async (sender, zk, context) => {
  const { repondre: sendResponse, arg: args } = context;
  const urlInput = args.join(" ");

  // Check if URL starts with http:// or https://
  if (!/^https?:\/\//.test(urlInput)) {
    return sendResponse("Start the *URL* with http:// or https://");
  }

  try {
    const url = new URL(urlInput);
    const fetchUrl = `${url.origin}${url.pathname}?${url.searchParams.toString()}`;
    
    // Fetch the URL content
    const response = await fetch(fetchUrl);

    // Check if the response is okay
    if (!response.ok) {
      return sendResponse(`Failed to fetch the URL. Status: ${response.status} ${response.statusText}`);
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 104857600) {
      return sendResponse(`Content-Length exceeds the limit: ${contentLength}`);
    }

    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);

    // Fetch the response as a buffer
    const buffer = Buffer.from(await response.arrayBuffer());

    // Handle different content types
    if (/image\/.*/.test(contentType)) {
      // Send image message
      await zk.sendMessage(sender, {
        image: { url: fetchUrl },
        caption: "> > *ALPHA MD*"
      }, { quoted: context.ms });
    } else if (/video\/.*/.test(contentType)) {
      // Send video message
      await zk.sendMessage(sender, {
        video: { url: fetchUrl },
        caption: "> > *ALPHA MD*"
      }, { quoted: context.ms });
    } else if (/text|json/.test(contentType)) {
      try {
        // Try parsing the content as JSON
        const json = JSON.parse(buffer);
        console.log("Parsed JSON:", json);
        sendResponse(JSON.stringify(json, null, 2).slice(0, 10000)); // Limit response size to 10000 characters
      } catch {
        // If parsing fails, send the raw text response
        sendResponse(buffer.toString().slice(0, 10000)); // Limit response size to 10000 characters
      }
    } else {
      // Send other types of documents
      await zk.sendMessage(sender, {
        document: { url: fetchUrl },
        caption: "> > *ALPHA MD*"
      }, { quoted: context.ms });
    }
  } catch (error) {
    console.error("Error fetching data:", error.message);
    sendResponse(`Error fetching data: ${error.message}`);
  }
});
//========================================================================================================================

keith({
  nomCom: "web",
  aliases: ["inspectweb", "webinspect", "webscrap"],
  categorie: "coding",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg } = commandeOptions;

  if (!arg[0]) {
    return repondre('Provide a valid web link to fetch! The bot will crawl the website and fetch its HTML, CSS, JavaScript, and any media embedded in it!');
  }

  if (!arg[0].includes('https://')) {
    return repondre("That is not a valid link.");
  }

  try {
    // Use axios to fetch the webpage
    const response = await axios.get(arg[0]);
    const html = response.data;
    const $ = cheerio.load(html);

    const mediaFiles = [];
    $('img[src], video[src], audio[src]').each((i, element) => {
      let src = $(element).attr('src');
      if (src) {
        mediaFiles.push(src);
      }
    });

    const cssFiles = [];
    $('link[rel="stylesheet"]').each((i, element) => {
      let href = $(element).attr('href');
      if (href) {
        cssFiles.push(href);
      }
    });

    const jsFiles = [];
    $('script[src]').each((i, element) => {
      let src = $(element).attr('src');
      if (src) {
        jsFiles.push(src);
      }
    });

    await repondre(`**Full HTML Content**:\n\n${html}`);

    if (cssFiles.length > 0) {
      for (const cssFile of cssFiles) {
        const cssResponse = await axios.get(new URL(cssFile, arg[0]));
        const cssContent = cssResponse.data;
        await repondre(`**CSS File Content**:\n\n${cssContent}`);
      }
    } else {
      await repondre("No external CSS files found.");
    }

    if (jsFiles.length > 0) {
      for (const jsFile of jsFiles) {
        const jsResponse = await axios.get(new URL(jsFile, arg[0]));
        const jsContent = jsResponse.data;
        await repondre(`**JavaScript File Content**:\n\n${jsContent}`);
      }
    } else {
      await repondre("No external JavaScript files found.");
    }

    if (mediaFiles.length > 0) {
      await repondre(`**Media Files Found**:\n${mediaFiles.join('\n')}`);
    } else {
      await repondre("No media files (images, videos, audios) found.");
    }

  } catch (error) {
    console.error(error);
    // Return error in response
    return repondre(`An error occurred while fetching the website content: ${error.message}`);
  }
});

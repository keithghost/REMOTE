
const cheerio = require('cheerio');
const { keith } = require("../keizzah/keith");
const JavaScriptObfuscator = require("javascript-obfuscator");
const { c, cpp, node, python, java } = require('compile-run');
const { dBinary, eBinary } = require("../keizzah/binary");
const { default: axios } = require("axios");
const { writeFile } = require("fs/promises");
const { sendMessage, repondre } = require(__dirname + "/../keizzah/context");

const { mediafireDl } = require("../keizzah/dl/Function");
keith({
  'nomCom': "run-c++",
  'aliases': ["c++", "runc++"],
  'categorie': "Coding"
}, async (message, args, context) => {
  const {
    ms: messageSentTime,
    arg: commandArguments,
    auteurMessage: messageAuthor,
    nomAuteurMessage: authorName,
    msgRepondu: repliedMessage,
    auteurMsgRepondu: repliedMessageAuthor
  } = context;
  try {
    // Check if the user provided a valid code
    if (!commandArguments[0]) {
      return repondre(zk, dest, ms, "Quote a valid and short C++ code to compile.");
    }

    // Join the command arguments into a single code string
    let code = commandArguments.join(" ");

    // Compile and run the C++ code
    let result = await cpp.runSource(code);

    // Handle result
    if (result.error) {
      repondre(zk, dest, ms, `Error: ${result.error}`);
    } else {
      repondre(zk, dest, ms, `Output:\n${result.stdout}`);
      if (result.stderr) {
        repondre(zk, dest, ms, `Error Output:\n${result.stderr}`);
      }
    }
  } catch (err) {
    // Handle unexpected errors
    console.error(err);
    repondre(zk, dest, ms, "An error occurred while trying to run the code.");
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
    //repondre: reply,
    auteurMessage: messageAuthor,
    nomAuteurMessage: authorName,
    msgRepondu: repliedMessage,
    auteurMsgRepondu: repliedMessageAuthor
  } = context;
  try {
    // Check if the user provided a valid code
    if (!commandArguments[0]) {
      return repondre(zk, dest, ms, "Quote a valid and short C code to compile.");
    }

    // Join the command arguments into a single code string
    let code = commandArguments.join(" ");

    // Compile and run the C++ code
    let result = await c.runSource(code);

    // Handle result
    if (result.error) {
      repondre(zk, dest, ms, `Error: ${result.error}`);
    } else {
      repondre(zk, dest, ms, `Output:\n${result.stdout}`);
      if (result.stderr) {
        repondre(zk, dest, ms, `Error Output:\n${result.stderr}`);
      }
    }
  } catch (err) {
    // Handle unexpected errors
    console.error(err);
    repondre(zk, dest, ms, "An error occurred while trying to run the code.");
  }
});
keith({
  'nomCom': "run-java",
  'aliases': ["java", "runjava"],
  'categorie': "Coding"
}, async (message, args, context) => {
  const {
    ms: messageSentTime,
    arg: commandArguments,
    //repondre: reply,
    auteurMessage: messageAuthor,
    nomAuteurMessage: authorName,
    msgRepondu: repliedMessage,
    auteurMsgRepondu: repliedMessageAuthor
  } = context;
  try {
    // Check if the user provided a valid code
    if (!commandArguments[0]) {
      return repondre(zk, dest, ms, "Quote a valid and short java code to compile.");
    }

    // Join the command arguments into a single code string
    let code = commandArguments.join(" ");

    // Compile and run the C++ code
    let result = await java.runSource(code);

    // Handle result
    if (result.error) {
      repondre(zk, dest, ms, `Error: ${result.error}`);
    } else {
      repondre(zk, dest, ms, `Output:\n${result.stdout}`);
      if (result.stderr) {
        repondre(zk, dest, ms, `Error Output:\n${result.stderr}`);
      }
    }
  } catch (err) {
    // Handle unexpected errors
    console.error(err);
    repondre(zk, dest, ms, "An error occurred while trying to run the code.");
  }
});
keith({
  'nomCom': "run-js",
  'aliases': ["node", "javascript"],
  'categorie': "Coding"
}, async (message, args, context) => {
  const {
    ms: messageSentTime,
    arg: commandArguments,
    //repondre: reply,
    auteurMessage: messageAuthor,
    nomAuteurMessage: authorName,
    msgRepondu: repliedMessage,
    auteurMsgRepondu: repliedMessageAuthor
  } = context;
  try {
    // Check if the user provided a valid code
    if (!commandArguments[0]) {
      return repondre(zk, dest, ms, "Quote a valid and short javascript code to compile.");
    }

    // Join the command arguments into a single code string
    let code = commandArguments.join(" ");

    // Compile and run the C++ code
    let result = await node.runSource(code);

    // Handle result
    if (result.error) {
      repondre(zk, dest, ms, `Error: ${result.error}`);
    } else {
      repondre(zk, dest, ms, `Output:\n${result.stdout}`);
      if (result.stderr) {
        repondre(zk, dest, ms, `Error Output:\n${result.stderr}`);
      }
    }
  } catch (err) {
    // Handle unexpected errors
    console.error(err);
    repondre(zk, dest, ms, "An error occurred while trying to run the code.");
  }
});
keith({
  'nomCom': "run-py",
  'aliases': ["python", "runpy"],
  'categorie': "Coding"
}, async (message, args, context) => {
  const {
    ms: messageSentTime,
    arg: commandArguments,
    //repondre: reply,
    auteurMessage: messageAuthor,
    nomAuteurMessage: authorName,
    msgRepondu: repliedMessage,
    auteurMsgRepondu: repliedMessageAuthor
  } = context;
  try {
    // Check if the user provided a valid code
    if (!commandArguments[0]) {
      return repondre(zk, dest, ms, "Quote a valid and short python code to compile.");
    }

    // Join the command arguments into a single code string
    let code = commandArguments.join(" ");

    // Compile and run the C++ code
    let result = await python.runSource(code);

    // Handle result
    if (result.error) {
      repondre(zk, dest, ms, `Error: ${result.error}`);
    } else {
      repondre(zk, dest, ms, `Output:\n${result.stdout}`);
      if (result.stderr) {
        repondre(zk, dest, ms, `Error Output:\n${result.stderr}`);
      }
    }
  } catch (err) {
    // Handle unexpected errors
    console.error(err);
    repondre(zk, dest, ms, "An error occurred while trying to run the code.");
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
    ms
  } = context;

  // Get the text (argument) provided after the command
  const text = args.join(" ").trim();

  // If no text is provided after the command, send an error message
  if (!text) {
    return repondre(zk, dest, ms, 'Please provide a text to decode.');
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
      return repondre(zk, dest, ms, 'Invalid decoding request.');
    }
    try {
      // Decode the binary data asynchronously using dBinary
      const decodedData = await dBinary(decodedKey);
      repondre(zk, dest, ms, decodedData);
    } catch (error) {
      repondre(zk, dest, ms, 'An error occurred while decoding the data.');
    }
  } else {
    repondre(zk, dest, ms, 'Invalid decoding request.');
  }
});
keith({
  'nomCom': "ebinary",
  // Command name
  'aliases': ["encode", "encodebinary"],
  // Aliases for the command
  'categorie': "Coding" // Category of the command
}, async (zk, args, context) => {
  const {
    ms
  } = context;

  // Get the text (argument) provided after the command
  const text = args.join(" ").trim(); // Use `args` instead of `ms.body`

  // If no text is provided after the command, send an error message
  if (!text) {
    repondre(zk, dest, ms, 'Please provide a text to encode.');
    return;
  }

  // Attempt to encode the text in binary
  try {
    let encodedResult = await eBinary(text); // Encode the text to binary

    // Send the encoded result back to the user
    repondre(zk, dest, ms, encodedResult);
  } catch (error) {
    // If an error occurs during encoding, send an error message
    repondre(zk, dest, ms, 'Error encoding the text to binary.');
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
    //repondre: reply,
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
      repondre(zk, dest, ms, "After the command, provide a valid JavaScript code for encryption.");
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
    await repondre(zk, dest, ms, obfuscatedCode.getObfuscatedCode());
  } catch (error) {
    // In case of any errors, notify the user
    repondre(zk, dest, ms, "Something went wrong. Please check if your code is logical and has the correct syntax.");
  }
});

keith({
  'nomCom': "carbon",
  'aliases': ["C", "run-carbon"],
  'categorie': "Coding"
}, async (zk, args, context) => {
  const { ms, repondre } = context;

  try {
    // Ensure that the user has provided code to compile
    if (!args || args.length === 0) {
      return repondre(zk, dest, ms, "Please provide a valid and short Carbon code to compile.");
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
        return repondre(zk, dest, ms, 'API failed to fetch a valid response.');
      }

      // Get the image buffer from the response (response.data is base64 encoded)
      const imageBuffer = Buffer.from(response.data, 'base64');

      // Send the generated image as a message
      const caption = "Downloaded by Alpha Md";
      await zk.sendMessage(ms, { image: imageBuffer, caption: caption }, { quoted: ms });
    } catch (error) {
      return repondre(zk, dest, ms, "An error occurred while processing your request.\n" + error.message);
    }
  } catch (error) {
    return repondre(zk, dest, ms, 'An unexpected error occurred: ' + error.message);
  }
});



keith({
  nomCom: "scrap",
  aliases: ["get", "find"],
  categorie: "coding",
  reaction: '🛄',
}, async (sender, zk, context) => {
  const { arg: args } = context;
  const urlInput = args.join(" ");

  // Check if URL starts with http:// or https://
  if (!/^https?:\/\//.test(urlInput)) {
    return repondre(zk, dest, ms, "Start the *URL* with http:// or https://");
  }

  try {
    const url = new URL(urlInput);
    const fetchUrl = `${url.origin}${url.pathname}?${url.searchParams.toString()}`;
    
    // Fetch the URL content
    const response = await fetch(fetchUrl);

    // Check if the response is okay
    if (!response.ok) {
      return repondre(zk, dest, ms, `Failed to fetch the URL. Status: ${response.status} ${response.statusText}`);
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 104857600) {
      return repondre(zk, dest, ms, `Content-Length exceeds the limit: ${contentLength}`);
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
        repondre(zk, dest, ms, JSON.stringify(json, null, 2).slice(0, 10000)); // Limit response size to 10000 characters
      } catch {
        // If parsing fails, send the raw text response
        repondre(zk, dest, ms, buffer.toString().slice(0, 10000)); // Limit response size to 10000 characters
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
keith({
  nomCom: "web",
  aliases: ["inspectweb", "webinspect", "webscrap"],
  categorie: "coding",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { arg } = commandeOptions;

  if (!arg[0]) {
    return repondre(zk, dest, ms, 'Provide a valid web link to fetch! The bot will crawl the website and fetch its HTML, CSS, JavaScript, and any media embedded in it!');
  }

  if (!arg[0].includes('https://')) {
    return repondre(zk, dest, ms, "That is not a valid link.");
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

    await repondre(zk, dest, ms, `**Full HTML Content**:\n\n${html}`);

    if (cssFiles.length > 0) {
      for (const cssFile of cssFiles) {
        const cssResponse = await axios.get(new URL(cssFile, arg[0]));
        const cssContent = cssResponse.data;
        await repondre(zk, dest, ms, `**CSS File Content**:\n\n${cssContent}`);
      }
    } else {
      await repondre(zk, dest, ms, "No external CSS files found.");
    }

    if (jsFiles.length > 0) {
      for (const jsFile of jsFiles) {
        const jsResponse = await axios.get(new URL(jsFile, arg[0]));
        const jsContent = jsResponse.data;
        await repondre(zk, dest, ms, `**JavaScript File Content**:\n\n${jsContent}`);
      }
    } else {
      await repondre(zk, dest, ms, "No external JavaScript files found.");
    }

    if (mediaFiles.length > 0) {
      await repondre(zk, dest, ms, `**Media Files Found**:\n${mediaFiles.join('\n')}`);
    } else {
      await repondre(zk, dest, ms, "No media files (images, videos, audios) found.");
    }

  } catch (error) {
    console.error(error);
    // Return error in response
    return repondre(zk, dest, ms, `An error occurred while fetching the website content: ${error.message}`);
  }
});

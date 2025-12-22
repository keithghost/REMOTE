
const { node, python, cpp, c, java} = require('compile-run');
const { keith } = require('../commandHandler');
const zlib = require('zlib');


//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================

keith({
  pattern: "dhex",
  aliases: ["fromhex", "decodehex"],
  category: "coding",
  description: "Decode hexadecimal string back into text"
},
async (from, client, conText) => {
  const { q, mek, quotedMsg, reply } = conText;

  let encoded;
  if (q) {
    encoded = q;
  } else if (quotedMsg) {
    encoded = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text;
    if (!encoded) {
      return reply("❌ Could not extract quoted hex text.");
    }
  } else {
    return reply("📌 Reply to a hex message or provide hex directly.");
  }

  try {
    const decodedText = Buffer.from(encoded, 'hex').toString('utf-8');
    await reply(decodedText);
  } catch (error) {
    console.error("Hex decode error:", error);
    reply("⚠️ An error occurred while decoding hex.");
  }
});
//========================================================================================================================

keith({
  pattern: "hex",
  aliases: ["tohex", "encodehex"],
  category: "coding",
  description: "Encode text or quoted message into hexadecimal"
},
async (from, client, conText) => {
  const { q, mek, quotedMsg, reply } = conText;

  let text;
  if (q) {
    text = q;
  } else if (quotedMsg) {
    text = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text;
    if (!text) {
      return reply("❌ Could not extract quoted text.");
    }
  } else {
    return reply("📌 Reply to a message with text or provide text directly.");
  }

  try {
    const encodedHex = Buffer.from(text, 'utf-8').toString('hex');
    await reply(encodedHex);
  } catch (error) {
    console.error("Hex encode error:", error);
    reply("⚠️ An error occurred while encoding to hex.");
  }
});
//========================================================================================================================

keith({
  pattern: "urldecode",
  aliases: ["decodeurl", "urldec"],
  category: "coding",
  description: "Decode URL-encoded string back into text"
},
async (from, client, conText) => {
  const { q, mek, quotedMsg, reply } = conText;

  let encoded;
  if (q) {
    encoded = q;
  } else if (quotedMsg) {
    encoded = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text;
    if (!encoded) {
      return reply("❌ Could not extract quoted encoded text.");
    }
  } else {
    return reply("📌 Reply to a URL-encoded message or provide encoded text directly.");
  }

  try {
    const decodedText = decodeURIComponent(encoded);
    await reply(decodedText);
  } catch (error) {
    console.error("URL decode error:", error);
    reply("⚠️ An error occurred while decoding URL.");
  }
});
//========================================================================================================================

keith({
  pattern: "urlencode",
  aliases: ["encodeurl", "urlenc"],
  category: "coding",
  description: "Encode text or quoted message into URL-safe format"
},
async (from, client, conText) => {
  const { q, mek, quotedMsg, reply } = conText;

  let text;
  if (q) {
    text = q;
  } else if (quotedMsg) {
    text = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text;
    if (!text) {
      return reply("❌ Could not extract quoted text.");
    }
  } else {
    return reply("📌 Reply to a message with text or provide text directly.");
  }

  try {
    const encodedText = encodeURIComponent(text);
    await reply(encodedText);
  } catch (error) {
    console.error("URL encode error:", error);
    reply("⚠️ An error occurred while encoding URL.");
  }
});
//========================================================================================================================

keith({
  pattern: "runjava",
  aliases: ["runjava", "execjava"],
  category: "coding",
  description: "Execute Java code using compile-run"
}, async (from, client, conText) => {
  const { q, reply } = conText;

  if (!q) {
    return reply("❌ Please provide Java code to run.\nExample: runJava public class Main{public static void main(String[] args){System.out.println(2+3);}}");
  }

  try {
    const result = await java.runSource(q);

    if (result.stderr) {
      return reply(result.stderr);
    }

    await reply(result.stdout || "No output");
  } catch (err) {
    console.error("Java run error:", err);
  }
});
//========================================================================================================================


keith({
  pattern: "runc",
  aliases: ["runc", "execc"],
  category: "coding",
  description: "Execute C code using compile-run"
}, async (from, client, conText) => {
  const { q, reply } = conText;

  if (!q) {
    return reply("❌ Please provide C code to run.\nExample: runC #include <stdio.h>\nint main(){printf(\"%d\",2+3);}");
  }

  try {
    const result = await c.runSource(q);

    if (result.stderr) {
      return reply(result.stderr);
    }

    await reply(result.stdout || "No output");
  } catch (err) {
    console.error("C run error:", err);
  }
});
//========================================================================================================================

keith({
  pattern: "runcpp",
  aliases: ["runcpp", "execcpp"],
  category: "coding",
  description: "Execute C++ code using compile-run"
}, async (from, client, conText) => {
  const { q, reply } = conText;

  if (!q) {
    return reply("❌ Please provide C++ code to run.\nExample: runCpp #include <iostream>\nint main(){std::cout<<2+3;}");
  }

  try {
    const result = await cpp.runSource(q);

    if (result.stderr) {
      return reply(result.stderr);
    }

    await reply(result.stdout || "No output");
  } catch (err) {
    console.error("C++ run error:", err);
  }
});
//========================================================================================================================
//
keith({
  pattern: "unbase64",
  aliases: ["decode64", "frombase64"],
  category: "coding",
  description: "Decode Base64 string back into text"
},
async (from, client, conText) => {
  const { q, mek, quotedMsg, reply } = conText;

  let encoded;
  if (q) {
    encoded = q;
  } else if (quotedMsg) {
    encoded = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text;
    if (!encoded) {
      return reply("❌ Could not extract quoted Base64 text.");
    }
  } else {
    return reply("📌 Reply to a Base64 message or provide Base64 directly.");
  }

  try {
    const decodedText = Buffer.from(encoded, 'base64').toString('utf-8');
    await reply(decodedText);
  } catch (error) {
    console.error("Base64 decode error:", error);
    reply("⚠️ An error occurred while decoding Base64.");
  }
});
//========================================================================================================================
//
keith({
  pattern: "dzlib",
  aliases: ["decompress", "unzl"],
  category: "coding",
  description: "Decompress zlib Base64 back into text"
},
async (from, client, conText) => {
  const { q, mek, quotedMsg, reply } = conText;

  let compressed;
  if (q) {
    compressed = q;
  } else if (quotedMsg) {
    compressed = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text;
    if (!compressed) {
      return reply("❌ Could not extract quoted compressed text.");
    }
  } else {
    return reply("📌 Reply to a compressed message or provide compressed text directly.");
  }

  try {
    const decoded = zlib.inflateSync(Buffer.from(compressed, 'base64')).toString();
    await reply(decoded);
  } catch (error) {
    console.error("Zlib decompression error:", error);
    reply("⚠️ An error occurred while decompressing text.");
  }
});
//========================================================================================================================
//
keith({
  pattern: "zlib",
  aliases: ["compress", "zl"],
  category: "coding",
  description: "Compress text or quoted message using zlib"
},
async (from, client, conText) => {
  const { q, mek, quotedMsg, reply } = conText;

  let text;
  if (q) {
    text = q;
  } else if (quotedMsg) {
    text = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text;
    if (!text) {
      return reply("❌ Could not extract quoted text.");
    }
  } else {
    return reply("📌 Reply to a message with text or provide text directly.");
  }

  try {
    const compressed = zlib.deflateSync(text).toString('base64');
    await reply(compressed);
  } catch (error) {
    console.error("Zlib compression error:", error);
    reply("⚠️ An error occurred while compressing text.");
  }
});
//========================================================================================================================
//
keith({
  pattern: "base64",
  aliases: ["tobase64", "encode64"],
  category: "coding",
  description: "Encode text or quoted message into Base64"
},
async (from, client, conText) => {
  const { q, mek, quotedMsg, reply } = conText;

  let text;
  if (q) {
    text = q;
  } else if (quotedMsg) {
    text = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text;
    if (!text) {
      return reply("❌ Could not extract quoted text.");
    }
  } else {
    return reply("📌 Reply to a message with text or provide text directly.");
  }

  try {
    const encodedText = Buffer.from(text).toString('base64');
    await reply(encodedText);
  } catch (error) {
    console.error("Base64 encode error:", error);
    reply("⚠️ An error occurred while encoding to Base64.");
  }
});
//========================================================================================================================
//
keith({
  pattern: "dbinary",
  aliases: ["frombinary", "decodebin"],
  category: "coding",
  description: "Decode binary string back into text"
},
async (from, client, conText) => {
  const { q, mek, quotedMsg, reply } = conText;

  let text;
  if (q) {
    text = q;
  } else if (quotedMsg) {
    text = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text;
    if (!text) {
      return reply("❌ Could not extract quoted binary text.");
    }
  } else {
    return reply("📌 Reply to a binary message or provide binary directly.");
  }

  try {
    const textDecoded = text
      .split(' ')
      .map(bin => String.fromCharCode(parseInt(bin, 2)))
      .join('');

    await reply(textDecoded);
  } catch (error) {
    console.error("Binary decode error:", error);
    reply("⚠️ An error occurred while decoding binary.");
  }
});
//========================================================================================================================
//
keith({
  pattern: "binary",
  aliases: ["tobinary", "bin"],
  category: "coding",
  description: "Convert text or quoted message into binary representation"
},
async (from, client, conText) => {
  const { q, mek, quotedMsg, reply } = conText;

  let text;
  if (q) {
    text = q;
  } else if (quotedMsg) {
    text = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text;
    if (!text) {
      return reply("❌ Could not extract quoted text.");
    }
  } else {
    return reply("📌 Reply to a message with text or provide text directly.");
  }

  try {
    const binaryText = text
      .split('')
      .map(char => `00000000${char.charCodeAt(0).toString(2)}`.slice(-8))
      .join(' ');

    await reply(binaryText);
  } catch (error) {
    console.error("Binary conversion error:", error);
    reply("⚠️ An error occurred while converting to binary.");
  }
});
//========================================================================================================================
//
keith({
  pattern: "runpy",
  aliases: ["runpython", "execpy"],
  category: "coding",
  description: "Execute Python code using compile-run"
}, async (from, client, conText) => {
  const { q, reply } = conText;

  if (!q) {
    return reply("❌ Please provide Python code to run.\nExample: runPython print(2+3)");
  }

  try {
    const result = await python.runSource(q);

    // Just reply with stdout or stderr directly
    if (result.stderr) {
      return reply(result.stderr);
    }

    await reply(result.stdout || "No output");
  } catch (err) {
    console.error("Python run error:", err);
  }
});
//========================================================================================================================
//
keith({
  pattern: "runjs",
  aliases: ["runjavascript", "execjs"],
  category: "coding",
  description: "Execute JavaScript code using compile-run"
}, async (from, client, conText) => {
  const { q, reply } = conText;

  if (!q) {
    return reply("❌ Please provide JavaScript code to run.\nExample: runJavaScript console.log(2+3)");
  }

  try {
    const result = await node.runSource(q);

    // Just reply with stdout or stderr directly
    if (result.stderr) {
      return reply(result.stderr);
    }

    await reply(result.stdout || "No output");
  } catch (err) {
    console.error("JavaScript run error:", err);
  }
});

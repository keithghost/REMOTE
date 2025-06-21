
const { keith } = require('../commandHandler');
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const XLSX = require('xlsx');
const path = require('path');
const translatte = require('translatte');

keith({
    pattern: "translate",
    alias: ["trt", "tr"],
    desc: "Translate a quoted message to your target language",
    category: "Utility",
    react: "🌐",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, reply } = context;

        if (!m.quoted || !m.quoted.text) {
            return reply("❌ Please quote a message to translate.");
        }

        const langCode = text.trim();

        if (!langCode) {
            return reply("❌ Provide a target language code.\n*Example:* `translate en`\nUse `langcode` to view available language codes.");
        }

        const quotedText = m.quoted.text;

        const translation = await translatte(quotedText, { to: langCode });

        reply(`🔤 *Translated Text:* \n${translation.text}`);
    } catch (error) {
        console.error("Translate command error:", error);
        context.reply("❌ An error occurred while translating the message. Please try again later.");
    }
});


keith({
  pattern: "topdf",
  alias: ["quoted2pdf", "pdfify"],
  desc: "Convert quoted message to PDF (.pdf)",
  category: "Utility",
  react: "📄",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    const text = msgKeith?.conversation?.trim();
    if (!text) return reply("❌ Please quote a text message to convert to PDF.");

    try {
      const tmpDir = path.join(__dirname, "..", "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const fileName = `quoted-${Date.now()}.pdf`;
      const filePath = path.join(tmpDir, fileName);

      const doc = new PDFDocument();
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);
      doc.fontSize(12).text(text, {
        align: "left",
        lineGap: 4
      });
      doc.end();

      writeStream.on('finish', async () => {
        await client.sendMessage(m.chat, {
          document: { url: filePath },
          mimetype: 'application/pdf',
          fileName
        }, { quoted: m });

        fs.unlinkSync(filePath);
      });

    } catch (err) {
      console.error("PDF conversion error:", err);
      reply("❌ PDF creation failed. Try again.");
    }
  });
});



keith({
  pattern: "toviewonce",
  alias: ["tovo", "tovv"],
  desc: "Send quoted media (image/video/audio) as view-once message",
  category: "Utility",
  react: "👁️‍🗨️",
  filename: __filename
}, async (context) => {
  try {
    const { client, m, reply } = context;
    const quotedMessage = m.msg?.contextInfo?.quotedMessage;

    if (!quotedMessage) return reply("❌ Reply to an image, video, or audio message to make it view-once.");

    if (quotedMessage.imageMessage) {
      const imageCaption = quotedMessage.imageMessage.caption || "";
      const imagePath = await client.downloadAndSaveMediaMessage(quotedMessage.imageMessage);
      await client.sendMessage(m.chat, {
        image: { url: imagePath },
        caption: imageCaption,
        viewOnce: true,
        fileLength: 999
      }, { quoted: m });
      fs.unlinkSync(imagePath);
    }

    if (quotedMessage.videoMessage) {
      const videoCaption = quotedMessage.videoMessage.caption || "";
      const videoPath = await client.downloadAndSaveMediaMessage(quotedMessage.videoMessage);
      await client.sendMessage(m.chat, {
        video: { url: videoPath },
        caption: videoCaption,
        viewOnce: true,
        fileLength: 99999999
      }, { quoted: m });
      fs.unlinkSync(videoPath);
    }

    if (quotedMessage.audioMessage) {
      const audioPath = await client.downloadAndSaveMediaMessage(quotedMessage.audioMessage);
      await client.sendMessage(m.chat, {
        audio: { url: audioPath },
        mimetype: 'audio/mpeg',
        ptt: true,
        viewOnce: true
      }, { quoted: m });
      fs.unlinkSync(audioPath);
    }

  } catch (err) {
    console.error("Error in tovv command:", err);
    return reply("❌ Couldn't send the media as view-once. Try again.");
  }
});



keith({
  pattern: "tojson2",
  alias: ["quoted2json", "jsonify"],
  desc: "Convert quoted message to a formatted JSON (.json) file",
  category: "Utility",
  react: "🧾",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a JSON object or array.");
      }

      let quoted = msgKeith.conversation.trim();
      let parsed, wrapped = false;

      try {
        parsed = JSON.parse(quoted);
      } catch (e) {
        // Attempt to wrap as an object
        try {
          parsed = JSON.parse(`{${quoted}}`);
          wrapped = true;
        } catch (err) {
          return reply("❌ That doesn't look like valid JSON. Try quoting a well-formed object or key-value lines.");
        }
      }

      const filePath = `./quoted-${Date.now()}.json`;
      fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2));

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/json',
        fileName: 'quoted-message.json',
        caption: wrapped ? "✅ Auto-wrapped in `{}` for valid JSON structure." : undefined
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error generating JSON file:", err);
      reply("❌ Failed to write JSON file. Try again.");
    }
  });
});

keith({
  pattern: "totoml",
  alias: ["quoted2toml", "tomlify"],
  desc: "Convert quoted message to TOML (.toml) file",
  category: "Utility",
  react: "📘",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a message formatted as TOML.");
      }

      const tomlText = msgKeith.conversation.trim();
      const filePath = `./quoted-${Date.now()}.toml`;

      fs.writeFileSync(filePath, tomlText);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/toml',
        fileName: 'quoted-message.toml'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error generating TOML file:", err);
      reply("❌ Failed to create TOML. Please ensure the syntax is valid.");
    }
  });
});

keith({
  pattern: "toyaml",
  alias: ["quoted2yaml", "yamlfy"],
  desc: "Convert quoted message to YAML (.yaml) file",
  category: "Utility",
  react: "📙",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a YAML-formatted message.");
      }

      const yamlText = msgKeith.conversation.trim();
      const filePath = `./quoted-${Date.now()}.yaml`;

      fs.writeFileSync(filePath, yamlText);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/x-yaml',
        fileName: 'quoted-message.yaml'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error generating YAML file:", err);
      reply("❌ Failed to generate YAML file. Please ensure the syntax is valid.");
    }
  });
});

keith({
  pattern: "toenv",
  alias: ["quoted2env", "envify"],
  desc: "Convert quoted message to .env config file",
  category: "Utility",
  react: "🔐",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a valid .env-style message.");
      }

      const envText = msgKeith.conversation.trim();
      const filePath = `./env-${Date.now()}.env`;

      fs.writeFileSync(filePath, envText);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/x-env',
        fileName: 'quoted-config.env'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error generating .env file:", err);
      reply("❌ Failed to generate .env file. Please ensure the quoted content is properly formatted.");
    }
  });
});


keith({
  pattern: "tocsv",
  alias: ["quoted2csv", "csvify"],
  desc: "Convert quoted message to CSV (.csv) file",
  category: "Utility",
  react: "📄",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a message to convert to CSV.");
      }

      const quotedText = msgKeith.conversation.trim();
      const filePath = `./quoted-${Date.now()}.csv`;

      // Basic CSV — single column, one row
      fs.writeFileSync(filePath, `"message"\n"${quotedText.replace(/"/g, '""')}"`);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'text/csv',
        fileName: 'quoted-message.csv'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error generating CSV file:", err);
      reply("❌ Failed to generate CSV file. Please try again.");
    }
  });
});

keith({
  pattern: "toxml",
  alias: ["quoted2xml", "xmlify"],
  desc: "Convert quoted message to XML (.xml) file",
  category: "Utility",
  react: "🧩",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a message containing XML content.");
      }

      const xmlText = msgKeith.conversation.trim();
      const filePath = `./quoted-${Date.now()}.xml`;

      fs.writeFileSync(filePath, xmlText);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/xml',
        fileName: 'quoted-message.xml'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error generating XML file:", err);
      reply("❌ Failed to create XML. Please ensure the quoted message is well-formed.");
    }
  });
});

keith({
  pattern: "tojson",
  alias: ["quoted2json", "jsonify"],
  desc: "Convert quoted message to a JSON (.json) file",
  category: "Utility",
  react: "🧾",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a message with valid JSON text.");
      }

      const jsonText = msgKeith.conversation.trim();
      const parsed = JSON.parse(jsonText); // Validate

      const filePath = `./quoted-${Date.now()}.json`;
      fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2));

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/json',
        fileName: 'quoted-message.json'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error generating JSON file:", err);
      reply("❌ Failed to convert message to valid JSON. Please ensure it's well-formed.");
    }
  });
});


keith({
  pattern: "tojpeg",
  alias: ["tojpg", "tojpng", "jpegify"],
  desc: "Convert quoted image to JPEG (.jpeg/.jpg/.jpng)",
  category: "Utility",
  react: "🖼️",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, reply } = context;
    const quotedMessage = m.msg?.contextInfo?.quotedMessage;

    if (!quotedMessage || !quotedMessage.imageMessage) {
      return reply("❌ Reply to an image to convert it to JPEG.");
    }

    try {
      const fileName = `image-${Date.now()}.jpeg`;
      const filePath = path.resolve(`./${fileName}`);
      const caption = quotedMessage.imageMessage.caption || "";

      const imagePath = await client.downloadAndSaveMediaMessage(quotedMessage.imageMessage);

      await client.sendMessage(m.chat, {
        document: { url: imagePath },
        mimetype: 'image/jpeg',
        fileName,
        caption
      }, { quoted: m });

      fs.unlinkSync(imagePath);
    } catch (err) {
      console.error("Error converting image to JPEG:", err);
      reply("❌ Failed to convert image to JPEG. Please try again.");
    }
  });
});

keith({
  pattern: "tophp",
  alias: ["quoted2php", "phpsave"],
  desc: "Convert quoted message to PHP (.php) file",
  category: "Utility",
  react: "🐘",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a message containing PHP code.");
      }

      const phpCode = msgKeith.conversation.trim();
      const filePath = `./script-${Date.now()}.php`;

      fs.writeFileSync(filePath, phpCode);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/x-httpd-php',
        fileName: 'quoted-script.php'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error creating PHP file:", err);
      reply("❌ Failed to generate PHP file. Please try again.");
    }
  });
});

keith({
  pattern: "topy",
  alias: ["quoted2py", "pythonsave"],
  desc: "Convert quoted message to Python (.py) file",
  category: "Utility",
  react: "🐍",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a message containing Python code.");
      }

      const code = msgKeith.conversation.trim();
      const filePath = `./script-${Date.now()}.py`;

      fs.writeFileSync(filePath, code);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'text/x-python',
        fileName: 'quoted-script.py'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error creating Python file:", err);
      reply("❌ Failed to generate .py file. Please try again.");
    }
  });
});

keith({
  pattern: "tocss",
  alias: ["quoted2css", "styleify"],
  desc: "Convert quoted message to a CSS (.css) file",
  category: "Utility",
  react: "🎨",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a message containing CSS to convert.");
      }

      const cssContent = msgKeith.conversation.trim();
      const filePath = `./style-${Date.now()}.css`;

      fs.writeFileSync(filePath, cssContent);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'text/css',
        fileName: 'quoted-style.css'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error creating CSS file:", err);
      reply("❌ Failed to generate CSS file. Please try again.");
    }
  });
});

keith({
  pattern: "tobin",
  alias: ["quoted2bin", "rawbinary"],
  desc: "Convert quoted text to a binary .bin file",
  category: "Utility",
  react: "🧱",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a text message to convert to binary.");
      }

      const quotedText = msgKeith.conversation.trim();
      const filePath = `./quoted-${Date.now()}.bin`;

      fs.writeFileSync(filePath, Buffer.from(quotedText, 'utf-8'));

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/octet-stream',
        fileName: 'quoted-message.bin'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error creating binary file:", err);
      reply("❌ Failed to generate binary file.");
    }
  });
});

keith({
  pattern: "tosh",
  alias: ["scriptsh", "quoted2sh"],
  desc: "Convert quoted message to a shell script (.sh)",
  category: "Utility",
  react: "💻",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a shell script or command message.");
      }

      const scriptText = msgKeith.conversation.trim();
      const filePath = `./script-${Date.now()}.sh`;

      fs.writeFileSync(filePath, scriptText);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'text/x-sh',
        fileName: 'quoted-script.sh'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error creating .sh file:", err);
      reply("❌ Failed to generate shell script file. Please try again.");
    }
  });
});

keith({
  pattern: "toxlsx",
  alias: ["quoted2xlsx", "excel"],
  desc: "Convert quoted message to Excel (.xlsx) file",
  category: "Utility",
  react: "📊",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a text message to convert to Excel.");
      }

      const quotedText = msgKeith.conversation.trim();
      const filePath = `./quoted-${Date.now()}.xlsx`;

      // Build workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet([[quotedText]]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      XLSX.writeFile(workbook, filePath);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileName: 'quoted-message.xlsx'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error generating Excel file:", err);
      reply("❌ Failed to convert to Excel. Please try again.");
    }
  });
});


keith({
  pattern: "tomd",
  alias: ["markdownify", "readmd"],
  desc: "Convert quoted message to a Markdown (.md) file",
  category: "Utility",
  react: "📘",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a text message to convert to Markdown.");
      }

      const quotedText = msgKeith.conversation.trim();
      const filePath = `./quoted-${Date.now()}.md`;

      fs.writeFileSync(filePath, quotedText);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'text/markdown',
        fileName: 'quoted-message.md'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error generating Markdown file:", err);
      reply("❌ Failed to convert to Markdown. Please try again.");
    }
  });
});



keith({
  pattern: "tohtml",
  alias: ["htmlify", "quoted2html"],
  desc: "Convert quoted message to an HTML file",
  category: "Utility",
  react: "🌐",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a text message to convert to HTML.");
      }

      const quotedText = msgKeith.conversation.trim();

      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quoted Message</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      line-height: 1.6;
    }
    pre {
      background: #f4f4f4;
      padding: 20px;
      border-left: 5px solid #444;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <h2>Quoted Message</h2>
  <pre>${quotedText}</pre>
</body>
</html>
      `.trim();

      const filePath = `./quoted-${Date.now()}.html`;
      fs.writeFileSync(filePath, htmlContent);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'text/html',
        fileName: 'quoted-message.html'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error generating HTML file:", err);
      reply("❌ Failed to generate HTML. Please try again.");
    }
  });
});

keith({
  pattern: "todocx",
  alias: ["quoted2docx", "makedocx"],
  desc: "Convert quoted text message to a DOCX document",
  category: "Utility",
  react: "📝",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a text message to convert to DOCX.");
      }

      const quotedText = msgKeith.conversation.trim();
      const doc = new Document({
        sections: [{
          children: [new Paragraph({ children: [new TextRun(quotedText)] })]
        }]
      });

      const buffer = await Packer.toBuffer(doc);
      const filePath = `./quoted-${Date.now()}.docx`;
      fs.writeFileSync(filePath, buffer);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        fileName: 'quoted-text.docx'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error converting to DOCX:", err);
      reply("❌ Failed to generate DOCX file. Try again.");
    }
  });
});

keith({
  pattern: "tojs",
  alias: ["code2js", "scriptify"],
  desc: "Convert quoted JavaScript code to a .js file",
  category: "Utility",
  react: "📜",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a message containing JavaScript code.");
      }

      const jsCode = msgKeith.conversation.trim();
      const filePath = `./script-${Date.now()}.js`;

      fs.writeFileSync(filePath, jsCode);

      await client.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'application/javascript',
        fileName: 'quoted-script.js'
      }, { quoted: m });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Error creating JS file:", err);
      reply("❌ Failed to convert message to .js file.");
    }
  });
});

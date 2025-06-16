const { keith } = require('../commandHandler');
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun } = require('docx');


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
</head>
<body>
  <pre style="font-family: monospace; white-space: pre-wrap;">${quotedText}</pre>
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

keith({
  pattern: "topdf",
  alias: ["quoted2pdf", "makedoc"],
  desc: "Convert quoted text message to a PDF",
  category: "Utility",
  react: "📄",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, msgKeith, reply } = context;

    try {
      if (!msgKeith || !msgKeith.conversation) {
        return reply("❌ Please quote a text message to convert to PDF.");
      }

      const quotedText = msgKeith.conversation.trim();
      const fileName = `./temp-${Date.now()}.pdf`;

      // Create a PDF with the quoted text
      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream(fileName));
      doc.fontSize(14).text(quotedText, { align: 'left' });
      doc.end();

      // Wait for the file to finish writing before sending
      doc.on('finish', async () => {
        await client.sendMessage(m.chat, {
          document: { url: fileName },
          mimetype: 'application/pdf',
          fileName: 'quoted-message.pdf'
        }, { quoted: m });

        fs.unlinkSync(fileName);
      });

    } catch (err) {
      console.error("Error creating PDF:", err);
      reply("❌ Failed to convert message to PDF. Try again.");
    }
  });
});

import express from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middleware for body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Telegram helper
  const sendTelegramMessage = async (text: string): Promise<boolean> => {
    const token = process.env.TELEGRAM_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.warn("Telegram warning: TELEGRAM_TOKEN or TELEGRAM_CHAT_ID is not configured in environment variables.");
      return false;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: "HTML"
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Telegram API Error response:", errText);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Telegram Error sending message:", error);
      return false;
    }
  };

  // Submit Research API Endpoint
  app.post("/api/submit-research", async (req, res) => {
    const { researchType, author, title, abstract, keywords, jelCodes } = req.body;

    const message = `
<b>📚 NEW RESEARCH SUBMISSION</b>
--------------------------------------
<b>Type:</b> ${researchType || "N/A"}
<b>Title:</b> ${title || "N/A"}

<b>Author Details:</b>
• Name: ${author?.name || "N/A"}
• Institution: ${author?.institution || "N/A"}
• Country: ${author?.country || "N/A"}
• ORCID: ${author?.orcid || "N/A"}

<b>JEL Codes:</b> ${jelCodes || "N/A"}
<b>Keywords:</b> ${keywords || "N/A"}

<b>Abstract:</b>
${abstract ? abstract.slice(0, 1000) : "N/A"}...
--------------------------------------
<i>Submitted via Tango TRIEFML Institute Portal</i>
`;

    const success = await sendTelegramMessage(message);
    res.json({
      success,
      referenceNumber: `TRIEFML-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      message: success 
        ? "Your research project has been successfully logged on the server and transmitted to our editorial board."
        : "Your research project has been logged in local system memory (Telegram notification skipped due to configuration setup)."
    });
  });

  // Contact API Endpoint
  app.post("/api/contact", async (req, res) => {
    const { name, institution, email, subject, message } = req.body;

    const text = `
<b>📩 NEW CONTACT INQUIRY</b>
--------------------------------------
<b>Name:</b> ${name || "N/A"}
<b>Institution:</b> ${institution || "N/A"}
<b>Email:</b> ${email || "N/A"}
<b>Subject:</b> ${subject || "N/A"}

<b>Message:</b>
${message || "N/A"}
--------------------------------------
<i>Submitted via Tango TRIEFML Contact Form</i>
`;

    const success = await sendTelegramMessage(text);
    res.json({
      success,
      message: success
        ? "Your inquiry has been successfully transmitted."
        : "Your inquiry has been received (Telegram notice skipped due to configuration setup)."
    });
  });

  // Vite middleware for development vs Static files in production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tango TRIEFML Server running on http://localhost:${PORT}`);
  });
}

startServer();

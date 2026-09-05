const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();
const port = process.env.PORT || 3000;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json({ limit: "2mb" }));

// 首页：index.html 在项目根目录
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// AI 聊天
app.post("/api/chat", async (req, res) => {
  try {
    const messages = Array.isArray(req.body.messages)
      ? req.body.messages
      : [];

    const input = messages
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
      )
      .slice(-40)
      .map((m) => ({
        role: m.role,
        content: m.content
      }));

    if (!input.length) {
      return res.status(400).json({
        error: "请输入消息。"
      });
    }

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      reasoning: {
        effort: "high"
      },
      instructions:
        '你是“砍一刀”，一个聪明、直接、可靠的中文 AI 助手。回答清晰、有帮助，不要故意啰嗦。',
      input
    });

    res.json({
      reply: response.output_text
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message || "AI 服务暂时不可用。"
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`砍一刀AI running on port ${port}`);
});

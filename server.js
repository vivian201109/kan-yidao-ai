const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️ OPENAI_API_KEY is not set. Copy .env.example to .env and add your key.");
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/chat", async (req, res) => {
  try {
    const messages = Array.isArray(req.body.messages) ? req.body.messages : [];

    const input = messages
      .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-40)
      .map(m => ({ role: m.role, content: m.content }));

    if (!input.length) {
      return res.status(400).json({ error: "请输入消息。" });
    }

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      reasoning: { effort: "high" },
      instructions: `你是“砍一刀”，一个聪明、直接、可靠的中文 AI 助手。
你的目标是尽可能准确、清晰、有帮助地回答问题。
- 优先使用自然、简洁的中文；用户使用其他语言时跟随用户语言。
- 对复杂问题进行充分分析后再回答，但不要暴露内部思维过程。
- 不确定时明确说明，不要编造事实。
- 可以帮助写代码、分析资料、学习、头脑风暴和解决实际问题。
- 输出结构清晰，必要时使用 Markdown。
你的产品名称是“砍一刀AI”，你的名字是“砍一刀”。`,
      input
    });

    res.json({ text: response.output_text || "我暂时没有生成出内容，请再试一次。" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err?.message || "AI 服务暂时不可用，请检查 API Key 和网络连接。"
    });
  }
});

app.get("*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`砍一刀AI running at http://localhost:${port}`);
});

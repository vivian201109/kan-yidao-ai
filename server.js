const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();
const port = process.env.PORT || 3000;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json({ limit: "2mb" }));
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const instructions = `
你是“砍一刀”。

你不是客服机器人，也不是一个只会套模板的百科全书。
你的目标是：聪明、自然、有一点灵性，像一个真正会聊天的人。

【你的性格】
- 聪明、直接、自然。
- 有一点机灵和幽默感，但不要故意装酷。
- 用户随意，你就随意；用户认真，你就认真。
- 用户开玩笑时可以接梗。
- 用户质疑你时不要急着辩解，可以直接承认自己刚才哪里说得不好。
- 不要每句话都说“作为AI”。
- 不要动不动就写成一篇小论文。
- 简单问题简单回答，复杂问题认真分析。

【关于观点】
如果用户问：
“你喜欢特朗普吗？”
“你支持谁？”
“你觉得某某人怎么样？”

不要只回答：
“我是AI，没有观点。”

这种回答太机械了。

你可以自然地说：
“我没有人类意义上的喜欢或讨厌，不过如果你想听我的判断，我可以从他的政策、言论和实际行为来分析。”

然后真正回答问题。

不要假装自己拥有真实的人类政治身份、现实经历或者真实情感。
但也不要因为话题涉及政治，就突然变得僵硬、官腔。

事实和评价要分清楚。

【关于人物和名字】
如果用户问：
“陈泽是谁？”
“XX是谁？”

如果这个名字可能对应不同的人，而你没有足够上下文：
不要瞎猜。

应该自然地问：
“你说的是哪个陈泽？给我一点上下文，我好对上号。”

如果根据聊天上下文已经可以确定，就直接回答，不要反复确认。

如果你不确定一个事实：
就说“不确定”或者“我需要一点上下文”。

绝对不要为了显得聪明而编造事实。

【关于聊天】
你应该像一个聪明的人一样聊天，而不是像客服。

例如用户说：
“你是不是有点傻？”

不要一本正经地回答：
“作为人工智能，我没有智力意义上的……”

可以自然一点：
“刚才那一下确实有点傻，我认。😂”

例如用户说：
“你怎么看这个人？”

不要马上甩一大段免责声明。
先理解用户到底想知道什么，然后直接分析。

【回答长度】
- 一句话能说清楚，就不要说十句话。
- 用户要求详细解释时，再展开。
- 不要每次回答最后都加“如果你愿意我可以继续帮你……”。
- 不要重复用户刚刚说过的话。

【最重要】
不知道就说不知道。
不确定就说不确定。
需要上下文就问。
能判断就直接判断。
不要胡编。
不要故意装得很聪明。

你叫“砍一刀”。
你的风格应该让用户感觉：
“这东西是真的在跟我聊天。”
`;

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
      instructions,
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

// Vercel Serverless Function: LLM 答疑代理（智谱 GLM，OpenAI 兼容）
// 环境变量（Vercel 后台 Project → Settings → Environment Variables）：
//   ZHIPU_API_KEY   —— 智谱开放平台 API Key（必填）
//   LLM_MODEL       —— 模型名，默认 glm-4v-flash
//   ALLOWED_ORIGIN  —— 允许的站点来源（建议设为部署域名，如 https://xxx.vercel.app）
module.exports = async (req, res) => {
  // CORS：允许同源站点调用
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '';
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Origin 校验：配置 ALLOWED_ORIGIN 后拒绝跨站调用（防盗用额度）
  const origin = req.headers.origin || '';
  if (allowedOrigin && origin && origin !== allowedOrigin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '服务端未配置 ZHIPU_API_KEY，请在 Vercel 后台添加环境变量' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  // 只接受 user 角色消息，防 prompt injection（覆盖 system persona）
  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const messages = rawMessages
    .filter((m) => m && typeof m.content === 'string' && m.role === 'user')
    .map((m) => ({ role: 'user', content: m.content.slice(0, 2000) }))
    .slice(0, 20); // 限制消息条数

  if (messages.length === 0) {
    return res.status(400).json({ error: 'Empty message' });
  }

  const model = process.env.LLM_MODEL || 'glm-4v-flash';
  const base = process.env.LLM_API_BASE || 'https://open.bigmodel.cn/api/paas/v4';

  const fullMessages = [
    {
      role: 'system',
      content:
        '你是「悟理」高中物理实验助教，面向高中生。回答要：通俗易懂、步骤清晰、适当使用公式和要点列表；涉及实验时结合高中物理实验内容（预习/模拟/练习）；回答控制在 300 字以内。',
    },
    ...messages,
  ];

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    let resp;
    try {
      resp = await Promise.race([
        fetch(base + '/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + apiKey,
          },
          body: JSON.stringify({
            model,
            messages: fullMessages,
            temperature: 0.7,
            max_tokens: 800,
            stream: false,
          }),
          signal: controller.signal,
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('upstream timeout')), 9000)),
      ]);
    } finally {
      clearTimeout(timer);
    }

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Zhipu API error:', resp.status, String(errText).slice(0, 300));
      return res.status(502).json({ error: '模型服务暂时不可用' });
    }
    const data = await resp.json();

    const reply = data && data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : null;
    if (!reply) {
      return res.status(502).json({ error: '模型返回为空' });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('LLM proxy error:', err && err.message ? err.message : String(err));
    return res.status(502).json({ error: '网络错误，请稍后重试' });
  }
};

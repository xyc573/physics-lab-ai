// Netlify Function: LLM 答疑代理（智谱 GLM，OpenAI 兼容）
// 环境变量（在 Netlify 后台 Site settings → Environment variables 配置）：
//   ZHIPU_API_KEY   —— 智谱开放平台 API Key（必填）
//   LLM_MODEL       —— 模型名，默认 glm-4v-flash
//   ALLOWED_ORIGIN  —— 允许的站点来源（建议设为部署域名）
export default async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Origin 校验：拒绝跨站调用（防止盗用额度）
  const origin = event.headers.origin || event.headers['x-forwarded-host'] || '';
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '';
  if (origin && allowedOrigin && origin !== allowedOrigin) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
  }

  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '服务端未配置 ZHIPU_API_KEY，请在 Netlify 后台添加环境变量' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  // 只接受 user 角色的消息，防止 prompt injection（覆盖 system persona）
  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const messages = rawMessages
    .filter((m) => m && typeof m.content === 'string' && m.role === 'user')
    .map((m) => ({ role: 'user', content: m.content.slice(0, 2000) }));

  if (messages.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Empty message' }) };
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
    const resp = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 800,
        stream: false,
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error('Zhipu API error:', resp.status, JSON.stringify(data).slice(0, 300));
      return { statusCode: 502, body: JSON.stringify({ error: '模型服务暂时不可用' }) };
    }

    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) {
      return { statusCode: 502, body: JSON.stringify({ error: '模型返回为空' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error('LLM proxy error:', err.message);
    return { statusCode: 502, body: JSON.stringify({ error: '网络错误，请稍后重试' }) };
  }
};

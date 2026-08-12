// Netlify Function (v1/CJS): LLM 答疑代理（智谱 GLM，OpenAI 兼容）
// 环境变量：ZHIPU_API_KEY（必填）、LLM_MODEL、ALLOWED_ORIGIN
const json = (data, status = 200) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(data),
});

// 手动超时（兼容所有 Node 版本）
const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('upstream timeout')), ms)),
  ]);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json({ error: 'Method Not Allowed' }, 405);
  }

  // Origin 校验：配置 ALLOWED_ORIGIN 后拒绝跨站调用（防盗用额度）
  const origin = event.headers.origin || '';
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '';
  if (origin && allowedOrigin && origin !== allowedOrigin) {
    return json({ error: 'Forbidden' }, 403);
  }

  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) {
    return json({ error: '服务端未配置 ZHIPU_API_KEY，请在 Netlify 后台添加环境变量' }, 500);
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  // 只接受 user 角色消息，防 prompt injection（覆盖 system persona）
  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const messages = rawMessages
    .filter((m) => m && typeof m.content === 'string' && m.role === 'user')
    .map((m) => ({ role: 'user', content: m.content.slice(0, 2000) }))
    .slice(0, 20); // 限制消息条数

  if (messages.length === 0) {
    return json({ error: 'Empty message' }, 400);
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
      resp = await withTimeout(
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
        9000
      );
    } finally {
      clearTimeout(timer);
    }

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Zhipu API error:', resp.status, String(errText).slice(0, 300));
      return json({ error: '模型服务暂时不可用' }, 502);
    }
    const data = await resp.json();

    const reply = data && data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : null;
    if (!reply) {
      return json({ error: '模型返回为空' }, 502);
    }

    return json({ reply });
  } catch (err) {
    console.error('LLM proxy error:', err && err.message ? err.message : String(err));
    return json({ error: '网络错误，请稍后重试' }, 502);
  }
};

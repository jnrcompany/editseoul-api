// Cafe24 OAuth 인증코드 → 토큰 교환
const MALL_ID = process.env.CAFE24_MALL_ID || 'lusisbeauty1004';

module.exports = async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.status(400).send('인증코드(code)가 없습니다.');

  const resp = await fetch(
    `https://${MALL_ID}.cafe24api.com/api/v2/oauth/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(
          process.env.CAFE24_CLIENT_ID + ':' + process.env.CAFE24_CLIENT_SECRET
        ).toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'https://editseoul-api.vercel.app/api/auth/callback',
      }).toString(),
    }
  );

  const data = await resp.json();

  if (!data.access_token) {
    return res.status(500).send('토큰 발급 실패: ' + JSON.stringify(data));
  }

  // 발급된 토큰을 화면에 표시 → Vercel 환경변수에 저장
  res.send(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <title>토큰 발급 완료</title>
      <style>
        body { font-family: sans-serif; max-width: 700px; margin: 60px auto; padding: 0 20px; }
        h2 { color: #222; }
        .token-box { background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 16px 0; word-break: break-all; }
        .label { font-size: 12px; font-weight: 700; color: #888; margin-bottom: 6px; }
        .value { font-size: 13px; color: #222; font-family: monospace; }
        .guide { background: #fffbe6; border: 1px solid #ffe58f; border-radius: 8px; padding: 20px; margin-top: 24px; }
        .guide ol { margin: 10px 0 0; padding-left: 20px; line-height: 2; }
      </style>
    </head>
    <body>
      <h2>✅ 토큰 발급 완료</h2>
      <p>아래 값을 Vercel 환경변수에 저장하세요.</p>

      <div class="token-box">
        <div class="label">CAFE24_ACCESS_TOKEN</div>
        <div class="value">${data.access_token}</div>
      </div>
      <div class="token-box">
        <div class="label">CAFE24_REFRESH_TOKEN</div>
        <div class="value">${data.refresh_token}</div>
      </div>
      <div class="token-box">
        <div class="label">CAFE24_TOKEN_EXPIRES_AT (timestamp ms)</div>
        <div class="value">${new Date(data.expires_at).getTime()}</div>
      </div>

      <div class="guide">
        <strong>📋 Vercel 환경변수 저장 방법</strong>
        <ol>
          <li>Vercel 대시보드 → 프로젝트 → Settings → Environment Variables</li>
          <li>위 세 값을 각각 이름/값으로 추가</li>
          <li>저장 후 Redeploy</li>
        </ol>
      </div>
    </body>
    </html>
  `);
};

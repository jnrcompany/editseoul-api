// 토큰 관리 헬퍼
// Cafe24 access_token은 2시간 유효, refresh_token으로 갱신

const MALL_ID = process.env.CAFE24_MALL_ID || 'lusisbeauty1004';

async function getValidToken() {
  const accessToken = process.env.CAFE24_ACCESS_TOKEN;
  const expiresAt = process.env.CAFE24_TOKEN_EXPIRES_AT;

  // 만료 10분 전이면 갱신
  const isExpired = !expiresAt || Date.now() > (parseInt(expiresAt, 10) - 10 * 60 * 1000);

  if (!isExpired && accessToken) {
    return accessToken;
  }

  // refresh_token으로 갱신
  return await refreshToken();
}

async function refreshToken() {
  const refreshToken = process.env.CAFE24_REFRESH_TOKEN;
  if (!refreshToken) throw new Error('CAFE24_REFRESH_TOKEN 환경변수가 없습니다.');

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
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
    }
  );

  const data = await resp.json();
  if (!data.access_token) throw new Error('토큰 갱신 실패: ' + JSON.stringify(data));

  // ⚠️ Vercel 환경변수는 런타임에 자동 업데이트 안 됨
  // 갱신된 토큰은 콘솔 로그로 확인 후 수동 업데이트 필요
  console.log('[Token Refreshed]', {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
  });

  return data.access_token;
}

module.exports = { getValidToken, MALL_ID };

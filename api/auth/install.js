// Cafe24 앱 설치 시작 → OAuth 인증 페이지로 리다이렉트
module.exports = function handler(req, res) {
  const { mall_id } = req.query;
  if (!mall_id) return res.status(400).send('mall_id가 없습니다.');

  const clientId = process.env.CAFE24_CLIENT_ID;
  const redirectUri = 'https://editseoul-api.vercel.app/api/auth/callback';
  const scope = ['mall.read_product'].join(',');

  const authUrl =
    `https://${mall_id}.cafe24api.com/api/v2/oauth/authorize` +
    `?response_type=code` +
    `&client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}`;

  res.redirect(authUrl);
};

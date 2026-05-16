const { getValidToken, MALL_ID } = require('./_token');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const token = await getValidToken();

    // 가장 단순한 API: 쇼핑몰 기본 정보 조회
    const resp = await fetch(
      `https://${MALL_ID}.cafe24api.com/api/v2/store`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Cafe24-Client-Id': process.env.CAFE24_CLIENT_ID,
          'Content-Type': 'application/json',
          'X-Cafe24-Api-Version': '2022-09-01',
        },
      }
    );

    const body = await resp.text();
    return res.status(resp.status).send(body);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

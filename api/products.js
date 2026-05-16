// 브랜드별 상품 조회 API
// GET /api/products?brand_code=B000000F&limit=100

const { getValidToken, MALL_ID } = require('./_token');

module.exports = async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', 'https://editseoul.co.kr');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { brand_code, limit = 100 } = req.query;
  if (!brand_code) {
    return res.status(400).json({ error: 'brand_code 파라미터가 필요합니다.' });
  }

  try {
    const token = await getValidToken();

    const url =
      `https://${MALL_ID}.cafe24api.com/api/v2/products` +
      `?brand_code=${encodeURIComponent(brand_code)}` +
      `&limit=${limit}` +
      `&display=T` +
      `&selling=T`;

    const resp = await fetch(url, {
  headers: {
    Authorization: `Bearer ${token}`,
    'X-Cafe24-Client-Id': process.env.CAFE24_CLIENT_ID,
    'Content-Type': 'application/json',
    'X-Cafe24-Api-Version': '2024-06-01',
  },
});

    if (!resp.ok) {
      const body = await resp.text();
      return res.status(resp.status).json({ error: body });
    }

    const data = await resp.json();
    return res.status(200).json({ products: data.products || [] });

  } catch (err) {
    console.error('[products] 오류:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

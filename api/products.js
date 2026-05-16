module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://editseoul.co.kr');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { brand_code, limit = 100 } = req.query;
  const MALL_ID = process.env.CAFE24_MALL_ID || 'lusisbeauty1004';

  if (!brand_code) {
    return res.status(400).json({ error: 'brand_code required' });
  }

  try {
    // 카페24 스토어프론트 내부 상품 목록 엔드포인트 (OAuth 불필요)
    const url = `https://${MALL_ID}.cafe24.com/exec/front/Product/productList`
      + `?brand_code=${encodeURIComponent(brand_code)}`
      + `&limit=${limit}`
      + `&json=1`;

    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json, text/plain, */*',
      }
    });

    const text = await resp.text();
    console.log('[PROXY] status:', resp.status, '| body preview:', text.slice(0, 300));

    // JSON 파싱 시도
    try {
      const data = JSON.parse(text);
      return res.json(data);
    } catch (e) {
      // JSON이 아니면 원본 텍스트와 상태 반환 (디버그용)
      return res.json({ status: resp.status, raw: text.slice(0, 500) });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

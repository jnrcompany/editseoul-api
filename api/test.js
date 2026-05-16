const { getValidToken } = require('./_token');

const MALL_ID = process.env.CAFE24_MALL_ID || 'lusisbeauty1004';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const token = await getValidToken();
    
    // 브랜드 코드 없이 상품 1개만 요청 (가장 단순한 호출)
    const url = `https://${MALL_ID}.cafe24api.com/api/v2/products?limit=1`;
    
    const resp = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Cafe24-Client-Id': process.env.CAFE24_CLIENT_ID,
        'Content-Type': 'application/json',
        'X-Cafe24-Api-Version': '2022-09-01',
      }
    });
    
    const body = await resp.json();
    
    res.json({
      status: resp.status,
      mall_id: MALL_ID,
      client_id: process.env.CAFE24_CLIENT_ID,
      token_prefix: token ? token.slice(0, 15) + '...' : 'NONE',
      cafe24_response: body
    });
    
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const { getValidToken } = require('./_token');
const MALL_ID = process.env.CAFE24_MALL_ID || 'lusisbeauty1004';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const token = await getValidToken();
    
    // X-Cafe24-Client-Id 헤더 없이 호출
    const url = `https://${MALL_ID}.cafe24api.com/api/v2/products?limit=1`;
    const resp = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Cafe24-Api-Version': '2022-09-01',
      }
    });
    
    const body = await resp.json();
    res.json({ status: resp.status, result: body });
    
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

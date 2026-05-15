/**
 * Vercel 서버리스 함수 - Cafe24 상품 API 프록시
 */

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', 'https://editseoul.co.kr');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const brandCode = req.query.brand_code || '';
    const limit = req.query.limit || 100;

    if (!brandCode) {
      return res.status(400).json({ error: 'brand_code query parameter required' });
    }

    const clientId = process.env.CAFE24_CLIENT_ID;
    const clientSecret = process.env.CAFE24_CLIENT_SECRET;
    const mallId = process.env.CAFE24_MALL_ID || 'editseoul';

    if (!clientId || !clientSecret) {
      console.error('[Vercel API] 환경변수 누락');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Step 1: Cafe24 OAuth 토큰 발급
    const tokenUrl = `https://${mallId}.cafe24api.com/oauth/token`;
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=mall.read_product',
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[Vercel API] 토큰 발급 실패:', tokenResponse.status);
      return res.status(tokenResponse.status).json({ 
        error: 'Failed to obtain token from Cafe24'
      });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.status(500).json({ error: 'No access token in response' });
    }

    // Step 2: 상품 목록 조회
    const productsUrl = `https://${mallId}.cafe24api.com/api/v2/products`
      + `?brand_code=${encodeURIComponent(brandCode)}`
      + `&limit=${limit}`;

    const productsResponse = await fetch(productsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!productsResponse.ok) {
      const errorText = await productsResponse.text();
      console.error('[Vercel API] 상품 조회 실패:', productsResponse.status);
      return res.status(productsResponse.status).json({ 
        error: 'Failed to fetch products from Cafe24'
      });
    }

    const productsData = await productsResponse.json();

    // Step 3: 응답 반환
    return res.status(200).json(productsData);

  } catch (error) {
    console.error('[Vercel API] 에러:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// /api/products.js
export default async function handler(req, res) {
  const { brand_code, limit = 100 } = req.query;

  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', 'https://editseoul.co.kr');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!brand_code) {
    return res.status(400).json({ error: 'brand_code 필수' });
  }

  try {
    // Step 1: OAuth 토큰 획득
    const mallId = process.env.CAFE24_MALL_ID || 'editseoul';
    const clientId = process.env.CAFE24_CLIENT_ID;
    const clientSecret = process.env.CAFE24_CLIENT_SECRET;

    console.log(`[디버그] OAuth 토큰 요청 - Mall: ${mallId}, ClientID: ${clientId?.substring(0, 8)}...`);

    const tokenUrl = `https://${mallId}.cafe24api.com/api/v2/oauth/token`;
    const authHeader = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    console.log(`[디버그] 토큰 URL: ${tokenUrl}`);

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&scope=mall.read_product'
    });

    console.log(`[디버그] 토큰 응답 상태: ${tokenResponse.status}`);
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error(`[오류] 토큰 요청 실패:`, tokenData);
      return res.status(tokenResponse.status).json({ 
        error: 'OAuth 토큰 획득 실패',
        details: tokenData 
      });
    }

    const accessToken = tokenData.access_token;
    console.log(`[디버그] 토큰 획득됨: ${accessToken?.substring(0, 20)}...`);

    // Step 2: 상품 조회
    const productUrl = `https://${mallId}.cafe24api.com/api/v2/products?brand_code=${encodeURIComponent(brand_code)}&limit=${limit}`;
    
    console.log(`[디버그] 상품 요청 URL: ${productUrl}`);

    const productResponse = await fetch(productUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`[디버그] 상품 응답 상태: ${productResponse.status}`);
    const productData = await productResponse.json();

    if (!productResponse.ok) {
      console.error(`[오류] 상품 요청 실패:`, productData);
      return res.status(productResponse.status).json({ 
        error: '상품 조회 실패',
        details: productData 
      });
    }

    return res.status(200).json(productData);

  } catch (error) {
    console.error('[심각한 오류]', error.message, error.stack);
    return res.status(500).json({ 
      error: '서버 오류',
      message: error.message
    });
  }
}

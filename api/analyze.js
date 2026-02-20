export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const API_KEY = process.env.GEMINI_API_KEY;
  // 가장 호환성이 높은 v1 엔드포인트와 모델명을 사용합니다.
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `SIP 로그를 분석해서 mermaid.js sequenceDiagram 코드만 딱 출력해. 설명이나 앞뒤 마크다운(백틱)은 절대 넣지마. 
            참여자: 외부IP, UPROXY, 내부망
            로그내용: ${req.body.log}`
          }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ mermaidCode: `note right of UPROXY: API Error: ${data.error.message}` });
    }

    // AI 응답에서 mermaid 코드만 추출
    let code = data.candidates[0].content.parts[0].text;
    res.status(200).json({ mermaidCode: code });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

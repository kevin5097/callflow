export default async function handler(req, res) {
  const API_KEY = process.env.GEMINI_API_KEY;
  // 모델명을 블로그 예시처럼 안정적인 것으로 변경하거나 v1beta 대신 v1 사용 시도
  const MODEL_NAME = "gemini-1.5-flash"; 
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `당신은 SIP 전문가입니다. 다음 로그를 보고 mermaid.js 시퀀스 다이어그램 코드만 출력하세요. 다른 설명은 금지합니다.\n\n${req.body.log}` }] }]
      })
    });

    const data = await response.json();
    
    // 블로그 소스처럼 응답을 그대로 전달하되, 우리는 mermaid 코드만 뽑아서 전달
    if (response.ok) {
      const mermaidCode = data.candidates[0].content.parts[0].text;
      res.status(200).json({ mermaidCode });
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    const { log } = req.body;

    // v1beta 주소와 모델명을 정확히 매칭
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `당신은 SIP 엔지니어입니다. 다음 로그를 분석해 Mermaid 시퀀스 다이어그램 코드로 변환하세요. 설명 없이 mermaid 코드만 출력하세요.\n\n${log}`
          }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return res.status(200).json({ mermaidCode: `Note right of AI: 에러 발생\nNote right of AI: ${data.error.message}` });
    }

    const mermaidCode = data.candidates[0].content.parts[0].text;
    res.status(200).json({ mermaidCode });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

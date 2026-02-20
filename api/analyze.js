export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    const { log } = req.body;

    // 404 에러 방지를 위한 정확한 엔드포인트와 모델 경로
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `당신은 SIP 엔지니어입니다. 다음 로그를 분석해서 mermaid.js 시퀀스 다이어그램 코드로 변환하세요. 설명 없이 오직 mermaid 코드만 답변하세요.\n\n${log}`
          }]
        }]
      })
    });

    const data = await response.json();

    // 상세 에러 로깅 (Vercel 로그에서 확인 가능)
    if (data.error) {
      console.error("Gemini API Error Detail:", JSON.stringify(data.error, null, 2));
      return res.status(200).json({ 
        mermaidCode: `Note right of AI: 에러 발생 (${data.error.code})\nNote right of AI: ${data.error.message}` 
      });
    }

    if (!data.candidates || !data.candidates[0].content) {
      return res.status(200).json({ mermaidCode: `Note right of AI: 응답을 생성할 수 없습니다.` });
    }

    const mermaidCode = data.candidates[0].content.parts[0].text;
    res.status(200).json({ mermaidCode });

  } catch (error) {
    console.error("Server Error:", error.message);
    res.status(500).json({ error: error.message });
  }
}

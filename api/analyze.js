export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    const { log } = req.body;

    // v1beta 주소 사용 시 모델명을 'gemini-1.5-flash'로 짧게 지정하거나 
    // 전체 경로 'models/gemini-1.5-flash'를 사용하여 재시도합니다.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `당신은 SIP 엔지니어입니다. 다음 SIP 로그를 분석하여 mermaid.js 시퀀스 다이어그램 코드로 변환하세요. 설명 없이 오직 mermaid 코드만 답변하세요.\n\n${log}`
          }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Gemini API 상세 에러:", data.error);
      return res.status(200).json({ 
        mermaidCode: `Note right of AI: API 에러 발생\nNote right of AI: ${data.error.message}` 
      });
    }

    if (!data.candidates || !data.candidates[0].content) {
      return res.status(200).json({ mermaidCode: `Note right of AI: 응답 생성 실패` });
    }

    const mermaidCode = data.candidates[0].content.parts[0].text;
    res.status(200).json({ mermaidCode });

  } catch (error) {
    console.error("서버 내부 오류:", error.message);
    res.status(500).json({ error: error.message });
  }
}

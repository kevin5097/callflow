export default async function handler(req, res) {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "환경변수 GEMINI_API_KEY가 설정되지 않았습니다." });
    }

    const { log } = req.body;
    if (!log) {
      return res.status(400).json({ error: "분석할 로그 데이터가 없습니다." });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `아래 SIP 로그를 분석해서 mermaid.js 시퀀스 다이어그램 코드로 변환해줘. 오직 mermaid 코드만 답변해:\n\n${log}` }] }]
      })
    });

    const data = await response.json();

    // API 응답 에러 체크
    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return res.status(response.status).json({ error: data.error.message });
    }

    // candidates 존재 여부 체크 (에러 방지 핵심)
    if (!data.candidates || data.candidates.length === 0) {
      console.error("No candidates found in response:", data);
      return res.status(500).json({ error: "AI가 응답을 생성하지 못했습니다. 로그 형식을 확인해주세요." });
    }

    const mermaidCode = data.candidates[0].content.parts[0].text;
    res.status(200).json({ mermaidCode });

  } catch (error) {
    console.error("Server Internal Error:", error);
    res.status(500).json({ error: "서버 내부 오류가 발생했습니다: " + error.message });
  }
}

export default async function handler(req, res) {
  const { log } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY; // Vercel 환경변수에서 로드

  const prompt = `당신은 SIP,inap   엔지니어입니다. 다음 로그를 분석해 Mermaid 시퀀스 다이어그램 코드로 변환하세요. 
  반드시 외부IP, Proxy, 내부망을 구분하고 차단 사유(Q.850 등)가 있다면 주석을 다세요. 
  응답은 반드시 mermaid 코드만 출력하세요.\n\n${log}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
    method: 'POST',
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const json = await response.json();
  const mermaidCode = json.candidates[0].content.parts[0].text;
  
  res.status(200).json({ mermaidCode });
}

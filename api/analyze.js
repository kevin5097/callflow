export default async function handler(req, res) {
  // 1. POST 요청이 아닌 경우 차단
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const API_KEY = process.env.GEMINI_API_KEY;

    // 2. 환경변수 설정 확인
    if (!API_KEY) {
      console.error("환경변수 GEMINI_API_KEY가 설정되지 않았습니다.");
      return res.status(500).json({ error: "서버 환경변수 설정(API_KEY)을 확인해주세요." });
    }

    const { log } = req.body;
    if (!log) {
      return res.status(400).json({ error: "분석할 SIP 로그 데이터가 입력되지 않았습니다." });
    }

    // 3. Gemini API 호출 (v1 정식 버전 및 정확한 모델 경로 사용)
    // 404 에러 방지를 위해 URL 구조를 최적화했습니다.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `당신은 전설적인 SIP 네트워크 엔지니어입니다. 
            다음 SIP 로그를 분석하여 mermaid.js 시퀀스 다이어그램 코드로 변환하세요.
            
            지침:
            1. 외부 IP, UPROXY, 상위/내부 망을 구분하여 참여자(participant)로 정의하세요.
            2. 주요 메시지(INVITE, Trying, Session Progress, CANCEL, 410, 487 등)를 흐름에 포함하세요.
            3. Q.850 원인 코드나 특이사항(FPBX 스캐닝 등)이 있다면 Note를 추가하세요.
            4. 오직 mermaid 코드만 답변하고, 설명이나 마크다운 백틱(\`\`\`)은 생략하세요.

            로그 데이터:
            ${log}`
          }]
        }]
      })
    });

    const data = await response.json();

    // 4. API 응답 에러 핸들링
    if (data.error) {
      console.error("Gemini API 상세 에러:", data.error);
      return res.status(response.status || 500).json({ 
        error: `Gemini API 에러: ${data.error.message}` 
      });
    }

    // 5. 응답 데이터 추출 및 검증 (TypeError 방지)
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      console.error("AI가 유효한 응답을 생성하지 못했습니다:", data);
      return res.status(500).json({ error: "AI 응답 생성 실패. 로그 내용이 너무 짧거나 분석 불가능합니다." });
    }

    const mermaidCode = data.candidates[0].content.parts[0].text;
    
    // 6. 최종 결과 전송
    res.status(200).json({ mermaidCode });

  } catch (error) {
    console.error("서버 내부 오류 발생:", error);
    res.status(500).json({ error: `서버 오류: ${error.message}` });
  }
}

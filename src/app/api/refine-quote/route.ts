import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return NextResponse.json({ error: 'GEMINI_API_KEY yapılandırılmamış.' }, { status: 500 });
  }

  const { currentText, instruction } = await req.json();

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: `Sen BrewOps şirketinin satış asistanısın. Teklif metinlerini kullanıcının talimatlarına göre güncellersin.

Kurallar:
- Yalnızca Türkçe yaz.
- Markdown kullanma, düz paragraf metni yaz.
- Metnin genel yapısını ve bilgilerini koru, sadece talimata göre tonu veya içeriği güncelle.
- Teklifin profesyonelliğini ve BrewOps markasını koru.`,
  });

  const prompt = `Aşağıdaki teklif metnini şu talimata göre güncelle: "${instruction}"

Mevcut metin:
${currentText}`;

  try {
    const result = await model.generateContent(prompt);
    return NextResponse.json({ text: result.response.text() });
  } catch (err) {
    console.error('Gemini refine error:', err);
    return NextResponse.json({ error: 'Metin güncellenirken hata oluştu.' }, { status: 500 });
  }
}

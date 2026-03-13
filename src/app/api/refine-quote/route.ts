import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const MODEL_NAMES = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-flash-latest'];

const SYSTEM_INSTRUCTION = `Sen BrewOps şirketinin satış asistanısın. Teklif metinlerini kullanıcının talimatlarına göre güncellersin.

Kurallar:
- Yalnızca Türkçe yaz.
- Markdown kullanma, düz paragraf metni yaz.
- Metnin genel yapısını ve bilgilerini koru, sadece talimata göre tonu veya içeriği güncelle.
- Teklifin profesyonelliğini ve BrewOps markasını koru.`;

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return NextResponse.json({ error: 'GEMINI_API_KEY yapılandırılmamış.' }, { status: 500 });
  }

  const { currentText, instruction } = await req.json();
  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `Aşağıdaki teklif metnini şu talimata göre güncelle: "${instruction}"

Mevcut metin:
${currentText}`;

  for (const modelName of MODEL_NAMES) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: SYSTEM_INSTRUCTION });
      const result = await model.generateContent(prompt);
      return NextResponse.json({ text: result.response.text() });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (
        message.includes('not found') ||
        message.includes('404') ||
        message.includes('deprecated') ||
        message.includes('429') ||
        message.includes('quota') ||
        message.includes('Too Many Requests')
      ) {
        continue;
      }
      console.error(`Gemini refine error (${modelName}):`, message);
      return NextResponse.json({ error: `Metin güncellenirken hata oluştu: ${message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Tüm Gemini modelleri kullanılamıyor. Lütfen biraz bekleyip tekrar deneyin.' }, { status: 503 });
}

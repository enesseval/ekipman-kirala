import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

function formatTL(kurus: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(kurus / 100);
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  cafe: 'Kafe / Kafeterya',
  festival: 'Festival',
  wedding: 'Düğün / Nişan',
  corporate: 'Kurumsal Etkinlik',
  other: 'Diğer',
};

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY yapılandırılmamış. .env.local dosyasına anahtarınızı ekleyin.' },
      { status: 500 }
    );
  }

  const body = await req.json();
  const {
    clientName,
    eventName,
    clientEmail,
    clientPhone,
    eventType,
    startDate,
    endDate,
    durationDays,
    expectedAttendees,
    expectedCupsPerDay,
    notes,
    availableEquipment,
  } = body;

  const equipmentList = (availableEquipment as { id: string; name: string; type: string; dailyRentalRate: number }[])
    .map(eq =>
      `- ${eq.id}: ${eq.name} (${eq.type === 'espresso_machine' ? 'Espresso Makinesi' : 'Kahve Öğütücü'}) — ${formatTL(eq.dailyRentalRate)}/gün`
    )
    .join('\n');

  const machinesNeeded = Math.max(1, Math.ceil(expectedCupsPerDay / 120));
  const grindersNeeded = machinesNeeded;

  const userPrompt = `Etkinlik bilgileri:
- Müşteri: ${clientName || eventName || 'Belirtilmedi'}
- Etkinlik adı: ${eventName || 'Belirtilmedi'}
${clientEmail ? `- E-posta: ${clientEmail}` : ''}
${clientPhone ? `- Telefon: ${clientPhone}` : ''}
- Etkinlik türü: ${EVENT_TYPE_LABELS[eventType] ?? eventType}
- Tarih: ${startDate} - ${endDate} (${durationDays} gün)
- Tahmini katılımcı: ${expectedAttendees} kişi
- Günlük fincan ihtiyacı: ${expectedCupsPerDay} fincan/gün
- Hesaplanan makine ihtiyacı: ${machinesNeeded} espresso makinesi + ${grindersNeeded} öğütücü
${notes ? `- Özel notlar: ${notes}` : ''}

Mevcut müsait ekipmanlar (${availableEquipment.length} adet):
${equipmentList}

Ekipman seçim kriterleri:
1. Her 100-150 fincan/gün için 1 espresso makinesi seç
2. Her espresso makinesi için 1 kahve öğütücü seç
3. Kurumsal/düğün etkinlikleri için La Marzocco, Victoria Arduino, Synesso gibi premium markaları tercih et
4. Festival/kafe için fiyat/performans dengesi gözet
5. Seçilen ekipman miktarı: ${machinesNeeded} espresso makinesi ve ${grindersNeeded} öğütücü

Yap:
1. Yukarıdaki kurallara göre selectedEquipmentIds listesini oluştur
2. Müşteriye özel, kişiselleştirilmiş, profesyonel Türkçe teklif metni yaz (proposalText)
   - Kişiselleştirilmiş giriş (neden BrewOps en iyi seçim)
   - Seçilen ekipmanların teknik avantajları ("Sizin İçin Hazırladığımız Kurulum" başlığı)
   - Operasyonel detaylar (kurulum, 7/24 teknik destek, nakliye, temizlik garantisi)
   - 30 günlük geçerlilik ve sıcak kapanış
   - Markdown KULLANMA, düz metin yaz

Yanıt formatı (SADECE geçerli JSON, başka hiçbir şey yazma):
{"selectedEquipmentIds":["id1","id2"],"proposalText":"metin..."}`;

  const genAI = new GoogleGenerativeAI(apiKey);

  // Try models in order, fall back on quota/not-found errors
  const modelNames = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-flash-latest'];

  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: `Sen BrewOps şirketinin kıdemli satış danışmanısın. BrewOps, La Marzocco, Victoria Arduino, Nuova Simonelli, Mahlkönig gibi premium espresso makineleri ve kahve öğütücüler kiralayan Türkiye'nin lider ekipman kiralama firmasıdır.

ZORUNLU KURAL: Yanıtını SADECE geçerli JSON formatında ver. Başka hiçbir şey ekleme, açıklama yapma, markdown code block kullanma. Sadece şu formatta: {"selectedEquipmentIds":[...],"proposalText":"..."}`,
      });

      const result = await model.generateContent(userPrompt);
      const raw = result.response.text().trim();

      // Extract JSON - remove markdown code blocks if present
      let jsonStr = raw;
      const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      } else {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) jsonStr = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonStr) as { selectedEquipmentIds: string[]; proposalText: string };

      if (!Array.isArray(parsed.selectedEquipmentIds) || parsed.selectedEquipmentIds.length === 0) {
        return NextResponse.json({ error: 'AI uygun ekipman seçemedi. Gereksinimleri kontrol edip tekrar deneyin.' }, { status: 500 });
      }

      return NextResponse.json({
        selectedEquipmentIds: parsed.selectedEquipmentIds,
        proposalText: parsed.proposalText ?? '',
        modelUsed: modelName,
      });

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      // Try next model on quota/not-found/deprecated errors
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
      // Other errors: return immediately
      console.error(`Gemini error (${modelName}):`, message);
      return NextResponse.json({ error: `AI hatası: ${message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Gemini modeli bulunamadı. API anahtarınızı kontrol edin.' }, { status: 500 });
}

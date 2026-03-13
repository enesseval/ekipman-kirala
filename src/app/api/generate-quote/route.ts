import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import type { QuoteLineItem } from '@/lib/types';

function formatTL(kurus: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(kurus / 100);
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return NextResponse.json({ error: 'GEMINI_API_KEY yapılandırılmamış. .env.local dosyasına anahtarınızı ekleyin.' }, { status: 500 });
  }

  const {
    clientName,
    eventName,
    clientPhone,
    clientEmail,
    lineItems,
    subtotalKurus,
    discountPercent,
    taxAmountKurus,
    totalKurus,
  } = await req.json();

  const equipmentLines = (lineItems as QuoteLineItem[])
    .map(
      (li) =>
        `- ${li.equipmentName} (${li.equipmentType === 'espresso_machine' ? 'Espresso Makinesi' : 'Kahve Öğütücü'}): ${li.days} gün × ${formatTL(li.dailyRate)}/gün = ${formatTL(li.subtotal)}`
    )
    .join('\n');

  const userPrompt = `Şu bilgilere göre profesyonel bir teklif metni yaz:

Müşteri: ${clientName || 'Belirtilmedi'}
Etkinlik: ${eventName || 'Belirtilmedi'}
${clientPhone ? `Telefon: ${clientPhone}` : ''}
${clientEmail ? `E-posta: ${clientEmail}` : ''}

Seçilen Ekipmanlar:
${equipmentLines}

Finansal Özet:
Ara Toplam: ${formatTL(subtotalKurus)}
${discountPercent > 0 ? `İndirim: %${discountPercent}` : ''}
KDV (%20): ${formatTL(taxAmountKurus)}
Genel Toplam: ${formatTL(totalKurus)}

Şu sırayla yaz (başlık numaraları veya madde işaretleri KULLANMA, sadece düz paragraflar):
1. Müşteriye özel, kişiselleştirilmiş ve etkileyici bir giriş (neden BrewOps en iyi seçim)
2. "Sizin İçin Hazırladığımız Kurulum" başlığı altında her ekipmanın teknik avantajını açıkla
3. Operasyonel Detaylar: kurulum, teknik destek garantisi, nakliye ve temizlik
4. Finansal özet (düz metin olarak, tablo YOK)
5. Teklifin 30 gün geçerli olduğunu belirten sıcak bir kapanış`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `Sen BrewOps şirketinin kıdemli satış danışmanısın. BrewOps, La Marzocco, Victoria Arduino, Nuova Simonelli, Mahlkönig gibi dünya markası premium espresso makineleri ve profesyonel kahve öğütücüler kiralayan, teknik servis ve barista desteği sunan Türkiye'nin lider ekipman kiralama firmasıdır.

Görevin: Müşteriye göre kişiselleştirilmiş, etkileyici ve satış odaklı teklifler yazmak.

Kesin kurallar:
- Yalnızca Türkçe yaz.
- Kurumsal ama sıcak, güven veren bir ton kullan.
- Şablon gibi değil, gerçek ve kişiselleştirilmiş bir teklif gibi yaz.
- Markdown (**, *, #, - liste) KULLANMA. Düz paragraf metni yaz.
- Başlık satırlarını büyük harfle yaz, madde işareti veya tire kullanma.
- Her ekipmanın neden seçildiğini teknik açıdan belirt (fincan kapasitesi, sıcaklık stabilitesi, servis kolaylığı gibi).
- BrewOps'un farkını mutlaka vurgula: 7/24 teknik destek, nakliye ve kurulum dahil, servis garantisi, yedek parça stoku.`,
  });

  try {
    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    return NextResponse.json({ text });
  } catch (err) {
    console.error('Gemini API error:', err);
    return NextResponse.json({ error: 'Teklif oluşturulurken hata oluştu.' }, { status: 500 });
  }
}

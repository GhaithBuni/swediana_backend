// utils/generateByggPDF.ts
import puppeteer from "puppeteer";

export async function generateCompanyInfoPDF(): Promise<Buffer> {
  const browser = await puppeteer.launch({
    // In Docker or some hosts you may need:
    // args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();

    // Build your HTML here. You can also import from a template file.
    const html = `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8"/>
<title>Swediana – Tjänsteinformation</title>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
  @page { size: A4; margin: 14mm 16mm 18mm 16mm; }
  body { font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,"Noto Sans","Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif; color:#111827; line-height:1.55; font-size:11.5pt; }
  .wrap { max-width:720px; margin:0 auto; }
  h1{font-size:24pt;color:#0ea5e9;margin:0 0 12px}
  h2{font-size:14.5pt;margin:18px 0 8px}
  p{margin:8px 0}
  .card{border:1px solid #e5e7eb;border-radius:10px;padding:12px 14px;margin:10px 0;background:#fff}
  .item{margin:8px 0;font-weight:600}
  .desc{color:#4b5563;margin:0 0 8px}
  .tick{color:#10b981;margin-right:6px}
  .footer{font-size:9.5pt;color:#6b7280;margin-top:12px}
</style>
</head>
<body>
<div class="wrap">
  <h1>Flytthjälp – Swediana</h1>
  <p>Oavsett om du ska flytta lokalt inom staden, mellan städer eller till en annan region, erbjuder vi professionell flytthjälp anpassad efter dina behov. Vi hanterar allt från små lägenheter till stora villor samt kontorsflyttar, och tar hand om dina möbler och ömtåliga föremål med största omsorg. Vi erbjuder även kompletta lösningar med packning, transport, bärhjälp och flyttstädning.</p>
  <p>Med <strong>Swediana</strong> får du tydliga priser utan dolda avgifter, nöjd-kund-garanti, möjlighet att flytta först och betala sen, samt trygg hantering av dina tillhörigheter med full ansvarsförsäkring. Vi arbetar dessutom med hållbara och klimatsmarta metoder för en miljövänlig flytt.</p>

  <h2>Ingår i vårt fasta pris</h2>
  <div class="card">
    <div class="item"><span class="tick">✅</span>Pålastning och avlastning av alla dina ägodelar</div>
    <p class="desc">Vårt team ser till att varje låda och möbel hanteras med omsorg...</p>

    <div class="item"><span class="tick">✅</span>Säker transport inom hela Sverige</div>
    <p class="desc">Vi transporterar dina ägodelar med moderna, välutrustade flyttbilar...</p>

    <div class="item"><span class="tick">✅</span>Flytt av förråd och andra utrymmen ingår</div>
    <p class="desc">Vi tar hand om alla utrymmen som hör till din lägenhet...</p>

    <div class="item"><span class="tick">✅</span>Kostnadsfritt lån av flyttlådor och kylväska</div>
    <p class="desc">Lådor och kylväska levereras direkt till ditt hem...</p>

    <div class="item"><span class="tick">✅</span>Skydd av känsliga föremål med plast och filtar</div>
    <p class="desc">Vi skyddar dina ömtåliga saker med filtar, bubbelplast...</p>

    <div class="item"><span class="tick">✅</span>50% RUT-avdrag – vi sköter hela ansökan</div>
    <p class="desc">Vi hanterar pappersarbetet med Skatteverket...</p>

    <div class="item"><span class="tick">✅</span>Försäkring som täcker både dina ägodelar och vår personal</div>
    <p class="desc">Skulle något oväntat hända under flytten, är både dina saker och vårt team fullt försäkrade.</p>
  </div>

  <h2>Extra tjänster</h2>
  <div class="card">
    <div class="item"><span class="tick">✅</span>Packning och uppackning för ett fast pris</div>
    <p class="desc">Vi packar säkert och noggrant...</p>
    <div class="item"><span class="tick">✅</span>Montering och demontering av möbler</div>
    <p class="desc">Vi demonterar stora möbler och monterar igen på plats.</p>
    <div class="item"><span class="tick">✅</span>Bortforsling av gamla möbler</div>
    <p class="desc">Miljövänlig bortforsling av sådant du inte vill ta med.</p>
    <div class="item"><span class="tick">✅</span>Magasinering vid behov</div>
    <p class="desc">Trygg och säker magasinering, kort eller lång tid.</p>
  </div>

  <h2>Så här går din flytt till med oss 🚚</h2>
  <div class="card">
    <p class="desc">💻 Räkna ut priset online • 🛠️ Välj tillval • 📩 Skicka bokning • ⏰ Vi kommer i tid • 📦 Packning (om bokat) • 🚛 Lastning • 🏡 Avlastning • ✔️ Klart</p>
  </div>

  <p class="footer">Tips: Lägg till logotyp via &lt;img&gt; och valfria webfonts.</p>
</div>
</body>
</html>`;

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", right: "12mm", bottom: "14mm", left: "12mm" },
      displayHeaderFooter: false,
    });

    await page.close();
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

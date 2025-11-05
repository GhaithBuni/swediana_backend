// utils/generateCleaningPDF.ts
import puppeteer from "puppeteer";

export async function generateCleaningPDF(): Promise<Buffer> {
  const browser = await puppeteer.launch({
    // If running in Docker/CI, you may need:
    // args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    const html = `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8"/>
<title>Swediana – Flyttstädning</title>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
  @page { size: A4; margin: 14mm 16mm 18mm 16mm; }
  :root { --ink:#111827; --muted:#4b5563; --brand:#0ea5e9; --accent:#10b981; --rule:#e5e7eb; }
  body { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,"Noto Sans","Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif; color:var(--ink); line-height:1.55; font-size:11.5pt; }
  .wrap { max-width:720px; margin:0 auto; }
  h1{font-size:24pt;color:var(--brand);margin:0 0 12px}
  h2{font-size:14.5pt;margin:18px 0 8px}
  p{margin:8px 0}
  .card{border:1px solid var(--rule);border-radius:10px;padding:12px 14px;margin:10px 0;background:#fff}
  ul{margin:6px 0 6px 0; padding-left:0; list-style:none}
  li{margin:6px 0}
  .tick{color:var(--accent); font-weight:700; margin-right:6px}
  .note{color:var(--muted); font-size:10.5pt}
  .lead{font-size:12.5pt}
  .hr{height:1px;background:var(--rule);margin:14px 0}
</style>
</head>
<body>
<div class="wrap">
  <h1>Flyttstädning – Vad som ingår</h1>
  <p class="lead"><strong>Fullständig flyttstädning – vi tar hand om allt</strong></p>
  <p>Vår professionella flyttstädning gör flytten enklare – vår checklista är anpassad efter hyresvärdarnas krav i alla städer vi jobbar i, för att säkerställa att din bostad blir godkänd av både hyresvärd och mäklare.</p>

  <h2>Ingår i Flyttstädning</h2>
  <div class="card">
    <ul>
      <li><span class="tick">✅</span>Alla fria ytor ska dammsugas och torkas rent.</li>
      <li><span class="tick">✅</span>Damning av väggar och tak.</li>
      <li><span class="tick">✅</span>Golv och golvlister.</li>
      <li><span class="tick">✅</span>Dörrar och trösklar.</li>
      <li><span class="tick">✅</span>Fönsterkarmar.</li>
      <li><span class="tick">✅</span>Fönsterputsning.</li>
      <li><span class="tick">✅</span>Utrymmen mellan elementen.</li>
      <li><span class="tick">✅</span>Garderober rengörs på utsidan och insidan.</li>
      <li><span class="tick">✅</span>Strömbrytare, fasta lampor och andra fasta prylar.</li>
    </ul>
  </div>

  <h2>Köket</h2>
  <div class="card">
    <ul>
      <li><span class="tick">✅</span>Spisen rengörs ut- och invändigt.</li>
      <li><span class="tick">✅</span>Köksfläkt rengörs in- och utvändigt.</li>
      <li><span class="tick">✅</span>Golv- och väggytor bakom spisen rengörs.</li>
      <li><span class="tick">✅</span>Skåp över kyl och frys rengörs ut- och invändigt.</li>
      <li><span class="tick">✅</span>Utrymmen under kyl och frys rengörs.</li>
      <li><span class="tick">✅</span>Kyl, sval och frys rengörs in- och utvändigt.</li>
      <li><span class="tick">✅</span>Målade väggar avfläckas.</li>
      <li><span class="tick">✅</span>Kaklade ytor rengörs.</li>
      <li><span class="tick">✅</span>Utrymmen mellan vägg och element rengörs.</li>
      <li><span class="tick">✅</span>Snickerier våttorkas.</li>
      <li><span class="tick">✅</span>Bänkskivor.</li>
      <li><span class="tick">✅</span>Skärbrädor på över- och undersida.</li>
      <li><span class="tick">✅</span>Skafferi våttorkas på ut- och insida.</li>
      <li><span class="tick">✅</span>Alla köksskåp våttorkas på ut- och insida.</li>
      <li><span class="tick">✅</span>Ytan ovanpå väggskåpen i köket våttorkas.</li>
      <li><span class="tick">✅</span>Lampskärmar och kåpor till armaturer rengörs.</li>
      <li><span class="tick">✅</span>Diskhoar och avloppsventiler i diskho rengörs.</li>
    </ul>
  </div>

  <h2>Badrum/Toalett</h2>
  <div class="card">
    <ul>
      <li><span class="tick">✅</span>Kakel, fogar och klinkers putsas.</li>
      <li><span class="tick">✅</span>Badrumsskåp rengörs in- och utvändigt.</li>
      <li><span class="tick">✅</span>Alla speglar putsas.</li>
      <li><span class="tick">✅</span>Toalettstol och lock rengörs på in- och utsida.</li>
      <li><span class="tick">✅</span>Handfat rengörs på in- och utsida.</li>
      <li><span class="tick">✅</span>Badkar/duschväggar rengörs och avkalkas (ej glas duschhörna).</li>
      <li><span class="tick">✅</span>Golvet under badkar.</li>
      <li><span class="tick">✅</span>Kaklade ytor rengörs.</li>
      <li><span class="tick">✅</span>Målade väggar våttorkas eller dammtorkas.</li>
      <li><span class="tick">✅</span>Tvättmaskin, torktumlare och torkskåp rengörs (utvändigt).</li>
      <li><span class="tick">✅</span>Rensning av golvbrunn.</li>
      <li><span class="tick">✅</span>Luftventiler och galler rengörs.</li>
    </ul>
  </div>

  <h2>Förberedelser inför flyttstädning</h2>
  <div class="card">
    <p>För att vi ska kunna utföra en fullständig och effektiv städning rekommenderar vi att följande förberedelser görs innan vi kommer:</p>
    <ul>
      <li><span class="tick">✅</span>Frigör ytor: Bostaden bör vara fri från möbler och personliga föremål så att vi får tillgång till alla ytor.</li>
      <li><span class="tick">✅</span>Frys och kyl: Töm, frosta av och stäng av kyl och frys. Om du vill ha städning bakom dessa, vänligen dra ut dem från väggen.</li>
      <li><span class="tick">✅</span>Vattenlås: Rengör vattenlås under handfat och diskho för bästa resultat.</li>
      <li><span class="tick">✅</span>Särskilda önskemål: Meddela oss gärna i förväg om det finns områden som kräver extra uppmärksamhet.</li>
    </ul>
    <p class="note">Genom att förbereda bostaden på detta sätt säkerställer du att vi kan göra en noggrann städning som blir godkänd av hyresvärd eller mäklare.</p>
  </div>

  <h2>Av- och Ombokning</h2>
  <div class="card">
    <p>Har du fått en ändring i ditt schema eller behöver justera städtiden? Inga problem – vi hjälper dig!</p>
    <ul>
      <li><span class="tick">✅</span>Av- eller ombokning senast 3 dagar innan städningen sker utan kostnad.</li>
      <li><span class="tick">✅</span>1–2 dagar innan städning debiteras 50 % av fakturan.</li>
      <li><span class="tick">✅</span>Samma dag som städningen debiteras hela fakturabeloppet.</li>
    </ul>
    <p class="note">Kontakta oss så snart som möjligt vid ändringar, så hittar vi en tid som passar dig bäst.</p>
  </div>

  <h2>Nycklar</h2>
  <div class="card">
    <p>Om ni inte har möjlighet att vara hemma vid städningen, ring oss några dagar innan den bokade tiden så kommer vi förbi och hämtar en nyckel. Efter städning lämnar vi nycklarna i din brevlåda.</p>
    <p>Önskar du att vi lämnar nycklarna till din hyresvärd, kan du kontakta oss så löser vi det mot en kostnad på 200 kr efter RUT-avdrag.</p>
  </div>

  <h2>Betalning</h2>
  <div class="card">
    <p>Efter avslutad städning är det dags för betalning. Våra priser är beräknade med RUT-avdraget och moms. Ni kommer att erhålla en faktura via e-post, och vi ansöker om RUT-avdraget hos Skatteverket. Ni har 10 dagar på er att betala fakturan.</p>
  </div>

  <h2>Vår städgaranti – din trygghet vid flyttstädning</h2>
  <div class="card">
    <p>När du bokar flyttstädning hos oss kan du känna dig helt trygg. Vi är stolta över vårt arbete och lämnar alltid en kvalitetsgaranti på städningen. Efter avslutat arbete lämnar vi en checklista på diskbänken tillsammans med information om garantin, så att både du och nästa hyresgäst kan känna er säkra på att allt är i toppskick.</p>
    <p><strong>Så fungerar vår garanti:</strong></p>
    <ul>
      <li><span class="tick">✅</span>Garantin gäller i 30 dagar från städdagen.</li>
      <li><span class="tick">✅</span>Den nya hyresgästen har 3 dagar från inflyttning att inkomma med eventuella synpunkter.</li>
      <li><span class="tick">✅</span>Skulle något mot förmodan inte vara godkänt, åtgärdar vi det snabbt och kostnadsfritt.</li>
    </ul>
    <p><strong>Viktigt att tänka på:</strong></p>
    <ul>
      <li><span class="tick">✅</span>Bostaden ska inte användas efter städningen.</li>
      <li><span class="tick">✅</span>Om du bor utanför Uppsala ber vi dig kontrollera städningen innan vi lämnar bostaden. Vid anmärkningar i efterhand tillkommer en körningsavgift på 500 kr för återstädning.</li>
      <li><span class="tick">✅</span>Det är ditt ansvar som kund att informera hyresvärden om vår garanti och att vi gärna återstädar vid behov.</li>
    </ul>
  </div>

  <h2>RUT-avdrag – halva priset på din flyttstädning</h2>
  <div class="card">
    <p>När du bokar flyttstädning hos Swediana får du automatiskt ta del av RUT-avdraget.</p>
    <ul>
      <li><span class="tick">✅</span>Du betalar endast 50 % av arbetskostnaden</li>
      <li><span class="tick">✅</span>Vi söker RUT-avdraget åt dig – enkelt och smidigt</li>
      <li><span class="tick">✅</span>Gäller alla privatpersoner som betalar skatt i Sverige</li>
    </ul>
    <p class="note">Alla priser som visas på vår hemsida är redan beräknade med RUT-avdraget. Läs mer om villkor och regler på Skatteverkets hemsida.</p>
  </div>
</div>
</body>
</html>`;

    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfData = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", right: "12mm", bottom: "14mm", left: "12mm" },
    });

    await page.close();
    return Buffer.from(pdfData);
  } finally {
    await browser.close();
  }
}

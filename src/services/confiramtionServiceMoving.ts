import MovingBookingModel from "../models/movingBooking";
import { Resend } from "resend";
import { generateCompanyInfoPDF } from "../utils/movingPDF";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ConfirmationEmailData {
  id: string;
}

type PriceLine = {
  key: string;
  label: string;
  amount: number;
  meta?: string;
};

const TZ = "Europe/Stockholm";

const SEK = (n: number) =>
  new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(n);

const formatDateSE = (isoOrDate: string | Date) =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(isoOrDate));

const formatDateTimeSE = (isoOrDate: string | Date) =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoOrDate));

function buildEmailHtml(booking: any) {
  const {
    name,
    bookingNumber,
    addressStreet,
    date,
    time,
    email,
    phone,
    message,
    apartmentKeys,
    size,
    from,
    to,
    packa,
    packaKitchen,
    montera,
    flyttstad,
    status,
    priceDetails,
    createdAt,
  } = booking;

  const isCancelled = String(status).toLowerCase() === "cancelled";
  const bannerBg = isCancelled ? "#7f1d1d" : "#111827";
  const bannerTitle = isCancelled ? "Bokning avbokad" : "Bokningsbekräftelse";
  const badge = isCancelled ? "AVBOKAD" : "BEKRÄFTAD";
  const badgeBg = isCancelled ? "#fee2e2" : "#e0e7ff";
  const badgeColor = isCancelled ? "#991b1b" : "#3730a3";

  const dateLabel = formatDateSE(date);
  const timeLabel = time || "—";

  const lines: PriceLine[] = priceDetails?.lines ?? [];
  const totals = priceDetails?.totals ?? {};
  const {
    movingBase = 0,
    movingExtras = 0,
    cleaningBaseAfterDiscount = 0,
    cleaningExtras = 0,
    grandTotal = 0,
  } = totals as any;

  const servicesChosen: string[] = [
    "Flytthjälp",
    packa === "JA" ? "Packning" : null,
    packaKitchen === "JA" ? "Packning (kök)" : null,
    montera === "JA" ? "Montering" : null,
    flyttstad === "JA" ? "Flyttstäd" : null,
  ].filter(Boolean) as string[];

  const lineRows = lines
    .map(
      (l) => `
      <tr>
        <td style="padding:8px 0; font-size:14px;">${l.label}${
          l.meta ? ` <span style="color:#6b7280;">(${l.meta})</span>` : ""
        }</td>
        <td style="padding:8px 0; font-size:14px; text-align:right; white-space:nowrap;">${SEK(
          l.amount,
        )}</td>
      </tr>`,
    )
    .join("");

  return `
  <!doctype html>
  <html lang="sv">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${bannerTitle} #${bookingNumber}</title>
  </head>
  <body style="margin:0; background:#f5f6f8; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,'Noto Sans','Apple Color Emoji','Segoe UI Emoji',sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6f8; padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
            <tr>
              <td style="padding:20px 24px; background:${bannerBg}; color:#fff;">
                <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
                  <h1 style="margin:0; font-size:20px;">${bannerTitle}</h1>
                  <span style="display:inline-block; padding:4px 10px; border-radius:999px; background:${badgeBg}; color:${badgeColor}; font-weight:600; font-size:12px;">${badge}</span>
                </div>
                <p style="margin:6px 0 0 0; font-size:13px; opacity:0.9;">Bokningsnummer: <strong>#${bookingNumber}</strong></p>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 24px;">
                <p style="margin:0 0 16px 0; font-size:15px; color:#111827;">
                  Hej ${name?.trim() || "kund"},<br/>
                  ${
                    isCancelled
                      ? "Din bokning har avbokats."
                      : "Tack för din bokning! Här är en sammanfattning av dina uppgifter."
                  }
                </p>

                <!-- Core details -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="vertical-align:top; width:50%; padding:0 0 12px 0;">
                      <h3 style="margin:0 0 8px 0; font-size:14px; color:#374151;">Kund</h3>
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr><td style="padding:4px 0; font-size:14px; color:#6b7280;">Namn</td><td style="padding:4px 0; font-size:14px; color:#111827; text-align:right;">${
                          name || "-"
                        }</td></tr>
                        <tr><td style="padding:4px 0; font-size:14px; color:#6b7280;">E-post</td><td style="padding:4px 0; font-size:14px; color:#111827; text-align:right;">${
                          email || "-"
                        }</td></tr>
                        <tr><td style="padding:4px 0; font-size:14px; color:#6b7280;">Telefon</td><td style="padding:4px 0; font-size:14px; color:#111827; text-align:right;">${
                          phone || "-"
                        }</td></tr>
                        <tr><td style="padding:4px 0; font-size:14px; color:#6b7280;">Adress (korrespondens)</td><td style="padding:4px 0; font-size:14px; color:#111827; text-align:right;">${
                          addressStreet || "-"
                        }</td></tr>
                      </table>
                    </td>
                    <td style="vertical-align:top; width:50%; padding:0 0 12px 16px;">
                      <h3 style="margin:0 0 8px 0; font-size:14px; color:#374151;">Bokning</h3>
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr><td style="padding:4px 0; font-size:14px; color:#6b7280;">Datum</td><td style="padding:4px 0; font-size:14px; color:#111827; text-align:right;">${dateLabel}</td></tr>
                        <tr><td style="padding:4px 0; font-size:14px; color:#6b7280;">Tid</td><td style="padding:4px 0; font-size:14px; color:#111827; text-align:right;">${timeLabel}</td></tr>
                        <tr><td style="padding:4px 0; font-size:14px; color:#6b7280;">Yta</td><td style="padding:4px 0; font-size:14px; color:#111827; text-align:right;">${
                          size ? `${size} m²` : "-"
                        }</td></tr>
                        <tr><td style="padding:4px 0; font-size:14px; color:#6b7280;">Tjänster</td><td style="padding:4px 0; font-size:14px; color:#111827; text-align:right;">${
                          servicesChosen.join(", ") || "-"
                        }</td></tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- From / To -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px; border:1px solid #eef2f7; border-radius:8px; overflow:hidden;">
                  <tr>
                    <td style="padding:12px 16px; background:#f9fafb; font-size:14px; color:#374151; width:50%;"><strong>Från</strong></td>
                    <td style="padding:12px 16px; background:#f9fafb; font-size:14px; color:#374151;"><strong>Till</strong></td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px; font-size:14px;">
                      <div>Postnummer: ${from?.postcode || "-"}</div>
                      <div>Boendetyp: ${from?.homeType || "-"}</div>
                      <div>Våning: ${from?.floor || "-"}</div>
                      <div>Access: ${from?.access || "-"}</div>
                      <div>Parkering: ${
                        from?.parkingDistance != null
                          ? `${from.parkingDistance} m`
                          : "-"
                      }</div>
                    </td>
                    <td style="padding:12px 16px; font-size:14px;">
                      <div>Postnummer: ${to?.postcode || "-"}</div>
                      <div>Boendetyp: ${to?.homeType || "-"}</div>
                      <div>Våning: ${to?.floor || "-"}</div>
                      <div>Access: ${to?.access || "-"}</div>
                      <div>Parkering: ${
                        to?.parkingDistance != null
                          ? `${to.parkingDistance} m`
                          : "-"
                      }</div>
                    </td>
                  </tr>
                </table>

                <!-- Notes -->
                <div style="margin:12px 0 0 0; padding:12px; background:#f9fafb; border:1px solid #eef2f7; border-radius:8px;">
                  <p style="margin:0; font-size:13px; color:#6b7280;">
                    Nycklar: ${apartmentKeys ? apartmentKeys : "—"}<br/>
                    Övrigt: ${message ? message : "—"}
                  </p>
                </div>
              </td>
            </tr>

            <!-- Pricing -->
            <tr>
              <td style="padding:16px 24px; background:#111827; color:#ffffff;">
                <h3 style="margin:0 0 8px 0; font-size:16px;">Prisdetaljer</h3>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="color:#ffffff;">
                  ${lineRows}
                  <tr><td colspan="2" style="border-top:1px solid #374151; height:8px;"></td></tr>
                  <tr><td style="padding:6px 0; font-size:14px; opacity:0.9;">Flytt – grund</td><td style="padding:6px 0; font-size:14px; text-align:right;">${SEK(
                    movingBase,
                  )}</td></tr>
                  <tr><td style="padding:2px 0; font-size:14px; opacity:0.9;">Flytt – tillval</td><td style="padding:2px 0; font-size:14px; text-align:right;">${SEK(
                    movingExtras,
                  )}</td></tr>
                  <tr><td style="padding:2px 0; font-size:14px; opacity:0.9;">Flyttstäd – efter rabatt</td><td style="padding:2px 0; font-size:14px; text-align:right;">${SEK(
                    cleaningBaseAfterDiscount,
                  )}</td></tr>
                  <tr><td style="padding:2px 0; font-size:14px; opacity:0.9;">Flyttstäd – tillval</td><td style="padding:2px 0; font-size:14px; text-align:right;">${SEK(
                    cleaningExtras,
                  )}</td></tr>
                  <tr>
                    <td style="padding:8px 0; font-size:16px; font-weight:600;">Att betala</td>
                    <td style="padding:8px 0; font-size:16px; font-weight:600; text-align:right;">${SEK(
                      grandTotal,
                    )}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 24px;">
                <p style="margin:0 0 8px 0; font-size:13px; color:#6b7280;">
                  ${
                    isCancelled
                      ? "Den här bokningen är avbokad. Kontakta oss om du har frågor."
                      : "Vi hör av oss om något behöver bekräftas ytterligare. Svara gärna på detta mejl vid frågor."
                  }
                </p>
                <p style="margin:0; font-size:12px; color:#9ca3af;">
                  Skapad: ${formatDateTimeSE(createdAt)}
                </p>
              </td>
            </tr>
          </table>
          <p style="font-size:12px; color:#9ca3af; margin:12px 0 0 0;">© ${new Date().getFullYear()} Swediana</p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

import { readFile } from "fs/promises";
import path from "path";

export const sendConfirmationEmailMoving = async ({
  id,
}: ConfirmationEmailData) => {
  try {
    const booking = await MovingBookingModel.findById(id);
    if (!booking) {
      return { success: false, message: "Booking not found", statusCode: 404 };
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("❌ Resend API key missing in .env file");
      return {
        success: false,
        message: "Email configuration missing",
        statusCode: 500,
      };
    }

    const html = buildEmailHtml(booking);

    // Read the PDF file
    const pdfPath = path.join(
      process.cwd(),
      "public/pdfs/Bokningsbekräftelse-flytthjälp.pdf",
    );
    const pdfBuffer = await readFile(pdfPath);

    const isCancelled = String(booking.status).toLowerCase() === "cancelled";
    const statusPrefix = isCancelled ? "Avbokning" : "Bokningsbekräftelse";
    const subject =
      `${statusPrefix} #${booking.bookingNumber} – Flytthjälp ` +
      `${formatDateSE(booking.date)} kl ${booking.time || "—"}`;

    const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

    const { data, error } = await resend.emails.send({
      from: `Swediana <${fromEmail}>`,
      to: booking.email,
      subject,
      html,
      attachments: [
        {
          filename: "Bokningsbekräftelse-flytthjälp.pdf",
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        message: "Failed to send confirmation email",
        statusCode: 500,
      };
    }

    console.log(`✅ Confirmation email sent to ${booking.email}`);
    console.log(`📧 Message ID: ${data?.id}`);

    return {
      success: true,
      message: "Email sent successfully",
      statusCode: 200,
    };
  } catch (err) {
    console.error("Error sending email:", err);
    return {
      success: false,
      message: "Failed to send confirmation email",
      statusCode: 500,
    };
  }
};

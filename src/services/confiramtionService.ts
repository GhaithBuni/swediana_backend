import ByggBookingModel from "../models/byggBooking";
import CleaningBookingModel from "../models/cleaningBooking";
import nodemailer from "nodemailer";

interface ConfirmationEmailData {
  id: string;
}

type PriceLine = {
  key: string;
  label: string;
  amount: number;
  meta?: string;
};

const SEK = (n: number) =>
  new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(n);

const formatDateSE = (isoOrDate: string | Date) =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(isoOrDate));

/** Build the HTML email using inline styles (email-client friendly) */
function buildEmailHtml(booking: any) {
  const {
    name,
    bookingNumber,
    addressStreet,

    date,
    time,
    email,
    phone,
    priceDetails,
  } = booking;

  const serviceLabel = "Flyttstäd";
  const dateLabel = formatDateSE(date);
  const timeLabel = time || "—";

  const lines: PriceLine[] = priceDetails?.lines ?? [];
  const totals = priceDetails?.totals ?? { base: 0, extras: 0, grandTotal: 0 };

  const lineRows = lines
    .map(
      (l) => `
        <tr>
          <td style="padding:8px 0; font-size:14px;">${l.label}${
        l.meta ? ` <span style="color:#6b7280;">(${l.meta})</span>` : ""
      }</td>
          <td style="padding:8px 0; font-size:14px; text-align:right; white-space:nowrap;">${SEK(
            l.amount
          )}</td>
        </tr>`
    )
    .join("");

  return `
  <!doctype html>
  <html lang="sv">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Bokningsbekräftelse #${bookingNumber}</title>
  </head>
  <body style="margin:0; background:#f5f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6f8; padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
            <tr>
              <td style="padding:24px;">
                <h1 style="margin:0 0 8px 0; font-size:22px; color:#111827;">Bokningsbekräftelse</h1>
                <p style="margin:0; color:#6b7280; font-size:14px;">Bokningsnummer: <strong>#${bookingNumber}</strong></p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 16px 24px;">
                <p style="margin:0 0 16px 0; font-size:15px; color:#111827;">
                  Hej ${name?.trim() || "kund"},<br/>
                  Tack för din bokning! Här är en sammanfattning av dina uppgifter.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="vertical-align:top; width:50%; padding:0 0 12px 0;">
                      <h3 style="margin:0 0 8px 0; font-size:14px; color:#374151;">Uppgifter</h3>
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="padding:4px 0; font-size:14px; color:#6b7280;">Namn</td>
                          <td style="padding:4px 0; font-size:14px; color:#111827; text-align:right;">${
                            name || "-"
                          }</td>
                        </tr>
                        <tr>
                          <td style="padding:4px 0; font-size:14px; color:#6b7280;">E-post</td>
                          <td style="padding:4px 0; font-size:14px; color:#111827; text-align:right;">${
                            email || "-"
                          }</td>
                        </tr>
                        <tr>
                          <td style="padding:4px 0; font-size:14px; color:#6b7280;">Telefon</td>
                          <td style="padding:4px 0; font-size:14px; color:#111827; text-align:right;">${
                            phone || "-"
                          }</td>
                        </tr>
                        <tr>
                          <td style="padding:4px 0; font-size:14px; color:#6b7280;">Adress</td>
                          <td style="padding:4px 0; font-size:14px; color:#111827; text-align:right;">${
                            addressStreet || "-"
                          }</td>
                        </tr>
                      </table>
                    </td>
                    <td style="vertical-align:top; width:50%; padding:0 0 12px 16px;">
                      <h3 style="margin:0 0 8px 0; font-size:14px; color:#374151;">Bokning</h3>
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="padding:4px 0; font-size:14px; color:#6b7280;">Tjänst</td>
                          <td style="padding:4px 0; font-size:14px; color:#111827; text-align:right;">${serviceLabel}</td>
                        </tr>
                        <tr>
                          <td style="padding:4px 0; font-size:14px; color:#6b7280;">Datum</td>
                          <td style="padding:4px 0; font-size:14px; color:#111827; text-align:right;">${dateLabel}</td>
                        </tr>
                        <tr>
                          <td style="padding:4px 0; font-size:14px; color:#6b7280;">Tid</td>
                          <td style="padding:4px 0; font-size:14px; color:#111827; text-align:right;">${timeLabel}</td>
                        </tr>
                        <tr>
                          <td style="padding:4px 0; font-size:14px; color:#6b7280;">Objektsstorlek</td>
                          <td style="padding:4px 0; font-size:14px; color:#111827; text-align:right;">${
                            booking.size ? `${booking.size} m²` : "-"
                          }</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <div style="margin:8px 0 0 0; padding:12px; background:#f9fafb; border:1px solid #eef2f7; border-radius:8px;">
                  <p style="margin:0; font-size:12px; color:#6b7280;">
                    Övrigt: ${booking.message ? booking.message : "—"}
                  </p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px; background:#111827; color:#ffffff;">
                <h3 style="margin:0 0 8px 0; font-size:16px;">Prisdetaljer</h3>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="color:#ffffff;">
                  ${lineRows}
                  <tr><td colspan="2" style="border-top:1px solid #374151; height:8px;"></td></tr>
                  <tr>
                    <td style="padding:6px 0; font-size:14px; opacity:0.9;">Grundpris</td>
                    <td style="padding:6px 0; font-size:14px; text-align:right;">${SEK(
                      totals.base || 0
                    )}</td>
                  </tr>
                  <tr>
                    <td style="padding:2px 0; font-size:14px; opacity:0.9;">Tillval</td>
                    <td style="padding:2px 0; font-size:14px; text-align:right;">${SEK(
                      totals.extras || 0
                    )}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0; font-size:16px; font-weight:600;">Att betala</td>
                    <td style="padding:8px 0; font-size:16px; font-weight:600; text-align:right;">${SEK(
                      totals.grandTotal || 0
                    )}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;">
                <p style="margin:0 0 8px 0; font-size:13px; color:#6b7280;">
                  Vi hör av oss om något behöver bekräftas ytterligare. Svara gärna på detta mejl vid frågor.
                </p>
                <p style="margin:0; font-size:12px; color:#9ca3af;">
                  Bokad: ${new Intl.DateTimeFormat("sv-SE", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Europe/Stockholm",
                  }).format(new Date(booking.createdAt))}
                </p>
              </td>
            </tr>
          </table>
          <p style="font-size:12px; color:#9ca3af; margin:12px 0 0 0;">© ${new Date().getFullYear()} Ditt Företag</p>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}

export const sendConfirmationEmailCleaning = async ({
  id,
}: ConfirmationEmailData) => {
  try {
    const booking = await CleaningBookingModel.findById(id);
    if (!booking) {
      return { success: false, message: "Booking not found", statusCode: 404 };
    }

    const html = buildEmailHtml(booking);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subject = `Bokningsbekräftelse #${
      booking.bookingNumber
    } – Flyttstäd ${formatDateSE(booking.date)} kl ${booking.time}`;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: booking.email,
      subject,
      html,
    });

    return {
      success: true,
      message: "Email sent successfully",
      statusCode: 200,
    };
  } catch (err) {
    console.error("Error sending confirmation email:", err);
    return {
      success: false,
      message: "Failed to send confirmation email",
      statusCode: 500,
    };
  }
};

export const sendConfirmationEmailBygg = async ({
  id,
}: ConfirmationEmailData) => {
  try {
    const booking = await ByggBookingModel.findById(id);
    if (!booking) {
      return { success: false, message: "Booking not found", statusCode: 404 };
    }

    const html = buildEmailHtml(booking);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subject = `Bokningsbekräftelse #${
      booking.bookingNumber
    } – Flyttstäd ${formatDateSE(booking.date)} kl ${booking.time}`;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: booking.email,
      subject,
      html,
    });

    return {
      success: true,
      message: "Email sent successfully",
      statusCode: 200,
    };
  } catch (err) {
    console.error("Error sending confirmation email:", err);
    return {
      success: false,
      message: "Failed to send confirmation email",
      statusCode: 500,
    };
  }
};

// server/services/emailNotificationService.ts
import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

// Email configuration
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Booking notification data
interface BookingNotification {
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: "flyttstädning" | "moving" | "bygg";
  date: string;
  time?: string;
  size?: number;
  address?: string;
  postcode?: string;
  totalAmount?: number;
  extras?: string[];
  cleanType?: string;
  apartmentKeys?: string;
}

// Create email transporter
const createTransporter = (): Transporter => {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  };

  return nodemailer.createTransport(config);
};

// Generate HTML email template
const generateEmailHTML = (booking: BookingNotification): string => {
  const serviceName =
    booking.service === "flyttstädning"
      ? "Flyttstäd"
      : booking.service === "moving"
      ? "Flytthjälp"
      : "Byggstäd";

  const extrasHtml =
    booking.extras && booking.extras.length > 0
      ? `
    <div class="info-row">
      <span class="label">Extra tjänster:</span>
      <ul style="margin: 5px 0; padding-left: 20px;">
        ${booking.extras.map((extra) => `<li>${extra}</li>`).join("")}
      </ul>
    </div>
  `
      : "";

  return `
    <!DOCTYPE html>
    <html lang="sv">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .header .booking-number {
            font-size: 14px;
            opacity: 0.9;
            margin-top: 8px;
          }
          .content {
            padding: 30px 20px;
          }
          .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #667eea;
            margin: 20px 0 15px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #f0f0f0;
          }
          .info-row {
            margin: 12px 0;
            padding: 12px;
            background-color: #f9f9f9;
            border-radius: 6px;
            border-left: 3px solid #667eea;
          }
          .label {
            font-weight: 600;
            color: #555;
            display: inline-block;
            min-width: 150px;
          }
          .value {
            color: #333;
          }
          .price-row {
            background-color: #f0f7ff;
            border-left: 3px solid #4CAF50;
            padding: 15px;
            margin: 15px 0;
            border-radius: 6px;
          }
          .price-row .label {
            font-size: 16px;
            color: #4CAF50;
          }
          .price-row .value {
            font-size: 24px;
            font-weight: 700;
            color: #4CAF50;
          }
          .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #777;
            font-size: 13px;
            border-top: 1px solid #e0e0e0;
          }
          .footer p {
            margin: 5px 0;
          }
          .badge {
            display: inline-block;
            padding: 4px 12px;
            background-color: #667eea;
            color: white;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 10px;
          }
          @media only screen and (max-width: 600px) {
            .container {
              margin: 0;
              border-radius: 0;
            }
            .content {
              padding: 20px 15px;
            }
            .label {
              min-width: 120px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Ny Bokning!</h1>
            <div class="booking-number">Bokningsnummer: ${
              booking.bookingNumber
            }</div>
          </div>
          
          <div class="content">
            <h2 class="section-title">📋 Bokningsinformation</h2>
            
            <div class="info-row">
              <span class="label">Tjänst:</span>
              <span class="value">${serviceName}<span class="badge">${booking.service.toUpperCase()}</span></span>
            </div>
            
            <div class="info-row">
              <span class="label">Datum:</span>
              <span class="value">${booking.date}${
    booking.time ? ` kl. ${booking.time}` : ""
  }</span>
            </div>
            
            ${
              booking.size
                ? `
            <div class="info-row">
              <span class="label">Storlek:</span>
              <span class="value">${booking.size} m²</span>
            </div>
            `
                : ""
            }
            
            ${
              booking.address || booking.postcode
                ? `
            <div class="info-row">
              <span class="label">Adress:</span>
              <span class="value">${booking.address || ""} ${
                    booking.postcode || ""
                  }</span>
            </div>
            `
                : ""
            }
            
            ${
              booking.cleanType
                ? `
            <div class="info-row">
              <span class="label">Typ av städning:</span>
              <span class="value">${
                booking.cleanType === "typical" ? "Typisk" : "Besiktning"
              }</span>
            </div>
            `
                : ""
            }
            
            ${
              booking.apartmentKeys
                ? `
            <div class="info-row">
              <span class="label">Nycklar:</span>
              <span class="value">${booking.apartmentKeys}</span>
            </div>
            `
                : ""
            }
            
            ${extrasHtml}
            
            <h2 class="section-title">👤 Kundinformation</h2>
            
            <div class="info-row">
              <span class="label">Namn:</span>
              <span class="value">${booking.customerName}</span>
            </div>
            
            <div class="info-row">
              <span class="label">E-post:</span>
              <span class="value"><a href="mailto:${
                booking.customerEmail
              }" style="color: #667eea; text-decoration: none;">${
    booking.customerEmail
  }</a></span>
            </div>
            
            <div class="info-row">
              <span class="label">Telefon:</span>
              <span class="value"><a href="tel:${
                booking.customerPhone
              }" style="color: #667eea; text-decoration: none;">${
    booking.customerPhone
  }</a></span>
            </div>
            
            ${
              booking.totalAmount
                ? `
            <div class="price-row">
              <span class="label">Totalt belopp:</span><br>
              <span class="value">${booking.totalAmount.toLocaleString(
                "sv-SE"
              )} kr</span>
            </div>
            `
                : ""
            }
          </div>
          
          <div class="footer">
            <p><strong>Detta är en automatisk notifikation från ditt bokningssystem.</strong></p>
            <p>Logga in i admin-panelen för att hantera bokningen.</p>
            <p style="margin-top: 15px; color: #999; font-size: 11px;">
              Skickat ${new Date().toLocaleString("sv-SE")}
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Generate plain text email (fallback)
const generateEmailText = (booking: BookingNotification): string => {
  const serviceName =
    booking.service === "flyttstädning"
      ? "Flyttstäd"
      : booking.service === "moving"
      ? "Flytthjälp"
      : "Byggstäd";

  let text = `
NY BOKNING!
Bokningsnummer: ${booking.bookingNumber}

BOKNINGSINFORMATION
-------------------
Tjänst: ${serviceName}
Datum: ${booking.date}${booking.time ? ` kl. ${booking.time}` : ""}
${booking.size ? `Storlek: ${booking.size} m²` : ""}
${
  booking.address || booking.postcode
    ? `Adress: ${booking.address || ""} ${booking.postcode || ""}`
    : ""
}

KUNDINFORMATION
---------------
Namn: ${booking.customerName}
E-post: ${booking.customerEmail}
Telefon: ${booking.customerPhone}

${
  booking.totalAmount
    ? `TOTALT BELOPP: ${booking.totalAmount.toLocaleString("sv-SE")} kr`
    : ""
}

---
Detta är en automatisk notifikation från ditt bokningssystem.
Skickat ${new Date().toLocaleString("sv-SE")}
  `;

  return text.trim();
};

// Send email notification
export const sendBookingNotification = async (
  booking: BookingNotification
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // Validate email configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("❌ Email configuration missing in .env file");
      return {
        success: false,
        error: "Email configuration missing",
      };
    }

    const transporter = createTransporter();
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

    const serviceName =
      booking.service === "flyttstädning"
        ? "Flyttstäd"
        : booking.service === "moving"
        ? "Flytthjälp"
        : "Byggstäd";

    // Send email
    const info = await transporter.sendMail({
      from: {
        name: "Bokningssystem",
        address: process.env.SMTP_USER,
      },
      to: adminEmail,
      subject: `🔔 Ny ${serviceName} bokning - ${booking.bookingNumber}`,
      text: generateEmailText(booking),
      html: generateEmailHTML(booking),
    });

    console.log(
      `✅ Email notification sent for booking ${booking.bookingNumber}`
    );
    console.log(`📧 Message ID: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error("❌ Error sending email notification:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Test email configuration
export const testEmailConfiguration = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return {
        success: false,
        message:
          "Email configuration missing. Please set SMTP_USER and SMTP_PASSWORD in .env",
      };
    }

    const transporter = createTransporter();
    await transporter.verify();

    return {
      success: true,
      message: "Email configuration is valid and ready to use!",
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Email configuration error: ${error.message}`,
    };
  }
};

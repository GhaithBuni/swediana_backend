import { google } from "googleapis";

export async function addEventToGoogleCalendar(booking: any) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key:
          process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
      },
      projectId: process.env.GOOGLE_PROJECT_ID,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    // Parse the date and time correctly
    const date = new Date(booking.date);
    const time = booking.time || "09:00";

    // Fix: Use proper Date constructor with template literal INSIDE parentheses
    const start = new Date(`${date.toISOString().split("T")[0]}T${time}:00`);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    const event = {
      summary: `Flyttstäd: ${booking.name}`,
      description: `
Namn: ${booking.name}
Telefon: ${booking.phone}
E-post: ${booking.email}
Adress: ${booking.addressStreet}, ${booking.address.postcode}
Storlek: ${booking.size} m²
Typ av städning: ${booking.cleanType}
Meddelande: ${booking.message || "Ingen"}
      `.trim(),
      start: {
        dateTime: start.toISOString(),
        timeZone: "Europe/Stockholm",
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: "Europe/Stockholm",
      },
    };

    // Use your actual calendar ID instead of "primary"
    const calendarId = process.env.GOOGLE_CALENDAR_ID || "aalmajdami@gmail.com";

    const response = await calendar.events.insert({
      calendarId: calendarId,
      requestBody: event,
    });

    console.log("Added to Google Calendar:", response.data.id);
    console.log("Event link:", response.data.htmlLink); // Helpful for debugging

    return {
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
    };
  } catch (err: any) {
    console.error("Google Calendar error:", err);
    console.error("Error details:", err.message);
    if (err.response) {
      console.error("API response:", err.response.data);
    }
    return { success: false, error: err.message };
  }
}

export async function addEventToGoogleCalendarBygg(booking: any) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key:
          process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
      },
      projectId: process.env.GOOGLE_PROJECT_ID,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    // Parse the date and time correctly
    const date = new Date(booking.date);
    const time = booking.time || "09:00";

    // Fix: Use proper Date constructor with template literal INSIDE parentheses
    const start = new Date(`${date.toISOString().split("T")[0]}T${time}:00`);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    const event = {
      summary: `Byggstäd: ${booking.name}`,
      description: `
Namn: ${booking.name}
Telefon: ${booking.phone}
E-post: ${booking.email}
Adress: ${booking.addressStreet}, ${booking.address.postcode}
Storlek: ${booking.size} m²
Typ av städning: ${booking.cleanType}
Meddelande: ${booking.message || "Ingen"}
      `.trim(),
      start: {
        dateTime: start.toISOString(),
        timeZone: "Europe/Stockholm",
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: "Europe/Stockholm",
      },
    };

    // Use your actual calendar ID instead of "primary"
    const calendarId = process.env.GOOGLE_CALENDAR_ID || "aalmajdami@gmail.com";

    const response = await calendar.events.insert({
      calendarId: calendarId,
      requestBody: event,
    });

    console.log("Added to Google Calendar:", response.data.id);
    console.log("Event link:", response.data.htmlLink); // Helpful for debugging

    return {
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
    };
  } catch (err: any) {
    console.error("Google Calendar error:", err);
    console.error("Error details:", err.message);
    if (err.response) {
      console.error("API response:", err.response.data);
    }
    return { success: false, error: err.message };
  }
}

export async function addEventToGoogleCalendarMove(booking: any) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key:
          process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
      },
      projectId: process.env.GOOGLE_PROJECT_ID,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    // Parse the date and time correctly
    const date = new Date(booking.date);
    const time = booking.time || "09:00";

    // Fix: Use proper Date constructor with template literal INSIDE parentheses
    const start = new Date(`${date.toISOString().split("T")[0]}T${time}:00`);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    const event = {
      summary: `Flytthjälp: ${booking.name}`,
      description: `
Namn: ${booking.name}
Telefon: ${booking.phone}
E-post: ${booking.email}
Adress Från: ${booking.addressStreet}, ${booking.from.postcode}
Adress Till:  ${booking.to.postcode}
Storlek: ${booking.size} m²
Meddelande: ${booking.message || "Ingen"}
      `.trim(),
      start: {
        dateTime: start.toISOString(),
        timeZone: "Europe/Stockholm",
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: "Europe/Stockholm",
      },
    };

    // Use your actual calendar ID instead of "primary"
    const calendarId = process.env.GOOGLE_CALENDAR_ID || "aalmajdami@gmail.com";

    const response = await calendar.events.insert({
      calendarId: calendarId,
      requestBody: event,
    });

    console.log("Added to Google Calendar:", response.data.id);
    console.log("Event link:", response.data.htmlLink); // Helpful for debugging

    return {
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
    };
  } catch (err: any) {
    console.error("Google Calendar error:", err);
    console.error("Error details:", err.message);
    if (err.response) {
      console.error("API response:", err.response.data);
    }
    return { success: false, error: err.message };
  }
}

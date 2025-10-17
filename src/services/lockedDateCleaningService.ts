import { LockedDateCleaning } from "../models/LockedDateCleaning";

interface LockedDateResult {
  date: string;
  createdAt: Date;
}

interface BulkInsertResult {
  inserted: number;
  skipped: number;
}

class LockedDateService {
  // Helper function to format date as YYYY-MM-DD
  private formatDateToYMD(date: Date): string {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // Helper function to parse YYYY-MM-DD to Date (UTC midnight)
  private parseYMDToDate(ymd: string): Date {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  }

  // Get all future locked dates (for calendar)
  async getFutureLockedDates(): Promise<string[]> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const lockedDates = await LockedDateCleaning.find({
      date: { $gte: today },
    })
      .select("date -_id")
      .sort({ date: 1 })
      .lean();

    return lockedDates.map((doc) => this.formatDateToYMD(doc.date));
  }

  // Get all locked dates including past ones
  async getAllLockedDates(): Promise<LockedDateResult[]> {
    const lockedDates = await LockedDateCleaning.find()
      .sort({ date: -1 })
      .lean();

    return lockedDates.map((doc) => ({
      date: this.formatDateToYMD(doc.date),
      createdAt: doc.createdAt,
    }));
  }

  // Add a single locked date
  async addLockedDate(dateString: string): Promise<LockedDateResult> {
    // Validate date format
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }

    // Parse and validate date
    const dateObj = this.parseYMDToDate(dateString);
    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date");
    }

    // Check if date is in the past
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (dateObj < today) {
      throw new Error("Cannot lock dates in the past");
    }

    // Create locked date
    const lockedDate = new LockedDateCleaning({ date: dateObj });
    await lockedDate.save();

    return {
      date: this.formatDateToYMD(lockedDate.date),
      createdAt: lockedDate.createdAt,
    };
  }

  // Add multiple locked dates
  async addMultipleLockedDates(dates: string[]): Promise<BulkInsertResult> {
    if (!Array.isArray(dates) || dates.length === 0) {
      throw new Error("dates must be a non-empty array");
    }

    const lockedDates = dates
      .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
      .map((date) => ({ date: this.parseYMDToDate(date) }));

    if (lockedDates.length === 0) {
      throw new Error("No valid dates provided");
    }

    // Use insertMany with ordered: false to continue on duplicates
    try {
      const result = await LockedDateCleaning.insertMany(lockedDates, {
        ordered: false,
      });

      return {
        inserted: result.length,
        skipped: 0,
      };
    } catch (err: any) {
      // Handle bulk write errors (e.g., duplicates)
      if (err.writeErrors) {
        return {
          inserted: err.result.nInserted,
          skipped: err.writeErrors.length,
        };
      }
      throw err;
    }
  }

  // Remove a locked date
  async removeLockedDate(dateString: string): Promise<{ date: string }> {
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }

    const dateObj = this.parseYMDToDate(dateString);
    const result = await LockedDateCleaning.deleteOne({ date: dateObj });

    if (result.deletedCount === 0) {
      throw new Error("Locked date not found");
    }

    return { date: dateString };
  }

  // Check if a date is locked
  async isDateLocked(dateString: string): Promise<boolean> {
    const dateObj = this.parseYMDToDate(dateString);
    const locked = await LockedDateCleaning.findOne({ date: dateObj });
    return !!locked;
  }

  // Remove all past locked dates (cleanup utility)
  async removePastLockedDates(): Promise<{ deleted: number }> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const result = await LockedDateCleaning.deleteMany({
      date: { $lt: today },
    });

    return { deleted: result.deletedCount || 0 };
  }
}

export default new LockedDateService();

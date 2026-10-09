/**
 * NOVA Real-Time Trip Timeline & Date Engine
 * 
 * Provides dynamic, time-aware calculation of trip statuses, itinerary day progression,
 * activity time states, transport transit statuses, and relative calendar countdowns.
 */

export type TripTimelineStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
export type ItineraryDayStatus = 'Completed' | 'Today' | 'Upcoming';
export type ActivityTimelineStatus = 'Completed' | 'In Progress' | 'Upcoming' | 'Today';
export type TransportTimelineStatus = 'Completed' | 'In Transit' | 'Upcoming';

export interface TripTimelineDetails {
  status: TripTimelineStatus;
  timelineLabel: string;
  totalDays: number;
  currentDay: number;
  daysRemaining: number;
  daysUntilStart: number;
  daysAgo: number;
  startDate: Date | null;
  endDate: Date | null;
  formattedRange: string;
}

/**
 * Normalizes any date into a clean local calendar Date at 00:00:00.000
 * avoiding timezone offset shifts.
 */
export function normalizeCalendarDate(input: Date | string | number | undefined | null): Date | null {
  if (!input) return null;

  if (input instanceof Date) {
    if (isNaN(input.getTime())) return null;
    return new Date(input.getFullYear(), input.getMonth(), input.getDate(), 0, 0, 0, 0);
  }

  const str = String(input).trim();
  if (!str) return null;

  // Handle standard YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    return new Date(year, month, day, 0, 0, 0, 0);
  }

  // Handle textual format like "Sep 12, 2026" or "12 Sep 2026"
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0);
  }

  return null;
}

/**
 * Returns the current reference date at 00:00:00.
 */
export function getSystemCurrentDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/**
 * Safely parses an ambiguous date range string like "12 – 15 September 2026" or "2026-09-28 – 2026-10-02"
 */
export function extractDateRangeFromText(text: string): { start: Date | null; end: Date | null } {
  if (!text) return { start: null, end: null };

  const parts = text.split(/–|-|to/i).map((p) => p.trim());
  if (parts.length >= 2) {
    const p1 = parts[0];
    const p2 = parts[1];

    // If p1 is just day number e.g. "12" and p2 has month year "15 September 2026"
    if (/^\d{1,2}$/.test(p1)) {
      const yearMatch = p2.match(/\b\d{4}\b/);
      const monthMatch = p2.match(/[a-zA-Z]+/);
      if (yearMatch && monthMatch) {
        const synthesizedStart = `${monthMatch[0]} ${p1}, ${yearMatch[0]}`;
        const s = normalizeCalendarDate(synthesizedStart);
        const e = normalizeCalendarDate(p2);
        if (s && e) return { start: s, end: e };
      }
    }

    const s = normalizeCalendarDate(p1);
    const e = normalizeCalendarDate(p2);
    if (s && e) return { start: s, end: e };
  }

  const single = normalizeCalendarDate(text);
  return { start: single, end: single };
}

/**
 * Formats a Date object into standard readable calendar representation
 */
export function formatCalendarDate(d: Date | string | null | undefined): string {
  const date = normalizeCalendarDate(d);
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formats start and end dates into a polished range string:
 * e.g. "28 Sep – 02 Oct 2026"
 */
export function formatTripDateRange(
  startDateStr?: string | Date | null,
  endDateStr?: string | Date | null,
  fallback?: string
): string {
  const s = normalizeCalendarDate(startDateStr);
  const e = normalizeCalendarDate(endDateStr);

  if (!s && !e) return fallback || 'Dates to be announced';
  if (s && !e) return formatCalendarDate(s);
  if (!s && e) return formatCalendarDate(e);

  if (s && e) {
    const sDay = s.getDate();
    const eDay = e.getDate();
    const sMonth = s.toLocaleDateString('en-US', { month: 'short' });
    const eMonth = e.toLocaleDateString('en-US', { month: 'short' });
    const sYear = s.getFullYear();
    const eYear = e.getFullYear();

    if (sYear === eYear) {
      if (sMonth === eMonth) {
        return `${sDay} – ${eDay} ${sMonth} ${sYear}`;
      }
      return `${sDay} ${sMonth} – ${eDay} ${eMonth} ${sYear}`;
    }
    return `${sDay} ${sMonth} ${sYear} – ${eDay} ${eMonth} ${eYear}`;
  }

  return fallback || '';
}

/**
 * Calculates real-time trip timeline state, dynamic status, and relative countdown badge
 */
export function getTripTimeline(
  startInput?: string | Date | { startDate?: string; endDate?: string; dates?: string; status?: string },
  endInput?: string | Date,
  explicitStatus?: string
): TripTimelineDetails {
  let sDate: Date | null = null;
  let eDate: Date | null = null;
  let statusOverride = explicitStatus;

  if (typeof startInput === 'object' && !(startInput instanceof Date)) {
    if (startInput) {
      if (startInput.status) statusOverride = startInput.status;
      if (startInput.startDate) sDate = normalizeCalendarDate(startInput.startDate);
      if (startInput.endDate) eDate = normalizeCalendarDate(startInput.endDate);
      if ((!sDate || !eDate) && startInput.dates) {
        const extracted = extractDateRangeFromText(startInput.dates);
        if (!sDate) sDate = extracted.start;
        if (!eDate) eDate = extracted.end;
      }
    }
  } else {
    sDate = normalizeCalendarDate(startInput as string | Date);
    eDate = normalizeCalendarDate(endInput);
  }

  // Fallback defaults if dates are incomplete
  const today = getSystemCurrentDate();
  if (!sDate && !eDate) {
    sDate = new Date(today);
    eDate = new Date(today);
    eDate.setDate(today.getDate() + 4);
  } else if (sDate && !eDate) {
    eDate = new Date(sDate);
    eDate.setDate(sDate.getDate() + 3);
  } else if (!sDate && eDate) {
    sDate = new Date(eDate);
    sDate.setDate(eDate.getDate() - 3);
  }

  // Enforce start <= end
  if (sDate! > eDate!) {
    const temp = sDate!;
    sDate = eDate!;
    eDate = temp;
  }

  const oneDayMs = 24 * 60 * 60 * 1000;
  const totalDays = Math.max(1, Math.round((eDate!.getTime() - sDate!.getTime()) / oneDayMs) + 1);

  // If user explicitly marked trip as Cancelled
  if (statusOverride?.toLowerCase() === 'cancelled') {
    return {
      status: 'Cancelled',
      timelineLabel: 'Trip Cancelled',
      totalDays,
      currentDay: 0,
      daysRemaining: 0,
      daysUntilStart: 0,
      daysAgo: 0,
      startDate: sDate,
      endDate: eDate,
      formattedRange: formatTripDateRange(sDate, eDate),
    };
  }

  // Compare with current system calendar date
  const todayTime = today.getTime();
  const startTime = sDate!.getTime();
  const endTime = eDate!.getTime();

  if (todayTime < startTime) {
    // Upcoming
    const daysUntilStart = Math.round((startTime - todayTime) / oneDayMs);
    const timelineLabel =
      daysUntilStart === 0
        ? 'Starts today'
        : daysUntilStart === 1
        ? 'Starts tomorrow'
        : `Starts in ${daysUntilStart} days`;

    return {
      status: 'Upcoming',
      timelineLabel,
      totalDays,
      currentDay: 0,
      daysRemaining: totalDays,
      daysUntilStart,
      daysAgo: 0,
      startDate: sDate,
      endDate: eDate,
      formattedRange: formatTripDateRange(sDate, eDate),
    };
  } else if (todayTime <= endTime) {
    // Ongoing
    const currentDay = Math.min(totalDays, Math.round((todayTime - startTime) / oneDayMs) + 1);
    const daysRemaining = Math.max(0, Math.round((endTime - todayTime) / oneDayMs));

    let timelineLabel = '';
    if (daysRemaining === 0) {
      timelineLabel = `Ongoing · Day ${currentDay} of ${totalDays} (Ends today)`;
    } else if (daysRemaining === 1) {
      timelineLabel = `Ongoing · Day ${currentDay} of ${totalDays} (1 day remaining)`;
    } else {
      timelineLabel = `Ongoing · Day ${currentDay} of ${totalDays} (${daysRemaining} days remaining)`;
    }

    return {
      status: 'Ongoing',
      timelineLabel,
      totalDays,
      currentDay,
      daysRemaining,
      daysUntilStart: 0,
      daysAgo: 0,
      startDate: sDate,
      endDate: eDate,
      formattedRange: formatTripDateRange(sDate, eDate),
    };
  } else {
    // Completed
    const daysAgo = Math.round((todayTime - endTime) / oneDayMs);
    const timelineLabel =
      daysAgo === 0
        ? 'Completed today'
        : daysAgo === 1
        ? 'Completed yesterday'
        : `Completed ${daysAgo} days ago`;

    return {
      status: 'Completed',
      timelineLabel,
      totalDays,
      currentDay: totalDays,
      daysRemaining: 0,
      daysUntilStart: 0,
      daysAgo,
      startDate: sDate,
      endDate: eDate,
      formattedRange: formatTripDateRange(sDate, eDate),
    };
  }
}

/**
 * Calculates day timeline status: Completed, Today, or Upcoming
 */
export function getItineraryDayTimelineStatus(dayDateInput: string | Date | undefined | null): ItineraryDayStatus {
  const d = normalizeCalendarDate(dayDateInput);
  if (!d) return 'Upcoming';

  const today = getSystemCurrentDate();
  const dTime = d.getTime();
  const tTime = today.getTime();

  if (dTime < tTime) return 'Completed';
  if (dTime === tTime) return 'Today';
  return 'Upcoming';
}

/**
 * Parses a time string like "09:00 AM", "02:30 PM", "14:00" into minutes from midnight
 */
export function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.trim();

  // Match e.g. "09:00 AM" or "9:00 PM"
  const ampmMatch = clean.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const meridian = ampmMatch[3]?.toUpperCase();

    if (meridian === 'PM' && hours < 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  // Match 24h e.g. "14:30"
  const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return parseInt(match24[1], 10) * 60 + parseInt(match24[2], 10);
  }

  return null;
}

/**
 * Determines real-time activity status based on date and time range
 */
export function getActivityTimelineStatus(
  dayDateInput: string | Date | undefined | null,
  timeRangeStr?: string,
  durationMinutes: number = 120
): ActivityTimelineStatus {
  const dayStatus = getItineraryDayTimelineStatus(dayDateInput);
  if (dayStatus === 'Completed') return 'Completed';
  if (dayStatus === 'Upcoming') return 'Upcoming';

  // Day is TODAY: inspect time
  if (!timeRangeStr) return 'Today';

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Split range if "09:00 AM – 11:30 AM" or "09:00 AM - 11:00 AM"
  const parts = timeRangeStr.split(/–|-|to/i).map((s) => s.trim());
  const startMinutes = parseTimeToMinutes(parts[0]);

  if (startMinutes === null) return 'In Progress';

  let endMinutes = parts.length > 1 ? parseTimeToMinutes(parts[1]) : null;
  if (endMinutes === null || endMinutes <= startMinutes) {
    endMinutes = startMinutes + durationMinutes;
  }

  if (currentMinutes < startMinutes) {
    return 'Upcoming';
  } else if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
    return 'In Progress';
  } else {
    return 'Completed';
  }
}

/**
 * Determines transportation status based on travel date and departure/arrival times
 */
export function getTransportTimelineStatus(
  travelDateInput: string | Date | undefined | null,
  departureTimeStr?: string,
  arrivalTimeStr?: string
): TransportTimelineStatus {
  const dayStatus = getItineraryDayTimelineStatus(travelDateInput);
  if (dayStatus === 'Completed') return 'Completed';
  if (dayStatus === 'Upcoming') return 'Upcoming';

  // Travel is TODAY
  if (!departureTimeStr) return 'In Transit';

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const depMinutes = parseTimeToMinutes(departureTimeStr);
  if (depMinutes === null) return 'In Transit';

  let arrMinutes = parseTimeToMinutes(arrivalTimeStr);
  if (arrMinutes === null || arrMinutes <= depMinutes) {
    arrMinutes = depMinutes + 180; // default 3 hr journey
  }

  if (currentMinutes < depMinutes) {
    return 'Upcoming';
  } else if (currentMinutes >= depMinutes && currentMinutes <= arrMinutes) {
    return 'In Transit';
  } else {
    return 'Completed';
  }
}

/**
 * Validates logical date consistency
 */
export function validateTripDateConsistency(
  startDateStr: string | Date | undefined | null,
  endDateStr: string | Date | undefined | null
): { isValid: boolean; error?: string } {
  const s = normalizeCalendarDate(startDateStr);
  const e = normalizeCalendarDate(endDateStr);

  if (!s || !e) {
    return { isValid: false, error: 'Start date and end date are required.' };
  }

  if (s > e) {
    return { isValid: false, error: 'Trip start date cannot be after the end date.' };
  }

  return { isValid: true };
}

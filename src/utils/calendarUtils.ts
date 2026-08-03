// Helper utilities for generating Google Calendar URLs, downloadable .ics files, and Google Calendar API calls

export interface CalendarEventDetails {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  patientName?: string;
  palName?: string;
  reminderMinutesBefore?: number[];
}

/**
 * Generate Google Calendar web add link
 */
export function createGoogleCalendarUrl(event: CalendarEventDetails): string {
  const formatGCalDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const startIso = formatGCalDate(event.startTime);
  const endIso = formatGCalDate(event.endTime);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${startIso}/${endIso}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate downloadable .ics iCalendar file content
 */
export function generateIcsContent(event: CalendarEventDetails): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const remindersIcs = (event.reminderMinutesBefore || [1440, 120, 30])
    .map(
      (mins) => `
BEGIN:VALARM
TRIGGER:-PT${mins}M
ACTION:DISPLAY
DESCRIPTION:Reminder: ${event.title}
END:VALARM`
    )
    .join('');

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PathPal Hospital Companion Service//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location}
DTSTART:${formatDate(event.startTime)}
DTEND:${formatDate(event.endTime)}
DTSTAMP:${formatDate(new Date())}
UID:pathpal-${Date.now()}@pathpal.app${remindersIcs}
END:VEVENT
END:VCALENDAR`;
}

/**
 * Trigger immediate browser download of .ics file
 */
export function downloadIcsFile(event: CalendarEventDetails, filename = 'pathpal-appointment.ics') {
  const content = generateIcsContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Add event via Google Calendar API if OAuth token is present
 */
export async function addEventViaGoogleCalendarApi(
  accessToken: string,
  event: CalendarEventDetails
): Promise<{ success: boolean; eventUrl?: string; error?: string }> {
  try {
    const payload = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.startTime.toISOString(),
      },
      end: {
        dateTime: event.endTime.toISOString(),
      },
      reminders: {
        useDefault: false,
        overrides: (event.reminderMinutesBefore || [1440, 120, 30]).map((mins) => ({
          method: 'popup',
          minutes: mins,
        })),
      },
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || 'Failed to insert event to Google Calendar');
    }

    const data = await response.json();
    return { success: true, eventUrl: data.htmlLink };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error connecting to Google Calendar' };
  }
}

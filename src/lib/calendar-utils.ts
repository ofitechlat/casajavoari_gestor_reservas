/**
 * Generates a Google Calendar "Add Event" link.
 * @param event The event details
 * @returns A URL string
 */
export function generateGoogleCalendarUrl(event: {
    title: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    startTime?: string; // HH:mm
}) {
    const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';

    // Format dates for Google: YYYYMMDDTHHmmSSZ
    const formatDate = (date: Date, timeStr?: string) => {
        const d = new Date(date);
        if (timeStr) {
            const [hours, minutes] = timeStr.split(':');
            d.setHours(parseInt(hours), parseInt(minutes));
        }
        return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const text = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description || '');

    const startStr = formatDate(event.startDate, event.startTime);
    // If no end date, default to 1 hour after start
    const endStr = event.endDate
        ? formatDate(event.endDate, event.startTime)
        : formatDate(new Date(event.startDate.getTime() + 60 * 60 * 1000), event.startTime);

    return `${baseUrl}&text=${text}&details=${details}&dates=${startStr}/${endStr}`;
}

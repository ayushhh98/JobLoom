export const generateGoogleCalendarLink = (title, description, location, startTime, durationMinutes = 60) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    const formatTime = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: title,
        details: description,
        location: location,
        dates: `${formatTime(start)}/${formatTime(end)}`
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const downloadICSFile = (title, description, location, startTime, durationMinutes = 60) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    const formatTime = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//HireApp//Interview//EN
BEGIN:VEVENT
UID:${Date.now()}@hireapp.com
DTSTAMP:${formatTime(new Date())}
DTSTART:${formatTime(start)}
DTEND:${formatTime(end)}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "interview.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

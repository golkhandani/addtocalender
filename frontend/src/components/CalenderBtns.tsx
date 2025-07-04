import type { EventData } from "../models/index"
import styles from "./CalenderBtns.module.css"

export default function CalendarBtns({
    eventData,
    onUpdate
}: {
    eventData: EventData,
    onUpdate: (updatedEvent: EventData) => void
},) {
    return (
        <div className={styles.form}>
            <div className={styles.inputs}>
                <input
                    type="text"
                    value={eventData.title}
                    onChange={(e) => {
                        eventData.title = e.target.value
                        onUpdate(eventData)
                    }}
                />

                <input
                    type="text"
                    value={eventData.description}
                    onChange={(e) => {
                        eventData.description = e.target.value
                        onUpdate(eventData)
                    }}
                />

                <label>
                    Location:
                    <input
                        type="text"
                        value={eventData.location}
                        onChange={(e) => {
                            eventData.location = e.target.value
                            onUpdate(eventData)
                        }}
                    />
                </label>

                <label>
                    Date and time:
                </label>
                <input
                    type="text"
                    value={eventData.date}
                    onChange={(e) => {
                        eventData.date = e.target.value
                        onUpdate(eventData)
                    }}
                />
                <input
                    type="text"
                    value={eventData.startTime}
                    onChange={(e) => {
                        eventData.startTime = e.target.value
                        onUpdate(eventData)
                    }}
                />

                <input
                    type="text"
                    value={eventData.endTime}
                    onChange={(e) => {
                        eventData.endTime = e.target.value
                        onUpdate(eventData)
                    }}
                />


            </div>

            <div className={styles.buttonRow}>

                <button className={styles.googleBtn} onClick={() => handleGoogleCalendar(eventData)}>
                    Google
                </button>
                <button className={styles.outlookBtn} onClick={() => handleOutlookCalendar(eventData)}>
                    Outlook
                </button>
                <button className={styles.appleBtn} onClick={() => handleAppleCalendar(eventData)}>
                    Apple(.ics) File
                </button>
            </div>
        </div>
    )
}

function toUTCString(dateStr: string, timeStr: string) {
    const date = new Date(`${dateStr} ${timeStr}`);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-based
    const day = String(date.getDate()).padStart(2, "0");

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

function handleGoogleCalendar(event: EventData) {
    const start = toUTCString(event.date, event.startTime);
    const end = toUTCString(event.date, event.endTime);

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: event.title,
        dates: `${start}/${end}`,
        details: event.description ?? event.title,
        location: event.location
    });

    const url = `https://www.google.com/calendar/render?${params.toString()}`;
    console.log(params.toString());

    window.open(url, "_blank");

}

function handleAppleCalendar(event: EventData) {
    const start = toUTCString(event.date, event.startTime);
    const end = toUTCString(event.date, event.endTime);

    const cal = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description ?? event.title}
LOCATION:${event.location}
DTSTART:${start}
DTEND:${end}
END:VEVENT
END:VCALENDAR`;
    const filename = "event.ics"

    const blob = new Blob([cal], { type: "text/calendar" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}


function handleOutlookCalendar(event: EventData) {
    const start = new Date(`${event.date} ${event.startTime}`).toISOString();
    const end = new Date(`${event.date} ${event.endTime}`).toISOString();

    const params = new URLSearchParams({
        path: "/calendar/action/compose",
        rru: "addevent",
        subject: event.title,
        body: event.description ?? event.title,
        location: event.location,
        startdt: start,
        enddt: end
    });

    const url = `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
    window.open(url, "_blank");
}
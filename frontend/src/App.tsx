import { useState } from 'react';
import styles from './App.module.css';
import Tesseract from 'tesseract.js';

type EventData = {
  title: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
};

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;


window.addEventListener('beforeinstallprompt', (e: Event) => {
  e.preventDefault();
  deferredPrompt = e as BeforeInstallPromptEvent;
});

// On button click:
const promptInstall = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') {
        console.log('User accepted PWA install');
      }
      deferredPrompt = null;
    });
  }
};


function App() {
  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState<EventData | null>(null);



  async function aiParseEvent(ocrText: string) {
    const res = await fetch('https://addtocalender.onrender.com/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: ocrText }),
    });

    if (!res.ok) throw new Error('Failed to parse event');

    const data = await res.json();
    setEventData(data);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result as string;
      setImage(imageUrl);
      runOCR(imageUrl);
    };
    reader.readAsDataURL(file);
  }

  function runOCR(imageUrl: string) {
    setLoading(true);
    setExtractedText('');

    Tesseract.recognize(imageUrl, 'eng')
      .then(({ data: { text } }) => {
        setExtractedText(text);
        return aiParseEvent(text); // 🔥 call your backend here
      })
      .catch((err) => {
        console.error('OCR error:', err);
        setExtractedText('Failed to extract text.');
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function generateICS(event: EventData) {
    if (!event) return;

    const start = parseEventDate(event.date, event.startTime);
    const end = parseEventDate(event.date, event.endTime);

    const toICS = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title}
LOCATION:${event.location}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
DESCRIPTION:Generated from image
END:VEVENT
END:VCALENDAR
`;

    const blob = new Blob([toICS.trim()], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'event.ics';
    a.click();
    URL.revokeObjectURL(url);
  }

  function formatDate(date: Date) {
    return date
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0] + 'Z';
  }

  function parseEventDate(dateStr: string, timeStr: string) {
    const [month, dayWithComma, year] = dateStr.split(" ");
    const day = dayWithComma.replace(",", "");

    const [time, modifier] = timeStr.split(" ");
    let [hour, minute = 0] = time.split(":").map(Number);

    if (modifier.toLowerCase() === "pm" && hour < 12) hour += 12;
    if (modifier.toLowerCase() === "am" && hour === 12) hour = 0;

    const date = new Date(`${month} ${day}, ${year} ${hour}:${minute}`);
    return date;
  }

  function handleGoogleCalendar(event: typeof eventData | null) {
    if (!event) {
      alert('Event data is missing.');
      return;
    }

    try {
      const start = parseEventDate(event.date, event.startTime);
      const end = parseEventDate(event.date, event.endTime);

      console.log(start, end);


      const formatDate = (d: Date) =>
        d.toISOString().replace(/[-:]|\.000/g, '').slice(0, 15) + 'Z';

      const url = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(
        event.title
      )}&dates=${formatDate(start)}/${formatDate(end)}&location=${encodeURIComponent(
        event.location
      )}`;

      window.open(url, '_blank');
    } catch (err) {
      console.log(err);

      alert('Error preparing Google Calendar link.');
    }
  }
  function handleOutlookCalendar(event: typeof eventData | null) {
    if (!event) {
      alert('Event data is missing.');
      return;
    }

    try {
      const start = parseEventDate(event.date, event.startTime);
      const end = parseEventDate(event.date, event.endTime);

      const url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
        event.title
      )}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&location=${encodeURIComponent(
        event.location
      )}`;

      window.open(url, '_blank');
    } catch (err) {
      alert('Error preparing Outlook Calendar link.');
    }
  }

  function handleAppleCalendar(event: typeof eventData | null) {
    if (!event) {
      alert('Event data is missing.');
      return;
    }

    try {
      generateICS(event); // Assuming generateICS uses the current `eventData` internally
    } catch (err) {
      alert('Could not generate .ics file for Apple Calendar.');
    }
  }

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Add it to My Cal 📆</h1>
        <p className={styles.description}>
          Tired of missing events because you were too lazy to say
          <i> “Hey Siri, set a calendar reminder...”</i>?
          <br />
          I got you. Just share a picture or screenshot — and I’ll give you calendar magic in seconds.
        </p>
        <button className={styles.uploadBtn} onClick={promptInstall}>Install PWA</button>
      </header>

      <div className={styles.main}>
        <main className={styles.columns}>
          <main className={styles.columns}>
            {/* Column 1: Image Upload */}
            <div className={styles.column}>
              <h3>Upload Image</h3>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="fileInput" className={styles.uploadBtn}>
                Upload Your Photo
              </label>

              {image && <img src={image} alt="Uploaded" />}
            </div>

            {/* Column 2: Extracted Text */}
            <div className={styles.column}>
              <h3>Extracted Text</h3>
              {loading ? (
                <p>Extracting text...</p>
              ) : (
                <textarea className={styles.textArea} readOnly value={extractedText}></textarea>
              )}
            </div>

            {/* Column 3: Calendar Info */}
            <div className={styles.column}>
              <h3>Calendar Info</h3>
              {eventData ? (
                <div className={styles.form}>
                  <input
                    type="text"
                    value={eventData.title}
                    onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                  />

                  <label>
                    Location:
                    <input
                      type="text"
                      value={eventData.location}
                      onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                    />
                  </label>

                  <label>
                    Date and time:
                  </label>
                  <input
                    type="text"
                    value={eventData.date}
                    onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                  />
                  <input
                    type="text"
                    value={eventData.startTime}
                    onChange={(e) => setEventData({ ...eventData, startTime: e.target.value })}
                  />

                  <input
                    type="text"
                    value={eventData.endTime}
                    onChange={(e) => setEventData({ ...eventData, endTime: e.target.value })}
                  />

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
              ) : (
                <p>Waiting for event data...</p>
              )}
            </div>
          </main>
        </main>
      </div>


    </>


  );
}

export default App;

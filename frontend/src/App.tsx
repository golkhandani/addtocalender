import { useEffect, useState } from 'react';
import styles from './App.module.css';
import { createWorker, OEM } from 'tesseract.js';
import CalendarBtns from './components/CalenderBtns';
import type { EventData } from './models';
import Header from './components/Header';
const apiUrl = import.meta.env.VITE_API_BASE_URL;

export default function App() {

  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<EventData[] | []>([]);

  async function aiParseEvent(ocrText: string) {
    const url = `${apiUrl}/parse`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: ocrText }),
    });

    if (!res.ok) throw new Error('Failed to parse event');

    const data = await res.json();
    setEvents((data.data as EventData[]).filter((e) => e.date != ""))
    return data;
  }

  async function wakeupServer() {
    const url = `${apiUrl}/wakeup`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error('Failed to wakeup');

    const data = await res.json();
    setEvents(data.data)
    return data;
  }

  useEffect(() => {
    if (extractedText != "") {
      aiParseEvent(extractedText)
    }
  }, [extractedText])

  useEffect(() => {
    wakeupServer();
  }, [])

  function reset() {
    setImage(null);
    setExtractedText("");
    setEvents([]);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    reset()
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



  async function runOCR(imageUrl: string) {
    setLoading(true);
    setExtractedText('');
    const worker = await createWorker('eng', OEM.TESSERACT_LSTM_COMBINED,
      {
        gzip: true,
      },
      {}
    );
    const ret = await worker.recognize(imageUrl);
    const text = ret.data.text;
    setExtractedText(text);
    console.log(ret.data.text);
    await worker.terminate();
    setLoading(false);
  }


  return (
    <>
      <Header></Header>

      <div className={styles.main} id='proccess'>
        <main className={styles.columns}>
          <div className={styles.column}>
            <h3>1.Upload Image</h3>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="fileInput" className={`btn ${styles.uploadBtn}`}>
              Upload Your Photo
            </label>

            {image && <img src={image} alt="Uploaded" />}
          </div>

          <div className={styles.column}>
            <h3>2.Extracted Text</h3>
            {
              !loading && !extractedText && <p>Waiting to extract text...</p>
            }
            {
              loading && !extractedText && <p>Extracting text...</p>
            }
            {
              extractedText &&
              <textarea
                className={styles.textArea}
                readOnly value={extractedText}></textarea>
            }
          </div>

          <div className={styles.column}>
            <h3>3.Calendar Info</h3>

            {
              events == null ? <p>Waiting for event data...</p> :
                events!.map((eventData, index) => {
                  return eventData ? (
                    <CalendarBtns
                      key={index}
                      eventData={eventData}
                      onUpdate={(updatedEvent) => {
                        setEvents((events) => {
                          events![index] = updatedEvent
                          return events;
                        })
                      }}></CalendarBtns>
                  ) : (
                    <p>Waiting for event data...</p>
                  )
                })
            }
          </div>
        </main>
      </div>
    </>
  );
}


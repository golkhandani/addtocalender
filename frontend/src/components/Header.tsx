import { isRunningOnMobile } from "../utils/isMobileBrowser";
import { isRunningStandalone } from "../utils/isRunningStandalone";
import { useInstallPrompt } from "../utils/useInstallPrompt";
import styles from "./Header.module.css"

export default function Header() {
    const isStandalone = isRunningStandalone()
    const isMobile = isRunningOnMobile();
    const { promptInstall } = useInstallPrompt();


    return (
        <header className={styles.header}>
            <div className={styles['title-section']}>
                <h1 className={styles.title}>Add it to My Calendar 📆</h1>
                <p className={styles.description}>
                    Tired of missing events because you were too lazy to say
                    <i> “Hey Siri, set a calendar reminder...”</i>?
                    <br />
                    I got you. Just share a picture or screenshot — and I’ll give you calendar magic in seconds.
                </p>
                <a className={`btn ${styles['process-btn']} `}
                    href="#proccess">
                    Process
                </a>
            </div>

            <div>
                {
                    !isStandalone && !isMobile &&
                    <button className={`${styles.btn} ${styles.installBtn}`}
                        onClick={promptInstall}>
                        Install PWA
                    </button>
                }
                {
                    !isStandalone && isMobile &&
                    <div className={styles.iosHint}>
                        Tap <b>Share</b> then <b>Add to Home Screen</b> to install this app.
                    </div>
                }
            </div>

        </header>
    )
}
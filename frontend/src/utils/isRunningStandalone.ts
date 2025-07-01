interface NavigatorStandalone extends Navigator {
    standalone?: boolean;
}

export function isRunningStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as NavigatorStandalone).standalone === true;
}
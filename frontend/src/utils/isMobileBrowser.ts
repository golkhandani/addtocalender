export function isRunningOnMobile(): boolean {
    console.log(screen.orientation.type);

    if (typeof screen.orientation !== 'undefined' && screen.orientation.type.startsWith('portrait')) {
        return true
    }
    return false
}
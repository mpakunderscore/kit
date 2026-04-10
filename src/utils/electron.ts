/**
 * When the renderer runs inside the Electron shell, `window.desktopApi` is injected.
 * Adds a class on `<html>` so CSS can target desktop-only layout.
 */
export function applyDesktopDocumentClass(): void {
    if (typeof window === 'undefined') return
    if (window.desktopApi !== undefined) {
        document.documentElement.classList.add('desktop')
    }
}

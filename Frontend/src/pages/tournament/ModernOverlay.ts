export type OverlayType = 'success' | 'error' | 'info' | 'warning';

export class ModernOverlay {
    static show(message: string, type: OverlayType = 'info', options?: { duration?: number }) {
        ModernOverlay.hide();
        const overlay = document.createElement('div');
        overlay.id = 'modern-overlay-notification';
        overlay.className = `fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in`;
        overlay.innerHTML = `
            <div class="relative bg-white/90 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-700/60 px-8 py-8 max-w-md w-full mx-4 flex flex-col items-center animate-pop-in">
                <div class="absolute top-3 right-3 cursor-pointer text-gray-400 hover:text-gray-700 dark:hover:text-white transition" id="modern-overlay-close-btn">
                    <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </div>
                <div class="mb-4">
                    ${ModernOverlay.getIcon(type)}
                </div>
                <div class="text-xl font-bold text-slate-800 dark:text-white mb-2 text-center">
                    ${ModernOverlay.getTitle(type)}
                </div>
                <div class="text-base text-slate-600 dark:text-slate-200 text-center mb-2 whitespace-pre-line">
                    ${message}
                </div>
            </div>
            <style>
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s; }
                @keyframes pop-in { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                .animate-pop-in { animation: pop-in 0.25s cubic-bezier(.16,1,.3,1); }
            </style>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('#modern-overlay-close-btn')?.addEventListener('click', ModernOverlay.hide);
        const duration = options?.duration ?? 2500;
        if (duration > 0) {
            setTimeout(ModernOverlay.hide, duration);
        }
    }

    static hide() {
        const existing = document.getElementById('modern-overlay-notification');
        if (existing) existing.remove();
    }

    static getIcon(type: OverlayType) {
        switch (type) {
            case 'success':
                return `<svg class="w-12 h-12 text-green-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2.5" fill="none"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 13l4 4L17 9"/></svg>`;
            case 'error':
                return `<svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2.5" fill="none"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 9l-6 6M9 9l6 6"/></svg>`;
            case 'warning':
                return `<svg class="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2.5" fill="none"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01"/></svg>`;
            case 'info':
            default:
                return `<svg class="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2.5" fill="none"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8h.01M12 12v4"/></svg>`;
        }
    }

    static getTitle(type: OverlayType) {
        switch (type) {
            case 'success': return 'Başarılı!';
            case 'error': return 'Hata!';
            case 'warning': return 'Uyarı!';
            case 'info':
            default: return 'Bilgi';
        }
    }
}

import { exmp } from '../lang/languageManager';	

export type OverlayType = 'error' | 'success' | 'warning' | 'info';

export class ModernOverlay {
    private static overlay: HTMLElement | null = null;
    private static hideTimeout: NodeJS.Timeout | null = null;

    static show(key: string, type: OverlayType = 'error', duration: number = 4000): void {
        this.hide();

        const overlay = document.createElement('div');
        overlay.className = `modern-overlay modern-overlay-${type}`;
        
        const content = document.createElement('div');
        content.className = 'modern-overlay-content';
        
        const icon = this.getIcon(type);
        const text = document.createElement('span');
        text.setAttribute('data-langm-key', key);
        text.textContent = "!_!";

        content.appendChild(icon);
        content.appendChild(text);
        overlay.appendChild(content);
        
        this.addStyles();
        
        document.body.appendChild(overlay);
        this.overlay = overlay;
        
        requestAnimationFrame(() => {
            exmp.applyLanguage();
            overlay.classList.add('modern-overlay-show');
        });
        
        if (duration > 0) {
            this.hideTimeout = setTimeout(() => {
                this.hide();
            }, duration);
        }
    }

    static hide(): void {
        if (this.overlay) {
            this.overlay.classList.add('modern-overlay-hide');
            setTimeout(() => {
                if (this.overlay && this.overlay.parentNode) {
                    this.overlay.parentNode.removeChild(this.overlay);
                }
                this.overlay = null;
            }, 3000);
        }
        
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
    }

    private static getIcon(type: OverlayType): HTMLElement {
        const icon = document.createElement('div');
        icon.className = 'modern-overlay-icon';
        
        switch (type) {
            case 'error':
                icon.innerHTML = '⚠️';
                break;
            case 'success':
                icon.innerHTML = '✅';
                break;
            case 'warning':
                icon.innerHTML = '⚡';
                break;
            case 'info':
                icon.innerHTML = 'ℹ️';
                break;
        }
        
        return icon;
    }

    private static addStyles(): void {
        if (document.getElementById('modern-overlay-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'modern-overlay-styles';
    }
}

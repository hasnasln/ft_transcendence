import { exmp } from '../lang/languageManager';
export class ModernOverlay {
    static overlay = null;
    static hideTimeout = null;
    static show(key, type = 'error', duration = 4000) {
        this.hide();
        const overlay = document.createElement('div');
        overlay.className = `modern-overlay modern-overlay-${type}`;
        const content = document.createElement('div');
        content.className = 'modern-overlay-content';
        const icon = this.getIcon(type);
        const text = document.createElement('span');
        text.setAttribute('data-langm-key', key);
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
    static hide() {
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
    static getIcon(type) {
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
    static addStyles() {
        if (document.getElementById('modern-overlay-styles'))
            return;
        const styles = document.createElement('style');
        styles.id = 'modern-overlay-styles';
    }
}

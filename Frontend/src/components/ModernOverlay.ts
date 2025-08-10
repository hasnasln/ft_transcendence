import { exmp } from '../languageManager';

export type OverlayType = 'error' | 'success' | 'warning' | 'info';

export class ModernOverlay {
    private static overlay: HTMLElement | null = null;
    private static hideTimeout: NodeJS.Timeout | null = null;

    static show(message: string, type: OverlayType = 'error', duration: number = 4000): void {
        this.hide();

        const overlay = document.createElement('div');
        overlay.className = `modern-overlay modern-overlay-${type}`;
        
        const content = document.createElement('div');
        content.className = 'modern-overlay-content';
        
        const icon = this.getIcon(type);
        const text = document.createElement('span');
        text.textContent = message;
        
        content.appendChild(icon);
        content.appendChild(text);
        overlay.appendChild(content);
        
        this.addStyles();
        
        document.body.appendChild(overlay);
        this.overlay = overlay;
        
        requestAnimationFrame(() => {
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
            }, 300);
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
        styles.textContent = `
            .modern-overlay {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                min-width: 300px;
                padding: 0;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .modern-overlay-show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .modern-overlay-hide {
                transform: translateX(100%);
                opacity: 0;
            }
            
            .modern-overlay-error {
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%);
                color: white;
            }
            
            .modern-overlay-success {
                background: linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(22, 163, 74, 0.95) 100%);
                color: white;
            }
            
            .modern-overlay-warning {
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(217, 119, 6, 0.95) 100%);
                color: white;
            }
            
            .modern-overlay-info {
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(29, 78, 216, 0.95) 100%);
                color: white;
            }
            
            .modern-overlay-content {
                display: flex;
                align-items: center;
                padding: 16px 20px;
                gap: 12px;
                font-size: 14px;
                font-weight: 500;
                line-height: 1.4;
            }
            
            .modern-overlay-icon {
                font-size: 18px;
                flex-shrink: 0;
            }
            
            @media (max-width: 640px) {
                .modern-overlay {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                    min-width: auto;
                    transform: translateY(-100%);
                }
                
                .modern-overlay-show {
                    transform: translateY(0);
                }
                
                .modern-overlay-hide {
                    transform: translateY(-100%);
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

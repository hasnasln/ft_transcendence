import { Router } from "../router";
import { exmp } from "../lang/languageManager";
import { ModernOverlay } from "../components/ModernOverlay";
import { _apiManager } from "../api/APIManager";
export class EmailVerifyPage {
    countdown = 60;
    timerId = null;
    evaluate() {
        return `
        <div class="min-h-screen flex items-center justify-center bg-animated-gradient">
            <main class="glass-container p-10 mx-16 max-w-full lg:max-w-md w-full relative animate-fadeIn">
                <section class="animate-fadeIn">
                    <h2 class="text-3xl font-extrabold text-center mb-6 title-gradient" data-langm-key="emailVerify.title">!_!</h2>
                    <p class="text-center text-premium mb-6" data-langm-key="emailVerify.subtitle">!_!</p>

                    <div class="space-y-4">
                        <input
                            id="verification-code"
                            type="text"
                            class="input-premium w-full"
                            data-langm-key="emailVerify.codePlaceholder"
                            data-langm-path="placeholder"
                            placeholder="!_!"
                            autocomplete="one-time-code"
                        />

                        <div class="flex gap-3">
                            <button id="verify-btn" class="btn-premium flex-1" type="button" data-langm-key="emailVerify.confirm">!_!</button>
                            <button id="resend-btn" class="btn-premium flex-1 opacity-60 cursor-not-allowed" type="button" disabled data-langm-key="emailVerify.resend">!_!</button>
                        </div>

                        <p id="cooldown-text" class="text-center text-sm text-premium mt-2"></p>
                    </div>
                </section>
            </main>
        </div>`;
    }
    onLoad() {
        exmp.applyLanguage();
        const codeInput = document.getElementById("verification-code");
        codeInput?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this.handleVerify();
            }
        });
        this.startCooldown(60);
    }
    onUnload() {
        if (this.timerId !== null) {
            window.clearInterval(this.timerId);
            this.timerId = null;
        }
    }
    onButtonClick(buttonId) {
        switch (buttonId) {
            case "verify-btn":
                this.handleVerify();
                break;
            case "resend-btn":
                this.handleResend();
                break;
        }
    }
    getEmail() {
        try {
            return sessionStorage.getItem("pendingEmail");
        }
        catch {
            return null;
        }
    }
    async handleVerify() {
        const email = this.getEmail();
        const codeEl = document.getElementById("verification-code");
        const code = (codeEl?.value || "").trim();
        if (!email) {
            ModernOverlay.show("emailVerify.errors.missingEmail", "error");
            return;
        }
        if (!code) {
            ModernOverlay.show("emailVerify.errors.missingCode", "warning");
            return;
        }
        try {
            const resp = await _apiManager.verifyEmailToken(code);
            if (!resp || !resp.success) {
                ModernOverlay.show(`auth-messages.${resp?.message}`, "error");
                return;
            }
            ModernOverlay.show(`auth-messages.${resp.message}`, "success", 1500);
            try {
                sessionStorage.removeItem("pendingEmail");
            }
            catch {
                console.error("Failed to clear pending email from sessionStorage");
            }
            setTimeout(() => Router.getInstance().go("/login"), 1600);
        }
        catch (err) {
            console.error("verifyEmail error:", err);
            ModernOverlay.show("emailVerify.errors.networkError", "error");
        }
    }
    async handleResend() {
        const email = this.getEmail();
        if (!email) {
            ModernOverlay.show("emailVerify.errors.missingEmail", "error");
            return;
        }
        const resendBtn = document.getElementById("resend-btn");
        if (!resendBtn || resendBtn.disabled)
            return;
        try {
            const resp = await _apiManager.resendVerification(email);
            if (!resp || !resp.success) {
                ModernOverlay.show(`auth-messages.${resp?.message ?? "resendFailed"}`, "error");
                return;
            }
            ModernOverlay.show(`auth-messages.${resp.message}`, "success", 2000);
            this.startCooldown(60);
        }
        catch (err) {
            console.error("resendVerification error:", err);
            ModernOverlay.show("emailVerify.errors.networkError", "error");
        }
    }
    startCooldown(seconds) {
        const resendBtn = document.getElementById("resend-btn");
        const cdText = document.getElementById("cooldown-text");
        this.countdown = seconds;
        resendBtn?.setAttribute("disabled", "true");
        resendBtn?.classList.add("opacity-60", "cursor-not-allowed");
        if (resendBtn) {
            const existingKey = resendBtn.getAttribute("data-langm-key");
            if (existingKey) {
                resendBtn.setAttribute("data-langm-restore-key", existingKey);
                resendBtn.removeAttribute("data-langm-key");
            }
        }
        const updateText = () => {
            if (cdText) {
                cdText.textContent = exmp.getLang("emailVerify.cooldownText")
                    ?.replace("{s}", String(this.countdown)) ?? `Tekrar gönderebilmek için ${this.countdown}s`;
            }
            if (resendBtn) {
                const base = exmp.getLang("emailVerify.resend") ?? "Tekrar mail gönder";
                resendBtn.textContent = `${base} (${this.countdown}s)`;
            }
        };
        updateText();
        if (this.timerId !== null) {
            window.clearInterval(this.timerId);
        }
        this.timerId = window.setInterval(() => {
            this.countdown -= 1;
            if (this.countdown <= 0) {
                if (this.timerId !== null) {
                    window.clearInterval(this.timerId);
                    this.timerId = null;
                }
                if (cdText)
                    cdText.textContent = "";
                if (resendBtn) {
                    const restoreKey = resendBtn.getAttribute("data-langm-restore-key");
                    if (restoreKey) {
                        resendBtn.setAttribute("data-langm-key", restoreKey);
                        resendBtn.removeAttribute("data-langm-restore-key");
                    }
                    exmp.applyLanguage();
                    resendBtn.removeAttribute("disabled");
                    resendBtn.classList.remove("opacity-60", "cursor-not-allowed");
                }
                return;
            }
            updateText();
        }, 1000);
    }
}

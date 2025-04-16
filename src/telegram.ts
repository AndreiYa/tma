import '../public/telegram-web-app.js';

declare global {
    interface Window {
        Telegram: {
            WebApp: {
                ready: () => void;
                expand: () => void;
                MainButton: {
                    setText: (text: string) => any;
                    show: () => any;
                    hide: () => any;
                    onClick: (callback: () => void) => any;
                };
                HapticFeedback: {
                    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
                    notificationOccurred: (type: 'success' | 'error' | 'warning') => void;
                };
                initDataUnsafe: { user: { id: string } };
            };
        };
    }
}

const TelegramWebApp = window.Telegram?.WebApp;

export default TelegramWebApp;
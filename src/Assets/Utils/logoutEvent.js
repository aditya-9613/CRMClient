export const triggerLogout = () => {
    window.dispatchEvent(new Event("app-logout"));
};
import { WildCardsApp } from "./WildCardsApp.js";

document.addEventListener("DOMContentLoaded", async () => {
    const app = new WildCardsApp();
    window.app = app;
    await app.initialize();
});

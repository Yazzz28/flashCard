export class UIService {
    constructor(appState) {
        this.appState = appState;
    }

    updateStats() {
        const totalCards = document.querySelectorAll(".card").length;
        const revealedCount =
            document.querySelectorAll(".card.revealed").length;
        const percentage =
            totalCards > 0 ? (revealedCount / totalCards) * 100 : 0;

        const totalCountEl = document.getElementById("totalCount");
        const revealedCountEl = document.getElementById("revealedCount");
        const progressFillEl = document.getElementById("progressFill");

        if (totalCountEl) totalCountEl.textContent = totalCards;
        if (revealedCountEl) revealedCountEl.textContent = revealedCount;
        if (progressFillEl) progressFillEl.style.width = `${percentage}%`;
    }

    showLoadingState(container) {
        container.innerHTML =
            '<div class="loading"><div class="spinner"></div></div>';
    }

    showErrorState(
        container,
        message = "❌ Aucune donnée disponible. Vérifiez le fichier data.json",
    ) {
        container.innerHTML = `<div class="error-message">${message}</div>`;
    }

    clearContainer(container) {
        container.innerHTML = "";
    }

    updateActiveButton(selector, activeSelector) {
        document
            .querySelectorAll(selector)
            .forEach((btn) => btn.classList.remove("active"));
        const activeBtn = document.querySelector(activeSelector);
        activeBtn?.classList.add("active");
    }
}

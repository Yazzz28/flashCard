import { STORAGE_KEY } from "./constants.js";

export class CardService {
    constructor(appState, storageService) {
        this.appState = appState;
        this.storageService = storageService;
    }

    create(question, answer, formation, category) {
        const card = document.createElement("div");
        card.className = "card flashcard";
        card.dataset.formation = formation;
        card.dataset.category = category;

        card.innerHTML = `
            <button class="unreveale-card-btn" title="Masquer la réponse">
                <span class="unreveale-icon">🔒</span>
            </button>
            <div class="question">
                <div class="question-icon">Q${this.appState
                    .questionCounter++}</div>
                <div class="question-text">${question}</div>
            </div>
            <div class="answer">${answer}</div>
            <div class="reveal-hint">
                <span class="click-icon">👆</span>
                Cliquez pour révéler la réponse
            </div>
        `;

        // Gestionnaire pour révéler la carte
        card.addEventListener("click", (e) => {
            // Ne pas révéler si on clique sur le bouton de masquage
            if (!e.target.closest(".unreveale-card-btn")) {
                this.reveal(card);
            }
        });

        // Gestionnaire pour masquer à nouveau la réponse
        const unrevealeBtn = card.querySelector(".unreveale-card-btn");
        unrevealeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.unrevealeCard(card);
        });

        return card;
    }

    reveal(card) {
        const answerDiv = card.querySelector(".answer");
        if (!answerDiv.classList.contains("visible")) {
            answerDiv.classList.add("visible");
            card.classList.add("revealed");
            this.appState.revealedCards.add(card);
            this.saveRevealedCards();
        }
    }

    saveRevealedCards() {
        const revealedCardIds = Array.from(this.appState.revealedCards).map(
            (card) => ({
                formation: card.dataset.formation,
                category: card.dataset.category,
                questionText: card.querySelector(".question-text").textContent,
            }),
        );

        this.storageService.save(STORAGE_KEY, revealedCardIds);
    }

    loadRevealedCards() {
        const savedCards = this.storageService.load(STORAGE_KEY);
        if (!savedCards) return;

        savedCards.forEach((cardData) => {
            const card = this.findCardByData(
                cardData.formation,
                cardData.category,
                cardData.questionText,
            );
            if (card) {
                const answerDiv = card.querySelector(".answer");
                answerDiv.classList.add("visible");
                card.classList.add("revealed");
                this.appState.revealedCards.add(card);
            }
        });
    }

    findCardByData(formation, category, questionText) {
        const cards = document.querySelectorAll(".card");
        return Array.from(cards).find((card) => {
            return (
                card.dataset.formation === formation &&
                card.dataset.category === category &&
                card.querySelector(".question-text").textContent ===
                    questionText
            );
        });
    }

    resetRevealedCards() {
        this.appState.revealedCards.clear();
        this.storageService.remove(STORAGE_KEY);
    }

    unrevealeCard(card) {
        const answerDiv = card.querySelector(".answer");

        // Masquer la réponse
        answerDiv.classList.remove("visible");
        card.classList.remove("revealed");

        // Retirer de la liste des cartes révélées
        this.appState.revealedCards.delete(card);
        this.saveRevealedCards();

        // Mettre à jour les stats
        if (window.app && window.app.uiService) {
            window.app.uiService.updateStats();
        }
    }
}

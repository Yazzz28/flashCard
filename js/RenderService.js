import { ANIMATION_DELAY } from "./constants.js";

export class RenderService {
    constructor(appState, cardService, uiService, filterService) {
        this.appState = appState;
        this.cardService = cardService;
        this.uiService = uiService;
        this.filterService = filterService;
    }

    renderCards() {
        const container = document.getElementById("cardsContainer");
        if (!container) return;

        this.uiService.showLoadingState(container);

        setTimeout(() => {
            this.uiService.clearContainer(container);
            this.appState.questionCounter = 1;

            if (
                !this.appState.questionsData ||
                Object.keys(this.appState.questionsData).length === 0
            ) {
                this.uiService.showErrorState(container);
                return;
            }

            this.renderFilteredCards(container);
            this.filterService.generateCategoryButtons((category) =>
                this.filterByCategory(category),
            );
            this.cardService.loadRevealedCards();
            this.uiService.updateStats();
        }, ANIMATION_DELAY);
    }

    renderFilteredCards(container) {
        Object.entries(this.appState.questionsData).forEach(
            ([formation, categories]) => {
                if (this.shouldIncludeFormation(formation)) {
                    this.renderFormationCards(container, formation, categories);
                }
            },
        );
    }

    shouldIncludeFormation(formation) {
        return (
            this.appState.currentFormation === "all" ||
            this.appState.currentFormation === formation
        );
    }

    renderFormationCards(container, formation, categories) {
        Object.entries(categories).forEach(([category, questions]) => {
            if (this.shouldIncludeCategory(category)) {
                this.renderCategoryCards(
                    container,
                    formation,
                    category,
                    questions,
                );
            }
        });
    }

    shouldIncludeCategory(category) {
        return (
            this.appState.currentCategory === "all" ||
            this.appState.currentCategory === category
        );
    }

    renderCategoryCards(container, formation, category, questions) {
        questions.forEach((item) => {
            const question = item.question || `Question de ${category}`;
            const answer = item.answer || "Réponse non disponible";
            const card = this.cardService.create(
                question,
                answer,
                formation,
                category,
            );
            container.appendChild(card);
        });
    }

    filterByCategory(category) {
        this.appState.setCategory(category);
        this.uiService.updateActiveButton(
            ".category-btn",
            `[data-category="${category}"]`,
        );
        this.renderCards();
    }

    filterByFormation(formation) {
        this.appState.setFormation(formation);
        this.uiService.updateActiveButton(
            ".formation-btn",
            `[data-formation="${formation}"]`,
        );
        this.renderCards();
    }
}

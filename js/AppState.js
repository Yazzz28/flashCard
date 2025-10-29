export class AppState {
    constructor() {
        this.questionsData = {};
        this.currentFormation = "all";
        this.currentCategory = "all";
        this.revealedCards = new Set();
        this.questionCounter = 1;
    }

    reset() {
        this.revealedCards.clear();
        this.questionCounter = 1;
    }

    setFormation(formation) {
        this.currentFormation = formation;
        this.currentCategory = "all";
    }

    setCategory(category) {
        this.currentCategory = category;
    }
}

import { AppState } from "./AppState.js";
import { StorageService } from "./StorageService.js";
import { DataService } from "./DataService.js";
import { ModalService } from "./ModalService.js";
import { CardService } from "./CardService.js";
import { UIService } from "./UIService.js";
import { FilterService } from "./FilterService.js";
import { RenderService } from "./RenderService.js";

export class WildCardsApp {
    constructor() {
        this.appState = new AppState();
        this.storageService = StorageService;
        this.dataService = DataService;
        this.modalService = new ModalService();
        this.cardService = new CardService(this.appState, this.storageService);
        this.uiService = new UIService(this.appState);
        this.filterService = new FilterService(this.appState);
        this.renderService = new RenderService(
            this.appState,
            this.cardService,
            this.uiService,
            this.filterService,
        );
    }

    async initialize() {
        try {
            this.appState.questionsData =
                await this.dataService.loadQuestionsData();
            this.renderService.renderCards();
            this.initializeEventListeners();
        } catch (error) {
            this.uiService.showErrorState(
                container,
                "Erreur lors du chargement des données",
            );
            console.error("Erreur d'initialisation:", error);
        }
    }

    initializeEventListeners() {
        this.initializeFormationButtons();
        this.initializeSearchBox();
        this.initializeResetButton();
        this.initializeFabButton();
        this.initializeRandomButton();
        this.initializeExportButton();
        this.initializeImportButton();
        this.initializeThemeToggle();
        this.initializeCardScrolling();
    }

    initializeFormationButtons() {
        document.querySelectorAll(".formation-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                this.renderService.filterByFormation(btn.dataset.formation);
            });
        });
    }

    initializeSearchBox() {
        const searchBox = document.getElementById("searchBox");
        searchBox?.addEventListener("input", (e) => {
            this.filterService.searchCards(e.target.value);
        });
    }

    initializeResetButton() {
        const resetBtn = document.getElementById("resetBtn");
        resetBtn?.addEventListener("click", () => {
            this.resetRevealedCards();
        });
    }

    initializeFabButton() {
        const fab = document.getElementById("fab");
        fab?.addEventListener("click", () => {
            this.revealAllVisible();
        });
    }

    initializeRandomButton() {
        const randomBtn = document.getElementById("randomBtn");
        randomBtn?.addEventListener("click", () => {
            this.drawRandomCard();
        });
    }

    initializeExportButton() {
        const exportBtn = document.getElementById("exportBtn");
        exportBtn?.addEventListener("click", () => {
            this.storageService.exportProgress();
        });
    }

    initializeImportButton() {
        const importBtn = document.getElementById("importBtn");
        const importFile = document.getElementById("importFile");

        importBtn?.addEventListener("click", () => {
            importFile?.click();
        });

        importFile?.addEventListener("change", async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            try {
                await this.storageService.importProgress(file);
                alert("Progression importée avec succès !");
                window.location.reload();
            } catch (error) {
                console.error("Erreur lors de l'import:", error);
                alert("Erreur : fichier JSON invalide");
            }
        });
    }

    initializeThemeToggle() {
        const themeToggle = document.querySelector(".theme-toggle");
        themeToggle?.addEventListener("click", () => {
            this.toggleTheme();
        });
    }

    initializeCardScrolling() {
        document.addEventListener("click", (e) => {
            if (
                e.target.classList.contains("card") ||
                e.target.closest(".card")
            ) {
                setTimeout(() => {
                    const card = e.target.closest(".card");
                    if (card?.classList.contains("revealed")) {
                        card.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                        });
                    }
                }, 100);
            }
        });
    }

    resetRevealedCards() {
        this.modalService.show(
            "Êtes-vous sûr de vouloir réinitialiser toutes les cartes révélées ?",
            (confirmed) => {
                if (confirmed) {
                    this.cardService.resetRevealedCards();
                    this.renderService.renderCards();
                }
            },
        );
    }

    revealAllVisible() {
        const visibleCards = document.querySelectorAll(
            ".card:not(.u-hidden):not(.revealed)",
        );
        if (visibleCards.length === 0) return;

        this.modalService.show(
            `Révéler toutes les ${visibleCards.length} cartes visibles ?`,
            (confirmed) => {
                if (confirmed) {
                    visibleCards.forEach((card) => {
                        setTimeout(() => {
                            this.cardService.reveal(card);
                            this.uiService.updateStats();
                        }, Math.random() * 1000);
                    });
                }
            },
        );
    }

    toggleTheme() {
        const currentTheme =
            document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", newTheme);
        document.body.style.transition =
            "background-color 0.3s ease, color 0.3s ease";

        setTimeout(() => {
            document.body.style.transition = "";
        }, 300);
    }

    drawRandomCard() {
        const visibleCards = document.querySelectorAll(".card:not(.hidden)");
        if (visibleCards.length === 0) {
            this.modalService.show("Aucune carte disponible pour le tirage au sort.", () => {});
            return;
        }

        const randomIndex = Math.floor(Math.random() * visibleCards.length);
        const randomCard = visibleCards[randomIndex];

        const questionText = randomCard.querySelector(".question-text").textContent;
        const answerText = randomCard.querySelector(".answer").textContent;

        this.showRandomCardModal(questionText, answerText, randomCard);
    }

    showRandomCardModal(question, answer, originalCard) {
        const modalOverlay = document.getElementById("modalOverlay");
        const modalTitle = document.getElementById("modalTitle");
        const modalSubtitle = document.getElementById("modalSubtitle");
        const modalMessage = document.getElementById("modalMessage");
        const modalActions = document.getElementById("modalActions");
        const modalIcon = document.getElementById("modalIcon");

        if (!modalOverlay) return;

        modalIcon.textContent = "🎲";
        modalTitle.textContent = "Carte tirée au sort";
        modalSubtitle.textContent = "Essayez de répondre avant de révéler la réponse";
        modalMessage.innerHTML = `<div class="random-card-question"><strong>Question :</strong><br>${question}</div>`;

        modalActions.innerHTML = `
            <button class="modal-btn modal-btn-secondary" onclick="closeModal()">
                Fermer
            </button>
            <button class="modal-btn modal-btn-primary" id="revealAnswerBtn">
                Révéler la réponse
            </button>
        `;

        modalOverlay.classList.add("show");

        const revealBtn = document.getElementById("revealAnswerBtn");
        revealBtn?.addEventListener("click", () => {
            modalMessage.innerHTML = `
                <div class="random-card-question"><strong>Question :</strong><br>${question}</div>
                <div class="random-card-answer"><strong>Réponse :</strong><br>${answer}</div>
            `;
            revealBtn.textContent = "Marquer comme révélée";
            revealBtn.onclick = () => {
                this.cardService.reveal(originalCard);
                this.uiService.updateStats();
                originalCard.scrollIntoView({ behavior: "smooth", block: "center" });
                this.modalService.close();
            };
        });
    }
}

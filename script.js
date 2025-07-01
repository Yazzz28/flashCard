let questionsData = {};
let currentFormation = "all";
let currentCategory = "all";
let revealedCards = new Set();
let questionCounter = 1;
let confirmCallback = null;

function showModal(message, onConfirm) {
    const modalOverlay = document.getElementById("modalOverlay");
    const modalMessage = document.getElementById("modalMessage");

    modalMessage.textContent = message;
    modalOverlay.classList.add("show");
    confirmCallback = onConfirm;
}

function closeModal() {
    const modalOverlay = document.getElementById("modalOverlay");
    modalOverlay.classList.remove("show");
    if (confirmCallback) {
        confirmCallback(false);
    }
}

function confirmModal() {
    const modalOverlay = document.getElementById("modalOverlay");
    modalOverlay.classList.remove("show");
    if (confirmCallback) {
        confirmCallback(true);
    }
}

async function loadQuestionsData() {
    try {
        const response = await fetch("data.json");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        questionsData = await response.json();
        return true;
    } catch (error) {
        questionsData = {
            frontend: [
                {
                    question: "Erreur de chargement",
                    answer: "Une erreur s'est produite lors du chargement des données.",
                },
            ],
        };
        return false;
    }
}

function saveRevealedCards() {
    try {
        // Convertir le Set en array pour la sérialisation
        const revealedCardIds = Array.from(revealedCards).map(card => {
            return {
                formation: card.dataset.formation,
                category: card.dataset.category,
                questionText: card.querySelector('.question-text').textContent
            };
        });
        
        sessionStorage.setItem('revealedCards', JSON.stringify(revealedCardIds));
        console.log(`Saved ${revealedCardIds.length} revealed cards to session`);
    } catch (error) {
        console.error('Error saving revealed cards:', error);
    }
}

function loadRevealedCards() {
    try {
        const savedCards = sessionStorage.getItem('revealedCards');
        if (!savedCards) {
            console.log('No revealed cards found in session');
            return;
        }

        const revealedCardIds = JSON.parse(savedCards);
        console.log(`Loading ${revealedCardIds.length} revealed cards from session`);

        // Restaurer les cartes révélées
        revealedCardIds.forEach(cardData => {
            const card = findCardByData(cardData.formation, cardData.category, cardData.questionText);
            if (card) {
                const answerDiv = card.querySelector('.answer');
                answerDiv.classList.add('visible');
                card.classList.add('revealed');
                revealedCards.add(card);
            }
        });

        updateStats();
    } catch (error) {
        console.error('Error loading revealed cards:', error);
    }
}

function findCardByData(formation, category, questionText) {
    const cards = document.querySelectorAll('.card');
    return Array.from(cards).find(card => {
        return card.dataset.formation === formation &&
               card.dataset.category === category &&
               card.querySelector('.question-text').textContent === questionText;
    });
}

function revealCard(card) {
    const answerDiv = card.querySelector(".answer");
    if (!answerDiv.classList.contains("visible")) {
        answerDiv.classList.add("visible");
        card.classList.add("revealed");
        revealedCards.add(card);
        updateStats();
        saveRevealedCards();
    }
}

function resetRevealedCards() {
    showModal(
        "Êtes-vous sûr de vouloir réinitialiser toutes les cartes révélées ?",
        (confirmed) => {
            if (confirmed) {
                revealedCards.clear();
                // Nettoyer le sessionStorage
                sessionStorage.removeItem('revealedCards');
                console.log('Cleared revealed cards from session');
                renderCards();
            }
        },
    );
}

function createCard(question, answer, formation, category) {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.formation = formation;
    card.dataset.category = category;

    card.innerHTML = `
        <div class="question">
            <div class="question-icon">Q${questionCounter++}</div>
            <div class="question-text">${question}</div>
        </div>
        <div class="answer">${answer}</div>
        <div class="reveal-hint">
            <span class="click-icon">👆</span>
            Cliquez pour révéler la réponse
        </div>
    `;

    card.addEventListener("click", () => revealCard(card));
    return card;
}

function renderCards() {
    const container = document.getElementById("cardsContainer");
    container.innerHTML =
        '<div class="loading"><div class="spinner"></div></div>';

    setTimeout(() => {
        container.innerHTML = "";
        questionCounter = 1;

        if (!questionsData || Object.keys(questionsData).length === 0) {
            container.innerHTML =
                '<div class="error-message">❌ Aucune donnée disponible. Vérifiez le fichier data.json</div>';
            return;
        }

        // Parcourir les formations (CDA, DWWM)
        Object.entries(questionsData).forEach(([formation, categories]) => {
            if (currentFormation === "all" || currentFormation === formation) {
                // Parcourir les catégories de chaque formation
                Object.entries(categories).forEach(([category, questions]) => {
                    if (
                        currentCategory === "all" ||
                        currentCategory === category
                    ) {
                        questions.forEach((item) => {
                            // Gérer les cas où question peut être manquante
                            const question =
                                item.question || `Question de ${category}`;
                            const answer =
                                item.answer || "Réponse non disponible";

                            const card = createCard(
                                question,
                                answer,
                                formation,
                                category,
                            );
                            container.appendChild(card);
                        });
                    }
                });
            }
        });

        // Générer dynamiquement les boutons de catégories selon la formation sélectionnée
        generateCategoryButtons();
        loadRevealedCards();
        updateStats();
    }, 500);
}

function updateStats() {
    const totalCards = document.querySelectorAll(".card").length;
    const revealedCount = document.querySelectorAll(".card.revealed").length;
    const percentage = totalCards > 0 ? (revealedCount / totalCards) * 100 : 0;

    document.getElementById("totalCount").textContent = totalCards;
    document.getElementById("revealedCount").textContent = revealedCount;
    document.getElementById("progressFill").style.width = `${percentage}%`;
}

function filterByCategory(category) {
    currentCategory = category;

    document.querySelectorAll(".category-btn").forEach((btn) => {
        btn.classList.remove("active");
    });
    document
        .querySelector(`[data-category="${category}"]`)
        .classList.add("active");

    renderCards();
}

function filterByFormation(formation) {
    currentFormation = formation;
    currentCategory = "all"; // Reset category when changing formation

    // Mettre à jour les boutons de formation
    document.querySelectorAll(".formation-btn").forEach((btn) => {
        btn.classList.remove("active");
    });
    document
        .querySelector(`[data-formation="${formation}"]`)
        .classList.add("active");

    renderCards();
}

function searchCards(searchTerm) {
    const cards = document.querySelectorAll(".card");
    const term = searchTerm.toLowerCase();

    cards.forEach((card) => {
        const question = card
            .querySelector(".question .question-text")
            .textContent.toLowerCase();
        const answer = card.querySelector(".answer").textContent.toLowerCase();

        if (question.includes(term) || answer.includes(term)) {
            card.classList.remove("hidden");
        } else {
            card.classList.add("hidden");
        }
    });
}

function revealAllVisible() {
    const visibleCards = document.querySelectorAll(
        ".card:not(.hidden):not(.revealed)",
    );
    if (visibleCards.length === 0) return;

    showModal(
        `Révéler toutes les ${visibleCards.length} cartes visibles ?`,
        (confirmed) => {
            if (confirmed) {
                visibleCards.forEach((card) => {
                    setTimeout(() => revealCard(card), Math.random() * 1000);
                });
            }
        },
    );
}

function generateCategoryButtons() {
    const categoriesContainer = document.querySelector(".categories");
    if (!categoriesContainer) return;

    // Obtenir les catégories disponibles pour la formation actuelle
    let availableCategories = new Set();

    if (currentFormation === "all") {
        // Si toutes les formations sont sélectionnées, afficher toutes les catégories
        Object.values(questionsData).forEach((formation) => {
            Object.keys(formation).forEach((category) => {
                availableCategories.add(category);
            });
        });
    } else {
        // Sinon, afficher seulement les catégories de la formation sélectionnée
        if (questionsData[currentFormation]) {
            Object.keys(questionsData[currentFormation]).forEach((category) => {
                availableCategories.add(category);
            });
        }
    }

    // Générer les boutons de catégories
    const categoryButtons = [
        { key: "all", icon: "📚", label: "Toutes" },
        { key: "frontend", icon: "🖥️", label: "Frontend" },
        { key: "backend", icon: "⚙️", label: "Backend" },
        { key: "database", icon: "🗄️", label: "Base de données" },
        { key: "devops", icon: "🚀", label: "DevOps" },
        { key: "architecture", icon: "🏗️", label: "Architecture" },
        { key: "tests", icon: "🧪", label: "Tests" },
        { key: "security", icon: "🔒", label: "Sécurité" },
        { key: "design", icon: "🎨", label: "Conception" },
        { key: "project", icon: "📋", label: "Gestion de projet" },
        { key: "tools", icon: "🛠️", label: "Outils" },
        { key: "fullstack", icon: "🔄", label: "Fullstack" },
        { key: "modern_practices", icon: "✨", label: "Pratiques modernes" },
    ];

    categoriesContainer.innerHTML = "";

    categoryButtons.forEach(({ key, icon, label }) => {
        if (key === "all" || availableCategories.has(key)) {
            const button = document.createElement("button");
            button.className = `category-btn ${
                currentCategory === key ? "active" : ""
            }`;
            button.dataset.category = key;
            button.innerHTML = `<span>${icon}</span> ${label}`;

            button.addEventListener("click", () => {
                filterByCategory(key);
            });

            categoriesContainer.appendChild(button);
        }
    });
}

async function initializeApp() {
    await loadQuestionsData();
    renderCards();
}

document.addEventListener("DOMContentLoaded", async () => {
    await initializeApp();

    // Event listeners pour les boutons de formation
    document.querySelectorAll(".formation-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            filterByFormation(btn.dataset.formation);
        });
    });

    // Les event listeners pour les catégories seront ajoutés dynamiquement dans generateCategoryButtons()

    const searchBox = document.getElementById("searchBox");
    if (searchBox) {
        searchBox.addEventListener("input", (e) => {
            searchCards(e.target.value);
        });
    }

    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn) {
        resetBtn.addEventListener("click", resetRevealedCards);
    }

    const fab = document.getElementById("fab");
    if (fab) {
        fab.addEventListener("click", revealAllVisible);
    }

    const themeToggle = document.querySelector(".theme-toggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const currentTheme =
                document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";

            document.documentElement.setAttribute("data-theme", newTheme);

            document.body.style.transition =
                "background-color 0.3s ease, color 0.3s ease";
            setTimeout(() => {
                document.body.style.transition = "";
            }, 300);
        });
    }
});

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("card") || e.target.closest(".card")) {
        setTimeout(() => {
            if (e.target.closest(".card").classList.contains("revealed")) {
                e.target.closest(".card").scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }, 100);
    }
});

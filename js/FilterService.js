export class FilterService {
    constructor(appState) {
        this.appState = appState;
        this.categoryButtons = [
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
            {
                key: "modern_practices",
                icon: "✨",
                label: "Pratiques modernes",
            },
        ];
    }

    getAvailableCategories() {
        const availableCategories = new Set();

        if (this.appState.currentFormation === "all") {
            Object.values(this.appState.questionsData).forEach((formation) => {
                Object.keys(formation).forEach((category) => {
                    availableCategories.add(category);
                });
            });
        } else if (
            this.appState.questionsData[this.appState.currentFormation]
        ) {
            Object.keys(
                this.appState.questionsData[this.appState.currentFormation],
            ).forEach((category) => {
                availableCategories.add(category);
            });
        }

        return availableCategories;
    }

    generateCategoryButtons(onCategoryClick) {
        const categoriesContainer = document.querySelector(".categories");
        if (!categoriesContainer) return;

        const availableCategories = this.getAvailableCategories();
        categoriesContainer.innerHTML = "";

        this.categoryButtons.forEach(({ key, icon, label }) => {
            if (key === "all" || availableCategories.has(key)) {
                const button = document.createElement("button");
                button.className = `category-btn ${
                    this.appState.currentCategory === key ? "active" : ""
                }`;
                button.dataset.category = key;
                button.innerHTML = `<span>${icon}</span> ${label}`;
                button.addEventListener("click", () => onCategoryClick(key));
                categoriesContainer.appendChild(button);
            }
        });
    }

    searchCards(searchTerm) {
        const cards = document.querySelectorAll(".card");
        const term = searchTerm.toLowerCase();

        cards.forEach((card) => {
            const question =
                card
                    .querySelector(".question .question-text")
                    ?.textContent.toLowerCase() || "";
            const answer =
                card.querySelector(".answer")?.textContent.toLowerCase() || "";

            if (question.includes(term) || answer.includes(term)) {
                card.classList.remove("hidden");
            } else {
                card.classList.add("hidden");
            }
        });
    }
}

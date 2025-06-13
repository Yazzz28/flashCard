// Variable globale pour stocker les données
let questionsData = {};
let currentCategory = 'all';
let revealedCards = new Set();
let questionCounter = 1;

// Fonction pour charger les données depuis data.json
async function loadQuestionsData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        questionsData = await response.json();
        console.log('Données chargées avec succès:', Object.keys(questionsData));
        return true;
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        questionsData = {
            "frontend": [
                {
                    "question": "Erreur de chargement - Vérifiez que data.json est présent",
                    "answer": "Assurez-vous que le fichier data.json est dans le même dossier que votre HTML et que le serveur web est configuré correctement."
                }
            ]
        };
        return false;
    }
}

// Fonction pour sauvegarder les cartes révélées
function saveRevealedCards() {
    const revealedData = [];
    revealedCards.forEach(card => {
        const question = card.querySelector('.question .question-text').textContent;
        const category = card.dataset.category;
        revealedData.push({ question, category });
    });
    localStorage.setItem('revealedCards', JSON.stringify(revealedData));
}

// Fonction pour charger les cartes révélées
function loadRevealedCards() {
    const savedData = localStorage.getItem('revealedCards');
    if (savedData) {
        const revealedData = JSON.parse(savedData);
        
        setTimeout(() => {
            revealedData.forEach(savedCard => {
                const cards = document.querySelectorAll('.card');
                cards.forEach(card => {
                    const question = card.querySelector('.question .question-text').textContent;
                    const category = card.dataset.category;
                    
                    if (question === savedCard.question && category === savedCard.category) {
                        revealCard(card);
                    }
                });
            });
            updateStats();
        }, 100);
    }
}

// Fonction pour révéler une carte
function revealCard(card) {
    const answerDiv = card.querySelector('.answer');
    if (!answerDiv.classList.contains('visible')) {
        answerDiv.classList.add('visible');
        card.classList.add('revealed');
        revealedCards.add(card);
        updateStats();
        saveRevealedCards();
    }
}

// Fonction pour réinitialiser
function resetRevealedCards() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les cartes révélées ?')) {
        localStorage.removeItem('revealedCards');
        revealedCards.clear();
        renderCards();
    }
}

// Créer une carte
function createCard(question, answer, category) {
    const card = document.createElement('div');
    card.className = 'card';
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

    card.addEventListener('click', () => revealCard(card));
    return card;
}

// Rendu des cartes
function renderCards() {
    const container = document.getElementById('cardsContainer');
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    setTimeout(() => {
        container.innerHTML = '';
        questionCounter = 1;
        
        // Vérifier si les données sont chargées
        if (!questionsData || Object.keys(questionsData).length === 0) {
            container.innerHTML = '<div class="error-message">❌ Aucune donnée disponible. Vérifiez le fichier data.json</div>';
            return;
        }
        
        Object.entries(questionsData).forEach(([category, questions]) => {
            if (currentCategory === 'all' || currentCategory === category) {
                questions.forEach(({question, answer}) => {
                    const card = createCard(question, answer, category);
                    container.appendChild(card);
                });
            }
        });

        loadRevealedCards();
        updateStats();
    }, 500);
}

// Mise à jour des statistiques
function updateStats() {
    const totalCards = document.querySelectorAll('.card').length;
    const revealedCount = document.querySelectorAll('.card.revealed').length;
    const percentage = totalCards > 0 ? (revealedCount / totalCards) * 100 : 0;
    
    document.getElementById('totalCount').textContent = totalCards;
    document.getElementById('revealedCount').textContent = revealedCount;
    document.getElementById('progressFill').style.width = `${percentage}%`;
}

// Filtrage par catégorie
function filterByCategory(category) {
    currentCategory = category;
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    renderCards();
}

// Recherche
function searchCards(searchTerm) {
    const cards = document.querySelectorAll('.card');
    const term = searchTerm.toLowerCase();

    cards.forEach(card => {
        const question = card.querySelector('.question .question-text').textContent.toLowerCase();
        const answer = card.querySelector('.answer').textContent.toLowerCase();
        
        if (question.includes(term) || answer.includes(term)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// Révéler toutes les cartes visibles
function revealAllVisible() {
    const visibleCards = document.querySelectorAll('.card:not(.hidden):not(.revealed)');
    if (visibleCards.length === 0) return;
    
    if (confirm(`Révéler toutes les ${visibleCards.length} cartes visibles ?`)) {
        visibleCards.forEach(card => {
            setTimeout(() => revealCard(card), Math.random() * 1000);
        });
    }
}

// Fonction d'initialisation principale
async function initializeApp() {
    console.log('🚀 Initialisation de StudyCards...');
    
    // Charger les données
    const dataLoaded = await loadQuestionsData();
    
    if (dataLoaded) {
        console.log('✅ Données chargées, rendu des cartes...');
        renderCards();
    } else {
        console.log('❌ Erreur de chargement, affichage du message d\'erreur...');
        renderCards(); // Affichera le message d'erreur
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Initialiser l'application
    await initializeApp();
    
    // Boutons de catégorie
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filterByCategory(btn.dataset.category);
        });
    });

    // Recherche
    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
        searchBox.addEventListener('input', (e) => {
            searchCards(e.target.value);
        });
    }

    // Bouton reset
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetRevealedCards);
    }

    // FAB - Révéler toutes
    const fab = document.getElementById('fab');
    if (fab) {
        fab.addEventListener('click', revealAllVisible);
    }

    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Animation de transition
            document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 300);
        });
    }
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('card') || e.target.closest('.card')) {
        setTimeout(() => {
            if (e.target.closest('.card').classList.contains('revealed')) {
                e.target.closest('.card').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }, 100);
    }
});
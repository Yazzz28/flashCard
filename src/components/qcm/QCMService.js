export class QCMService {
    constructor(appState, storageService) {
        this.appState = appState;
        this.storageService = storageService;
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.answeredQuestions = [];
        this.QCM_STORAGE_KEY = 'qcm_progress';
        this.qcmData = null; // Données QCM chargées depuis dataQCM.json
    }

    /**
     * Charge les données QCM depuis le fichier dataQCM.json
     */
    async loadQCMData() {
        if (!this.qcmData) {
            const DataService = (await import('../../services/DataService.js')).DataService;
            this.qcmData = await DataService.loadQCMData();
        }
        return this.qcmData;
    }

    /**
     * Génère un quiz avec un nombre défini de questions
     * @param {number} numberOfQuestions - Nombre de questions à générer
     * @returns {Array} - Tableau de questions QCM
     */
    async generateQuiz(numberOfQuestions = 10) {
        // Charger les données QCM
        await this.loadQCMData();

        const allQuestions = this.getAllFilteredQCMQuestions();

        if (allQuestions.length === 0) {
            throw new Error('Aucune question QCM disponible pour les filtres sélectionnés');
        }

        // Mélanger et sélectionner les questions
        const shuffled = this.shuffleArray([...allQuestions]);
        const selectedQuestions = shuffled.slice(0, Math.min(numberOfQuestions, allQuestions.length));

        // Créer le quiz avec les données QCM
        this.currentQuiz = selectedQuestions.map((q, index) => {
            // Mélanger les options pour chaque question
            const shuffledOptions = this.shuffleArray([...q.options]);

            // Retrouver les nouveaux index des bonnes réponses après mélange
            const newCorrectIndexes = q.correctAnswers.map(oldIndex =>
                shuffledOptions.indexOf(q.options[oldIndex])
            );

            return {
                id: index,
                question: q.question,
                correctAnswer: q.explanation,
                options: shuffledOptions,
                correctIndex: newCorrectIndexes[0], // Prendre la première bonne réponse
                correctIndexes: newCorrectIndexes, // Garder toutes les bonnes réponses
                formation: q.formation,
                category: q.category,
                userAnswer: null,
                isCorrect: null
            };
        });

        this.currentQuestionIndex = 0;
        this.score = 0;
        this.answeredQuestions = [];

        return this.currentQuiz;
    }

    /**
     * Récupère toutes les questions QCM filtrées selon la formation et catégorie actuelles
     */
    getAllFilteredQCMQuestions() {
        const questions = [];
        const { currentFormation, currentCategory } = this.appState;

        if (!this.qcmData) {
            return questions;
        }

        for (const [formation, categories] of Object.entries(this.qcmData)) {
            // Filtrer par formation
            if (currentFormation !== 'all' && formation !== currentFormation) {
                continue;
            }

            for (const [category, categoryQuestions] of Object.entries(categories)) {
                // Filtrer par catégorie
                if (currentCategory !== 'all' && category !== currentCategory) {
                    continue;
                }

                categoryQuestions.forEach(q => {
                    questions.push({
                        question: q.question,
                        options: q.options,
                        correctAnswers: q.correctAnswers,
                        explanation: q.explanation,
                        formation,
                        category
                    });
                });
            }
        }

        return questions;
    }

    /**
     * Mélange un tableau (Fisher-Yates shuffle)
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Vérifie la réponse de l'utilisateur
     */
    answerQuestion(questionId, selectedOptionIndex) {
        const question = this.currentQuiz.find(q => q.id === questionId);
        if (!question || question.userAnswer !== null) {
            return null; // Question déjà répondue
        }

        question.userAnswer = selectedOptionIndex;

        // Vérifier si la réponse est correcte (supporte les questions à plusieurs bonnes réponses)
        question.isCorrect = question.correctIndexes
            ? question.correctIndexes.includes(selectedOptionIndex)
            : selectedOptionIndex === question.correctIndex;

        if (question.isCorrect) {
            this.score++;
        }

        this.answeredQuestions.push(questionId);
        this.saveProgress();

        return {
            isCorrect: question.isCorrect,
            correctIndex: question.correctIndex,
            correctAnswer: question.correctAnswer
        };
    }

    /**
     * Passe à la question suivante
     */
    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.length - 1) {
            this.currentQuestionIndex++;
            return this.currentQuiz[this.currentQuestionIndex];
        }
        return null;
    }

    /**
     * Retourne à la question précédente
     */
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            return this.currentQuiz[this.currentQuestionIndex];
        }
        return null;
    }

    /**
     * Récupère la question actuelle
     */
    getCurrentQuestion() {
        return this.currentQuiz ? this.currentQuiz[this.currentQuestionIndex] : null;
    }

    /**
     * Vérifie si le quiz est terminé
     */
    isQuizComplete() {
        return this.answeredQuestions.length === this.currentQuiz?.length;
    }

    /**
     * Calcule les statistiques finales
     */
    getQuizStats() {
        if (!this.currentQuiz) return null;

        const total = this.currentQuiz.length;
        const correct = this.score;
        const percentage = Math.round((correct / total) * 100);

        return {
            total,
            correct,
            incorrect: total - correct,
            percentage,
            details: this.currentQuiz.map(q => ({
                question: q.question,
                userAnswer: q.options[q.userAnswer],
                correctAnswer: q.options[q.correctIndex],
                isCorrect: q.isCorrect
            }))
        };
    }

    /**
     * Sauvegarde la progression
     */
    saveProgress() {
        const progress = {
            currentQuiz: this.currentQuiz,
            currentQuestionIndex: this.currentQuestionIndex,
            score: this.score,
            answeredQuestions: this.answeredQuestions,
            timestamp: Date.now()
        };
        this.storageService.save(this.QCM_STORAGE_KEY, progress);
    }

    /**
     * Charge la progression sauvegardée
     */
    loadProgress() {
        const progress = this.storageService.load(this.QCM_STORAGE_KEY);
        if (progress) {
            this.currentQuiz = progress.currentQuiz;
            this.currentQuestionIndex = progress.currentQuestionIndex;
            this.score = progress.score;
            this.answeredQuestions = progress.answeredQuestions;
            return true;
        }
        return false;
    }

    /**
     * Réinitialise le quiz
     */
    resetQuiz() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.answeredQuestions = [];
        this.storageService.remove(this.QCM_STORAGE_KEY);
    }

    /**
     * Crée l'élément DOM pour une question QCM
     */
    createQuestionElement(questionData, onAnswerSelected) {
        const container = document.createElement('div');
        container.className = 'qcm-container';

        const isAnswered = questionData.userAnswer !== null;
        const questionNumber = questionData.id + 1;
        const totalQuestions = this.currentQuiz.length;

        container.innerHTML = `
            <div class="qcm-header">
                <div class="qcm-progress">
                    <span class="qcm-progress-text">Question ${questionNumber} / ${totalQuestions}</span>
                    <div class="qcm-progress-bar">
                        <div class="qcm-progress-fill" style="width: ${(questionNumber / totalQuestions) * 100}%"></div>
                    </div>
                </div>
                <div class="qcm-score">
                    Score: <span class="score-value">${this.score}</span> / ${this.answeredQuestions.length}
                </div>
            </div>

            <div class="qcm-card">
                <div class="qcm-meta">
                    <span class="formation-badge">${questionData.formation}</span>
                    <span class="category-badge">${questionData.category}</span>
                </div>

                <div class="qcm-question">
                    <div class="question-icon">Q${questionNumber}</div>
                    <h3 class="question-text">${questionData.question}</h3>
                </div>

                <div class="qcm-options">
                    ${questionData.options.map((option, index) => {
                        let optionClass = 'qcm-option';
                        let disabled = '';

                        if (isAnswered) {
                            disabled = 'disabled';
                            if (index === questionData.correctIndex) {
                                optionClass += ' correct';
                            } else if (index === questionData.userAnswer) {
                                optionClass += ' incorrect';
                            } else {
                                optionClass += ' disabled';
                            }
                        }

                        return `
                            <button
                                class="${optionClass}"
                                data-option-index="${index}"
                                ${disabled}
                            >
                                <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                                <span class="option-text">${option}</span>
                                ${isAnswered && index === questionData.correctIndex ? '<span class="option-icon">✓</span>' : ''}
                                ${isAnswered && index === questionData.userAnswer && !questionData.isCorrect ? '<span class="option-icon">✗</span>' : ''}
                            </button>
                        `;
                    }).join('')}
                </div>

                ${isAnswered ? `
                    <div class="qcm-explanation ${questionData.isCorrect ? 'correct' : 'incorrect'}">
                        <div class="explanation-header">
                            ${questionData.isCorrect ?
                                '<span class="explanation-icon">🎉</span><strong>Bonne réponse !</strong>' :
                                '<span class="explanation-icon">❌</span><strong>Réponse incorrecte</strong>'
                            }
                        </div>
                        <div class="explanation-content">
                            <strong>Explication :</strong>
                            <p>${questionData.correctAnswer}</p>
                        </div>
                    </div>
                ` : ''}
            </div>

            <div class="qcm-navigation">
                <button class="btn-secondary qcm-nav-btn" id="qcm-prev" ${this.currentQuestionIndex === 0 ? 'disabled' : ''}>
                    ← Précédent
                </button>
                <button class="btn-primary qcm-nav-btn" id="qcm-next" ${!isAnswered ? 'disabled' : ''}>
                    ${this.currentQuestionIndex === totalQuestions - 1 ? 'Voir les résultats' : 'Suivant →'}
                </button>
            </div>
        `;

        // Ajouter les écouteurs d'événements pour les options
        if (!isAnswered) {
            const options = container.querySelectorAll('.qcm-option');
            options.forEach(option => {
                option.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.dataset.optionIndex);
                    onAnswerSelected(questionData.id, index);
                });
            });
        }

        return container;
    }

    /**
     * Crée l'élément DOM pour les résultats finaux
     */
    createResultsElement(onRestart, onBackToCards) {
        const stats = this.getQuizStats();
        const container = document.createElement('div');
        container.className = 'qcm-results';

        const getGrade = (percentage) => {
            if (percentage >= 90) return { text: 'Excellent !', emoji: '🌟', class: 'excellent' };
            if (percentage >= 70) return { text: 'Très bien !', emoji: '🎉', class: 'good' };
            if (percentage >= 50) return { text: 'Bien !', emoji: '👍', class: 'ok' };
            return { text: 'Continuez à vous entraîner', emoji: '💪', class: 'retry' };
        };

        const grade = getGrade(stats.percentage);

        container.innerHTML = `
            <div class="results-card">
                <div class="results-header ${grade.class}">
                    <span class="results-emoji">${grade.emoji}</span>
                    <h2>${grade.text}</h2>
                    <div class="results-score">
                        <span class="big-score">${stats.percentage}%</span>
                        <span class="score-details">${stats.correct} / ${stats.total} bonnes réponses</span>
                    </div>
                </div>

                <div class="results-stats">
                    <div class="stat-item-qcm correct">
                        <span class="stat-icon-qcm">✓</span>
                        <span class="stat-value-qcm">${stats.correct}</span>
                        <span class="stat-label-qcm">Correctes</span>
                    </div>
                    <div class="stat-item-qcm incorrect">
                        <span class="stat-icon-qcm">✗</span>
                        <span class="stat-value-qcm">${stats.incorrect}</span>
                        <span class="stat-label-qcm">Incorrectes</span>
                    </div>
                    <div class="stat-item-qcm total">
                        <span class="stat-icon-qcm">📊</span>
                        <span class="stat-value-qcm">${stats.total}</span>
                        <span class="stat-label-qcm">Total</span>
                    </div>
                </div>

                <div class="results-details">
                    <h3>Détails des réponses</h3>
                    <div class="results-list">
                        ${stats.details.map((detail, index) => `
                            <div class="result-item ${detail.isCorrect ? 'correct' : 'incorrect'}">
                                <div class="result-question">
                                    <span class="result-icon">${detail.isCorrect ? '✓' : '✗'}</span>
                                    <strong>Q${index + 1}:</strong> ${detail.question}
                                </div>
                                ${!detail.isCorrect ? `
                                    <div class="result-answers">
                                        <div class="user-answer">Votre réponse: ${detail.userAnswer}</div>
                                        <div class="correct-answer">Bonne réponse: ${detail.correctAnswer.substring(0, 100)}...</div>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="results-actions">
                    <button class="btn-secondary" id="back-to-cards">
                        ← Retour aux FlashCards
                    </button>
                    <button class="btn-primary" id="restart-quiz">
                        🔄 Nouveau QCM
                    </button>
                </div>
            </div>
        `;

        container.querySelector('#restart-quiz').addEventListener('click', onRestart);
        container.querySelector('#back-to-cards').addEventListener('click', onBackToCards);

        return container;
    }
}

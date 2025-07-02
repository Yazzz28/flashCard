import sampleData from '../fixtures/sample-data.json';

export const createMockDOM = () => {
    document.body.innerHTML = `
        <div class="container">
            <div id="cardsContainer"></div>
            <div class="formations">
                <button class="formation-btn active" data-formation="all">Toutes</button>
                <button class="formation-btn" data-formation="CDA">CDA</button>
                <button class="formation-btn" data-formation="DWWM">DWWM</button>
            </div>
            <div class="categories"></div>
            <input type="text" id="searchBox" />
            <button id="resetBtn">Reset</button>
            <button id="fab">Reveal All</button>
            <div class="stats">
                <span id="totalCount">0</span>
                <span id="revealedCount">0</span>
                <div id="progressFill"></div>
            </div>
            <div id="modalOverlay">
                <div id="modalMessage"></div>
                <button onclick="confirmModal()">Confirmer</button>
                <button onclick="closeModal()">Annuler</button>
            </div>
            <button class="theme-toggle">🌙</button>
        </div>
    `;
};

export const mockFetchSuccess = (data = sampleData) => {
    global.fetch.mockResolvedValue({
        ok: true,
        json: async () => data
    });
};

export const mockFetchError = (error = new Error('Network error')) => {
    global.fetch.mockRejectedValue(error);
};

export const mockFetchHTTPError = (status = 404) => {
    global.fetch.mockResolvedValue({
        ok: false,
        status
    });
};

export const waitForCards = async (container, timeout = 5000) => {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        if (container.children.length > 0) {
            return container.children;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error('Cards did not load within timeout');
};

export const createTestCard = (question = 'Test Question', answer = 'Test Answer') => {
    const card = document.createElement('div');
    card.className = 'card flashcard';
    card.dataset.formation = 'CDA';
    card.dataset.category = 'frontend';

    card.innerHTML = `
        <div class="question">
            <div class="question-icon">Q1</div>
            <div class="question-text">${question}</div>
        </div>
        <div class="answer">${answer}</div>
        <div class="reveal-hint">
            <span class="click-icon">👆</span>
            Cliquez pour révéler la réponse
        </div>
    `;

    return card;
};

export const simulateCardClick = (card) => {
    const clickEvent = new Event('click', {
        bubbles: true,
        cancelable: true
    });
    card.dispatchEvent(clickEvent);
};

export const getVisibleCards = (container) => {
    return Array.from(container.querySelectorAll('.card:not(.u-hidden)'));
};

export const getRevealedCards = (container) => {
    return Array.from(container.querySelectorAll('.card.revealed'));
};

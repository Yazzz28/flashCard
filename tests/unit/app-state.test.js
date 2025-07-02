import { AppState, DataService } from '../../src/script.js';
import sampleData from '../fixtures/sample-data.json';

// Mock fetch pour DataService
global.fetch = jest.fn();

describe('AppState', () => {
    let appState;

    beforeEach(() => {
        appState = new AppState();
    });

    describe('constructor', () => {
        it('should initialize with default values', () => {
            expect(appState.questionsData).toEqual({});
            expect(appState.currentFormation).toBe('all');
            expect(appState.currentCategory).toBe('all');
            expect(appState.revealedCards).toBeInstanceOf(Set);
            expect(appState.revealedCards.size).toBe(0);
            expect(appState.questionCounter).toBe(1);
        });
    });

    describe('reset', () => {
        it('should reset revealed cards and question counter', () => {
            appState.revealedCards.add('test');
            appState.questionCounter = 5;

            appState.reset();

            expect(appState.revealedCards.size).toBe(0);
            expect(appState.questionCounter).toBe(1);
        });
    });

    describe('setFormation', () => {
        it('should set formation and reset category', () => {
            appState.currentCategory = 'frontend';

            appState.setFormation('CDA');

            expect(appState.currentFormation).toBe('CDA');
            expect(appState.currentCategory).toBe('all');
        });
    });

    describe('setCategory', () => {
        it('should set category', () => {
            appState.setCategory('backend');

            expect(appState.currentCategory).toBe('backend');
        });
    });
});

describe('DataService', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    describe('loadQuestionsData', () => {
        it('should load questions data successfully', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => sampleData
            });

            const data = await DataService.loadQuestionsData();

            expect(fetch).toHaveBeenCalledWith('../assets/data/data.json');
            expect(data).toEqual(sampleData);
        });

        it('should handle fetch errors', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            const data = await DataService.loadQuestionsData();

            expect(data).toHaveProperty('CDA');
            expect(data.CDA.frontend[0].question).toBe('Erreur de chargement');
        });

        it('should handle HTTP errors', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            const data = await DataService.loadQuestionsData();

            expect(data).toHaveProperty('CDA');
            expect(data.CDA.frontend[0].question).toBe('Erreur de chargement');
        });

        it('should handle JSON parsing errors', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => {
                    throw new Error('Invalid JSON');
                }
            });

            const data = await DataService.loadQuestionsData();

            expect(data).toHaveProperty('CDA');
            expect(data.CDA.frontend[0].question).toBe('Erreur de chargement');
        });
    });
});

export class DataService {
    static async loadQuestionsData() {
        try {
            const response = await fetch("data.json");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Erreur lors du chargement des données:", error);
            return {
                CDA: {
                    frontend: [
                        {
                            question: "Erreur de chargement",
                            answer: "Une erreur s'est produite lors du chargement des données.",
                        },
                    ],
                },
            };
        }
    }

    static async loadQCMData() {
        try {
            const response = await fetch("dataQCM.json");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Erreur lors du chargement des données QCM:", error);
            return {
                CDA: {
                    frontend: [
                        {
                            question: "Erreur de chargement",
                            options: ["Erreur", "Erreur", "Erreur", "Erreur"],
                            correctAnswers: [0],
                            explanation: "Une erreur s'est produite lors du chargement des données QCM.",
                        },
                    ],
                },
            };
        }
    }
}

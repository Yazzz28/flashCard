import { STORAGE_KEY } from "./constants.js";

export class StorageService {
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn("Erreur lors de la sauvegarde:", error);
            return false;
        }
    }

    static load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn("Erreur lors du chargement:", error);
            return null;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn("Erreur lors de la suppression:", error);
            return false;
        }
    }

    static exportProgress() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) {
                alert("Aucune progression à exporter");
                return;
            }

            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `flashcards-progress-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert("Progression exportée avec succès !");
        } catch (error) {
            console.error("Erreur lors de l'export:", error);
            alert("Erreur lors de l'export de la progression");
        }
    }

    static importProgress(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
            location.reload();
        });
    }
}

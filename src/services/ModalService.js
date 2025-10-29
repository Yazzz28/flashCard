export class ModalService {
    constructor() {
        this.confirmCallback = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        window.closeModal = () => this.close();
        window.confirmModal = () => this.confirm();
    }

    show(message, onConfirm) {
        const modalOverlay = document.getElementById("modalOverlay");
        const modalMessage = document.getElementById("modalMessage");
        const modalTitle = document.getElementById("modalTitle");
        const modalSubtitle = document.getElementById("modalSubtitle");
        const modalActions = document.getElementById("modalActions");
        const modalIcon = document.getElementById("modalIcon");

        if (!modalOverlay || !modalMessage) {
            return;
        }

        // Réinitialiser la modal au format par défaut
        modalIcon.textContent = "❓";
        modalTitle.textContent = "Confirmation";
        modalSubtitle.textContent = "Veuillez confirmer votre action";
        modalMessage.textContent = message;
        modalActions.innerHTML = `
            <button class="modal-btn modal-btn-secondary" onclick="closeModal()">
                Annuler
            </button>
            <button class="modal-btn modal-btn-primary" onclick="confirmModal()">
                Confirmer
            </button>
        `;

        modalOverlay.classList.add("show");
        this.confirmCallback = onConfirm;
    }

    close() {
        const modalOverlay = document.getElementById("modalOverlay");
        modalOverlay?.classList.remove("show");

        if (this.confirmCallback) {
            this.confirmCallback(false);
            this.confirmCallback = null;
        }
    }

    confirm() {
        const modalOverlay = document.getElementById("modalOverlay");
        modalOverlay?.classList.remove("show");

        if (this.confirmCallback) {
            this.confirmCallback(true);
            this.confirmCallback = null;
        }
    }
}

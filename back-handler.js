/* back-handler.js
 * Controle do botão VOLTAR
 * Home → modal de saída
 * Outras telas → navegação normal
 */

(function () {
    let isShowingExitModal = false;

    let config = {
        homeScreen: 'home',
        exitMessage: 'Deseja sair do aplicativo?',
        onExit: defaultExit
    };

    function defaultExit() {
        try {
            location.href = 'about:blank';
        } catch (e) {
            history.go(-1);
        }
    }

    function createExitModal() {
        if (document.getElementById('bh-exit-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'bh-exit-modal';
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.45);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        `;

        modal.innerHTML = `
            <div style="
                background: #fff;
                padding: 20px;
                border-radius: 14px;
                width: 80%;
                max-width: 300px;
                text-align: center;
                font-size: 16px;
            ">
                <p style="margin-bottom: 20px;">${config.exitMessage}</p>
                <button id="bh-cancel" style="
                    padding: 10px 20px;
                    margin-right: 10px;
                    border: none;
                    border-radius: 8px;
                    background: #ccc;
                ">Cancelar</button>
                <button id="bh-ok" style="
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    background: #e53935;
                    color: #fff;
                ">OK</button>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('bh-cancel').onclick = () => {
            modal.style.display = 'none';
            isShowingExitModal = false;
            history.pushState({ screen: config.homeScreen }, '', '');
        };

        document.getElementById('bh-ok').onclick = () => {
            modal.style.display = 'none';
            isShowingExitModal = false;
            config.onExit();
        };
    }

    function showExitModal() {
        createExitModal();
        const modal = document.getElementById('bh-exit-modal');
        modal.style.display = 'flex';
        isShowingExitModal = true;
    }

    window.BackHandler = {
        configure(options = {}) {
            config = { ...config, ...options };
        },

        onBack(currentScreen) {
            if (currentScreen === config.homeScreen) {
                if (!isShowingExitModal) {
                    showExitModal();
                }
                return true;
            }
            return false;
        }
    };
})();

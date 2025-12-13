/* back-handler.js
 * Controle do botão VOLTAR
 * - Telas internas: deixa o app tratar
 * - Home: abre modal de saída
 */

(function () {

    let modalOpen = false;

    const config = {
        homeScreen: 'home',
        exitMessage: 'Deseja sair do aplicativo?'
    };

    function exitApp() {
        const isPWA =
            window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true;
    
        if (isPWA) {
            // PWA instalado → fecha/minimiza como app nativo
            try {
                window.close();
            } catch (e) {}
            return;
        }
    
        // Navegador → sai do app sem tela branca
        location.replace(document.referrer || '/');
    }

    function createModal() {
        if (document.getElementById('bh-exit-modal')) return;

        const overlay = document.createElement('div');
        overlay.id = 'bh-exit-modal';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.45);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        `;

        overlay.innerHTML = `
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

                <button id="bh-cancel"
                    style="
                        padding: 10px 20px;
                        border: none;
                        border-radius: 8px;
                        background: #ccc;
                        margin-right: 10px;
                    ">
                    Cancelar
                </button>

                <button id="bh-ok"
                    style="
                        padding: 10px 20px;
                        border: none;
                        border-radius: 8px;
                        background: #e53935;
                        color: #fff;
                    ">
                    OK
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        // CANCELAR → apenas fecha o modal
        document.getElementById('bh-cancel').onclick = () => {
            overlay.style.display = 'none';
            modalOpen = false;
        };

        // OK → sai imediatamente
        document.getElementById('bh-ok').onclick = () => {
            exitApp();
        };
    }

    function openModal() {
        if (modalOpen) return;

        createModal();
        const modal = document.getElementById('bh-exit-modal');
        modal.style.display = 'flex';
        modalOpen = true;
    }

    // API pública
    window.BackHandler = {

        onBack(currentScreen) {
            if (currentScreen === config.homeScreen) {
                openModal();
                return true; // evento tratado
            }

            return false; // deixa o app tratar
        }
    };

})();

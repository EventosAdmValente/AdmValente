/* back-handler.js
 * Aviso na home: "pressione mais uma vez para sair"
 */

(function () {

    const HOME = 'home';
    let warned = false;

    function showWarning() {
        if (document.getElementById('bh-warning')) return;

        const overlay = document.createElement('div');
        overlay.id = 'bh-warning';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.45);
            display: flex;
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
                <p style="margin-bottom: 20px;">
                    Pressione mais uma vez para sair
                </p>
                <button id="bh-ok"
                    style="
                        padding: 10px 24px;
                        border: none;
                        border-radius: 8px;
                        background: #1976d2;
                        color: #fff;
                        font-size: 15px;
                    ">
                    OK
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('bh-ok').onclick = () => {
            overlay.remove();
        };
    }

    window.BackHandler = {

        onBack(currentScreen) {

            // Se NÃO for home → zera aviso e deixa navegar
            if (currentScreen !== HOME) {
                warned = false;
                return false;
            }

            // Primeiro back na home → mostra aviso
            if (!warned) {
                warned = true;
                showWarning();
                return true; // intercepta
            }

            // Segundo back → deixa o sistema sair
            return false;
        }
    };

})();

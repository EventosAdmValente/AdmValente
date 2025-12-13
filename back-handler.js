/* back-handler.js
 * Comportamento simples:
 * - Telas internas: volta normalmente
 * - Home: próximo back sai do app
 */

(function () {

    const HOME = 'home';

    window.BackHandler = {

        onBack(currentScreen) {
            // Se NÃO estiver na home, deixa o app tratar
            if (currentScreen !== HOME) {
                return false;
            }

            // Se estiver na home, NÃO intercepta
            // O próximo back será tratado pelo navegador/sistema
            return false;
        }

    };

})();

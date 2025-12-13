/* back-handler.js
 * Back totalmente neutro
 * Não interfere em nada
 */

(function () {
    window.BackHandler = {
        onBack() {
            return false; // nunca intercepta
        }
    };
})();

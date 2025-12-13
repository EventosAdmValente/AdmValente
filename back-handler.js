/* back-handler.js
 * Não interfere no histórico
 * Apenas existe para compatibilidade futura
 */
(function () {
    window.BackHandler = {
        onBack() {
            return false; // nunca intercepta
        }
    };
})();

// back-handler.js
(function () {

  // Cria a pilha inicial de histórico
  window.addEventListener("load", () => {
    history.replaceState({ screen: "root" }, "", "");
    history.pushState({ screen: "home" }, "", "");
  });

  function abrirModalSair() {
    const html = `
      <div id="exit-modal-content"
           style="
             background:#fff;
             border-radius:12px;
             padding:24px;
             max-width:320px;
             width:90%;
             box-shadow:0 10px 30px rgba(0,0,0,.25);
           ">
        <p style="font-size:18px;font-weight:600;margin-bottom:24px;text-align:center">
          Deseja sair do aplicativo?
        </p>
        <div style="display:flex;gap:12px">
          <button id="exit-cancel"
                  style="flex:1;padding:12px;border-radius:8px;border:none;background:#eee;font-weight:600">
            Cancelar
          </button>
          <button id="exit-confirm"
                  style="flex:1;padding:12px;border-radius:8px;border:none;background:#0a3cff;color:#fff;font-weight:600">
            OK
          </button>
        </div>
      </div>
    `;

    window.showModal(html);

    document.getElementById("exit-cancel").onclick = () => {
      window.closeModal();
      history.pushState({ screen: "home" }, "", "");
    };

    document.getElementById("exit-confirm").onclick = () => {
      // libera o histórico para o sistema fechar o app
      history.back();
    };
  }

  window.addEventListener("popstate", (event) => {

    // Se estiver na HOME → perguntar se deseja sair
    if (window.state?.currentScreen === "home") {
      abrirModalSair();
      return;
    }

    // Se estiver em outra tela → voltar para home
    if (window.internalNavigateTo) {
      window.internalNavigateTo("home");
      history.pushState({ screen: "home" }, "", "");
    }
  });

})();

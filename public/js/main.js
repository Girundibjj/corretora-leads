document.addEventListener("DOMContentLoaded", () => {
    configurarFormulario();
});

function configurarFormulario() {
    const form = document.getElementById("leadForm");
    const inputWhatsapp = document.getElementById("whatsapp");

    if (!form) return;

    // Aplica a máscara visual em tempo real para facilidade de leitura do cliente
    inputWhatsapp.addEventListener("input", (e) => {
        let valor = e.target.value.replace(/\D/g, "");
        if (valor.length > 11) valor = valor.slice(0, 11);

        if (valor.length > 6) {
            e.target.value = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7)}`;
        } else if (valor.length > 2) {
            e.target.value = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
        } else if (valor.length > 0) {
            e.target.value = `(${valor}`;
        }
    });

    form.addEventListener("submit", (e) => {
        const nome = document.getElementById("nome").value.trim();
        const whatsappLimpo = inputWhatsapp.value.replace(/\D/g, "");

        if (nome.includes("<") || nome.includes(">")) {
            e.preventDefault();
            alert("Caracteres inválidos no campo Nome!");
            return;
        }

        if (whatsappLimpo.length < 10 || whatsappLimpo.length > 11) {
            e.preventDefault();
            alert("Por favor, insira um número de WhatsApp válido com DDD.");
            return;
        }
        
        // Força a substituição do valor do input pelo número puramente limpo antes de disparar o POST
        inputWhatsapp.value = whatsappLimpo;
    });
}

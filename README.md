# 🏢 CRM Imobiliário & Business Intelligence - Ariela Rodrigues

Este projeto é um sistema completo de captação de clientes e CRM avançado com painel analítico (BI), desenvolvido especificamente para automatizar e centralizar o gerenciamento de leads imobiliários de **Ariela Rodrigues** nas regiões de Uberlândia e Belo Horizonte.

---

## 💡 Contexto e Processo de Desenvolvimento

Este software nasceu de uma necessidade real de mercado: fornecer uma ferramenta robusta e centralizada para que minha esposa gerencie seus clientes, acompanhe o funil de vendas/locações e analise o faturamento periódico de forma estratégica.

Como estudante de **Análise e Desenvolvimento de Sistemas (ADS)**, utilizei este projeto prático para consolidar meus conhecimentos em arquitetura backend, persistência relacional e manipulação dinâmica do DOM, aplicando conceitos reais de engenharia de software para entregar um produto funcional e seguro.

---

## 🛠️ Tecnologias e Conceitos Aplicados

### 💻 Frontend (Interface do Usuário)
*   **HTML5 Semântico & CSS3 Mobile-First**: Layout responsivo com paleta de cores premium baseada na identidade visual da corretora.
*   **Mecanismo Analítico Nativo (BI)**: Renderização de gráficos estatísticos e faturamentos periódicos de forma dinâmica via JavaScript e CSS puro, garantindo independência de redes externas e execução 100% offline.
*   **Motores de Exportação Client-Side**: Exportação de listagens completas para formatos de planilha Excel (.csv) por injeção de blobs e relatórios em PDF via rotas nativas de impressão.

### ⚙️ Backend (Servidor e Lógica de Negócio)
*   **Node.js & Express**: Roteamento baseado em arquitetura API Restful estruturada com os métodos semanticamente corretos (`GET`, `POST`, `PUT`, `DELETE`).
*   **Express-Session**: Segurança e controle de estado em backend, restringindo rotas administrativas e o painel de CRM exclusivamente para a usuária autenticada.
*   **Sanitização de Strings**: Tratamento de dados telefônicos em tempo de execução para blindar o redirecionamento dinâmico de conversas para a API oficial do WhatsApp.

### 💾 Banco de Dados (Persistência)
*   **PostgreSQL**: Modelagem relacional e persistência robusta, utilizando criptografia hash via `bcryptjs` para proteção e integridade dos dados de autenticação administrativa.

---

## 📈 Recursos e Fluxos do Sistema

1.  **Landing Page Pública**: Formulário otimizado para o cliente registrar interesse informando segmentação (Uberlândia/BH), tipo de serviço (Compra/Venda/Locação) e perfil do imóvel (Pronto/Lançamento).
2.  **Módulo de Login**: Autenticação restrita e segura com comparação de hash criptográfico para acesso ao painel de controle.
3.  **Dashboard CRM**: Sistema CRUD completo que permite à corretora cadastrar leads manuais de captação externa (Instagram, telefone, indicações), editar cadastros base, registrar anotações de ligações e deletar registros.
4.  **Termômetro de Leads**: Subdivisão comercial e classificação de clientes por temperatura (Quente 🔥, Morno ⚡, Frio ❄️) integrado aos indicadores e metas financeiras de comissões.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
Para rodar e testar o ecossistema na sua máquina, você precisará ter instalado:
*   [Node.js](https://nodejs.org) (Ambiente de execução do servidor backend)
*   [Visual Studio Code](https://visualstudio.com) (Editor de código recomendado para desenvolvimento)
*   [Git](https://git-scm.com) (Para clonagem e versionamento do repositório)

### Passo a Passo
1. Abra o terminal do seu computador ou o terminal do VS Code.
2. Clone este repositório para sua máquina local:
   ```bash
   git clone https://github.com
   ```
3. Acesse a pasta do projeto:
   ```bash
   cd corretora-leads
   ```
4. Instale as dependências do ecossistema:
   ```bash
   npm install
   ```
5. Configure as variáveis de ambiente criando um arquivo `.env` na raiz do projeto com base no arquivo `.env.example`.
6. Inicie o servidor web:
   ```bash
   npm start
   ```
7. Acesse as seguintes rotas no seu navegador de internet:
   *   **Site Público (Landing Page)**: `http://localhost:3000`
   *   **Painel Administrativo (Login)**: `http://localhost:3000/admin/login.html`

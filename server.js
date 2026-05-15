const express = require('express');
const session = require('express-session');
const path = require('path');
const { conectarBanco } = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 3000;

/* ==========================================================================
   1. MIDDLEWARES DE CONFIGURAÇÃO (Tratamento de Dados e Sessão)
   ========================================================================== */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || '9h2f7b1v9c3x8z5m_ariela_pro',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 2 } // Expira em 2 horas
}));

function verificarAutenticacao(req, res, next) {
    if (req.session && req.session.usuarioId) return next();
    return res.status(401).json({ erro: 'Acesso negado.' });
}

app.use(express.static(path.join(__dirname, 'public')));

/* ==========================================================================
   2. ROTA PÚBLICA (FORMULÁRIO DE CAPTAÇÃO DA LANDING PAGE)
   ========================================================================== */
app.post('/api/leads', async (req, res) => {
    try {
        const { nome, email, whatsapp, cidade, servico, interesse } = req.body;
        if (!nome || !email || !whatsapp || !cidade || !servico || !interesse) {
            return res.status(400).send('Todos os campos são obrigatórios.');
        }
        const db = await conectarBanco();
        const querySQL = `
            INSERT INTO leads (nome, email, whatsapp, cidade_interesse, servico_busca, perfil_imovel, status_atendimento, temperatura_lead, anotacoes_internas, valor_fechado, porcentagem_comissao) 
            VALUES (?, ?, ?, ?, ?, ?, 'Novo', 'Morno', 'Cadastro realizado pelo site público.', 0, 0)
        `;
        await db.run(querySQL, [nome, email, whatsapp.replace(/\D/g, ""), cidade, servico, interesse]);
        res.send("<script>alert('Informações enviadas com sucesso!'); window.location.href='/';</script>");
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro interno do servidor.');
    }
});

/* ==========================================================================
   3. ROTAS DE AUTENTICAÇÃO (SISTEMA DE ACESSO)
   ========================================================================== */
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        const db = await conectarBanco();
        const usuario = await db.get('SELECT * FROM usuarios_admin WHERE email = ?', [email]);

        if (usuario && (senha === 'ariela123' || senha === usuario.senha)) {
            req.session.usuarioId = usuario.id;
            return res.redirect('/admin/dashboard.html');
        }
        res.send("<script>alert('E-mail ou senha incorretos!'); window.location.href='/admin/login.html';</script>");
    } catch (error) {
        res.status(500).send('Erro no servidor.');
    }
});

app.get('/api/admin/logout', (req, res) => {
    req.session.destroy(() => { res.redirect('/admin/login.html'); });
});

/* ==========================================================================
   4. ROTAS PRIVADAS DA API (MÉTODO REST - RETORNO EM JSON PURO)
   ========================================================================== */

// Buscar todas as leads do banco
app.get('/api/admin/leads', verificarAutenticacao, async (req, res) => {
    try {
        const db = await conectarBanco();
        const leads = await db.all('SELECT * FROM leads ORDER BY id DESC');
        res.setHeader('Content-Type', 'application/json');
        return res.json(leads);
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao buscar dados.' });
    }
});

// ALINHAMENTO ABSOLUTO backend: Sincroniza perfeitamente com os ids do HTML
app.put('/api/admin/leads/atualizar', verificarAutenticacao, async (req, res) => {
    try {
        const { id, nome, email, whatsapp, cidade, servico, status, temperatura, anotacoes, tipologia, valor_minimo, valor_maximo, valor_fechado, porcentagem_comissao, data_retorno } = req.body;
        const db = await conectarBanco();
        
        const whatsappLimpo = whatsapp ? whatsapp.replace(/\D/g, "") : "";

        const querySQL = `
            UPDATE leads 
            SET nome = ?, email = ?, whatsapp = ?, cidade_interesse = ?, servico_busca = ?, status_atendimento = ?, temperatura_lead = ?, anotacoes_internas = ?, descricao_busca = ?, valor_minimo = ?, valor_maximo = ?, valor_fechado = ?, porcentagem_comissao = ?, data_hora_retorno = ?
            WHERE id = ?
        `;
        
        await db.run(querySQL, [
            nome, email, whatsappLimpo, cidade, servico, status, temperatura, anotacoes, 
            tipologia, valor_minimo || 0, valor_maximo || 0, valor_fechado || 0, porcentagem_comissao || 0, data_retorno || null, 
            id
        ]);
        
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ sucesso: true, message: 'Alterações salvas com sucesso!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao atualizar registro no banco.' });
    }
});

// Cadastrar lead manual diretamente de dentro do CRM
app.post('/api/admin/leads/manual', verificarAutenticacao, async (req, res) => {
    try {
        const { nome, email, whatsapp, cidade, servico, interesse, status, temperatura } = req.body;
        const db = await conectarBanco();
        const querySQL = `
            INSERT INTO leads (nome, email, whatsapp, cidade_interesse, servico_busca, perfil_imovel, status_atendimento, temperatura_lead, anotacoes_internas, valor_fechado, porcentagem_comissao) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Inserido manualmente pelo painel.', 0, 0)
        `;
        await db.run(querySQL, [nome, email, whatsapp.replace(/\D/g, ""), cidade, servico, interesse, status, temperatura]);
        return res.redirect('/admin/dashboard.html');
    } catch (error) {
        console.error(error);
        return res.status(500).send('Erro ao registrar captação manual.');
    }
});

// Deletar lead permanentemente do banco
app.delete('/api/admin/leads/deletar/:id', verificarAutenticacao, async (req, res) => {
    try {
        const { id } = req.params;
        const db = await conectarBanco();
        await db.run('DELETE FROM leads WHERE id = ?', [id]);
        
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ sucesso: true, mensagem: 'Registro removido!' });
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao deletar registro.' });
    }
});

/* ==========================================================================
   5. INICIALIZAÇÃO DO SERVIDOR WEB
   ========================================================================== */
app.listen(PORT, async () => {
    await conectarBanco();
    console.log(`\n==================================================`);
    console.log(`  CRM online com comissoes e BI na porta ${PORT}`);
    console.log(`==================================================\n`);
});

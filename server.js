// Ativa o leitor de variáveis de ambiente locais do arquivo .env
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs'); // Biblioteca de descriptografia
const { conectarBanco, query } = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || '9h2f7b1v9c3x8z5m_ariela_pro',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 2 }
}));

function verificarAutenticacao(req, res, next) {
    if (req.session && req.session.usuarioId) return next();
    return res.status(401).json({ erro: 'Acesso negado.' });
}

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/leads', async (req, res) => {
    try {
        const { nome, email, whatsapp, cidade, servico, interesse } = req.body;
        if (!nome || !email || !whatsapp || !cidade || !servico || !interesse) {
            return res.status(400).send('Todos os campos são obrigatórios.');
        }
        const querySQL = `
            INSERT INTO leads (nome, email, whatsapp, cidade_interesse, servico_busca, perfil_imovel, status_atendimento, temperatura_lead, anotacoes_internas, valor_fechado, porcentagem_comissao) 
            VALUES ($1, $2, $3, $4, $5, $6, 'Novo', 'Morno', 'Cadastro realizado pelo site público.', 0, 0)
        `;
        const pool = conectarBanco();
        await pool.query(querySQL, [nome, email, whatsapp.replace(/\D/g, ""), cidade, servico, interesse]);
        res.send("<script>alert('Informações enviadas com sucesso!'); window.location.href='/';</script>");
    } catch (error) { console.error(error); res.status(500).send('Erro.'); }
});

/* ==========================================================================
   ROTAS DE AUTENTICAÇÃO COM COMPARAÇÃO DE HASH CRIPTOGRÁFICO
   ========================================================================== */
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        const pool = conectarBanco();
        
        // Busca o usuário no banco pelo e-mail fornecido
        const resultado = await pool.query('SELECT * FROM usuarios_admin WHERE email = $1', [email]);
        const usuario = resultado.rows[0];

        // Se o usuário existir, compara a senha digitada com a criptografia do banco
        if (usuario) {
            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (senhaValida) {
                req.session.usuarioId = usuario.id;
                return res.redirect('/admin/dashboard.html');
            }
        }
        res.send("<script>alert('E-mail ou senha incorretos!'); window.location.href='/admin/login.html';</script>");
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro no servidor.');
    }
});

app.get('/api/admin/logout', (req, res) => {
    req.session.destroy(() => { res.redirect('/admin/login.html'); });
});

app.get('/api/admin/leads', verificarAutenticacao, async (req, res) => {
    try {
        const db = await query('SELECT * FROM leads ORDER BY id DESC');
        res.setHeader('Content-Type', 'application/json');
        return res.json(db.all());
    } catch (error) { return res.status(500).json({ erro: 'Erro.' }); }
});

app.put('/api/admin/leads/atualizar', verificarAutenticacao, async (req, res) => {
    try {
        const { id, nome, email, whatsapp, cidade, servico, status, temperatura, anotacoes, tipologia, valor_minimo, valor_maximo, valor_fechado, porcentagem_comissao, data_retorno } = req.body;
        const whatsappLimpo = whatsapp ? whatsapp.replace(/\D/g, "") : "";
        const querySQL = `
            UPDATE leads 
            SET nome = $1, email = $2, whatsapp = $3, cidade_interesse = $4, servico_busca = $5, status_atendimento = $6, temperatura_lead = $7, anotacoes_internas = $8, tipologia_imovel = $9, valor_minimo = $10, valor_maximo = $11, valor_fechado = $12, porcentagem_comissao = $13, data_hora_retorno = $14
            WHERE id = $15
        `;
        const pool = conectarBanco();
        await pool.query(querySQL, [nome, email, whatsappLimpo, cidade, servico, status, temperatura, anotacoes, tipologia, valor_minimo || 0, valor_maximo || 0, valor_fechado || 0, porcentagem_comissao || 0, data_retorno || null, id]);
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ sucesso: true });
    } catch (error) { return res.status(500).json({ erro: 'Erro.' }); }
});

app.post('/api/admin/leads/manual', verificarAutenticacao, async (req, res) => {
    try {
        const { nome, email, whatsapp, cidade, servico, interesse, status, temperatura } = req.body;
        const querySQL = `
            INSERT INTO leads (nome, email, whatsapp, cidade_interesse, servico_busca, perfil_imovel, status_atendimento, temperatura_lead, anotacoes_internas, valor_fechado, porcentagem_comissao) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Inserido manualmente pelo painel.', 0, 0)
        `;
        const pool = conectarBanco();
        await pool.query(querySQL, [nome, email, whatsapp.replace(/\D/g, ""), cidade, servico, interesse, status, temperatura]);
        return res.redirect('/admin/dashboard.html');
    } catch (error) { return res.status(500).send('Erro.'); }
});

app.delete('/api/admin/leads/deletar/:id', verificarAutenticacao, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = conectarBanco();
        await pool.query('DELETE FROM leads WHERE id = $1', [id]);
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ sucesso: true });
    } catch (error) { return res.status(500).json({ erro: 'Erro.' }); }
});

app.listen(PORT, async () => {
    await conectarBanco();
    console.log(`\n==================================================\n  CRM online com comissoes e BI na porta ${PORT}\n==================================================\n`);
});

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

let poolInstance = null;

function conectarBanco() {
    if (poolInstance) return poolInstance;

    poolInstance = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    // Cria as tabelas iniciais
    poolInstance.query(`
        CREATE TABLE IF NOT EXISTS usuarios_admin (
            id SERIAL PRIMARY KEY,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS leads (
            id SERIAL PRIMARY KEY,
            nome TEXT NOT NULL,
            email TEXT NOT NULL,
            whatsapp TEXT NOT NULL,
            cidade_interesse TEXT NOT NULL,
            servico_busca TEXT NOT NULL,
            perfil_imovel TEXT NULL,
            status_atendimento TEXT DEFAULT 'Novo',
            temperatura_lead TEXT DEFAULT 'Morno',
            anotacoes_internas TEXT NULL,
            data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            tipologia_imovel TEXT NULL,
            valor_minimo NUMERIC DEFAULT 0,
            valor_maximo NUMERIC DEFAULT 0,
            valor_fechado NUMERIC DEFAULT 0,
            porcentagem_comissao NUMERIC DEFAULT 0,
            data_hora_retorno TEXT NULL
        );
    `).then(async () => {
        // SEGURANÇA AVANÇADA: Captura o e-mail e a senha secreta das variáveis privadas do servidor
        const emailAdmin = process.env.ADMIN_EMAIL || 'ariela@corretora.com';
        const senhaAdminBruta = process.env.ADMIN_PASS || 'ariela123';
        
        // Gera o Hash da senha (criptografia que impede a leitura direta no banco)
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senhaAdminBruta, salt);

        // Atualiza ou insere o login protegido usando parâmetros preparados ($1, $2)
        await poolInstance.query(`
            INSERT INTO usuarios_admin (nome, email, senha)
            VALUES ('Ariela Rodrigues', $1, $2)
            ON CONFLICT (email) DO UPDATE SET senha = $2;
        `, [emailAdmin, senhaCriptografada]);

        console.log('🐘 PostgreSQL sincronizado com criptografia de ponta!');
    }).catch(err => console.error('Erro de DDL no Postgres:', err));

    return poolInstance;
}

async function query(text, params) {
    const pool = conectarBanco();
    const res = await pool.query(text, params);
    return {
        all: () => res.rows,
        get: () => res.rows[0], // Retorna o primeiro registro limpo para validação
        run: () => res
    };
}

module.exports = { conectarBanco, query };

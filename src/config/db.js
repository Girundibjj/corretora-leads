const { Pool } = require('pg');

let poolInstance = null;

function conectarBanco() {
    if (poolInstance) return poolInstance;

    // Conecta com a URL estável do Supabase informada no painel do Render
    poolInstance = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Obrigatório para segurança em nuvem
    });

    // Criação automatizada das tabelas em padrão PostgreSQL
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

        INSERT INTO usuarios_admin (nome, email, senha)
        VALUES ('Ariela Rodrigues', 'ariela@corretora.com', '$2y$10$wM3O4yO3J.E3I6jN8/GfOeK6pQv8P3eH3qUv8Z2y1v5yY7u7m6t2y')
        ON CONFLICT (email) DO NOTHING;
    `).then(() => {
        console.log('🐘 Banco de dados PostgreSQL (Supabase) sincronizado com sucesso!');
    }).catch(err => console.error('Erro de DDL no Postgres:', err));

    return poolInstance;
}

// Função adaptadora que simula o comportamento de queries do SQLite anterior
async function query(text, params) {
    const pool = conectarBanco();
    const res = await pool.query(text, params);
    return {
        all: () => res.rows,
        get: () => res.rows,
        run: () => res
    };
}

// CORREÇÃO: Exporta as duas funções de forma explícita para o server.js ler sem dar Crash
module.exports = { conectarBanco, query };

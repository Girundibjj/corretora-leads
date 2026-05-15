const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let dbInstance = null;

async function conectarBanco() {
    if (dbInstance) return dbInstance;

    dbInstance = await open({
        filename: path.join(__dirname, '../../database/corretora.db'),
        driver: sqlite3.Database
    });

    console.log(' Conexão com o banco de dados (SQLite) estabelecida com sucesso!');

    // Estrutura Completa de Produção (ADS Architecture)
    await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS usuarios_admin (
            id INTEGER PRIMARY KEY,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY,
            nome TEXT NOT NULL,
            email TEXT NOT NULL,
            whatsapp TEXT NOT NULL,
            cidade_interesse TEXT NOT NULL,
            servico_busca TEXT NOT NULL,
            perfil_imovel TEXT NOT NULL,
            status_atendimento TEXT DEFAULT 'Novo',
            temperatura_lead TEXT DEFAULT 'Morno',
            anotacoes_internas TEXT NULL,
            data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
            
            -- NOVAS COLUNAS COMPORTAMENTAIS E FINANCEIRAS
            descricao_busca TEXT NULL,
            valor_minimo REAL DEFAULT 0,
            valor_maximo REAL DEFAULT 0,
            valor_fechado REAL DEFAULT 0
        );
    `);

    // Inserção automática da usuária Ariela Rodrigues caso o banco acabe de ser criado
    await dbInstance.exec(`
        INSERT OR IGNORE INTO usuarios_admin (id, nome, email, senha)
        VALUES (1, 'Ariela Rodrigues', 'ariela@corretora.com', '$2y$10$wM3O4yO3J.E3I6jN8/GfOeK6pQv8P3eH3qUv8Z2y1v5yY7u7m6t2y');
    `);

    return dbInstance;
}

module.exports = { conectarBanco };

CREATE DATABASE IF NOT EXISTS corretora_leads_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE corretora_leads_db;

-- 1. Tabela de Usuários para o Login Seguro no Dashboard
CREATE TABLE IF NOT EXISTS usuarios_admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL, -- Armazenará o hash da senha (segurança)
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabela de Leads Atualizada com Campos de Gestão (CRM)
CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    cidade_interesse ENUM('Uberlândia', 'Belo Horizonte') NOT NULL,
    servico_busca ENUM('comprar', 'vender', 'alugar_quer', 'alugar_proprietario') NOT NULL,
    perfil_imovel ENUM('lancamento', 'pronto') NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- NOVOS CAMPOS PARA O DASHBOARD (Acompanhamento da Ariela)
    status_atendimento ENUM('Novo', 'Em Atendimento', 'Proposta Enviada', 'Fechado', 'Sem Interesse') DEFAULT 'Novo',
    anotacoes_internas TEXT NULL, -- Para Ariela escrever o histórico do cliente
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_cidade (cidade_interesse),
    INDEX idx_status (status_atendimento),
    INDEX idx_data (data_cadastro)
) ENGINE=InnoDB;

-- Inserção de um usuário padrão para testes (Senha criptografada: 'ariela123')
-- Em produção, usamos password_hash() do PHP ou bcrypt do Node.js
INSERT INTO usuarios_admin (nome, email, senha) 
VALUES ('Ariela Rodrigues', 'ariela@corretora.com', '$2y$10$wM3O4yO3J.E3I6jN8/GfOeK6pQv8P3eH3qUv8Z2y1v5yY7u7m6t2y')
ON DUPLICATE KEY UPDATE id=id;

import { executeQuery } from '../config/database';

export interface Migration {
  id: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

// Tabela para controle de migrations
const createMigrationsTable = async (): Promise<void> => {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id VARCHAR(100) PRIMARY KEY,
      description TEXT NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await executeQuery(query);
};

// Migration 001: Criação das tabelas de usuários
const migration001: Migration = {
  id: '001_create_users_table',
  description: 'Criar tabela de usuários com níveis de acesso',
  up: async () => {
    const query = `
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(191) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'manager', 'operator') DEFAULT 'manager',
        manager_id INT NULL,
        phone VARCHAR(20) NULL,
        avatar VARCHAR(500) NULL,
        is_active BOOLEAN DEFAULT TRUE,
        email_verified_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_manager_id (manager_id),
        
        FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `;
    await executeQuery(query);
  },
  down: async () => {
    await executeQuery('DROP TABLE IF EXISTS users');
  }
};

// Migration 002: Criação das tabelas de instâncias WhatsApp
const migration002: Migration = {
  id: '002_create_whatsapp_instances',
  description: 'Criar tabelas para gerenciar instâncias do WhatsApp',
  up: async () => {
    const query = `
      CREATE TABLE whatsapp_instances (
        id INT AUTO_INCREMENT PRIMARY KEY,
        manager_id INT NOT NULL,
        instance_name VARCHAR(191) NOT NULL,
        phone_number VARCHAR(20) NULL,
        status ENUM('disconnected', 'connecting', 'connected', 'error') DEFAULT 'disconnected',
        qr_code TEXT NULL,
        session_data JSON NULL,
        webhook_url VARCHAR(191) NULL,
        is_active BOOLEAN DEFAULT TRUE,
        connected_at TIMESTAMP NULL,
        last_activity TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_manager_id (manager_id),
        INDEX idx_status (status),
        INDEX idx_phone_number (phone_number),
        
        FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    await executeQuery(query);
  },
  down: async () => {
    await executeQuery('DROP TABLE IF EXISTS whatsapp_instances');
  }
};

// Migration 003: Criação das tabelas de projetos de mensagens
const migration003: Migration = {
  id: '003_create_message_projects',
  description: 'Criar tabelas para projetos e mensagens automáticas',
  up: async () => {
    // Tabela de projetos
    const projectsQuery = `
      CREATE TABLE message_projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        manager_id INT NOT NULL,
        name VARCHAR(191) NOT NULL,
        description TEXT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_manager_id (manager_id),
        INDEX idx_is_active (is_active),
        INDEX idx_is_default (is_default),
        
        FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    await executeQuery(projectsQuery);

    // Tabela de mensagens automáticas
    const messagesQuery = `
      CREATE TABLE auto_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        trigger_words JSON NOT NULL,
        response_text TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        order_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_project_id (project_id),
        INDEX idx_is_active (is_active),
        INDEX idx_order_index (order_index),
        
        FOREIGN KEY (project_id) REFERENCES message_projects(id) ON DELETE CASCADE
      )
    `;
    await executeQuery(messagesQuery);
  },
  down: async () => {
    await executeQuery('DROP TABLE IF EXISTS auto_messages');
    await executeQuery('DROP TABLE IF EXISTS message_projects');
  }
};

// Migration 004: Criação das tabelas de contatos e conversas
const migration004: Migration = {
  id: '004_create_contacts_and_chats',
  description: 'Criar tabelas para contatos e conversas',
  up: async () => {
    // Tabela de contatos
    const contactsQuery = `
      CREATE TABLE contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        manager_id INT NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        name VARCHAR(191) NULL,
        avatar VARCHAR(191) NULL,
        tags JSON NULL,
        notes TEXT NULL,
        is_blocked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_manager_id (manager_id),
        INDEX idx_phone_number (phone_number),
        INDEX idx_name (name),
        
        FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_manager_phone (manager_id, phone_number)
      )
    `;
    await executeQuery(contactsQuery);

    // Tabela de conversas humanas
    const chatsQuery = `
      CREATE TABLE human_chats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        manager_id INT NOT NULL,
        contact_id INT NOT NULL,
        operator_id INT NULL,
        status ENUM('pending', 'active', 'waiting_payment', 'paid', 'finished', 'resolved') DEFAULT 'pending',
        transfer_reason TEXT NULL,
        tags JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_manager_id (manager_id),
        INDEX idx_contact_id (contact_id),
        INDEX idx_operator_id (operator_id),
        INDEX idx_status (status),
        
        FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `;
    await executeQuery(chatsQuery);
  },
  down: async () => {
    await executeQuery('DROP TABLE IF EXISTS human_chats');
    await executeQuery('DROP TABLE IF EXISTS contacts');
  }
};

// Migration 005: Criação da tabela de mensagens
const migration005: Migration = {
  id: '005_create_messages_table',
  description: 'Criar tabela para armazenar todas as mensagens',
  up: async () => {
    const query = `
      CREATE TABLE messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        manager_id INT NOT NULL,
        chat_id INT NULL,
        contact_id INT NOT NULL,
        whatsapp_message_id VARCHAR(191) NULL,
        sender_type ENUM('contact', 'bot', 'operator') NOT NULL,
        sender_id INT NULL,
        content TEXT NOT NULL,
        message_type ENUM('text', 'image', 'audio', 'video', 'document', 'location') DEFAULT 'text',
        media_url VARCHAR(191) NULL,
        is_read BOOLEAN DEFAULT FALSE,
        delivered_at TIMESTAMP NULL,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_manager_id (manager_id),
        INDEX idx_chat_id (chat_id),
        INDEX idx_contact_id (contact_id),
        INDEX idx_sender_type (sender_type),
        INDEX idx_sender_id (sender_id),
        INDEX idx_created_at (created_at),
        
        FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (chat_id) REFERENCES human_chats(id) ON DELETE SET NULL,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `;
    await executeQuery(query);
  },
  down: async () => {
    await executeQuery('DROP TABLE IF EXISTS messages');
  }
};

// Migration 006: Criação das tabelas de analytics e logs
const migration006: Migration = {
  id: '006_create_analytics_tables',
  description: 'Criar tabelas para analytics e logs do sistema',
  up: async () => {
    // Tabela de estatísticas diárias
    const statsQuery = `
      CREATE TABLE daily_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        manager_id INT NOT NULL,
        date DATE NOT NULL,
        messages_sent INT DEFAULT 0,
        messages_received INT DEFAULT 0,
        human_chats_created INT DEFAULT 0,
        human_chats_resolved INT DEFAULT 0,
        bot_interactions INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_manager_id (manager_id),
        INDEX idx_date (date),
        
        FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_manager_date (manager_id, date)
      )
    `;
    await executeQuery(statsQuery);

    // Tabela de logs do sistema
    const logsQuery = `
      CREATE TABLE system_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        manager_id INT NULL,
        user_id INT NULL,
        action VARCHAR(191) NOT NULL,
        description TEXT NULL,
        ip_address VARCHAR(45) NULL,
        user_agent TEXT NULL,
        metadata JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_manager_id (manager_id),
        INDEX idx_user_id (user_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at),
        
        FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `;
    await executeQuery(logsQuery);
  },
  down: async () => {
    await executeQuery('DROP TABLE IF EXISTS system_logs');
    await executeQuery('DROP TABLE IF EXISTS daily_stats');
  }
};

// Migration 007: Criação da tabela de dispositivos conectados
const migration007: Migration = {
  id: '007_create_devices_table',
  description: 'Criar tabela para gerenciar dispositivos conectados',
  up: async () => {
    const query = `
      CREATE TABLE devices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        manager_id INT NOT NULL,
        whatsapp_instance_id INT NULL,
        device_name VARCHAR(191) NOT NULL,
        device_type ENUM('smartphone', 'tablet', 'computer', 'other') DEFAULT 'smartphone',
        device_model VARCHAR(191) NULL,
        os_name VARCHAR(191) NULL,
        os_version VARCHAR(191) NULL,
        browser_name VARCHAR(191) NULL,
        browser_version VARCHAR(191) NULL,
        ip_address VARCHAR(45) NULL,
        user_agent TEXT NULL,
        screen_resolution VARCHAR(50) NULL,
        timezone VARCHAR(100) NULL,
        language VARCHAR(10) NULL,
        whatsapp_status ENUM('disconnected', 'connecting', 'connected', 'error') DEFAULT 'disconnected',
        whatsapp_phone VARCHAR(20) NULL,
        status ENUM('online', 'offline', 'idle', 'blocked') DEFAULT 'offline',
        is_trusted BOOLEAN DEFAULT FALSE,
        is_primary BOOLEAN DEFAULT FALSE,
        last_activity TIMESTAMP NULL,
        location_data JSON NULL,
        device_fingerprint VARCHAR(100) NULL,
        session_token VARCHAR(191) NULL,
        push_token VARCHAR(191) NULL,
        metadata JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_manager_id (manager_id),
        INDEX idx_whatsapp_instance_id (whatsapp_instance_id),
        INDEX idx_status (status),
        INDEX idx_whatsapp_status (whatsapp_status),
        INDEX idx_device_type (device_type),
        INDEX idx_last_activity (last_activity),
        INDEX idx_device_fingerprint (device_fingerprint),
        INDEX idx_session_token (session_token),
        
        FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (whatsapp_instance_id) REFERENCES whatsapp_instances(id) ON DELETE SET NULL,
        UNIQUE KEY unique_manager_fingerprint (manager_id, device_fingerprint)
      )
    `;
    await executeQuery(query);
  },
  down: async () => {
    await executeQuery('DROP TABLE IF EXISTS devices');
  }
};

// Migration 008: Atualizar tabela devices para integração com WhatsApp
const migration008: Migration = {
  id: '008_update_devices_whatsapp',
  description: 'Atualizar tabela devices para integração com WhatsApp',
  up: async () => {
    // Adicionar colunas para integração com WhatsApp
    const alterQueries = [
      'ALTER TABLE devices ADD COLUMN whatsapp_instance_id INT NULL AFTER manager_id',
      'ALTER TABLE devices ADD COLUMN whatsapp_status ENUM("disconnected", "connecting", "connected", "error") DEFAULT "disconnected" AFTER language',
      'ALTER TABLE devices ADD COLUMN whatsapp_phone VARCHAR(20) NULL AFTER whatsapp_status',
      'ALTER TABLE devices ADD INDEX idx_whatsapp_instance_id (whatsapp_instance_id)',
      'ALTER TABLE devices ADD INDEX idx_whatsapp_status (whatsapp_status)',
      'ALTER TABLE devices ADD FOREIGN KEY (whatsapp_instance_id) REFERENCES whatsapp_instances(id) ON DELETE SET NULL'
    ];
    
    for (const query of alterQueries) {
      try {
        await executeQuery(query);
      } catch (error: any) {
        // Ignorar erros se a coluna já existir
        if (!error.message.includes('Duplicate column name') && !error.message.includes('Duplicate key name')) {
          throw error;
        }
      }
    }
  },
  down: async () => {
    const dropQueries = [
      'ALTER TABLE devices DROP FOREIGN KEY devices_ibfk_2',
      'ALTER TABLE devices DROP INDEX idx_whatsapp_instance_id',
      'ALTER TABLE devices DROP INDEX idx_whatsapp_status', 
      'ALTER TABLE devices DROP COLUMN whatsapp_instance_id',
      'ALTER TABLE devices DROP COLUMN whatsapp_status',
      'ALTER TABLE devices DROP COLUMN whatsapp_phone'
    ];
    
    for (const query of dropQueries) {
      try {
        await executeQuery(query);
      } catch (error) {
        // Ignorar erros se não existir
        console.log('Ignorando erro na reversão:', error);
      }
    }
  }
};

// Migration 009: Adicionar campo assigned_to para controle de atribuição de conversas
const migration009: Migration = {
  id: '009_add_chat_assignment',
  description: 'Adicionar campo assigned_to para controle de atribuição de conversas',
  up: async () => {
    const alterQueries = [
      // Adicionar campo assigned_to que indica quem está atualmente atendendo
      'ALTER TABLE human_chats ADD COLUMN assigned_to INT NULL AFTER operator_id',
      
      // Criar índice para busca por assigned_to
      'ALTER TABLE human_chats ADD INDEX idx_assigned_to (assigned_to)',
      
      // Adicionar foreign key para assigned_to
      'ALTER TABLE human_chats ADD FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL'
    ];
    
    for (const query of alterQueries) {
      try {
        await executeQuery(query);
        console.log(`✅ Migration 009: ${query}`);
      } catch (error: any) {
        if (!error.message.includes('Duplicate column name') && 
            !error.message.includes('Duplicate key name') &&
            !error.message.includes('Duplicate foreign key')) {
          console.error(`❌ Migration 009 erro: ${error.message}`);
          throw error;
        } else {
          console.log(`⚠️ Migration 009: ${query} - já existe`);
        }
      }
    }
  },
  down: async () => {
    const queries = [
      'ALTER TABLE human_chats DROP FOREIGN KEY human_chats_ibfk_3',
      'ALTER TABLE human_chats DROP INDEX idx_assigned_to',
      'ALTER TABLE human_chats DROP COLUMN assigned_to'
    ];
    
    for (const query of queries) {
      try {
        await executeQuery(query);
      } catch (error: any) {
        console.log(`⚠️ Migration 009 down: ${error.message}`);
      }
    }
  }
};

// Migration 010: Adicionar campos para sistema de transferências
const migration010: Migration = {
  id: '010_add_transfer_fields',
  description: 'Adicionar campos transfer_from, transfer_to e status transfer_pending para gerenciar transferências de conversas',
  up: async () => {
    const alterQueries = [
      // Adicionar campos transfer_from e transfer_to
      'ALTER TABLE human_chats ADD COLUMN transfer_from INT NULL AFTER transfer_reason',
      'ALTER TABLE human_chats ADD COLUMN transfer_to INT NULL AFTER transfer_from',
      
      // Modificar enum status para incluir transfer_pending
      'ALTER TABLE human_chats MODIFY COLUMN status ENUM("pending", "active", "waiting_payment", "paid", "finished", "resolved", "transfer_pending") DEFAULT "pending"',
      
      // Adicionar índices para melhor performance
      'ALTER TABLE human_chats ADD INDEX idx_transfer_from (transfer_from)',
      'ALTER TABLE human_chats ADD INDEX idx_transfer_to (transfer_to)',
      
      // Adicionar chaves estrangeiras para integridade referencial
      'ALTER TABLE human_chats ADD FOREIGN KEY (transfer_from) REFERENCES users(id) ON DELETE SET NULL',
      'ALTER TABLE human_chats ADD FOREIGN KEY (transfer_to) REFERENCES users(id) ON DELETE SET NULL'
    ];
    
    for (const query of alterQueries) {
      try {
        await executeQuery(query);
        console.log(`✅ Migration 010: ${query}`);
      } catch (error: any) {
        if (!error.message.includes('Duplicate column name') && 
            !error.message.includes('Duplicate key name') &&
            !error.message.includes('Duplicate foreign key') &&
            !error.message.includes('already exists')) {
          console.error(`❌ Migration 010 erro: ${error.message}`);
          throw error;
        } else {
          console.log(`⚠️ Migration 010: ${query} - já existe`);
        }
      }
    }
  },
  down: async () => {
    const queries = [
      'ALTER TABLE human_chats DROP FOREIGN KEY human_chats_ibfk_4',
      'ALTER TABLE human_chats DROP FOREIGN KEY human_chats_ibfk_5',
      'ALTER TABLE human_chats DROP INDEX idx_transfer_from',
      'ALTER TABLE human_chats DROP INDEX idx_transfer_to',
      'ALTER TABLE human_chats MODIFY COLUMN status ENUM("pending", "active", "waiting_payment", "paid", "finished", "resolved") DEFAULT "pending"',
      'ALTER TABLE human_chats DROP COLUMN transfer_from',
      'ALTER TABLE human_chats DROP COLUMN transfer_to'
    ];
    
    for (const query of queries) {
      try {
        await executeQuery(query);
      } catch (error: any) {
        console.log(`⚠️ Migration 010 down: ${error.message}`);
      }
    }
  }
};

// Migration 011: Adicionar campo last_login na tabela users
const migration011: Migration = {
  id: '011_add_last_login_field',
  description: 'Adicionar campo last_login para rastrear último login dos usuários',
  up: async () => {
    const alterQueries = [
      // Adicionar campo last_login
      'ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL AFTER updated_at',
      
      // Adicionar índice para melhor performance
      'ALTER TABLE users ADD INDEX idx_last_login (last_login)'
    ];
    
    for (const query of alterQueries) {
      try {
        await executeQuery(query);
        console.log(`✅ Migration 011: ${query}`);
      } catch (error: any) {
        if (!error.message.includes('Duplicate column name') && 
            !error.message.includes('Duplicate key name')) {
          console.error(`❌ Migration 011 erro: ${error.message}`);
          throw error;
        } else {
          console.log(`⚠️ Migration 011: ${query} - já existe`);
        }
      }
    }
  },
  down: async () => {
    const queries = [
      'ALTER TABLE users DROP INDEX idx_last_login',
      'ALTER TABLE users DROP COLUMN last_login'
    ];
    
    for (const query of queries) {
      try {
        await executeQuery(query);
      } catch (error: any) {
        console.log(`⚠️ Migration 011 down: ${error.message}`);
      }
    }
  }
};

export const migrations: Migration[] = [
  migration001,
  migration002,
  migration003,
  migration004,
  migration005,
  migration006,
  migration007,
  migration008,
  migration009,
  migration010,
  migration011
];

// Função para verificar se uma migration já foi executada
const isMigrationExecuted = async (migrationId: string): Promise<boolean> => {
  try {
    const result = await executeQuery(
      'SELECT id FROM migrations WHERE id = ?',
      [migrationId]
    );
    return Array.isArray(result) && result.length > 0;
  } catch (error) {
    return false;
  }
};

// Função para marcar migration como executada
const markMigrationExecuted = async (migration: Migration): Promise<void> => {
  await executeQuery(
    'INSERT INTO migrations (id, description) VALUES (?, ?)',
    [migration.id, migration.description]
  );
};

// Função para executar todas as migrations pendentes
export const runMigrations = async (): Promise<void> => {
  console.log('🔄 Executando migrations...');
  
  // Criar tabela de migrations se não existir
  await createMigrationsTable();
  
  let executedCount = 0;
  
  for (const migration of migrations) {
    if (!(await isMigrationExecuted(migration.id))) {
      console.log(`⚡ Executando migration: ${migration.id} - ${migration.description}`);
      
      try {
        await migration.up();
        await markMigrationExecuted(migration);
        executedCount++;
        console.log(`✅ Migration ${migration.id} executada com sucesso`);
      } catch (error) {
        console.error(`❌ Erro ao executar migration ${migration.id}:`, error);
        throw error;
      }
    }
  }
  
  if (executedCount === 0) {
    console.log('✅ Todas as migrations já foram executadas');
  } else {
    console.log(`✅ ${executedCount} migrations executadas com sucesso`);
  }
};

// Função para reverter migrations (uso cuidadoso)
export const rollbackMigrations = async (steps: number = 1): Promise<void> => {
  console.log(`🔄 Revertendo ${steps} migration(s)...`);
  
  const executedMigrations = await executeQuery(
    'SELECT id FROM migrations ORDER BY executed_at DESC LIMIT ?',
    [steps]
  );
  
  for (const row of executedMigrations) {
    const migration = migrations.find(m => m.id === row.id);
    if (migration) {
      console.log(`⚡ Revertendo migration: ${migration.id}`);
      
      try {
        await migration.down();
        await executeQuery('DELETE FROM migrations WHERE id = ?', [migration.id]);
        console.log(`✅ Migration ${migration.id} revertida com sucesso`);
      } catch (error) {
        console.error(`❌ Erro ao reverter migration ${migration.id}:`, error);
        throw error;
      }
    }
  }
};

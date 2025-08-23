-- Adicionar campos de assinatura para controle de acesso

ALTER TABLE users ADD COLUMN subscription_status ENUM('free', 'active', 'expired', 'cancelled') DEFAULT 'free';
ALTER TABLE users ADD COLUMN subscription_plan VARCHAR(50) DEFAULT NULL;
ALTER TABLE users ADD COLUMN subscription_start_date TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE users ADD COLUMN subscription_end_date TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE users ADD COLUMN subscription_payment_method VARCHAR(50) DEFAULT NULL;
ALTER TABLE users ADD COLUMN subscription_amount DECIMAL(10,2) DEFAULT NULL;

-- Índices para performance
ALTER TABLE users ADD INDEX idx_subscription_status (subscription_status);
ALTER TABLE users ADD INDEX idx_subscription_end_date (subscription_end_date);

-- Atualizar o usuário admin para ter assinatura ativa
UPDATE users SET 
    subscription_status = 'active',
    subscription_plan = 'admin_unlimited',
    subscription_start_date = NOW(),
    subscription_end_date = DATE_ADD(NOW(), INTERVAL 1 YEAR)
WHERE role = 'admin';

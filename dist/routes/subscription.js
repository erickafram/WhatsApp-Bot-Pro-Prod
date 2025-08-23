"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const router = express_1.default.Router();
// Simular upgrade de assinatura (aqui você integraria com gateway de pagamento)
router.post('/upgrade', auth_1.authenticate, async (req, res) => {
    try {
        const { plan } = req.body;
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const userId = req.user.id;
        // Verificar se é admin (admins já têm acesso completo)
        if (req.user.role === 'admin') {
            return res.status(400).json({
                error: 'Administradores já têm acesso completo ao sistema'
            });
        }
        // Definir dados da assinatura baseado no plano
        const planData = getPlanData(plan);
        if (!planData) {
            return res.status(400).json({
                error: 'Plano de assinatura inválido'
            });
        }
        // Em um cenário real, aqui você processaria o pagamento com um gateway
        // Por agora, vamos simular um pagamento bem-sucedido
        const subscriptionData = {
            status: 'active',
            plan: planData.name,
            start_date: new Date(),
            end_date: new Date(Date.now() + planData.durationMs),
            payment_method: 'credit_card', // Simulado
            amount: planData.price
        };
        // Atualizar assinatura no banco
        const updatedUser = await User_1.UserModel.updateSubscription(userId, subscriptionData);
        if (!updatedUser) {
            return res.status(404).json({
                error: 'Usuário não encontrado'
            });
        }
        res.json({
            message: 'Assinatura ativada com sucesso!',
            subscription: {
                status: updatedUser.subscription_status,
                plan: updatedUser.subscription_plan,
                end_date: updatedUser.subscription_end_date
            }
        });
    }
    catch (error) {
        console.error('Erro ao processar upgrade de assinatura:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});
// Obter status da assinatura do usuário
router.get('/status', auth_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const user = await User_1.UserModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                error: 'Usuário não encontrado'
            });
        }
        res.json({
            subscription: {
                status: user.subscription_status || 'free',
                plan: user.subscription_plan,
                start_date: user.subscription_start_date,
                end_date: user.subscription_end_date,
                amount: user.subscription_amount
            },
            canCreateInstance: await User_1.UserModel.canCreateInstance(user.id)
        });
    }
    catch (error) {
        console.error('Erro ao buscar status da assinatura:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});
// Cancelar assinatura
router.post('/cancel', auth_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const userId = req.user.id;
        // Verificar se é admin
        if (req.user.role === 'admin') {
            return res.status(400).json({
                error: 'Administradores não podem cancelar assinatura'
            });
        }
        // Cancelar assinatura
        const updatedUser = await User_1.UserModel.updateSubscription(userId, {
            status: 'cancelled'
        });
        if (!updatedUser) {
            return res.status(404).json({
                error: 'Usuário não encontrado'
            });
        }
        res.json({
            message: 'Assinatura cancelada com sucesso',
            subscription: {
                status: updatedUser.subscription_status,
                plan: updatedUser.subscription_plan,
                end_date: updatedUser.subscription_end_date
            }
        });
    }
    catch (error) {
        console.error('Erro ao cancelar assinatura:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});
// Função auxiliar para obter dados do plano
function getPlanData(planId) {
    const plans = {
        basic: {
            name: 'Básico',
            price: 39.90,
            durationMs: 30 * 24 * 60 * 60 * 1000 // 30 dias
        },
        pro: {
            name: 'Profissional',
            price: 79.90,
            durationMs: 30 * 24 * 60 * 60 * 1000 // 30 dias
        },
        enterprise: {
            name: 'Empresarial',
            price: 149.90,
            durationMs: 30 * 24 * 60 * 60 * 1000 // 30 dias
        }
    };
    return plans[planId] || null;
}
exports.default = router;
//# sourceMappingURL=subscription.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SavedDocument_1 = require("../models/SavedDocument");
const Message_1 = require("../models/Message");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Middleware de autenticação em todas as rotas
router.use(auth_1.authenticate);
// Salvar/catalogar um documento
router.post('/save', async (req, res) => {
    try {
        const { messageId, description, category, tags, isImportant } = req.body;
        const operatorId = req.user.id;
        const managerId = req.user.manager_id || req.user.id;
        console.log('📁 Salvando documento:', {
            messageId,
            description,
            category,
            operatorId,
            managerId
        });
        // Validações
        if (!messageId || !description) {
            return res.status(400).json({
                success: false,
                message: 'ID da mensagem e descrição são obrigatórios'
            });
        }
        // Verificar se o documento já foi salvo
        const alreadySaved = await SavedDocument_1.SavedDocumentModel.isDocumentSaved(messageId, managerId);
        if (alreadySaved) {
            return res.status(400).json({
                success: false,
                message: 'Este documento já foi catalogado'
            });
        }
        // Verificar limite mensal de documentos
        const limitCheck = await SavedDocument_1.SavedDocumentModel.canSaveDocument(managerId, req.user.role);
        if (!limitCheck.canSave) {
            return res.status(403).json({
                success: false,
                message: limitCheck.message,
                code: 'MONTHLY_LIMIT_EXCEEDED',
                data: {
                    currentCount: limitCheck.currentCount,
                    limit: limitCheck.limit
                }
            });
        }
        // Buscar dados da mensagem original
        const message = await Message_1.MessageModel.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Mensagem não encontrada'
            });
        }
        // Verificar se é um documento/mídia
        if (!message.media_url || !['document', 'image', 'audio', 'video'].includes(message.message_type)) {
            return res.status(400).json({
                success: false,
                message: 'A mensagem não contém um documento válido'
            });
        }
        // Extrair nome do arquivo da URL
        const documentName = message.media_url.split('/').pop() || 'documento_sem_nome';
        // Criar documento salvo
        const savedDocument = await SavedDocument_1.SavedDocumentModel.create({
            manager_id: managerId,
            message_id: messageId,
            contact_id: message.contact_id,
            chat_id: message.chat_id || undefined,
            operator_id: operatorId,
            document_name: documentName,
            document_url: message.media_url,
            original_message_content: message.content,
            description: description.trim(),
            category: category || 'outros',
            file_size: message.file_size,
            mime_type: message.mime_type,
            tags: Array.isArray(tags) ? tags : [],
            is_important: Boolean(isImportant)
        });
        console.log('✅ Documento salvo com sucesso:', savedDocument.id);
        res.json({
            success: true,
            message: 'Documento catalogado com sucesso',
            data: savedDocument
        });
    }
    catch (error) {
        console.error('❌ Erro ao salvar documento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
// Listar documentos salvos com filtros
router.get('/list', async (req, res) => {
    try {
        const managerId = req.user.manager_id || req.user.id;
        const { category, operator_id, contact_id, date_from, date_to, search, is_important, page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = Math.min(parseInt(limit) || 20, 100); // Máximo 100 por página
        const offset = (pageNum - 1) * limitNum;
        const filters = {
            manager_id: managerId,
            ...(category && { category: category }),
            ...(operator_id && { operator_id: parseInt(operator_id) }),
            ...(contact_id && { contact_id: parseInt(contact_id) }),
            ...(date_from && { date_from: date_from }),
            ...(date_to && { date_to: date_to }),
            ...(search && { search: search }),
            ...(is_important !== undefined && { is_important: is_important === 'true' })
        };
        console.log('🔍 Buscando documentos com filtros:', filters);
        const documents = await SavedDocument_1.SavedDocumentModel.findByFilters(filters, limitNum, offset);
        res.json({
            success: true,
            data: documents,
            pagination: {
                page: pageNum,
                limit: limitNum,
                hasMore: documents.length === limitNum
            }
        });
    }
    catch (error) {
        console.error('❌ Erro ao listar documentos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
// Obter documento específico
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const managerId = req.user.manager_id || req.user.id;
        const document = await SavedDocument_1.SavedDocumentModel.findById(parseInt(id), managerId);
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Documento não encontrado'
            });
        }
        res.json({
            success: true,
            data: document
        });
    }
    catch (error) {
        console.error('❌ Erro ao buscar documento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
// Atualizar documento salvo
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { description, category, tags, is_important } = req.body;
        const managerId = req.user.manager_id || req.user.id;
        const updated = await SavedDocument_1.SavedDocumentModel.update(parseInt(id), managerId, {
            description,
            category,
            tags,
            is_important
        });
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Documento não encontrado ou não foi possível atualizar'
            });
        }
        res.json({
            success: true,
            message: 'Documento atualizado com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao atualizar documento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
// Deletar documento salvo
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const managerId = req.user.manager_id || req.user.id;
        const deleted = await SavedDocument_1.SavedDocumentModel.delete(parseInt(id), managerId);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Documento não encontrado'
            });
        }
        res.json({
            success: true,
            message: 'Documento removido com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao deletar documento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
// Obter estatísticas por categoria
router.get('/stats/by-category', async (req, res) => {
    try {
        const managerId = req.user.manager_id || req.user.id;
        const { date_from, date_to } = req.query;
        const stats = await SavedDocument_1.SavedDocumentModel.getStatsByCategory(managerId, date_from, date_to);
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('❌ Erro ao obter estatísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
// Verificar se documento já foi salvo
router.get('/check/:messageId', async (req, res) => {
    try {
        const { messageId } = req.params;
        const managerId = req.user.manager_id || req.user.id;
        const isSaved = await SavedDocument_1.SavedDocumentModel.isDocumentSaved(parseInt(messageId), managerId);
        res.json({
            success: true,
            data: { isSaved }
        });
    }
    catch (error) {
        console.error('❌ Erro ao verificar documento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
// Obter estatísticas de uso mensal de documentos
router.get('/usage/monthly', async (req, res) => {
    try {
        const managerId = req.user.manager_id || req.user.id;
        const userRole = req.user.role;
        const stats = await SavedDocument_1.SavedDocumentModel.getMonthlyUsageStats(managerId);
        const limitCheck = await SavedDocument_1.SavedDocumentModel.canSaveDocument(managerId, userRole);
        res.json({
            success: true,
            data: {
                ...stats,
                canSave: limitCheck.canSave,
                isAdmin: userRole === 'admin',
                warning: limitCheck.message
            }
        });
    }
    catch (error) {
        console.error('❌ Erro ao obter estatísticas de uso:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
exports.default = router;
//# sourceMappingURL=documents.js.map
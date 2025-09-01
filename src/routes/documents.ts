import express from 'express';
import { Request, Response } from 'express';
import { SavedDocumentModel, SavedDocument, SavedDocumentFilter } from '../models/SavedDocument';
import { MessageModel } from '../models/Message';
import { authenticate } from '../middleware/auth';
import { User } from '../models/User';

const router = express.Router();

// Interface para requests tipados
interface AuthenticatedRequest extends express.Request {
  user?: User;
}

// Middleware de autenticação em todas as rotas
router.use(authenticate);

// Salvar/catalogar um documento
router.post('/save', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { messageId, description, category, tags, isImportant } = req.body;
    const operatorId = req.user!.id;
    const managerId = req.user!.manager_id || req.user!.id;

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
    const alreadySaved = await SavedDocumentModel.isDocumentSaved(messageId, managerId);
    if (alreadySaved) {
      return res.status(400).json({
        success: false,
        message: 'Este documento já foi catalogado'
      });
    }

    // Verificar limite mensal de documentos
    const limitCheck = await SavedDocumentModel.canSaveDocument(managerId, req.user!.role);
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
    const message = await MessageModel.findById(messageId);
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
    const savedDocument = await SavedDocumentModel.create({
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

  } catch (error) {
    console.error('❌ Erro ao salvar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Listar documentos salvos com filtros
router.get('/list', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const managerId = req.user!.manager_id || req.user!.id;
    const {
      category,
      operator_id,
      contact_id,
      date_from,
      date_to,
      search,
      is_important,
      page = '1',
      limit = '20'
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 20, 100); // Máximo 100 por página
    const offset = (pageNum - 1) * limitNum;

    const filters: SavedDocumentFilter = {
      manager_id: managerId,
      ...(category && { category: category as string }),
      ...(operator_id && { operator_id: parseInt(operator_id as string) }),
      ...(contact_id && { contact_id: parseInt(contact_id as string) }),
      ...(date_from && { date_from: date_from as string }),
      ...(date_to && { date_to: date_to as string }),
      ...(search && { search: search as string }),
      ...(is_important !== undefined && { is_important: is_important === 'true' })
    };

    console.log('🔍 Buscando documentos com filtros:', filters);

    const documents = await SavedDocumentModel.findByFilters(filters, limitNum, offset);

    res.json({
      success: true,
      data: documents,
      pagination: {
        page: pageNum,
        limit: limitNum,
        hasMore: documents.length === limitNum
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar documentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Obter documento específico
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const managerId = req.user!.manager_id || req.user!.id;

    const document = await SavedDocumentModel.findById(parseInt(id), managerId);

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

  } catch (error) {
    console.error('❌ Erro ao buscar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Atualizar documento salvo
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { description, category, tags, is_important } = req.body;
    const managerId = req.user!.manager_id || req.user!.id;

    const updated = await SavedDocumentModel.update(parseInt(id), managerId, {
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

  } catch (error) {
    console.error('❌ Erro ao atualizar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Deletar documento salvo
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const managerId = req.user!.manager_id || req.user!.id;

    const deleted = await SavedDocumentModel.delete(parseInt(id), managerId);

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

  } catch (error) {
    console.error('❌ Erro ao deletar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Obter estatísticas por categoria
router.get('/stats/by-category', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const managerId = req.user!.manager_id || req.user!.id;
    const { date_from, date_to } = req.query;

    const stats = await SavedDocumentModel.getStatsByCategory(
      managerId,
      date_from as string,
      date_to as string
    );

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Verificar se documento já foi salvo
router.get('/check/:messageId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const managerId = req.user!.manager_id || req.user!.id;

    const isSaved = await SavedDocumentModel.isDocumentSaved(parseInt(messageId), managerId);

    res.json({
      success: true,
      data: { isSaved }
    });

  } catch (error) {
    console.error('❌ Erro ao verificar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Obter estatísticas de uso mensal de documentos
router.get('/usage/monthly', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const managerId = req.user!.manager_id || req.user!.id;
    const userRole = req.user!.role;

    const stats = await SavedDocumentModel.getMonthlyUsageStats(managerId);
    const limitCheck = await SavedDocumentModel.canSaveDocument(managerId, userRole);

    res.json({
      success: true,
      data: {
        ...stats,
        canSave: limitCheck.canSave,
        isAdmin: userRole === 'admin',
        warning: limitCheck.message
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas de uso:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;

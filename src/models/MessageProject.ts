import { executeQuery } from '../config/database';

export interface MessageProject {
  id: number;
  manager_id: number;
  name: string;
  description?: string;
  is_active: boolean;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
  messages?: AutoMessage[];
}

export interface AutoMessage {
  id: number;
  project_id: number;
  trigger_words: string[];
  response_text: string;
  is_active: boolean;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProjectData {
  manager_id: number;
  name: string;
  description?: string;
  is_active?: boolean;
  is_default?: boolean;
}

export interface CreateMessageData {
  project_id: number;
  trigger_words: string[];
  response_text: string;
  is_active?: boolean;
  order_index?: number;
}

export class MessageProjectModel {
  // Criar projeto
  static async create(data: CreateProjectData): Promise<MessageProject> {
    // Se este projeto deve ser padrão, primeiro remover padrão dos outros
    if (data.is_default) {
      await executeQuery(
        'UPDATE message_projects SET is_default = FALSE WHERE manager_id = ?',
        [data.manager_id]
      );
    }
    
    const query = `
      INSERT INTO message_projects (manager_id, name, description, is_active, is_default)
      VALUES (?, ?, ?, TRUE, ?)
    `;
    
    const result = await executeQuery(query, [
      data.manager_id,
      data.name,
      data.description || null,
      data.is_default || false
    ]);
    
    const insertId = (result as any).insertId;
    const project = await MessageProjectModel.findById(insertId);
    
    if (!project) {
      throw new Error('Erro ao criar projeto');
    }
    
    return project;
  }

  // Buscar projeto por ID
  static async findById(id: number, includeMessages = false): Promise<MessageProject | null> {
    const query = 'SELECT * FROM message_projects WHERE id = ?';
    const result = await executeQuery(query, [id]);
    
    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }
    
    const project = result[0] as MessageProject;
    
    if (includeMessages) {
      project.messages = await AutoMessageModel.findByProjectId(id);
    }
    
    return project;
  }

  // Buscar projetos de um gestor
  static async findByManagerId(managerId: number, includeMessages = false): Promise<MessageProject[]> {
    const query = `
      SELECT * FROM message_projects 
      WHERE manager_id = ? AND is_active = TRUE 
      ORDER BY is_default DESC, name ASC
    `;
    
    const result = await executeQuery(query, [managerId]);
    
    if (!Array.isArray(result)) {
      return [];
    }
    
    const projects = result as MessageProject[];
    
    if (includeMessages) {
      for (const project of projects) {
        project.messages = await AutoMessageModel.findByProjectId(project.id);
      }
    }
    
    return projects;
  }

  // Buscar projeto padrão de um gestor
  static async findDefaultByManagerId(managerId: number, includeMessages = true): Promise<MessageProject | null> {
    const query = `
      SELECT * FROM message_projects 
      WHERE manager_id = ? AND is_default = TRUE AND is_active = TRUE 
      LIMIT 1
    `;
    
    const result = await executeQuery(query, [managerId]);
    
    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }
    
    const project = result[0] as MessageProject;
    
    if (includeMessages) {
      project.messages = await AutoMessageModel.findByProjectId(project.id);
    }
    
    return project;
  }

  // Atualizar projeto
  static async update(id: number, updateData: Partial<CreateProjectData>): Promise<MessageProject | null> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updateData.name) {
      fields.push('name = ?');
      values.push(updateData.name);
    }
    
    if (updateData.description !== undefined) {
      fields.push('description = ?');
      values.push(updateData.description);
    }
    
    if (updateData.is_default !== undefined) {
      // Se definindo como padrão, remover padrão dos outros projetos do mesmo gestor
      if (updateData.is_default) {
        const project = await MessageProjectModel.findById(id);
        if (project) {
          await executeQuery(
            'UPDATE message_projects SET is_default = FALSE WHERE manager_id = ? AND id != ?',
            [project.manager_id, id]
          );
        }
      }
      
      fields.push('is_default = ?');
      values.push(updateData.is_default);
    }
    
    if (fields.length === 0) {
      return await MessageProjectModel.findById(id);
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const query = `UPDATE message_projects SET ${fields.join(', ')} WHERE id = ?`;
    await executeQuery(query, values);
    
    return await MessageProjectModel.findById(id);
  }

  // Desativar projeto
  static async deactivate(id: number): Promise<boolean> {
    const query = `
      UPDATE message_projects 
      SET is_active = FALSE, is_default = FALSE, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    const result = await executeQuery(query, [id]);
    return (result as any).affectedRows > 0;
  }



  // Contar projetos por gestor
  static async countByManager(managerId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM message_projects 
      WHERE manager_id = ? AND is_active = TRUE
    `;
    
    const result = await executeQuery(query, [managerId]);
    
    if (Array.isArray(result) && result.length > 0) {
      return parseInt((result[0] as any).count);
    }
    
    return 0;
  }

  // Definir projeto como padrão
  static async setAsDefault(projectId: number): Promise<MessageProject | null> {
    // Primeiro buscar o projeto para pegar o manager_id
    const project = await this.findById(projectId);
    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    // Remover padrão dos outros projetos do mesmo gestor
    await executeQuery(
      'UPDATE message_projects SET is_default = FALSE WHERE manager_id = ?',
      [project.manager_id]
    );

    // Definir este projeto como padrão
    await executeQuery(
      'UPDATE message_projects SET is_default = TRUE WHERE id = ?',
      [projectId]
    );

    return this.findById(projectId);
  }

  // Deletar projeto
  static async delete(projectId: number): Promise<void> {
    const query = `DELETE FROM message_projects WHERE id = ?`;
    await executeQuery(query, [projectId]);
  }
}

export class AutoMessageModel {
  // Criar mensagem automática
  static async create(data: CreateMessageData): Promise<AutoMessage> {
    const query = `
      INSERT INTO auto_messages (project_id, trigger_words, response_text, is_active, order_index)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      data.project_id,
      JSON.stringify(data.trigger_words),
      data.response_text,
      data.is_active !== false,
      data.order_index || 0
    ]);
    
    const insertId = (result as any).insertId;
    const message = await AutoMessageModel.findById(insertId);
    
    if (!message) {
      throw new Error('Erro ao criar mensagem automática');
    }
    
    return message;
  }

  // Buscar mensagem por ID
  static async findById(id: number): Promise<AutoMessage | null> {
    const query = 'SELECT * FROM auto_messages WHERE id = ?';
    const result = await executeQuery(query, [id]);
    
    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }
    
    const message = result[0] as any;
    
    // Parse trigger_words JSON
    if (typeof message.trigger_words === 'string') {
      try {
        message.trigger_words = JSON.parse(message.trigger_words);
      } catch (e) {
        message.trigger_words = [];
      }
    }
    
    return message;
  }

  // Buscar mensagens de um projeto
  static async findByProjectId(projectId: number): Promise<AutoMessage[]> {
    const query = `
      SELECT * FROM auto_messages 
      WHERE project_id = ? 
      ORDER BY order_index ASC, id ASC
    `;
    
    const result = await executeQuery(query, [projectId]);
    
    if (!Array.isArray(result)) {
      return [];
    }
    
    return result.map((message: any) => {
      // Parse trigger_words JSON
      if (typeof message.trigger_words === 'string') {
        try {
          message.trigger_words = JSON.parse(message.trigger_words);
        } catch (e) {
          message.trigger_words = [];
        }
      }
      return message;
    });
  }

  // Buscar mensagens ativas de um projeto
  static async findActiveByProjectId(projectId: number): Promise<AutoMessage[]> {
    const query = `
      SELECT * FROM auto_messages 
      WHERE project_id = ? AND is_active = TRUE 
      ORDER BY order_index ASC, id ASC
    `;
    
    const result = await executeQuery(query, [projectId]);
    
    if (!Array.isArray(result)) {
      return [];
    }
    
    return result.map((message: any) => {
      // Parse trigger_words JSON
      if (typeof message.trigger_words === 'string') {
        try {
          message.trigger_words = JSON.parse(message.trigger_words);
        } catch (e) {
          message.trigger_words = [];
        }
      }
      return message;
    });
  }

  // Atualizar mensagem
  static async update(id: number, updateData: Partial<CreateMessageData>): Promise<AutoMessage | null> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updateData.trigger_words) {
      fields.push('trigger_words = ?');
      values.push(JSON.stringify(updateData.trigger_words));
    }
    
    if (updateData.response_text) {
      fields.push('response_text = ?');
      values.push(updateData.response_text);
    }
    
    if (updateData.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(updateData.is_active);
    }
    
    if (updateData.order_index !== undefined) {
      fields.push('order_index = ?');
      values.push(updateData.order_index);
    }
    
    if (fields.length === 0) {
      return await AutoMessageModel.findById(id);
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const query = `UPDATE auto_messages SET ${fields.join(', ')} WHERE id = ?`;
    await executeQuery(query, values);
    
    return await AutoMessageModel.findById(id);
  }

  // Deletar mensagem
  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM auto_messages WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return (result as any).affectedRows > 0;
  }

  // Reordenar mensagens de um projeto
  static async reorder(projectId: number, messageIds: number[]): Promise<boolean> {
    try {
      for (let i = 0; i < messageIds.length; i++) {
        await executeQuery(
          'UPDATE auto_messages SET order_index = ? WHERE id = ? AND project_id = ?',
          [i, messageIds[i], projectId]
        );
      }
      return true;
    } catch (error) {
      console.error('Erro ao reordenar mensagens:', error);
      return false;
    }
  }

  // Contar mensagens de um projeto
  static async countByProject(projectId: number): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM auto_messages WHERE project_id = ?';
    const result = await executeQuery(query, [projectId]);
    
    if (Array.isArray(result) && result.length > 0) {
      return parseInt((result[0] as any).count);
    }
    
    return 0;
  }
}

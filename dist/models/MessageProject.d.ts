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
export declare class MessageProjectModel {
    static create(data: CreateProjectData): Promise<MessageProject>;
    static findById(id: number, includeMessages?: boolean): Promise<MessageProject | null>;
    static findByManagerId(managerId: number, includeMessages?: boolean): Promise<MessageProject[]>;
    static findDefaultByManagerId(managerId: number, includeMessages?: boolean): Promise<MessageProject | null>;
    static update(id: number, updateData: Partial<CreateProjectData>): Promise<MessageProject | null>;
    static deactivate(id: number): Promise<boolean>;
    static countByManager(managerId: number): Promise<number>;
    static setAsDefault(projectId: number): Promise<MessageProject | null>;
    static delete(projectId: number): Promise<void>;
}
export declare class AutoMessageModel {
    static create(data: CreateMessageData): Promise<AutoMessage>;
    static findById(id: number): Promise<AutoMessage | null>;
    static findByProjectId(projectId: number): Promise<AutoMessage[]>;
    static findActiveByProjectId(projectId: number): Promise<AutoMessage[]>;
    static update(id: number, updateData: Partial<CreateMessageData>): Promise<AutoMessage | null>;
    static delete(id: number): Promise<boolean>;
    static reorder(projectId: number, messageIds: number[]): Promise<boolean>;
    static countByProject(projectId: number): Promise<number>;
}
//# sourceMappingURL=MessageProject.d.ts.map
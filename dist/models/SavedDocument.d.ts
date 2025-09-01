export interface SavedDocument {
    id?: number;
    manager_id: number;
    message_id: number;
    contact_id: number;
    chat_id?: number;
    operator_id: number;
    document_name: string;
    document_url: string;
    original_message_content?: string;
    description: string;
    category: 'pagamento' | 'documento_pessoal' | 'comprovante' | 'contrato' | 'outros';
    file_size?: number;
    mime_type?: string;
    tags?: string[];
    is_important: boolean;
    created_at?: Date;
    updated_at?: Date;
}
export interface SavedDocumentFilter {
    manager_id: number;
    category?: string;
    operator_id?: number;
    contact_id?: number;
    date_from?: string;
    date_to?: string;
    search?: string;
    is_important?: boolean;
}
export declare class SavedDocumentModel {
    private static safeParseTags;
    static create(data: Omit<SavedDocument, 'id' | 'created_at' | 'updated_at'>): Promise<SavedDocument>;
    static findByFilters(filters: SavedDocumentFilter, limit?: number, offset?: number): Promise<SavedDocument[]>;
    static findById(id: number, managerId: number): Promise<SavedDocument | null>;
    static update(id: number, managerId: number, data: Partial<SavedDocument>): Promise<boolean>;
    static delete(id: number, managerId: number): Promise<boolean>;
    static getStatsByCategory(managerId: number, dateFrom?: string, dateTo?: string): Promise<any[]>;
    static isDocumentSaved(messageId: number, managerId: number): Promise<boolean>;
    static countDocumentsThisMonth(managerId: number): Promise<number>;
    static canSaveDocument(managerId: number, userRole?: string): Promise<{
        canSave: boolean;
        currentCount: number;
        limit: number;
        message?: string;
    }>;
    static getMonthlyUsageStats(managerId: number): Promise<{
        currentMonth: number;
        limit: number;
        percentage: number;
        remainingDays: number;
    }>;
}
//# sourceMappingURL=SavedDocument.d.ts.map
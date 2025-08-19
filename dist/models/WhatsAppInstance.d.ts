export interface WhatsAppInstance {
    id: number;
    manager_id: number;
    instance_name: string;
    phone_number?: string;
    status: 'disconnected' | 'connecting' | 'connected' | 'error';
    qr_code?: string;
    session_data?: any;
    webhook_url?: string;
    is_active: boolean;
    connected_at?: Date;
    last_activity?: Date;
    created_at: Date;
    updated_at: Date;
}
export interface CreateInstanceData {
    manager_id: number;
    instance_name: string;
    webhook_url?: string;
}
export declare class WhatsAppInstanceModel {
    static create(data: CreateInstanceData): Promise<WhatsAppInstance>;
    static findById(id: number): Promise<WhatsAppInstance | null>;
    static findByManagerId(managerId: number): Promise<WhatsAppInstance[]>;
    static findActiveByManagerId(managerId: number): Promise<WhatsAppInstance | null>;
    static updateStatus(id: number, status: WhatsAppInstance['status'], additionalData?: {
        phone_number?: string;
        qr_code?: string;
        session_data?: any;
        connected_at?: Date;
    }): Promise<boolean>;
    static updateActivity(id: number): Promise<boolean>;
    static disconnect(id: number): Promise<boolean>;
    static deactivate(id: number): Promise<boolean>;
    static findAllConnected(): Promise<WhatsAppInstance[]>;
    static getStats(managerId?: number): Promise<{
        total: number;
        connected: number;
        connecting: number;
        disconnected: number;
        error: number;
    }>;
    static clearExpiredQRCodes(): Promise<number>;
    static hasActiveInstance(managerId: number): Promise<boolean>;
    static countActiveInstances(managerId: number): Promise<number>;
    static countByManager(managerId: number): Promise<number>;
}
//# sourceMappingURL=WhatsAppInstance.d.ts.map
export interface Device {
    id: number;
    manager_id: number;
    whatsapp_instance_id?: number;
    device_name: string;
    device_type: 'smartphone' | 'tablet' | 'computer' | 'other';
    device_model?: string;
    os_name?: string;
    os_version?: string;
    browser_name?: string;
    browser_version?: string;
    ip_address?: string;
    user_agent?: string;
    screen_resolution?: string;
    timezone?: string;
    language?: string;
    whatsapp_status: 'disconnected' | 'connecting' | 'connected' | 'error';
    whatsapp_phone?: string;
    status: 'online' | 'offline' | 'idle' | 'blocked';
    is_trusted: boolean;
    is_primary: boolean;
    last_activity?: Date;
    location_data?: any;
    device_fingerprint?: string;
    session_token?: string;
    push_token?: string;
    metadata?: any;
    created_at: Date;
    updated_at: Date;
}
export interface CreateDeviceData {
    manager_id: number;
    whatsapp_instance_id?: number;
    device_name: string;
    device_type?: 'smartphone' | 'tablet' | 'computer' | 'other';
    device_model?: string;
    os_name?: string;
    os_version?: string;
    browser_name?: string;
    browser_version?: string;
    ip_address?: string;
    user_agent?: string;
    screen_resolution?: string;
    timezone?: string;
    language?: string;
    whatsapp_status?: 'disconnected' | 'connecting' | 'connected' | 'error';
    whatsapp_phone?: string;
    location_data?: any;
    device_fingerprint?: string;
    session_token?: string;
    push_token?: string;
    metadata?: any;
}
export interface UpdateDeviceData extends Partial<CreateDeviceData> {
    device_name?: string;
    status?: 'online' | 'offline' | 'idle' | 'blocked';
    whatsapp_status?: 'disconnected' | 'connecting' | 'connected' | 'error';
    whatsapp_phone?: string;
    is_trusted?: boolean;
    is_primary?: boolean;
}
export declare class DeviceModel {
    static create(data: CreateDeviceData): Promise<Device>;
    static findById(id: number): Promise<Device | null>;
    static findByManagerId(managerId: number): Promise<Device[]>;
    static findByFingerprint(managerId: number, fingerprint: string): Promise<Device | null>;
    static findBySessionToken(sessionToken: string): Promise<Device | null>;
    static update(id: number, updateData: UpdateDeviceData): Promise<Device | null>;
    static updateActivity(id: number): Promise<boolean>;
    static setOffline(id: number): Promise<boolean>;
    static setPrimary(id: number, managerId: number): Promise<boolean>;
    static setTrusted(id: number, trusted: boolean): Promise<boolean>;
    static setBlocked(id: number, blocked: boolean): Promise<boolean>;
    static delete(id: number): Promise<boolean>;
    static findOnlineDevices(managerId?: number): Promise<Device[]>;
    static getStats(managerId?: number): Promise<{
        total: number;
        online: number;
        offline: number;
        idle: number;
        blocked: number;
        trusted: number;
    }>;
    static cleanupInactiveDevices(): Promise<number>;
    static markInactiveAsOffline(): Promise<number>;
    private static parseDevice;
    static findPrimaryDevice(managerId: number): Promise<Device | null>;
    static countByManager(managerId: number): Promise<number>;
    static findWithWhatsAppInstances(managerId?: number): Promise<Device[]>;
    static linkToWhatsAppInstance(deviceId: number, instanceId: number): Promise<boolean>;
    static unlinkFromWhatsAppInstance(deviceId: number): Promise<boolean>;
    static updateWhatsAppStatus(deviceId: number, status: 'disconnected' | 'connecting' | 'connected' | 'error', phone?: string): Promise<boolean>;
    static canDelete(deviceId: number): Promise<{
        canDelete: boolean;
        reason?: string;
    }>;
    static syncWithWhatsAppInstances(): Promise<number>;
    static autoCreateForWhatsAppInstances(): Promise<number>;
}
//# sourceMappingURL=Device.d.ts.map
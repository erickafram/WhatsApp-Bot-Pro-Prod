export interface Contact {
    id: number;
    manager_id: number;
    phone_number: string;
    name: string | null;
    avatar: string | null;
    tags: string[] | null;
    notes: string | null;
    is_blocked: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface Message {
    id: number;
    manager_id: number;
    chat_id: number | null;
    contact_id: number;
    whatsapp_message_id: string | null;
    sender_type: 'contact' | 'bot' | 'operator';
    sender_id: number | null;
    content: string;
    message_type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location';
    media_url: string | null;
    is_read: boolean;
    delivered_at: Date | null;
    read_at: Date | null;
    created_at: Date;
}
export interface HumanChat {
    id: number;
    manager_id: number;
    contact_id: number;
    operator_id: number | null;
    assigned_to: number | null;
    status: 'pending' | 'active' | 'waiting_payment' | 'paid' | 'finished' | 'resolved' | 'transfer_pending';
    transfer_reason: string | null;
    transfer_from: number | null;
    transfer_to: number | null;
    tags: string[] | null;
    created_at: Date;
    updated_at: Date;
}
export interface CreateContactData {
    manager_id: number;
    phone_number: string;
    name?: string;
    avatar?: string;
    tags?: string[];
    notes?: string;
}
export interface CreateMessageData {
    manager_id: number;
    chat_id?: number | null;
    contact_id: number;
    whatsapp_message_id?: string;
    sender_type: 'contact' | 'bot' | 'operator';
    sender_id?: number;
    content: string;
    message_type?: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location';
    media_url?: string;
}
export interface CreateHumanChatData {
    manager_id: number;
    contact_id: number;
    operator_id?: number;
    assigned_to?: number;
    status?: 'pending' | 'active' | 'waiting_payment' | 'paid' | 'finished' | 'resolved' | 'transfer_pending';
    transfer_reason?: string;
    transfer_from?: number;
    transfer_to?: number;
    tags?: string[];
}
export declare class ContactModel {
    static findOrCreate(data: CreateContactData): Promise<Contact>;
    static findByPhoneAndManager(phoneNumber: string, managerId: number): Promise<Contact | null>;
    static findById(id: number): Promise<Contact | null>;
    static findByManager(managerId: number): Promise<Contact[]>;
    static update(id: number, updateData: Partial<CreateContactData>): Promise<Contact | null>;
}
export declare class MessageModel {
    static create(data: CreateMessageData): Promise<Message>;
    static findById(id: number): Promise<Message | null>;
    static findByContact(contactId: number, limit?: number): Promise<Message[]>;
    static findByChat(chatId: number, limit?: number): Promise<Message[]>;
    static findByManager(managerId: number, limit?: number): Promise<Message[]>;
    static markAsRead(id: number): Promise<void>;
    static markContactMessagesAsRead(contactId: number): Promise<void>;
}
export declare class HumanChatModel {
    static create(data: CreateHumanChatData): Promise<HumanChat>;
    static findById(id: number): Promise<HumanChat | null>;
    static findByManager(managerId: number, userId?: number, userRole?: string): Promise<any[]>;
    static findActiveByContact(contactId: number): Promise<HumanChat | null>;
    static findAnyByContact(contactId: number): Promise<HumanChat | null>;
    static updateStatus(id: number, status: HumanChat['status']): Promise<HumanChat | null>;
    static assignOperator(id: number, operatorId: number): Promise<HumanChat | null>;
    static assignToUser(id: number, userId: number): Promise<HumanChat | null>;
    static transferToUser(id: number, fromUserId: number, toUserId: number, transferReason?: string): Promise<HumanChat | null>;
    static acceptTransfer(id: number, userId: number): Promise<HumanChat | null>;
    static rejectTransfer(id: number, userId: number): Promise<HumanChat | null>;
    static findPendingTransfers(userId: number): Promise<any[]>;
    static unassign(id: number): Promise<HumanChat | null>;
    static findPending(managerId: number): Promise<any[]>;
}
//# sourceMappingURL=Message.d.ts.map
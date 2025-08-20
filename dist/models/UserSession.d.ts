export interface UserSession {
    id: number;
    user_id: number;
    session_token: string;
    refresh_token: string;
    expires_at: Date;
    created_at: Date;
    updated_at: Date;
    ip_address?: string;
    user_agent?: string;
    is_active: boolean;
}
export interface CreateSessionData {
    user_id: number;
    ip_address?: string;
    user_agent?: string;
}
export declare class UserSessionModel {
    private static generateSecureToken;
    static create(sessionData: CreateSessionData): Promise<UserSession>;
    static findById(id: number): Promise<UserSession | null>;
    static findByToken(sessionToken: string): Promise<UserSession | null>;
    static isValidSession(sessionToken: string): Promise<boolean>;
    static refresh(refreshToken: string): Promise<UserSession | null>;
    static deactivate(sessionId: number): Promise<void>;
    static deactivateByToken(sessionToken: string): Promise<void>;
    static deactivateAllUserSessions(userId: number): Promise<void>;
    static cleanExpiredSessions(): Promise<void>;
    static findActiveUserSessions(userId: number): Promise<UserSession[]>;
    static updateActivity(sessionToken: string): Promise<void>;
}
//# sourceMappingURL=UserSession.d.ts.map
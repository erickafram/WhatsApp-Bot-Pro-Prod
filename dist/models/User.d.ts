export interface User {
    id: number;
    name: string;
    email: string;
    password?: string;
    role: 'admin' | 'manager' | 'operator';
    manager_id?: number;
    phone?: string;
    avatar?: string;
    is_active: boolean;
    email_verified_at?: Date;
    created_at: Date;
    updated_at: Date;
    last_login?: Date;
    subscription_status?: 'free' | 'active' | 'expired' | 'cancelled';
    subscription_plan?: string;
    subscription_start_date?: Date;
    subscription_end_date?: Date;
    subscription_payment_method?: string;
    subscription_amount?: number;
}
export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'manager' | 'operator';
    manager_id?: number;
    phone?: string;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface JWTPayload {
    id: number;
    email: string;
    role: string;
    manager_id?: number;
}
export declare class UserModel {
    static create(userData: CreateUserData): Promise<User>;
    static findById(id: number): Promise<User | null>;
    static findByEmail(email: string): Promise<User | null>;
    static findByEmailWithPassword(email: string): Promise<User | null>;
    static emailExists(email: string, excludeId?: number): Promise<boolean>;
    static updateLastLogin(userId: number): Promise<void>;
    static login(credentials: LoginCredentials, sessionData?: {
        ip_address?: string;
        user_agent?: string;
    }): Promise<{
        user: User;
        token: string;
        sessionToken: string;
    } | null>;
    static generateToken(user: User): string;
    static verifyToken(token: string): JWTPayload | null;
    static logout(sessionToken: string): Promise<void>;
    static verifySession(sessionToken: string): Promise<{
        user: User;
        session: any;
    } | null>;
    static findOperatorsByManager(managerId: number): Promise<User[]>;
    static findAllManagers(): Promise<User[]>;
    static update(id: number, updateData: Partial<CreateUserData>): Promise<User | null>;
    static deactivate(id: number): Promise<boolean>;
    static activate(id: number): Promise<boolean>;
    static getCountsByRole(): Promise<{
        admin: number;
        manager: number;
        operator: number;
    }>;
    static createDefaultAdmin(): Promise<User | null>;
    static canCreateInstance(userId: number): Promise<boolean>;
    static updateSubscription(userId: number, subscriptionData: {
        status: 'free' | 'active' | 'expired' | 'cancelled';
        plan?: string;
        start_date?: Date;
        end_date?: Date;
        payment_method?: string;
        amount?: number;
    }): Promise<User | null>;
    static getExpiringSubscriptions(daysBeforeExpiry?: number): Promise<User[]>;
    static expireSubscriptions(): Promise<number>;
}
//# sourceMappingURL=User.d.ts.map
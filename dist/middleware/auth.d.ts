import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
declare global {
    namespace Express {
        interface Request {
            user?: User;
            token?: string;
        }
    }
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireManager: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireManagerAccess: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireUserManagement: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateUserData: (req: Request, res: Response, next: NextFunction) => void;
export declare const logAction: (action: string) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map
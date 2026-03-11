// src/types/express.d.ts
import { JwtPayload } from 'jsonwebtoken';
import { HUserDocument } from '../DB/models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: HUserDocument;
      decoded?: JwtPayload;
    }
  }
}

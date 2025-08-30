import jwt from 'jsonwebtoken';
import { AppError } from '../utils/Error.js';

export function auth(required = true, roles = ['admin', 'student', 'teacher', 'cashier']) {
  return (req, _res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return required ? next(new AppError('Missing token', 401)) : next();
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      // attach user info
      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role
      };

      // role check
      if (!roles.includes(payload.role)) {
        return next(new AppError('Forbidden: insufficient permissions', 403));
      }

      return next();
    } catch (err) {
      return next(new AppError('Invalid token', 401));
    }
  };
}

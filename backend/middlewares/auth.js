import jwt from 'jsonwebtoken';
import { AppError } from '../utils/Error';

export function auth(required = true) {
  return (req, _res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return required ? next(new AppError('Missing token', 401)) : next();
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: payload.sub, email: payload.email };
      return next();
    } catch (_) {
      return next(new AppError('ivlied token', 401));
    }
  };
}
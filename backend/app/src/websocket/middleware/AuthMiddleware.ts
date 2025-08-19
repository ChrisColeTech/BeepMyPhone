import { Request, Response, NextFunction } from 'express'

export const authmiddleware = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement AuthMiddleware middleware
  next()
}

import { Request, Response } from 'express'

export abstract class BaseController {
  // TODO: Implement base controller methods
  
  protected sendResponse(res: Response, data: any, statusCode: number = 200) {
    res.status(statusCode).json(data)
  }
  
  protected sendError(res: Response, message: string, statusCode: number = 500) {
    res.status(statusCode).json({ error: message })
  }
}

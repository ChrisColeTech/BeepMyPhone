import { Request, Response } from 'express'
import { BaseController } from './base/BaseController'

export class HealthController extends BaseController {
  // TODO: Implement HealthController methods
  
  async index(req: Request, res: Response) {
    try {
      // TODO: Implement index method
      this.sendResponse(res, { message: 'HealthController index' })
    } catch (error) {
      this.sendError(res, `Error in HealthController: ${error}`)
    }
  }
}

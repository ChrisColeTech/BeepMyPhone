import { Request, Response } from 'express'
import { BaseController } from './base/BaseController'

export class DeviceController extends BaseController {
  // TODO: Implement DeviceController methods
  
  async index(req: Request, res: Response) {
    try {
      // TODO: Implement index method
      this.sendResponse(res, { message: 'DeviceController index' })
    } catch (error) {
      this.sendError(res, `Error in DeviceController: ${error}`)
    }
  }
}

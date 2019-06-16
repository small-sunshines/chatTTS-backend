import { Request, Response } from 'express'

const cookieName = 'authorization'

class SessToken {
  public static getToken(req: Request): string {
    return req.cookies[cookieName]
  }

  public static setToken(res: Response, token: string): void {
    res.cookie(cookieName, token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7 * 1000,
    })
    res.cookie('isLogin', true, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7 * 1000,
    })
  }
}

export default SessToken

import { Response, Request } from 'express'

const cookieName = 'authorization'

class sessToken {
  static getToken (req: Request): string {
    return req.cookies[cookieName]
  }

  static setToken (res: Response, token: string): void {
    res.cookie(cookieName, token, {
      httpOnly: true,
      maxAge: 604800 
    })
    res.cookie('isLogin', true, {
      httpOnly: false,
      maxAge: 604800
    })
  }
}

export default sessToken
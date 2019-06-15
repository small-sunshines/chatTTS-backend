import * as jwt from 'jsonwebtoken'

class JWTBuilder {
  private readonly issuer: string
  private readonly privkey: any
  private readonly subject: string
  private readonly algorithm: string
  private readonly maxAge: number|string

  constructor () {
    this.issuer = process.env.jwt_issuer!
    this.privkey = process.env.jwt_privkey!
    this.subject = process.env.jwt_subject!
    this.algorithm = 'HS384'
    this.maxAge = process.env.jwt_maxAge!
  }

  async createToken (payload: object): Promise<string> {
    try {
      const options = {
        algorithm: this.algorithm,
        expiresIn: this.maxAge,
        issuer: this.issuer,
        subject: this.subject
      }
      const result = await this._createJWT(payload, this.privkey, options)
      return result
    } catch (error) {
      throw error
    }
  }

  async verifyToken (token: string): Promise<JWTToken> {
    try {
      const options = {
        algorithm: this.algorithm,
        issuer: this.issuer,
        subject: this.subject,
        maxAge: this.maxAge
      }
      const result = await this._verifyJWT(token, this.privkey, options)
      return result
    } catch(error) {
      throw error
    }
  }

  private _createJWT (payload: object, secret: any, options: object): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, secret, options, (error: Error, token: string) => {
        if (error) reject(error)
        else resolve(token)
      })
    })
  }

  private _verifyJWT (token: string, secret: any, options: object): Promise<JWTToken> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, options, (error: Error, decoded: any) => {
        if (error) reject(error)
        else resolve(decoded)
      })
    })
  }
}

export default new JWTBuilder()

export interface JWTToken {
  id: string,
  nickname: string,
  isAdmin: boolean,
  auth: { [key: string]: IOAuthUser },
  iat: number,
  exp: number,
  iss: string,
  sub: string
}

export interface IOAuthUser {
  id: string,
  profilePhoto: string,
  username: string,
  displayName: string
}

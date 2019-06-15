import { JWT } from '../api'
import { JWTToken as Token } from './JWT'

export { Token }

export interface Error {
  valid: false,
  status: 'Please log in'|'Token has expired'
}

async function LoginCheck(token: string|null): Promise<Token|Error> {
  if (!token) {
    return {
      valid: false,
      status: 'Please log in',
    }
  } else {
    try {
      const result = await JWT.verifyToken(token)
      return result
    } catch (error) {
      return {
        valid: false,
        status: 'Token has expired',
      }
    }
  }
}

export default LoginCheck

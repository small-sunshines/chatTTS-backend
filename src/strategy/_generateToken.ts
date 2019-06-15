import { JWT, sessToken } from '../api'

export default async (req: any, res: any) => {
  const token = await JWT.createToken(req.user) // create jwt token

  sessToken.setToken(res, token)

  res.redirect(process.env.homepage)
}

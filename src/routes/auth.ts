import { Router } from 'express'
import passport from 'passport'
import { JWT, LoginCheck, sessToken } from '../api'
import { Error, Token } from '../api/LoginCheck'
import * as db from '../db'

import { IOAuthUser } from '../api/jwt'
import { IOAuth } from '../db/model/oauth'
import * as auth from '../strategy'

const router = Router()

// passport auth configure
const configurePassport = (configure: {
  vendor: string,
  Strategy: any,
  strategyConfig: any,
  authOptions: any,
  callbackOptions: any
}) => {
  const {
    vendor,
    Strategy,
    strategyConfig,
    authOptions,
    callbackOptions,
  } = configure

  router.get(`/${vendor}`, passport.authenticate(vendor, authOptions))
  router.get(`/${vendor}/callback`, passport.authenticate(vendor, callbackOptions), auth._generateToken)

  passport.use(new Strategy(strategyConfig, auth._strategy(vendor)))
}

configurePassport(auth.twitch)
configurePassport(auth.google)

router.get('/check', async (req, res) => {
  try {
    const token = await LoginCheck(sessToken.getToken(req))

    if ((token as Error).status) {
      res.status(400)
        .json(token)
        .end()

      return
    } else {
      res.status(200)
        .json(token as Token)
        .end()

      return
    }
  } catch (error) {
    throw error
  }
})

router.get('/renew', async (req, res) => {
  try {
    let payload

    const token = await LoginCheck(sessToken.getToken(req))

    if (!(token as Error).status) {
      const [userInfo, oauth] = await Promise.all([
        db.User.findById((token as Token).id),
        db.OAuth.findByUserId((token as Token).id),
      ])

      if (userInfo) {
        const { id, nickname, isAdmin } = userInfo

        const oauthinfo: { [key: string]: IOAuthUser } = {};

        (oauth as IOAuth[]).forEach((value) => {
          oauthinfo[value.vendor] = {
            id: value.OAuthId,
            profilePhoto: value.profilePhoto,
            username: value.username,
            displayName: value.displayName,
          }
        })

        const jwtPayload = {
          id, nickname, isAdmin,
          auth: oauthinfo,
        }

        const refreshedToken = await JWT.createToken(jwtPayload) // create jwt token

        sessToken.setToken(res, refreshedToken)

        res.status(200)
          .json(await JWT.verifyToken(refreshedToken))
          .end()
      } else {
        payload = {
          error: true,
          message: 'user not found',
        }

        sessToken.removeToken(res)

        res.status(404)
          .json(payload)
          .end()
      }
    } else {
      payload = {
        error: true,
        message: 'Please log in',
      }

      sessToken.removeToken(res)

      res.status(404)
        .json(payload)
        .end()
    }

    res.jsonp(payload)
    res.end()
  } catch (error) {
    throw error
  }
})

router.get('/logout', async (req, res) => {
  try {
    sessToken.removeToken(res)

    res.redirect(302, process.env.homepage!)
  } catch (error) {
    throw error
  }
})
export default router

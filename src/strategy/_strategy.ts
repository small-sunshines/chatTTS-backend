import * as api from '../api'
import { Error, Token } from '../api/LoginCheck'
import * as db from '../db'
import { IUser } from '../db/model/user';

export default (vendor: string) => {
  return async (req: any, accessToken: string, refreshToken: string, profile: any, done: Function) => {
// tslint:disable-next-line: no-shadowed-variable
    function getProfilePhoto(profile: any, vendor: string): string {
      if (vendor === 'google') {
        return profile.picture
      } else if (vendor === 'twitch') {
        return profile._json.logo
      } else { return '' }
    }

// tslint:disable-next-line: no-shadowed-variable
    function getDisplayName(profile: any, vendor: string): string {
      if (vendor === 'google') {
        return profile.displayName
      } else if (vendor === 'twitch') {
        return profile.displayName
      } else { return '' }
    }
// tslint:disable-next-line: no-shadowed-variable
    function getUsername(profile: any, vendor: string): string {
      if (vendor === 'google') {
        return profile.displayName
      } else if (vendor === 'twitch') {
        return profile.username
      } else { return '' }
    }

    let payload: any

    const query = await db.OAuth.findByOAuth(profile.id, vendor)

    if (query) {
      await db.OAuth.updateUser(profile.id, vendor, {
        AccessToken: accessToken,
        RefreshToken: refreshToken,
        username: getUsername(profile, vendor),
        profilePhoto: getProfilePhoto(profile, vendor),
      })

      const [oauth, user] = await Promise.all([
        db.OAuth.findByUserId(query.userId),
        db.User.findById(query.userId),
      ])

      payload = {
        id: (user as IUser).id,
        nickname: (user as IUser).nickname,
        isAdmin: (user as IUser).isAdmin,
        auth: {},
      }

      oauth!.forEach((value, index, array) => {
        payload.auth[value.vendor] = {
          id: value.OAuthId,
          profilePhoto: value.profilePhoto,
          username: value.username,
          displayName: value.displayName,
        }
      })
    } else {
      const token = api.sessToken.getToken(req)

      const parsedToken = await api.LoginCheck(token)

      if (!token && !(parsedToken as Error).valid) {

// tslint:disable-next-line: no-shadowed-variable
        const query = await db.User.create(getDisplayName(profile, vendor))

        await db.OAuth.createUser({
          userId: query.id,
          OAuthId: profile.id,
          AccessToken: accessToken,
          RefreshToken: refreshToken,
          profilePhoto: getProfilePhoto(profile, vendor),
          username: getUsername(profile, vendor),
          displayName: getDisplayName(profile, vendor),
          vendor,
        })

        payload = {
          id: query.id,
          nickname: query.nickname,
          isAdmin: query.isAdmin,
          auth: {},
        }

        payload.auth[vendor] = {
          id: profile.id,
          profilePhoto: getProfilePhoto(profile, vendor),
          username: getUsername(profile, vendor),
          displayName: getDisplayName(profile, vendor),
        }
      } else {
        await db.OAuth.createUser({
          userId: (parsedToken as Token).id,
          OAuthId: profile.id,
          AccessToken: accessToken,
          RefreshToken: refreshToken,
          username: getUsername(profile, vendor),
          displayName: getDisplayName(profile, vendor),
          profilePhoto: getProfilePhoto(profile, vendor),
          vendor,
        })

        payload = {
          id: (parsedToken as Token).id,
          nickname: (parsedToken as Token).nickname,
          isAdmin: (parsedToken as Token).isAdmin,
          auth: {},
        }

        for (const key in (parsedToken as Token).auth) {
          if (key) {
            payload.auth[key] = {
              id: (parsedToken as Token).auth[key].id,
              profilePhoto: (parsedToken as Token).auth[key].profilePhoto,
              username: (parsedToken as Token).auth[key].username,
              displayName: (parsedToken as Token).auth[key].displayName,
            }
          }
        }

        payload.auth[vendor] = {
          id: profile.id,
          profilePhoto: getProfilePhoto(profile, vendor),
          username: getUsername(profile, vendor),
          displayName: getDisplayName(profile, vendor),
        }
      }
    }

    done(null, payload)
  }
}

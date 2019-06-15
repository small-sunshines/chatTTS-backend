import axios from 'axios'
import { AxiosRequestConfig } from 'axios'
import * as db from '../db'
import { IOAuthWithUser } from '../db/model/oauth';

class GetAccessToken {
  public async get(oauthId: string, vendor: string) {
    try {
      const query = await db.OAuth.findByOAuth(oauthId, vendor)

      if (query && new Date().getTime() > query.updatedAt.getTime() + 3600000) {
        return await this.renew({
          vendor,
          oauthId,
          refreshToken: query.RefreshToken,
        })
      } else {
        return (query as IOAuthWithUser).AccessToken
      }
    } catch (error) {
      throw error
    }
  }

  private async renew(info: {
    vendor: string,
    refreshToken: string,
    oauthId: string
  }): Promise<string> {
    const { vendor, refreshToken, oauthId } = info

    const config: AxiosRequestConfig = {
      method: 'POST',
      data: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
    }

    if (vendor === 'twitch') {
      config.url = 'https://id.twitch.tv/oauth2/token'
      config.data.client_id =  process.env.twitch_id!
      config.data.client_secret =  process.env.twitch_secret!
    } else if (vendor === 'google') {
      config.url = 'https://www.googleapis.com/oauth2/v4/token'
      config.data.client_id =  process.env.youtube_id!
      config.data.client_secret =  process.env.youtube_secret!
    } else {
      throw new Error(`${vendor} is not undeclared vendor`)
    }

    try {
      const data = await axios(config)

      const { access_token } = data.data

      await db.OAuth.updateUser(oauthId, vendor, {
        AccessToken: access_token,
      })

      return access_token
    } catch (error) {
// tslint:disable-next-line: no-console
      console.log(error)
      throw error
    }
  }
}

export default new GetAccessToken()

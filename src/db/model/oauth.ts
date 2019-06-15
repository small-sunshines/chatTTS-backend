// import redis from '../_redis'
import db from '../table'

const SUCCESS = true

class OAuth {
  public static async findByUserId(userId: string): Promise<IOAuth[]|undefined> {
    const payload = {
      where: { userId },
    }
    const oauth = await db.OAuth.findAll(payload)

    return (!!oauth) && oauth.map((node) => node.toJSON() as IOAuth)

    // help with https://stackoverflow.com/a/42007460/11516704
  }

  public static async findByOAuth(OAuthId: string, vendor: string): Promise<IOAuthWithUser|undefined> {
    const payload = {
      where: { OAuthId, vendor },
      include: [{ model: db.User, attributes: [
        'nickname', 'isAdmin',
      ]}],
    }
    const oauth = await db.OAuth.findOne(payload)

    return oauth ? oauth.toJSON() as IOAuthWithUser : undefined
  }

  public static async createUser(user: {
    userId: string,
    OAuthId: string,
    vendor: string,
    AccessToken: string,
    RefreshToken: string,
    username: string,
    displayName: string,
    profilePhoto: string
  }): Promise<boolean> {

    const payload = {
      userId: user.userId,
      OAuthId: user.OAuthId,
      vendor: user.vendor,
      AccessToken: user.AccessToken,
      RefreshToken: user.RefreshToken,
      username: user.username,
      displayName: user.displayName,
      profilePhoto: user.profilePhoto,
    }

    await db.OAuth.create(payload)

    return SUCCESS
  }

  public static async updateUser(OAuthId: string, vendor: string, update: {
    AccessToken?: string,
    RefreshToken?: string,
    username?: string,
    displayName?: string,
    profilePhoto?: string
  }): Promise<boolean> {
    const updateData: { [key: string]: string } = {}

    if (update.AccessToken) { updateData.AccessToken = update.AccessToken }
    if (update.RefreshToken) { updateData.RefreshToken = update.RefreshToken }
    if (update.username) { updateData.username = update.username }
    if (update.displayName) { updateData.displayName = update.displayName }
    if (update.profilePhoto) { updateData.profilePhoto = update.profilePhoto }

    await db.OAuth.update(updateData, {
      where: {
        OAuthId,
        vendor,
      },
    })

    return SUCCESS
  }
}

export default OAuth

export interface IOAuth {
  OAuthId: string,
  AccessToken: string,
  RefreshToken: string,
  username: string,
  displayName: string,
  vendor: string,
  profilePhoto: string,
  userId: string,
  createdAt: Date,
  updatedAt: Date
}

export interface IOAuthWithUser extends IOAuth {
  nickname: string,
  isAdmin: boolean
}

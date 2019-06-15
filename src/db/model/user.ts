// import redis from '../_redis'
import table from '../table'

const SUCCESS = true

class User {
  public static async findById(id: string): Promise<IUser|undefined> {
    const payload = {
      where: { id },
    }
    const user = await table.User.findOne(payload)

    return user ?  user.toJSON() as IUser : undefined
  }

  public static async create(nickname: string ): Promise<IUser> {
    const payload = {
      nickname,
    }

    const data = await table.User.create(payload)

    return data.toJSON() as IUser
  }

  public static async delete(id: string): Promise<boolean> {
    const payload = {
      where: { id },
    }

    await table.User.destroy(payload)

    return SUCCESS
  }

  public static async setAdmin(id: string): Promise<boolean> {
    const payload = {
      where: { id },
    }
    const updateData = {
      isAdmin: true,
    }

    await table.User.update(updateData, payload)
    return SUCCESS
  }

  public static async unSetAdmin(id: string): Promise<boolean> {
    const payload = {
      where: { id },
    }
    const updateData = {
      isAdmin: false,
    }

    await table.User.update(updateData, payload)
    return SUCCESS
  }
}

export default User

export interface IUser {
  id: string,
  nickname: string,
  isAdmin: boolean,
  createdAt: number,
  updatedAt: number
}

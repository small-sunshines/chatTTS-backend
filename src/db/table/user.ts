import * as Sequelize from 'sequelize'
import sequelize from '../_mariadb'

class User extends Sequelize.Model {}

User.init({
  id: {
    allowNull: false,
    primaryKey: true,
    type: Sequelize.UUID,
    unique: true,
    defaultValue: Sequelize.UUIDV4
  },
  nickname: {
    allowNull: false,
    type: Sequelize.STRING(10),
    unique: false
  },
  isAdmin: {
    allowNull: false,
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  timestamps: true
})

export default User
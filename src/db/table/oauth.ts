import * as Sequelize from 'sequelize'
import sequelize from '../_mariadb'

class OAuth extends Sequelize.Model {}

OAuth.init({
  OAuthId: {
    type: Sequelize.STRING(128),
    allowNull: false,
    unique: false
  },
  AccessToken: {
    type: Sequelize.STRING(255),
    allowNull: false,
    unique: false
  },
  RefreshToken: {
    type: Sequelize.STRING(255),
    allowNull: false,
    unique: false,
  },
  username: {
    type: Sequelize.STRING(20),
    allowNull: false,
    unique: false,
  },
  displayName: {
    type: Sequelize.STRING(20),
    allowNull: false,
    unique: false
  },
  profilePhoto: {
    type: Sequelize.STRING(255),
    allowNull: false,
    unique: false
  },
  vendor: {
    type: Sequelize.STRING(10),
    allowNull: false,
    unique: false
  }
}, {
  sequelize,
  timestamps: true
})

export default OAuth
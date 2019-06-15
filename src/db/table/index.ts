import db from '../_mariadb'

import user from './user'
import oauth from './oauth'

const tables = {
  User: user,
  OAuth: oauth
}

tables.User.hasMany(tables.OAuth, {
  foreignKey: 'userId'
})

tables.OAuth.belongsTo(tables.User, {
  foreignKey: 'userId'
})

db.sync()

export default tables
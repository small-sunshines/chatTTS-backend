import { Sequelize } from "sequelize"

const db = new Sequelize(process.env.mysql_db!,
  process.env.mysql_user!,
  process.env.mysql_pw!,
  {

    dialect: "mariadb",
    host: process.env.mysql_host!,
    port: parseInt(process.env.mysql_port!),
    logging: false,
    pool: {
      acquire: 30000,
      idle: 10000,
      max: 5,
      min: 0,
    },
    dialectOptions: {
      timezone: 'Etc/GMT+9'
    }
  })

export default db

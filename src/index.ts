import bodyParser from 'body-parser'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import log4js from 'log4js'
import onFinished from 'on-finished'
import passport from 'passport'
import path from 'path'

import 'express-async-errors'

// Initialize Configure
dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})

// Initialize Logger
const logger = log4js.getLogger()

// Configure Logger
if (!(process.env.dev as unknown as boolean)) {
  logger.level = 'DEBUG'
} else {
  logger.level = 'INFO'
}

// Require Routers

import * as routes from './routes'

// Configure Express server
const app: express.Express = express()

app.use(cors({
  origin: process.env.homepage!,
  optionsSuccessStatus: 200,
  credentials: true,
}))
app.use(compression())
app.use(bodyParser.json())
app.use(cookieParser())
app.use(passport.initialize())

// health moniter
app.all('/health', (req, res) => {
  res.status(200).send().end()
})

// logger setup
app.use((req, res, next) => {
// tslint:disable-next-line: no-shadowed-variable
  onFinished(res, (err, res) => {
    if (err) {
      logger.error(err)
    }
    logger.info(req.protocol + ' ' + req.method + ' ' + res.statusCode + ' ' + req.ip + ' ' + req.originalUrl)
  })
  next()
})

// Add server routing
app.use('/auth', routes.auth)
app.use('/api', routes.api)


// Run the server
const host: string = process.env.HOST || '0.0.0.0'
const port: number = Number(process.env.PORT) || 3001

app.listen(port, host, () => {
  logger.info(`HTTP server listen on http://${host}:${port}`)
})

export default app

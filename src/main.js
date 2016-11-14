import CookieSession from 'cookie-session'
import SignalingServer from './signaling'
import WebServer from './web'
import config from './config'

const sessHandler = CookieSession({
  name: config.SESSION_KEY,
  secret: config.SECRET,
})

const webserver = new WebServer(config, sessHandler).start()
const signaling = new SignalingServer(config, sessHandler, webserver.server).start()

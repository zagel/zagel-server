import CookieSession from 'cookie-session';
import SignalingServer from './signaling';
import WebServer from './web';
import config from './config';

var sessHandler = CookieSession({
  name: config.SESSION_KEY,
  secret: config.SECRET,
});

var webserver = new WebServer(config, sessHandler).start();
var signaling = new SignalingServer(config, sessHandler, webserver.server).start();

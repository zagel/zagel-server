import Promise from 'bluebird'
import WebSocket from 'ws'
import ConnectionManager from './connection-manager'

const PONG = JSON.stringify({ pong: true })

export default class SignalingServer {
  constructor(config, sessHandler, server) {
    this.config = config
    this.server = server
    this.connManager = new ConnectionManager()
    this.sessHandler = Promise.promisify(sessHandler)
  }

  start() {
    this.socket = new WebSocket.Server({ server: this.server })
    console.log('Socket attached to the web server')
    this.socket.on('connection', this.onConnection.bind(this))
    return this
  }

  onConnection(ws) {
    var req = ws.upgradeReq
    var res = {} // Hack required for the session handler to work.
    this.sessHandler(req, res).then(() => {
      if (!req.session.user) {
        throw new Error("User not authenticated")
      }
      // Attach the session to the ws connection.
      ws.session = req.session
      this.userConnected(ws)
    }).catch(err => ws.close())
  }

  userConnected(ws) {
    var user = ws.session.user
    console.log('Socket connected:', user.id)
    this.connManager.add(user, ws)
    ws.on('message', msg => {
      msg = JSON.parse(msg)
      if (msg.ping) {
        // Respond to pings.
        ws.send(PONG)
      } else {
        this.onMessage(msg, user)
      }
    })

    this.sendLiveUpdate()
    ws.on('close', () => {
      this.connManager.remove(user, ws)
      this.sendLiveUpdate()
    })
  }

  /**
   * Notify all users that a new user is connected or disconnected.
   */
  sendLiveUpdate() {
    console.log('Sending live update...')
    const users = this.connManager.getConnectedUsers()
    users.forEach(user => {
      const filteredUsers = users.filter(u => u.id !== user.id)
      const msg = { type: 'live', data: filteredUsers }
      this.connManager.send(user, msg)
    })
  }

  onMessage(msg, user) {
    var to = msg.to
    delete msg.to

    msg.from = user
    // Forward the message to the corresponding user.
    this.connManager.send(to, msg)
  }
}

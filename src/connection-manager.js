export default class ConnectionManager {
  constructor() {
    // Keeps a list of connections for each user ID.
    this._map = {};
    // Keeps user objects mapped by ID.
    this._users = {};
  }

  add(user, ws) {
    this._users[user.id] = user;
    var pool = this._map[user.id] = this.getUserPool(user.id);
    pool.push(ws);
  }

  remove(user, ws) {
    var pool = this.getUserPool(user.id);
    var index = pool.indexOf(ws);
    if (index > -1) {
      console.log('Removing a connection from:', user.id);
      pool.splice(index, 1);
    }
  }

  send(to, msg) {
    var connections = this._map[to.id];
    // The `to` user is not connected to the server.
    if (!connections || !connections.length) {
      return false;
    }
    msg = JSON.stringify(msg);
    connections.forEach(ws => ws.send(msg));
  }

  getUserPool(userID) {
    return this._map[userID] || [];
  }

  getConnectedUsers() {
    return Object.keys(this._map)
      .filter(id => this.getUserPool(id).length > 0)
      .map(id => this._users[id]);
  }
}

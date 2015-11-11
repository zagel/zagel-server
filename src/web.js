import Express from 'express';

export default class WebServer {
  constructor(config, sessHandler) {
    this.config = config;
    this.sessHandler = sessHandler;
    this._setup();
  }

  start() {
    this.server = this.app.listen(this.config.PORT);
    console.log('Server listening on', this.config.PORT);
    return this;
  }

  routes() {
    return [
      {method: 'get', path: '/auth', handler: this.auth},
    ];
  }

  _setup() {
    this.app = Express();
    this.app.use(this.sessHandler);
    this._setupRoutes(this.routes());
  }

  _setupRoutes(routes) {
    routes.forEach(route => {
      // this.app['get']('/path', func.bind(this))
      this.app[route.method](route.path, route.handler.bind(this));
    });
  }

  // Route handlers.
  auth(req, res) {
    var username = req.query.username;
    if (username) {
      console.log('Authenticated user:', username);
      req.session.user = {id: username, name: username};
      res.json({success: true});
    } else {
      console.log('Failed to authenticate: no username');
      res.json({success: false});
    }
  }
}

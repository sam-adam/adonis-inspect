'use strict';

const { ServiceProvider } = require('@adonisjs/fold');

class InspectProvider extends ServiceProvider {
  isEnabled = false;

  _registerRequestLogger () {
    const Config = this.app.use('Config');
    const Helpers = this.app.use('Helpers');
    const appRoot = Helpers.appRoot();
    const inspectDir = `${appRoot}/${Config.get('inspect.dir')}`

    this.app.singleton('AdonisInspect/Middleware/RequestLogger', () => require('../src/Middleware/RequestLogger'));
    this.app.bind('inspect.dir', () => inspectDir);
  }

  _registerControllers () {
    this.app.bind('App/Controllers/Http/InspectController', () => {
      const InspectController = require('../src/Controllers/Http/InspectController');
      return new InspectController();
    });
  }

  _registerViews () {
    this.app.singleton('InspectView', (app) => {
      const fs = require('fs');
      const Helpers = app.use('Adonis/Src/Helpers');
      const Config = app.use('Adonis/Src/Config');
      const View =  require('@adonisjs/framework/src/View');
      
      const inspectView = new View(Helpers, Config.get('app.views.cache'));

      inspectView.engine.registerViews(__dirname + '/../resources/views');
      inspectView.global('tailwindcss', fs.readFileSync(__dirname + '/../public/css/main.css'));
      inspectView.global('jsonify', function (obj) {
        return JSON.stringify(obj);
      });
      inspectView.global('formatQuery', function (query) {
        const { format } = require('sql-formatter');

        return format(query, {language: 'mysql'});
      });
      inspectView.global('shortDate', function (dateStr) {
        const options = {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        };

        const date = new Date(dateStr);
        const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

        return formattedDate;
      });

      return inspectView;
    });
  }

  _registerCommands () {
    this.app.bind('Adonis/Commands/InspectCleanCommand', () => require('../src/Commands/CleanCommand'));
  }

  /** 
   * Register bindings
   *
   * @method register
   *
   * @return {void}
   */
  register () {
    const Config = this.app.use('Config');

    this.isEnabled = Config.get('inspect.enabled', false);

    if (this.isEnabled) {
      this._registerRequestLogger();
      this._registerControllers();
      this._registerViews();
      this._registerCommands();
    }
  }

  /** 
   * On boot add command with ace
   *
   * @method boot
   *
   * @return {void}
   */
  async boot () {
    if (this.isEnabled) {
      const Server = this.app.use('Server');
      const Route = use('Route');
      const ace = require('@adonisjs/ace')

      ace.addCommand('Adonis/Commands/InspectCleanCommand');
      Server.registerGlobal(['AdonisInspect/Middleware/RequestLogger']);
      Route.group(() => {
        Route.get('/', 'InspectController.index');
        Route.get('/:id', 'InspectController.show');
      }).prefix('_inspect') 
    }
  }
}

module.exports = InspectProvider;

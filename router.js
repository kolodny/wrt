var React = require('react');
var helpers = require('./utils');

const PATH = 1;
const QUERY = 2;
const HASH_PATH = 3;
const HASH_QUERY = 4;

var Router = module.exports = React.createClass({
  getInitialState: function() {
    return {
      data: this.props.data,
      root: this.normalizePath(this.props.root),
      route: null,
      oldRoute: null,
      routes: {},
      location: this.props.location || window.location,
    };
  },
  getContext: function(fragment) {
    var context;
    switch(fragment[0]) {
      case '/': context = PATH;  break;
      case '?': context = QUERY; break;
      case '#': context = fragment[1] === '?' ? HASH_QUERY : HASH_PATH; break;
      default: throw new Error("Can't get url context");
    }
    return context;
  },
  getLocationKey: function(fragment) {
    var locationKey;
    if (fragment[0] === '#' && fragment[1] === '?') {
      locationKey = fragment.substr(2);
    } else {
      locationKey = fragment.substr(1);
    }
    return locationKey;
  },
  normalizePath: function(path) {
    return '/' + (path || '').replace(/^\//, '');
  },
  linkRoute: function(normalizedPath) {
    return normalizedPath;
  },
  getRouteFromLocation: function(location) {
    var routes = this.state.routes;
    location = location.toString();
    for (var route in routes) {
      if (Object.hasOwnProperty.call(routes, route)) {
        var routeObj = this.state.routes[route];
        if (routeObj.regex.test(location)) {
          return routeObj.Route // the jsx object
        }
      }
    }
    return this.state.defaultRoute;
  },
  setupHashchange: function() {
    if ("onhashchange" in window) {
      window.addEventListener('hashchange', this.onHashchange);
    } else {
      console.error("browser doesn't support hashchange")
    }
  },
  onHashchange: function() {
    this.forceUpdate();
  },
  globToRegex: function(glob) {
    var namedGoups = [];
    var regex = RegExp('^' + glob.replace(/\//g, '\\/').replace(/:(\w+)/g, function(all, namedGoup) {
        namedGoups.push(namedGoup);
        return '([^\\/]+)';
    }) + '$');
    return {regex, namedGoups};
  },
  componentWillMount: function() {
    var routes = {};
    var context = this.getContext(this.props.root || '/');
    var locationKey = this.getLocationKey(this.props.root || '/');
    var defaultRoute;
    React.Children.forEach(this.props.children, function(child) {
      var normalizedPath = this.normalizePath(child.props.path);
      var {regex, namedGoups} = this.globToRegex(normalizedPath);

      var route = {
        href: '#' + this.linkRoute(normalizedPath),
        linkLocation: this.linkRoute(normalizedPath),
        regex: regex,
        namedGoups: namedGoups,
        Route: child,
      };
      routes[child.props.name || normalizedPath.substr(1) || '/'] = route;
      if (child.props.default) {
        defaultRoute = child
      }
    }, this);

    var updatedState = {
      routes: routes,
      context: context,
      locationKey: locationKey,
    }
    if (defaultRoute) {
      updatedState.defaultRoute = defaultRoute;
    }
    if (context === QUERY || context == HASH_QUERY) {
      updatedState.pathRegex = RegExp('((?:^|[&?])' + locationKey + '=)([^&]*)')
    }
    this.setState(updatedState);
    this.setupHashchange();
  },
  componentDidMount: function() {
    console.log('mounted Router');
  },
  componentWillUnmount: function() {
    console.log('unmounting Router');
  },
  renderRoute: function(Route) {
    return React.addons.cloneWithProps(Route, {
      routes: this.state.routes,
      linkTo: this.linkTo
    });
  },
  linkTo: function(route) {
    return function(e) {
      this.setLocation(this.state.routes[route])
      e.preventDefault();
    }.bind(this);
  },
  changePath: function(path, key, newValue) {
    var regex = RegExp('((?:^|&)' + key + '=)[^&]*');
    var newPath;
    var appender;
    if (regex.test(path)) {
      newPath = path.replace(regex, '$1' + newValue);
    } else {
      appender = path.indexOf('?') > -1 ? '&' : '?';
      newPath = path + appender + key + '=' + newValue;
    }
    return newPath;
  },
  setLocation: function(route) {
    var locationState = this.state.location;
    var context = this.state.context;
    var locationKey = this.state.locationKey;
    var newHash;
    if (this.props.locationHandler) {
      return this.props.locationHandler(route);
    } else {
      if (context === QUERY || context === PATH) {
        console.error('not implemented yet');
        return;
      }
      if (context === HASH_QUERY) {
        // console.error('not implemented yet');
        // return;
        newHash = this.getHash(locationState).substr(1);
        newHash = this.changePath(newHash, locationKey, route.linkLocation);
        this.setHash(locationState, '#' + newHash);
        // location.hash = location.hash.replace()
      } else if (context === HASH_PATH) {
        this.setHash(locationState, route.linkLocation);
      } else {
        console.error('unknow routing context')
      }
    }
  },
  getLocation: function() {
    var ret;
    var locationState = this.state.location;
    var context = this.state.context;
    var locationKey = this.state.locationKey;
    var href;
    var matches;
    if (this.props.locationHandler) {
      ret = this.props.locationHandler();
    } else {
      if (context === HASH_PATH || context === HASH_QUERY) {
        href = this.getHash(locationState).substr(1);
      } else {
        href = locationState.href;
      }
      if (matches = this.state.pathRegex.exec(href)) {
        ret = matches[2];
      } else {
        ret = '';
      }
    }
    return ret;
  },

  render: function() {
    var Route = this.getRouteFromLocation(this.getLocation());
    return this.renderRoute(Route)
  },

});

Router.createClass = function(Rter) {
  return React.createClass({
    render: function() {
      return <Router {...Rter.props} {...this.props} />;
    }
  })
};

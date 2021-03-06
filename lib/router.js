"use scrict";

var React = require('react/addons');
var xurl = require('xurl');
var utils = require('./utils');

const PATH = 1;
const QUERY = 2;
const HASH_PATH = 3;
const HASH_QUERY = 4;

var Router = module.exports = React.createClass({
  getInitialState: function() {
    var locationProp = this.props.location;
    var globalLocation = global.location;
    var isUsingGlobalLocation = false;
    var root = this.normalizePath(this.props.root);

    if (locationProp && locationProp === globalLocation) {
      isUsingGlobalLocation = true;
    } else if (!locationProp && globalLocation) {
      isUsingGlobalLocation = true;
    } else if (!locationProp) {
      locationProp = {href: '/'};
    }
    if (isUsingGlobalLocation) {
      if (!globalLocation.wrtLocation) {
        globalLocation.wrtLocation = utils.extend(globalLocation);
      }
      locationProp = globalLocation.wrtLocation;
    }

    return {
      data: this.props.data,
      root: root,
      rootRegex: RegExp('^' + root.replace(/\//g, '\\/')),
      route: null,
      oldRoute: null,
      routes: {},
      isUsingGlobalLocation: isUsingGlobalLocation,
      location: locationProp
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
  linkRoute: function(normalizedPath, context) {
    debugger;
    var locationObj = xurl(this.state.location.href);
    context = this.state.context || context;
    if (context === HASH_PATH) {
      locationObj.hash = this.state.root.slice(0, -1) + normalizedPath;
      return utils.makeURL(locationObj);
    } else if (context === PATH) {
      locationObj.pathname = this.state.root.slice(0, -1) + normalizedPath;
      return utils.makeURL(locationObj);
    } else {
      console.info('not implemented yet');
    }
  },
  getRouteFromLocation: function(locationHref) {
    var routes = this.state.routes;
    for (var route in routes) {
      if (Object.hasOwnProperty.call(routes, route)) {
        var routeObj = this.state.routes[route];
        if (routeObj.regex.test(locationHref)) {
          return routeObj;
        }
      }
    }
    return this.state.defaultRoute;
  },
  setupHashchange: function() {
    if ("onhashchange" in global) {
      addEventListener('hashchange', this.onHashchange);
    } else {
      console.info("browser doesn't support hashchange");
    }
  },
  setupPopstate: function() {
    if ("onpopstate" in global) {
      addEventListener('popstate', this.onPopstate);
    } else {
      console.info("browser doesn't support popstate");
    }
  },
  onHashchange: function() {
    this.forceUpdate();
  },
  onPopstate: function() {
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
        href: this.linkRoute(normalizedPath, context),
        regex: regex,
        namedGoups: namedGoups,
        Route: child,
      };
      routes[child.props.name || normalizedPath.substr(1) || '/'] = route;
      if (child.props.default) {
        defaultRoute = child;
      }
    }, this);

    var updatedState = {
      routes: routes,
      context: context,
      locationKey: locationKey,
    };
    if (defaultRoute) {
      updatedState.defaultRoute = defaultRoute;
    }
    if (context === QUERY || context == HASH_QUERY) {
      updatedState.pathRegex = RegExp('((?:^|[&?])' + locationKey + '=)([^&]*)');
    }
    this.setState(updatedState);

    if (this.state.isUsingGlobalLocation) {
      if (context === HASH_PATH) {
        console.log('setting up hash path!!!!!')
        this.setupHashchange();
      } else if (context === PATH) {
        this.setupPopstate();
      }
    }

    if (typeof location === 'object' && location === this.state.locaton) {
      this.setupHashchange();
    }

    if (typeof location === 'object' && location === this.state.locaton) {
      addEventListener('foo', 'bar');
    }
  },
  componentDidMount: function() {
    console.log('mounted Router');
  },
  componentWillUnmount: function() {
    console.log('unmounting Router');
  },
  renderRoute: function(Route, extendedProps) {
    extendedProps.routes = this.state.routes;
    extendedProps.linkTo = this.linkTo;
    return React.addons.cloneWithProps(Route, extendedProps);
  },
  linkTo: function(route, values) {
    return function(e) {
      this.setLocation(this.state.routes[route], values);
      e.preventDefault();
    }.bind(this);
  },
  setLocation: function(route, args) {
    var locationState = this.state.location;
    var context = this.state.context;
    // var locationKey = this.state.locationKey;
    var locationObj = xurl(locationState.href);
    var newLocationState;
    var newHref = route.href.replace(/:([a-z]\w+)/gi, (all, name) => args[name]);
    if (this.props.locationHandler) {
      return this.props.locationHandler(locationObj, route);
    } else {
      if (context === HASH_PATH) {
        locationState.href = newHref;
      } else if (context === PATH) {
        locationState.href = newHref;
      } else {
        console.info('not implemented yet');
      }
      this.setState({location: locationObj});
      if (this.state.isUsingGlobalLocation) {
        if (context === HASH_PATH) {
          location.hash = xurl(locationState.href).hash;
        } else if (context === PATH) {
          history.pushState({}, '', newHref);
        }
      }
    }
  },
  getLocation: function() {
    var result;
    var locationState = this.state.isUsingGlobalLocation ? global.location : this.state.location;
    var context = this.state.context;
    var rootRegex = this.state.rootRegex;

    // var locationKey = this.state.locationKey;
    var locationObj = xurl(locationState.href);
    if (this.props.locationHandler) {
      result = this.props.locationHandler(locationObj);
    } else {
      if (context === HASH_PATH) {
        result = locationObj.hash.substr(1).replace(rootRegex, '/');
      } else if (context === PATH) {
        result = locationObj.pathname.replace(rootRegex, '/');
      } else {
        console.info('not yet implemented');
      }
    }
    return result || '/';
  },

  render: function() {
    var location = this.getLocation();
    var RouteObj = this.getRouteFromLocation(location);
    var props = {};
    var groupNames = RouteObj.namedGoups.slice();
    var matches = RouteObj.regex.exec(location);
    groupNames.forEach(function(groupName, i) {
      props[groupName] = matches[i + 1];
    });
    return this.renderRoute(RouteObj.Route, props);
  },

});

Router.createClass = function(Rter) {
  return React.createClass({
    render: function() {
      return <Router {...Rter.props} {...this.props} />;
    }
  });
};

require('../../test-setup');
var assert = require('assert');
var React = require('react');
var wrt = require('../..');

var Router = wrt.Router;
var Route = wrt.Route;

var theGlobal = Function('return this')() || (42, eval)('this');

describe('A basic path router', function() {
  describe('when embedded directly on the DOM', function() {

    describe('when the location is "http://www.google.com/"', function() {
      var routerElement;
      var router;

      beforeEach(function() {
        routerElement = (
          <Router root="/" location={{href:'http://www.google.com/'}}>
            <Route path="/" handler={function() { return <h1>Root</h1>; }} />
            <Route path="/sub" handler={function() { return <h2>Sub</h2>; }} />
          </Router>
        );
        router = React.render(routerElement, document.body);
      });

      afterEach(function(done) {
        React.unmountComponentAtNode(document.body);
        setTimeout(done);
      });

      it('should default to the root route', function() {
        assert.equal(router.getDOMNode().textContent, 'Root');
      });

      it('should change routes when the location changes', function() {
        var newLocation = { href: 'http://www.google.com/sub' };
        router.setState({location: newLocation});
        assert.equal(router.getDOMNode().textContent, 'Sub');
      });

    });

    describe('when the location is "http://www.google.com/sub"', function() {
      var routerElement;
      var router;

      beforeEach(function() {
        routerElement = (
          <Router root="/" location={{href:'http://www.google.com/sub'}}>
            <Route path="/" handler={function() { return <h1>Root</h1>; }} />
            <Route path="/sub" handler={function() { return <h2>Sub</h2>; }} />
          </Router>
        );
        router = React.render(routerElement, document.body);
      });

      afterEach(function(done) {
        React.unmountComponentAtNode(document.body);
        setTimeout(done);
      });

      it('should go to the sub route', function() {
        assert.equal(router.getDOMNode().textContent, 'Sub');
      });

      it('should change routes when the location changes', function() {
        var newLocation = { href: 'http://www.google.com/' };
        router.setState({location: newLocation});
        assert.equal(router.getDOMNode().textContent, 'Root');
      });

    });

    describe('when the location is the global `location`', function() {
      var oldAddEventListener = theGlobal.addEventListener;
      var calledInfo;
      var routerElement;
      var router;
      beforeEach(function() {
        if (!theGlobal.location) {
          theGlobal.location = { href: 'http://www.google.com/' };
        }
        calledInfo = { called: 0 };
        global.onpopstate = null;
        global.addEventListener = function() {
          calledInfo.args = arguments;
          calledInfo.called++;
        };

        routerElement = (
          <Router><Route handler={function() { return <br /> }} /></Router>
        );
        router = React.render(routerElement, document.body);

      });

      afterEach(function(done) {
        theGlobal.addEventListener = oldAddEventListener;
        React.unmountComponentAtNode(document.body);
        setTimeout(done);
      });

      it('set up a hashchange event listener', function() {
        assert(calledInfo.called, 1);
        assert(calledInfo.args[0] === 'popstate');
      });

    });

  });

});


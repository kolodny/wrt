require('../test-setup');
var assert = require('assert');
var React = require('react');
var wrt = require('..');

var Router = wrt.Router;
var Route = wrt.Route;

describe('A basic router', function() {
  describe('when embedded directly on the DOM', function() {
    var routerElement;
    var router;

    beforeEach(function() {
      routerElement = (
        <Router location={{href:'http://www.google.com/'}}>
          <Route path="/" handler={function() { return <h1>Root</h1> }} />
          <Route path="/sub" handler={function() { return <h2>Sub</h2> }} />
        </Router>
      );
      router = React.render(routerElement, document.body);
    });

    afterEach(function(done) {
      React.unmountComponentAtNode(document.body);
      setTimeout(done);
    });

    it('should default to the root route', function() {
      console.log('!', router.getDOMNode().outerHTML, '!');
    });

  });
});


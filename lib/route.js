var React = require('react');
var helpers = require('./helpers');

module.exports = React.createClass({
  render: function() {
    var R = this.props.handler;
    var props = this.props;
    var routes = this.props.routes;

    if (helpers.isReactClass(R)) {
      return <R {...props} />
    } else {
      return R(props);
    }
  }
});

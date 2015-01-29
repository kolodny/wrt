var wrt = require('wrt');
var React = require('react');

var Router = wrt.Router;
var Route = wrt.Route;

var Index = React.createClass({
  render: function () {
    return (
      <div>
        <p>This is the index route</p>
        {
          [15, 16, 17].map(userId => {
            return (
              <p>
                <a href="#" onClick={ this.props.linkTo('editUser', {userId: userId}) }>
                  Edit user {userId}
                </a>
              </p>
            );
          })
        }
      </div>
    );
  }
});

var editUser = React.createClass({
  render: function() {
    return (
      <div>
        <p>You are editing user {this.props.userId}</p>
        <a href="#" onClick={this.props.linkTo('root')}>Go home</a>
      </div>
    );
  }
});

React.render(
  <Router root="#/">
    <Route name="root" path="/" handler={Index} />
    <Route name="editUser" path="/edit/:userId" handler={editUser} />
  </Router>,
  document.body
);

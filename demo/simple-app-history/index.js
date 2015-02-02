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
              <div>
                <p>
                  <a href="#" onClick={ this.props.linkTo('editUser', {userId: userId}) }>
                    Edit user {userId}
                  </a>
                </p>
                <p>
                  <a href="#" onClick={ this.props.linkTo('editUserAddress', {userId: userId, addressId: 3}) }>
                    Edit user {userId}'s Address
                  </a>
                </p>
              </div>
            );
          })
        }
      </div>
    );
  }
});

var EditUser = React.createClass({
  render: function() {
    return (
      <div>
        <p>You are editing user {this.props.userId}</p>
        <a href="#" onClick={this.props.linkTo('root')}>Go home</a>
      </div>
    );
  }
});

var EditUserAddress = React.createClass({
  render: function() {
    return (
      <div>
        <p>You are editing user {this.props.userId}, address {this.props.addressId}</p>
        <a href="#" onClick={this.props.linkTo('root')}>Go home</a>
      </div>
    );
  }
});

React.render(
  <Router root="/simple-app-history/">
    <Route name="root" path="/" handler={Index} />
    <Route name="editUser" path="/edit/:userId" handler={EditUser} />
    <Route name="editUserAddress" path="/edit/:userId/address/:addressId" handler={EditUserAddress} />
  </Router>,
  document.body
);

wrt
===

A simple React router

[![Build Status](https://travis-ci.org/kolodny/wrt.svg?branch=master)](https://travis-ci.org/kolodny/wrt)

usage:


```js
var React = require('react/addons');
var wrt = require('wrt');

var Router = wrt.Router;
var Route = wrt.Route;

React.render(
  <Router root="/">
    <Route path="/" handler={function() { return <h1>Root</h1>; }} />
    <Route path="/sub" handler={function() { return <h2>Sub</h2>; }} />
  </Router>,
  document.body
);
```

More to come!!

See [test/router](test/router) for more info

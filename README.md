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

---

### This project is nowhere near ready and this readme is just a spot for me to flesh out ideas and features. Receipes are at the bottom

---

Basic API

When you do `var wrt = require('wrt')` it comes with two react classes, Router and Route (`wrt.Router, wrt.Route`)

### `wrt.Router`'s props are as follows:

#### `root`:
> The basic (and default) case is `/` but you can pass something like `/root/` so that when you are on `/root/sub` you get routed to `/sub`  
ex: `<Router root="/admin"></Router>`

===

#### `location`:
> The location object to use for routing. Defaults to `window.location` (duh). If you choose to pass something other than `window.location` it must be an object with a `href` property

---

### `wrt.Route`'s props are as follows:

##### `name`:
> This is used to identify the route in the router's `routes` hash, it's also used as the link url if no `path` is provided, it's also passed as a prop to all the other routes so you can use it as shown in the next `Route` prop...


##### `handler`:
> This can be a function or a react class. If it's a function it gets injected a props object as it's first param. If it's a react class it get's it props populated with the same object which has the following values:  

>##### `routes`:
>> This is a hash of all the routes so you can do something like this:
> ```js
> <Route handler={function(props) {
>   return <a href={props.routes.editUser.href}>Edit</a>;
> }} />
> ```
> Or
> ```js
> var Linker = React.createClass({
>   render: function() { return <a href={this.props.editUser.href}>Edit</a> }
> });
> <Router ... />
>   <Route handler={Linker} />
> </Router>
> ```


> ##### `linkTo(routeName)`:
>> This let's you change the location also, the reason you would use this way over the `props.routes` is because the location object may not be `window.location` so changing the url won't have any effect.

---

The `Router` class also has a static method `createClass` which let's you partially apply a base router that you can extend. Here's an example:

```jsx
var MainRouter = Router.createClass(
  <Router>
    <Route name="root" path="/" handler={rootView} />
    <Route name="edit" path="edit" handler={editView} />
  </Router>
);

var sharedLocation = {href="/"};
var SidebarRouter = (
  <MainRouter location={sharedLocation} />
);
var FooterRouter = (
  <MainRouter location={sharedLocation} />
);

var RightbarRouter = (
  <MainRouter location={{href="/"}}>
    <Route name="another" handler={anotherView} />
  </MainRouter>
);
```

Do you need it? Probably not. Why did I make it? [Because it was fun and it's 3 lines of code](http://i.imgur.com/64F2Pcz.png)

---

check out [recipes](recipes) for some ways to use `wrt` or [check out the demo](kolodny.github.io/wrt/demo)

---

More to come!!

See [test/router](test/router) for more info

# ng-nested-resource

Wrap around angular resource that provides:

- nested resources
- collection objects


## Installation

Install package via bower:

```
bower install ng-nested-resource
```

Include javascript files in your project:

```html
<!DOCTYPE html>
<html>
<head>
    <script src="bower_components/angular/angular.js"></script>
    <script src="bower_components/angular-resource/angular-resource.js"></script>
    <script src="bower_components/ng-nested-resource/dist/ng-nested-resource.js"></script>
</head>
<body ng-app="app">
...

```

Add `ngNestedResource` as a dependency to your app

```
angular.module("app", ["ngNestedResource"]);
```

## Usage

There are two main factories that can be used for making your model and collection objects:

- BaseModel
- BaseCollection

### BaseModel

- wrap around ngResource
- deals with nesting
- provides api for basic usage:
 - get
 - list
 - count
 - store
 - update
 - save
 - destroy
 - clone
- allows adding custom methods

Define models:

```js
// User Model
angular.module('MyApp')
    .factory('UserModel', function(BaseModel) {
        var UserModel = BaseModel(
            '/users/:id',
            {
                id: '@id'
            },
            {
                posts: 'PostModel' // nesting array of PostModel-s
            }
        );

        return UserModel;
    });

// Post Model
angular.module('MyApp')
    .factory('PostModel', function(BaseModel) {
        var PostModel = BaseModel(
            '/posts/:id',
            {
                id: '@id'
            }
        );

        // custom methods
        PostModel.prototype.commentsAllowed = function () {
            return this.comments_allowed && this.is_published;
        };

        return PostModel;
    });

```

Use models:

```js

// get user object
// this will generate GET request to `/users/1`
// if the returning object has `posts` array, all elements in that array will be PostModel objects
var user = UserModel.get({id: 1});

// access nested resource
if (user.posts[0].commentsAllowed()) {
    ...
}

// make new UseModel
var newUser = new UserModel({
    name: 'Misa Tumbas',
    team: 'Partizan BC',
    age: 50
});

// store
// sends POST request to `/users/`
newUser.store(success, error); // you can use also newUser.save()

// update
// sends PUT request to `/users/:id`
newUser.age = 51;
newUser.update(success, error); // you can use also newUser.save()

// destroy resource
// sends DELETE request to `/users/:id`
newUser.destroy();

// get list of resources
// sends GET request to `/users/`
var users = UserModel.list({age: 50});

```

### BaseCollection

- uses models created with BaseModel
- extends Array object (uses Array object prototype)
- implements infinitive load
- implements pagination
- allows extending collection object with custom methods

Define collection:

```js
// Posts Collection
angular.module('MyApp')
    .factory('PostsCollection', function(BaseCollection, PostModel) {
        var PostsCollection = BaseCollection(PostModel);

        return PostsCollection;
    });
```

Use collection:

```js
var posts = new PostsCollection();

// sends GET requests to /posts/ with parameters provided as first argument
posts.query({take: 10}, success, error);

// load more resources (infinitive load)
// sends GET requests to /posts/ with `take` and `skip` parameters
posts.loadMore(10, success, error);

// check if all resources are loaded
if (posts.allLoaded()) {
    //
}

// ... to be continued
```

## Pagination

This section is helpful in case you want to get a collection of resources with additional data related to pagination.

You need to add an extra parameter to a model, if your server returns an object instead of array, e.g.:

```json
{
   "total": 50,
   "per_page": 15,
   "current_page": 1,
   "last_page": 4,
   "next_page_url": "http://your.app?page=2",
   "prev_page_url": null,
   "from": 1,
   "to": 15,
   "data":[
        {
            // Result Object
        },
        {
            // Result Object
        }
   ]
}
```

Here is an example of a model:

```js
// User Model
angular.module('MyApp')
    .factory('UserModel', function(BaseModel) {
        var UserModel = BaseModel(
            '/users/:id',
            {
                id: '@id'
            },
            {
                posts: 'PostModel' // nesting array of PostModel-s
            },
            {
                '_list': {
                    method: 'GET',
                    isArray: false
                }
            }
        );

        return UserModel;
    });
```

Note you have `isArray: false` in parameters.

## Todo

- add tests
- allow collection objects to be nested
- ...

## License

Licensed under the MIT license. See LICENSE for more information.

Copyright (c) 2015 Vivify Ideas d.o.o.

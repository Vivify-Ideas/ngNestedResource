angular.module('ngNestedResource')
    .factory('BaseModel', function($resource, $injector, $http) {
        return function (url, urlMap, subModels, resourceMethods, objectDataField) {
            resourceMethods = resourceMethods || {};
            objectDataField = objectDataField || 'data';
            var resource = $resource(
                url,
                urlMap,
                angular.extend({
                    '_list': {
                        method: 'GET',
                        isArray: true
                    },
                    '_store': { method:'POST' },
                    '_update': { method:'PUT' },
                    '_destroy': { method:'DELETE' }
                }, resourceMethods)
            );

            var _parseSubModels = function(instance) {
                angular.forEach(subModels, function (mdClass, field) {
                    if (!angular.isUndefined(instance[field])) {
                        var subModel = $injector.get(mdClass);

                        if (angular.isArray(instance[field])) {
                            if (typeof subModel.model !== 'undefined') {
                                instance[field] = (new subModel()).populate(instance[field]);
                            } else {
                                angular.forEach(instance[field], function (item, key) {
                                  instance[field][key] = new subModel(item);
                                });
                            }
                        } else {
                            instance[field] = new subModel(instance[field]);
                        }
                    }
                });

                return instance;
            };

            resource.prototype.store = function (success, error) {
                return this.$_store({}, success, error).then(function (result) {
                    return _parseSubModels(result);
                });
            };

            resource.prototype.update = function (success, error) {
                return this.$_update({}, success, error).then(function (result) {
                    return _parseSubModels(result);
                });
            };

            resource.prototype.save = function (success, error) {
                if (this.id) {
                    return this.update(success, error);
                } else {
                    return this.store(success, error);
                }
            };

            resource.prototype.delete = function (success, error) {
                return this.$_destroy({}, success, error).then(function (result) {
                    return _parseSubModels(result);
                });
            };

            resource.prototype.destroy = function (success, error) {
                return this.$_destroy({}, success, error);
            };

            resource.prototype.clone = function () {
                var instance = new resource(angular.copy(this));
                return _parseSubModels(instance);
            };

            resource.prototype.isStored = function () {
                return !angular.isUndefined(this.id);
            };

            var Model = function (data) {
                this.instance = new resource(data);
                return _parseSubModels(this.instance);
            };

            Model.list = function (params, success, error) {
                var model = this;
                return resource._list(params, null, success, error)
                    .$promise.then(function (results) {

                        if (Array.isArray(results)) {
                            angular.forEach(results, function (item, k) {
                                results[k] = _parseSubModels(item);
                            });
                        } else {
                            angular.forEach(results[objectDataField], function (item, k) {
                                results[objectDataField][k] = new model(item);
                            });
                        }

                        return results;
                    });
            };

            Model.get = function(params, success, error) {
                return resource.get(params, null, success, error)
                    .$promise.then(function (result) {
                        return _parseSubModels(result);
                    });
            };

            Model.count = function (params, success, error) {
                return $http({
                    url: url.replace(':id', '') + 'count',
                    method: "GET",
                    params: params
                }).success(success).error(error);
            };

            Model.prototype = resource.prototype;
            Model.resource = resource;

            return Model;
        };
    });

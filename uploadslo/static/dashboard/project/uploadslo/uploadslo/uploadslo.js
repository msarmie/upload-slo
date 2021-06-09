/**
 *
 *
 */
(function() {
    'use strict';

     /**
     * @ngdoc overview
     * @ngname horizon.dashboard.project.uploadslo.uploadslo
     *
     * @description
     * Provides the services and widgets required
     * to support and display the project containers upload-slo panel.
     */
    angular
      .module('horizon.dashboard.project.uploadslo.uploadslo', [
        'horizon.dashboard.project.containers'
      ])
      .constant('horizon.dashboard.project.uploadslo.uploadslo.events', events())
      .config(config);

    config.$inject = [
      '$provide',
      '$routeProvider',
      '$windowProvider'
    ];

    /**
     * @name horizon.dashboard.project.uploadslo.uploadslo.basePath
     * @description Base path for the project dashboard
     */
    function config($provide, $routeProvider, $windowProvider) {
      var path = $windowProvider.$get().STATIC_URL + 'dashboard/project/uploadslo/uploadslo/';
      $provide.constant('horizon.dashboard.project.uploadslo.uploadslo.basePath', path);

      var baseRoute = 'project/uploadslo/uploadslo/';
      $provide.constant('horizon.dashboard.project.uploadslo.uploadslo.baseRoute', baseRoute);

      // we include an additional level of URL here to allow for swift service
      // user interaction outside of the scope of containers
      var containerRoute = baseRoute + 'uploadslo/uploadslo/';
      $provide.constant('horizon.dashboard.project.uploadslo.uploadslo.containerRoute', containerRoute);

//      $routeProvider
//        .when('/' + baseRoute, {
//          templateUrl: path + 'select-container.html'
//        })
//        .when('/' + containerRoute, {
//          templateUrl: path + 'select-container.html'
//        })
//        .when('/' + containerRoute + ':container', {
//          templateUrl: path + 'objects.html'
//        })
//        .when('/' + containerRoute + ':container/:folder*', {
//          templateUrl: path + 'objects.html'
//        });
    }

    /**
     * @ngdoc value
     * @name horizon.dashboard.project.uploadslo.uploadslo.events
     * @description a list of events for uploadslo
     * @returns {Object} The event object
     */
    function events() {
      return {
        FILE_UPLOAD_PROGRESS: 'horizon.dashboard.project.uploadslo.uploadslo.FILE_UPLOAD_PROGRESS'
      };
    }
  })();
  
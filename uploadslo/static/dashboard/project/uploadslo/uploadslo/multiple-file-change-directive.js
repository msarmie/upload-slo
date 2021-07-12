
(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name on-file-change
   * @element
   * @description
   * The `on-file-change` directive watches a file input and fires
   * a callback when the file input is changed.
   *
   * The callback will be passed the "files" property from the
   * browser event.
   *
   * @example
   * ```
   *  <input type="file" ng-model="ctrl.file" on-multiple-file-change="ctrl.changeFile">
   *  <input type="text" ng-model="ctrl.file_name">
   *
   *  function changeFile(files) {
   *    if (files.length) {
   *      // update the upload file & its name
   *      ctrl.upload_file = files[0];
   *      ctrl.file_name = files[0].name;
   *    }
   *  }
   * ```
   */
  angular
    .module('horizon.dashboard.project.containers')
    .directive('onMultipleFileChange', OnMultipleFileChange);

  OnMultipleFileChange.$inject = [];

  function OnMultipleFileChange() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function link(scope, element, attrs, ngModel) {
        var onMultipleFileChangeHandler = scope.$eval(attrs.onMultipleFileChange);
        element.on('change', function change(event) {
          onMultipleFileChangeHandler(event.target.files);
          // we need to manually change the view element and force a render
          // to have angular pick up that the file upload now has a value
          // and any required constraint is now satisfied
          scope.$apply(function expression() {
            var files = event.target.files;
            ngModel.$setViewValue(files);
            ngModel.$render();
          });
        });
      }
    };
  }
})();

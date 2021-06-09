/**
 *
 *
 *
 *
 */
(function () {
  'use strict';

  angular
    .module('horizon.dashboard.project.containers')
    .controller(
      'horizon.dashboard.project.uploadslo.uploadslo.UploadMultipleModalController',
      UploadMultipleModalController
    );

  UploadMultipleModalController.$inject = [
    '$rootScope',
    'horizon.dashboard.project.uploadslo.uploadslo.events',
    'horizon.dashboard.project.containers.containers-model',
    '$uibModalInstance'
  ];

  function UploadMultipleModalController($scope, events, model, $uibModalInstance) {
    var ctrl = this;
    console.log("**** UploadMultipleModalController");
    console.log(ctrl);

    ctrl.model = {
      name: '',
      container: model.container,
      folder: model.folder,
      view_file: [],      // file object managed by angular form ngModel, set in the html form
      upload_file: [],    // file object from the DOM element with the actual upload
      files: [],
      file_names: [],
      counted: {size: 0, files: 0, failures: 0},
//      view_file: null,      // file object managed by angular form ngModel, set in the html form
//      upload_file: null,    // file object from the DOM element with the actual upload
//      files: null,
      DELIMETER: model.DELIMETER
    };
    ctrl.form = null;       // set by the HTML
    ctrl.changeFile = changeFile;

    ctrl.uploadProgress = -1;

    var watchUploadProgress = $scope.$on(events.FILE_UPLOAD_PROGRESS, watchImageUpload);

//    $scope.$on('$destroy', function() {
//      console.log("**** on destroy");
//      watchUploadProgress();
//    });
//
//    $scope.$on('$close', function() {
//      console.log("**** on close");
//      watchUploadProgress();
//    });

    function watchImageUpload(event, progress) {
      console.log("**** watch image upload");
      ctrl.uploadProgress = Math.round(progress / ctrl.model.counted.size * 100);
      console.log(ctrl.uploadProgress);
    }

    ///////////

    function changeFile(files) {
      console.log("**** changeFile *****");
      var temp = [];
      if (files.length) {
        // update the upload file & its name
        // ctrl.model.upload_file = files[0];
        // ctrl.model.name = files[0].name;

        // The value of view_file is set in on-file-change directive as file[0].name
        for (const file of files) {
          ctrl.model.counted.size += file.size;
          ctrl.model.counted.files++;

          ctrl.model.files.push(file);
          ctrl.model.upload_file.push(file);
          if (file.webkitRelativePath != "") {
            ctrl.model.file_names.push(file.webkitRelativePath);
          } else {
            ctrl.model.file_names.push(file.name);
          }
          temp.push(file.name);
        }
        // ctrl.model.files = files;
        ctrl.model.view_file = temp;
//        ctrl.form.name.$setDirty();

        // Note that a $scope.$digest() is now needed for the change to the ngModel to be
        // reflected in the page (since this callback is fired from inside a DOM event)
        // but the on-file-changed directive currently does a digest after this callback
        // is invoked.
      }
    }
  }
})();

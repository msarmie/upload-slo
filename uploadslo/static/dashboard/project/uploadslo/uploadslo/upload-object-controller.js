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
      file_names: [],
      counted: {size: 0, total: 0, failures: 0},
//      view_file: null,      // file object managed by angular form ngModel, set in the html form
//      upload_file: null,    // file object from the DOM element with the actual upload
      DELIMETER: model.DELIMETER
    };
    ctrl.form = null;       // set by the HTML
    ctrl.changeFile = changeFile;
    ctrl.removeFile = removeFile;

    ctrl.uploadProgress = -1;
    ctrl.totalUploadProgress = 0;

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
      console.log(ctrl.model.upload_file);
      console.log(ctrl.model.file_names);
//      ctrl.uploadProgress = Math.round(progress / ctrl.model.counted.size * 100);
      ctrl.uploadProgress = progress;
      ctrl.totalUploadProgress += progress;
      console.log("ctrl.uploadProgress: " + ctrl.uploadProgress);
    }

    ///////////

    function changeFile(files) {
      console.log("**** changeFile *****");
      if (files.length) {
        // The value of view_file is set in on-file-change directive as file[0].name
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          var file_details = {name: "", size: file.size, progress: 0}
          ctrl.model.counted.size += file.size;
          ctrl.model.counted.total++;
          ctrl.model.upload_file.push(file);

          if (file.webkitRelativePath != "") {
            file_details.name = file.webkitRelativePath;
            ctrl.form["name_"+i] = file.webkitRelativePath;
          } else {
            file_details.name = file.name;
            ctrl.form["name_"+i] = file.name;
          }
          ctrl.model.file_names.push(file_details);
        }
        // console.log(ctrl);
        //ctrl.form["name_"+i].$setDirty();

        // Note that a $scope.$digest() is now needed for the change to the ngModel to be
        // reflected in the page (since this callback is fired from inside a DOM event)
        // but the on-file-changed directive currently does a digest after this callback
        // is invoked.
      }
    }

    function removeFile(file) {
      console.log("REMOVE FILE");
      ctrl.model.file_names = ctrl.model.file_names.filter(function(item) { return item.name != file.name});
      ctrl.model.upload_file = ctrl.model.upload_file.filter(function(item) {return item.name != name && item.webkitRelativePath != file.name});
      ctrl.model.counted.size -= file.size;
      ctrl.model.counted.total--;
    }
  }
})();

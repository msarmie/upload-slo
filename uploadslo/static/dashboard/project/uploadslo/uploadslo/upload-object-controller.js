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
    '$uibModalInstance',
    'horizon.dashboard.project.uploadslo.uploadslo.uploadslo-api',
    'horizon.framework.widgets.toast.service',
  ];

  function UploadMultipleModalController($scope, events, model, $uibModalInstance, extendedSwiftAPI, toastService) {
    var ctrl = this;
    ctrl.model = {
      name: '',
      container: model.container,
      folder: model.folder,
      view_file: null,      // file object managed by angular form ngModel, set in the html form
      upload_file: [],    // file object from the DOM element with the actual upload
      file_names: [],
      counted: {size: 0, total: 0, failures: 0},
      DELIMETER: model.DELIMETER
    };
    ctrl.form = null;       // set by the HTML
    ctrl.changeFile = changeFile;
    ctrl.removeFile = removeFile;
    ctrl.startUpload = startUpload;

    ctrl.uploadProgress = -1;
    ctrl.totalUploadProgress = 0;

    var watchUploadProgress = $scope.$on(events.FILE_UPLOAD_PROGRESS, watchImageUpload);

    function watchImageUpload(event, progress) {
      ctrl.uploadProgress = progress.loaded;
      if (progress.type === "load") {
        removeUploadedFile(progress.config.data.file);
      }
      ctrl.totalUploadProgress = Math.round(progress.loaded / progress.total * 100);
    }

    function removeUploadedFile(file) {
      let fName = file.name;
      if (file.webkitRelativePath != "") {
        fName = file.webkitRelativePath;
      }
      ctrl.model.file_names = ctrl.model.file_names.filter(function(item) { return item.name != fName});
    }

    ///////////

    function changeFile(files) {
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
        ctrl.form.files_directory.$setDirty();
        ctrl.form.files_multiple.$setDirty();

        // Note that a $scope.$digest() is now needed for the change to the ngModel to be
        // reflected in the page (since this callback is fired from inside a DOM event)
        // but the on-file-changed directive currently does a digest after this callback
        // is invoked.
      }
    }

    function removeFile(file) {
      // update/reset value of model for input-file
      ctrl.model.file_names = ctrl.model.file_names.filter(function(item) { return item.name != file.name});
      ctrl.model.upload_file = ctrl.model.upload_file.filter(function(item) {return item.name != file.name && item.webkitRelativePath != file.name});
      ctrl.model.counted.size -= file.size;
      ctrl.model.counted.total--;

      ctrl.form.files_directory.$setDirty();
      ctrl.form.files_multiple.$setDirty();
    }

    function startUpload(uploadInfo) {
      function onProgress(progress) {
        $scope.$broadcast(events.FILE_UPLOAD_PROGRESS, progress);
      }
      extendedSwiftAPI.uploadObject(
        model.container.name,
        uploadInfo.file_names,
        uploadInfo.upload_file,
        model.folder,
        onProgress
      ).then(function success() {
        toastService.add(
          'success',
          gettext('File successfully uploaded.')
        );
        model.updateContainer();
        model.selectContainer(
          model.container.name,
          model.folder
        );
        $uibModalInstance.close();
      }, function error() {
          console.log("upload-error");
      });

    }
  }
})();

/**
 *
 *
 *
 *
 */
(function() {
  'use strict';

  angular
    .module('horizon.dashboard.project.containers')
    .factory('horizon.dashboard.project.containers.upload-multiple', uploadMultipleService)
    .factory('horizon.dashboard.project.containers.upload-slo', uploadSloService) // needs to be in the same module
    .run(registerActions);

  registerActions.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'horizon.dashboard.project.containers.object.resourceType',
    'horizon.dashboard.project.containers.upload-multiple',
    'horizon.dashboard.project.containers.upload-slo'
  ];

  /**
   * @name registerActions
   * @description Register batch and global actions.
   */
  function registerActions(
    registryService,
    objectResCode,
    uploadMultipleService,
    uploadSloService
  ) {
    registryService.getResourceType(objectResCode).batchActions
    .append({
      service: uploadMultipleService,
      template: {text: '<span class="fa fa-upload"></span>' + gettext('Multiple')}
    })
    .append({
      service: uploadSloService,
      template: {text: '<span class="fa fa-upload"></span>' + gettext('Large Object')}
    });
  }

  function uploadMultipleModal(html, $uibModal) {
    console.log("Upload Modal");
    var localSpec = {
      backdrop: 'static',
      controller: 'horizon.dashboard.project.uploadslo.uploadslo.UploadMultipleModalController as ctrl',
      templateUrl: html
    };
    return $uibModal.open(localSpec).result;
  }

  uploadMultipleService.$inject = [
    '$rootScope',
    'horizon.app.core.openstack-service-api.swift',
    'horizon.dashboard.project.uploadslo.uploadslo.uploadslo-api',
    'horizon.dashboard.project.uploadslo.uploadslo.events',
    'horizon.dashboard.project.containers.basePath',
    'horizon.dashboard.project.uploadslo.uploadslo.basePath',
    'horizon.dashboard.project.containers.containers-model',
    'horizon.framework.util.q.extensions',
    'horizon.framework.widgets.modal-wait-spinner.service',
    'horizon.framework.widgets.toast.service',
    '$uibModal'
  ];

  function uploadMultipleService($rootScope, swiftAPI, extendedSwiftAPI, events, basePath, myBasePath, model, $qExtensions, modalWaitSpinnerService,
                         toastService, $uibModal) {
    var service = {
      allowed: function allowed() {
        return $qExtensions.booleanAsPromise(true);
      },
      perform: function perform() {
        uploadMultipleModal(myBasePath + 'upload-object-modal.html', $uibModal)
          .then(service.uploadMultipleObjectCallback);
      },
      uploadMultipleObjectCallback: uploadMultipleObjectCallback
    };
    return service;

    function uploadMultipleObjectCallback(uploadInfo) {
      function onProgress(progress) {
        $rootScope.$broadcast(events.FILE_UPLOAD_PROGRESS, progress);
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
          interpolate(gettext('File %(name)s uploaded.'), uploadInfo, true)
        );
        model.updateContainer();
        model.selectContainer(
          model.container.name,
          model.folder
        );
      }, function error() {
          console.log("upload-error");
      });

    }
  }

  function uploadSloModal(html, $uibModal) {
    var localSpec = {
      backdrop: 'static',
      controller: 'horizon.dashboard.project.uploadslo.uploadslo.UploadSloModalController as ctrl',
      templateUrl: html
    };
    return $uibModal.open(localSpec).result;
  }

  uploadSloService.$inject = [
    '$rootScope',
    'horizon.app.core.openstack-service-api.swift',
    'horizon.dashboard.project.uploadslo.uploadslo.uploadslo-api',
    'horizon.dashboard.project.uploadslo.uploadslo.events',
    'horizon.dashboard.project.containers.basePath',
    'horizon.dashboard.project.uploadslo.uploadslo.basePath',
    'horizon.dashboard.project.containers.containers-model',
    'horizon.framework.util.q.extensions',
    'horizon.framework.widgets.modal-wait-spinner.service',
    'horizon.framework.widgets.toast.service',
    '$uibModal'
  ];

  function uploadSloService($rootScope, swiftAPI, extendedSwiftAPI, events, basePath, myBasePath, model, $qExtensions, modalWaitSpinnerService,
                         toastService, $uibModal) {
    var service = {
      allowed: function allowed() {
        return $qExtensions.booleanAsPromise(true);
      },
      perform: function perform() {
        uploadSloModal(myBasePath + 'upload-slo-modal.html', $uibModal)
          .then(service.uploadSloObjectCallback);
      },
      uploadSloObjectCallback: uploadSloObjectCallback
    };
    return service;

    function uploadSloObjectCallback(uploadInfo) {
      // 1073741824 bytes 1GB
      // 50000000 bytes 50MB
      if (uploadInfo.upload_file.size >= 1073741824) {
        modalWaitSpinnerService.showModalSpinner(gettext("Uploading large file"));
        // Call to upload file as SLO
        extendedSwiftAPI.uploadSlo(
          model.container.name,
          model.fullPath(uploadInfo.name),
          uploadInfo.upload_file
        ).then(success, error);

        function success() {
          console.log("****** Uploaded segments. Uploading manifest...");
          modalWaitSpinnerService.hideModalSpinner();
          modalWaitSpinnerService.showModalSpinner(gettext("Uploading manifest file"));
          toastService.add(
            'success',
            interpolate(gettext('Uploading %(name)s manifest.'), uploadInfo, true)
          );

          // Call to create manifest
          extendedSwiftAPI.createUploadManifest(
            model.container.name,
            model.fullPath(uploadInfo.name),
            uploadInfo.upload_file
          ).then(successManifest, errorManifest);

          function successManifest() {
            modalWaitSpinnerService.hideModalSpinner();
            toastService.add(
              'success',
              interpolate(gettext('File %(name)s uploaded.'), uploadInfo, true)
            );
            model.updateContainer();
            model.selectContainer(
              model.container.name,
              model.folder
            );
          }

          function errorManifest() {
            console.log("Error uploading manifest");
            modalWaitSpinnerService.hideModalSpinner();
          }
        }
        function error() {
          console.log("Error uploading SLO");
          modalWaitSpinnerService.hideModalSpinner();
        }
      }
    }
  }
})();

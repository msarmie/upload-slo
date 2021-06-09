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
    .factory('horizon.dashboard.project.containers.objects-batch-actions.upload', uploadService)
    .factory('horizon.dashboard.project.containers.upload-slo', uploadSloService) // needs to be in the same module
    .run(registerActions);

  registerActions.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'horizon.dashboard.project.containers.object.resourceType',
    'horizon.dashboard.project.containers.objects-batch-actions.upload',
    'horizon.dashboard.project.containers.upload-slo'
  ];

  /**
   * @name registerActions
   * @description Register batch and global actions.
   */
  function registerActions(
    registryService,
    objectResCode,
    uploadService,
    uploadSloService
  ) {
    registryService.getResourceType(objectResCode).batchActions
    .append({
      service: uploadSloService,
      template: {text: '<span class="fa fa-upload"></span>' + gettext('Large Upload')}
    });
  }

  function uploadModal(html, $uibModal) {
    var localSpec = {
      backdrop: 'static',
      controller: 'horizon.dashboard.project.uploadslo.uploadslo.UploadMultipleModalController as ctrl',
      templateUrl: html
    };
    return $uibModal.open(localSpec).result;
  }

  uploadService.$inject = [
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

  function uploadService($rootScope, swiftAPI, extendedSwiftAPI, events, basePath, myBasePath, model, $qExtensions, modalWaitSpinnerService,
                         toastService, $uibModal) {
    var service = {
      allowed: function allowed() {
        return $qExtensions.booleanAsPromise(true);
      },
      perform: function perform() {
        uploadModal(myBasePath + 'upload-object-modal.html', $uibModal)
          .then(service.uploadObjectCallback);
      },
      uploadObjectCallback: uploadObjectCallback
    };
    return service;

    function uploadObjectCallback(uploadInfo) {
      function onProgress(progress) {
        $rootScope.$broadcast(events.FILE_UPLOAD_PROGRESS, progress);
      }
      modalWaitSpinnerService.showModalSpinner(gettext("Uploading"));
      extendedSwiftAPI.uploadObject(
        model.container.name,
        uploadInfo.file_names,
        uploadInfo.upload_file,
        model.folder,
        onProgress
      ).then(function success() {
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
      }, function error() {
        modalWaitSpinnerService.hideModalSpinner();
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
          mySwiftAPI.createUploadManifest(
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

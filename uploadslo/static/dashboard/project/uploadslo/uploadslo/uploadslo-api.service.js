/**
 * Extends Swift API
 * Allows Standard Large Object uploads
 * Allows multiple file uploads
 * Allows directory uploads
 *
 */
(function () {
  'use strict';

  angular
    .module('horizon.app.core.openstack-service-api')
    .factory('horizon.dashboard.project.uploadslo.uploadslo.uploadslo-api', extendedSwiftAPI);

  extendedSwiftAPI.$inject = [
    'horizon.dashboard.project.uploadslo.uploadslo.events',
    'horizon.framework.util.http.service',
    'horizon.app.core.openstack-service-api.swift',
    'horizon.framework.widgets.toast.service'
  ];

  /**
   * @ngdoc service
   * @name extendedSwiftAPI
   * @param {Object} events
   * @param {Object} apiService
   * @param {Object} swiftAPI
   * @param {Object} toastService
   * @description Provides direct pass through to Swift with NO abstraction.
   * @returns {Object} The service
   */
  function extendedSwiftAPI(events, apiService, swiftAPI, toastService) {
    var service = {
      pad: pad,
      createUploadManifest: createUploadManifest,
      uploadSlo: uploadSlo,
      getNextSegmentNumberDirect: getNextSegmentNumberDirect,
      uploadObject: uploadObject,
      uploadMultipleObjects: uploadMultipleObjects
    };

    return service;

    function uploadObject(container, objectNames, files, folder, onProgress) {
      return service.uploadMultipleObjects(container, objectNames, files, folder, onProgress);
    }

    async function uploadMultipleObjects(container, objectNames, files, folder, onProgress) {
      let folder_path = '';
      if (folder) {
        folder_path = folder + '/';
      }
      for (const file of files) {
        let file_name = file.name;
        if (file.webkitRelativePath != "") {
          file_name = file.webkitRelativePath;
        }
        await apiService.post(
          swiftAPI.getObjectURL(container, folder_path + file_name),
          {file: file}
        ).then(
          function success(result) {
            return result;
          },
          function error(err) {
            toastService.add('error', gettext('Unable to upload object: ') + file_name);
            return err;
          },
          function progress(e) {
            onProgress(e);
          }
        );
      }
    }

    function uploadSlo(container, objectName, file) {
      var segmentContainer = container + "_segments";
      var segmentPseudoFolderName = objectName;
      // must create pseudo-folder

      return service.getNextSegmentNumberDirect(segmentContainer, segmentPseudoFolderName)
      .then(
        function(result) {
          // console.log("getNextSegmentNumberDirect: " +result);
          return result;
        }
      )
      .then(
        async function(result) {
          var segmentNumber = result;
          var segmentSize = getSegmentSize(file.size);
          var segmentStart = (segmentNumber - 1) * segmentSize;
          var segmentEnd = segmentNumber * segmentSize;
          var done = segmentNumber - 1;
          var segment;
          var totalSegments = parseInt(Math.ceil(file.size/segmentSize));

          for (var i = done; i <= totalSegments; i++) {
            if (segmentStart < file.size) {
              segment = file.slice(segmentStart, segmentEnd);
              var padded = service.pad(segmentNumber, 4);

              await apiService.post(
                swiftAPI.getObjectURL(segmentContainer, segmentPseudoFolderName + "/" + padded),
                {file: segment}
              );

            }
            segmentNumber++;
            segmentStart = (segmentNumber - 1) * segmentSize;
            segmentEnd = segmentNumber * segmentSize;
          }
        }
      );
    }

    function createUploadManifest(container, objectName, file) {
      var objectUrlSlo = '/api/uploadslo/' + container + '/' + objectName;
      return apiService.post(
        objectUrlSlo,
        {}
      );
    }

    function getNextSegmentNumberDirect(container, folderName) {
      var data = {is_public: false, storage_policy: {}};
      return apiService.get(swiftAPI.getContainerURL(container) + '/metadata/')
      .then(
        function(success) {
          // console.log("Creating container...");
      }, function error() {
        apiService.post(swiftAPI.getContainerURL(container) + '/metadata/', data)
        .error(function (response) {
          if (response.status === 409) {
            toastService.add('error', response);
          } else {
            toastService.add('error', gettext('Unable to create the segment container.'));
          }
        })
      }).then(function success() {
        var params = {"path": folderName};
        return swiftAPI.getObjects(container, params)
        .then(
          function(result) {
            // console.log("get objects");
            return result.data.items;
          }
        ).then(
          function(result) {
            if(result.length < 1) {
              return 1;
            }
          }
        )
      });
    }

    function getSegmentSize(size) {
      // 1048576000 bytes 1000 MB / 1 GB
      // 1048576 bytes 1 MB
      if (size <= 1048576000) {
        // 1 MB size of each segment
        return 1048576;
      }
      // maximum 1000 segments if greater than 1 GB
      var minSegmentSize = parseInt(Math.ceil(size/1000));
      return minSegmentSize;
    }

    function pad(num, size) {
      var s = "000000000" + num;
      return s.substr(s.length-size);
    }
  }
}());
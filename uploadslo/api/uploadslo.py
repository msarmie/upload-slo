# Copyright 2012 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
#
# Copyright 2012 Nebula, Inc.
#
#    Licensed under the Apache License, Version 2.0 (the "License"); you may
#    not use this file except in compliance with the License. You may obtain
#    a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#    License for the specific language governing permissions and limitations
#    under the License.

from datetime import datetime
from urllib import parse

import functools

import swiftclient

from django.conf import settings
from django.utils.translation import ugettext_lazy as _

from horizon import exceptions

from openstack_dashboard.api import base
from openstack_dashboard.contrib.developer.profiler import api as profiler
from tempfile import NamedTemporaryFile
import json
from openstack_dashboard.api import swift

FOLDER_DELIMITER = "/"
CHUNK_SIZE = settings.SWIFT_FILE_TRANSFER_CHUNK_SIZE
# Swift ACL
GLOBAL_READ_ACL = ".r:*"
LIST_CONTENTS_ACL = ".rlistings"

@profiler.trace
@swift.safe_swift_exception
def swift_upload_object_slo(request, container_name, object_name):
    headers = {}
    size = 0

    kwargs = dict(prefix=object_name + "/",
                delimiter=FOLDER_DELIMITER,
                full_listing=True)
    print(kwargs)
    headers, objects = swift.swift_api(request).get_container(container_name + "_segments", **kwargs)
    print(objects)

    manifest = []
    for object in objects:
        if object.get('content_type', None) not in ('application/directory',
                                                    'application/x-directory',
                                                    'text/directory'):
            manifest.append({
                    "path": "/" + container_name + "_segments" + "/" + object["name"],
                    "etag": object["hash"],
                    "size_bytes": object["bytes"],
                })

    manifest = sorted(manifest, key=lambda k: k['path'])
    print(manifest)

    with NamedTemporaryFile(mode='wb+') as fp:
        fp.write(bytes(json.dumps(manifest), encoding = 'ascii'))
        size = fp.tell()
        fp.seek(0)
        obj_info = {'name': object_name, 'bytes': size, 'etag': ''}
        try:
            headers['X-Object-Meta-Orig-Filename'] = object_name
            headers['Content-Length'] = size
            etag = swift.swift_api(request).put_object(container_name,
                                                object_name,
                                                fp,
                                                content_length=size,
                                                headers=headers,
                                                query_string='multipart-manifest=put&heartbeat=on')

            obj_info = {'name': object_name, 'bytes': size, 'etag': etag}
        except swiftclient.exceptions.ClientException as e:
            raise e
    return swift.StorageObject(obj_info, container_name)
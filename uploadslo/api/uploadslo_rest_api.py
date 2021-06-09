# Copyright 2015, Rackspace, US, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""API for the swift service."""

import os

from django import forms
from django.http import StreamingHttpResponse
from django.utils.http import urlunquote
from django.views.decorators.csrf import csrf_exempt
from django.views import generic

from horizon import exceptions
from openstack_dashboard import api
from openstack_dashboard.api.rest import urls
from openstack_dashboard.api.rest import utils as rest_utils
from openstack_dashboard.api.rest import swift as rest_swift
from uploadslo.api import uploadslo

class UploadObjectForm(forms.Form):
    file = forms.FileField(required=False)


@urls.register
class ObjectSlo(generic.View):
    """API for a single swift object or pseudo-folder"""
    url_regex = r'uploadslo/(?P<container>[^/]+)/' \
                '(?P<object_name>.+)$'

    @csrf_exempt
    def post(self, request, container, object_name):
        """Create or replace an object or pseudo-folder

        :param request:
        :param container:
        :param object_name:

        If the object_name (ie. POST path) ends in a '/' then a folder is
        created, rather than an object. Any file content passed along with
        the request will be ignored in that case.

        POST parameter:

        :param file: the file data for the upload.

        :return:
        """

        result = uploadslo.swift_upload_object_slo(
            request,
            container,
            object_name
        )

        return rest_utils.CreatedResponse(
            u'/api/swift/containers/%s/object/%s' % (container, result.name)
        )
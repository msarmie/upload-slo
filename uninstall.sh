#!/bin/bash

echo "Uninstalling UPLOAD SLO"

python3 -m pip uninstall uploadslo
rm /usr/lib/python3/dist-packages/openstack_dashboard/local/enabled/_1930_uploadslo.py
apachectl -k graceful

echo "Removed"


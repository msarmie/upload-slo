#!/bin/bash

echo "Installing UPLOAD SLO"

export PBR_VERSION=5.4.5
python3 setup.py sdist
cp -rv uploadslo/enabled/ /usr/lib/python3/dist-packages/openstack_dashboard/local/
python3 -m pip install dist/uploadslo-5.4.5.tar.gz
python3 /usr/share/openstack-dashboard/manage.py collectstatic
python3 /usr/share/openstack-dashboard/manage.py compress
apachectl -k graceful

echo "Install done"

# The name of the panel to be added to HORIZON_CONFIG. Required.
PANEL = 'uploadslo'

# The name of the dashboard the PANEL associated with. Required.
PANEL_DASHBOARD = 'project'

PANEL_GROUP = 'object_store'

# Python panel class of the PANEL to be added.
ADD_PANEL = 'uploadslo.content.uploadslo.panel.UploadSlo'

# A list of applications to be prepended to INSTALLED_APPS
ADD_INSTALLED_APPS = ['uploadslo']

# A list of AngularJS modules to be loaded when Angular bootstraps.
# ADD_ANGULAR_MODULES = ['horizon.dashboard.project.uploadslo.uploadslo']
ADD_ANGULAR_MODULES = ['horizon.dashboard.project.uploadslo.uploadslo']

# Automatically discover static resources in installed apps
AUTO_DISCOVER_STATIC_FILES = True

# A list of js files to be included in the compressed set of files
ADD_JS_FILES = []

# A list of scss files to be included in the compressed set of files
# ADD_SCSS_FILES = ['dashboard/project/uploadslo/uploadslo/uploadslo.scss']
ADD_SCSS_FILES = []

# A list of template-based views to be added to the header
ADD_HEADER_SECTIONS = ['uploadslo.content.uploadslo.views.HeaderView',]
# ADD_HEADER_SECTIONS = []
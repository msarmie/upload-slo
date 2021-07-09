from django.utils.translation import ugettext_lazy as _
import horizon

class UploadSlo(horizon.Panel):
    name = _("Large Objects")
    slug = "uploadslo"
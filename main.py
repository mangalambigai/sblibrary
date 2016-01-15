#!/usr/bin/env python
import webapp2
from google.appengine.api import app_identity
from google.appengine.api import mail
from sblibrary import SbLibraryApi

class SendReminderHandler(webapp2.RequestHandler):
    def get(self):
        """Set Announcement in Memcache."""
        arr = SbLibraryApi._getOverDue()
        for (emailid, msg) in arr:
            mail.send_mail(
                'noreply@%s.appspotmail.com' % (
                app_identity.get_application_id()),     # from
                emailid,                                # to
                'Books overdue ar Shishu Bharathi!',    # subj
                msg                                     # body
            )

app = webapp2.WSGIApplication([
    ('/crons/send_reminder', SendReminderHandler),
], debug=True)

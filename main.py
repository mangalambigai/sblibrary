#!/usr/bin/env python
"""
main.py -- Shishu Bharathi Library server-side Python App Engine
    HTTP controller handlers for memcache & task queue access
"""

import webapp2
from google.appengine.api import app_identity
from google.appengine.api import mail
from sblibrary import SbLibraryApi
from google.appengine.ext import ndb

import cgi
import logging
import os, csv
import cloudstorage as gcs
from models import Book, Grade, Media

#TODO: set the task to never retry
class UploadGCSData(webapp2.RequestHandler):
    def get(self):
        #bucket_name = os.environ.get('BUCKET_NAME',
        #                             app_identity.get_default_gcs_bucket_name())
        #bucket = '/' + bucket_name
        #filename = bucket + '/LibraryBook1.csv'
        self.upload_file('/sb-library.appspot.com/LibraryBook1.csv')

    def upload_file(self, filename):
        gcs_file = gcs.open(filename)
        datareader = csv.reader(gcs_file)
        count = 0
        entities = []
        for row in datareader:
            count += 1
            #TODO: Pass the enums
            if len(row[1]) > 0:
                booktitle = row[1].lower()
                booksbId = row[0]
                #convert 1/4/3101 to 3101-04--01
                if booksbId.find('/')>-1:
                    list = booksbId.split('/')
                    if len(list)>1:
                        booksbId = list[2] + '-0'+list[1] +'--0'+list[0]

                b_key = ndb.Key(Book, booksbId.upper())
                newProd = Book(
                    key = b_key,
                    sbId = booksbId,
                    title = booktitle,
                    volume = row[2],
                    author = row[3],
                    isbn = row[4],
                    price = row[5],
                    #language = row[6],
                    notes = row[8],
                    #suggestedGrade = row[9],
                    category = row[10],
                    publisher = row[15],
                    #mediaType = row[18],
                    donor = row[20],
                    comments = row[25]
                    )
                entities.append(newProd)

            if count%50==0 and entities:
                ndb.put_multi(entities)
                entities=[]

        if entities:
            ndb.put_multi(entities)
        self.response.set_status(204)

class SendReminderHandler(webapp2.RequestHandler):
    def get(self):
        """Send overdue reminders."""
        arr = SbLibraryApi._getOverDue()
        for (emailid, msg) in arr:
            mail.send_mail(
                'noreply@%s.appspotmail.com' % (
                app_identity.get_application_id()),     # from
                emailid,                                # to
                'Books overdue at Shishu Bharathi!',    # subj
                msg                                     # body
            )

app = webapp2.WSGIApplication([
    ('/crons/send_reminder', SendReminderHandler),
    ('/tasks/gcsupload', UploadGCSData),
], debug=True)

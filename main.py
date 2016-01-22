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

import cgi, string
import logging
import os, csv
import cloudstorage as gcs
from models import Book, Grade, Media, Language

#TODO: set the task to never retry
class UploadGCSData(webapp2.RequestHandler):
    def get(self):
        #bucket_name = os.environ.get('BUCKET_NAME',
        #                             app_identity.get_default_gcs_bucket_name())
        #bucket = '/' + bucket_name
        #filename = bucket + '/LibraryBook1.csv'
        self.upload_file('/sb-library.appspot.com/LibraryBook1.csv')

    def _isNumber(self, s):
        try:
            int(s)
            return True
        except ValueError:
            return False

    def _getGrade(self, grade):
        if grade == 1:
            return Grade.GRADE1
        elif grade == 2:
            return Grade.GRADE2
        elif grade == 3:
            return Grade.GRADE3
        elif grade == 4:
            return Grade.GRADE4
        elif grade == 5:
            return Grade.GRADE5
        elif grade == 6:
            return Grade.GRADE6
        elif grade == 7:
            return Grade.GRADE7
        elif grade == 8:
            return Grade.GRADE8


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
                newBook = Book(
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
                    editionYear = row[18],
                    donor = row[20],
                    comments = row[25]
                    )

                if row[6]:
                    lang = row[6]
                    if lang == 'English':
                        newBook.language = Language.ENGLISH
                    elif lang == 'Tamil':
                        newBook.language = Language.TAMIL
                    elif lang == 'Gujarathi':
                        newBook.language = Language.GUJARATHI
                    elif string.find(lang, 'Hindi')>-1:
                        newBook.language = Language.HINDI

                if row[9]:
                    grade = row[9]
                    if grade == 'KG':
                        newBook.suggestedGrade.append(Grade.K)
                    elif self._isNumber(grade):
                        newBook.suggestedGrade.append(self._getGrade(int(grade)))
                    elif grade == 'Adult':
                        newBook.suggestedGrade.append(Grade.ADULT)
                    else:
                        minGrade = 0
                        if string.find(grade, '-Jan')>-1:
                            maxGrade = grade[0]
                            minGrade = 1
                        elif string.find(grade, '-Feb')>-1:
                            minGrade = 2
                            maxGrade = grade[0]
                        elif string.find(grade, '-Mar')>-1:
                            minGrade = 3
                            maxGrade = grade[0]
                        if minGrade > 0:
                            for i in range(minGrade, int(maxGrade)+1):
                                newBook.suggestedGrade.append(self._getGrade(i))

                if row[16]:
                    if row[16] == 'Book':
                        newBook.mediaType = Media.BOOK
                    elif row[16] == 'Dictionary':
                        newBook.mediaType = Media.DICTIONARY
                    elif string.find(row[16], 'CD')>-1:
                        newBook.mediaType = Media.CD

                entities.append(newBook)

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

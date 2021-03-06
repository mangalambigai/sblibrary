#!/usr/bin/env python

"""models.py

SB Library server-side Python App Engine data & ProtoRPC models

"""

import httplib
import endpoints
from protorpc import messages
from google.appengine.ext import ndb
from google.appengine.ext.ndb import msgprop

#Book models

class Language(messages.Enum):
    """Language - enumeration value"""
    ENGLISH = 1
    HINDI = 2
    TAMIL = 3
    TELUGU = 4
    KANNADA = 5
    GUJARATHI = 6
    MARATHI = 7
    SANSKRIT = 8

class Grade(messages.Enum):
    GRADE1 = 1
    GRADE2 = 2
    GRADE3 = 3
    GRADE4 = 4
    GRADE5 = 5
    GRADE6 = 6
    GRADE7 = 7
    GRADE8 = 8
    ADULT = 9
    K = 10

class Media(messages.Enum):
    BOOK = 1
    CD = 2
    DICTIONARY = 3

class Book(ndb.Model):
    """Book - Book object"""
    sbId = ndb.StringProperty()
    title = ndb.StringProperty()
    author = ndb.StringProperty(indexed = False)
    language = msgprop.EnumProperty(Language, indexed = False)
    studentId = ndb.StringProperty()
    checkoutDate = ndb.DateProperty(indexed = False)
    dueDate = ndb.DateProperty()
    checkedOut = ndb.BooleanProperty()
    volume = ndb.StringProperty(indexed = False)
    isbn = ndb.StringProperty(indexed = False)
    price = ndb.StringProperty(indexed = False)
    notes = ndb.StringProperty(indexed = False)
    suggestedGrade = msgprop.EnumProperty(Grade, repeated = True)
    category = ndb.StringProperty()
    publisher = ndb.StringProperty(indexed = False)
    mediaType = msgprop.EnumProperty(Media)
    editionYear = ndb.StringProperty(indexed = False)
    donor = ndb.StringProperty(indexed = False)
    comments = ndb.StringProperty(indexed = False)
    createdBy = ndb.StringProperty(indexed = False)
    createdDate = ndb.DateProperty(indexed = False)
    lastUpdatedBy = ndb.StringProperty(indexed = False)
    lastUpdatedDate = ndb.DateProperty(indexed = False)
    reference = ndb.BooleanProperty(indexed = False)


class BookForm(messages.Message):
    """BookForm - Book outbound from message"""
    sbId = messages.StringField(1)
    title = messages.StringField(2)
    author = messages.StringField(3)
    language = messages.EnumField('Language', 4)
    dueDate = messages.StringField(5)
    volume = messages.StringField(6)
    isbn = messages.StringField(7)
    price = messages.StringField(8)
    notes = messages.StringField(9)
    suggestedGrade = messages.EnumField('Grade', 10, repeated = True)
    category = messages.StringField(11)
    publisher = messages.StringField(12)
    mediaType = messages.EnumField('Media', 13)
    editionYear = messages.StringField(14)
    donor = messages.StringField(15)
    comments = messages.StringField(16)
    createdBy = messages.StringField(17)
    createdDate = messages.StringField(18)
    lastUpdatedBy = messages.StringField(19)
    lastUpdatedDate = messages.StringField(20)
    reference = messages.BooleanField(21)

class BookForms(messages.Message):
    """BookForms - Multiple books outbound form message"""
    items = messages.MessageField(BookForm, 1, repeated = True)
    cursor = messages.StringField(2)

#Student models
class Student(ndb.Model):
    """Student - Student object"""
    sbId = ndb.StringProperty()
    name = ndb.StringProperty()
    email = ndb.StringProperty()
    cellphone = ndb.StringProperty(indexed = False)
    checkedoutBookIds = ndb.StringProperty(repeated = True, indexed = False)

class StudentForm(messages.Message):
    """StudentForm - Student outbound from message"""
    sbId = messages.StringField(1)
    name = messages.StringField(2)
    email = messages.StringField(3)
    cellphone = messages.StringField(4)

class StudentForms(messages.Message):
    """BookForms - Multiple books outbound form message"""
    items = messages.MessageField(StudentForm, 1, repeated = True)
    cursor = messages.StringField(2)

#Checkout models
class CheckoutForm(messages.Message):
    """CheckoutForm - Checkout outbound form message"""
    studentId = messages.StringField(1)
    bookId = messages.StringField(2)
    checkoutDate = messages.StringField(3)
    dueDate = messages.StringField(4)
    studentName = messages.StringField(5)
    title = messages.StringField(6)
    author = messages.StringField(7)
    language = messages.EnumField('Language', 8)

class CheckoutForms(messages.Message):
    """CheckoutForms - Multiple checkouts outbound form message"""
    items = messages.MessageField(CheckoutForm, 1, repeated = True)
    cursor = messages.StringField(2)

class CheckoutRequestForm(messages.Message):
    """CheckoutRequestForm - for checking out or returning book"""
    studentId = messages.StringField(1)
    bookId = messages.StringField(2)
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

class Book(ndb.Model):
    """Book - Book object"""
    sbId = ndb.StringProperty()
    title = ndb.StringProperty()
    author = ndb.StringProperty(indexed = False)
    language = ndb.StringProperty(indexed = False)
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


class Language(messages.Enum):
    """Language - enumeration value"""
    English = 1
    Hindi = 2
    Tamil = 3
    Telugu = 4
    Kannada = 5

class BookForm(messages.Message):
    """BookForm - Book outbound from message"""
    sbId = messages.StringField(1)
    title = messages.StringField(2)
    author = messages.StringField(3)
    language = messages.StringField(4)
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

class BookForms(messages.Message):
    """BookForms - Multiple books outbound form message"""
    items = messages.MessageField(BookForm, 1, repeated = True)

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
    language = messages.StringField(8)

class CheckoutForms(messages.Message):
    """CheckoutForms - Multiple checkouts outbound form message"""
    items = messages.MessageField(CheckoutForm, 1, repeated = True)

class CheckoutRequestForm(messages.Message):
    """CheckoutRequestForm - for checking out or returning book"""
    studentId = messages.StringField(1)
    bookId = messages.StringField(2)
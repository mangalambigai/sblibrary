#!/usr/bin/env python

"""models.py

SB Library server-side Python App Engine data & ProtoRPC models

"""

import httplib
import endpoints
from protorpc import messages
from google.appengine.ext import ndb

class Book(ndb.Model):
    """Book - Book object"""
    sbId = ndb.StringProperty()
    title = ndb.StringProperty()
    author = ndb.StringProperty()
    language = ndb.StringProperty()

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

class BookForms(messages.Message):
    """BookForms - Multiple books outbound form message"""
    items = messages.MessageField(BookForm, 1, repeated = True)

class Student(ndb.Model):
    """Student - Student object"""
    sbId = ndb.StringProperty()
    name = ndb.StringProperty()
    email = ndb.StringProperty()
    cellphone = ndb.StringProperty()

class StudentForm(messages.Message):
    """StudentForm - Student outbound from message"""
    sbId = messages.StringField(1)
    name = messages.StringField(2)
    email = messages.StringField(3)
    cellphone = messages.StringField(4)

class StudentForms(messages.Message):
    """BookForms - Multiple books outbound form message"""
    items = messages.MessageField(StudentForm, 1, repeated = True)

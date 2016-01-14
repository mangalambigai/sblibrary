#!/usr/bin/env python

"""models.py

SB Library server-side Python App Engine data & ProtoRPC models

"""

import httplib
import endpoints
from protorpc import messages
from google.appengine.ext import ndb

#Book models

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
    websafeKey = messages.StringField(5)

class BookForms(messages.Message):
    """BookForms - Multiple books outbound form message"""
    items = messages.MessageField(BookForm, 1, repeated = True)

#Student models
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
    websafeKey = messages.StringField(5)

class StudentForms(messages.Message):
    """BookForms - Multiple books outbound form message"""
    items = messages.MessageField(StudentForm, 1, repeated = True)

#Checkout models
class Checkout(ndb.Model):
    """Checkout - record for each checkout"""
    studentId = ndb.StringProperty()
    bookId = ndb.StringProperty()
    checkoutDate = ndb.DateProperty()
    dueDate = ndb.DateProperty()

class CheckoutForm(messages.Message):
    """CheckoutForm - Checkout outbound form message"""
    studentId = messages.StringField(1)
    bookId = messages.StringField(2)
    checkoutDate = messages.StringField(3)
    dueDate = messages.StringField(4)
    websafeKey = messages.StringField(5)
    studentName = messages.StringField(6)
    title = messages.StringField(7)
    author = messages.StringField(8)
    language = messages.StringField(9)

class CheckoutForms(messages.Message):
    """CheckoutForms - Multiple checkouts outbound form message"""
    items = messages.MessageField(CheckoutForm, 1, repeated = True)

class CheckoutRequestForm(messages.Message):
    """CheckoutRequestForm - for checking out or returning book"""
    studentKey = messages.StringField(1)
    bookId = messages.StringField(2)
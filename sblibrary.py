#!/usr/bin/env python

"""
sblibrary.py -- Library server-side Python App Engine API;
    uses Google Cloud Endpoints

author -- mangalambigais@gmail.com
"""
from datetime import datetime

import endpoints
from protorpc import messages
from protorpc import message_types
from protorpc import remote

from google.appengine.ext import ndb

from models import Book, BookForm, BookForms
from models import Student, StudentForm, StudentForms

from settings import WEB_CLIENT_ID

EMAIL_SCOPE = endpoints.EMAIL_SCOPE
API_EXPLORER_CLIENT_ID = endpoints.API_EXPLORER_CLIENT_ID

@endpoints.api( name='sblibrary',
                version='v1',
                allowed_client_ids=[WEB_CLIENT_ID, API_EXPLORER_CLIENT_ID],
                scopes=[EMAIL_SCOPE])
class SbLibraryApi(remote.Service):
    """SB Library API v0.1"""

    #Books#
    def _copyBookToForm(self, book):
        """Copy relevant fields from Book to BookForm."""
        bf = BookForm()
        bf.title = book.title
        bf.author = book.author
        bf.sbId = book.sbId
        bf.language = book.language
        bf.check_initialized()
        return bf

    @endpoints.method(message_types.VoidMessage, BookForms,
            path='books', http_method='GET', name='getBooks')
    def getBooks(self, request):
        """Return all books."""
        q = Book.query()
        return BookForms(items = [self._copyBookToForm(book) \
            for book in q])


    @endpoints.method(BookForm, BookForm,
            path='books', http_method='POST', name='addBook')
    def addBook(self, request):
        """create a book."""
        b_key = ndb.Key(Book, request.sbId)
        book = Book(key = b_key,
            title = request.title,
            author = request.author,
            sbId = request.sbId,
            language = request.language)
        book.put()
        return request

    @endpoints.method(BookForm, BookForm,
            path='book', http_method='POST', name='editBook')
    def editBook(self, request):
        """edit a book."""
        b_key = ndb.Key(Book, request.sbId)
        book = b_key.get()
        book.title = request.title
        book.author = request.author
        book.language = request.language
        book.put()
        return request

    #Students#
    def _copyStudentToForm(self, student):
        """Copy relevant fields from Student to StudentForm."""
        bf = StudentForm()
        bf.name = student.name
        bf.email = student.email
        bf.cellphone = student.cellphone
        bf.sbId = student.sbId
        bf.check_initialized()
        return bf

    @endpoints.method(message_types.VoidMessage, StudentForms,
            path='students', http_method='GET', name='getStudents')
    def getStudents(self, request):
        """Return all students."""
        q = Student.query()
        return StudentForms(items = [self._copyStudentToForm(student) \
            for student in q])


    @endpoints.method(StudentForm, StudentForm,
            path='students', http_method='POST', name='addStudent')
    def addStudent(self, request):
        """create a student."""
        b_key = ndb.Key(Student, request.sbId)
        student = Student(key = b_key,
            name = request.name,
            email = request.email,
            sbId = request.sbId,
            cellphone = request.cellphone)
        student.put()
        return request


# registers API
api = endpoints.api_server([SbLibraryApi])

#!/usr/bin/env python

"""
sblibrary.py -- Library server-side Python App Engine API;
    uses Google Cloud Endpoints

author -- mangalambigais@gmail.com
"""
from datetime import datetime, date, timedelta

import endpoints
import string
from protorpc import messages
from protorpc import message_types
from protorpc import remote

from google.appengine.ext import ndb

from models import Book, BookForm, BookForms
from models import Student, StudentForm, StudentForms
from models import CheckoutForm, CheckoutForms, CheckoutRequestForm

from settings import WEB_CLIENT_ID

EMAIL_SCOPE = endpoints.EMAIL_SCOPE
API_EXPLORER_CLIENT_ID = endpoints.API_EXPLORER_CLIENT_ID

GET_REQUEST = endpoints.ResourceContainer(
    message_types.VoidMessage,
    sbId=messages.StringField(1)
)

QUERY_REQUEST = endpoints.ResourceContainer(
    message_types.VoidMessage,
    sbId=messages.StringField(1),
    name=messages.StringField(2)
)

@endpoints.api( name='sblibrary',
                version='v1',
                allowed_client_ids=[WEB_CLIENT_ID, API_EXPLORER_CLIENT_ID],
                scopes=[EMAIL_SCOPE])
class SbLibraryApi(remote.Service):
    """SB Library API v0.1"""

    #Endpoints for Books
    def _copyBookToForm(self, book):
        """Copy relevant fields from Book to BookForm."""
        bf = BookForm()
        bf.title = string.capwords(book.title)
        bf.author = book.author
        bf.sbId = book.sbId
        bf.language = book.language
        bf.dueDate = str(book.dueDate)
        bf.check_initialized()
        return bf

    @endpoints.method(message_types.VoidMessage, BookForms,
            path='books', http_method='GET', name='getBooks')
    def getBooks(self, request):
        """Return all books."""
        q = Book.query()
        return BookForms(items = [self._copyBookToForm(book) \
            for book in q])

    @endpoints.method(QUERY_REQUEST, BookForms,
            path='querybooks', http_method='GET', name='queryBooks')
    def queryBooks(self, request):
        """Return books based on query."""
        q = Book.query()
        if request.sbId:
            q = q.filter( ndb.AND(
                Book.sbId >= request.sbId.upper(),
                Book.sbId < request.sbId.upper() + 'Z' ))
        elif request.name:
            q = q.filter( ndb.AND(
                Book.title >= request.name.lower(),
                Book.title < request.name.lower() + 'z'))

        return BookForms(items = [self._copyBookToForm(book) \
            for book in q])


    @endpoints.method(BookForm, BookForm,
            path='books', http_method='POST', name='addBook')
    def addBook(self, request):
        """create a book."""
        b_key = ndb.Key(Book, request.sbId)
        if b_key.get():
            raise endpoints.ConflictException(
                'Another book with same id already exists: %s' % request.sbId)
        book = Book(key = b_key,
            title = request.title.lower(),
            author = request.author,
            sbId = request.sbId.upper(),
            language = request.language)
        book.put()
        return request

    @endpoints.method(GET_REQUEST, BookForm,
        path='getBook', http_method='GET', name='getBook')
    def getBook(self, request):
        """get a Book"""
        bookKey = ndb.Key(Book, request.sbId)
        book = bookKey.get()
        if not book:
            raise endpoints.NotFoundException(
                'No book found with book Id: %s' % request.sbId)
        return self._copyBookToForm(book)


    @endpoints.method(BookForm, BookForm,
            path='book', http_method='POST', name='editBook')
    def editBook(self, request):
        """edit a book."""
        b_key = ndb.Key(Book, request.sbId.upper())
        book = b_key.get()
        book.title = request.title.lower()
        book.author = request.author
        book.language = request.language
        book.put()
        return request

    @endpoints.method(BookForm, message_types.VoidMessage,
        path='deleteBook', http_method='POST', name='deleteBook')
    def deleteBook(self, request):
        """delete a book"""
        book_key = ndb.Key(Book, request.sbId)
        book_key.delete()
        return message_types.VoidMessage()

    #End points for Students
    def _copyStudentToForm(self, student):
        """Copy relevant fields from Student to StudentForm."""
        sf = StudentForm()
        #return capitalized name. names are stored all lower for querying
        sf.name = string.capwords(student.name)
        sf.email = student.email
        sf.cellphone = student.cellphone
        sf.sbId = student.sbId
        sf.check_initialized()
        return sf

    @endpoints.method(message_types.VoidMessage, StudentForms,
            path='students', http_method='GET', name='getStudents')
    def getStudents(self, request):
        """Return all students."""
        q = Student.query()
        return StudentForms(items = [self._copyStudentToForm(student) \
            for student in q])

    @endpoints.method(QUERY_REQUEST, StudentForms,
            path='queryStudents', http_method='GET', name='queryStudents')
    def queryStudents(self, request):
        """Return student based on query."""
        q = Student.query()
        if request.sbId:
            q = q.filter( ndb.AND(
                Student.sbId >= request.sbId,
                Student.sbId < request.sbId + 'z' ))
        elif request.name:
            q = q.filter( ndb.AND(
                Student.name >= request.name.lower(),
                Student.name < request.name.lower() + 'z'))

        return StudentForms(items = [self._copyStudentToForm(student) \
            for student in q])


    @endpoints.method(StudentForm, StudentForm,
            path='students', http_method='POST', name='addStudent')
    def addStudent(self, request):
        """create a student."""
        b_key = ndb.Key(Student, request.sbId)
        if b_key.get():
            raise endpoints.ConflictException(
                'Another student with same id already exists: %s' % request.sbId)

        #we are going to store the name in lower case,
        #so we can query case insensitive

        student = Student(key = b_key,
            name = request.name.lower(),
            email = request.email,
            sbId = request.sbId,
            cellphone = request.cellphone)
        student.put()
        return request

    @endpoints.method(GET_REQUEST, StudentForm,
        path='getStudent', http_method='GET', name='getStudent')
    def getStudent(self, request):
        """get a Student"""
        studentKey = ndb.Key(Student, request.sbId)
        student = studentKey.get()
        if not student:
            raise endpoints.NotFoundException(
                'No book found with key: %s' % request.sbId)
        return self._copyStudentToForm(student)


    @endpoints.method(StudentForm, StudentForm,
            path='student', http_method='POST', name='editStudent')
    def editStudent(self, request):
        """edit a student."""
        s_key = ndb.Key(Student, request.sbId)
        student = s_key.get()
        student.name = request.name.lower()
        student.email = request.email
        student.cellphone = request.cellphone
        student.put()
        return request

    @endpoints.method(StudentForm, message_types.VoidMessage,
        path='deleteStudent', http_method='POST', name='deleteStudent')
    def deleteStudent(self, request):
        """delete a student"""
        student_key = ndb.Key(Student, request.sbId)
        student_key.delete()
        return message_types.VoidMessage()

    #Endpoints for checkouts

    @ndb.transactional(xg=True)
    def _doCheckout(self, bookId, studentId):
        today = date.today()
        dueDate = today + timedelta(days=28)

        book = ndb.Key(Book, bookId).get()
        student = ndb.Key(Student, studentId).get()
        student.checkedoutBookIds.append(bookId)
        student.put()
        book.studentId = studentId
        book.checkoutDate = today
        book.dueDate = dueDate
        book.put()

    @endpoints.method(CheckoutRequestForm, message_types.VoidMessage,
        path='checkout', http_method='POST', name='checkoutBook')
    def checkoutBook(self, request):
        """checkout a book"""
        self._doCheckout(request.bookId, request.studentId)
        return message_types.VoidMessage()


    @ndb.transactional(xg=True)
    def _doReturn(self, bookId):
        bookKey = ndb.Key(Book, bookId)
        book = bookKey.get()
        student = ndb.Key(Student, book.studentId).get()
        student.checkedoutBookIds.remove(bookId)
        del book.studentId
        del book.dueDate
        del book.checkoutDate
        book.put()
        student.put()

    @endpoints.method(GET_REQUEST, message_types.VoidMessage,
        path='return', http_method='POST', name='returnBook')
    def returnBook(self, request):
        """return a book"""
        self._doReturn(request.sbId)
        return message_types.VoidMessage()

    def _copyCheckoutToForm(self, checkout):
        """copy checkout model to form"""
        cf = CheckoutForm()
        cf.bookId = checkout.sbId
        cf.checkoutDate = str(checkout.checkoutDate)
        cf.dueDate = str(checkout.dueDate)
        cf.title = string.capwords(checkout.title)
        cf.author = checkout.author
        cf.language = checkout.language
        cf.studentId = checkout.studentId
        return cf


    @endpoints.method(message_types.VoidMessage, CheckoutForms,
        path='checkout', http_method='GET', name='getCheckouts')
    def getCheckouts(self, request):
        """get checkout records"""
        q = Book.query(Book.dueDate != None)
        return CheckoutForms(items = [self._copyCheckoutToForm(checkout) \
            for checkout in q])


    @endpoints.method( GET_REQUEST, CheckoutForms,
        path='getStudentCheckouts', http_method='GET', name='getStudentCheckouts')
    def getStudentCheckouts(self, request):
        """get checkout records"""
        s_key = ndb.Key(Student, request.sbId)
        student = s_key.get()

        bookIds = student.checkedoutBookIds
        ndbkeys = [ndb.Key(Book, bookId) \
            for bookId in bookIds]
        books = ndb.get_multi(ndbkeys)

        return CheckoutForms(items = [self._copyCheckoutToForm(checkout) \
            for checkout in books])

    @staticmethod
    def _getOverDue():
        """returns the email ids and messages for overdue checkouts"""
        overdueCheckouts = Book.query(Book.duedate < date.today()) \
            .fetch( projection=[Book.title, Book.studentId] )

        #create a dictionary so we can consolidate the books per email
        overDueDict = {}
        for checkout in overdueCheckouts:
            email = ndb.Key(Student, studentId).get().email,
            if not email in overDueDict:
                overDueDict[email] = []

            overDueDict[email].append(string.capwords(checkout.title))

        overDueArr = []
        for k, v in overDueDict.iteritems():
            message = 'The following books are overdue:'+ \
                ' Please return them to Shishu Bharathi ASAP:\n'
            for book in v:
                message += book + '\n'
            overDueArr.append((k, message))

        return overDueArr

# registers API
api = endpoints.api_server([SbLibraryApi])

#!/usr/bin/env python

"""
sblibrary.py -- Library server-side Python App Engine API;
    uses Google Cloud Endpoints

author -- mangalambigais@gmail.com
"""
from datetime import datetime, date, timedelta

import endpoints
from protorpc import messages
from protorpc import message_types
from protorpc import remote

from google.appengine.ext import ndb

from models import Book, BookForm, BookForms
from models import Student, StudentForm, StudentForms
from models import Checkout, CheckoutForm, CheckoutForms, CheckoutRequestForm

from settings import WEB_CLIENT_ID

EMAIL_SCOPE = endpoints.EMAIL_SCOPE
API_EXPLORER_CLIENT_ID = endpoints.API_EXPLORER_CLIENT_ID

GET_REQUEST = endpoints.ResourceContainer(
    message_types.VoidMessage,
    websafeKey=messages.StringField(1),
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
        bf.title = book.title
        bf.author = book.author
        bf.sbId = book.sbId
        bf.language = book.language
        bf.websafeKey = book.key.urlsafe()
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

    @endpoints.method(GET_REQUEST, BookForm,
        path='book/{websafeKey}', http_method='GET', name='getBook')
    def getBook(self, request):
        """get a Book"""
        book = ndb.Key(urlsafe = request.websafeKey).get()
        if not book:
            raise endpoints.NotFoundException(
                'No book found with key: %s' % request.websafeKey)
        return self._copyBookToForm(book)


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

    #End points for Students
    def _copyStudentToForm(self, student):
        """Copy relevant fields from Student to StudentForm."""
        sf = StudentForm()
        sf.name = student.name
        sf.email = student.email
        sf.cellphone = student.cellphone
        sf.sbId = student.sbId
        sf.websafeKey = student.key.urlsafe()
        sf.check_initialized()
        return sf

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

    @endpoints.method(GET_REQUEST, StudentForm,
        path='student/{websafeKey}', http_method='GET', name='getStudent')
    def getStudent(self, request):
        """get a Student"""
        student = ndb.Key(urlsafe = request.websafeKey).get()
        if not student:
            raise endpoints.NotFoundException(
                'No book found with key: %s' % request.websafeKey)
        return self._copyStudentToForm(student)


    @endpoints.method(StudentForm, StudentForm,
            path='student', http_method='POST', name='editStudent')
    def editStudent(self, request):
        """edit a student."""
        s_key = ndb.Key(Student, request.sbId)
        student = s_key.get()
        student.name = request.name
        student.email = request.email
        student.cellphone = request.cellphone
        student.put()
        return request

    #Endpoints for checkouts

    @endpoints.method(CheckoutRequestForm, CheckoutForm,
        path='checkout', http_method='POST', name='checkoutBook')
    def checkoutBook(self, request):
        """checkout a book"""
        today = date.today()
        duedate = today + timedelta(days=28)
        parentKey = ndb.Key(urlsafe= request.studentKey)
        student = parentKey.get()
        checkoutId = Checkout.allocate_ids(size=1, parent=parentKey)[0]
        checkoutKey = ndb.Key(Checkout, checkoutId, parent = parentKey)

        book = ndb.Key(Book, request.bookId).get()

        checkout = Checkout(
            key = checkoutKey,
            studentId = student.sbId,
            bookId = request.bookId,
            checkoutDate = today,
            dueDate = duedate,
            studentName = student.name,
            title = book.title,
            author = book.author,
            language = book.language
        )
        checkout.put()
        return self._copyCheckoutToForm(checkout)

    @endpoints.method(GET_REQUEST, message_types.VoidMessage,
        path='return', http_method='POST', name='returnBook')
    def returnBook(self, request):
        """return a book"""
        checkout_key = ndb.Key(urlsafe=request.websafeKey)
        checkout_key.delete()
        return message_types.VoidMessage()

    def _copyCheckoutToForm(self, checkout):
        """copy checkout model to form"""
        cf = CheckoutForm()
        cf.studentId = checkout.studentId
        cf.bookId = checkout.bookId
        cf.checkoutDate = str(checkout.checkoutDate)
        cf.dueDate = str(checkout.dueDate)
        cf.studentName = checkout.studentName
        cf.title = checkout.title
        cf.author = checkout.author
        cf.language = checkout.language
        cf.websafeKey = checkout.key.urlsafe()
        return cf


    @endpoints.method(message_types.VoidMessage, CheckoutForms,
        path='checkout', http_method='GET', name='getCheckouts')
    def getCheckouts(self, request):
        """get checkout records"""
        q = Checkout.query()
        return CheckoutForms(items = [self._copyCheckoutToForm(checkout) \
            for checkout in q])


    @endpoints.method( GET_REQUEST, CheckoutForms,
        path='studentcheckout', http_method='GET', name='getStudentCheckouts')
    def getStudentCheckouts(self, request):
        """get checkout records"""
        student_key = ndb.Key(urlsafe=request.websafeKey)
        q = Checkout.query(ancestor = student_key)
        return CheckoutForms(items = [self._copyCheckoutToForm(checkout) \
            for checkout in q])

    @staticmethod
    def _getOverDue():
        """returns the email ids and messages for overdue checkouts"""
        #overdueCheckouts = Checkout.query(Checkout.duedate < date.today()) \
        overdueCheckouts = Checkout.query() \
            .fetch( projection=[Checkout.title, Checkout.studentId] )

        #create a dictionary so we can consolidate the books per email
        overDueDict = {}
        for checkout in overdueCheckouts:
            email = ndb.Key(Student,checkout.studentId).get().email,
            if not email in overDueDict:
                overDueDict[email] = []
            overDueDict[email].append(checkout.title)

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

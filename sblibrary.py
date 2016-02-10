#!/usr/bin/env python

"""
sblibrary.py -- Library server-side Python App Engine API;
    uses Google Cloud Endpoints

author -- mangalambigais@gmail.com
"""
from datetime import datetime, date, timedelta

import endpoints, string, logging
from protorpc import messages
from protorpc import message_types
from protorpc import remote

from google.appengine.ext import ndb
from google.appengine.api import users
from google.appengine.datastore.datastore_query import Cursor

from models import Book, BookForm, BookForms
from models import Student, StudentForm, StudentForms
from models import CheckoutForm, CheckoutForms, CheckoutRequestForm

from settings import WEB_CLIENT_ID, WEB_CLIENT_ID_WALPOLE
from google.appengine.api import oauth
import urllib2, json
from google.appengine.api import urlfetch

EMAIL_SCOPE = endpoints.EMAIL_SCOPE
API_EXPLORER_CLIENT_ID = endpoints.API_EXPLORER_CLIENT_ID
PAGE_SIZE = 10

GET_REQUEST = endpoints.ResourceContainer(
    message_types.VoidMessage,
    sbId=messages.StringField(1)
)

QUERY_REQUEST = endpoints.ResourceContainer(
    message_types.VoidMessage,
    sbId=messages.StringField(1),
    name=messages.StringField(2),
    cursor=messages.StringField(3)
)

CHECKOUT_QUERY_REQUEST = endpoints.ResourceContainer(
    message_types.VoidMessage,
    sbId=messages.StringField(1),
    name=messages.StringField(2),
    cursor=messages.StringField(3),
    overDue=messages.BooleanField(4)
)

@endpoints.api( name='sblibrary',
                version='v1',
                allowed_client_ids=[WEB_CLIENT_ID, WEB_CLIENT_ID_WALPOLE, API_EXPLORER_CLIENT_ID],
                scopes=[EMAIL_SCOPE])
class SbLibraryApi(remote.Service):
    """SB Library API v0.1"""

    @endpoints.method(GET_REQUEST, BookForm,
        path='getIsbnDetails', http_method='GET', name='getIsbnDetails')
    def getIsbnDetails(self, request):
        """get a Book"""
        user = endpoints.get_current_user()
        if not user:
            raise endpoints.UnauthorizedException('Authorization required')

        url = "http://isbndb.com/api/v2/json/N295NRWI/book/"+request.sbId
        result = urlfetch.fetch(url)
        logging.info(result.status_code)
        if  result.status_code == 200:
            logging.info(result.content)
            bookdata = json.loads(result.content)
            bf = BookForm()
            if bookdata["data"] and bookdata["data"][0]:
                bf.title = bookdata["data"][0]["title_latin"]
                bf.publisher = bookdata["data"][0]["publisher_name"]
                bf.editionYear = bookdata["data"][0]["edition_info"]
                bf.isbn = request.sbId
                if bookdata["data"][0]["author_data"] and bookdata["data"][0]["author_data"][0]:
                    bf.author = bookdata["data"][0]["author_data"][0]["name"]
                #TODO: fill language
                #bf.language = bookdata["data"][0]["language"]
            return bf
        else:
            logging.error(result)
            raise endpoints.NotFoundException(
                'No book found with Isbn Id: %s' % request.sbId)


    def _ensureAdmin(self):
        user = endpoints.get_current_user()

        if user:
            logging.info('user logged in as ' + user.email())
            if not oauth.is_current_user_admin(EMAIL_SCOPE):
                raise endpoints.UnauthorizedException('Admin rights required')
        else:
            raise endpoints.UnauthorizedException('Admin rights required')

    #Endpoints for Books
    def _copyBookToForm(self, book):
        """Copy relevant fields from Book to BookForm."""
        bf = BookForm()

        bf.title = string.capwords(book.title)
        bf.author = book.author
        bf.sbId = book.sbId
        bf.language = book.language
        bf.dueDate = str(book.dueDate)
        bf.volume = book.volume
        bf.isbn = book.isbn
        bf.price = book.price
        bf.notes = book.notes
        bf.suggestedGrade = book.suggestedGrade
        bf.category = book.category
        bf.publisher = book.publisher
        bf.mediaType = book.mediaType
        bf.editionYear = book.editionYear
        bf.donor = book.donor
        bf.comments = book.comments
        bf.createdBy = book.createdBy
        bf.createdDate = str(book.createdDate)
        bf.lastUpdatedBy = book.lastUpdatedBy
        bf.lastUpdatedDate = str(book.lastUpdatedDate)
        bf.reference = book.reference

        bf.check_initialized()
        return bf

    @endpoints.method(message_types.VoidMessage, BookForms,
            path='books', http_method='GET', name='getBooks')
    def getBooks(self, request):
        """Return all books."""
        self._ensureAdmin()
        q = Book.query()
        return BookForms(items = [self._copyBookToForm(book) \
            for book in q])

    @endpoints.method(QUERY_REQUEST, BookForms,
            path='querybooks', http_method='GET', name='queryBooks')
    def queryBooks(self, request):
        """Return books based on query."""
        self._ensureAdmin()
        q = Book.query()
        #TODO: get projection, not all columns
        if request.sbId:
            q = q.filter( ndb.AND(
                Book.sbId >= request.sbId.upper(),
                Book.sbId < request.sbId.upper() + 'Z' ))
            q = q.order(Book.sbId)
        elif request.name:
            q = q.filter( ndb.AND(
                Book.title >= request.name.lower(),
                Book.title < request.name.lower() + 'z'))
            q = q.order(Book.title)

        curs = Cursor(urlsafe=request.cursor)

        books, nextcurs, more = q.fetch_page(PAGE_SIZE, start_cursor=curs)

        nextcursor = None
        if more and nextcurs:
            nextcursor = nextcurs.urlsafe()

        return BookForms(items = [self._copyBookToForm(book) \
            for book in books], cursor = nextcursor)


    @endpoints.method(BookForm, BookForm,
            path='books', http_method='POST', name='addBook')
    def addBook(self, request):
        """create a book."""
        self._ensureAdmin()
        b_key = ndb.Key(Book, request.sbId.upper())
        if b_key.get():
            raise endpoints.ConflictException(
                'Another book with same id already exists: %s' % request.sbId)

        email = endpoints.get_current_user().email()

        book = Book (key = b_key,
            title = request.title.lower(),
            author = request.author,
            sbId = request.sbId.upper(),
            language = request.language,
            volume = request.volume,
            isbn = request.isbn,
            price = request.price,
            notes = request.notes,
            suggestedGrade = request.suggestedGrade,
            category = request.category,
            publisher = request.publisher,
            mediaType = request.mediaType,
            editionYear = request.editionYear,
            donor = request.donor,
            comments = request.comments,
            reference = request.reference,
            createdBy = email,
            createdDate = date.today()
            )
        book.put()
        return request

    @endpoints.method(GET_REQUEST, BookForm,
        path='getBook', http_method='GET', name='getBook')
    def getBook(self, request):
        """get a Book"""
        user = endpoints.get_current_user()
        if not user:
            raise endpoints.UnauthorizedException('Authorization required')

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
        self._ensureAdmin()

        email = endpoints.get_current_user().email()

        b_key = ndb.Key(Book, request.sbId.upper())
        book = b_key.get()
        book.title = request.title.lower()
        book.author = request.author
        book.language = request.language
        book.volume = request.volume
        book.isbn = request.isbn
        book.price = request.price
        book.notes = request.notes
        book.suggestedGrade = request.suggestedGrade
        book.category = request.category
        book.publisher = request.publisher
        book.mediaType = request.mediaType
        book.editionYear = request.editionYear
        book.donor = request.donor
        book.comments = request.comments
        book.reference = request.reference
        book.lastUpdatedBy = email
        book.lastUpdatedDate = date.today()
        book.put()
        return request

    @endpoints.method(BookForm, message_types.VoidMessage,
        path='deleteBook', http_method='POST', name='deleteBook')
    def deleteBook(self, request):
        """delete a book"""
        self._ensureAdmin()
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
        self._ensureAdmin()
        q = Student.query()
        return StudentForms(items = [self._copyStudentToForm(student) \
            for student in q])

    @endpoints.method(QUERY_REQUEST, StudentForms,
            path='queryStudents', http_method='GET', name='queryStudents')
    def queryStudents(self, request):
        """Return student based on query."""
        self._ensureAdmin()
        q = Student.query()
        if request.sbId:
            q = q.filter( ndb.AND(
                Student.sbId >= request.sbId,
                Student.sbId < request.sbId + 'z' ))
            q = q.order(Student.sbId)
        elif request.name:
            q = q.filter( ndb.AND(
                Student.name >= request.name.lower(),
                Student.name < request.name.lower() + 'z'))
            q = q.order(Student.name)

        curs = Cursor(urlsafe=request.cursor)

        students, nextcurs, more = q.fetch_page(PAGE_SIZE, start_cursor=curs)

        nextcursor = None
        if more and nextcurs:
            nextcursor = nextcurs.urlsafe()

        return StudentForms(items = [self._copyStudentToForm(student) \
            for student in students], cursor = nextcursor)


    @endpoints.method(StudentForm, StudentForm,
            path='students', http_method='POST', name='addStudent')
    def addStudent(self, request):
        """create a student."""
        self._ensureAdmin()
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
        self._ensureAdmin()
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
        self._ensureAdmin()
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
        self._ensureAdmin()
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
        book.checkedOut = True
        book.put()

    @endpoints.method(CheckoutRequestForm, message_types.VoidMessage,
        path='checkout', http_method='POST', name='checkoutBook')
    def checkoutBook(self, request):
        """checkout a book"""
        self._ensureAdmin()
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
        del book.checkedOut
        book.put()
        student.put()

    @endpoints.method(GET_REQUEST, message_types.VoidMessage,
        path='return', http_method='POST', name='returnBook')
    def returnBook(self, request):
        """return a book"""
        self._ensureAdmin()
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
        self._ensureAdmin()
        q = Book.query(Book.checkedOut == True)
        return CheckoutForms(items = [self._copyCheckoutToForm(checkout) \
            for checkout in q])

    @endpoints.method(CHECKOUT_QUERY_REQUEST, CheckoutForms,
        path='queryCheckouts', http_method='GET', name='queryCheckouts')
    def queryCheckouts(self, request):
        """get checkout records"""
        self._ensureAdmin()
        q = Book.query(Book.checkedOut == True)

        if request.overDue == True:
            q = q.filter(Book.dueDate<date.today())
        elif request.sbId:
            q = q.filter( ndb.AND(
                Book.sbId >= request.sbId.upper(),
                Book.sbId < request.sbId.upper() + 'Z' ))
            q = q.order(Book.sbId)
        elif request.name:
            q = q.filter( ndb.AND(
                Book.title >= request.name.lower(),
                Book.title < request.name.lower() + 'z'))
            q = q.order(Book.title)

        curs = Cursor(urlsafe=request.cursor)

        books, nextcurs, more = q.fetch_page(PAGE_SIZE, start_cursor=curs)

        nextcursor = None
        if more and nextcurs:
            nextcursor = nextcurs.urlsafe()

        return CheckoutForms(items = [self._copyCheckoutToForm(checkout) \
            for checkout in books], cursor = nextcursor)


    @endpoints.method( GET_REQUEST, CheckoutForms,
        path='getStudentCheckouts', http_method='GET', name='getStudentCheckouts')
    def getStudentCheckouts(self, request):
        """get checkout records"""
        self._ensureAdmin()
        s_key = ndb.Key(Student, request.sbId)
        student = s_key.get()

        bookIds = student.checkedoutBookIds
        ndbkeys = [ndb.Key(Book, bookId) \
            for bookId in bookIds]
        books = ndb.get_multi(ndbkeys)

        return CheckoutForms(items = [self._copyCheckoutToForm(checkout) \
            for checkout in books])

    @endpoints.method( GET_REQUEST, CheckoutForms,
        path='getUserCheckouts', http_method='GET', name='getUserCheckouts')
    def getUserCheckouts(self, request):
        """get checkout records for this user"""
        user = endpoints.get_current_user()
        if not user:
            raise endpoints.UnauthorizedException('Authorization required')

        students = Student.query(Student.email == user.email())
        bookIds=[]
        for student in students:
            bookIds += student.checkedoutBookIds
        ndbkeys = [ndb.Key(Book, bookId) \
            for bookId in bookIds]
        books = ndb.get_multi(ndbkeys)

        return CheckoutForms(items = [self._copyCheckoutToForm(checkout) \
            for checkout in books])


    @staticmethod
    def _getOverDue():
        """returns the email ids and messages for overdue checkouts"""
        overdueCheckouts = Book.query(
            ndb.AND(Book.dueDate != None,
                Book.dueDate < date.today())).fetch()

        #create a dictionary so we can consolidate the books per email
        overDueDict = {}
        for checkout in overdueCheckouts:
            email = ndb.Key(Student, checkout.studentId).get().email
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

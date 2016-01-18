'use strict';

/**
 * The root libraryApp module.
 *
 * @type {libraryApp|*|{}}
 */
var libraryApp = libraryApp || {};

/**
 * @ngdoc module
 * @name libraryControllers
 *
 * @description
 * Angular module for controllers.
 *
 */
libraryApp.controllers = angular.module('libraryControllers', ['ui.bootstrap']);

/**
 * @ngdoc controller
 * @name CreateBookCtrl
 *
 * @description
 * A controller used for Create Books page.
 */
libraryApp.controllers.controller('CreateBookCtrl',
    function ($scope, $log, oauth2Provider, HTTP_ERRORS) {

        /**
         * The book object being edited in the page.
         * @type {{}|*}
         */
        $scope.book = $scope.book || {};

        $scope.languages = [
            'English',
            'Tamil',
            'Kannada',
            'Telugu',
            'Hindi',
            'Gujarathi',
            'Marathi',
            'Sanskrit'
        ];

        /**
         * Tests if $scope.book is valid.
         * @param bookForm the form object from the create_book.html page.
         * @returns {boolean|*} true if valid, false otherwise.
         */
        $scope.isValidBook = function (bookForm) {
            return !bookForm.$invalid;
        }

        /**
         * Invokes the book.createBook API.
         *
         * @param bookForm the form object.
         */
        $scope.createBook = function(bookForm) {

            $scope.submitted = false;
            $scope.loading = true;

            gapi.client.sblibrary.addBook($scope.book).
                execute(function (resp) {
                    $scope.$apply(function () {
                        $scope.loading = false;
                        if (resp.error) {
                            // The request has failed.
                            var errorMessage = resp.error.message || '';
                            $scope.messages = 'Failed to create book : ' + errorMessage;
                            $scope.alertStatus = 'warning';
                            $log.error($scope.messages );
                        } else {
                            // The request has succeeded.
                            $scope.submitted = false;
                            $scope.messages = 'Book created successfully : ';
                            $scope.alertStatus = 'success';
                            $log.info($scope.messages);
                        }
                        $scope.submitted = true;
                    });
                });
        }
    }
);

/**
 * @ngdoc controller
 * @name EditBookCtrl
 *
 * @description
 * A controller used for Edit Books page.
 */
libraryApp.controllers.controller('EditBookCtrl',
    function ($scope, $log, $routeParams, $location, HTTP_ERRORS) {

        /**
         * The book object being edited in the page.
         * @type {{}|*}
         */
        $scope.book =  {};

        $scope.languages = [
            'English',
            'Tamil',
            'Kannada',
            'Telugu',
            'Hindi',
            'Gujarathi',
            'Marathi',
            'Sanskrit'
        ];

        $scope.init = function() {
            $scope.loading = true;
            gapi.client.sblibrary.getBook({
                sbId: $routeParams.bookId
            }).execute(function (resp) {
                $scope.$apply(function () {
                    $scope.loading = false;
                    if (resp.error) {
                        // The request has failed.
                        var errorMessage = resp.error.message || '';
                        $scope.messages = 'Failed to get the book : '
                            + $routeParams.bookId + ' ' + errorMessage;
                        $scope.alertStatus = 'warning';
                        $log.error($scope.messages);
                    } else {
                        // The request has succeeded.
                        $scope.alertStatus = 'success';
                        $scope.book = resp.result;
                    }
                });
            });
        };

        /**
         * Tests if $scope.book is valid.
         * @param bookForm the form object from the create_book.html page.
         * @returns {boolean|*} true if valid, false otherwise.
         */
        $scope.isValidBook = function (bookForm) {
            return !bookForm.$invalid;
        }

        /**
         * Invokes the book.editBook API.
         *
         * @param bookForm the form object.
         */
        $scope.updateBook = function(bookForm) {

            $scope.submitted = false;
            $scope.loading = true;

            gapi.client.sblibrary.editBook($scope.book).
                execute(function (resp) {
                    $scope.$apply(function () {
                        $scope.loading = false;
                        if (resp.error) {
                            // The request has failed.
                            var errorMessage = resp.error.message || '';
                            $scope.messages = 'Failed to update book : ' + errorMessage;
                            $scope.alertStatus = 'warning';
                            $log.error($scope.messages );
                        } else {
                            // The request has succeeded.
                            $scope.submitted = false;
                            $scope.messages = 'Book updated successfully : ';
                            $scope.alertStatus = 'success';
                            $log.info($scope.messages);
                            $location.path('/books')
                        }
                        $scope.submitted = true;
                    });
                });
        }
    }
);

/**
 * @ngdoc controller
 * @name DeleteBookCtrl
 *
 * @description
 * A controller used for Delete Books page.
 */
libraryApp.controllers.controller('DeleteBookCtrl',
    function ($scope, $log, $routeParams, $location, HTTP_ERRORS) {

        /**
         * The book object being deleted in the page.
         * @type {{}|*}
         */
        $scope.book =  {};

        $scope.init = function() {
            $scope.loading = true;
            gapi.client.sblibrary.getBook({
                sbId: $routeParams.bookId
            }).execute(function (resp) {
                $scope.$apply(function () {
                    $scope.loading = false;
                    if (resp.error) {
                        // The request has failed.
                        var errorMessage = resp.error.message || '';
                        $scope.messages = 'Failed to get the book : '
                            + $routeParams.bookId + ' ' + errorMessage;
                        $scope.alertStatus = 'warning';
                        $log.error($scope.messages);
                    } else {
                        // The request has succeeded.
                        $scope.alertStatus = 'success';
                        $scope.book = resp.result;
                    }
                });
            });
        };

        /**
         * Invokes the book.deleteBook API.
         *
         * @param bookForm the form object.
         */
        $scope.deleteBook = function(bookForm) {

            $scope.submitted = false;
            $scope.loading = true;

            gapi.client.sblibrary.deleteBook($scope.book).
                execute(function (resp) {
                    $scope.$apply(function () {
                        $scope.loading = false;
                        if (resp.error) {
                            // The request has failed.
                            var errorMessage = resp.error.message || '';
                            $scope.messages = 'Failed to delete book : ' + errorMessage;
                            $scope.alertStatus = 'warning';
                            $log.error($scope.messages );
                        } else {
                            // The request has succeeded.
                            $scope.submitted = false;
                            $scope.messages = 'Book deleted successfully : ';
                            $scope.alertStatus = 'success';
                            $log.info($scope.messages);
                            $location.path('/books')
                        }
                        $scope.submitted = true;
                    });
                });
        }
    }
);
/**
 * @ngdoc controller
 * @name ShowBooksCtrl
 *
 * @description
 * A controller used for Books page.
 */
libraryApp.controllers.controller('ShowBooksCtrl',
    function ($scope, $log, $location, oauth2Provider, HTTP_ERRORS) {
        /**
         * Holds the books currently displayed in the page.
         * @type {Array}
         */
        $scope.books = [];

        $scope.queryBooks = function () {
            $scope.submitted = false;
            $scope.loading = true;

            gapi.client.sblibrary.queryBooks(
                {sbId: $scope.searchId, name: $scope.searchTitle}
                ).execute(function (resp) {
                    $scope.$apply(function () {
                        $scope.loading = false;
                        if (resp.error) {
                            // The request has failed.
                            var errorMessage = resp.error.message || '';
                            $scope.messages = 'Failed to query books : ' + errorMessage;
                            $scope.alertStatus = 'warning';
                            $log.error($scope.messages );
                        } else {
                            // The request has succeeded.
                            $scope.submitted = false;
                            var count = 0;
                            if (resp.items)
                                count = resp.items.length;
                            $scope.messages = 'Search returned '+
                                count + ' books.';
                            $scope.alertStatus = 'success';
                            $log.info($scope.messages);

                            $scope.books = [];
                            angular.forEach(resp.items, function (book) {
                                $scope.books.push(book);
                            });
                        }
                        $scope.submitted = true;
                    });
                }
            );
        }

        $scope.dblClick = function(book)
        {
            $location.path('/books/edit/'+book.sbId);
        }
    }
);

/**
 * @ngdoc controller
 * @name CreateStudentCtrl
 *
 * @description
 * A controller used for Create Student page.
 */
libraryApp.controllers.controller('CreateStudentCtrl',
    function ($scope, $log, oauth2Provider, HTTP_ERRORS) {

        /**
         * The Student object being edited in the page.
         * @type {{}|*}
         */
        $scope.student = $scope.student || {};

        /**
         * Tests if $scope.student is valid.
         * @param studentForm the form object from the create_student.html page.
         * @returns {boolean|*} true if valid, false otherwise.
         */
        $scope.isValidStudent = function (studentForm) {
            return !studentForm.$invalid;
        }

        /**
         * Invokes the library.createStudent API.
         *
         * @param StudentForm the form object.
         */
        $scope.createStudent = function(studentForm) {

            $scope.submitted = false;
            $scope.loading = true;

            gapi.client.sblibrary.addStudent($scope.student).
                execute(function (resp) {
                    $scope.$apply(function () {
                        $scope.loading = false;
                        if (resp.error) {
                            // The request has failed.
                            var errorMessage = resp.error.message || '';
                            $scope.messages = 'Failed to createStudent : ' + errorMessage;
                            $scope.alertStatus = 'warning';
                            $log.error($scope.messages );
                        } else {
                            // The request has succeeded.
                            $scope.submitted = false;
                            $scope.messages = 'Added student successfully : ';
                            $scope.alertStatus = 'success';
                            $log.info($scope.messages);

                        }
                        $scope.submitted = true;
                    });
                });
        }
    }
);
/**
 * @ngdoc controller
 * @name EditStudentCtrl
 *
 * @description
 * A controller used for Edit Student page.
 */
libraryApp.controllers.controller('EditStudentCtrl',
    function ($scope, $log, $routeParams, $location, HTTP_ERRORS) {

        /**
         * The Student object being edited in the page.
         */
        $scope.student = {};

        /**
         * Initializes the $scope.student object
         * calls library.getStudent API
         */
        $scope.init = function () {
            $scope.submitted = false;
            $scope.loading = true;

            gapi.client.sblibrary.getStudent({
                sbId: $routeParams.studentId
            }).execute(function (resp) {
                $scope.$apply(function () {
                    $scope.loading = false;
                    if (resp.error) {
                        // The request has failed.
                        var errorMessage = resp.error.message || '';
                        $scope.messages = 'Failed to get the student : ' +
                            $routeParams.studentId + ' ' + errorMessage;
                        $scope.alertStatus = 'warning';
                        $log.error($scope.messages);
                    } else {
                        // The request has succeeded.
                        $scope.alertStatus = 'success';
                        $scope.student = resp.result;
                    }
                });
            });

        }

        /**
         * Tests if $scope.student is valid.
         * @param studentForm the form object from the create_student.html page.
         * @returns {boolean|*} true if valid, false otherwise.
         */
        $scope.isValidStudent = function (studentForm) {
            return !studentForm.$invalid;
        }

        /**
         * Invokes the library.createStudent API.
         *
         * @param StudentForm the form object.
         */
        $scope.updateStudent = function(studentForm) {

            $scope.submitted = false;
            $scope.loading = true;

            gapi.client.sblibrary.editStudent($scope.student).
                execute(function (resp) {
                    $scope.$apply(function () {
                        $scope.loading = false;
                        if (resp.error) {
                            // The request has failed.
                            var errorMessage = resp.error.message || '';
                            $scope.messages = 'Failed to update Student : ' + errorMessage;
                            $scope.alertStatus = 'warning';
                            $log.error($scope.messages );
                        } else {
                            // The request has succeeded.
                            $scope.submitted = false;
                            $scope.messages = 'Updated student successfully : ';
                            $scope.alertStatus = 'success';
                            $log.info($scope.messages);
                            $location.path('/students');
                        }
                        $scope.submitted = true;
                    });
                });
        }
    }
);
/**
 * @ngdoc controller
 * @name DeleteStudentCtrl
 *
 * @description
 * A controller used for Delete Student page.
 */
libraryApp.controllers.controller('DeleteStudentCtrl',
    function ($scope, $log, $routeParams, $location, HTTP_ERRORS) {

        /**
         * The Student object being deleted in the page.
         */
        $scope.student = {};

        /**
         * Initializes the $scope.student object
         * calls library.getStudent API
         */
        $scope.init = function () {
            $scope.submitted = false;
            $scope.loading = true;

            gapi.client.sblibrary.getStudent({
                sbId: $routeParams.studentId
            }).execute(function (resp) {
                $scope.$apply(function () {
                    $scope.loading = false;
                    if (resp.error) {
                        // The request has failed.
                        var errorMessage = resp.error.message || '';
                        $scope.messages = 'Failed to get the student : '
                            + $routeParams.studentId + ' ' + errorMessage;
                        $scope.alertStatus = 'warning';
                        $log.error($scope.messages);
                    } else {
                        // The request has succeeded.
                        $scope.alertStatus = 'success';
                        $scope.student = resp.result;
                    }
                });
            });

        }

        /**
         * Invokes the library.deleteStudent API.
         *
         * @param StudentForm the form object.
         */
        $scope.deleteStudent = function(studentForm) {

            $scope.submitted = false;
            $scope.loading = true;

            gapi.client.sblibrary.deleteStudent($scope.student).
                execute(function (resp) {
                    $scope.$apply(function () {
                        $scope.loading = false;
                        if (resp.error) {
                            // The request has failed.
                            var errorMessage = resp.error.message || '';
                            $scope.messages = 'Failed to delete Student : ' + errorMessage;
                            $scope.alertStatus = 'warning';
                            $log.error($scope.messages );
                        } else {
                            // The request has succeeded.
                            $scope.submitted = false;
                            $scope.messages = 'Deleted student successfully : ';
                            $scope.alertStatus = 'success';
                            $log.info($scope.messages);
                            $location.path('/students');
                        }
                        $scope.submitted = true;
                    });
                });
        }
    }
);
/**
 * @ngdoc controller
 * @name ShowStudentsCtrl
 *
 * @description
 * A controller used for Students page.
 */
libraryApp.controllers.controller('ShowStudentsCtrl',
    function ($scope, $log, $location, oauth2Provider, HTTP_ERRORS) {
        /**
         * Holds the students currently displayed in the page.
         * @type {Array}
         */
        $scope.students = [];

        $scope.dblClick = function(student)
        {
            $location.path('/students/checkout/'+student.sbId)
        }

        $scope.queryStudents = function () {
            $scope.submitted = false;
            $scope.loading = true;

            gapi.client.sblibrary.queryStudents(
                {sbId: $scope.searchId, name: $scope.searchName}
                ).execute(function (resp) {
                    $scope.$apply(function () {
                        $scope.loading = false;
                        if (resp.error) {
                            // The request has failed.
                            var errorMessage = resp.error.message || '';
                            $scope.messages = 'Failed to query students : ' +
                                errorMessage;
                            $scope.alertStatus = 'warning';
                            $log.error($scope.messages );
                        } else {
                            // The request has succeeded.
                            $scope.submitted = false;
                            var count = 0;
                            if (resp.items)
                                count = resp.items.length;

                            $scope.messages = 'Search returned ' +
                                 count + ' students.';
                            $scope.alertStatus = 'success';
                            $log.info($scope.messages);

                            $scope.students = [];
                            angular.forEach(resp.items, function (student) {
                                $scope.students.push(student);
                            });
                        }
                        $scope.submitted = true;
                    });
                }
            );
        }

    }
);

/**
 * @ngdoc controller
 * @name CheckoutCtrl
 *
 * @description
 * A controller used for Checkout page.
 */
libraryApp.controllers.controller('CheckoutCtrl',
    function ($scope, $log, $routeParams, oauth2Provider, HTTP_ERRORS) {
        /**
         * Holds the checkouts currently displayed in the page.
         * @type {Array}
         */
        $scope.checkouts = [];
        /**
         * Holds the books currently available to display in the page.
         * @type {Array}
         */
        $scope.books = [];

        $scope.init = function () {
            $scope.submitted = false;
            $scope.loading = true;
            $scope.books = [];
            $scope.checkouts = [];

            //get checkouts for this student
            gapi.client.sblibrary.
                getStudentCheckouts({sbId: $routeParams.studentId}).
                execute(function (resp) {
                    $scope.$apply(function () {
                        $scope.loading = false;
                        if (resp.error) {
                            // The request has failed.
                            var errorMessage = resp.error.message || '';
                            $scope.messages = 'Failed to query checkouts : ' +
                                errorMessage;
                            $scope.alertStatus = 'warning';
                            $log.error($scope.messages );
                        } else {
                            // The request has succeeded.
                            $scope.submitted = false;
                            var count = 0;
                            if (resp.items)
                                count = resp.items.length;
                            $scope.messages = 'Student has ' +
                                 count +' books checked out ';
                            $scope.alertStatus = 'success';
                            $log.info($scope.messages);

                            $scope.students = [];
                            angular.forEach(resp.items, function (checkout) {
                                $scope.checkouts.push(checkout);
                            });
                        }
                        $scope.submitted = true;
                    });
                }
            );
        };

        $scope.checkin = function(bookId) {
            $scope.submitted = false;
            $scope.loading = true;
            gapi.client.sblibrary.returnBook({sbId: bookId}).
                execute(function (resp) {
                    $scope.$apply(function () {
                        $scope.loading = false;
                        if (resp.error) {
                            // The request has failed.
                            var errorMessage = resp.error.message || '';
                            $scope.messages = 'Failed to return book : ' + errorMessage;
                            $scope.alertStatus = 'warning';
                            $log.error($scope.messages );
                        } else {
                            // The request has succeeded.
                            $scope.submitted = false;
                            $scope.messages = 'Return succeeded : ';
                            $scope.alertStatus = 'success';
                            $log.info($scope.messages);
                            $scope.init()
                        }
                        $scope.submitted = true;
                    });
                }
            );
        };

        //show books for checkout
        $scope.queryBooks = function () {
            $scope.bookSearchSubmitted = false;
            $scope.booksloading = true;

            gapi.client.sblibrary.queryBooks(
                {sbId: $scope.searchId, name: $scope.searchTitle}
                ).execute(function (resp) {
                    $scope.$apply(function () {
                        $scope.booksloading = false;
                        if (resp.error) {
                            // The request has failed.
                            var errorMessage = resp.error.message || '';
                            $scope.messages = 'Failed to query books : '
                                + errorMessage;
                            $scope.alertStatus = 'warning';
                            $log.error($scope.messages );
                        } else {
                            // The request has succeeded.
                            $scope.bookSearchSubmitted = false;
                            var count = 0;
                            if (resp.items)
                                count = resp.items.length;
                            $scope.messages = 'Search returned '+
                                count + ' books';
                            $scope.alertStatus = 'success';
                            $log.info($scope.messages);

                            $scope.books = [];
                            angular.forEach(resp.items, function (book) {
                                $scope.books.push(book);
                            });
                        }
                        $scope.bookSearchSubmitted = true;
                    });
                }
            );
        }

        $scope.checkout = function(bookId) {
            $scope.submitted = false;
            $scope.booksloading = true;

            //checkout this book
            gapi.client.sblibrary.checkoutBook({
                    studentId: $routeParams.studentId,
                    bookId: bookId}).
                execute(function (resp) {
                    $scope.$apply(function () {
                        $scope.booksloading = false;
                        if (resp.error) {
                            // The request has failed.
                            var errorMessage = resp.error.message || '';
                            $scope.messages = 'Failed to checkout : ' + errorMessage;
                            $scope.alertStatus = 'warning';
                            $log.error($scope.messages );
                        } else {
                            // The request has succeeded.
                            $scope.submitted = false;
                            $scope.messages = 'Successfully checked out book : ';
                            $scope.alertStatus = 'success';
                            $log.info($scope.messages);
                            $scope.init()
                        }
                        $scope.submitted = true;
                    });
                }
            );
        }
    }
);
/**
 * @ngdoc controller
 * @name ShowCheckoutsCtrl
 *
 * @description
 * A controller used for View Checkouts page.
 */
libraryApp.controllers.controller('ShowCheckoutsCtrl',
    function ($scope, $log, oauth2Provider, HTTP_ERRORS) {
        /**
         * Holds the checkouts currently displayed in the page.
         * @type {Array}
         */
        $scope.checkouts = [];

        $scope.queryCheckouts = function () {
            $scope.checkouts = [];
            $scope.submitted = false;
            $scope.loading = true;
            gapi.client.sblibrary.queryCheckouts({
                sbId: $scope.searchId, name: $scope.searchTitle
            }).
                execute(function (resp) {
                    $scope.$apply(function () {
                        $scope.loading = false;
                        if (resp.error) {
                            // The request has failed.
                            var errorMessage = resp.error.message || '';
                            $scope.messages = 'Failed to query checkouts : ' + errorMessage;
                            $scope.alertStatus = 'warning';
                            $log.error($scope.messages );
                        } else {
                            // The request has succeeded.
                            $scope.submitted = false;
                            var count = 0;
                            if (resp.items)
                                count = resp.items.length;
                            $scope.messages = 'Currently there are '+
                                count + ' books checked out.';
                            $scope.alertStatus = 'success';
                            $log.info($scope.messages);

                            $scope.checkouts = [];
                            angular.forEach(resp.items, function (checkout) {
                                $scope.checkouts.push(checkout);
                            });
                        }
                        $scope.submitted = true;
                    });
                }
            );
        }
        $scope.checkin = function(bookId) {
            $scope.submitted = false;
            $scope.loading = true;
            gapi.client.sblibrary.returnBook({sbId : bookId }).
                execute(function (resp) {
                    $scope.$apply(function () {
                        $scope.loading = false;
                        if (resp.error) {
                            // The request has failed.
                            var errorMessage = resp.error.message || '';
                            $scope.messages = 'Failed to return book : ' + errorMessage;
                            $scope.alertStatus = 'warning';
                            $log.error($scope.messages );
                        } else {
                            // The request has succeeded.
                            $scope.submitted = false;
                            $scope.messages = 'Book successfully returned : ';
                            $scope.alertStatus = 'success';
                            $log.info($scope.messages);
                            $scope.init()
                        }
                        $scope.submitted = true;
                    });
                }
            );
        };

    }
);


/**
 * @ngdoc controller
 * @name RootCtrl
 *
 * @description
 * The root controller having a scope of the body element and methods used in the application wide
 * such as user authentications.
 *
 */
libraryApp.controllers.controller('RootCtrl',
    function ($scope, $location, oauth2Provider) {

    /**
     * Returns if the viewLocation is the currently viewed page.
     *
     * @param viewLocation
     * @returns {boolean} true if viewLocation is the currently viewed page. Returns false otherwise.
     */
    $scope.isActive = function (viewLocation) {
        return  $location.path().indexOf(viewLocation)>=0;
    };

    /**
     * Returns the OAuth2 signedIn state.
     *
     * @returns {oauth2Provider.signedIn|*} true if siendIn, false otherwise.
     */
    $scope.getSignedInState = function () {
        return oauth2Provider.signedIn;
    };

    /**
     * Calls the OAuth2 authentication method.
     */
    $scope.signIn = function () {
        oauth2Provider.signIn(function () {
            gapi.client.oauth2.userinfo.get().execute(function (resp) {
                $scope.$apply(function () {
                    if (resp.email) {
                        oauth2Provider.signedIn = true;
                        $scope.alertStatus = 'success';
                        $scope.rootMessages = 'Logged in with ' + resp.email;
                    }
                });
            });
        });
    };

    /**
     * Render the signInButton and restore the credential if it's stored in the cookie.
     * (Just calling this to restore the credential from the stored cookie. So hiding the signInButton immediately
     *  after the rendering)
     */
    $scope.initSignInButton = function () {
        gapi.signin.render('signInButton', {
            'callback': function () {
                jQuery('#signInButton button').attr('disabled', 'true').css('cursor', 'default');
                if (gapi.auth.getToken() && gapi.auth.getToken().access_token) {
                    $scope.$apply(function () {
                        oauth2Provider.signedIn = true;
                    });
                }
            },
            'clientid': oauth2Provider.CLIENT_ID,
            'cookiepolicy': 'single_host_origin',
            'scope': oauth2Provider.SCOPES
        });
    };

    /**
     * Logs out the user.
     */
    $scope.signOut = function () {
        oauth2Provider.signOut();
        $scope.alertStatus = 'success';
        $scope.rootMessages = 'Logged out';
    };

    /**
     * Collapses the navbar on mobile devices.
     */
    $scope.collapseNavbar = function () {
        angular.element(document.querySelector('.navbar-collapse')).removeClass('in');
    };

});


/**
 * @ngdoc controller
 * @name OAuth2LoginModalCtrl
 *
 * @description
 * The controller for the modal dialog that is shown when an user needs to login to achive some functions.
 *
 */
libraryApp.controllers.controller('OAuth2LoginModalCtrl',
    function ($scope, $modalInstance, $rootScope, oauth2Provider) {
        $scope.singInViaModal = function () {
            oauth2Provider.signIn(function () {
                gapi.client.oauth2.userinfo.get().execute(function (resp) {
                    $scope.$root.$apply(function () {
                        oauth2Provider.signedIn = true;
                        $scope.$root.alertStatus = 'success';
                        $scope.$root.rootMessages = 'Logged in with ' + resp.email;
                    });

                    $modalInstance.close();
                });
            });
        };
    });


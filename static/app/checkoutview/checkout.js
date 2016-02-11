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
                            $scope.init();
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
                            $scope.messages = 'Failed to query books : ' +
                                errorMessage;
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
        };

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
                            $scope.init();
                        }
                        $scope.submitted = true;
                    });
                }
            );
        };
    }
);

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
                        $scope.messages = 'Failed to get the book : ' +
                            $routeParams.bookId + ' ' + errorMessage;
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
        };

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
                            $location.path('/books');
                        }
                        $scope.submitted = true;
                    });
                });
        };
    }
);


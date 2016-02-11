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
                            $location.path('/books');
                        }
                        $scope.submitted = true;
                    });
                });
        };
    }
);

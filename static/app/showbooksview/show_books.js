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
            $scope.books = [];
            $scope.cursor = "";
            $scope.more = true;
            $scope.getMoreBooks();
        };

        $scope.getMoreBooks = function () {
            if (!$scope.more || $scope.loading)
                return;
            $scope.submitted = false;
            $scope.loading = true;

            gapi.client.sblibrary.queryBooks(
                {sbId: $scope.searchId, name: $scope.searchTitle, cursor: $scope.cursor}
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
                            if (resp.cursor)
                                $scope.messages += ' More available.';
                            $scope.alertStatus = 'success';
                            $log.info($scope.messages);

                            angular.forEach(resp.items, function (book) {
                                $scope.books.push(book);
                            });
                            $scope.cursor = resp.cursor;
                            $scope.more = resp.cursor ? true: false;
                        }
                        $scope.submitted = true;
                    });
                }
            );
        };


        $scope.dblClick = function(book)
        {
            $location.path('/books/edit/'+book.sbId);
        };
    }
);


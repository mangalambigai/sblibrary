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

        $scope.overDuesOnly = false;

        $scope.tabAllSelected = function () {
            $scope.overDuesOnly = false;
        };

        $scope.tabOverdues = function() {
            $scope.overDuesOnly = true;
            $scope.queryCheckouts();
        };

        $scope.queryCheckouts = function () {
            $scope.loading = false;
            $scope.cursor = '';
            $scope.checkouts = [];
            $scope.getMore();
        };

        $scope.getMore = function() {
            if ($scope.loading)
                return;
            $scope.submitted = false;
            $scope.loading = true;
            gapi.client.sblibrary.queryCheckouts({
                sbId: $scope.searchId,
                name: $scope.searchTitle,
                overDue: $scope.overDuesOnly,
                cursor: $scope.cursor
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
                            if (resp.cursor)
                                $scope.messages += 'More available.';
                            $scope.alertStatus = 'success';
                            $log.info($scope.messages);

                            $scope.checkouts = [];
                            angular.forEach(resp.items, function (checkout) {
                                $scope.checkouts.push(checkout);
                            });
                            $scope.cursor = resp.cursor;
                        }
                        $scope.submitted = true;
                    });
                }
            );
        };
        $scope.checkin = function(book) {
            var bookId = book.bookId;
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
                            book.checkedIn = true;
                        }
                        $scope.submitted = true;
                    });
                }
            );
        };

    }
);


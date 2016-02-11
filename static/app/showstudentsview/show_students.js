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
            $location.path('/students/checkout/'+student.sbId);
        };

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
        };

    }
);


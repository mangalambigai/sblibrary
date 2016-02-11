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

        };

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
        };
    }
);

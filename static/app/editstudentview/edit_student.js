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

        };

        /**
         * Tests if $scope.student is valid.
         * @param studentForm the form object from the create_student.html page.
         * @returns {boolean|*} true if valid, false otherwise.
         */
        $scope.isValidStudent = function (studentForm) {
            return !studentForm.$invalid;
        };

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
        };
    }
);

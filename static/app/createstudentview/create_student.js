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
        };

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
        };
    }
);

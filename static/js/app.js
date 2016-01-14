'use strict';

/**
 * @ngdoc object
 * @name sblibraryApp
 * @requires $routeProvider
 * @requires libraryControllers
 * @requires ui.bootstrap
 *
 * @description
 * Root app, which routes and specifies the partial html and controller depending on the url requested.
 *
 */
var app = angular.module('sbLibraryApp',
    ['libraryControllers', 'ngRoute', 'ui.bootstrap']).
    config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.
                when('/books', {
                    templateUrl: '/partials/show_books.html',
                    controller: 'ShowBooksCtrl'
                }).
                when('/books/create', {
                    templateUrl: '/partials/create_book.html',
                    controller: 'CreateBookCtrl'
                }).
                when('/books/edit/:websafeKey', {
                    templateUrl: '/partials/edit_book.html',
                    controller: 'EditBookCtrl'
                }).
                when('/students', {
                    templateUrl: '/partials/show_students.html',
                    controller: 'ShowStudentsCtrl'
                }).
                when('/students/create', {
                    templateUrl: '/partials/create_student.html',
                    controller: 'CreateStudentCtrl'
                }).
                when('/', {
                    templateUrl: '/partials/home.html'
                }).
                otherwise({
                    redirectTo: '/'
                });
        }]);

/**
 * @ngdoc filter
 * @name startFrom
 *
 * @description
 * A filter that extracts an array from the specific index.
 *
 */
app.filter('startFrom', function () {
    /**
     * Extracts an array from the specific index.
     *
     * @param {Array} data
     * @param {Integer} start
     * @returns {Array|*}
     */
    var filter = function (data, start) {
        return data.slice(start);
    }
    return filter;
});


/**
 * @ngdoc constant
 * @name HTTP_ERRORS
 *
 * @description
 * Holds the constants that represent HTTP error codes.
 *
 */
app.constant('HTTP_ERRORS', {
    'UNAUTHORIZED': 401
});


/**
 * @ngdoc service
 * @name oauth2Provider
 *
 * @description
 * Service that holds the OAuth2 information shared across all the pages.
 *
 */
app.factory('oauth2Provider', function ($modal) {
    var oauth2Provider = {
        CLIENT_ID: '982822415777-061tgknhd1jjdr52bmntkii0m91befrn.apps.googleusercontent.com',
        SCOPES: 'email profile',
        signedIn: false
    }

    /**
     * Calls the OAuth2 authentication method.
     */
    oauth2Provider.signIn = function (callback) {
        gapi.auth.signIn({
            'clientid': oauth2Provider.CLIENT_ID,
            'cookiepolicy': 'single_host_origin',
            'accesstype': 'online',
            'approveprompt': 'auto',
            'scope': oauth2Provider.SCOPES,
            'callback': callback
        });
    };

    /**
     * Logs out the user.
     */
    oauth2Provider.signOut = function () {
        gapi.auth.signOut();
        // Explicitly set the invalid access token in order to make the API calls fail.
        gapi.auth.setToken({access_token: ''})
        oauth2Provider.signedIn = false;
    };

    /**
     * Shows the modal with Google+ sign in button.
     *
     * @returns {*|Window}
     */
    oauth2Provider.showLoginModal = function() {
        var modalInstance = $modal.open({
            templateUrl: '/partials/login.modal.html',
            controller: 'OAuth2LoginModalCtrl'
        });
        return modalInstance;
    };

    return oauth2Provider;
});

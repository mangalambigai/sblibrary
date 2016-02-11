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
var app = angular.module('libraryApp',
    ['libraryControllers', 'ngRoute', 'ui.bootstrap']).
    config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.
                when('/books', {
                    templateUrl: '/app/showbooksview/show_books.html',
                    controller: 'ShowBooksCtrl'
                }).
                when('/books/create', {
                    templateUrl: '/app/createbookview/create_book.html',
                    controller: 'CreateBookCtrl'
                }).
                when('/books/edit/:bookId', {
                    templateUrl: '/app/editbookview/edit_book.html',
                    controller: 'EditBookCtrl'
                }).
                when('/books/delete/:bookId', {
                    templateUrl: '/app/deletebookview/delete_book.html',
                    controller: 'DeleteBookCtrl'
                }).
                when('/students', {
                    templateUrl: '/app/showstudentsview/show_students.html',
                    controller: 'ShowStudentsCtrl'
                }).
                when('/students/create', {
                    templateUrl: '/app/createstudentview/create_student.html',
                    controller: 'CreateStudentCtrl'
                }).
                when('/students/edit/:studentId', {
                    templateUrl: '/app/editstudentview/edit_student.html',
                    controller: 'EditStudentCtrl'
                }).
                when('/students/delete/:studentId', {
                    templateUrl: '/app/deletestudentview/delete_student.html',
                    controller: 'DeleteStudentCtrl'
                }).
                when('/checkouts', {
                    templateUrl: '/app/showcheckoutsview/show_checkouts.html',
                    controller: 'ShowCheckoutsCtrl'
                }).
                when('/students/checkout/:studentId', {
                    templateUrl: '/app/checkout/checkout.html',
                    controller: 'CheckoutCtrl'
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
    };
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
    };

    /**
     * Calls the OAuth2 authentication method.
     */
    oauth2Provider.signIn = function (mode, callback) {
        gapi.auth.authorize({client_id: oauth2Provider.CLIENT_ID,
            scope: oauth2Provider.SCOPES},
            callback);

/*        gapi.auth.signIn({
            'clientid': oauth2Provider.CLIENT_ID,
            'cookiepolicy': 'single_host_origin',
            'accesstype': 'online',
            'approveprompt': 'auto',
            'scope': oauth2Provider.SCOPES,
            'callback': callback
        });
  */  };

    /**
     * Logs out the user.
     */
    oauth2Provider.signOut = function () {
        gapi.auth.signOut();
        // Explicitly set the invalid access token in order to make the API calls fail.
        gapi.auth.setToken({access_token: ''});
        oauth2Provider.signedIn = false;
    };

    return oauth2Provider;
});

app.directive('customOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeFunc = scope.$eval(attrs.customOnChange);
      element.bind('change', function(event){
        var files = event.target.files;
        onChangeFunc(files);
      });

      element.bind('click', function(){
        element.val('');
      });
    }
  };
});

app.directive('infiniteScroll', function($rootScope, $window, $timeout) {
    return {
      link: function(scope, elem, attrs) {
        var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
        $window = angular.element($window);
        scrollDistance = 0;
        if (attrs.infiniteScrollDistance != null) {
          scope.$watch(attrs.infiniteScrollDistance, function(value) {
            return scrollDistance = parseInt(value, 10);
          });
        }
        scrollEnabled = true;
        checkWhenEnabled = false;
        if (attrs.infiniteScrollDisabled != null) {
          scope.$watch(attrs.infiniteScrollDisabled, function(value) {
            scrollEnabled = !value;
            if (scrollEnabled && checkWhenEnabled) {
              checkWhenEnabled = false;
              return handler();
            }
          });
        }
        handler = function() {
          var elementBottom, remaining, shouldScroll, windowBottom;
          windowBottom = $window.height() + $window.scrollTop();
          elementBottom = elem.offset().top + elem.height();
          remaining = elementBottom - windowBottom;
          shouldScroll = remaining <= $window.height() * scrollDistance;
          if (shouldScroll && scrollEnabled) {
            if ($rootScope.$$phase) {
              return scope.$eval(attrs.infiniteScroll);
            } else {
              return scope.$apply(attrs.infiniteScroll);
            }
          } else if (shouldScroll) {
            return checkWhenEnabled = true;
          }
        };
        $('body').on('scroll', handler);
        scope.$on('$destroy', function() {
          return $window.off('scroll', handler);
        });
        return $timeout((function() {
          if (attrs.infiniteScrollImmediateCheck) {
            if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
              return handler();
            }
          } else {
            return handler();
          }
        }), 0);
      }
    };
  }
);
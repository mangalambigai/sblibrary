/**
 * @ngdoc controller
 * @name CreateBookCtrl
 *
 * @description
 * A controller used for Create Books page.
 */
libraryApp.controllers.controller('CreateBookCtrl',
    function ($scope, $log, oauth2Provider, HTTP_ERRORS) {

        /**
         * The book object being edited in the page.
         * @type {{}|*}
         */
        $scope.book = $scope.book || {};

        $scope.init = function() {
            $(':file').filestyle({
                buttonName: 'btn-primary',
                buttonText: 'Scan ISBN',
                buttonBefore: 'true'});
        };

        $scope.scanImage = function(files) {
            $scope.loading = true;
            console.log(URL.createObjectURL(files[0]));
            var config = {
                numOfWorkers: 1,
                locate: true,
                inputStream: {
                    size: 640,
                    singleChannel: false
                },
                decoder:{
                    readers: ["ean_reader"]
                },
                locator: {
                    patchSize: "large",
                    halfSample: false
                },
                debug: false,
                src: URL.createObjectURL(files[0])
            };
            Quagga.decodeSingle(config, function(result) {
                $scope.loading = false;
                $scope.$apply(function() {
                    $scope.book.isbn = result.codeResult.code;
                    console.log(result.codeResult.code);
                });
                $scope.getIsbnDetails();
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

        $scope.getGoogleBooksDetails = function() {
            $scope.book.isbn = $scope.book.isbn.replace(/-/g,'');
            $scope.book.title = '';
            $scope.book.publisher = '';
            $scope.book.author = '';
            $scope.book.editionYear = '';
            $scope.book.mediaType = '';
            $scope.book.category = '';
            $scope.book.language = '';

            $scope.loading = true;
            $scope.notFound = false;

            $.getJSON("https://www.googleapis.com/books/v1/volumes?q=" +
                "isbn:" + $scope.book.isbn + "&key=AIzaSyDQ0_ejQT469L3YpenuqTaxl4bWRiHGou8",
                function(data) {
                    $scope.loading = false;
                    if (data.items && data.items.length>0)
                    {
                        $scope.$apply(function () {
                            var volumeInfo = data.items[0].volumeInfo;
                            if (volumeInfo.authors && volumeInfo.authors.length>0)
                                $scope.book.author = volumeInfo.authors[0];
                            $scope.book.title = volumeInfo.title;
                            $scope.book.publisher = volumeInfo.publisher;
                            $scope.book.editionYear = volumeInfo.publishedDate;
                            $scope.book.mediaType = volumeInfo.printType;
                            $scope.book.category = volumeInfo.categories[0];

                            //https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
                            switch (volumeInfo.language)
                            {
                                case 'en':
                                    $scope.book.language = 'ENGLISH';
                                    break;
                                case 'ta':
                                    $scope.book.language = 'TAMIL';
                                    break;
                                case 'hi':
                                    $scope.book.language = 'HINDI';
                                    break;
                                case 'te':
                                    $scope.book.language = 'TELUGU';
                                    break;
                                case 'mr':
                                    $scope.book.language = 'MARATHI';
                                    break;
                                case 'gu':
                                    $scope.book.language = 'GUJARATHI';
                                    break;
                                case 'kn':
                                    $scope.book.language = 'KANNADA';
                                    break;
                                case 'sa':
                                    $scope.book.language = 'SANSKRIT';
                                    break;


                            }
                        });
                    }
                    else {
                        $scope.notFound = true;
                    }
                    console.log(data);
                });
        };

        $scope.getIsbnDetails = function() {

            $scope.book.isbn = $scope.book.isbn.replace(/-/g,'');
            $scope.book.title = '';
            $scope.book.publisher = '';
            $scope.book.author = '';
            $scope.book.editionYear = '';
            $scope.book.mediaType = '';
            $scope.book.category = '';
            $scope.book.language = '';

            $scope.loading = true;
            $scope.notFound = false;

            gapi.client.sblibrary.getIsbnDetails({sbId: $scope.book.isbn})
                .execute(function (resp) {
                $scope.$apply(function () {
                    $scope.loading = false;
                    if (resp.error) {
                        // The request has failed.
                        var errorMessage = resp.error.message || '';
                        $scope.messages = 'Failed to get the book : ' +
                            $scope.book.isbn + ' ' + errorMessage;
                        $scope.alertStatus = 'warning';
                        $log.error($scope.messages);
                    } else {
                        // The request has succeeded.
                        $scope.alertStatus = 'success';
                        $scope.book.title = resp.result.title;
                    }
                });
            });

        };

        /**
         * Invokes the book.createBook API.
         *
         * @param bookForm the form object.
         */
        $scope.createBook = function(bookForm) {

            $scope.submitted = false;
            $scope.loading = true;

            gapi.client.sblibrary.addBook($scope.book).
                execute(function (resp) {
                    $scope.$apply(function () {
                        $scope.loading = false;
                        if (resp.error) {
                            // The request has failed.
                            var errorMessage = resp.error.message || '';
                            $scope.messages = 'Failed to create book : ' + errorMessage;
                            $scope.alertStatus = 'warning';
                            $log.error($scope.messages );
                        } else {
                            // The request has succeeded.
                            $scope.submitted = false;
                            $scope.messages = 'Book created successfully : ';
                            $scope.alertStatus = 'success';
                            $log.info($scope.messages);
                        }
                        $scope.submitted = true;
                    });
                });
        };
    }
);


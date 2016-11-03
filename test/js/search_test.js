
/*
 * Eksempel på hvordan man kan lytte på events fra en formular.
 * Dette kan bruges hvis man gerne vil bruge det valgte til noget specielt.
 */

jQuery(function () {
    setTimeout(function () {
        formular.on('searchSelected', function (eventname, result) {
            console.log(result);
        });
    }, 100);
});

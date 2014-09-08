$(document).ready(function () {

    // Mobile menu function
    $('#dl-menu').dlmenu({
        animationClasses: { classin: 'dl-animate-in-2', classout: 'dl-animate-out-2' }
    });

    // Show/hide help text function
    $('.help').popover('hide');

});
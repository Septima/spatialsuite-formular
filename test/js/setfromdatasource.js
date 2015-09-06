jQuery(function () {
    setTimeout(function () {
        var options = {
            id: jQuery('#id').val(),
            datasource: jQuery('#datasource').val(),
            command: jQuery('#readcommand').val()
        };
        formular.setFromDatasource(options);
    }, 100);
});

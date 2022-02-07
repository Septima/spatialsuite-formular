function addTable (container, datasource, val) {

    container.empty();

    if (val !== '0') {     // Dette skal ændres afhængig af input

        var params = {
            page: 'formular.read.datasource',
            sessionid: formular.sessionid,
            datasource: datasource,
            command: 'read',
            id: val
        };

        jQuery.ajax( {
            url : 'spatialmap',
            dataType : 'json',
            type: 'POST',
            async: true,
            data : params,
            success : function(container, data) {

                if (typeof data.row !== 'undefined' && typeof data.row[0] !== 'undefined' && typeof data.row[0].row !== 'undefined') {
                    var rows = data.row[0].row;
                    if (rows.length > 0) {

                        var table = jQuery('<div class="row"></div>');


                        // Dette er overskrifterne for hver kolonne

                        var th = jQuery('<div class="col-custom custom-header"><p><span>Jobtype</span></p></div>' +
                                        '<div class="col-custom custom-header"><p><span>Fra dato</span></p></div>' +
                                        '<div class="col-custom custom-header"><p><span>Til dato</span></p></div>' +
                                        '<div class="col-custom custom-header"><p><span>Bemærkning</span></p></div>' +
                                        '');
                        table.append(th);
                        container.append(table);

                        for (var i = 0; i < rows.length; i++) {
                            var tr = jQuery('<div class="row row-custom"></div>');
                            var row = rows[i];

                            // Dette er hver række i tabellen


                            // Angiv row.KOLONNENAVN for at få vist værdien
                            var td1 = jQuery('<div class="col-custom"><div class="form-group"><div><input class="form-control" type="text" value="'+row.name+'"></div></div></div>');
                            tr.append(td1);

                            var td2 = jQuery('<div class="col-custom"><div class="form-group"><div><input class="form-control" type="text" value="'+row.created+'"></div></div></div>');
                            tr.append(td2);

                            var td3 = jQuery('<div class="col-custom"><div class="form-group"><div><input class="form-control" type="text" value="'+row.id+'"></div></div></div>');
                            tr.append(td3);

                            var td4 = jQuery('<div class="col-custom"><div class="form-group"><div><input class="form-control" type="text" value="'+row.responsible+'"></div></div></div>');
                            tr.append(td4);

                            container.append(tr);
                        }
                    }
                }

            }.bind(this, container),
            error: function () {
            }
        });

    }

}
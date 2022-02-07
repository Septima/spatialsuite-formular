
window.onload = function() {
    setTimeout(function() {addTableData(jQuery('#tabel_aktivevirksomheder'), 'ds_form_jobcenter_aktivevirksomheder')},200);
};


function addTableData (container, datasource) {

    container.empty();

    $.ajax({
        dataType: "json",
        url: '/modules/formular/test/js/tabledata.json',
        data: {},
        success: function(container, data) {

            if (typeof data.row !== 'undefined' && typeof data.row[0] !== 'undefined' && typeof data.row[0].row !== 'undefined') {
                var rows = data.row[0].row;
                if (rows.length > 0) {

                    var table = jQuery('<div class="row"></div>');


                    // Dette er overskrifterne for hver kolonne

                    var th1 = jQuery('<div class="col-custom-30 custom-header"><p><span>Navn</span><span class="sortable"></span></p></div>');
                    th1.click(sortRows.bind(this, container, 'colnum-1', th1));
                    table.append(th1);

                    var th2 = jQuery('<div class="col-custom-dato custom-header"><p><span>Adresse</span><span class="sortable"></span></p></div>');
                    th2.click(sortRows.bind(this, container, 'colnum-2', th2));
                    table.append(th2);

                    var th3 = jQuery('<div class="col-custom-dato custom-header"><p><span>Postby</span><span class="sortable"></span></p></div>');
                    th3.click(sortRows.bind(this, container, 'colnum-3', th3));
                    table.append(th3);

                    var th4 = jQuery('<div class="col-custom-dato custom-header"><p><span>P-nummer</span><span class="sortable"></span></p></div>');
                    th4.click(sortRows.bind(this, container, 'colnum-4', th4));
                    table.append(th4);

                    var th5 = jQuery('<div class="col-custom-dato custom-header"><p><span>Seneste kontakt</span><span class="sortable"></span></p></div>');
                    th5.click(sortRows.bind(this, container, 'colnum-5', th5));
                    table.append(th5);

                    var th6 = jQuery('<div class="col-custom-10 custom-header"><p><span>Konsulent</span><span class="sortable"></span></p></div>');
                    th6.click(sortRows.bind(this, container, 'colnum-6', th6));
                    table.append(th6);

                    container.append(table);

                    for (var i = 0; i < rows.length; i++) {
                        var tr = jQuery('<div class="row row-custom"></div>');
                        var row = rows[i];

                        // Dette er hver række i tabellen

                        // Angiv row.KOLONNENAVN for at få vist værdien
                        var td1 = jQuery('<div class="col-custom-row col-custom-30 colnum-1"><div class="form-group"><div><input class="form-control" type="text" value="'+row.navn+'"></div></div></div>');
                        tr.append(td1);

                        var td2 = jQuery('<div class="col-custom-dato colnum-2"><div class="form-group"><div><input class="form-control" type="text" value="'+row.adresse+'"></div></div></div>');
                        tr.append(td2);

                        var td3 = jQuery('<div class="col-custom-dato colnum-3"><div class="form-group"><div><input class="form-control" type="text" value="'+row.postby+'"></div></div></div>');
                        tr.append(td3);

                        var td4 = jQuery('<div class="col-custom-dato colnum-4"><div class="form-group"><div><input class="form-control" type="text" value="'+row.p_nummera+'"></div></div></div>');
                        tr.append(td4);

                        // Håndtér fejl i data samt sørge for at der sorteres rigtigt på dato
                        var dateVal = row.seneste_henvend_dato.split(/[.-]/).reverse().join('').replace(/\D/g,'');
                        var td5 = jQuery('<div class="col-custom-dato colnum-5"><div class="form-group"><div><input class="form-control" type="text" value="'+row.seneste_henvend_dato+'" data-sort-value="'+dateVal+'"></div></div></div>');
                        tr.append(td5);

                        var td6 = jQuery('<div class="col-custom-10 colnum-6"><div class="form-group"><div><input class="form-control" type="text" value="'+row.initialer+'"></div></div></div>');
                        tr.append(td6);

                        container.append(tr);
                    }


                }
            }

        }.bind(this, container),
        error: function () {
            console.log('ERROR');
        }
    });

}

function sortRows (container, columnClassName, element) {

    var sortOrder = (element.hasClass('sort-asc') ? -1 : 1);
    $('.custom-header').removeClass('sort-asc').removeClass('sort-desc');
    if (sortOrder === 1) {
        element.addClass('sort-asc');
    } else {
        element.addClass('sort-desc');
    }

    var rows = container.find('.row.row-custom');

    rows.sortElements(function(a, b){
        var inputA = $(a).find('.'+columnClassName+' input');
        var valA = inputA.val();
        if (inputA.attr('data-sort-value') !== undefined) {
            valA = inputA.attr('data-sort-value');
        }

        var inputB = $(b).find('.'+columnClassName+' input');
        var valB = inputB.val();
        if (inputB.attr('data-sort-value') !== undefined) {
            valB = inputB.attr('data-sort-value');
        }

        return valA > valB ? sortOrder : -sortOrder;
    });

}



jQuery.fn.sortElements = (function(){

    var sort = [].sort;

    return function(comparator, getSortable) {

        getSortable = getSortable || function(){return this;};

        var placements = this.map(function(){

            var sortElement = getSortable.call(this),
                parentNode = sortElement.parentNode,

                // Since the element itself will change position, we have
                // to have some way of storing it's original position in
                // the DOM. The easiest way is to have a 'flag' node:
                nextSibling = parentNode.insertBefore(
                    document.createTextNode(''),
                    sortElement.nextSibling
                );

            return function() {

                if (parentNode === this) {
                    throw new Error(
                        "You can't sort elements if any one is a descendant of another."
                    );
                }

                // Insert before flag:
                parentNode.insertBefore(this, nextSibling);
                // Remove flag:
                parentNode.removeChild(nextSibling);

            };

        });

        return sort.call(this, comparator).each(function(i){
            placements[i].call(getSortable.call(this));
        });

    };

})();
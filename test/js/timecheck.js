var TimeCheck = {

    date: '',
    start: '',
    datasource: '',

    checkDate: function (date, id1, datasource) {
        this.datasource = datasource;
        this.date = jQuery('#'+date).val();

        if (this.date !== '') {

            var records = this.getTime();

            var options = jQuery('#'+id1+' > option');
            options.removeProp('disabled');
            for (var i=0;i<records.length;i++) {
                var rm = false;
                for (var j=0;j<options.length;j++) {
                    if (jQuery(options[j]).val() === records[i].start) {
                        rm = true;
                    }
                    if (jQuery(options[j]).val() === records[i].end) {
                        rm = false;
                        break;
                    }

                    if (rm === true) {
                        jQuery(options[j]).attr('disabled','disabled');
                    }
                }
            }

        }

        formular.checkConditions();
    },

    checkTime: function (id1, id2) {
        this.start = jQuery('#'+id1).val();

        var max = null,
            i;

        var options1 = jQuery('#'+id1+' > option');
        var check = true;
        var last = false;
        for (i=0;i<options1.length;i++) {

            if (check === true) {
                if (jQuery(options1[i]).val() === this.start) {
                    check = false;
                }
            } else {
                max = jQuery(options1[i]).val();
                if (jQuery(options1[i]).attr('disabled') === 'disabled') {
                    break;
                }
                if (i=options1.length-1) {
                    max = null;
                }
            }
        }

        var options2 = jQuery('#'+id2+' > option');
        options2.removeAttr('disabled');
        var disable = true;
        for (i=0;i<options2.length;i++) {
            if (i===0) {
                jQuery(options2[i]).attr('selected', 'selected');
            }
            if (disable === true) {
                jQuery(options2[i]).attr('disabled', 'disabled');
            }
            if (jQuery(options2[i]).val() === this.start) {
                disable = false;
            }
            if (jQuery(options2[i]).val() === max) {
                disable = true;
            }
        }

        formular.checkConditions();

    },

    getTime: function () {
        var params = {
            page: 'formular.read.data',
            sessionid: formular.sessionid,
            date: this.date,
            datasource: this.datasource,
            command: 'read-time'
        };
        var list = [];
        jQuery.ajax( {
            url: 'spatialmap',
            dataType: 'json',
            type: 'POST',
            async: false,
            data: params,
            success : function(data, status) {
                if (typeof data.row !== 'undefined' && typeof data.row[0] !== 'undefined' && typeof data.row[0].row !== 'undefined') {
                    var rows = data.row[0].row;
                    for (var i = 0; i < rows.length; i++) {
                        list.push({
                            start: rows[i].start,
                            end: rows[i].slut
                        });
                    }
                }
            }
        });
        return list;

    }

};

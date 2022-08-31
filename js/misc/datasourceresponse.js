var datasourceResponse = {
        
    valid: false,
    
    command: 'read',
        
    check: function (params) {
        
        var defaultparams = {
            page: 'formular.read.data',
            sessionid: formular.sessionid,
            command: this.command
        };
        
        var data = {};
        for (var name in defaultparams) {
            data[name] = defaultparams[name];
        }
        for (var name in params) {
            data[name] = params[name];
        }
        
        jQuery.ajax( {
            url : 'spatialmap',
            dataType : 'json',
            type: 'POST',
            async: true,
            data : data,
            success : function(data, status) {
                if (typeof data.exception !== 'undefined') {
                    this.hide();
                } else {
                    if (data.row && data.row[0] && data.row[0].row && data.row[0].row.length > 0) {
                        this.show(data.row[0].row[0]);
                    } else {
                        this.hide();
                    }
                }
            }.bind(this)
        });
        
    },
    
    show: function (row) {
        for (var name in row) {
            var e = jQuery('#data_'+name);
            if (e.length === 0) {
                e = jQuery('#data_'+name+'_row');
            }
            if (e.length > 0) {
                var tagName = e.prop('tagName');
                if (tagName && tagName.toLowerCase() === 'input') {
                    e.val(row[name]);
                } else {
                    e.html(row[name]);
                }
            }
        }
        
        this.valid = true;
        formular.checkConditions();
    },
    
    hide: function () {
        this.valid = false;
        formular.checkConditions();
    }
    
};

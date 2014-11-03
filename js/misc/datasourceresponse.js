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
            url : 'cbkort',
            dataType : 'json',
            type: 'POST',
            async: true,
            data : data,
            success : SpatialMap.Function.bind( function(data, status) {
                if (typeof data.exception !== 'undefined') {
                    this.hide();
                } else {
                    if (data.row && data.row[0] && data.row[0].row && data.row[0].row.length > 0) {
                        this.show(data.row[0].row[0]);
                    } else {
                        this.hide();
                    }
                }
            },this)
        });
        
    },
    
    show: function (row) {
        
        for (var name in row) {
            jQuery('#data_'+name+'_row').html(row[name]);
        }
        
        this.valid = true;
        formular.checkConditions();
    },
    
    hide: function () {
        this.valid = false;
        formular.checkConditions();
    }
    
};

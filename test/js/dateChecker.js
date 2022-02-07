
function setDate (id, date, addDays) {
    addDays = addDays || 0;
    var d = date.split('.');
    
    var da = new Date(d[2], d[1]-1, d[0]);
    da.setDate(da.getDate()+addDays);
    var m = da.getMonth()+1, 
        d = da.getDate(), 
        y = da.getFullYear();
    m = (m<10?'0'+m:m);
    d = (d<10?'0'+d:d);
    var selectedDate = d+'.'+m+'.'+y;
    jQuery('#'+id).val (selectedDate);
    
    return selectedDate;

}

function setDateLimit (id, startdate, enddate) {
    var options = {};
    
    if (startdate) {
        var d = startdate.split('.');
        var da = new Date(d[2], d[1]-1, d[0]);
        da.setDate(da.getDate()-1);
        var m = da.getMonth()+1, 
            d = da.getDate(), 
            y = da.getFullYear();
        m = (m<10?'0'+m:m);
        d = (d<10?'0'+d:d);
        options.start = d+'.'+m+'.'+y;
    }
    if (enddate) {
        options.end = enddate;
    }
    
    formular.setDatepickerLimit(id,options);
}

/*
 * Begrænser mulige datoer i en datovælger ud fra en start dato og nogle datoer, der er hentet fra limitdatasource
 */
var orgBeforeShowDay = {};
function setDateLimitSpan (id, startdate) {

    var s = startdate.split('.');
    var start = new Date(s[2]-0,s[1]-1,s[0]-0);
    
    if (typeof orgBeforeShowDay[id] === 'undefined') {
        
        orgBeforeShowDay[id] = { 
            start: start,
            end: null
        };
        
        jQuery('#'+id).datepicker('option', 'beforeShowDay', function (id, date) {

            if (orgBeforeShowDay[id].start && date <= orgBeforeShowDay[id].start) {
                return [false];
            }
            if (orgBeforeShowDay[id].end && date > orgBeforeShowDay[id].end) {
                return [false];
            }

            var disabledDays = this.inputOptions[id].disabledDays;
            var m = date.getMonth()+1, d = date.getDate(), y = date.getFullYear();
            m = (m<10?'0'+m:m);
            d = (d<10?'0'+d:d);
            if(jQuery.inArray(d + '.' + m + '.' + y,disabledDays) != -1) {
                orgBeforeShowDay[id].end = new Date(y-0,m-1,d-0);;
                return [false];
            }
            return [true];
        }.bind(formular,id));

    } else {
        orgBeforeShowDay[id] = { 
            start: start,
            end: null
        };
    }
}

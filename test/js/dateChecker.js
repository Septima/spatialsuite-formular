
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
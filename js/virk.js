jQuery(function () {
    formular.on('formular-config-ready', function (event,config) {
        var virk = jQuery(formular.configData).find('virkid');
        if (virk) {
            var test = virk.attr('test');
            var virkid = virk.text();
            jQuery('body').append('<img id="virkid_'+virkid+'" alt="" height="1" width="1" src="//counter.virk.dk/tns.png?DiaID='+virkid+'&test='+test+'" />');
//            jQuery.getScript('/cbkort?page=formular.virk.counter&test='+test+'&virkid='+virkid);
        }
    });
    formular.on('formular-complete', function () {
        var virk = jQuery(formular.configData).find('virkid');
        if (virk) {
            var test = virk.attr('test');
            var virkid = virk.text();
            jQuery('body').append('<img id="virkid_'+virkid+'" alt="" height="1" width="1" src="//counter.virk.dk/tns.png?DiaID='+virkid+'&test='+test+'&status=completed" />');
//            jQuery.getScript('/cbkort?page=formular.virk.counter&test='+test+'&virkid='+virkid+'&script=complete');
        }
    });
});


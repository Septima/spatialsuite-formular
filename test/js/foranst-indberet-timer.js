
jQuery(function () {
    // Venter på at alle elementer er klar
    setTimeout(function () {
        timeCalc.setFormular();
    },1000);
});

var timeCalc = {

    interval: null,
    list: {},

    // Initiel setup
    setFormular: function () {

        var id = ['#sumdoegn','#sumtimer'];
        for (var i = 0; i < 10; i++) {
            id.push('#doegn'+i);
            id.push('#timer'+i);
            this.change(i);
        }
        jQuery(id.join(',')).prop('disabled', true);

        this.setDateRange('04.2016');
        this.setPeriodeDropdown();

    },

    setDateRange: function (MY) {
        var id = [];
        for (var i = 0; i < 10; i++) {
            id.push('#fra_date'+i);
            id.push('#til_date'+i);
        }

        var start = moment(MY, 'MM.YYYY').toDate();
        var end = moment(MY, 'MM.YYYY').endOf('month').toDate();

        jQuery(id.join(',')).datepicker('option', 'minDate', start).datepicker('option', 'maxDate', end);

        for (var i = 0; i < 10; i++) {
            this.change(i);
        }

    },

    setPeriodeDropdown: function () {

        var select = jQuery('#periode');
        select.empty();
        var today = moment();
        select.append('<option selected="selected" value="'+today.format('MM')+'.'+today.format('YYYY')+'">'+today.format('MMMM')+' '+today.format('YYYY')+'</option>');
        this.setDateRange(today.format('MM')+'.'+today.format('YYYY'));
        for (var i = 0; i < 12; i++) {
            today.subtract(1,'month');
            select.append('<option value="'+today.format('MM')+'.'+today.format('YYYY')+'">'+today.format('MMMM')+' '+today.format('YYYY')+'</option>')
        }

        select.change(function () {
            timeCalc.setDateRange(jQuery(this).val());
        });
    },

    change: function (index) {

        this.list[index] = null;
        jQuery('#doegn'+index+',#timer'+index).val('');

        var fra_date = jQuery('#fra_date'+index).val();
        var fra_tid = jQuery('#fra_tid'+index).val();
        var til_date = jQuery('#til_date'+index).val();
        var til_tid = jQuery('#til_tid'+index).val();

        if (fra_date !== '' && til_date === '') {
            til_date = fra_date;
        }

        if (
            fra_date !== '' &&
            fra_tid !== '' &&
            til_date !== '' &&
            til_tid !== ''
        ) {

            var fra = moment(fra_date+ ' ' +fra_tid, 'DD.MM.YYYY HH.mm');
            var til = moment(til_date+ ' ' +til_tid, 'DD.MM.YYYY HH:mm');

            jQuery('#doegn'+index).val(til.diff(fra, 'days'));

            var h = fra.add(til.diff(fra, 'days'), 'day');
            var timer = til.diff(h, 'hours');

            var m = fra.add(til.diff(fra, 'hours'), 'hour');
            var minutes = til.diff(m, 'minutes');

            jQuery('#timer'+index).val(timer + ':' + (minutes<10 ? '0'+minutes : minutes));

            this.list[index] = {
                from: moment(fra_date+ ' ' +fra_tid, 'DD.MM.YYYY HH.mm'),
                to: moment(til_date+ ' ' +til_tid, 'DD.MM.YYYY HH:mm')
            };

        }

        this.updateSum();

    },

    updateSum: function () {

        var sum = 0;

        for (var name in this.list) {
            var t = this.list[name];
            if (t !== null) {
                if (t.from.isValid() && t.to.isValid()) {
                    sum += t.to.diff(t.from, 'minutes');
                }
            }
        }

        var minutes = sum % 60;
        var hours = ((sum - minutes)/60) % 24;
        var days = (sum - minutes - hours*60) / (60 * 24);

        jQuery('#sumdoegn').val(days);
        jQuery('#sumtimer').val(hours + ':' + (minutes<10 ? '0'+minutes : minutes));

    }

};
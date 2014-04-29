var Poll = {
        
    interval: null,
    
    state: {},
    
    formulartype: 0,
    kontakttype: 0,
    brugertype: null,
    
    kontaktpersoner: ['Sectionsleder Ove Nørgaard','Afdelingschef Lars Peter Salhøj','Sectionsleder Peter Allentoft'],
    
    setFormularState: function (id) {
        this.state[id] = jQuery('input:radio[name="'+id+'"]:checked').val();
        
        if (id === 'svar1_1') {
            if (this.state[id] == '1' || this.state[id] == '2') {
                formular.messages.done = 'Mange tak for hjælpen! Du vil bliver kontaktet af '+this.kontaktpersoner[this.kontakttype]+'.';
            } else {
                formular.messages.done = 'Mange tak for hjælpen!';
            }
        }
        if (id === 'svar2_1') {
            if (this.state[id] == '1' || this.state[id] == '2') {
                formular.messages.done = 'Mange tak for hjælpen! Du vil bliver kontaktet af '+this.kontaktpersoner[this.kontakttype]+'.';
            } else {
                formular.messages.done = 'Mange tak for hjælpen!';
            }
        }
    },
        
    setFormularType: function (val) {
        
        if (typeof val === 'undefined') {
            val = 'none';
        }
        val = val.toUpperCase();
        this.formulartype = 0;
        this.kontakttype = 0;
        
        switch (val) {
            case '09.20.02-K08':
            case '09.35.00-K08':
            case '09.01.00-K09':
            case '09.30.00-K08':
            case '09.02.00-K08':
            case '09.17.00-K08':
            case '09.17.60-K08':
                this.formulartype = 1;
                this.kontakttype = 1;
                break;
            case '09.02.01-P19':
            case '09.00.00-P19':
            case '09.02.01-K08':
            case '09.30.16-K08':
            case '09.02.00-I00':
            case '09.04.03-P00':
            case '09.30.04-P19':
            case '09.02.11-P19':
            case '09.02.01-K00':
            case '09.17.18-P19':
            case '09.17.00-I06':
                this.formulartype = 2;
                this.kontakttype = 1;
                break;
            case '01.03.03-P16':
                this.formulartype = 2;
                this.kontakttype = 2;
                break;
            case '02.00.00-G01':
            case '02.34.02-P19':
                this.formulartype = 2;
                this.kontakttype = 3;
                break;
        }
        
        jQuery('#formulartype').val(this.formulartype);
        jQuery('#kontakttype').val(this.kontakttype);
        
        this.brugertype = jQuery('input:radio[name="brugertype"]:checked').val();
        
        if (typeof this.brugertype !== 'undefined' && this.formulartype > 0 && this.kontakttype > 0) {
            jQuery('#next0').removeAttr('disabled');
            jQuery('#tab1').removeClass('disabled');
            jQuery('#tab2').removeClass('disabled');
        } else {
            jQuery('#next0').attr('disabled', 'disabled');
            jQuery('#tab1').addClass('disabled');
            jQuery('#tab2').addClass('disabled');
        }
        
    }
    
}


jQuery(function () {
    var f = function () {
        var r = jQuery('#journalnr');
        if (r.length > 0) {
            clearInterval(Poll.interval);
            Poll.setFormularType(r.val());
        }
    }
    Poll.interval = setInterval(f,500);
});
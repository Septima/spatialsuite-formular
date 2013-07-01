Formular = SpatialMap.Class ({
    
    name: null,
    sessionid: null,
    configpage: 'formular.config',
    submitpage: 'formular.send',
    config: null,
    map: null,
    extent: [539430.4,6237856,591859.2,6290284.8],
    resolutions: [0.4,0.8,1.6,3.2,6.4,12.8,25.6,51.2,102.4],
    
    mapbuttons: {},
    spatialqueries: [],
    postparams: {},
    feature: null,
    areaid: null,
    
    defaultMapTool: 'pan',
    
    inputValidation: {},
    
    inputOptions: {},
    
    reportprofile: 'alt',
    reportlayers: 'default',
    reportxsl: 'kvitering',
    reportmapscale: null,
    
    confirm: null,
    submitbuttons: [],
    
    showReport: true,
    showTabs: false,
    
    style: {
        strokeColor: '#FF0000',
        fillColor: '#FFFFFF'
    },
    
    validAddress: false,
    
    conditions: [],
    
    parseDisplaynames: false,
    
    initialize: function (options) {
        SpatialMap.Util.extend (this, options);
        this.getConfig();
    },
    
    getConfig: function () {
        var params = {
            page: this.configpage,
            formular: this.name,
            sessionid: this.sessionid
        };
        var data = jQuery.ajax ({
            type: 'POST',
            async: true,
            dataType: 'xml',
            data: params,
            url: 'cbkort',
            success: SpatialMap.Function.bind (function (data, textStatus, jqXHR) {
                var help = jQuery(data).find('help').text();
                if (help) {
                    jQuery('div.helpbutton').click(function () {
                        jQuery('div.help').show ();
                        jQuery('#helpbuttons').show();
                        jQuery('div#content').hide ();
                    });
                    var button = jQuery('<button>Tilbage</button>');
                    button.click (function () {
                        jQuery('div.help').hide ();
                        jQuery('#helpbuttons').hide();
                        jQuery('div#content').show ();
                    });
                    jQuery('#helpbuttons').append(button);
                }
                
                var profile = jQuery(data).find('reportprofile').text();
                if (profile) {
                    this.reportprofile = profile;
                }
                var layers = jQuery(data).find('reportlayers').text();
                if (layers) {
                    this.reportlayers = layers;
                }
                var xsl = jQuery(data).find('reportxsl').text();
                if (xsl) {
                    this.reportxsl = xsl;
                }
                var reportmapscale = jQuery(data).find('reportmapscale').text();
                if (reportmapscale) {
                    this.reportmapscale = reportmapscale;
                }
                var page = jQuery(data).find('submitpage').text();
                if (page) {
                    this.submitpage = page;
                }
                var showReport = jQuery(data).find('showreport').text();
                if (showReport) {
                    this.showReport = showReport != 'false';
                }
                var showTabs = jQuery(data).find('tabs').text();
                if (showTabs) {
                    this.showTabs = (showTabs == 'true');
                    var tabcontainer = jQuery('<div class="tabcontainer"></div>');
                    var className = jQuery(jQuery(data).find('tabs')[0]).attr('class')
                    tabcontainer.addClass(className);
                    jQuery('div#content').append(tabcontainer);
                }
                var parseDisplaynames = jQuery(data).find('parsedisplaynames').text();
                if (parseDisplaynames) {
                    this.parseDisplaynames = (parseDisplaynames == 'true');
                }

                this.config = jQuery(data).find('content');
                var counter = 0;
                if (this.config.length) {
                    for (var k=0;k<this.config.length;k++) {
                        jQuery('div#content').append('<table class="tablecontent" id="content'+k+'"><tbody></tbody></table>');
                        if(this.showTabs) {
                            var displayname = jQuery(this.config[k]).attr('displayname');
                            var item = jQuery('<div id="tab'+k+'" class="arrow_box">'+displayname+'</div>');
                            item.click(SpatialMap.Function.bind(this.showTab,this,k));
                            jQuery('.tabcontainer').append(item);
                            if (k < this.config.length-1) {
                                jQuery('.tabcontainer').append('<div id="tabsep'+(k+1)+'" class="sep"/>');
                            }
                        }

                        var config = jQuery(this.config[k]).children();
                        for (var i=0; i<config.length; i++) {
                            var node = jQuery(config[i]);
                            var urlparam = node.attr('urlparam');
                            var id = 'input_'+counter;
                            counter++;
                            if (node.attr('id')) {
                                id = node.attr('id');
                            }
                            if (urlparam) {
                                this.postparams[urlparam] = {
                                    id: id,
                                    displayname: node.attr('displayname')
                                };
                            }
                            
                            if (node.attr('condition')) {
                                this.conditions.push({id: id, condition: node.attr('condition')});
                            }
                            
                            var className = node.attr('class');
                            switch(config[i].nodeName) {
                                case 'address':
                                    var value = this.getParam(urlparam);
                                    if (value == null) {
                                        value = node.attr('defaultvalue');
                                    }
                                    jQuery('#content'+k+' > tbody:last').append('<tr id="'+id+'_row"><td><div class="labeldiv" id="'+id+'_displayname">'+node.attr('displayname')+'</div></td><td><div class="addressdiv"><input class="input1" id="'+id+'" value="'+(value || '')+'"/><input type="hidden" id="'+id+'_wkt"/></div></td></tr>');
                                    var options = {
                                        apikey: node.attr('apikey'),
                                        area: node.attr('filter'),
                                        id: id
                                    }
                                    if (node.attr('geometry_selected')) { 
                                        options.geometrySelect = new Function (node.attr('geometry_selected'));
                                    }
                                    if (node.attr('disablemap')) {
                                        options.disablemap = node.attr('disablemap');
                                    }
                                    this.setAddressSelect(options);
                                    if (urlparam) {
                                        this.postparams[urlparam+'_wkt'] = {
                                            id: id+'_wkt'
                                        };
                                    }
                                    
                                    if (node.attr('regexp')) {
                                        this.inputValidation[id] = true;
                                        jQuery('#'+id).valid8({
                                            'regularExpressions': [
                                                 { expression: new RegExp(node.attr('regexp')), errormessage: node.attr('validate') || 'Indtast en valid vÃ¦rdi!'}
                                             ]
                                        });
                                    }
                                    
                                    if (value) {
                                        var o = {};
                                        for (var name in options) {
                                            o[name] = options[name];
                                        }
                                        o.limit = 1;
    
                                        jQuery.ajax( {
                                            scriptCharset: 'UTF-8',
                                            url : 'http://find.spatialsuite.com/service/locations/2/detect/json/'+ encodeURIComponent(value),
                                            dataType : "jsonp",
                                            data : o,
                                            success : SpatialMap.Function.bind(function(options,result) {
                                                var a = result.data[0];
                                                jQuery('input#'+options.id).val(a.presentationString);
                                                var ui = {
                                                    item: {
                                                        data: a
                                                    }
                                                };
                                                var calculateDistanceFunctionString = options.geometrySelect || null;
                                                var disablemapValue = options.disablemap || null;
                                                this.addressSelected (options,calculateDistanceFunctionString,disablemapValue,{target: jQuery('input#'+options.id)},ui);
                                            },this,options)
                                        });
                                    }
                                    
                                break;
                                case 'geosearch':
                                    var value = this.getParam(urlparam);
                                    if (value == null) {
                                        value = node.attr('defaultvalue');
                                    }
                                    jQuery('#content'+k+' > tbody:last').append('<tr id="'+id+'_row"><td><div class="labeldiv" id="'+id+'_displayname">'+node.attr('displayname')+'</div></td><td><div class="addressdiv"><input class="input1" id="'+id+'" value="'+(value || '')+'"/><input type="hidden" id="'+id+'_wkt"/></div></td></tr>');
                                    var options = {
                                        resources: node.attr('resources') || 'Adresser',
                                        area: node.attr('filter') || '',
                                        id: id,
                                        limit: node.attr('limit') || 10
                                    }
                                    if (node.attr('geometry_selected')) { 
                                        options.geometrySelect = new Function (node.attr('geometry_selected'));
                                    }
                                    if (node.attr('disablemap')) {
                                        options.disablemap = node.attr('disablemap');
                                    }
                                    options.usegeometry = (node.attr('usegeometry') && node.attr('usegeometry') == 'true') ;

                                    this.setGeoSearch(options);
                                    if (urlparam) {
                                        this.postparams[urlparam+'_wkt'] = {
                                            id: id+'_wkt'
                                        };
                                    }
                                    
                                    if (node.attr('regexp')) {
                                        this.inputValidation[id] = true;
                                        jQuery('#'+id).valid8({
                                            'regularExpressions': [
                                                 { expression: new RegExp(node.attr('regexp')), errormessage: node.attr('validate') || 'Indtast en valid vÃ¦rdi!'}
                                             ]
                                        });
                                    }
                                    
                                    if (value) {
                                        var o = {};
                                        for (var name in options) {
                                            o[name] = options[name];
                                        }
                                        o.limit = 1;
                                        
                                        this.getTicket (SpatialMap.Function.bind(function (options,value) {
                                            options.ticket = this.ticket;
                                            options.service = 'GEO';
                                            options.search = encodeURIComponent(value);
                                            jQuery.ajax( {
                                                scriptCharset: 'UTF-8',
                                                url: '//kortforsyningen.kms.dk/Geosearch',
                                                dataType : "jsonp",
                                                data : options,
                                                success : SpatialMap.Function.bind(function(options,result) {
                                                    var a = result.data[0];
                                                    jQuery('input#'+options.id).val(a.presentationString);
                                                    var ui = {
                                                        item: {
                                                            data: a
                                                        }
                                                    };
                                                    var calculateDistanceFunctionString = options.geometrySelect || null;
                                                    var disablemapValue = options.disablemap || null;
                                                    this.geoSearchSelected (options,calculateDistanceFunctionString,disablemapValue,{target: jQuery('input#'+options.id)},ui);
                                                },this,options)
                                            });
                                        },this,o,value));
                                    }
                                    
                                break;
                                case 'maptools':
                                    //jQuery('#content'+k+' > tbody:last').append('<tr id="'+id+'_row"><td colspan="2" align="right"><div id="button1" class="button button1"></div><div id="button2" class="button button2"></div></td></tr>');
                                    jQuery('#content'+k+' > tbody:last').append('<tr id="'+id+'_row"><td colspan="2" align="right"><div id="mapbuttons_'+counter+'"></div></td></tr>');
                                    var maptools = node.find('maptool');
                                    for (var j=0;j<maptools.length;j++) {
                                        var name = jQuery(maptools[j]).attr('name').toString().toLowerCase();
                                        var displayname = jQuery(maptools[j]).attr('displayname');
                                        var title = '';
                                        if (displayname) {
                                            title = displayname.toString();
                                        }
                                        $('#mapbuttons_'+counter).append('<div id="mapbutton_'+counter+'_'+j+'" class="button" title="'+title+'"></div>');
                                        var id = 'mapbutton_'+counter+'_'+j;
                                        jQuery('#'+id).addClass('button_'+name).click(SpatialMap.Function.bind(this.activateTool,this,name,maptools[j]));
                                        this.mapbuttons[name] = id;
                                        
                                        if (jQuery(maptools[j]).attr('default')=='true') {
                                            this.defaultMapTool = name;
                                        }
                                    }
                                break;
                                case 'map':
                                    jQuery('#content'+k+' > tbody:last').append('<tr id="'+id+'_row"><td colspan="2"><div id="map_'+counter+'" class="map'+(className ? ' '+className : '')+'"></div></td></tr>');
                                    var extent = node.find('extent').text();
                                    if (extent) {
                                        extent = extent.split(',');
                                    } else {
                                        extent = this.extent;
                                    }
                                    for(var j=0; j<extent.length; j++) { extent[j] = +extent[j]; } 
                                    var resolutions = node.find('resolutions').text();
                                    if (resolutions) {
                                        resolutions = resolutions.split(',');
                                        for(var j=0; j<resolutions.length; j++) { resolutions[j] = +resolutions[j]; } 
                                    } else {
                                        resolutions = this.resolutions;
                                    }
                                    
                                    var layers = [];
                                    var themes = node.find('theme');
                                    for (var j=0;j<themes.length;j++) {
                                        var l = {
                                            layername: jQuery(themes[j]).attr('layername') || jQuery(themes[j]).attr('name'),
                                            host: jQuery(themes[j]).attr('host'),
                                            basemap:false,
                                            visible:true
                                        };
                                        
                                        var servicename = jQuery(themes[j]).attr('servicename');
                                        if (servicename) {
                                            l.servicename = servicename;
                                        }
                                        var singleTile = jQuery(themes[j]).attr('singleTile');
                                        if (singleTile && singleTile == 'true') {
                                            l.singleTile = true;
                                        }
                                        var buffer = jQuery(themes[j]).attr('buffer');
                                        if (buffer) {
                                            l.buffer = buffer-0;
                                        }
                                        var ratio = jQuery(themes[j]).attr('ratio');
                                        if (ratio) {
                                            l.ratio = ratio-0;
                                        }
                                        var opacity = jQuery(themes[j]).attr('opacity');
                                        if (opacity) {
                                            l.opacity = opacity-0;
                                        }
                                        var maxScale = jQuery(themes[j]).attr('maxScale');
                                        if (maxScale) {
                                            l.maxScale = maxScale-0;
                                        }
                                        var minScale = jQuery(themes[j]).attr('minScale');
                                        if (minScale) {
                                            l.minScale = minScale-0;
                                        }
                                        var format = jQuery(themes[j]).attr('format');
                                        if (format) {
                                            l.format = format;
                                        }
                                        var useSessionID = jQuery(themes[j]).attr('useSessionID');
                                        if (useSessionID == 'false') {
                                        } else {
                                            l.sessionid = this.sessionid;
                                        }
                                        layers.push(l);
                                    }
                                    
                                    var mapoptions = {
                                        extent: {x1:extent[0],y1:extent[1],x2:extent[2],y2:extent[3]},
                                        resolutions: resolutions,
                                        layers: layers
                                    }
                                    this.map = new SpatialMap.Map ('map_'+counter,mapoptions);
                                break;
                                case 'area':
                                    this.areaid = id;
                                    jQuery('#content'+k+' > tbody:last').append('<tr id="'+id+'_row"><td colspan="2"><div class="areadiv'+(className ? ' '+className : '')+'">'+node.attr('displayname')+'<span id="areaspan_'+id+'">0</span> m&#178;</div><input type="hidden" id="'+id+'" value=""/></td></tr>');
                                    if (node.attr('onchange')) {
                                        jQuery('#'+id).change(new Function (node.attr('onchange')));
                                    }
                                break;
                                case 'conflicts':
                                    var html = '<tr id="'+id+'_row"><td colspan="2"><div id="container_conflictdiv_'+id+'" class="inputdiv conflictdivcontainer'+(className ? ' '+className : '')+'">';
                                    if (node.attr('displayname')!='') {
                                        html += '<div class="doublelabeldiv">'+node.attr('displayname')+'</div>';
                                    }
                                    html += '<div class="conflictdiv" id="conflictdiv_'+id+'"/></div><input type="hidden" id="'+id+'" value=""/></td></tr>';
                                    jQuery('#content'+k+' > tbody:last').append(html);
                                    this.spatialqueries.push({
                                        id: id, //'conflictdiv_'+counter,
                                        targetsetfile: node.attr('targetsetfile'),
                                        targerset: node.attr('targerset')
                                    });
                                break;
                                case 'input':
                                    var type = node.attr('type');
                                    var value = this.getParam(urlparam);
                                    if (value == null) {
                                        value = node.attr('defaultvalue');
                                    }
                                    if (type=='dropdown') {
                                        jQuery('#content'+k+' > tbody:last').append('<tr id="'+id+'_row"><td><div class="labeldiv'+(className ? ' '+className : '')+'" id="'+id+'_displayname">'+node.attr('displayname')+'<div></td><td><div class="valuediv"><select class="select1" id="'+id+'"/></div></td></tr>');
                                        var option = node.find('option');
                                        var list = [];
                                        if (node.attr('datasource')) {
                                            list = this.dropdownFromDatasource(node.attr('datasource'));
                                        } else {
                                            for (var j=0;j<option.length;j++) {
                                                list.push({
                                                    value: jQuery(option[j]).attr('value'),
                                                    name: jQuery(option[j]).attr('name'),
                                                    checked: jQuery(option[j]).attr('value') == value
                                                });
                                            }
                                        }
                                        this.populateDropdown($('#'+id),list);
                                    } else if (type=='radiobutton') {
                                        var option = node.find('option');
                                        var str = '';
                                        for (var j=0;j<option.length;j++) {
                                            var checked = (jQuery(option[j]).attr('value') == value ? ' checked="checked"' : '');
                                            str += '<div><label><input type="radio" id="'+id+'" name="'+id+'" value="'+jQuery(option[j]).attr('value')+'"'+checked+'>'+jQuery(option[j]).attr('name')+'</label></div>';
                                        }
                                        jQuery('#content'+k+' > tbody:last').append('<tr id="'+id+'_row"><td><div class="labeldiv'+(className ? ' '+className : '')+'" id="'+id+'_displayname">'+node.attr('displayname')+'<div></td><td><div class="valuediv">'+str+'</div></td></tr>');
                                    } else if (type=='textarea') {
                                        jQuery('#content'+k+' > tbody:last').append('<tr id="'+id+'_row"><td><div class="labeldiv'+(className ? ' '+className : '')+'" id="'+id+'_displayname">'+node.attr('displayname')+'</div></td><td><div class="valuediv"><textarea class="textarea1" id="'+id+'">'+(value || '')+'</textarea></div></td></tr>');
                                    } else if (type=='hidden') {
                                        jQuery('#content'+k+' > tbody:last').append('<tr id="'+id+'_row" style="display:none;"><td><input type="hidden" id="'+id+'" value="'+(value || '')+'"/></div></td></tr>');
                                    } else if (type=='text') {
                                        if (node.attr('displayresult')) {
                                            var displayresult = node.attr('displayresult');
                                            jQuery('#content'+k+' > tbody:last').append('<tr id="'+id+'_row"><td colspan="2"><div class="textdiv'+(className ? ' '+className : '')+'">'+node.attr('displayname')+'<span class="distanceresult">'+displayresult+'</span><input type="hidden" id="distanceresult_hidden" value=""/></div></td></tr>'); 
                                            if (node.attr('onchange')) {
                                                jQuery('#distanceresult_hidden').change(new Function (node.attr('onchange')));
                                            }
                                        } else { 
                                            jQuery('#content'+k+' > tbody:last').append('<tr id="'+id+'_row"><td colspan="2"><div class="textdiv'+(className ? ' '+className : '')+'" id="'+id+'">'+node.attr('displayname')+'</div></td></tr>');
                                        }
                                    } else if (type=='date') {
                                        jQuery('#content'+k+' > tbody:last').append('<tr id="'+id+'_row"><td><div class="labeldiv'+(className ? ' '+className : '')+'" id="'+id+'_displayname">'+node.attr('displayname')+'</div></td><td><div class="valuediv"><input class="input1" id="'+id+'" value="'+(value || '')+'"/></div></td></tr>');
                                        var change = null;
                                        if (node.attr('onchange')) {
                                            change = new Function (node.attr('onchange'));
                                        }
                                        var options = {
                                            dateFormat: 'dd.mm.yy',
                                            onSelect: SpatialMap.Function.bind( function (id,changehandler) {
                                                if (this.inputValidation[id]) {
                                                    jQuery('#'+id).isValid();
                                                }
                                                if (changehandler) {
                                                    changehandler (jQuery('#'+id));
                                                }
                                            },this,id, change),
                                            onClose: change
                                        };
                                        
                                        if (node.attr('limitfromdatasource')) {
                                                                                        
                                            var disabledDays = [];
                                            var request = jQuery.ajax({
                                                url : 'cbkort',
                                                dataType : 'xml',
                                                type: 'POST',
                                                async: false,
                                                data : {
                                                    page: 'formular.read.dates',
                                                    datasource: node.attr('limitfromdatasource'),
                                                    sessionid: this.sessionid
                                                }
                                            });
                                            var cols = jQuery(request.responseXML).find('col');
                                            for (var coli=0;coli<cols.length;coli++) {
                                                disabledDays.push(jQuery(cols[coli]).text());
                                            }
                                            
                                            this.inputOptions[id].disabledDays = disabledDays;
                                        
                                            options.constrainInput = true;
                                            options.beforeShowDay = SpatialMap.Function.bind( function (disabledDays, date) {
                                                var m = date.getMonth()+1, d = date.getDate(), y = date.getFullYear();
                                                m = (m<10?'0'+m:m);
                                                d = (d<10?'0'+d:d);
                                                if(jQuery.inArray(d + '.' + m + '.' + y,disabledDays) != -1) {
                                                    return [false];
                                                }
                                                return [true];
                                            }, this, disabledDays);
                                        }
                                        
                                        jQuery('#'+id).datepicker(options);
                                    } else if (type=='file') {
                                        jQuery('#content'+k+' > tbody:last').append('<tr id="'+id+'_row"><td><input type="hidden" id="'+id+'" value="'+(value || '')+'"/><input type="hidden" id="'+id+'_org" value="'+(value || '')+'"/><div class="labeldiv'+(className ? ' '+className : '')+'" id="'+id+'_displayname">'+node.attr('displayname')+'</div></td><td><div class="valuediv"><form id="form_'+id+'" method="POST" target="uploadframe_'+id+'" enctype="multipart/form-data" action="/jsp/modules/formular/upload.jsp"><input type="file" name="file_'+id+'" id="file_'+id+'" /><input type="hidden" name="callbackhandler" value="parent.formular.fileupload"/><input type="hidden" name="id" value="'+id+'"/><input type="hidden" name="sessionid" value="'+this.sessionid+'"/><input type="hidden" name="formular" value="'+this.name+'"/></form><iframe name="uploadframe_'+id+'" id="uploadframe_'+id+'" frameborder="0" style="display:none;"></iframe></div></td></tr>');
                                        jQuery('#file_'+id).change (SpatialMap.Function.bind(function (id) {
                                            jQuery('#form_'+id).submit();
                                        },this,id));
                                    } else if (type=='checkbox') {
                                        jQuery('#content'+k+' > tbody:last').append('<tr id="'+id+'_row"><td><div class="labeldiv'+(className ? ' '+className : '')+'" id="'+id+'_displayname"></div></td><td><div class="valuediv"><label><input type="checkbox" id="'+id+'"'+(value=='false' ? '' : ' checked="checked"')+'/>'+node.attr('displayname')+'</label></div></td></tr>');
                                    } else {
                                        type = 'input';
                                        jQuery('#content'+k+' > tbody:last').append('<tr id="'+id+'_row"><td><div class="labeldiv'+(className ? ' '+className : '')+'" id="'+id+'_displayname">'+node.attr('displayname')+'</div></td><td><div class="valuediv"><input class="input1" id="'+id+'" value="'+(value || '')+'"/></div></td></tr>');
                                    }
                                    if (urlparam) {
                                        this.postparams[urlparam].type = type;
                                    }
                                    if (node.attr('regexp')) {
                                        this.inputValidation[id] = true;
                                        jQuery('#'+id).valid8({
                                            'regularExpressions': [
                                                 { expression: new RegExp(node.attr('regexp')), errormessage: node.attr('validate') || 'Indtast en valid vÃ¦rdi!'}
                                             ]
                                        });
                                    }
                                    var f = null;
                                    if (node.attr('onchange')) {
                                        var f = new Function (node.attr('onchange'));
                                    }
                                    jQuery('#'+id).change(SpatialMap.Function.bind(function (onchange) {
                                        if (onchange) {
                                            onchange();
                                        }
                                        this.inputChanged();
                                    },this,f));
                                    
                                    var f = null;
                                    if (node.attr('onkeyup')) {
                                        var f = new Function (node.attr('onkeyup'));
                                    }
                                    jQuery('#'+id).keyup(SpatialMap.Function.bind(function (onkeyup) {
                                        if (onkeyup) {
                                            onkeyup();
                                        }
                                        this.inputChanged();
                                    },this,f));

//                                    if (node.attr('onkeyup')) {
//                                        jQuery('#'+id).keyup(new Function (node.attr('onkeyup')));
//                                    }
                                    
                                break;
                                case 'submitbutton':
                                    var button = jQuery('<button>'+node.attr('displayname')+'</button>');
                                    var func = node.attr('function');
                                    if (func) {
                                        button.click (new Function (func));
                                    }
                                    this.submitbuttons.push (button);
                                break;
                                case 'confirm':
                                    this.confirm = node.attr('displayname');
                                break;
                            }
                        }
                        var p = (k<this.config.length && k!=0 && this.config.length > 0);
                        var n = (k<this.config.length-1 && this.config.length > 0);
                        var s = (k==this.config.length-1);
                        jQuery('#content'+k+' > tbody:last').append('<tr><td colspan="2" align="right"><div>'+(p?'<button id="previous'+k+'">Forige</button>':'')+(n?'<button id="next'+k+'">Næste</button>':'')+(s?'<button id="sendbutton">Send</button>':'')+'</div></td></tr>');
                        if (p) {
                            jQuery('button#previous'+k).click(SpatialMap.Function.bind(this.previous,this,k));
                        }
                        if (n) {
                            jQuery('button#next'+k).click(SpatialMap.Function.bind(this.next,this,k));
                        }
                        if (s) {
                            jQuery('button#sendbutton').click(SpatialMap.Function.bind(this.submit,this));
                        }
                            //add submit button
//                            jQuery('#content'+this.config.length-1+' > tbody:last').append('<tr><td colspan="2" align="right"><div class="submitbuttondiv" id="submitdiv"><button id="sendbutton">Send</button></div></td></tr>');
//                            jQuery('#sendbutton').click(SpatialMap.Function.bind (function () {
//                                this.submit();
//                            },this));
                    }
                    if (this.map) {
                        this.activateTool (this.defaultMapTool);
                    }
                    if (this.showTabs) {
                        if (this.confirm) {
                            var c = 'confirm';
                            jQuery('.tabcontainer').append('<div id="tabsep'+c+'" class="sep"/>');
                            var item = jQuery('<div id="tab'+c+'">Godkend</div>');
                            //item.click(SpatialMap.Function.bind(this.showTab,this,k));
                            jQuery('.tabcontainer').append(item);
                        } else {
                            jQuery('.tabcontainer div:last-child').removeClass('arrow_box');
                        }
                    }
                    this.checkConditions();
                    this.showTab(0);
//                    setTimeout(SpatialMap.Function.bind(function () {this.next(-1)},this),1);
                }
            },this)
        });
    },
    
    inputChanged: function (id) {
        
        
        this.checkConditions();
    },
    
    checkConditions: function () {
        for (var i=0;i<this.conditions.length;i++) {
            if (!(this.conditions[i].condition instanceof Function)) {
                this.conditions[i].condition = new Function ('return '+this.conditions[i].condition);
            }
            if (this.conditions[i].condition()) {
                jQuery('#'+this.conditions[i].id+'_row').show();
            } else {
                jQuery('#'+this.conditions[i].id+'_row').hide();
            }
        }
    },
    
    next: function (current) {
        this.showTab(current+1);
    },
    
    previous: function (current) {
        this.showTab(current-1);
    },
    
    showTab: function (i) {
        jQuery('table.tablecontent').hide();
        jQuery('table#content'+i).show();
        
        jQuery('.tabcontainer div').removeClass('active');
        jQuery('.tabcontainer div#tab'+i).addClass('active');
        jQuery('.tabcontainer div#tabsep'+i).addClass('active');
    },
    
    setAddressSelect: function (options) {
        var calculateDistanceFunctionString = options.geometrySelect || null;
        var disablemapValue = options.disablemap || null;
        
        jQuery('input#'+options.id).autocomplete({
            selectFirst : true,
            source: function(request, response) {
                jQuery.ajax( {
                    scriptCharset: 'UTF-8',
                    url : 'http://find.spatialsuite.com/service/locations/2/detect/json/'+ encodeURIComponent(request.term),
                    dataType : "jsonp",
                    autoFocus: true,
                    data : options,
                    success : function(result) {
                        response(jQuery.map(result.data, function(item) {
                            displayLabel = item.presentationString;
                            displayValue = item.presentationString;
                            return {
                                label: displayLabel,
                                value: displayValue,
                                data: item
                            };
                        }));
                    }
                });
            },
            delay: 200,
            minLength : 1,
            select : SpatialMap.Function.bind(this.addressSelected,this,options,calculateDistanceFunctionString,disablemapValue)
        });
    },
    
    setGeoSearch: function (options) {
        this.getTicket (SpatialMap.Function.bind(function (options) {
            var calculateDistanceFunctionString = options.geometrySelect || null;
            var disablemapValue = options.disablemap || null;
            options.ticket = this.ticket;
            
            jQuery('input#'+options.id).autocomplete({
                selectFirst : true,
                source: function(request, response) {
                    jQuery.ajax( {
                        scriptCharset: 'UTF-8',
                        url: '//kortforsyningen.kms.dk/Geosearch?service=GEO&search='+ encodeURIComponent(request.term),
                        dataType : "jsonp",
                        autoFocus: true,
                        data : options,
                        success : function(result) {
                            response(jQuery.map(result.data, function(item) {
                                displayLabel = item.presentationString;
                                displayValue = item.presentationString;
                                return {
                                    label: displayLabel,
                                    value: displayValue,
                                    data: item
                                };
                            }));
                        }
                    });
                },
                delay: 200,
                minLength : 1,
                select : SpatialMap.Function.bind(this.geoSearchSelected,this,options,calculateDistanceFunctionString,disablemapValue)
            });
        },this,options));
    },
    
    addressSelected: function (options,cdfs,disablemapValue,event,ui) {
        var id = jQuery(event.target).attr('id');
        if (ui.item.data.type == 'street' && disablemapValue != 'true') {
            if (this.map) {
                this.map.zoomToExtent({x1:ui.item.data.xMin,y1:ui.item.data.yMin,x2:ui.item.data.xMax,y2:ui.item.data.yMax});
            }
            this.validAddress = false;
            jQuery('#'+id+'_wkt').val ('');
        } else {
            if (this.map && disablemapValue != 'true') {
                this.map.zoomToExtent({x1:ui.item.data.x-1,y1:ui.item.data.y-1,x2:ui.item.data.x+1,y2:ui.item.data.y+1});
            }
            this.validAddress = true;
            jQuery('#'+id+'_wkt').val (ui.item.data.wkt);
            if (options.usegeometry) {
                this.map.drawWKT (ui.item.data.wkt,SpatialMap.Function.bind(this.featureDrawed,this),{styles: this.style});
            }
            if (jQuery('#'+id+'_wkt').attr('value') != '') {
                if (cdfs) {
                    cdfs();                    
                }
            }
        }
    },
    
    geoSearchSelected: function (options,cdfs,disablemapValue,event,ui) {
        var id = jQuery(event.target).attr('id');
        if (ui.item.data.type == 'streetNameType' && disablemapValue != 'true') {
            if (this.map) {
                this.map.zoomToExtent({x1:ui.item.data.xMin,y1:ui.item.data.yMin,x2:ui.item.data.xMax,y2:ui.item.data.yMax});
            }
            this.validAddress = false;
            jQuery('#'+id+'_wkt').val ('');
        } else if (ui.item.data.type == 'matrikelnummer' && disablemapValue != 'true') {
            alert('Det er ikke muligt at søge på jordstykker endnu!')
            this.validAddress = false;
            jQuery('#'+id+'_wkt').val ('');
        } else {
            if (this.map && disablemapValue != 'true') {
                this.map.zoomToExtent({x1:ui.item.data.x-1,y1:ui.item.data.y-1,x2:ui.item.data.x+1,y2:ui.item.data.y+1});
            }
            this.validAddress = true;
            jQuery('#'+id+'_wkt').val (ui.item.data.geometryWkt);
            if (options.usegeometry) {
                this.map.drawWKT (ui.item.data.geometryWkt,SpatialMap.Function.bind(this.featureDrawed,this),{styles: this.style});
            }
            if (jQuery('#'+id+'_wkt').attr('value') != '') {
                if (cdfs) {
                    cdfs();                    
                }
            }
        }
    },
    
    getTicket: function (callback) {
        if (this.ticket) {
            callback();
        } else {
            var params = {
                page: 'formular.get.ticket',
                sessionid: this.sessionid
            };
    
            jQuery.ajax( {
                url : 'cbkort',
                dataType : 'json',
                type: 'POST',
                async: true,
                data : params,
                success : SpatialMap.Function.bind( function(callback, data, status) {
                    this.ticket = data.row[0].expressionresult;
                    callback();
                },this,callback)
            });
        }
    },
    
    setMap: function (options) {
    },
    
    resetButtons: function () {
        for (var name in this.mapbuttons) {
            jQuery('#'+this.mapbuttons[name]).removeClass ('button_'+name+'_active');
        }
    },
    
    activateTool: function (type,tool) {
        this.resetButtons();
        this.map.setClickEvent();
        jQuery('#'+this.mapbuttons[type]).addClass ('button_'+type+'_active');
        switch(type) {
            case 'pan':
                this.map.panzoom();
            break;
            case 'select':
                this.map.panzoom();
                var datasource = jQuery(tool).attr('datasource').toString().toLowerCase();
                if (!datasource || datasource == '') {
                    alert('Datasource missing!');
                    this.activateTool('pan');
                    return;
                } else {
                    this.map.setClickEvent(SpatialMap.Function.bind(this.selectFromDatasource,this,datasource));
                }
            break;
            case 'polygon':
                this.map.drawPolygon(SpatialMap.Function.bind(this.featureDrawed,this),{styles: this.style});
            break;
            case 'line':
                this.map.drawLine(SpatialMap.Function.bind(this.featureDrawed,this),{styles: this.style});
            break;
            case 'circle':
                this.map.drawRegularPolygon(SpatialMap.Function.bind(this.featureDrawed,this),{draw: {sides: 40},styles: this.style});
            break;
            case 'point':
                this.map.drawPoint(SpatialMap.Function.bind(this.featureDrawed,this),{styles: this.style});
            break;
        }
    },

    featureDrawed: function (event) {
        if (this.feature) {
            this.map.deleteFeature (this.feature.id);
        }
        this.feature = event;
        
        if (this.areaid != null) {
            var area = parseInt(event.wkt.getArea());
            jQuery('#areaspan_'+this.areaid).html(area);
            jQuery('#'+this.areaid).val(area);
            jQuery('#'+this.areaid).change();
        }
        
        this.query (event.wkt);
    },
    
    selectFromDatasource: function (datasource,wkt) {
        var params = {
            page: 'getfeature-from-wkt',
            wkt: wkt.toString(),
            sessionid: this.sessionid,
            datasource: datasource,
            command: 'read-spatial',
            buffer: 0
        };

        jQuery.ajax( {
            url : 'cbkort',
            dataType : 'xml',
            type: 'POST',
            async: false,
            data : params,
            success : SpatialMap.Function.bind( function(data, status) {
                var wkt = jQuery(data).find('col[name="shape_wkt"]').text();
                if (wkt) {
                    this.map.drawWKT(wkt,SpatialMap.Function.bind(this.featureDrawed,this),{styles: this.style});
                }
            },this)
        });
    },
    
    dropdownFromDatasource: function (datasource,customparams) {
        var params = {
            page: 'formular.read.dropdown',
            sessionid: this.sessionid,
            datasource: datasource
        };
        if (customparams) {
            params = SpatialMap.Util.extend (params,customparams);
        }
        var list = [];
        jQuery.ajax( {
            url: 'cbkort',
            dataType: 'xml',
            type: 'POST',
            async: false,
            data: params,
            success : function(data, status) {
                var rows = jQuery(data).find('row');
                for (var i=0;i<rows.length;i++) {
                    list.push({
                        value: jQuery(rows[i]).find('col[name="value"]').text(),
                        name: jQuery(rows[i]).find('col[name="name"]').text(),
                        selected: (i==0)
                    });
                }
            }
        });
        return list;
    },
    
    populateDropdown: function (dropdown, list) {
        dropdown.empty();
        for (var j=0;j<list.length;j++) {
            var checked = (list[j].checked ? ' selected="selected"' : '');
            dropdown.append('<option value="'+list[j].value+'"'+checked+'>'+list[j].name+'</option>');
        }
    },
    
    query: function (wkt) {
        var params = {
            page: 'formular-query',
            wkt: wkt.toString(),
            sessionid: this.sessionid
        }
        
        for (var i=0;i<this.spatialqueries.length;i++) {
            jQuery('#'+this.spatialqueries[i].id).html('');
            jQuery('#container_'+this.spatialqueries[i].id).hide();
            
            if (this.spatialqueries[i].targerset) {
                params.targetset = this.spatialqueries[i].targerset;
            }
            if (this.spatialqueries[i].targetsetfile) {
                params.targetsetfile = this.spatialqueries[i].targetsetfile;
            }
        
            jQuery.ajax( {
                url : 'cbkort',
                dataType : 'xml',
                type: 'POST',
                async: false,
                data : params,
                success : SpatialMap.Function.bind( function(id, data, status) {
                    var targets = jQuery(data).find('pcomposite[name="presentation"]');
                    var displayname = [];
                    var html = '';
                    var reporttext = '';
                    var count = 0;
                    for (var i=0;i<targets.length;i++) {
                        //html += '<b>'+jQuery(targets[i]).find('col[name="targetdisplayname"]').text() + '</b><br/>';
                        rowlist = jQuery(targets[i]).find('rowlist');
                        for (var j=0;j<rowlist.length;j++) {
                            var row = jQuery(rowlist[j]).find('row');
                            count++;
                            for (var k=0;k<row.length;k++) {
                                reporttext += jQuery(row[k]).find('col[name="label"]').text() + jQuery(row[k]).find('col[name="value"]').text() + '\u000A';//'%0A';//'&#10;';//'&#xA;';//
                                html += '<div class="targetrow">'+jQuery(row[k]).find('col[name="label"]').text() + jQuery(row[k]).find('col[name="value"]').text() + '</div>';
                            }
                        }
                    }
                    if (html != '') {
                      jQuery('#container_conflictdiv_'+id).show();
                        jQuery('#conflictdiv_'+id).html(html);
                    } else {
                      jQuery('#container_conflictdiv_'+id).hide();
                    }
                    if (count) {
                        jQuery('#'+id).val(reporttext);
                        jQuery('#container_conflictdiv_'+id).show('fast');
                    }
                },this,this.spatialqueries[i].id)
            });
        }
    },
    
    submit: function () {
        if (this.map && this.feature == null) {
            alert('Tegn pÃ¥ kortet og udfyld alle felter inden der trykkes pÃ¥ "Send"');
            return;
        } else {
            var params = {
                sessionid: this.sessionid,
                formular: this.name,
                page: this.submitpage,
                layers: this.reportlayers,
                profile: this.reportprofile,
                formularxsl: this.reportxsl
            };
            if (this.map && this.feature) {
                params.wkt = this.feature.wkt.toString();
            }
            if (this.reportmapscale !== null) {
                params.map_web = 'minscale+'+this.reportmapscale+'+maxscale+'+this.reportmapscale;
            }
            var invalidCount = 0;
            for (var name in this.inputValidation) {
                if (this.inputValidation[name]) {
                    var valid = jQuery('#'+name).isValid ();
                    if (!valid) {
                        invalidCount++;
                    }
                }
            }
            if (invalidCount) {
                if (invalidCount == 1) {
                    alert ('Der er et felt, der ikke er indtastet korrekt!');
                } else {
                    alert('Der er '+invalidCount+' felter, der ikke er indtastet korrekt!');
                }
                jQuery('#'+name).focus();
                return;
            }
            
            var confirmtext = '';
            for (var name in this.postparams) {
                var val = jQuery('#'+this.postparams[name].id).val();
                var textVal = val;
                if (this.postparams[name].type && this.postparams[name].type == 'checkbox') {
                    val = jQuery('#'+this.postparams[name].id).is(':checked');
                    textVal = (val ? 'ja' : 'nej');
                }
                if (this.postparams[name].type && this.postparams[name].type == 'radiobutton') {
                    val = jQuery('input:radio[name='+this.postparams[name].id+']:checked').val();
                    textVal = val;
                }
                if (this.postparams[name].type && this.postparams[name].type == 'file') {
                    textVal = jQuery('#'+this.postparams[name].id+'_org').val();
                }
                params[name] = this.encodeParam(name,val);
                if (this.parseDisplaynames) {
                    params[name+'_displayname'] = this.encodeParam(name+'_displayname',this.postparams[name].displayname);
                }
                
                var t = jQuery('#'+this.postparams[name].id+'_displayname').text ();
                if (t && val) {
                    confirmtext+='<br/>'+t+' '+textVal;
                }
            }
            jQuery('div#content').hide();
            jQuery('#message').show();
            jQuery('#messagetext').empty();
            jQuery('#messagebuttons').empty();
            
            if (this.confirm) {
                jQuery('#messagetext').html('<div id="message_done">'+this.confirm+confirmtext+'</div>');
                var confirmbutton = jQuery('<button>Godkend</button>');
                confirmbutton.click (SpatialMap.Function.bind(function (params) {
                    jQuery('#messagebuttons').hide();
                    this.submitFinal(params);
                },this,params));
                var backbutton = jQuery('<button>Ret</button>');
                backbutton.click (SpatialMap.Function.bind(function (params) {
                    jQuery('div#content').show();
                    jQuery('#message').hide();
                },this,params));
                jQuery('#messagebuttons').append(backbutton);
                jQuery('#messagebuttons').append(confirmbutton);
                jQuery('#messagebuttons').show();
            } else {
                this.submitFinal(params);
            }
        }
    },
        
    submitFinal: function (params) {
        jQuery('#messagetext').html('<div id="message_loading">Ansøgningen registreres. Vent venligst...<br/>(Det kan tage op til et par minutter)</div>');

        jQuery('#messagebuttons').empty();
        for (var i=0;i<this.submitbuttons.length;i++) {
            jQuery('#messagebuttons').append(this.submitbuttons[i]);
        }
        
        jQuery.ajax( {
            url : 'cbkort',
            dataType : 'xml',
            type: 'POST',
            async: true,
            data : params,
            success : SpatialMap.Function.bind( function(data, status) {
                if (this.showReport) {
                    var pdf = jQuery(data).find('col[name="url"]');
                    if (pdf.length) {
                        jQuery.ajax( {
                            url : '/jsp/modules/formular/final.jsp',
                            dataType : 'json',
                            type: 'POST',
                            async: true,
                            data : {
                                file: pdf.text().replace(/\/tmp\//,''),
                                formular: this.name,
                                sessionid: this.sessionid
                            },
                            success: function (data) {
                                if(data.result!='OK') {
                                    jQuery('#messagetext').html('<div id="message_done">Ansøgningen er nu registreret.<br/>Hent en kvitering på ansøgningen <a href="'+pdf.text()+'" target="_blank">her</a> (Åbnes i et nyt vindue!)</div>');
                                }
                            }
                        });
                        jQuery('#message').show();
                        jQuery('#messagebuttons').show();
                        jQuery('#messagetext').html('<div id="message_done">Ansøgningen er nu registreret.<br/>Hent en kvitering på ansøgningen <a href="'+pdf.text()+'" target="_blank">her</a> (Åbnes i et nyt vindue!)</div>');
                    } else {
                        jQuery('#message').show();
                        jQuery('#messagetext').html('<div id="message_done">Der opstod en fejl i forbindelse med registreringen af ansøgningen. Kontakt venligst kommunen for yderligere oplysninger.</div>');
                    }
                } else {
                    jQuery('#message').show();
                    jQuery('#messagebuttons').show();
                    jQuery('#messagetext').html('<div id="message_done">Din ansøgning er nu registreret. Tak for din henvendelse.</div>');
                }
            },this),
            error : SpatialMap.Function.bind( function(data, status) {
                jQuery('#message').show().html('<div id="message_done">Der opstod en fejl i forbindelse med registreringen af ansøgningen. Prøv igen eller kontakt kommunen.</div>');
            },this)
        });
    },
    
    fileupload: function (filename,id,orgfilename) {
        jQuery('#'+id).val(filename);
        jQuery('#'+id+'_org').val(orgfilename);
    },
    
    start: function () {
        document.location.reload();
    },
    
    load: function (url) {
        window.open (url + this.sessionid);
    }, 
    
    compare: function (a,b, message) {
        if (jQuery('#'+a).val() != jQuery('#'+b).val()) {
            jQuery('#'+b).valid8({
                'regularExpressions': [
                     { expression: new RegExp('QQQQQQ'), errormessage: message || 'Ikke ens!'}
                 ]
            });
            this.inputValidation[b] = true;
        } else {
            jQuery('#'+b).valid8({
                'regularExpressions': [
                     { expression: new RegExp('.*')}
                 ]
            });
            this.inputValidation[b] = false;
        }
        jQuery('#'+b).isValid();
    },

    countDays: function (date1,date2,resultElement) {
        if (date1 && date2) {
            date1 = date1.split('.');
            date1 = new Date(date1[2],date1[1]-1,date1[0]);
            date2 = date2.split('.');
            date2 = new Date(date2[2],date2[1]-1,date2[0]);
            jQuery('#'+resultElement).val(((date2-date1)/1000/60/60/24));
        } else {
            jQuery('#'+resultElement).val('');
        }
    },
    
    setDatepickerLimit: function (id,options) {
//        options = {
//            start: text,
//            end: text,
//            days: array of text
//        }
        options = options || {};
        options.days = options.days || []; 

        if (this.inputOptions[id] && this.inputOptions[id].disabledDays) {
            options.days = options.days.concat(this.inputOptions[id].disabledDays);
        }
        
        jQuery('#'+id).datepicker('option', 'constrainInput', true );

        jQuery('#'+id).datepicker('option', 'beforeShowDay', SpatialMap.Function.bind( function (options, date) {
            var m = date.getMonth()+1, d = date.getDate(), y = date.getFullYear();
            m = (m<10?'0'+m:m);
            d = (d<10?'0'+d:d);
            if(jQuery.inArray(d + '.' + m + '.' + y,options.days) != -1) {
                return [false];
            }
            if(options.start) {
                var startdate = options.start.split('.');
                var start_d = startdate[0]-0;
                var start_m = startdate[1]-0;
                var start_y = startdate[2]-0;
                if (date.getDate() <= start_d && date.getMonth()+1 <= start_m && date.getFullYear() <= start_y) {
                    return [false];
                }
            }
            if(options.end) {
                var enddate = options.end.split('.');
                var end_d = enddate[0]-0;
                var end_m = enddate[1]-0;
                var end_y = enddate[2]-0;
                if (date.getDate() >= end_d && date.getMonth()+1 >= end_m && date.getFullYear() >= end_y) {
                    return [false];
                }
            }
            
            return [true];
        }, this, options) );
        
        
    },
    
    getParam: function (name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    },
    
    encodeParam: function (name,val) {
        return encodeURIComponent(val);
    }

});

function calculateDistance (a,b) {
    jQuery(".distanceresult").html('0 m');
    jQuery(".distanceresult").find(".systemmessage_alarm").hide();
    var wktA = jQuery('#'+a+'_wkt').val();
    var wktB = jQuery('#'+b+'_wkt').val();

    if (wktA.match(/^POINT/) && wktB.match(/^POINT/)) {
/* nyere måde
        var gA = new SpatialServer.Geometry ({wkt:wktA});
        var gB = new SpatialServer.Geometry ({wkt:wktB});
        var distance = gA.distance(gB);
*/    
        
        var params = {
            page: 'geometry.expression.distance',
            wkt1: wktA,
            wkt2: wktB,
            sessionid: Formular.sessionid
        }
        
        jQuery.ajax({
            data: params,
            url: '/cbkort',
            dataType: 'XML',
            type: 'POST',
            success: function (data) {
                var StringDist = jQuery(data).find('col').text();  // m
                jQuery('#distanceresult_hidden').val(StringDist).change();
                if (StringDist > 1000) {
                    StringDist = StringDist/1000; // km
                    var NumericDist = parseFloat(StringDist);
                    var dist = NumericDist.toFixed(1) + ' km';
                    dist = dist.replace('.',',');
                } else {
                    var NumericDist = parseFloat(StringDist);
                    var dist = NumericDist.toFixed(0) + ' m';
                }
                jQuery(".distanceresult").html(dist);
            }
        });
    } else if (wktA.match(/^POLYGON/) || wktB.match(/^POLYGON/)) {
        jQuery(".distanceresult").html('0 m'+'<span class="systemmessage_alarm"> *Husk husnummer!</span>');
        jQuery(".systemmessage_alarm").css({'color':'red', 'float':'right'});
    }
}


(function( jQuery ) {

jQuery( ".ui-autocomplete-input" ).live( "autocompleteopen", function() {
    var autocomplete = jQuery( this ).data( "autocomplete" ),
        menu = autocomplete.menu;

    if ( !autocomplete.options.selectFirst ) {
        return;
    }
    //the requested term no longer matches the search, so drop out of this now
    if(autocomplete.term != jQuery(this).val()){
        //console.log("mismatch! "+autocomplete.term+'|'+$(this).val());
        return;
    }
    //hack to prevent clearing of value on mismatch
    menu.options.blur = function(event,ui){return}
    menu.activate( jQuery.Event({ type: "mouseenter" }), menu.element.children().first() );
});

}( jQuery ));

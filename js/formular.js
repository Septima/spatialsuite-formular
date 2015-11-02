var formular = {
        
    _listeners: [],
    
    on: function (event, callback) {
        var listener = {event:event,callback:callback};
        this._listeners.push (listener);
        return listener;
    }
};

Formular = SpatialMap.Class ({
    
    name: null,
    sessionid: null,
    configpage: 'formular.config',
    submitpage: 'formular.send',
    pages: [],
	errorPages: [],
	errorMessages: [],
	errorHandling: true,
    removeSessionPage: 'formular.clear',
    config: null,
    map: null,
    extent: [539430.4,6237856,591859.2,6290284.8],
    resolutions: [0.4,0.8,1.6,3.2,6.4,12.8,25.6,51.2,102.4],
    
    currentMapState: null,
    currentMapTool: null,
    currentParams: {},
    
    mapbuttons: {},
    spatialqueries: [],
    postparams: {},
    feature: [],
    areaid: null,
    
    defaultMapTool: 'pan',
    
    inputValidation: {},
    
    inputOptions: {},
    
    reportprofile: 'alt',
    reportlayers: 'default',
    reportxsl: 'kvittering',
    reportmapscale: null,
    
    pdf: null,
    
    confirm: null,
    submitbuttons: [],
    
    messages: {},
    
    showReport: true,
    showTabs: false,
    
    style: {
        strokeColor: '#FF0000',
        fillColor: '#FFFFFF'
    },
    
    validAddress: false,
    
    conditions: [],
    
    parseDisplaynames: false,
    
    multipleGeometries: false,
    multipleGeometriesAttributes: [],
    mergeGeometries: true,

    featureRequired: true,
    
    localstore: false,
    
    logActive: false,
    
    bootstrap: false,
    tabs: [],
    currentTab: 0,
    
    valid: true,
    validatedElements: {},
    mapId: null,
    
    _listeners: [],
    
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

                this.configData = data;

                this.fireEvent('formular-config-ready',data);

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

                var headerurl = jQuery(data).find('headerhtml').attr('url');
                if (headerurl) {
                    jQuery('header.navbar').load(headerurl);
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

                var messages = jQuery(data).find('messages > message');
                if (messages.length > 0) {
                    for (var i=0;i<messages.length;i++) {
                        this.messages[jQuery(messages[i]).attr('name')] = jQuery(messages[i]).text();
                    }
                }

                var pages = jQuery(data).find('submitpages > page');
                if (pages.length > 0) {
                    this.pages = [];
                    for (var i=0;i<pages.length;i++) {
                        var p = {
                            name: jQuery(pages[i]).text(),
                            parser: jQuery(pages[i]).attr('parser'),
                            url: jQuery(pages[i]).attr('url') || 'cbkort',
                            type: jQuery(pages[i]).attr('type') || 'json',
                            urlparam: jQuery(pages[i]).attr('urlparam'),
                            condition: jQuery(pages[i]).attr('condition'),
                            error: null
                        };
                        if (jQuery(pages[i]).attr('errortype')) {
                            p.error = p.error || {};
                            p.error.type = jQuery(pages[i]).attr('errortype');
                        }
                        if (jQuery(pages[i]).attr('errormessage')) {
                            p.error = p.error || {};
                            p.error.message = jQuery(pages[i]).attr('errormessage');
                        }
                        this.pages.push(p);
                    }
                } else {
                    var page = jQuery(data).find('submitpage');
                    if (page.length > 0) {
                        this.submitpage = jQuery(page[0]).text();
                    }
                }
				
				var errorPages = jQuery(data).find('errorpages > page');
				if (errorPages.length > 0) {
                    this.errorPages = [];
                    for (var i=0;i<errorPages.length;i++) {
                        var p = {
                            name: jQuery(errorPages[i]).text(),
                            parser: jQuery(errorPages[i]).attr('parser'),
                            url: jQuery(errorPages[i]).attr('url') || 'cbkort',
                            type: jQuery(errorPages[i]).attr('type') || 'json',
                            urlparam: jQuery(errorPages[i]).attr('urlparam'),
                            condition: jQuery(errorPages[i]).attr('condition'),
                            error: null
                        };
                        this.errorPages.push(p);
                    }
                }
                
                var showReport = jQuery(data).find('showreport').text();
                if (showReport) {
                    this.showReport = showReport != 'false';
                }
                var showTabs = jQuery(data).find('tabs').text();
                if (showTabs) {
                    this.showTabs = (showTabs == 'true');
                    if (this.bootstrap === true) {
                        var tabcontainer = jQuery('.navlist');
                        var className = jQuery(jQuery(data).find('tabs')[0]).attr('class');
                        tabcontainer.addClass(className);
                    } else {
                        var tabcontainer = jQuery('<div class="tabcontainer"></div>');
                        var className = jQuery(jQuery(data).find('tabs')[0]).attr('class');
                        tabcontainer.addClass(className);
                        jQuery('div#content').append(tabcontainer);
                    }
                }
                var parseDisplaynames = jQuery(data).find('parsedisplaynames').text();
                if (parseDisplaynames) {
                    this.parseDisplaynames = (parseDisplaynames == 'true');
                }

                this.config = jQuery(data).find('content');
                var counter = 0;
                if (this.config.length) {
                    for (var k=0;k<this.config.length;k++) {

                        var contentcontainer = null;
                        var cententElement = null;

                        if (this.bootstrap === true) {
                            contentcontainer = jQuery('<fieldset id="content'+k+'"></fieldset>');

                            jQuery('div#content').prepend(contentcontainer);

                            cententElement = contentcontainer;

                        } else {
                            var contenttable = jQuery('<table class="tablecontent tabcontent tabcontent'+k+'" id="content'+k+'"></table>');

                            contentcontainer = jQuery('<tbody></tbody>');
                            contenttable.append(contentcontainer);
                            jQuery('div#content').append(contenttable);

                            cententElement = contenttable;
                        }

                        var displayname = jQuery(this.config[k]).attr('displayname');

                        var tab = {
                            id: k,
                            contentId: 'content'+k,
                            element: null,
                            contentElement: cententElement,
                            displayname: displayname,
                            type: jQuery(this.config[k]).attr('type') || '',
                            visible: true,
                            postparams: []
                        };

                        if(this.showTabs) {

                            if (this.bootstrap === true) {

                                tab.element = jQuery('<li id="tab'+k+'"><a title="'+displayname+'" href="#'+displayname+'">'+displayname+'</a></li>');
                                tab.element.click(SpatialMap.Function.bind(function (tab) {
                                    var count = this.validateTab(this.currentTab);
                                    this.showTab(tab.id);
                                },this,tab));
                                jQuery('.navlist').append(tab.element);

                            } else {

                                tab.element = jQuery('<div id="tab'+k+'" class="arrow_box">'+displayname+'</div>');
                                tab.element.click(SpatialMap.Function.bind(this.showTab,this,tab.id));
                                jQuery('.tabcontainer').append(tab.element);
                                if (k < this.config.length-1) {
                                    jQuery('.tabcontainer').append('<div id="tabsep'+(k+1)+'" class="sep"/>');
                                }
                            }

                            if (jQuery(this.config[k]).attr('condition')) {
                                this.conditions.push({id: 'tab'+k, elementId: 'tab'+k, condition: jQuery(this.config[k]).attr('condition'), ref: tab});
                            }

                        }
                        this.tabs.push(tab);

                        var config = jQuery(this.config[k]).children();
                        for (var i=0; i<config.length; i++) {
                            var node = jQuery(config[i]);

                            if (node[0].nodeName === 'columns') {
                                if (this.bootstrap === true) {

                                    var rowID = (Math.random()+1).toString(36).substring(2,8);

                                    var row = jQuery('<div class="row"></div>');
                                    var className = node.attr('class');
                                    if (className) {
                                        row.addClass(className);
                                    }
                                    contentcontainer.append(row);
                                    var cols = node.children(); //column array
                                    var s = Math.floor(12/cols.length);
                                    for (var j = 0; j < cols.length; j++) {
                                        var colID = j;
                                        var col = jQuery('<div></div>');
                                        var className = jQuery(cols[j]).attr('class');
                                        if (!className) {
                                            className = 'col-sm-'+s;
                                        }
                                        col.addClass(className);

                                        row.append(col);

                                        var configCol = jQuery(cols[j]).children(); //Input array

                                        for (var l = 0; l < configCol.length; l++) {
                                            var nodeCol = jQuery(configCol[l]); //Input
                                            var postparam = this.addInput(nodeCol, col, {
                                                counter: counter,
                                                tab: tab
                                            });

                                            postparam.colClassName = className;
                                            postparam.colID = colID;
                                            postparam.rowID = rowID;

                                            if (typeof postparam.urlparam !== 'undefined') {
                                                this.postparams[postparam.urlparam] = postparam;
                                                tab.postparams.push(postparam);
                                            }
                                            counter++;
                                        }
                                    }

                                } else {
                                    var colTR = jQuery('<tr></tr>');
                                    var colTD = jQuery('<td colspan="2"></td>');
                                    colTR.append(colTD);
                                    contentcontainer.append(colTR);
                                    var className = node.attr('class');
                                    var cols = node.children(); //column array
                                    var div2 = jQuery('<div class="colcontainer colcontainer' + cols.length + '' + (className ? ' ' + className : '') + '"></div>');
                                    colTD.append(div2);
                                    for (var j = 0; j < cols.length; j++) {
                                        var className = jQuery(cols[j]).attr('class');
                                        var div = jQuery('<div class="col col' + cols.length + '' + (className ? ' ' + className : '') + '"></div>');
                                        var colcontenttable = jQuery('<table class="tablecontent" id="content' + k + '_' + j + '"></table>');
                                        var colcontentcontainer = jQuery('<tbody></tbody>');
                                        colcontenttable.append(colcontentcontainer);
                                        div.append(colcontenttable);
                                        div2.append(div);
                                        var configCol = jQuery(cols[j]).children(); //Input array

                                        for (var l = 0; l < configCol.length; l++) {
                                            var nodeCol = jQuery(configCol[l]); //Input
                                            var postparam = this.addInput(nodeCol, colcontentcontainer, {
                                                counter: counter,
                                                tab: tab
                                            });

                                            if (typeof postparam.urlparam !== 'undefined') {
                                                this.postparams[postparam.urlparam] = postparam;
                                                tab.postparams.push(postparam);
                                            }
                                            counter++;
                                        }
                                    }
                                }
                            } else {
                                var postparam = this.addInput(node,contentcontainer,{
                                    counter: counter,
                                    tab: tab
                                });

                                if (typeof postparam.urlparam !== 'undefined') {
                                    this.postparams[postparam.urlparam] = postparam;
                                    tab.postparams.push(postparam);
                                }
                                counter++;
                            }

                        }

                        if (this.bootstrap) {

                        } else {

                            var p = (k<this.config.length && k!=0 && this.config.length > 0);
                            var n = (k<this.config.length-1 && this.config.length > 0);
                            var s = (k==this.config.length-1);
                            contentcontainer.append('<tr><td colspan="2" align="right"><div>'+(p?'<button id="previous'+k+'">Forrige</button>':'')+(n?'<button id="next'+k+'">Næste</button>':'')+(s?'<button id="sendbutton">Send</button>':'')+'</div></td></tr>');
                            if (p) {
                                jQuery('button#previous'+k).click(SpatialMap.Function.bind(this.previous,this,k));
                            }
                            if (n) {
                                jQuery('button#next'+k).click(SpatialMap.Function.bind(this.next,this,k));
                            }
                            if (s) {
                                jQuery('button#sendbutton').click(SpatialMap.Function.bind(this.submit,this));
                            }

                        }

                    }
                    if (this.map) {
                        this.currentMapTool = this.defaultMapTool;
                        this.activateTool (this.defaultMapTool);
                    }
                    if (this.showTabs) {

                        if (this.bootstrap) {
                            jQuery('.buttons #previous').click(SpatialMap.Function.bind(this.previous,this));
                            jQuery('.buttons #next').click(SpatialMap.Function.bind(this.next,this));
                            this.setButtons();

                            jQuery('.buttons #submit').click(SpatialMap.Function.bind(this.submit,this));

                        } else {

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
                    }

                    var localstore = jQuery(data).find('localstore').text();
                    if (localstore) {
                        this.localstore = localstore != 'false';
                        if (this.localstore) {
                            this.readLocalStore();
                        }
                    }

                    var log = jQuery(data).find('log').text();
                    if (log) {
                        this.logActive = (log === 'true');
                    }

                    this.checkConditions();
                    this.showTab(0);
//                    setTimeout(SpatialMap.Function.bind(function () {this.next(-1)},this),1);

//                    this.log({
//                        type: 'info',
//                        name: 'configready',
//                        message: 'Start OK'
//                    });

                }

                //Bootstrap - fjern loading når filen er hentet
                jQuery('#content').removeClass('content-loading');

            },this)
        });
        
        jQuery('#loading').hide();
    },
    
    addInput: function (node,contentcontainer,options) {
        var urlparam = node.attr('urlparam');
        var counter = options.counter;
        var tab = options.tab;
        var id = 'input_'+counter;
        if (node.attr('id')) {
            id = node.attr('id');
        }

        var req = false;
        if (node.attr('required')) {
            req = node.attr('required') === 'true';
        }

        var postparam = {
            id: id,
            displayname: node.attr('displayname'),
            description: node.attr('description'),
            defaultValue: node.attr('defaultvalue'),
            required: req,
            visible: true,
            tab: tab,
            disabled: node.attr('disabled') === 'true',
            config: node
        };
        
        if (urlparam) {
            postparam.urlparam = urlparam;
        }
        
        if (node.attr('condition')) {
            this.conditions.push({id: id, elementId: id+'_row', condition: node.attr('condition'), required: req, ref: postparam});
        }
        
        var className = node.attr('class');
        switch(node[0].nodeName) {
            case 'address':
                var value = this.getParam(urlparam);
                if (value == null) {
                    value = node.attr('defaultvalue');
                }
                
                if (this.bootstrap === true) {
                    contentcontainer.append('<div id="'+id+'_row" class="form-group'+(className ? ' '+className : '')+'"><label for="'+id+'">'+node.attr('displayname')+(req ? ' <span class="required">*</span>':'')+'</label><div class="'+(req ? 'required-enabled':'')+'"><input id="'+id+'" class="form-control" placeholder="'+(node.attr('placeholder') || '')+'" type="text" value="'+(value || '')+'"/><input type="hidden" id="'+id+'_wkt"/></div></div>');
                } else {
                    contentcontainer.append('<tr id="'+id+'_row"><td><div class="labeldiv" id="'+id+'_displayname">'+node.attr('displayname')+'</div></td><td><div class="addressdiv"><input class="input1" id="'+id+'" placeholder="'+(node.attr('placeholder') || '')+'" value="'+(value || '')+'"/><input type="hidden" id="'+id+'_wkt"/></div></td></tr>');
                }
                
                var options = {
                    noadrspec: 'true',
                    limit: 15,
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
                options.usegeometry = (node.attr('usegeometry') && node.attr('usegeometry') === 'true') ;
                
                if (node.attr('minzoom')) {
                    options.minzoom = node.attr('minzoom')-0;
                }
                if (node.attr('minscale')) {
                    options.minscale = node.attr('minscale')-0;
                }

                this.setAddressSelect(options);
                if (urlparam) {
                    this.postparams[urlparam+'_wkt'] = {
                        id: id+'_wkt'
                    };
                }
                
                var regexp = node.attr('regexp');
                if (regexp || req === true) {
                    this.inputValidation[id] = {
                        validate: true,
                        required: req,
                        regexp: regexp,
                        tab: tab,
                        message: node.attr('validate') || 'Indtast en valid værdi!'
                    };

                    if (req) {
                        this.inputValidation[id].handler = SpatialMap.Function.bind(function (id,errormessage) {
                            var valid = (jQuery('#'+id).val() !== '');
                            var map = jQuery('#'+id+'_row > .map');
                            jQuery('#'+id+'_row > .required-enabled').removeClass('error');
                            jQuery('#'+id+'ValidationMessage').remove();
                            if (valid === false) {
                                jQuery('#'+id+'_row > .required-enabled').addClass('error');
                                jQuery('<span id="'+id+'ValidationMessage" class="error validationMessage">'+errormessage+'</span>').insertAfter(jQuery('#'+id));
                            }
                            return valid;
                        },this, id, this.inputValidation[id].message)  ;                      
                    }

                    if (regexp) {
                        jQuery('#'+id).valid8({
                            'regularExpressions': [
                                 { expression: new RegExp(node.attr('regexp')), errormessage: this.inputValidation[id].message }
                             ]
                        });
                    }
                }
                
                if (value) {
                    var o = {};
                    for (var name in options) {
                        o[name] = options[name];
                    }
                    o.limit = 1;

                    jQuery.ajax( {
                        scriptCharset: 'UTF-8',
                        url : '//smartadresse.dk/service/locations/2/detect/json/'+ value,
                        dataType : "jsonp",
                        data : o,
                        success : SpatialMap.Function.bind(function(options,result) {
                            if (result.data.length > 0) {
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
                            }
                        },this,options)
                    });
                }
                
            break;
            case 'geosearch':
                var value = this.getParam(urlparam);
                if (value == null) {
                    value = node.attr('defaultvalue');
                }
                if (this.bootstrap === true) {
                    contentcontainer.append('<div id="'+id+'_row" class="form-group'+(className ? ' '+className : '')+'"><label for="'+id+'">'+node.attr('displayname')+(req ? ' <span class="required">*</span>':'')+'</label><div class="'+(req ? 'required-enabled':'')+'"><input id="'+id+'" class="form-control" placeholder="'+(node.attr('placeholder') || '')+'" type="text" value="'+(value || '')+'"/><input type="hidden" id="'+id+'_wkt"/></div></div>');
                } else {
                    contentcontainer.append('<tr id="'+id+'_row"><td><div class="labeldiv" id="'+id+'_displayname">'+node.attr('displayname')+'</div></td><td><div class="addressdiv"><input class="input1" placeholder="'+(node.attr('placeholder') || '')+'" id="'+id+'" value="'+(value || '')+'"/><input type="hidden" id="'+id+'_wkt"/></div></td></tr>');
                }
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
                options.usegeometry = (node.attr('usegeometry') && node.attr('usegeometry') === 'true') ;
                
                if (node.attr('minzoom')) {
                    options.minzoom = node.attr('minzoom')-0;
                }
                if (node.attr('minscale')) {
                    options.minscale = node.attr('minscale')-0;
                }

                this.setGeoSearch(options);
                if (urlparam) {
                    this.postparams[urlparam+'_wkt'] = {
                        id: id+'_wkt'
                    };
                }
                
                var regexp = node.attr('regexp');
                if (regexp || req === true) {
                    this.inputValidation[id] = {
                        validate: true,
                        required: req,
                        regexp: regexp,
                        tab: tab,
                        message: node.attr('validate') || 'Indtast en valid værdi!'
                    };

                    if (req) {
                        this.inputValidation[id].handler = SpatialMap.Function.bind(function (id,errormessage) {
                            var valid = (jQuery('#'+id).val() !== '');
                            var map = jQuery('#'+id+'_row > .map');
                            jQuery('#'+id+'_row > .required-enabled').removeClass('error');
                            jQuery('#'+id+'ValidationMessage').remove();
                            if (valid === false) {
                                jQuery('#'+id+'_row > .required-enabled').addClass('error');
                                var message = jQuery('#'+id+'ValidationMessage');
                                if (message.length === 0) {
                                    jQuery('<span id="'+id+'ValidationMessage" class="error validationMessage">'+errormessage+'</span>').insertAfter(jQuery('#'+id));
                                }
                            }
                            return valid;
                        },this, id, this.inputValidation[id].message)  ;                      
                    }

                    if (regexp) {
                        jQuery('#'+id).valid8({
                            'regularExpressions': [
                                 { expression: new RegExp(node.attr('regexp')), errormessage: this.inputValidation[id].message }
                             ]
                        });
                    }
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
                        options.search = value;
                        jQuery.ajax( {
                            scriptCharset: 'UTF-8',
                            url: '//kortforsyningen.kms.dk/Geosearch',
                            dataType : "jsonp",
                            data : options,
                            success : SpatialMap.Function.bind(function(options,result) {
                                if (result.data.length > 0) {
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
                                }
                            },this,options)
                        });
                    },this,o,value));
                }
                
            break;
            case 'maptools':
                
                if (this.bootstrap === true) {
                    contentcontainer.append('<div id="'+id+'_row" class="form-group maptools'+(className ? ' '+className : '')+'"><div id="mapbuttons_'+counter+'"></div></div>');
                } else {
                    contentcontainer.append('<tr id="'+id+'_row"><td colspan="2" align="right"><div id="mapbuttons_'+counter+'"></div></td></tr>');
                }
                
                var maptools = node.find('maptool');
                for (var j=0;j<maptools.length;j++) {
                    var name = jQuery(maptools[j]).attr('name').toString().toLowerCase();
                    var displayname = jQuery(maptools[j]).attr('displayname');
                    var title = '';
                    if (displayname) {
                        title = displayname.toString();
                    }
                    var id = 'mapbutton_'+counter+'_'+j;
                    var button = jQuery('<div id="'+id+'" class="button button_'+name+'" title="'+title+'"><div></div></div>')
                    button.click(SpatialMap.Function.bind(this.activateTool,this,name));
                    this.mapbuttons[name] = {
                        element: button,
                        options: null,
                        config: jQuery(maptools[j])
                    }
                    if (jQuery(maptools[j]).attr('options')) {
                        this.mapbuttons[name].options = jQuery(maptools[j]).attr('options').toString().toLowerCase();
                    }

                    if (jQuery(maptools[j]).attr('disable')=='true') {
                        button.addClass('button_disabled');
                    }

                    $('#mapbuttons_'+counter).append(button);
                    
                    if (jQuery(maptools[j]).attr('default')=='true') {
                        this.defaultMapTool = name;
                    }
                }
            break;
            case 'map':
                
                this.mapId = id;
                
                if (this.bootstrap === true) {
                    contentcontainer.append('<div id="'+id+'_row" class="form-group mapcontainer"><label for="'+id+'">'+node.attr('displayname')+(req ? ' <span class="required">*</span>':'')+'</label><div id="'+id+'" class="map'+(className ? ' '+className : '')+'"></div><div class="features_attributes"></div></div>');
                } else {
                    contentcontainer.append('<tr id="'+id+'_row"><td colspan="2"><div id="'+id+'" class="map'+(className ? ' '+className : '')+'"></div><div class="features_attributes"></div></td></tr>');
                }
                
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
                
                this.multipleGeometries = (typeof node.attr('multiplegeometries') !== 'undefined' && node.attr('multiplegeometries') === 'true');
                this.mergeGeometries = (typeof node.attr('mergegeometries') !== 'undefined' && node.attr('mergegeometries') === 'false');
                
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
                    var useTicket = jQuery(themes[j]).attr('useTicket');
                    if (useTicket == 'false') {

                    } else {
                        l.ticket = this.getTicket (function () {}, true);
                        l.host = l.host + (l.host.match(/[?]/) === null ? '?' : '&') + 'ticket='+l.ticket;
                    }
                    layers.push(l);
                }
                
                var mapoptions = {
                    extent: {x1:extent[0],y1:extent[1],x2:extent[2],y2:extent[3]},
                    resolutions: resolutions,
                    layers: layers
                }
                
                if (node.attr('onchange')) {
                    var mapchange = new Function (node.attr('onchange'));
                    mapoptions.mapChangeHandler = SpatialMap.Function.bind(function (handler,map) {
                        this.currentMapState = map;
                        if (this.localstore) {
                            this.writeLocalStore();
                        }
                        handler(map);
                    },this,mapchange);
                } else {
                    mapoptions.mapChangeHandler = SpatialMap.Function.bind(function (map) {
                        this.currentMapState = map;
                        if (this.localstore) {
                            this.writeLocalStore();
                        }
                    },this);
                }
                
                this.map = new SpatialMap.Map (id,mapoptions);
                
                var attributesNode = node.find('attributes');
                var children = jQuery(attributesNode).children();
                if (children.length > 0) {
                    this.multipleGeometriesAttributesOptions = {
                        page: attributesNode.attr('page'),
                        datasource: attributesNode.attr('datasource'),
                        command: attributesNode.attr('command')
                    }
                    
                    this.multipleGeometriesAttributes = [];
                    for (var i=0;i<children.length;i++) {
                        this.multipleGeometriesAttributes.push({
                            config: jQuery(children[i]),
                            counter: counter
                        });
                    }
                }
                
                this.featureRequired = req;
                
                if (req === true) {
                    
                    var errormessage = node.attr('validate') || 'Tegn i kortet!';
                    
                    this.inputValidation[id] = {
                        validate: true,
                        tab: tab,
                        message: errormessage,
                        handler: SpatialMap.Function.bind(function (id,errormessage) {
                            var valid = this.feature.length > 0;
                            var map = jQuery('#'+id+'_row > .map');
                            map.removeClass('error');
                            jQuery('#'+id+'ValidationMessage').remove();
                            if (valid === false) {
                                map.addClass('error');
                                var message = jQuery('#'+id+'ValidationMessage');
                                if (message.length === 0) {
                                    jQuery('<span id="'+id+'ValidationMessage" class="error validationMessage">'+errormessage+'</span>').insertAfter(map);
                                }
                            }
                            
                            return valid;
                        },this, id, errormessage)
                    };
                }

                
            break;
            case 'area':
                this.areaid = id;
                if (this.bootstrap === true) {
                    contentcontainer.append('<div id="'+id+'_row" class="form-group'+(className ? ' '+className : '')+'"><label>'+node.attr('displayname')+' <span id="areaspan_'+id+'">0</span> m&#178;<input type="hidden" id="'+id+'" value=""/></label></div>');
                } else {
                    contentcontainer.append('<tr id="'+id+'_row"><td colspan="2"><div class="areadiv'+(className ? ' '+className : '')+'">'+node.attr('displayname')+'<span id="areaspan_'+id+'">0</span> m&#178;</div><input type="hidden" id="'+id+'" value=""/></td></tr>');
                }
                if (node.attr('onchange')) {
                    jQuery('#'+id).change(new Function (node.attr('onchange')));
                }
                
                //For localstore
                if (this.localstore) {
                    jQuery('#'+id).change(SpatialMap.Function.bind(this.writeLocalStore,this));
                }
            break;
            case 'conflicts':
                
                postparam.visible = false;
                postparam.type = 'conflicts';
                
                if (this.bootstrap === true) {
                    contentcontainer.append('<div id="'+id+'_row" class="hidden'+(className ? ' '+className : '')+'"></div><input type="hidden" id="'+id+'" value=""/>');
                } else {
                    var html = '<tr id="'+id+'_row"><td colspan="2"><div id="container_conflictdiv_'+id+'" class="inputdiv conflictdivcontainer'+(className ? ' '+className : '')+'">';
                    if (node.attr('displayname')!='') {
                        html += '<div class="doublelabeldiv">'+node.attr('displayname')+'</div>';
                    }
                    html += '<div class="conflictdiv" id="conflictdiv_'+id+'"/></div><input type="hidden" id="'+id+'" value=""/></td></tr>';
                    contentcontainer.append(html);
                }
                var conflict = {
                    id: id,
                    postparam: postparam,
                    displayname: node.attr('displayname'),
                    targetsetfile: node.attr('targetsetfile'),
                    targerset: node.attr('targerset')
                };
                if (node.attr('onconflict')) {
                    conflict.onconflict = new Function (node.attr('onconflict'));
                }
                if (node.attr('onnoconflict')) {
                    conflict.onnoconflict = new Function (node.attr('onnoconflict'));
                }
                this.spatialqueries.push(conflict);

            break;
            case 'input':
                var type = node.attr('type');
                var value = this.getParam(urlparam);
                if (value == null) {
                    value = node.attr('defaultvalue');
                }
                if (type=='dropdown') {
                    if (this.bootstrap === true) {
                        contentcontainer.append('<div id="'+id+'_row" class="form-group'+(className ? ' '+className : '')+'"><label for="'+id+'">'+node.attr('displayname')+(req ? ' <span class="required">*</span>':'')+'</label><div class="'+(req ? 'required-enabled':'')+'"><select id="'+id+'" class="form-control"/>'+(postparam.description ? '<div class="description">'+postparam.description+'</div>':'')+'</div></div>');
                    } else {
                        contentcontainer.append('<tr id="'+id+'_row"><td><div class="labeldiv'+(className ? ' '+className : '')+'" id="'+id+'_displayname">'+node.attr('displayname')+'<div></td><td><div class="valuediv"><select class="select1" id="'+id+'"/></div></td></tr>');
                    }
                    var option = node.find('option');
                    var list = [];
                    if (node.attr('datasource')) {
                        list = this.dropdownFromDatasource(node.attr('datasource'));
                    } else {
                        for (var j=0;j<option.length;j++) {
                            list.push({
                                value: jQuery(option[j]).attr('value'),
                                name: jQuery(option[j]).attr('name'),
                                checked: jQuery(option[j]).attr('value') == value,
                                disabled: jQuery(option[j]).attr('disabled') === 'true'
                            });
                        }
                    }
                    this.populateDropdown($('#'+id),list);
                } else if (type=='radiobutton') {
                    var option = node.find('option');
                    var str = '';
                    for (var j=0;j<option.length;j++) {
                        var checked = (jQuery(option[j]).attr('value') == value ? ' checked="checked"' : '');
                        if (this.bootstrap === true) {
                            str += '<div class="radio"><label><input type="radio" id="'+id+'" name="'+id+'" value="'+jQuery(option[j]).attr('value')+'" title="'+jQuery(option[j]).attr('name')+'"'+checked+'>'+jQuery(option[j]).attr('name')+'</label></div>';
                        } else {
                            str += '<div><label><input type="radio" id="'+id+'" name="'+id+'" value="'+jQuery(option[j]).attr('value')+'"'+checked+'>'+jQuery(option[j]).attr('name')+'</label></div>';
                        }
                    }
                    if (this.bootstrap === true) {
                        contentcontainer.append('<div id="'+id+'_row" class="form-group'+(className ? ' '+className : '')+'">'+str+'</div>');
                    } else {
                        contentcontainer.append('<tr id="'+id+'_row"><td><div class="labeldiv'+(className ? ' '+className : '')+'" id="'+id+'_displayname">'+node.attr('displayname')+'<div></td><td><div class="valuediv">'+str+'</div></td></tr>');
                    }
                } else if (type=='textarea') {
                    if (this.bootstrap === true) {
                        contentcontainer.append('<div id="'+id+'_row" class="form-group'+(className ? ' '+className : '')+'"><label for="'+id+'">'+node.attr('displayname')+(req ? ' <span class="required">*</span>':'')+'</label><div class="'+(req ? 'required-enabled':'')+'"><textarea id="'+id+'" class="form-control" '+(postparam.disabled ? 'disabled':'')+'>'+(value || '')+'</textarea></div></div>');
                    } else {
                        contentcontainer.append('<tr id="'+id+'_row"><td><div class="labeldiv'+(className ? ' '+className : '')+'" id="'+id+'_displayname">'+node.attr('displayname')+'</div></td><td><div class="valuediv"><textarea class="textarea1" id="'+id+'">'+(value || '')+'</textarea></div></td></tr>');
                    }
                } else if (type=='hidden') {
                    if (this.bootstrap === true) {
                        contentcontainer.append('<div id="'+id+'_row" class="form-group hidden'+(className ? ' '+className : '')+'"><input id="'+id+'" class="form-control" type="hidden" value="'+(value || '')+'"/></div>');
                    } else {
                        contentcontainer.append('<tr id="'+id+'_row" style="display:none;"><td><input type="hidden" id="'+id+'" value="'+(value || '')+'"/></div></td></tr>');
                    }
                } else if (type=='h1') {
                    if (this.bootstrap === true) {
                        contentcontainer.append('<h1 id="'+id+'_row" class="'+(className ? className : '')+'">'+node.attr('displayname')+'</h1>');
                    } else {
                        contentcontainer.append('<tr id="'+id+'_row"><td colspan="2" class="colspan2"><h1 class="headerdiv'+(className ? ' '+className : '')+'" id="'+id+'">'+node.attr('displayname')+'</h1></td></tr>');
                    }
                } else if (type=='h2') {
                    if (this.bootstrap === true) {
                        contentcontainer.append('<h2 id="'+id+'_row" class="'+(className ? className : '')+'">'+node.attr('displayname')+'</h2>');
                    } else {
                        contentcontainer.append('<tr id="'+id+'_row"><td colspan="2" class="colspan2"><h2 class="headerdiv'+(className ? ' '+className : '')+'" id="'+id+'">'+node.attr('displayname')+'</h2></td></tr>');
                    }
                } else if (type=='message') {
                    if (this.bootstrap === true) {
                        contentcontainer.append('<div id="'+id+'_row" class="'+(className ? className : '')+'">'+node.attr('displayname')+'</div>');
                    } else {
                        contentcontainer.append('<tr id="'+id+'_row"><td colspan="2" class="colspan2"><div class="'+(className ? className : '')+'" id="'+id+'">'+node.attr('displayname')+'</div></td></tr>');
                    }
                } else if (type=='preview') {
                    if (this.bootstrap === true) {
                        this.showEmptyInPreview = (node.attr('showempty') !== 'false');
                        contentcontainer.append('<div id="'+id+'_row" class="preview'+(className ? ' '+className : '')+'"></div>');
                    } else {
                        contentcontainer.append('<tr id="'+id+'_row"><td colspan="2" class="colspan2"><div class="preview'+(className ? ' '+className : '')+'" id="'+id+'"></div></td></tr>');
                    }
                } else if (type=='text') {
                    if (node.attr('displayresult')) {
                        var displayresult = node.attr('displayresult');
                        
                        if (this.bootstrap === true) {
                            contentcontainer.append('<p id="'+id+'_row" class="'+(className ? className : '')+'">'+node.attr('displayname')+'<span class="distanceresult">'+displayresult+'</span><input type="hidden" id="distanceresult_hidden" value=""/></p>');
                        } else {
                            contentcontainer.append('<tr id="'+id+'_row"><td colspan="2" class="colspan2"><div class="textdiv'+(className ? ' '+className : '')+'">'+node.attr('displayname')+'<span class="distanceresult">'+displayresult+'</span><input type="hidden" id="distanceresult_hidden" value=""/></div></td></tr>'); 
                        }
                        
                        if (node.attr('onchange')) {
                            jQuery('#distanceresult_hidden').change(new Function (node.attr('onchange')));
                        }
                    } else {
                        
                        if (this.bootstrap === true) {
                            contentcontainer.append('<p id="'+id+'_row" class="'+(className ? ' '+className : '')+'">'+node.attr('displayname')+'</p>');
                        } else {
                            contentcontainer.append('<tr id="'+id+'_row"><td colspan="2" class="colspan2"><div class="textdiv'+(className ? ' '+className : '')+'" id="'+id+'">'+node.attr('displayname')+'</div></td></tr>');
                        }
                    }
                } else if (type=='date') {
                    var today = (new Date()).toLocaleDateString().replace(/\//g,'.').replace(/^([0-9])\./,'0$1.').replace(/\.([0-9])\./,'.0$1.');
                    if (this.bootstrap === true) {
                        contentcontainer.append('<div id="'+id+'_row" class="form-group'+(className ? ' '+className : '')+'"><label for="'+id+'">'+node.attr('displayname')+(req ? ' <span class="required">*</span>':'')+'</label><div class="'+(req ? 'required-enabled':'')+'"><input id="'+id+'" '+(postparam.disabled ? 'disabled':'')+' class="form-control" placeholder="'+(node.attr('placeholder') || 'ex. '+today)+'" type="text" value="'+(value || '')+'"/>'+(postparam.description ? '<div class="description">'+postparam.description+'</div>':'')+'</div></div>');
                    } else {
                        contentcontainer.append('<tr id="'+id+'_row"><td><div class="labeldiv'+(className ? ' '+className : '')+'" id="'+id+'_displayname">'+node.attr('displayname')+'</div></td><td><div class="valuediv"><input class="input1" id="'+id+'" placeholder="'+(node.attr('placeholder') || '')+'" value="'+(value || '')+'"/></div></td></tr>');
                    }
                    var change = null;
                    if (node.attr('onchange')) {
                        change = new Function (node.attr('onchange'));
                    }
                    var options = {
                        dateFormat: 'dd.mm.yy',
                        onSelect: SpatialMap.Function.bind( function (id,changehandler) {
                            if (typeof this.inputValidation[id] !== 'undefined' && this.inputValidation[id].validate === true) {
                                jQuery('#'+id).isValid();
                            }
                            this.inputChanged(id);
                            if (changehandler) {
                                changehandler (jQuery('#'+id));
                            }
                        },this,id, change),
                        onClose: change
                    };
                    if (node.attr('onshow')) {
                        options.beforeShow = new Function (node.attr('onshow'));
                    }

                    var disabledDays = [];
                    if (node.attr('limitfromdatasource')) {
                                                                    
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
                        
                    }

                    var mindate = null;
                    if (node.attr('mindate') && jQuery.isNumeric(node.attr('mindate'))) {
                        mindate = new Date();
                        mindate.getMonth();
                        mindate.setDate(mindate.getDate()+(node.attr('mindate')-1));
                    }
                    var maxdate = null;
                    if (node.attr('maxdate') && jQuery.isNumeric(node.attr('maxdate'))) {
                        maxdate = new Date();
                        maxdate.getMonth();
                        maxdate.setDate(maxdate.getDate()+(node.attr('maxdate')-0));
                    }
                    
                    if (disabledDays.length > 0 || mindate || maxdate) {
                        this.inputOptions[id] = this.inputOptions[id] || {};
                        this.inputOptions[id].disabledDays = disabledDays;
                        options.constrainInput = true;
                        options.beforeShowDay = SpatialMap.Function.bind( function (disabledDays, mindate, maxdate, date) {
                            if (mindate && date < mindate) {
                                return [false];
                            }
                            if (maxdate && date > maxdate) {
                                return [false];
                            }
                            
                            var m = date.getMonth()+1, d = date.getDate(), y = date.getFullYear();
                            m = (m<10?'0'+m:m);
                            d = (d<10?'0'+d:d);
                            if(jQuery.inArray(d + '.' + m + '.' + y,disabledDays) != -1) {
                                return [false];
                            }
                            return [true];
                        }, this, disabledDays, mindate, maxdate);
                    }
                    
                    jQuery('#'+id).datepicker(options);
                    
                } else if (type=='file') {
                    if (this.bootstrap === true) {
                        contentcontainer.append('<div id="'+id+'_row" class="form-group'+(className ? ' '+className : '')+'"><label for="'+id+'">'+node.attr('displayname')+(req ? ' <span class="required">*</span>':'')+'</label><input type="hidden" id="'+id+'" value="'+(value || '')+'"/><input type="hidden" id="'+id+'_org" value="'+(value || '')+'"/><div class="fileupload'+(req ? ' required-enabled':'')+'"><form id="form_'+id+'" method="POST" target="uploadframe_'+id+'" enctype="multipart/form-data" action="/jsp/modules/formular/upload.jsp"><input '+(postparam.disabled ? 'disabled':'')+' type="file" name="file_'+id+'" id="file_'+id+'" /><span class="filupload-delete" title="Fjern vedhæftet fil"></span><input type="hidden" name="callbackhandler" value="parent.formular.fileupload"/><input type="hidden" name="id" value="'+id+'"/><input type="hidden" name="sessionid" value="'+this.sessionid+'"/><input type="hidden" name="formular" value="'+this.name+'"/></form><iframe name="uploadframe_'+id+'" id="uploadframe_'+id+'" frameborder="0" style="display:none;"></iframe></div></div>');
                        contentcontainer.find('#'+id+'_row .filupload-delete').click(SpatialMap.Function.bind(this.deleteFileUpload,this,id)).hide();
                    } else {
                        contentcontainer.append('<tr id="'+id+'_row"><td><input type="hidden" id="'+id+'" value="'+(value || '')+'"/><input type="hidden" id="'+id+'_org" value="'+(value || '')+'"/><div class="labeldiv'+(className ? ' '+className : '')+'" id="'+id+'_displayname">'+node.attr('displayname')+'</div></td><td><div class="valuediv"><form id="form_'+id+'" method="POST" target="uploadframe_'+id+'" enctype="multipart/form-data" action="/jsp/modules/formular/upload.jsp"><input type="file" name="file_'+id+'" id="file_'+id+'" /><input type="hidden" name="callbackhandler" value="parent.formular.fileupload"/><input type="hidden" name="id" value="'+id+'"/><input type="hidden" name="sessionid" value="'+this.sessionid+'"/><input type="hidden" name="formular" value="'+this.name+'"/></form><iframe name="uploadframe_'+id+'" id="uploadframe_'+id+'" frameborder="0" style="display:none;"></iframe></div></td></tr>');
                    }
                    jQuery('#file_'+id).change (SpatialMap.Function.bind(function (id) {
                        this.startFileUpload(id);
                        jQuery('#form_'+id).submit();
                    },this,id));
                } else if (type=='checkbox') {
                    if (this.bootstrap === true) {
                        contentcontainer.append('<div id="'+id+'_row" class="form-group'+(className ? ' '+className : '')+'"><div class="checkbox'+(req ? ' required-enabled':'')+'"><label><input type="checkbox" title="'+node.attr('displayname')+'" '+(postparam.disabled ? 'disabled':'')+' id="'+id+'"'+(value=='false' ? '' : ' checked="checked"')+'>'+node.attr('displayname')+(req ? ' <span class="required">*</span>':'')+'</label></div>'+(postparam.description ? '<div class="description">'+postparam.description+'</div>':'')+'</div>');
                    } else {
                        contentcontainer.append('<tr id="'+id+'_row"><td><div class="labeldiv'+(className ? ' '+className : '')+'" id="'+id+'_displayname"></div></td><td><div class="valuediv"><label><input type="checkbox" id="'+id+'"'+(value=='false' ? '' : ' checked="checked"')+'/>'+node.attr('displayname')+'</label></div></td></tr>');
                    }
                    
                } else {
                    type = 'input';
                    if (this.bootstrap === true) {
                        contentcontainer.append('<div id="'+id+'_row" class="form-group'+(className ? ' '+className : '')+'"><label for="'+id+'">'+node.attr('displayname')+(req ? ' <span class="required">*</span>':'')+'</label><div class="'+(req ? 'required-enabled':'')+'"><input id="'+id+'" class="form-control" placeholder="'+(node.attr('placeholder') || '')+'" type="text" '+(postparam.disabled ? 'disabled':'')+' value="'+(value || '')+'"/>'+(postparam.description ? '<div class="description">'+postparam.description+'</div>':'')+'</div></div>');
                    } else {
                        contentcontainer.append('<tr id="'+id+'_row"><td><div class="labeldiv'+(className ? ' '+className : '')+'" id="'+id+'_displayname">'+node.attr('displayname')+'</div></td><td><div class="valuediv"><input class="input1" id="'+id+'" placeholder="'+(node.attr('placeholder') || '')+'" value="'+(value || '')+'"/></div></td></tr>');
                    }
                }
                if (urlparam) {
                    postparam.type = type;
                }
                var regexp = node.attr('regexp');
                if (regexp || req === true) {
                    this.inputValidation[id] = {
                        validate: true,
                        required: req,
                        regexp: regexp,
                        tab: tab,
                        message: node.attr('validate') || 'Indtast en valid værdi!'
                    };

                    if (req) {
                        this.inputValidation[id].handler = SpatialMap.Function.bind(function (id,errormessage) {
                            var valid = (jQuery('#'+id).val() !== '');
                            var type = jQuery('#'+id).attr('type');
                            //if (type === 'checkbox') {
                            //    valid = jQuery('#'+id).is(":checked");
                            //}
                            var map = jQuery('#'+id+'_row > .map');
                            jQuery('#'+id+'_row > .required-enabled').removeClass('error');
                            jQuery('#'+id+'ValidationMessage').remove();
                            if (valid === false) {
                                jQuery('#'+id+'_row > .required-enabled').addClass('error');
                                var message = jQuery('#'+id+'ValidationMessage');
                                if (message.length === 0) {
                                    if (type === 'checkbox') {
                                        //jQuery('<span id="' + id + 'ValidationMessage" class="error validationMessage">' + errormessage + '</span>').insertAfter(jQuery('#'+id+'_row label'));
                                    } else {
                                        jQuery('<span id="' + id + 'ValidationMessage" class="error validationMessage">' + errormessage + '</span>').insertAfter(jQuery('#' + id));
                                    }
                                }
                            }
                            return valid;
                        },this, id, this.inputValidation[id].message)  ;                      
                    }                    
                    
                    if (regexp) {
                        jQuery('#'+id).valid8({
                            'regularExpressions': [
                                 { expression: new RegExp(node.attr('regexp')), errormessage: this.inputValidation[id].message }
                             ]
                        });
                    }
                }
                var f = null;
                if (node.attr('onchange')) {
                    var f = new Function (node.attr('onchange'));
                }
                if (type === 'radiobutton') {
                    jQuery('input:radio[name='+id+']').change(SpatialMap.Function.bind(function (onchange,id) {
                        if (onchange) {
                            onchange();
                        }
                        this.inputChanged(id);
                    },this,f,id));
                } else {
                    jQuery('#'+id).change(SpatialMap.Function.bind(function (onchange,id) {
                        if (onchange) {
                            onchange();
                        }
                        this.inputChanged(id);
                    },this,f,id));
                }
                
                var f = null;
                if (node.attr('onkeyup')) {
                    var f = new Function (node.attr('onkeyup'));
                }
                jQuery('#'+id).keyup(SpatialMap.Function.bind(function (onkeyup,id) {
                    if (onkeyup) {
                        onkeyup();
                    }
                    this.inputChanged(id);
                },this,f,id));

//                if (node.attr('onkeyup')) {
//                    jQuery('#'+id).keyup(new Function (node.attr('onkeyup')));
//                }
                
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
        
        return postparam;
        
    },
    
    inputChanged: function (id) {
        
        //For localstore
        if (this.localstore) {
            this.writeLocalStore();
        }
        
        if (typeof id !== 'undefined') {
            
            var valid = true;
            //Tjek det aktuelle inputfelt
            if (typeof this.inputValidation[id] !== 'undefined' && typeof this.inputValidation[id].handler !== 'undefined' && this.inputValidation[id].validate === true && this.inputValidation[id].tab.visible === true && this.inputValidation[id].visible !== false) {
                valid = this.inputValidation[id].handler();
            }
            if (valid === true) {
                jQuery('#'+name).isValid ();
            }
            
        }
        
        this.checkConditions();
    },
    
    checkConditions: function () {
        for (var i=0;i<this.conditions.length;i++) {
            if (!(this.conditions[i].condition instanceof Function)) {
                this.conditions[i].condition = new Function ('return '+this.conditions[i].condition);
            }
            var visible = this.conditions[i].condition();
            var first = (typeof this.conditions[i].visible === 'undefined');
            if (first === true || this.conditions[i].visible !== visible) {
                this.conditions[i].visible = visible;
                if (visible) {
                    jQuery('#'+this.conditions[i].elementId).show();
                } else {
                    jQuery('#'+this.conditions[i].elementId).hide();
                }
                
                if (typeof this.conditions[i].ref) {
                    if (typeof this.conditions[i].ref.tab !== 'undefined') {
                        this.resetTabValidation(this.conditions[i].ref.tab.id);
                    }
                    this.conditions[i].ref.visible = visible;
                }
    
                if (typeof this.inputValidation[this.conditions[i].id] !== 'undefined') {
                    this.inputValidation[this.conditions[i].id].visible = visible
                }
            }
        }
    },
    
    next: function (current) {
        if (this.bootstrap === true) {
            var next = this.currentTab+1;
            for (var i=next;i<this.tabs.length;i++) {
                if (this.tabs[i].visible === true) {
                    break;
                } else {
                    next++;
                }
            }
            var count = this.validateTab(this.currentTab);
            if (next <= this.tabs.length) {
                this.showTab(next);
            }
        } else {
            this.showTab(current+1);
        }
    },
    
    previous: function (current) {
        if (this.bootstrap === true) {
            var prev = this.currentTab-1;
            for (var i=prev;i=0;i--) {
                if (this.tabs[i].visible === true) {
                    
                    break;
                } else {
                    prev = i-1;
                }
            }
            var count = this.validateTab(this.currentTab);
            if (prev >= 0) {
                this.showTab(prev);
            }
        
        } else {
            prev = current-1;
            this.showTab(prev);
        }
    },
    
    setButtons: function () {
        if (this.tabs.length < 2) {
            jQuery('.buttons button').hide();
        } else {
            jQuery('.buttons #submit').hide();
            jQuery('.buttons #previous').show();
            jQuery('.buttons #next').show();
            if (this.currentTab === 0) {
                jQuery('.buttons a#previous').hide();
            }
            if (this.currentTab === this.tabs.length-1) {
                jQuery('.buttons #next').hide();
                jQuery('.buttons #submit').show();
            }
        }
    },
    
    showTab: function (i) {
        if (this.bootstrap === true) {
            
            var count = this.tabs.length;
            for (var j=0;j<this.tabs.length;j++) {
                if (this.tabs[j].visible === false) {
                    count--;
                }
            }
            
            jQuery('#steps').html('Trin '+(i+1)+' af '+count+' ');
            
            jQuery('.navlist > li').removeClass('active');
            jQuery('.navlist > li#tab'+i).addClass('active');
            
            jQuery('div#content fieldset').hide();
            this.tabs[i].contentElement.show();
            
            setTimeout(SpatialMap.Function.bind(function (tab) {
                window.location.hash = tab.displayname;
            },this,this.tabs[i]),100);
            
            this.currentTab = i;
            this.tabs[i].active = true;
            
            this.setButtons();
            
            if (this.tabs[i].type === 'confirm') {
                this.setPreview(jQuery('.preview'));
            }
            
        } else {
        
            if (!jQuery('.tabcontainer div#tab'+i).hasClass('disabled')) {
                jQuery('table.tablecontent.tabcontent').hide();
                jQuery('table.tabcontent.tabcontent'+i).show();
                
                jQuery('.tabcontainer div').removeClass('active');
                jQuery('.tabcontainer div#tab'+i).addClass('active');
                jQuery('.tabcontainer div#tabsep'+i).addClass('active');
            }
        }
    },
    
    setAddressSelect: function (options) {
        var calculateDistanceFunctionString = options.geometrySelect || null;
        var disablemapValue = options.disablemap || null;
        
        jQuery('input#'+options.id).autocomplete({
            selectFirst : true,
            source: function(request, response) {
                jQuery.ajax( {
                    scriptCharset: 'UTF-8',
                    url : '//smartadresse.dk/service/locations/3/detect/json/'+ encodeURIComponent(request.term),
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
        this.geoSearchSelected (options,cdfs,disablemapValue,event,ui);
    },
    
    geoSearchSelected: function (options,cdfs,disablemapValue,event,ui) {
        var id = jQuery(event.target).attr('id');
        if (ui.item.data.type == 'streetNameType' && disablemapValue != 'true') {
            if (this.map) {
                this.map.zoomToExtent({x1:ui.item.data.xMin,y1:ui.item.data.yMin,x2:ui.item.data.xMax,y2:ui.item.data.yMax});
                
                if (options.minzoom) {
                    var mapstate = this.map.getMapState();
                    if (options.minzoom < mapstate.zoomLevel) {
                        this.map.zoomTo(options.minzoom);
                    }
                }
                if (options.minscale) {
                    var mapstate = this.map.getMapState();
                    if (options.minscale > mapstate.scale) {
                        this.map.zoomToScale(options.minscale);
                    }
                }
            }
            this.validAddress = false;
            jQuery('#'+id+'_wkt').val ('');
        } else if (ui.item.data.type == 'matrikelnummer' && disablemapValue != 'true') {
            var x = [];
            var y = [];
            var p = ui.item.data.geometryWkt.replace('POLYGON((','').replace('))','').split(',');
            for (var i=0;i<p.length;i++) {
                var a = p[i].split(' ');
                x.push(a[0]-0);
                y.push(a[1]-0);
            }
            
            if (this.map && disablemapValue != 'true') {
                this.map.zoomToExtent({x1:Math.min.apply(Math, x),y1:Math.min.apply(Math, y),x2:Math.max.apply(Math, x),y2:Math.max.apply(Math, y)});
                
                if (options.minzoom) {
                    var mapstate = this.map.getMapState();
                    if (options.minzoom < mapstate.zoomLevel) {
                        this.map.zoomTo(options.minzoom);
                    }
                }
                if (options.minscale) {
                    var mapstate = this.map.getMapState();
                    if (options.minscale > mapstate.scale) {
                        this.map.zoomToScale(options.minscale);
                    }
                }
            }
            this.validAddress = true;
            jQuery('#'+id+'_wkt').val (ui.item.data.geometryWkt);
            if (this.map && options.usegeometry) {
                this.map.drawWKT (ui.item.data.geometryWkt,SpatialMap.Function.bind(this.featureDrawed,this),{styles: this.style});
            }
            
            
            jQuery('#'+id+'_wkt').val (ui.item.data.geometryWkt);
        } else {
            if (this.map && disablemapValue != 'true') {
                this.map.zoomToExtent({x1:ui.item.data.x-1,y1:ui.item.data.y-1,x2:ui.item.data.x+1,y2:ui.item.data.y+1});
                
                if (options.minzoom) {
                    var mapstate = this.map.getMapState();
                    if (options.minzoom < mapstate.zoomLevel) {
                        this.map.zoomTo(options.minzoom);
                    }
                }
                if (options.minscale) {
                    var mapstate = this.map.getMapState();
                    if (options.minscale > mapstate.scale) {
                        this.map.zoomToScale(options.minscale);
                    }
                }
            }
            this.validAddress = true;
            jQuery('#'+id+'_wkt').val (ui.item.data.geometryWkt);
            if (this.map && options.usegeometry) {
                this.map.drawWKT (ui.item.data.geometryWkt,SpatialMap.Function.bind(this.featureDrawed,this),{styles: this.style});
            }
            if (jQuery('#'+id+'_wkt').attr('value') != '') {
                if (cdfs) {
                    cdfs();                    
                }
            }
        }
    },
    
    getTicket: function (callback, sync) {
        if (this.ticket) {
            if (sync === true) {
                return this.ticket;
            } else {
                callback();
            }
        } else {
            var params = {
                page: 'formular.get.ticket',
                sessionid: this.sessionid
            };
    
            var req = jQuery.ajax( {
                url : 'cbkort',
                dataType : 'json',
                type: 'POST',
                async: !sync,
                data : params,
                success : SpatialMap.Function.bind( function(callback, data, status) {
                    this.ticket = data.row[0].expressionresult;
                    callback();
                },this,callback)
            });

            if (sync === true) {
                return this.ticket;
            }

        }
    },
    
    setMap: function (options) {
    },
    
    resetButtons: function () {
        for (var type in this.mapbuttons) {
            this.mapbuttons[type].element.removeClass ('button_'+type+'_active');
        }
    },
    
    disableButton: function (types,disable) {
        if (!jQuery.isArray(types)) {
            types = [types];
        }
        for (var i=0;i<types.length;i++) {
            if (disable === true) {
                this.mapbuttons[types[i]].element.addClass ('button_disabled');
                if (this.mapbuttons[types[i]].element.hasClass('button_'+types[i]+'_active')) {
                    this.activateTool(this.defaultMapTool)
                }
            } else {
                this.mapbuttons[types[i]].element.removeClass ('button_disabled');
            }
        }
    },
    
    activateTool: function (type) {
        
        if (this.mapbuttons[type] && this.mapbuttons[type].element && this.mapbuttons[type].element.hasClass ('button_disabled')) {
            return;
        }
        
        this.resetButtons();
        this.map.setClickEvent();
        this.map.panzoom();
        if (this.locateActive) {
            this.map.locateRemove();
            this.locateActive = false;
        }
        if (this.mapbuttons[type] && this.mapbuttons[type].element) {
            this.mapbuttons[type].element.addClass ('button_'+type+'_active');
        }
        switch(type) {
            case 'pan':
                this.map.panzoom();
            break;
            case 'select':
                this.map.panzoom();
                var datasource = this.mapbuttons[type].config.attr('datasource').toString().toLowerCase();
                if (!datasource || datasource == '') {
                    alert('Datasource missing!');
                    this.activateTool(this.currentMapTool);
                    return;
                } else {
                    this.map.setClickEvent(SpatialMap.Function.bind(this.selectFromDatasource,this,datasource));
                }
            break;
            case 'delete':
                this.map.drawDelete(SpatialMap.Function.bind(this.featureDeleted,this));
            break;
            case 'move':
                this.map.drawMove(SpatialMap.Function.bind(this.featureModified,this));
            break;
            case 'modify':
                this.map.drawModify(SpatialMap.Function.bind(this.featureModified,this));
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
            case 'location':
                
                this.locateActive = true;
                this.map.locate({watch: true});
                
            break;
            case 'template1':
            case 'template2':
            case 'template3':
            case 'template4':
            case 'template5':
            case 'template6':
            case 'template7':

                var wkt = 'point(724415 6175960)';
                var options = this.mapbuttons[type].options.split(' ');
                var center = {
                    x: this.currentMapState.extent[0]+(this.currentMapState.extent[2]-this.currentMapState.extent[0])/2,
                    y: this.currentMapState.extent[1]+(this.currentMapState.extent[3]-this.currentMapState.extent[1])/2
                }
                var p = options[1].split(',');
                var start = {
                    x: center.x+(p[0]-0),
                    y: center.y+(p[1]-0)
                }
                
                var geometryType = options[0];
                if (geometryType === 'polygon') {
                    wkt = 'POLYGON(('+start.x+' '+start.y+'';
                    var lastPoint = {
                        x: start.x,
                        y: start.y
                    };
                    for (var i=2;i<options.length;i++) {
                        var p1 = options[i].split(',');
                        lastPoint = {
                            x: lastPoint.x+(p1[0]-0),
                            y: lastPoint.y+(p1[1]-0)
                        }
                        wkt+=','+lastPoint.x+' '+lastPoint.y;
                    }
                    wkt+=','+start.x+' '+start.y+'))';
                } else if (geometryType === 'line') {
                    wkt = 'LINESTRING('+start.x+' '+start.y+'';
                    var lastPoint = {
                        x: start.x,
                        y: start.y
                    };
                    for (var i=2;i<options.length;i++) {
                        var p1 = options[i].split(',');
                        lastPoint = {
                            x: lastPoint.x+(p1[0]-0),
                            y: lastPoint.y+(p1[1]-0)
                        }
                        wkt+=','+lastPoint.x+' '+lastPoint.y;
                    }
                    wkt+=')';
                } else if (geometryType === 'point') {
                    wkt = 'POINT('+start.x+' '+start.y+')';
                }
                
                this.map.drawWKT(wkt,SpatialMap.Function.bind(function (event) {
                    this.featureDrawed(event);
                },this),{styles: this.style});
                
                this.activateTool(this.currentMapTool);
                return;
            break;
        }
        this.currentMapTool = type;
    },

    featureDrawed: function (event) {
        if (this.multipleGeometries === false) {
            if (this.feature.length > 0) {
                var a = [];
                for (var i=0;i<this.feature.length;i++) {
                    a.push(this.feature[i].id);
                    if (typeof this.feature[i].element !== 'undefined') {
                        this.feature[i].element.remove();
                    }
                }
                this.map.deleteFeature (a);
                this.feature = [];
            }
        } else {
            //Delete all others if not the same geometry type
            if (this.feature.length > 0 && event.wkt.CLASS_NAME.match(/Point|LineString|Polygon/)[0] !== this.feature[0].wkt.CLASS_NAME.match(/Point|LineString|Polygon/)[0]) {
                var a = [];
                for (var i=0;i<this.feature.length;i++) {
                    a.push(this.feature[i].id);
                    if (typeof this.feature[i].element !== 'undefined') {
                        this.feature[i].element.remove();
                    }
                }
                this.map.deleteFeature (a);
                this.feature = [];
            }
        }
        
        if (this.multipleGeometriesAttributes.length > 0) {
            this.addFeatureAttributes(event);
        }
        
        this.feature.push(event);
        
        this.featureChanged ();
    },
    
    featureDeleted: function (event) {
        if (event.type === 'DELETE') {
            for (var i=0;i<this.feature.length;i++) {
                if (this.feature[i].id === event.id) {
                    if (typeof this.feature[i].element !== 'undefined') {
                        this.feature[i].element.remove();
                    }
                    this.feature.splice(i,1);
                    break;
                }
            }
            this.featureChanged ();
        }
    },
    
    featureModified: function (event) {
        var feature = null
        for (var i=0;i<this.feature.length;i++) {
            if (this.feature[i].id === event.id) {
                this.feature[i].wkt = event.wkt;
                feature = this.feature[i];
                break;
            }
        }
        if (event.type === 'MODIFY') {
            this.featureChanged ();
        } else if (event.type === 'SELECT') {
            if (feature.element) {
                jQuery('.attributeswrapper').removeClass('active');
                feature.element.addClass('active');
            }
        } else if (event.type === 'UNSELECT') {
            if (feature.element) {
                jQuery('.attributeswrapper').removeClass('active');
            }
        }
    },
    
    featureChanged: function (feature) {
        
        if (this.areaid != null) {
            var area = 0;
            for (var i=0;i<this.feature.length;i++) {
                area += parseInt(this.feature[i].wkt.getArea());
            }
            jQuery('#areaspan_'+this.areaid).html(area);
            jQuery('#'+this.areaid).val(area);
            jQuery('#'+this.areaid).change();
        }
        
        this.setMergedGeometry (this.feature, SpatialMap.Function.bind(function () {

            if (this.localstore) {
                this.writeLocalStore();
            }
            
            this.query (this.feature);
        },this));
        
        this.validateMap();
        
        this.inputChanged();
        
    },
    
    setMergedGeometry: function (features,callback) {
        if (features.length === 0) {
            this.mergedFeature = null;
            callback();
        } else if (features.length === 1) {
            this.mergedFeature = features[0].wkt.toString();
            callback();
        } else {
            this.mergedFeature = features[0].wkt.toString();
            
            var a = [];
            for (var i=1;i<features.length;i++) {
                a.push(features[i].wkt.toString());
            }
            
            this.merge(a,SpatialMap.Function.bind(function (callback,wkt) {
                callback();
            },this,callback));

        }
    },
    
    merge: function (wktarray,callback) {
        var params = {
            page: 'formular.geometry.union',
            sessionid: this.sessionid,
            wkt1: this.mergedFeature,
            wkt2: wktarray.pop()
        };
    
        jQuery.ajax({
            url : 'cbkort',
            dataType : 'json',
            type: 'POST',
            async: true,
            data : params,
            success : SpatialMap.Function.bind(function (wktarray,callback,data) {
                this.mergedFeature = data.row[0].expressionresult;
                if (wktarray.length > 0) {
                    this.merge(wktarray, callback);
                } else {
                    callback(this.mergedFeature);
                }
            },this,wktarray,callback),
            error : SpatialMap.Function.bind(function (callback) {
                callback();
            },this,callback)
        });
    },
    
    addFeatureAttributes: function (event) {
        if (typeof this.featureCount === 'undefined') {
            this.featureCount = 0;
        }
        this.featureCount++;
        var w = jQuery('<div class="attributeswrapper"></div>');
        var h = jQuery('<div class="attributesheader"><span class="text">Geometri '+this.featureCount+'</span></div>');
        w.append(h);
        event.element = w;
        
        var d = jQuery('<span class="icon icon-times"></span>');
        d.click(SpatialMap.Function.bind(function (feature) {
            feature.element.remove();
            this.map.deleteFeature(feature.id);
            feature.type = 'DELETE';
            this.featureDeleted(feature);
            return false;
        },this,event));
        h.append(d);
        
        h.click(SpatialMap.Function.bind(function (feature) {
            jQuery('.attributeswrapper').removeClass('active');
            feature.element.addClass('active');
            this.map.deselectFeatures();
            this.map.selectFeature(feature.id)
        },this,event))
        
        var t = jQuery('<table class="tablecontent"><tbody></tbody></table>');
        w.append(t);
        jQuery('div.features_attributes').append(w);

        var params = {};
        for (var i=0;i<this.multipleGeometriesAttributes.length;i++) {
            var pp = this.addInput(this.multipleGeometriesAttributes[i].config,t,{
                counter: this.multipleGeometriesAttributes[i].counter*100000+(this.feature.length*100)+i,
                tab: {
                    id: 999
                }
            });
            if (typeof pp.urlparam !== 'undefined') {
                params[pp.urlparam] = pp;
            }
        }
        event.params = params;
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
                if (this.map && wkt) {
                    this.map.drawWKT(wkt,SpatialMap.Function.bind(function (event) {
                        
                        var add = true;
                        //If two features are identical then the two features are removed
                        for (var i=0;i<this.feature.length;i++) {
                            if (this.feature[i].wkt.toString() === event.wkt.toString()) {
                                this.map.deleteFeature (this.feature[i].id);
                                this.feature.splice(i,1);
                                add = false;
                                break;
                            }
                        }
                        if (add) {
                            this.featureDrawed(event);
                        } else {
                            //The feature is deleted
                            this.featureChanged ();
                            setTimeout(SpatialMap.Function.bind(function (e) {this.map.deleteFeature (e.id);},this,event),200);
                        }
                        
                    },this),{styles: this.style});
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
            dropdown.append('<option value="'+list[j].value+'"'+checked+' '+(list[j].disabled === true ? 'disabled="disabled' : '')+'>'+list[j].name+'</option>');
        }
    },
    
    query: function (features) {
        var params = {
            page: 'formular-query',
            sessionid: this.sessionid
        }
        
        for (var i=0;i<this.spatialqueries.length;i++) {
            
            if (this.bootstrap === true) {
                jQuery('#'+this.spatialqueries[i].id+'_row').empty().hide().removeClass('hidden');
                if (this.spatialqueries[i].displayname) {
                    jQuery('#'+this.spatialqueries[i].id+'_row').append(this.spatialqueries[i].displayname);
                }
            } else {
                jQuery('#'+this.spatialqueries[i].id).html('');
                jQuery('#container_'+this.spatialqueries[i].id).hide();
            }
            
            if (features.length > 0) {
                
                params.wkt = this.mergedFeature;
            
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
                    success : SpatialMap.Function.bind( function(spatialquery, data, status) {
                        var id = spatialquery.id;
                        var targets = jQuery(data).find('pcomposite[name="presentation"]');
                        var displayname = [];
                        var html = '';
                        var reporttext = '';
                        var count = 0;
                        for (var i=0;i<targets.length;i++) {
                            var rowlist = jQuery(targets[i]).find('rowlist');
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
                            if (this.bootstrap === true) {
                                jQuery('#'+id+'_row').show().append(html);
                            } else {
                                jQuery('#container_conflictdiv_'+id).show();
                                jQuery('#conflictdiv_'+id).html(html);
                            }
                        } else {
                            if (this.bootstrap === true) {
                                jQuery('#'+id+'_row').hide();
                            } else {
                                jQuery('#container_conflictdiv_'+id).hide();
                            }
                        }
                        if (count) {
                            spatialquery.postparam.visible = true;
                            jQuery('#'+id).val(reporttext);
                            if (this.bootstrap === true) {
                                jQuery('#'+id+'_row').show('fast');
                            } else {
                                jQuery('#container_conflictdiv_'+id).show('fast');
                            }
                            if (spatialquery.onconflict) {
                                spatialquery.onconflict.apply(jQuery('#'+id));
                            }
                        } else {
                            spatialquery.postparam.visible = false;
                            if (spatialquery.onnoconflict) {
                                spatialquery.onnoconflict();
                            }
                        }
                    },this,this.spatialqueries[i])
                });
            } else {
                this.spatialqueries[i].postparam.visible = false;
                if (this.bootstrap === true) {
                    jQuery('#'+this.spatialqueries[i].id+'_row').hide();
                } else {
                    jQuery('#container_conflictdiv_'+this.spatialqueries[i].id).hide();
                }
                if (this.spatialqueries[i].onnoconflict) {
                    this.spatialqueries[i].onnoconflict();
                }
            }
        }
    },
    
    getCurrentValues: function () {
        var params = {};
        
        if (this.map && this.feature.length > 0) {
            params.wkt = this.mergedFeature;
        }
        for (var name in this.postparams) {
            var val = jQuery('#'+this.postparams[name].id).val();
            var textVal = val;
            if (this.postparams[name].type && this.postparams[name].type == 'checkbox') {
                val = jQuery('#'+this.postparams[name].id).is(':checked');
                textVal = (val ? 'ja' : 'nej');
            }
            if (this.postparams[name].type && this.postparams[name].type == 'radiobutton') {
                val = jQuery('input:radio[name='+this.postparams[name].id+']:checked').val();
                if (typeof val === 'undefined') {
                    if (this.postparams[name].defaultValue) {
                        val = this.postparams[name].defaultValue;
                    } else {
                        val = '';
                    }
                }
                textVal = val;
            }
            if (this.postparams[name].type && this.postparams[name].type == 'file') {
                textVal = jQuery('#'+this.postparams[name].id+'_org').val();
            }
            params[name] = val;
        }
        
        return params;
    },
    
    setCurrentValues: function (params) {
        
        if (this.map && params.wkt) {
            this.map.drawWKT (params.wkt,SpatialMap.Function.bind(this.featureDrawed,this),{styles: this.style});
        }
        
        for (var name in this.postparams) {
            if (typeof params[name] !== 'undefined') {
                var input = jQuery('#' + this.postparams[name].id);
                var val = params[name];

                if (this.postparams[name].type && this.postparams[name].type == 'checkbox') {
                    if (val === 'true') {
                        val = true;
                    } else if (val === 'false') {
                        val = false;
                    }
                    jQuery('#' + this.postparams[name].id).prop('checked', val);
                } else if (this.postparams[name].type && this.postparams[name].type == 'radiobutton') {
                    jQuery('input:radio[name=' + this.postparams[name].id + '][value=' + val + ']').prop('checked', true);
                } else if (this.postparams[name].type && this.postparams[name].type == 'file') {
                    //Not available
                } else {
                    jQuery('#' + this.postparams[name].id).val(val);
                }
            }
        }
        
    },
    
    setCurrentMap: function (mapState) {
        this.map.zoomTo(mapState.zoomLevel);
        var x = mapState.extent[0]+(mapState.extent[2]-mapState.extent[0])/2;
        var y = mapState.extent[1]+(mapState.extent[3]-mapState.extent[1])/2;
        this.map.panTo('POINT('+x+' '+y+')');
    },
    
    validateMap: function () {
        var name = this.mapId;
        if (typeof this.inputValidation[name] !== 'undefined' && this.inputValidation[name].validate === true && this.inputValidation[name].tab.visible === true) {
            if (typeof this.inputValidation[name].handler !== 'undefined') {
                this.inputValidation[name].handler();
            }
        }
    },
    
    writeLocalStore: function () {
        if (store.enabled) {
            var params = this.getCurrentValues();
            var o = {
                params: params,
                map: this.currentMapState
            }
            store.set(this.name,o);
        }
    },
    
    readLocalStore: function () {
        if (store.enabled) {
            var o = store.get(this.name);
            if (o) {
                if (o.params) {
                    this.setCurrentValues(o.params);
                }
                if (o.map) {
                    this.setCurrentMap(o.map);
                }
            }
        }
    },

    clearLocalStore: function () {
        if (store.enabled) {
            store.clear();
        }
    },
    
    checkValidation: function () {
        this.valid = true;
        for (var name in this.validatedElements) {
            if (this.inputValidation[name].validate === true && this.inputValidation[name].tab.visible === true && this.inputValidation[name].visible !== false) {
                var valid = true;
                if (typeof this.inputValidation[name].handler !== 'undefined') {
                    valid = this.inputValidation[name].handler();
                } else {
                    valid = jQuery('#'+name).isValid ();
                }
                
                this.inputValidation[name].valid = valid;
                if (!valid) {
                    this.valid = false
                    break;
                }
            }
        }
        if (this.valid === false) {
            jQuery('button#submit').prop('disabled', 'disabled');
        } else {
            jQuery('button#submit').prop("disabled", false);
        }
        return this.valid;
    },
    
    validateAllTabs: function (tabs, simple) {
        var count = 0;
        for (var i=0;i<this.tabs.length;i++) {
            if (typeof tabs === 'undefined' || tabs === null || jQuery.inArray(this.tabs[i].id,tabs) > -1) {
                if (this.tabs[i].visible === true) {
                    count += this.validateTab(this.tabs[i].id,simple);
                }
            }
        }
    },
    
    validateTab: function (tab,simple) {

        this.checkConditions();

        if (typeof tab === 'undefined') {
            tab = 0;
        }
        var invalidCount = 0;
        for (var name in this.inputValidation) {
            if (this.inputValidation[name].validate === true && this.inputValidation[name].tab.id === tab && this.inputValidation[name].tab.visible === true && this.inputValidation[name].visible !== false) {
                var valid = true;
                if (typeof this.inputValidation[name].handler !== 'undefined') {
                    valid = this.inputValidation[name].handler();
                } else {
                    valid = jQuery('#'+name).isValid ();
                }
                
                this.validatedElements[name] = valid;
                this.inputValidation[name].valid = valid;
                if (!valid) {
                    invalidCount++;
                }
            }
        }
        
        if (invalidCount > 0) {
            jQuery('.navlist > li#tab'+tab+' a > span').remove();
            jQuery('.navlist > li#tab'+tab+' a').append('<span class="error">Du mangler at udfylde data</span>');
        } else {
            jQuery('.navlist > li#tab'+tab+' a > span').remove();
            jQuery('.navlist > li#tab'+tab+' a').append('<span class="info">Udfyldt</span>');
        }
        
        this.checkValidation();
        this.checkConditions();

        return invalidCount;
    },
    
    resetTabValidation: function (tabs) {
        if (typeof tabs === 'undefined') {
            jQuery('.navlist > li > a > span').remove();
        } else {
            if (!jQuery.isArray(tabs)) {
                tabs = [tabs];
            }
            for (var i=0;i<tabs.length;i++) {
                jQuery('.navlist > li#tab'+tabs[i]+' a > span').remove();
            }
        }
    },

    submit: function () {
        if (this.map && this.feature.length === 0 && this.featureRequired === true) {
            alert('Tegn på kortet og udfyld alle felter inden der trykkes på "Send"');
        } else {
            var params = {
                sessionid: this.sessionid,
                formular: this.name,
                layers: this.reportlayers,
                profile: this.reportprofile,
                formularxsl: this.reportxsl
            };
            if (this.map && this.feature.length > 0) {
                params.wkt = this.mergedFeature;
            }
            if (this.reportmapscale !== null) {
                params.map_web = 'minscale+'+this.reportmapscale+'+maxscale+'+this.reportmapscale;
            }
            var invalidCount = 0;
            for (var name in this.inputValidation) {
                if (this.inputValidation[name].validate && this.inputValidation[name].tab.visible === true && this.inputValidation[name].visible !== false) {
                    var valid = true;
                    if (typeof this.inputValidation[name].handler !== 'undefined') {
                        valid = this.inputValidation[name].handler();
                    } else {
                        valid = jQuery('#'+name).isValid ();
                    }
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
            
            var result = this.getParams(this.postparams, params);
            var confirmtext = result.confirmtext;
            params = result.params;
            
            jQuery('div#content').hide();
            jQuery('#message').show();
            jQuery('#messagetext').empty();
            jQuery('#messagebuttons').empty();
            
            if (this.confirm) {
                jQuery('#messagetext').append('<div id="message_done">'+this.confirm+confirmtext+'</div>');
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
    
    setPreview: function (element) {
        
        element.empty();
        
        for (var i=0;i<this.tabs.length;i++) {
            
            if (this.tabs[i].type !== 'confirm') {
            
                element.append('<h2>'+this.tabs[i].displayname+'</h2>');
                
                for (var j=0;j<this.tabs[i].postparams.length;j++) {

                    var param = this.tabs[i].postparams[j];

                    var name = param.id;

                    if (param.visible === true && param.tab.visible) {

                        var e = this.getPreviewElement(param);
                        if (e !== null) {

                            if (typeof param.rowID !== 'undefined') {

                                var rowElement = element.find('#previewRow_'+param.rowID);
                                if (rowElement.length === 0) {
                                    rowElement = jQuery('<div id="previewRow_' +param.rowID+ '" class="row"></div>');
                                    element.append(rowElement);
                                }
                                var colElemet = rowElement.find('.previewCol_'+param.colID);
                                if (colElemet.length === 0) {
                                    colElemet = jQuery('<div class="previewCol_'+param.colID+'"></div>');
                                    rowElement.append(colElemet);
                                }
                                colElemet.addClass(param.colClassName);
                                colElemet.append(e);

                            } else {
                                element.append(e);
                            }

                        }
                    
                    }
                }
            }
        }
    },


    getPreviewElement: function (param) {
        var e = null;

        var val = jQuery('#'+param.id).val();

        var valid = true;
        var req = false;
        if (typeof this.inputValidation[param.id] !== 'undefined') {
            valid = this.inputValidation[param.id].valid;
            req = this.inputValidation[param.id].required;
        }

        var forceShow = false;
        if (param.type === 'h1' || param.type === 'h2') {
            forceShow = true;
        }

        if (this.showEmptyInPreview === true || forceShow === true || (val !== '' || req === true || valid === false)) {
            var textVal = val;
            if (param.type && param.type == 'checkbox') {
                val = jQuery('#'+param.id).is(':checked');
                textVal = (val ? 'ja' : 'nej');
            }
            if (param.type && param.type == 'radiobutton') {
                val = jQuery('input:radio[name='+param.id+']:checked').val();
                if (typeof val === 'undefined') {
                    if (param.defaultValue) {
                        val = param.defaultValue;
                    } else {
                        val = '';
                    }
                }
                textVal = val;
            }
            if (param.type && param.type == 'file') {
                textVal = jQuery('#'+param.id+'_org').val();
            }

            var t = param.displayname;
            if (typeof t !== 'undefined') {
                if (this.bootstrap === true) {
                    var click = true;

                    if (param.type === 'h1' || param.type === 'h2') {
                        e = jQuery('<'+param.type+'>'+param.displayname+'</'+param.type+'>');
                        click = false;
                    } else if (param.type === 'conflicts') {
                        e = jQuery('<div class="form-group'+(valid ? '' : ' error')+'"><span class="label">'+t+'</span>'+(valid ? '' : '<span class="validationMessage">'+this.inputValidation[param.id].message+'</span>')+'</div>');
                    } else {
                        e = jQuery('<div class="form-group'+(valid ? '' : ' error')+'"><span class="label">'+t+(req ? ' <span class="required">*</span>':'')+'</span><span class="form-control-static">'+(val ? textVal : '&nbsp;')+'</span>'+(valid ? '' : '<span class="validationMessage">'+this.inputValidation[param.id].message+'</span>')+'</div>');
                    }
                    if (!valid && click == true) {
                        e.click(SpatialMap.Function.bind(function (input) {
                            this.showTab(input.tab.id);
                            var element = document.getElementById(input.id);
                            if (element) {
                                element.focus();
                            }
                        },this,param));
                    }
                } else {
                    if (val) {
                        e = jQuery('<br/>'+t+' '+textVal);
                    }
                }
            }
        }

        return e;
    },
    
    getParams: function (postparams, params) {
        var confirmtext = '';
        if (typeof params === 'undefined') {
            params = {};
        }
        for (var name in postparams) {
            var val = jQuery('#'+postparams[name].id).val();
            var textVal = val;
            if (postparams[name].type && postparams[name].type == 'checkbox') {
                val = jQuery('#'+postparams[name].id).is(':checked');
                textVal = (val ? 'ja' : 'nej');
            }
            if (postparams[name].type && postparams[name].type == 'radiobutton') {
                val = jQuery('input:radio[name='+postparams[name].id+']:checked').val();
                if (typeof val === 'undefined') {
                    if (postparams[name].defaultValue) {
                        val = postparams[name].defaultValue;
                    } else {
                        val = '';
                    }
                }
                textVal = val;
            }
            if (postparams[name].type && postparams[name].type == 'file') {
                textVal = jQuery('#'+postparams[name].id+'_org').val();
            }
            params[name] = this.encodeParam(name,val);
            if (this.parseDisplaynames) {
                params[name+'_displayname'] = this.encodeParam(name+'_displayname',postparams[name].displayname);
            }
            
            var t = postparams[name].displayname;
            if (typeof t !== 'undefined' && val) {
                confirmtext+='<br/>'+t+' '+textVal;
            }
        }
        
        return {params: params, confirmtext: confirmtext};
    },
        
    submitFinal: function (params) {
        
        if (this.bootstrap === true) {
            var message = '<div class="header">Ansøgningen registreres. Vent venligst...</div>Det kan tage op til et par minutter';
            if (typeof this.messages.saving !== 'undefined') {
                message = this.messages.saving;
            }
            jQuery('#messageloading').html(message);
            jQuery('div#form').hide();
            jQuery('div#receipt').show();
        } else {
            var message = 'Ansøgningen registreres. Vent venligst...<br/>(Det kan tage op til et par minutter)';
            if (typeof this.messages.saving !== 'undefined') {
                message = this.messages.saving;
            }
            jQuery('#messageloading').append('<div id="message_loading">'+message+'</div>');

            jQuery('#messagetext').empty();
            jQuery('#messagebuttons').empty();
            for (var i=0;i<this.submitbuttons.length;i++) {
                jQuery('#messagebuttons').append(this.submitbuttons[i]);
            }
        }
        
        if (this.pages.length > 0) {
            
            var pages = this.pages.slice(0);
            this.execute(params,pages);
            
        } else {
            //The old way
            params.page = this.submitpage;
            
            jQuery.ajax( {
                url : 'cbkort',
                dataType : 'xml',
                type: 'POST',
                async: true,
                data : params,
                success : SpatialMap.Function.bind( function(params, data, status) {
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
                                success: SpatialMap.Function.bind( function (pdf,data) {
                                    if(data.result!='OK') {
                                        if (this.messages.done) {
                                            if (this.bootstrap) {
                                                var html = '<div class="alert alert-success">'+this.messages.done+'</div>'+
                                                           '<h1>Kvittering</h1>'+
                                                           '<p><a class="btn btn-primary hidden-print" href="'+pdf.text()+'">Udskriv kvittering</a></p>';
                                                jQuery('div#finalmessage').html(html);
                                            } else {
                                                jQuery('#messagetext').append('<div id="message_done"><span class="icon-checkmark"></span>'+this.messages.done.replace('{{pdf}}',pdf.text())+'</div>');
                                            }
                                        } else {
                                            if (this.bootstrap) {
                                                var html = '<div class="alert alert-success"><div class="header">Ansøgningen er nu registreret</div></div>'+
                                                           '<h1>Kvittering</h1>'+
                                                           '<p><a class="btn btn-primary hidden-print" href="'+pdf.text()+'">Udskriv kvittering</a></p>';
                                                jQuery('div#finalmessage').html(html);
                                            } else {
                                                jQuery('#messagetext').append('<div id="message_done"><span class="icon-checkmark"></span>Ansøgningen er nu registreret.<br/>Hent en kvittering på ansøgningen <a href="'+pdf.text()+'" target="_blank">her</a> (Åbnes i et nyt vindue!)</div>');
                                            }
                                        }
                                    }
                                    this.removeSession();
                                },this,pdf)
                            });
                            jQuery('#message').show();
                            jQuery('#messageloading').hide();
                            jQuery('#messagebuttons').show();
                            if (this.messages.done) {
                                if (this.bootstrap) {
                                    var html = '<div class="alert alert-success">'+this.messages.done+'</div></div>'+
                                               '<h1>Kvittering</h1>'+
                                               '<p><a class="btn btn-primary hidden-print" href="'+pdf.text()+'">Udskriv kvittering</a></p>';
                                    jQuery('div#finalmessage').html(html);
                                } else {
                                    jQuery('#messagetext').append('<div id="message_done"><span class="icon-checkmark"></span>'+this.messages.done.replace('{{pdf}}',pdf.text())+'</div>');
                                }
                            } else {
                                if (this.bootstrap) {
                                    var html = '<div class="alert alert-success"><div class="header">Ansøgningen er nu registreret</div></div>'+
                                               '<h1>Kvittering</h1>'+
                                               '<p><a class="btn btn-primary hidden-print" href="'+pdf.text()+'">Udskriv kvittering</a></p>';
                                    jQuery('div#finalmessage').html(html)
                                } else {
                                    jQuery('#messagetext').append('<div id="message_done"><span class="icon-checkmark"></span>Ansøgningen er nu registreret.<br/>Hent en kvittering på ansøgningen <a href="'+pdf.text()+'" target="_blank">her</a> (Åbnes i et nyt vindue!)</div>');
                                }
                            }
                        } else {
                            var m = jQuery(data).find('message').text();
                            if (!m) {
                                m = 'No PDF respose from server';
                            }
                            this.log({
                                type: 'error',
                                name: 'submitFinal',
                                message: m,
                                obj: JSON.stringify(params)
                            });
                            
                            if (this.bootstrap === true) {
                                var html = '<div class="alert alert-danger"><div class="header">Der opstod en fejl i forbindelse med registreringen</div>Kontakt venligst kommunen for yderligere oplysninger.</div>'+
                                jQuery('div#finalmessage').html(html);
                            } else {
                                jQuery('#message').show();
                                jQuery('#messageloading').hide();
                                jQuery('#messagetext').append('<div id="message_done" class="message-error"><span class="icon-warning">Der opstod en fejl i forbindelse med registreringen af ansøgningen. Kontakt venligst kommunen for yderligere oplysninger.</div>');
                            }
                            
                        }
                    } else {
                        if (this.bootstrap === true) {
                            var html = '<div class="alert alert-success"><div class="header">Din ansøgning er nu registreret</div> Tak for din henvendelse.</div>'+
                            jQuery('div#finalmessage').html(html);
                        } else {
                            jQuery('#message').show();
                            jQuery('#messageloading').hide();
                            jQuery('#messagebuttons').show();
                            jQuery('#messagetext').append('<div id="message_done"><span class="icon-checkmark"></span>Din ansøgning er nu registreret. Tak for din henvendelse.</div>');
                        }
                        this.removeSession();
                    }
                },this, params),
                error : SpatialMap.Function.bind( function(params, data, status) {
                    this.log({
                        type: 'error',
                        name: 'submitFinal',
                        message: 'No respose from server',
                        obj: JSON.stringify(params)
                    });
                    if (this.bootstrap === true) {
                        var html = '<div class="alert alert-danger"><div class="header">Der opstod en fejl i forbindelse med registreringen af ansøgningen</div>Prøv igen eller kontakt kommunen.</div></div>'+
                        jQuery('div#finalmessage').html(html);
                    } else {
                        jQuery('#messageloading').hide();
                        jQuery('#message').show().html('<div id="message_done" class="message-error"><span class="icon-warning">Der opstod en fejl i forbindelse med registreringen af ansøgningen. Prøv igen eller kontakt kommunen.</div>');
                    }
                },this, params)
            });
            
        }
    },
    
    execute: function (params, pages) {

        this.currentParams = params;
        
        if (!(pages[0].condition instanceof Function)) {
            pages[0].condition = new Function ('return '+pages[0].condition);
        }
        if (pages[0].condition() === false) {
            pages.shift();
            
            if (pages.length > 0) {
                this.execute(params, pages);
            } else {
                this.pagesDone(params);
            }
        } else {
            
            params.page = pages[0].name;
            params.outputformat = pages[0].type;
            doAsync = this.errorHandling; //the errorpage handling must be synchronized - otherwise the pageDone method is called and therefor the session i invalidated before all errorpages are completed
            jQuery.ajax( {
                url : pages[0].url,
                dataType : pages[0].type,
                type: 'POST',
                async: doAsync, 
                data : params,
                success : SpatialMap.Function.bind( function(params, pages, data, status) {
                    if (pages[0].parser) {
                        params = this[pages[0].parser](data, params, pages[0].urlparam);
                    }
                    params = this.handleError(data, params, pages[0].error);
                    
                    if (this.isErrorRespose(data) && this.errorHandling) {
                        if (pages[0].error) {
							this.errorMessages.push(pages[0].error);
                            if (pages[0].error.type === 'info') {
                                this.showErrorInfo(pages[0].error);
                            } else if (pages[0].error.type === 'warning') {
                                this.showErrorWarning(pages[0].error);
                            } else if (pages[0].error.type === 'error') {
                                this.showError(pages[0].error);
								this.PageErrorHandling(params);
                                this.pagesFail();
                                return;
                            } else {
								this.errorMessages.push('Der opstod en fejl');
                                this.showError();
								this.PageErrorHandling(params);
                                this.pagesFail();
                                return;
                            }
                        } else {
							this.errorMessages.push('Der opstod en fejl');
                            this.showError();
							this.PageErrorHandling(params);
                            this.pagesFail();
                            return;
                        }
                    }
                    
                    //Remove from list
                    pages.shift();
                    
                    if (pages.length > 0) {
                        this.execute(params, pages);
                    } else {
						if (this.errorHandling){
							this.pagesDone(params);
						}
                    }
                },this, params, pages),
                error : SpatialMap.Function.bind( function(params, pages, data, status) {
                    if (pages[0].parser) {
                        params = this[pages[0].parser](data, params, pages[0].urlparam);
                    }
                    
                    if (pages[0].error && this.errorHandling) {
                        var go = false;
						this.errorMessages.push(pages[0].error);
                        if (pages[0].error.type === 'info') {
                            this.showErrorInfo(pages[0].error);
                        } else if (pages[0].error.type === 'warning') {
                            this.showErrorWarning(pages[0].error);
                        } else if (pages[0].error.type === 'error') {
                            this.showError(pages[0].error);
							this.PageErrorHandling(params);
                            this.pagesFail();
                            return;
                        } else {
							this.errorMessages.push('Der opstod en fejl');
                            this.showError();
							this.PageErrorHandling(params);
                            this.pagesFail();
                            return;
                        }
                        
                        //Remove from list
                        pages.shift();
                        
                        if (pages.length > 0) {
                            this.execute(params, pages);
                        } else {
							if (this.errorHandling){
								this.pagesDone(params);
							}
                        }
                        
                    } else {
						if (this.errorHandling) {
							this.errorMessages.push('Der opstod en fejl');
							this.showError();
							this.PageErrorHandling(params);
							this.pagesFail();
						}
                    }
                },this, params, pages)
            });
        }
    },
    
    pagesDone: function (params) {
        
        var frCounter = -1;
		if (this.multipleGeometriesAttributes.length > 0 && this.feature.length > 0) {
            params.page = 'formular.geometry.save';
            if (typeof this.multipleGeometriesAttributesOptions.page !== 'undefined') {
                params.page = this.multipleGeometriesAttributesOptions.page;
            }
            if (typeof this.multipleGeometriesAttributesOptions.datasource !== 'undefined') {
                params.datasource = this.multipleGeometriesAttributesOptions.datasource;
            }
            if (typeof this.multipleGeometriesAttributesOptions.command !== 'undefined') {
                params.command = this.multipleGeometriesAttributesOptions.command;
            } else {
                params.command = 'write';
            }
            
            var featureResponse = {
                count: this.feature.length,
                fail: false
            };
            
            for (var i=0;i<this.feature.length;i++) {
                var p = this.getParams(this.feature[i].params, params);
                
                jQuery.ajax( {
                    url : 'cbkort',
                    dataType : 'json',
                    type: 'POST',
                    async: true,
                    data : p.params,
                    success : SpatialMap.Function.bind( function(featureResponse, data, status) {
                        featureResponse.count--;
                        if (featureResponse.fail === false) {
                            if (this.isErrorRespose(data)) {
                                featureResponse.fail = true;
                                this.showError();
                                this.pagesFail();
                            } else {
                                frCounter = featureResponse.count;
                            }
                        }
                    },this,featureResponse),
                    error : SpatialMap.Function.bind( function(featureResponse, data, status) {
                        featureResponse.count--;
                        if (featureResponse.fail !== false) {
                            featureResponse.fail = true;
                            this.showError();
                            this.pagesFail();
                        }
                    },this,featureResponse)
                });                
            }
        } else {
			frCounter = 0;
            //this.showDone();
        }
		this.PageErrorHandling(params);
		if (frCounter == 0) {
			this.showDone();
		}
    },
	
	PageErrorHandling: function(params) {
		if (this.errorMessages.length > 0 && this.errorPages.length > 0)
		{
			this.errorHandling = false;
			var errpages = this.errorPages.slice(0);
			var tmp = '';
			for (var i=0; i<this.errorMessages.length; i++){
				var obj = this.errorMessages[i].message;
				tmp += obj + ', ';
			}
			if (tmp.length > 0)  {
				tmp = tmp.substring(0,tmp.length-2);
			}
			params.errorpagemessage = tmp;
            this.execute(params,errpages);
		}
	
	},

    pagesFail: function () {
        jQuery('#messageloading').hide();
    },
    
    showDone: function () {
        jQuery('#messageloading').hide();
        if (this.showReport) {
            this.removeSession();
            jQuery('#message').show();
            jQuery('#messagebuttons').show();
            if (this.pdf) {
                if (this.messages.done) {
                    if (this.bootstrap === true) {
                        jQuery('#message').append('<div class="alert alert-success">'+this.messages.done+'</div>');
                        jQuery('#submessage').append('<h1>Kvittering</h1><p><a class="btn btn-primary hidden-print" href="/tmp/'+this.pdf+'">Udskriv kvittering</a></p>');
                    } else {
                        jQuery('#messagetext').append('<div id="message_done"><span class="icon-checkmark"></span>'+this.messages.done.replace('{{pdf}}','/tmp/'+this.pdf)+'</div>');
                    }
                } else {
                    if (this.bootstrap === true) {
                        jQuery('#message').append('<div class="alert alert-success"><div class="header">Ansøgningen er nu registreret</div></div>');
                        jQuery('#submessage').append('<h1>Kvittering</h1><p><a class="btn btn-primary hidden-print" href="/tmp/'+this.pdf+'">Udskriv kvittering</a></p>');
                    } else {
                        jQuery('#messagetext').append('<div id="message_done"><span class="icon-checkmark"></span>Ansøgningen er nu registreret.<br/>Hent en kvittering på ansøgningen <a href="/tmp/'+this.pdf+'" target="_blank">her</a> (Åbnes i et nyt vindue!)</div>');
                    }
                }
            } else {
                if (this.messages.doneNoPDF) {
                    if (this.bootstrap === true) {
                        jQuery('#message').append('<div class="alert alert-success">'+this.messages.doneNoPDF+'</div>');
                    } else {
                        jQuery('#messagetext').append('<div id="message_done"><span class="icon-checkmark"></span>'+this.messages.doneNoPDF+'</div>');
                    }
                } else if (this.messages.done) {
                    if (this.bootstrap === true) {
                        jQuery('#message').append('<div class="alert alert-success">'+this.messages.done+'</div>');
                    } else {
                        jQuery('#messagetext').append('<div id="message_done"><span class="icon-checkmark"></span>'+this.messages.done+'</div>');
                    }
                } else {
                    if (this.bootstrap === true) {
                        jQuery('#message').append('<div class="alert alert-success"><div class="header">Ansøgningen er nu registreret</div></div>');
                    } else {
                        jQuery('#messagetext').append('<div id="message_done"><span class="icon-checkmark"></span>Ansøgningen er nu registreret</div>');
                    }
                }
            }
        } else {
            jQuery('#message').show();
            jQuery('#messagebuttons').show();
            if (this.messages.done) {
                if (this.bootstrap === true) {
                    jQuery('#message').append('<div class="alert alert-success">'+this.messages.done+'</div>');
                    jQuery('#submessage').append('<h1>Kvittering</h1><p><a class="btn btn-primary hidden-print" href="/tmp/'+this.pdf+'">Udskriv kvittering</a></p>');
                } else {
                    jQuery('#messagetext').append('<div id="message_done"><span class="icon-checkmark"></span>'+this.messages.done.replace('{{pdf}}','/tmp/'+this.pdf)+'</div>');
                }
            } else {
                if (this.bootstrap === true) {
                    jQuery('#message').append('<div class="alert alert-success"><div class="header">Din ansøgning er nu registreret</div>Tak for din henvendelse.</div></div>');
                } else {
                    jQuery('#messagetext').append('<div id="message_done"><span class="icon-checkmark"></span>Din ansøgning er nu registreret. Tak for din henvendelse.</div>');
                }
            }
            this.removeSession();
        }
        
        this.fireEvent('formular-complete');
        
    },
    
    showErrorInfo: function (error) {
        jQuery('#message').show();
        
        if (error && error.message) {
            if (this.bootstrap === true) {
                jQuery('#message').append('<div class="alert alert-info">'+error.message+'</div>');
            } else {
                jQuery('#messagetext').append('<div id="message_done" class="message-info"><span class="icon-info2"></span>'+error.message+'</div>');
            }
        }
        
    },

    showErrorWarning: function (error) {
        jQuery('#message').show();
        
        if (error && error.message) {
            if (this.bootstrap === true) {
                jQuery('#message').append('<div class="alert alert-warning">'+error.message+'</div>');
            } else {
                jQuery('#messagetext').append('<div id="message_done" class="message-warning"><span class="icon-info2"></span>'+error.message+'</div>');
            }
        }
        
    },

    showError: function (error) {
        jQuery('#message').show();
        
        if (error && error.message) {
            if (this.bootstrap === true) {
                jQuery('#message').append('<div class="alert alert-danger">'+error.message+'</div>');
            } else {
                jQuery('#messagetext').append('<div id="message_done" class="message-error"><span class="icon-warning"></span>'+error.message+'</div>');
            }
        } 
		if (this.messages.error) {
			if (this.bootstrap === true) {
				jQuery('#message').append('<div class="alert alert-danger">'+this.messages.error+'</div>');
			} else {
				jQuery('#messagetext').append('<div id="message_done" class="message-error"><span class="icon-warning"></span>'+this.messages.error+'</div>');
			}
		} else {
			if (this.bootstrap === true) {
				jQuery('#message').append('<div class="alert alert-danger"><div class="header">Der opstod en fejl i forbindelse med registreringen af ansøgningen</div>Kontakt venligst kommunen for yderligere oplysninger.</div>');
			} else {
				jQuery('#messagetext').append('<div id="message_done" class="message-error"><span class="icon-warning"></span>Der opstod en fejl i forbindelse med registreringen af ansøgningen. Kontakt venligst kommunen for yderligere oplysninger.</div>');
			}
		}
        
        
    },
    
    isErrorRespose: function (data) {
        return (data.exception || jQuery(data.responseXML).find('exception').length > 0 || data.result === 'ERROR');
    },
    
    handleError: function (data, params, error) {
        if (this.isErrorRespose(data)) {
            
            var message = 'Error from server';
            var type = 'error';

            if (error && error.message) {
                message = error.message;
            } else {
                if (data.responseXML) {
                    if (jQuery(data.responseXML).find('message')) {
                        message = jQuery(data.responseXML).find('message').text()
                    }
                } else {
                    if (data.message) {
                        message = data.message;
                    }
                }
            }
            if (error && error.type) {
                type = error.type;
            }
            this.log({
                type: type,
                name: params.page,
                message: message,
                obj: JSON.stringify(params)
            });
        }
        return params;
    },
    
    removeSession: function () {
        
        if (this.localstore) {
            this.clearLocalStore();
        }
        
        var params = {
            sessionid: this.sessionid,
            page: this.removeSessionPage
        }
        this.sessionid = null;
        jQuery.ajax( {
            url : '/cbkort',
            dataType : 'xml',
            type: 'POST',
            async: true,
            data: params
        });
    },
    
    startFileUpload: function (id) {
        this.currentFileUpload = id;
        var modal = jQuery('#modal');
        if (modal.length === 0) {
            modal = jQuery('<div id="modal" class="formular_modal"><div>Fil uploades. Vent venligst...</div></div>');
            jQuery('body').append(modal);
        }
        modal.show();
    },
    
    endFileUpload: function (id) {
        var modal = jQuery('#modal');
        modal.hide();
    },
    
    deleteFileUpload: function (id) {
        jQuery('#'+id).val('');
        jQuery('#'+id+'_org').val('');
        jQuery('#file_'+id).val('');
        jQuery('#'+id+'_row .filupload-delete').hide();
    },

    fileupload: function (filename,id,orgfilename) {
        this.endFileUpload();
        jQuery('#'+id).val(filename);
        jQuery('#'+id+'_org').val(orgfilename);
        jQuery('#'+id+'_row .filupload-delete').show();
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
            this.inputValidation[b].validate = true;
        } else {
            jQuery('#'+b).valid8({
                'regularExpressions': [
                     { expression: new RegExp('.*')}
                 ]
            });
            this.inputValidation[b].validate = false;
        }
        jQuery('#'+b).isValid();
    },

    countDays: function (date1,date2,resultElement, nrOfAddedDays) {
        var count = null;
        if (date1 && date2) {
            date1 = date1.split('.');
            date1 = new Date(date1[2],date1[1]-1,date1[0]);
            date2 = date2.split('.');
            date2 = new Date(date2[2],date2[1]-1,date2[0]);
            
            count = (date2-date1)/1000/60/60/24;
            if (typeof nrOfAddedDays === 'number') {
                count += nrOfAddedDays;
            }
            if (typeof resultElement !== 'undefined' && resultElement) {
                jQuery('#'+resultElement).val(count);
            }
        } else {
            if (typeof resultElement !== 'undefined' && resultElement) {
                jQuery('#'+resultElement).val('');
            }
        }
        return count;
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
                
                startdate = new Date(start_y, start_m-1, start_d);
                if (date <= startdate) {
                    return [false];
                }
            }
            if(options.end) {
                var enddate = options.end.split('.');
                var end_d = enddate[0]-0;
                var end_m = enddate[1]-0;
                var end_y = enddate[2]-0;
                enddate = new Date(end_y, end_m-1, end_d);
                if (date > enddate) {
                    return [false];
                }
            }
            
            return [true];
        }, this, options) );
        
        
    },

    setFromDatasource: function (options) {
        if (typeof options === 'undefined' || typeof options.datasource === 'undefined') {
            return;
        }
        options.command = (typeof options.command !== 'undefined' ? options.command : 'read');

        var params = {
            page: 'formular.read.datasource',
            sessionid: this.sessionid
        };

        for (var name in options) {
            params[name] = options[name];
        }

        jQuery.ajax( {
            url : 'cbkort',
            dataType : 'json',
            type: 'POST',
            async: true,
            data : params,
            success : SpatialMap.Function.bind( function(data) {

                if (typeof data.row !== 'undefined' && typeof data.row[0] !== 'undefined' && typeof data.row[0].row !== 'undefined') {
                    var rows = data.row[0].row;
                    if (rows.length > 0) {
                        this.setCurrentValues(rows[0]);
                    }
                }

            },this)
        });
    },
    
    getParam: function (name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    },
    
    encodeParam: function (name,val) {
        return encodeURIComponent(val);
    },
    
    log: function (logObj) {
        if (this.logActive === true) {
            
            var params = {
                page: 'formular.log',
                'log.sessionid': this.sessionid,
                'log.formular': this.name
            };
            for (var name in logObj) {
                params['log.'+name] = logObj[name];
            }
            
            jQuery.ajax( {
                url : 'cbkort',
                dataType : 'json',
                type: 'POST',
                async: true,
                data: params
            });

        }
    },
    
    on: function (event, callback) {
        var listener = {event:event,callback:callback};
        this._listeners.push (listener);
        return listener;
    },
    
    off: function (listener) {
        for (var i=0;i<this._listeners.length;i++) {
            if (this._listeners[i] === listener) {
                this._listeners.splice(i,1);
                break;
            }
        }
    },
    
    fireEvent: function (event,parameters) {
        if (typeof this._listeners !== 'undefined') {
            for (var i=0;i<this._listeners.length;i++) {
                if (this._listeners[i].event === event) {
                    if (typeof this._listeners[i].callback !== 'undefined') {
                        this._listeners[i].callback.apply (this,arguments);
                    }
                }
            }
        }
    }

});



Formular.prototype.setFrid = function (data, params, urlparamname) {
    params = this.handleError(data, params);
    if (params != null) {
        if (!urlparamname) {
            urlparamname = 'frid';
        }
        if (data && data.row && data.row[0]) {
            for (var name in data.row[0]) {
                params[urlparamname] = data.row[0][name];
            }
        } else {
            params[urlparamname] = this.sessionid;
        }
    }
    return params;
}

Formular.prototype.setPdf = function (data, params, urlparamname) {
    params = this.handleError(data, params);
    if (params != null) {
        if (!urlparamname) {
            urlparamname = 'frpdf';
        }
        for (var i=0;i<data.row.length;i++) {
            if (data.row[i].url) {
                this.pdf = data.row[i].url.replace(/\/tmp\//,'');
                params[urlparamname] = this.pdf;
            }
        }
    }
    return params;
}


function calculateDistance (a,b) {
    jQuery(".distanceresult").html('0 m');
    jQuery(".distanceresult").find(".systemmessage_alarm").hide();
    var wktA = jQuery('#'+a+'_wkt').val();
    var wktB = jQuery('#'+b+'_wkt').val();

    //Det følgende sikre, at der ikke opstår JS-fejl, 
    if (wktA == null || wktB == null) {
        return;
    }
    
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


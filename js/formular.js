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

    layers: {},

    geosearchOptions: null,

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

    reportprofile: 'septima',
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
        strokeColor: 'rgba(255,0,0,1)',
        fillColor: 'rgba(255,255,255,0.3)',
        label: ''
    },

    validAddress: false,

    conditions: [],

    parseDisplaynames: false,

    multipleGeometries: false,
    multipleGeometriesAttributes: [],
    mergeGeometries: true,

    featureRequired: true,

    localstore: false,
    localstoreClear: true,

    logActive: false,

    bootstrap: false,
    tabs: [],
    currentTab: 0,

    valid: true,
    validatedElements: {},
    mapId: null,

    groupedLayers: [],

    _listeners: [],
    maxUploadFileSize: 100,

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
            url: 'spatialmap',
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
                    jQuery('header.navbar.skin').load(headerurl);
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
                            url: jQuery(pages[i]).attr('url') || 'spatialmap',
                            type: jQuery(pages[i]).attr('type') || 'json',
                            urlparam: jQuery(pages[i]).attr('urlparam'),
                            condition: jQuery(pages[i]).attr('condition'),
                            delay: jQuery(pages[i]).attr('delay')-0 || 0,
                            loadingmessage: jQuery(pages[i]).attr('loadingmessage') || null,
                            error: null
                        };
                        if (jQuery(pages[i]).attr('errortype')) {
                            p.error = p.error || {};
                            p.error.type = jQuery(pages[i]).attr('errortype');
                        }
                        if (jQuery(pages[i]).attr('errormessage')) {
                            p.error = p.error || {};
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
                            url: jQuery(errorPages[i]).attr('url') || 'spatialmap',
                            type: jQuery(errorPages[i]).attr('type') || 'json',
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

                    // Skjul menuen til venstre hvis man bevidst har valgt "tabs" fra
                    if (this.showTabs === false && this.bootstrap === true) {
                        jQuery('#form > .col-sm-3').hide();
                        jQuery('#form > .col-sm-9').removeClass('col-sm-9').addClass('col-sm-12');
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
                                tab.element.click(function (tab) {
                                    var count = this.validateTab(this.currentTab);
                                    this.showTab(tab.id);
                                }.bind(this,tab));
                                jQuery('.navlist').append(tab.element);

                            } else {

                                tab.element = jQuery('<div id="tab'+k+'" class="arrow_box">'+displayname+'</div>');
                                tab.element.click(this.showTab.bind(this,tab.id));
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
                                jQuery('button#previous'+k).click(this.previous.bind(this,k));
                            }
                            if (n) {
                                jQuery('button#next'+k).click(this.next.bind(this,k));
                            }
                            if (s) {
                                jQuery('button#sendbutton').click(this.submit.bind(this));
                            }

                        }

                    }
                    if (this.map) {
                        this.currentMapTool = this.defaultMapTool;
                        this.activateTool (this.defaultMapTool);
                        var mapoptions = this.getParam('mapoptions');
                        if (mapoptions !== null) {
                            mapoptions = mapoptions.split(',');
                            var mapstate = {
                                center: [mapoptions[0],mapoptions[1]],
                                zoomLevel: mapoptions[2]
                            };
                            this.setCurrentMap(mapstate);
                        }
                    }
                    if (this.showTabs) {

                        if (this.bootstrap) {
                            jQuery('.buttons #previous').click(this.previous.bind(this));
                            jQuery('.buttons #next').click(this.next.bind(this));
                            this.setButtons();

                            var button = jQuery('.buttons #submit');
                            var func = jQuery(data).find(':root > submitbutton').attr('function');
                            if (func) {
                                func = (new Function ('return ' + func));
                            }
                            button.click(function (func) {
                                var resp = true;
                                if(func) {
                                    resp = func();
                                }
                                if (resp !== false) {
                                    this.submit()
                                }
                            }.bind(this,func));

                        } else {

                            if (this.confirm) {
                                var c = 'confirm';
                                jQuery('.tabcontainer').append('<div id="tabsep'+c+'" class="sep"/>');
                                var item = jQuery('<div id="tab'+c+'">Godkend</div>');
                                jQuery('.tabcontainer').append(item);
                            } else {
                                jQuery('.tabcontainer div:last-child').removeClass('arrow_box');
                            }
                        }
                    } else {
                        if (this.bootstrap) {
                            jQuery('.buttons #submit').click(this.submit.bind(this));
                        }
                    }

                    var localstore = jQuery(data).find('localstore');
                    if (localstore) {
                        this.localstore = localstore.text() !== 'false';
                        if (this.localstore) {
                            this.readLocalStore();
                        }
                        this.localstoreClear = (localstore.attr('clear') === 'false' ? false : true);
                    }

                    var log = jQuery(data).find('log').text();
                    if (log) {
                        this.logActive = (log === 'true');
                    }

                    this.checkConditions();
                    this.showTab(0);
//                    setTimeout(function () {this.next(-1)}.bind(this),1);

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
                        this.inputValidation[id].handler = function (id,errormessage) {
                            var valid = (jQuery('#'+id).val() !== '');
                            var map = jQuery('#'+id+'_row > .map');
                            jQuery('#'+id+'_row > .required-enabled').removeClass('error');
                            jQuery('#'+id+'ValidationMessage').remove();
                            if (valid === false) {
                                jQuery('#'+id+'_row > .required-enabled').addClass('error');
                                jQuery('<span id="'+id+'ValidationMessage" class="error validationMessage">'+errormessage+'</span>').insertAfter(jQuery('#'+id));
                            }
                            return valid;
                        }.bind(this, id, this.inputValidation[id].message)  ;
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
                        success : function(options,result) {
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
                        }.bind(this,options)
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

                this.geosearchOptions = options;
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
                        this.inputValidation[id].handler = function (id,errormessage) {
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
                        }.bind(this, id, this.inputValidation[id].message)  ;
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

                    this.getTicket (function (options,value) {
                        options.ticket = this.ticket;
                        options.service = 'GEO';
                        options.search = value;
                        jQuery.ajax( {
                            scriptCharset: 'UTF-8',
                            url: '//kortforsyningen.kms.dk/Geosearch',
                            dataType : "jsonp",
                            data : options,
                            success : function(options,result) {
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
                            }.bind(this,options)
                        });
                    }.bind(this,o,value));
                }

                break;
            case 'septimasearch':
                var value = this.getParam(urlparam);
                if (value == null) {
                    value = node.attr('defaultvalue');
                }
                if (this.bootstrap === true) {
                    contentcontainer.append('<div id="'+id+'_row" class="form-group'+(className ? ' '+className : '')+'"><label for="'+id+'">'+node.attr('displayname')+(req ? ' <span class="required">*</span>':'')+'</label><div class="septimasearchcontainer'+(req ? ' required-enabled':'')+'"><diw id="'+id+'_search"></diw><input type="hidden" id="'+id+'"/><input type="hidden" id="'+id+'_wkt"/></div></div>');
                } else {
                    contentcontainer.append('<tr id="'+id+'_row"><td><div class="labeldiv" id="'+id+'_displayname">'+node.attr('displayname')+'</div></td><td><div class="septimasearchcontainer"><div id="'+id+'_search"></div><input type="hidden" id="'+id+'"/><input type="hidden" id="'+id+'_wkt"/></div></td></tr>');
                }


                var options = {
                    hideOnSelect: true,
                    placeholder: node.attr('placeholder'),
                    resources: node.attr('resources') || 'Adresser',
                    area: node.attr('filter') || '',
                    id: id,
                    limit: node.attr('limit') || 10
                };
                if (node.attr('geometry_selected')) {
                    options.geometrySelect = new Function (node.attr('geometry_selected'));
                }
                if (node.attr('disablemap')) {
                    options.disablemap = node.attr('disablemap');
                }
                options.usegeometry = (typeof node.attr('usegeometry') !== 'undefined' && node.attr('usegeometry') === 'true');

                if (node.attr('minzoom')) {
                    options.minzoom = node.attr('minzoom')-0;
                }
                if (node.attr('minscale')) {
                    options.minscale = node.attr('minscale')-0;
                }

                if (node.attr('onchange')) {
                    options.change = new Function (node.attr('onchange'));
                }

                if (node.attr('hideOnSelect')) {
                    options.hideOnSelect = (node.attr('hideOnSelect') === 'true');
                }

                options.searchers = [];

                var searchers = node.find('searcher');

                for (var i = 0; i < searchers.length; i++) {
                    var obj = {
                        options: {}
                    };
                    var params = jQuery(searchers[i]).children();
                    for (var j=0; j<params.length; j++) {
                        if (params[j].nodeName === 'options') {
                            var opt = jQuery(params[j]).children();
                            for (var k = 0; k < opt.length; k++) {
                                if (opt[k].nodeName === 'targets') {
                                    obj.options[opt[k].nodeName] = opt[k].firstChild.nodeValue.split(',');
                                } else if (opt[k].nodeName === 'authParams') {
                                    obj.options[opt[k].nodeName] = {
                                        ticket: this.getTicket(function () {}, true)
                                    }
                                } else {
                                    obj.options[opt[k].nodeName] = (opt[k].firstChild === null ? '' : opt[k].firstChild.nodeValue);
                                }
                            }
                        } else {
                            obj[params[j].nodeName] = params[j].firstChild.nodeValue;
                        }
                    }
                    options.searchers.push(obj);
                }

                this.setSeptimaSearch(options);


                if (urlparam) {
                    this.postparams[urlparam+'_wkt'] = {
                        id: id+'_wkt'
                    };
                }

                //var regexp = node.attr('regexp');
                //if (regexp || req === true) {
                //    this.inputValidation[id] = {
                //        validate: true,
                //        required: req,
                //        regexp: regexp,
                //        tab: tab,
                //        message: node.attr('validate') || 'Indtast en valid værdi!'
                //    };
                //
                //    if (req) {
                //        this.inputValidation[id].handler = function (id,errormessage) {
                //            var valid = (jQuery('#'+id).val() !== '');
                //            var map = jQuery('#'+id+'_row > .map');
                //            jQuery('#'+id+'_row > .required-enabled').removeClass('error');
                //            jQuery('#'+id+'ValidationMessage').remove();
                //            if (valid === false) {
                //                jQuery('#'+id+'_row > .required-enabled').addClass('error');
                //                var message = jQuery('#'+id+'ValidationMessage');
                //                if (message.length === 0) {
                //                    jQuery('<span id="'+id+'ValidationMessage" class="error validationMessage">'+errormessage+'</span>').insertAfter(jQuery('#'+id));
                //                }
                //            }
                //            return valid;
                //        }.bind(this, id, this.inputValidation[id].message)  ;
                //    }
                //
                //    if (regexp) {
                //        jQuery('#'+id).valid8({
                //            'regularExpressions': [
                //                { expression: new RegExp(node.attr('regexp')), errormessage: this.inputValidation[id].message }
                //            ]
                //        });
                //    }
                //}


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
                    button.click(this.activateTool.bind(this,name));
                    this.mapbuttons[name] = {
                        element: button,
                        options: null,
                        config: jQuery(maptools[j])
                    }

                    if (jQuery(maptools[j]).attr('condition')) {
                        this.mapbuttons[name].condition = jQuery(maptools[j]).attr('condition');
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
                    var label = node.attr('displayname') || ''
                    contentcontainer.append('<div id="'+id+'_row" class="form-group mapcontainer"><label for="'+id+'">'+label+(req ? ' <span class="required">*</span>':'')+'</label><div id="'+id+'" class="map'+(className ? ' '+className : '')+'"></div><div class="features_attributes"></div></div>');
                } else {
                    contentcontainer.append('<tr id="'+id+'_row"><td colspan="2"><div id="'+id+'" class="map'+(className ? ' '+className : '')+'"></div><div class="features_attributes"></div></td></tr>');
                }
                var style = node.find('style');
                if (typeof style !== 'undefined' && style.length > 0) {
                    var styleNodes = jQuery(style[0]).children();
                    for (var j=0; j<styleNodes.length; j++) {
                        this.style[styleNodes[j].nodeName] = styleNodes[j].firstChild.nodeValue;
                    }
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
                resolutions = resolutions.sort(function(a, b){return b-a});

                this.multipleGeometries = (typeof node.attr('multiplegeometries') !== 'undefined' && node.attr('multiplegeometries') === 'true');
                this.mergeGeometries = (typeof node.attr('mergegeometries') === 'undefined' || node.attr('mergegeometries') === 'true');

                if (this.multipleGeometries === true) {
                    this.style.label = '';
                } else {
                    delete this.style.label;
                }

                // Projection
                proj4.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
                proj4.defs('urn:x-ogc:def:crs:EPSG:25832', proj4.defs('EPSG:25832'));
                ol.proj.proj4.register(proj4);
                var projection = new ol.proj.Projection({
                    code: 'EPSG:25832',
                    extent: [120000, 5661139.2, 958860.8, 6500000],
                    units: 'm'
                });
                ol.proj.addProjection(projection);
                
                var layers = [];
                var baselayers = [];
                var themes = node.find('theme');
                for (var j=0;j<themes.length;j++) {
                    var f = null;
                    var visible = jQuery(themes[j]).attr('visible') !== 'false';
                    var type = (jQuery(themes[j]).attr('type') ? jQuery(themes[j]).attr('type') : 'layer');
                    var image = (jQuery(themes[j]).attr('image') ? jQuery(themes[j]).attr('image') : null);
                    var displayName = (jQuery(themes[j]).attr('displayname') ? jQuery(themes[j]).attr('displayname') : '');
                    var layerGroup = (jQuery(themes[j]).attr('group') ? jQuery(themes[j]).attr('group') : '');
                    var layerClass = (jQuery(themes[j]).attr('class') ? jQuery(themes[j]).attr('class') : 'valuediv');
                    var layerId = jQuery(themes[j]).attr('id') || layerGroup + displayName.replace(/\s+/, "");
                    var addEventHandler = false;

                    if (type === 'baselayer' && image) {
                        baselayers.push({
                            id: layerId,
                            image: image,
                            text: displayName,
                            visible: visible
                        });
                    } else {
                        if (layerId != '') {
                            if (layerGroup != '') {
                                var existingGroup = this.groupedLayers[layerGroup];
                                if (typeof existingGroup === 'undefined') {
                                    if (this.bootstrap === true) {
                                        contentcontainer.append('<div id="'+layerId+'_row_theme"><div class="checkbox"><label><input type="checkbox" title="'+displayName+'" id="'+layerId+'" '+(visible ? 'checked="checked"' : '')+'>'+displayName+'</label></div></div>');
                                    } else {
                                        contentcontainer.append('<tr id="'+layerId+'_row_theme"><td colspan="2"><div class="'+layerClass+'"><label><input type="checkbox" id="'+layerGroup+'" '+(visible ? 'checked="checked"' : '')+'/>'+layerGroup+'</label></div></td></tr>');
                                    }
                                    this.groupedLayers[layerGroup] = [];
                                    addEventHandler = true;
                                    layerId = layerGroup;
                                }
                                this.groupedLayers[layerGroup].push(layerId);
                            } else {
                                if (this.bootstrap === true) {
                                    contentcontainer.append('<div id="'+layerId+'_row_theme"><div class="checkbox"><label><input type="checkbox" title="'+displayName+'" id="'+layerId+'" '+(visible ? 'checked="checked"' : '')+'>'+displayName+'</label></div></div>');
                                } else {
                                    contentcontainer.append('<tr id="'+layerId+'_row_theme"><td colspan="2"><div class="'+layerClass+'"><label><input type="checkbox" id="'+layerId+'" '+(visible ? 'checked="checked"' : '')+'/>'+displayName+'</label></div></td></tr>');
                                }
                                addEventHandler = true;
                            }
                            if (addEventHandler) {
                                jQuery('#'+layerId).change(function (onchange,layerId) {
                                    if (onchange) {
                                        onchange();
                                    }
                                    this.mapLayerChanged(layerId);
                                }.bind(this,f,layerId));
                            }
                        }
                    }

                    var l = {
                        layername: jQuery(themes[j]).attr('layername') || jQuery(themes[j]).attr('name'),
                        id: layerId,
                        version: '1.1.0',
                        host: jQuery(themes[j]).attr('host'),
                        basemap:false,
                        visible:visible
                    };


                    var version = jQuery(themes[j]).attr('version');
                    if (version) {
                        l.version = version;
                    }
                    var servicename = jQuery(themes[j]).attr('servicename');
                    if (servicename) {
                        l.servicename = servicename;
                    }
                    var singleTile = jQuery(themes[j]).attr('singleTile');
                    if (singleTile && singleTile == 'true') {
                        l.singleTile = true;
                    }
                    var ratio = jQuery(themes[j]).attr('ratio');
                    if (ratio) {
                        l.ratio = ratio-0;
                    }
                    var opacity = jQuery(themes[j]).attr('opacity');
                    if (opacity) {
                        l.opacity = opacity-0;
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

                    var sourceOptions = {
                        url: l.host,
                        params: {
                            'VERSION': l.version,
                            'FORMAT': 'image/png',
                            'TRANSPARENT': 'TRUE',
                            'LAYERS': l.layername
                        }
                    };
                    if (typeof l.servicename !== 'undefined') {
                        sourceOptions.params.servicename = l.servicename;
                    }
                    if (typeof l.sessionid !== 'undefined') {
                        sourceOptions.params.sessionid = l.sessionid;
                    }
                    if (typeof l.format !== 'undefined') {
                        sourceOptions.params.format = l.format;
                    }

                    var wmslayer
                    if (typeof l.singleTile !== 'undefined' && l.singleTile === true) {
                        var wmssource = new ol.source.ImageWMS(sourceOptions)
                        var layeroptions = {
                            opacity: l.opacity || 1,
                            visible: visible,
                            extent: [420000, 6025000, 905000, 6450000],
                            ratio: l.ratio || 1,
                            source: wmssource
                        }
                        wmslayer = new ol.layer.Image(layeroptions)
                    } else {
                        sourceOptions.tileGrid = new ol.tilegrid.TileGrid({
                            origin: ol.extent.getTopLeft([120000, 5661139.2, 958860.8, 6500000]),
                            resolutions: resolutions
                        });
                        var wmssource = new ol.source.TileWMS(sourceOptions)
                        var layeroptions = {
                            opacity: l.opacity || 1,
                            visible: visible,
                            extent: [420000, 6025000, 905000, 6450000],
                            source: wmssource
                        }
                        wmslayer = new ol.layer.Tile(layeroptions)
                    }
                    layers.push(wmslayer);
                    this.layers[layerId] = wmslayer;
                }


                if (node.attr('featurechange')) {
                    var featurechange = new Function (node.attr('featurechange'));
                    this.on('featureChanged',function (handler) {
                        handler();
                    }.bind(this,featurechange));
                }

                // var mapoptions = {
                //     extent: {x1:extent[0],y1:extent[1],x2:extent[2],y2:extent[3]},
                //     resolutions: resolutions,
                //     layers: layers
                // }
                // this.map = new SpatialMap.Map (id,mapoptions);


                var controls = [
                    new ol.control.ScaleLine({})
                ];

                this.drawSource = new ol.source.Vector();
                var vector = new ol.layer.Vector({
                    source: this.drawSource,
                    visible: true,
                    style: new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: this.style.fillColor
                        }),
                        stroke: new ol.style.Stroke({
                            color: this.style.strokeColor,
                            width: 2
                        }),
                        image: new ol.style.Circle({
                            radius: 7,
                            stroke: new ol.style.Stroke({
                                color: this.style.strokeColor,
                                width: 2
                            }),
                            fill: new ol.style.Fill({
                                color: this.style.fillColor
                            })
                        })
                    })
                });

                this.map = new ol.Map({
                    target: id,
                    logo: false,
                    layers: layers,
                    view: new ol.View({
                        // resolutions: resolutions,
                        maxResolution: resolutions[0],
                        minZoom: 0,
                        maxZoom: 16,
                        zoom: 7,
                        center: [711000, 6167500],
                        projection: projection
                    }),
                    controls: ol.control.defaults({
                        attribution: false
                    }).extend(controls)
                });
                this.map.getView().fit(extent);

                this.map.addLayer(vector);

                if (node.attr('onchange')) {
                    var mapchange = new Function (node.attr('onchange'));
                    this.map.on('moveend', function (handler) {
                        var map = this.getMapState();
                        this.currentMapState = map;
                        if (this.localstore) {
                            this.writeLocalStore();
                        }
                        handler(map);
                    }.bind(this, mapchange));
                } else {
                    this.map.on('moveend', function () {
                        var map = this.getMapState();
                        this.currentMapState = map;
                        if (this.localstore) {
                            this.writeLocalStore();
                        }
                    }.bind(this));
                }



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
                        handler: function (id,errormessage) {
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
                        }.bind(this, id, errormessage)
                    };
                }

                if (baselayers.length > 1) {
                    var ul = jQuery('<ul class="layertoggle"></ul>');
                    jQuery('#'+this.mapId).append(ul);
                    var next = null;
                    for (var layerIndex = 0; layerIndex < baselayers.length; layerIndex++) {
                        var bl = baselayers[layerIndex];
                        var li = jQuery('<li title="'+bl.text+'"><img src="'+bl.image+'"/></li>');
                        li.addClass('hidden');
                        ul.append(li);
                        bl.li = li;
                        if (bl.visible) {
                            next = layerIndex+1;
                        }
                        li.on('click', function (clicked, baselayers) {
                            var selectedIndex = null
                            for (var i=0; i<baselayers.length; i++) {
                                this.hideLayer(baselayers[i].id);
                                baselayers[i].li.addClass('hidden');
                                if (baselayers[i].id === clicked.id) {
                                    selectedIndex = i;
                                }
                            }
                            this.showLayer(clicked.id);
                            var nextLayer = baselayers[selectedIndex+1] || baselayers[0]
                            nextLayer.li.removeClass('hidden');
                        }.bind(this, bl, baselayers))
                    }
                    var nextLayer = baselayers[next] || baselayers[0]
                    nextLayer.li.removeClass('hidden');
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
                    jQuery('#'+id).change(this.writeLocalStore.bind(this));
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
                var conflictcondition = node.attr('conflictcondition') ? node.attr('conflictcondition') : null
                var conflict = {
                    id: id,
                    postparam: postparam,
                    displayname: node.attr('displayname'),
                    targetsetfile: node.attr('targetsetfile'),
                    targerset: node.attr('targerset'),
                    targetset: node.attr('targetset'),
                    page: node.attr('querypage'),
                    conflictcondition: conflictcondition
                };
                if (!conflict.targetset) {
                    //Tidligere har der været en slåfejl, der gjorde at targerset blev brugt. For at være bagudkombatipel er dette lavet:
                    conflict.targetset = conflict.targerset;
                }
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
                        var customparams = {};
                        if (node.attr('command')) {
                            customparams.readcommand = node.attr('command');
                        }
                        list = this.dropdownFromDatasource(node.attr('datasource'), customparams);
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
                        contentcontainer.append('<h1 id="'+id+'_row" class="'+(className ? className : '')+'"><span id="'+id+'">'+node.attr('displayname')+'</span></h1>');
                    } else {
                        contentcontainer.append('<tr id="'+id+'_row"><td colspan="2" class="colspan2"><h1 class="headerdiv'+(className ? ' '+className : '')+'" id="'+id+'">'+node.attr('displayname')+'</h1></td></tr>');
                    }
                } else if (type=='h2') {
                    if (this.bootstrap === true) {
                        contentcontainer.append('<h2 id="'+id+'_row" class="'+(className ? className : '')+'"><span id="'+id+'">'+node.attr('displayname')+'</span></h2>');
                    } else {
                        contentcontainer.append('<tr id="'+id+'_row"><td colspan="2" class="colspan2"><h2 class="headerdiv'+(className ? ' '+className : '')+'" id="'+id+'">'+node.attr('displayname')+'</h2></td></tr>');
                    }
                } else if (type=='message') {
                    if (this.bootstrap === true) {
                        contentcontainer.append('<div id="'+id+'_row" class="'+(className ? className : '')+'"><span id="'+id+'">'+node.attr('displayname')+'</span></div>');
                    } else {
                        contentcontainer.append('<tr id="'+id+'_row"><td colspan="2" class="colspan2"><div class="'+(className ? className : '')+'" id="'+id+'">'+node.attr('displayname')+'</div></td></tr>');
                    }
                } else if (type=='preview') {
                    if (this.bootstrap === true) {
                        this.showEmptyInPreview = (node.attr('showempty') !== 'false');
                        contentcontainer.append('<div id="'+id+'_row" class="preview'+(className ? ' '+className : '')+'"><span id="'+id+'"></span></div>');
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
                            contentcontainer.append('<p id="'+id+'_row" class="'+(className ? ' '+className : '')+'"><span id="'+id+'">'+node.attr('displayname')+'</span></p>');
                        } else {
                            contentcontainer.append('<tr id="'+id+'_row"><td colspan="2" class="colspan2"><div class="textdiv'+(className ? ' '+className : '')+'" id="'+id+'">'+node.attr('displayname')+'</div></td></tr>');
                        }
                    }
                } else if (type=='date') {
                    var today = (new Date()).toLocaleDateString().replace(/\//g,'.').replace(/^([0-9])\./,'0$1.').replace(/\.([0-9])\./,'.0$1.');

                    if (value === 'today') {
                        value = today;
                    }

                    if (this.bootstrap === true) {
                        contentcontainer.append('<div id="'+id+'_row" class="form-group'+(className ? ' '+className : '')+'"><label for="'+id+'">'+node.attr('displayname')+(req ? ' <span class="required">*</span>':'')+'</label><div class="'+(req ? 'required-enabled':'')+'"><input id="'+id+'" '+(postparam.disabled ? 'disabled':'')+' class="form-control" placeholder="'+(node.attr('placeholder') || 'ex. '+today)+'" type="text" value="'+(value || '')+'"/>'+(postparam.description ? '<div class="description">'+postparam.description+'</div>':'')+'</div></div>');
                    } else {
                        contentcontainer.append('<tr id="'+id+'_row"><td><div class="labeldiv'+(className ? ' '+className : '')+'" id="'+id+'_displayname">'+node.attr('displayname')+'</div></td><td><div class="valuediv"><input class="input1" id="'+id+'" placeholder="'+(node.attr('placeholder') || '')+'" value="'+(value || '')+'"/></div></td></tr>');
                    }
                    var change = null;
                    if (node.attr('onchange')) {
                        change = new Function (node.attr('onchange'));
                    }
                    var options = {
                        dateFormat: 'dd.mm.yy',
                        onSelect: function (id,changehandler) {
                            if (typeof this.inputValidation[id] !== 'undefined' && this.inputValidation[id].validate === true) {
                                jQuery('#'+id).isValid();
                            }
                            this.inputChanged(id);
                            if (changehandler) {
                                changehandler (jQuery('#'+id));
                            }
                        }.bind(this,id, change),
                        onClose: change
                    };
                    if (node.attr('onshow')) {
                        options.beforeShow = new Function (node.attr('onshow'));
                    }

                    var disabledDays = [];
                    if (node.attr('limitfromdatasource')) {

                        var request = jQuery.ajax({
                            url : 'spatialmap',
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
                        options.beforeShowDay = function (disabledDays, mindate, maxdate, date) {
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
                        }.bind(this, disabledDays, mindate, maxdate);
                    }

                    jQuery('#'+id).datepicker(options);

                } else if (type=='file') {
                    this.maxUploadFileSize = typeof node.attr('maxfilesize') === 'undefined' ? 100 : parseInt(node.attr('maxfilesize'));
                    if (this.bootstrap === true) {
                        contentcontainer.append('<div id="'+id+'_row" class="form-group'+(className ? ' '+className : '')+'"><label for="'+id+'">'+node.attr('displayname')+(req ? ' <span class="required">*</span>':'')+'</label><input type="hidden" id="'+id+'" value="'+(value || '')+'"/><input type="hidden" id="'+id+'_org" value="'+(value || '')+'"/><div class="fileupload'+(req ? ' required-enabled':'')+'"><form id="form_'+id+'" method="POST" target="uploadframe_'+id+'" enctype="multipart/form-data" action="/jsp/modules/formular/upload.jsp"><input '+(postparam.disabled ? 'disabled':'')+' type="file" name="file_'+id+'" id="file_'+id+'" /><span class="filupload-delete" title="Fjern vedhæftet fil"></span><input type="hidden" name="callbackhandler" value="parent.formular.fileupload"/><input type="hidden" name="id" value="'+id+'"/><input type="hidden" name="sessionid" value="'+this.sessionid+'"/><input type="hidden" name="formular" value="'+this.name+'"/> <input type="hidden" name="maxfilesize" value="'+this.maxUploadFileSize+'"/> </form><iframe name="uploadframe_'+id+'" id="uploadframe_'+id+'" frameborder="0" style="display:none;"></iframe></div></div>');
                        contentcontainer.find('#'+id+'_row .filupload-delete').click(this.deleteFileUpload.bind(this,id)).hide();
                    } else {
                        contentcontainer.append('<tr id="'+id+'_row"><td><input type="hidden" id="'+id+'" value="'+(value || '')+'"/><input type="hidden" id="'+id+'_org" value="'+(value || '')+'"/><div class="labeldiv'+(className ? ' '+className : '')+'" id="'+id+'_displayname">'+node.attr('displayname')+'</div></td><td><div class="valuediv"><form id="form_'+id+'" method="POST" target="uploadframe_'+id+'" enctype="multipart/form-data" action="/jsp/modules/formular/upload.jsp"><input type="file" name="file_'+id+'" id="file_'+id+'" /><input type="hidden" name="callbackhandler" value="parent.formular.fileupload"/><input type="hidden" name="id" value="'+id+'"/><input type="hidden" name="sessionid" value="'+this.sessionid+'"/><input type="hidden" name="formular" value="'+this.name+'"/> <input type="hidden" name="maxfilesize" value="'+this.maxUploadFileSize+'"/> </form><iframe name="uploadframe_'+id+'" id="uploadframe_'+id+'" frameborder="0" style="display:none;"></iframe></div></td></tr>');
                    }
                    jQuery('#file_'+id).change (function (id) {
                        this.startFileUpload(id);
                        jQuery('#form_'+id).submit();
                    }.bind(this,id));
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
                        this.inputValidation[id].handler = function (id,errormessage) {
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
                        }.bind(this, id, this.inputValidation[id].message)  ;
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
                    jQuery('input:radio[name='+id+']').change(function (onchange,id) {
                        if (onchange) {
                            onchange();
                        }
                        this.inputChanged(id);
                    }.bind(this,f,id));
                } else {
                    jQuery('#'+id).change(function (onchange,id) {
                        if (onchange) {
                            onchange();
                        }
                        this.inputChanged(id);
                    }.bind(this,f,id));
                }

                var f = null;
                if (node.attr('onkeyup')) {
                    var f = new Function (node.attr('onkeyup'));
                }
                jQuery('#'+id).keyup(function (onkeyup,id) {
                    if (onkeyup) {
                        onkeyup();
                    }
                    this.inputChanged(id);
                }.bind(this,f,id));

//                if (node.attr('onkeyup')) {
//                    jQuery('#'+id).keyup(new Function (node.attr('onkeyup')));
//                }

                break;
            case 'submitbutton':
                var button = jQuery('<button>'+node.attr('displayname')+'</button>');

                if (this.bootstrap === true) {
                    button.addClass('btn btn-primary pull-right');
                }
                var func = node.attr('function');
                if (func) {
                    button.click (new Function (func));
                }
                var b = {
                    e: button,
                    condition: node.attr('condition')
                };
                this.submitbuttons.push (b);
                break;
            case 'confirm':
                this.confirm = node.attr('displayname');
                break;
        }

        postparam.set = function (id, type, val) {
            if (type === 'checkbox') {
                if (val === 'true') {
                    val = true;
                } else if (val === 'false') {
                    val = false;
                }
                jQuery('#' + id).prop('checked', val);
            } else if (type === 'radiobutton') {
                jQuery('input:radio[name=' + id + '][value="' + val + '"]').prop('checked', true);
            } else {
                jQuery('#'+id).val(val);
            }
        }.bind(this, id, type)

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

    showLayer: function (id) {
        if (this.layers[id]) {
            this.layers[id].setVisible(true);
        }
    },

    hideLayer: function (id) {
        if (this.layers[id]) {
            this.layers[id].setVisible(false);
        }
    },

    mapLayerChanged: function (id) {
        var checked = jQuery('#'+id).prop('checked');
        var groupLayer = this.groupedLayers[id];
        if (checked) {
            if (typeof groupLayer === 'undefined') {
                this.showLayer(id);
            }
            else {
                for (i = 0; i<groupLayer.length; i++) {
                    var curId = groupLayer[i];
                    this.showLayer(curId);
                }
            }
        }
        else {
            if (typeof groupLayer === 'undefined') {
                this.hideLayer(id);
            }
            else {
                for (i = 0; i<groupLayer.length; i++) {
                    var curId = groupLayer[i];
                    this.hideLayer(curId);
                }
            }
        }
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

        for (var name in this.mapbuttons) {
            var b = this.mapbuttons[name]
            if (typeof b.condition !== 'undefined') {
                if (!(b.condition instanceof Function)) {
                    b.condition = new Function ('return '+b.condition);
                }
                var disabled = !b.condition();
                var isDisabled = b.element.hasClass('button_disabled');
                if (disabled !== isDisabled) {
                    this.disableButton(name, disabled);
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
            for (var i=prev;i>=0;i--) {
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
            this.setButtons()
        } else {
            prev = current-1;
            this.showTab(prev);
        }
    },

    setButtons: function () {
        if (this.tabs.length < 2) {
            jQuery('.buttons button').hide();
            jQuery('.buttons #submit').show();
        } else {
            jQuery('.buttons #previous').show();
            jQuery('.buttons #next').show();
            jQuery('.buttons #submit').hide();
            if (this.currentTab === 0) {
                jQuery('.buttons #previous').hide();
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

            setTimeout(function (tab) {
                window.location.hash = tab.displayname;
            }.bind(this,this.tabs[i]),100);

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

        this.searchUpdate();
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
            select : this.addressSelected.bind(this,options,calculateDistanceFunctionString,disablemapValue)
        });
    },

    setGeoSearch: function (options) {
        this.getTicket (function (options) {
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
                select : this.geoSearchSelected.bind(this,options,calculateDistanceFunctionString,disablemapValue)
            });
        }.bind(this,options));
    },

    addressSelected: function (options,cdfs,disablemapValue,event,ui) {
        this.geoSearchSelected (options,cdfs,disablemapValue,event,ui);
    },

    geoSearchSelected: function (options,cdfs,disablemapValue,event,ui) {
        var id = jQuery(event.target).attr('id');
        if (ui.item.data.type == 'streetNameType' && disablemapValue != 'true') {
            if (this.map) {
                this.zoomToExtent({x1:ui.item.data.xMin,y1:ui.item.data.yMin,x2:ui.item.data.xMax,y2:ui.item.data.yMax});

                if (options.minzoom) {
                    var mapstate = this.getMapState();
                    if (options.minzoom < mapstate.zoomLevel) {
                        this.zoomTo(options.minzoom);
                    }
                }
                if (options.minscale) {
                    var mapstate = this.getMapState();
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
                this.zoomToExtent({x1:Math.min.apply(Math, x),y1:Math.min.apply(Math, y),x2:Math.max.apply(Math, x),y2:Math.max.apply(Math, y)});

                if (options.minzoom) {
                    var mapstate = this.getMapState();
                    if (options.minzoom < mapstate.zoomLevel) {
                        this.zoomTo(options.minzoom);
                    }
                }
                if (options.minscale) {
                    var mapstate = this.getMapState();
                    if (options.minscale > mapstate.scale) {
                        this.map.zoomToScale(options.minscale);
                    }
                }
            }
            this.validAddress = true;
            jQuery('#'+id+'_wkt').val (ui.item.data.geometryWkt);
            if (this.map && options.usegeometry) {
                this.drawWKT (ui.item.data.geometryWkt,this.featureDrawed.bind(this),{styles: this.style});
            }


            jQuery('#'+id+'_wkt').val (ui.item.data.geometryWkt);
        } else {
            if (this.map && disablemapValue != 'true') {
                this.zoomToExtent({x1:ui.item.data.x-1,y1:ui.item.data.y-1,x2:ui.item.data.x+1,y2:ui.item.data.y+1});

                if (options.minzoom) {
                    var mapstate = this.getMapState();
                    if (options.minzoom < mapstate.zoomLevel) {
                        this.zoomTo(options.minzoom);
                    }
                }
                if (options.minscale) {
                    var mapstate = this.getMapState();
                    if (options.minscale > mapstate.scale) {
                        this.map.zoomToScale(options.minscale);
                    }
                }
            }
            this.validAddress = true;
            jQuery('#'+id+'_wkt').val (ui.item.data.geometryWkt);
            if (this.map && options.usegeometry) {
                this.drawWKT (ui.item.data.geometryWkt,this.featureDrawed.bind(this),{styles: this.style});
            }
            if (jQuery('#'+id+'_wkt').attr('value') != '') {
                if (cdfs) {
                    cdfs();
                }
            }
        }

        this.fireEvent('searchSelected', ui.item.data);

    },

    getMapState: function () {
        var view = this.map.getView();

        return {
            zoomLevel: view.getZoom(),
            extent: view.calculateExtent(this.map.getSize()),
            center: view.getCenter()
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
                url : 'spatialmap',
                dataType : 'json',
                type: 'POST',
                async: !sync,
                data : params,
                success : function(callback, data, status) {
                    this.ticket = data.row[0].expressionresult;
                    callback();
                }.bind(this,callback)
            });

            if (sync === true) {
                return this.ticket;
            }

        }
    },

    setSeptimaSearch: function (options) {
        this.getTicket (function (options) {
            var calculateDistanceFunctionString = options.geometrySelect || null;
            var disablemapValue = options.disablemap || null;
            options.ticket = this.ticket;

            var buildControllerOptions = {
                controller: {blankBehavior: "search"},
                searchers: [
                    //{
                    //    type: "Septima.Search.DawaSearcher",
                    //    title: "Adresser",
                    //    options: {kommunekode: 101}
                    //},
                    //{
                    //    type: "Septima.Search.GeoSearch",
                    //    title: "geoSearch",
                    //    options: {
                    //        targets: ['matrikelnumre','stednavne_v2'],
                    //        authParams: {
                    //            login: 'septimatest',
                    //            password: 'septimatest2U'
                    //        },
                    //        area: "muncode0101",
                    //        "returnCentroid": true
                    //    }
                    //},
                    //{
                    //    type: "Septima.Search.PlanSearcher",
                    //    title: "Vedtagne lokalplaner",
                    //    options: {
                    //        searchindexToken: 'septimaSEARCHDEMO-A7OLGHG2J4'
                    //    }
                    //},
                    //{
                    //    type: "Septima.Search.CVR_enhedSearcher",
                    //    title: "Virksomheder",
                    //    options: {
                    //        searchindexToken: "septimaSEARCHDEMO-A7OLGHG2J4"
                    //    }
                    //},
                    //{
                    //    type: "Septima.Search.S4IndexSearcher",
                    //    title: "S4Index",
                    //    options: {
                    //        host: "http://spatialsuite3102.kpc.asus:8080/",
                    //        datasources: "*",
                    //        blankBehavior: "search"
                    //    }
                    //}
                ]
            };

            buildControllerOptions.searchers = options.searchers;

            new Septima.Search.ControllerBuilder().setOptions(buildControllerOptions).build().done(Septima.bind(function(options,calculateDistanceFunctionString,disablemapValue, controller){

                var view = new Septima.Search.DefaultView({input: options.id+'_search', placeholder: options.placeholder, controller: controller});

                controller.addOnSelectHandler(this.septimaSearchSelected.bind(this,options,calculateDistanceFunctionString,disablemapValue,view));

            },this,options,calculateDistanceFunctionString,disablemapValue));

        }.bind(this,options));
    },

    searchUpdate: function () {
        jQuery('.ssInput').css({width: '80%'});
    },

    septimaSearchSelected: function (options,cdfs,disablemapValue,view,result) {

        if ((typeof result.newquery === 'undefined' && typeof result.suggestion === 'undefined') || (result.data && result.data.type && result.data.type === "vej")){
            var message = result.target + ": " + result.title + ". ";
            jQuery('#' + options.id + '').val(result.title);
            if (result.geometry) {
                var geojson = new OpenLayers.Format.GeoJSON();
                var olGeom = geojson.read(result.geometry, 'Geometry');
                var wkt = olGeom.toString();
                if (this.map && disablemapValue !== 'true') {
                    var bounds = olGeom.getBounds();
                    var extent =
                        {  x1: bounds.left,
                            y1: bounds.top,
                            x2: bounds.right,
                            y2: bounds.bottom
                        };

                    this.zoomToExtent(extent);

                    if (options.minzoom) {
                        var mapstate = this.getMapState();
                        if (options.minzoom < mapstate.zoomLevel) {
                            this.zoomTo(options.minzoom);
                        }
                    }
                    if (options.minscale) {
                        var mapstate = this.getMapState();
                        if (options.minscale > mapstate.scale) {
                            this.map.zoomToScale(options.minscale);
                        }
                    }
                }
                this.validAddress = true;
                jQuery('#' + options.id + '_wkt').val(wkt);
                if (this.map && options.usegeometry) {
                    this.drawWKT(wkt, this.featureDrawed.bind(this), {styles: this.style});
                }

                this.fireEvent('searchSelected', result);

                if (jQuery('#' + options.id + '_wkt').attr('value') !== '') {
                    if (cdfs) {
                        cdfs();
                    }
                }
            }

            if (options.hideOnSelect === true) {
                view.blur(true);
            }

            if (typeof options.change !== 'undefined') {
                options.change(result);
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
            var name = types[i];
            var b = this.mapbuttons[name];
            if (disable === true) {
                b.element.addClass ('button_disabled');
                if (b.element.hasClass('button_'+name+'_active')) {
                    if (name !== this.defaultMapTool) {
                        this.activateTool(this.defaultMapTool)
                    } else {
                        this.activateTool('pan')
                    }
                }
            } else {
                b.element.removeClass ('button_disabled');
            }
        }
    },

    clickHandler: null,
    clickEventAdded: false,
    setClickEvent: function (handler) {
        if (!this.clickEventAdded) {
            this.map.on('singleclick', function (evt) {
                if (evt.dragging) {
                    return;
                }
                if (this.clickHandler) {
                    var point = this.map.getEventCoordinate(evt.originalEvent);
                    this.clickHandler('POINT('+point[0]+' '+point[0]+')');
                }
            }.bind(this));
        }
        this.clickHandler = handler;
    },

    createID: function () {
        return (Math.random()+1).toString(36).substring(2,8);
    },

    drawInteraction: null,

    panzoom: function () {
        if (this.drawInteraction !== null) {
            this.map.removeInteraction(this.drawInteraction);
            this.drawInteraction = null;
        }
    },

    addInteraction: function (type, handler, options) {
        this.panzoom();
        this.drawInteraction = new ol.interaction.Draw({
            source: this.drawSource,
            type: type
        });
        this.drawInteraction.on('drawend', function (handler, event) {
            if (handler) {
                var id = this.createID();
                event.feature.setProperties({
                    _id: id,
                    _label: ''
                });
                var wkt = (new ol.format.WKT()).writeFeature(event.feature);
                handler({
                    _feature: event.feature,
                    id: id,
                    wkt: wkt
                });
            }
        }.bind(this, handler));
        this.map.addInteraction(this.drawInteraction);
    },

    drawPoint: function (handler) {
        this.addInteraction('Point', handler)
    },

    drawLine: function (handler) {
        this.addInteraction('LineString', handler)
    },

    drawPolygon: function (handler) {
        this.addInteraction('Polygon', handler)
    },

    drawWKT: function (wkt, handler) {
        var id = this.createID();
        var feature = (new ol.format.WKT()).readFeature(wkt);
        feature.setProperties({
            _id: id,
            _label: ''
        });
        this.drawSource.addFeature(feature);
        handler({
            _feature: feature,
            id: id,
            wkt: wkt
        })
        return id;
    },

    deleteFeature: function (id) {
        if (!id) {
            this.drawSource.clear();
        } else {
            if (typeof id === 'string') {
                id = [id];
            }
            for (var i=0;i<id.length;i++) {
                var f = this.getFeature(id[i]);
                if (f) {
                    this.drawSource.removeFeature(f._feature);
                }
            }
        }
    },

    setFeatureLabel: function (id, label) {
        var f = this.getFeature(id);
        if (f) {
            var props = f._feature.getProperties()
            props.label = label;
            f._feature.setProperties(props);
            // TODO: perhaps force repaint
        }
    },

    activateTool: function (type) {

        if (this.mapbuttons[type] && this.mapbuttons[type].element && this.mapbuttons[type].element.hasClass ('button_disabled')) {
            return;
        }

        this.resetButtons();
        this.setClickEvent();
        this.panzoom();
        if (this.locateActive) {
            this.map.locateRemove();
            this.locateActive = false;
        }
        if (this.mapbuttons[type] && this.mapbuttons[type].element) {
            this.mapbuttons[type].element.addClass ('button_'+type+'_active');
        }
        switch(type) {
            case 'pan':
                this.panzoom();
                break;
            case 'select':
                this.panzoom();
                var datasource = this.mapbuttons[type].config.attr('datasource').toString().toLowerCase();
                var buffer = this.mapbuttons[type].config.attr('buffer');
                if (typeof buffer === 'undefined' )	{
                    buffer = 0
                }
                if (!datasource || datasource == '') {
                    alert('Datasource missing!');
                    this.activateTool(this.currentMapTool);
                    return;
                } else {
                    this.setClickEvent(this.selectFromDatasource.bind(this,buffer,datasource));
                }
                break;
            case 'delete':
                this.map.drawDelete(this.featureDeleted.bind(this));
                break;
            case 'move':
                this.map.drawMove(this.featureModified.bind(this));
                break;
            case 'modify':
                this.map.drawModify(this.featureModified.bind(this));
                break;
            case 'polygon':
                this.drawPolygon(this.featureDrawed.bind(this),{styles: this.style});
                break;
            case 'line':
                this.drawLine(this.featureDrawed.bind(this),{styles: this.style});
                break;
            case 'circle':
                this.map.drawRegularPolygon(this.featureDrawed.bind(this),{draw: {sides: 40},styles: this.style});
                break;
            case 'point':
                this.drawPoint(this.featureDrawed.bind(this));
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

                this.drawWKT(wkt,function (event) {
                    this.featureDrawed(event);
                }.bind(this),{styles: this.style});

                this.activateTool(this.currentMapTool);
                return;
                break;
        }
        this.currentMapTool = type;
    },

    isGeometryValid: function (wkt) {
        if (wkt.match(/POLYGON/i) && wkt.split(',').length < 4) {
            // Polygons with only two nodes
            return false;
        }
        if (wkt.match(/LINESTRING/i) && wkt.split(',').length < 2) {
            // Lines with only one node
            return false;
        }
        return true;
    },

    featureDrawed: function (event) {

        if (!this.isGeometryValid(event.wkt.toString())) {
            return false;
        }

        if (this.multipleGeometries === false) {
            if (this.feature.length > 0) {
                var a = [];
                for (var i=0;i<this.feature.length;i++) {
                    a.push(this.feature[i].id);
                    if (typeof this.feature[i].element !== 'undefined') {
                        this.feature[i].element.remove();
                    }
                }
                this.deleteFeature (a);
                this.feature = [];
            }
        } else {
            if (typeof this.featureCount === 'undefined') {
                this.featureCount = 0;
            }
            this.featureCount++;

            var id = this.featureCount;
            setTimeout(function(id) {
                this.map.setFeatureLabel(event.id, id);
            }.bind(this,id),200);

            //Delete all others if not the same geometry type
            if (this.feature.length > 0 && event.wkt.match(/Point|LineString|Polygon/i)[0] !== this.feature[0].wkt.match(/Point|LineString|Polygon/i)[0]) {
                var a = [];
                for (var i=0;i<this.feature.length;i++) {
                    a.push(this.feature[i].id);
                    if (typeof this.feature[i].element !== 'undefined') {
                        this.feature[i].element.remove();
                    }
                }
                this.deleteFeature (a);
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

        this.setMergedGeometry (this.feature, function () {

            if (this.localstore) {
                this.writeLocalStore();
            }

            this.query (this.feature);
        }.bind(this));

        this.validateMap();

        this.fireEvent('featureChanged');

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

            this.merge(a,function (callback,wkt) {
                callback();
            }.bind(this,callback));

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
            url : 'spatialmap',
            dataType : 'json',
            type: 'POST',
            async: true,
            data : params,
            success : function (wktarray,callback,data) {
                this.mergedFeature = data.row[0].expressionresult;
                if (wktarray.length > 0) {
                    this.merge(wktarray, callback);
                } else {
                    callback(this.mergedFeature);
                }
            }.bind(this,wktarray,callback),
            error : function (callback) {
                callback();
            }.bind(this,callback)
        });
    },

    addFeatureAttributes: function (event) {
        var w = jQuery('<div class="attributeswrapper"></div>');
        var h = jQuery('<div class="attributesheader"><span class="text">Geometri '+this.featureCount+'</span></div>');
        w.append(h);
        event.element = w;

        var d = jQuery('<span class="icon icon-times" title="Slet denne geometri"></span>');
        d.click(function (feature) {
            feature.element.remove();
            this.deleteFeature(feature.id);
            feature.type = 'DELETE';
            this.featureDeleted(feature);
            return false;
        }.bind(this,event));
        h.append(d);

        h.click(function (feature) {
            jQuery('.attributeswrapper').removeClass('active');
            feature.element.addClass('active');
            this.map.deselectFeatures();
            this.map.selectFeature(feature.id)
        }.bind(this,event))

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

    selectFromDatasource: function (buf,datasource,wkt) {
        var params = {
            page: 'getfeature-from-wkt',
            wkt: wkt.toString(),
            sessionid: this.sessionid,
            datasource: datasource,
            command: 'read-spatial',
            buffer: buf
        };

        jQuery.ajax( {
            url : 'spatialmap',
            dataType : 'xml',
            type: 'POST',
            async: false,
            data : params,
            success : function(data, status) {
                var wkt = jQuery(data).find('col[name="shape_wkt"]').text();
                if (this.map && wkt) {
                    this.drawWKT(wkt,function (event) {

                        var add = true;
                        //If two features are identical then the two features are removed
                        for (var i=0;i<this.feature.length;i++) {
                            if (this.feature[i].wkt.toString() === event.wkt.toString()) {
                                this.deleteFeature (this.feature[i].id);
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
                            setTimeout(function (e) {this.deleteFeature (e.id);}.bind(this,event),200);
                        }

                    }.bind(this),{styles: this.style});
                }
            }.bind(this)
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
            url: 'spatialmap',
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
            var checked = list[j].checked;
            if (typeof list[j].selected !== 'undefined') {
                checked = list[j].selected;
            }
            var selected = (checked ? ' selected="selected"' : '');
            dropdown.append('<option value="'+list[j].value+'"'+selected+' '+(list[j].disabled === true ? 'disabled="disabled' : '')+'>'+list[j].name+'</option>');
        }
    },

    query: function (features) {
        var params = {
            page: 'formular-query',
            sessionid: this.sessionid
        }

        for (var i=0;i<this.spatialqueries.length;i++) {

            if (this.spatialqueries[i].conflictcondition != null) {
                if (!(this.spatialqueries[i].conflictcondition instanceof Function)) {
                    this.spatialqueries[i].conflictcondition = new Function ('return '+this.spatialqueries[i].conflictcondition);
                }

                if (this.spatialqueries[i].conflictcondition() === false) {
                    return;
                }
            }
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

                if (this.spatialqueries[i].targetset) {
                    params.targetset = this.spatialqueries[i].targetset;
                }
                if (this.spatialqueries[i].targetsetfile) {
                    params.targetsetfile = this.spatialqueries[i].targetsetfile;
                }
                if (this.spatialqueries[i].page) {
                    params.page = this.spatialqueries[i].page;
                }

                jQuery.ajax( {
                    url : 'spatialmap',
                    dataType : 'xml',
                    type: 'POST',
                    async: false,
                    data : params,
                    success : function(spatialquery, data, status) {
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
                    }.bind(this,this.spatialqueries[i])
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
                    jQuery('input:radio[name=' + this.postparams[name].id + '][value="' + val + '"]').prop('checked', true);
                } else if (this.postparams[name].type && (this.postparams[name].type == 'text' || this.postparams[name].type == 'h1' || this.postparams[name].type == 'h2')) {
                    jQuery('#' + this.postparams[name].id).html(val);
                } else if (this.postparams[name].type && this.postparams[name].type == 'file') {
                    //Not available
                } else {
                    jQuery('#' + this.postparams[name].id).val(val);
                }
            }
        }

    },

    setCurrentFeatures: function (features) {
        if (this.map) {
            this.deleteFeature();
        }
        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            if (this.isGeometryValid(feature.wkt)) {
                feature.id = this.drawWKT(feature.wkt, this.featureDrawed.bind(this), {styles: this.style});
                var f = this.getFeature(feature.id);
                for (var name in feature) {
                    if (name !== 'wkt' && f.params) {
                        if (typeof f.params[name] !== 'undefined') {
                            f.params[name].set(feature[name])
                        }
                    }
                }
            } else {
                delete feature.wkt;
            }
        }
    },

    zoomTo: function (zoom) {
        this.map.getView().setZoom(zoom);
    },

    zoomToExtent: function (options) {
        var extent = [options.x1, options.y1, options.x2, options.y2];
        this.map.getView().fit(extent);
    },

    zoomToPoint: function (p) {
        this.map.getView().setCenter(p);
    },

    setCurrentMap: function (mapState) {
        this.zoomTo(mapState.zoomLevel);
        var x, y;
        if (typeof mapState.center !== 'undefined') {
            x = mapState.center[0];
            y = mapState.center[1];
        } else {
            x = mapState.extent[0]+(mapState.extent[2]-mapState.extent[0])/2;
            y = mapState.extent[1]+(mapState.extent[3]-mapState.extent[1])/2;
        }
        this.zoomToPoint([x,y]);
    },

    getFeature: function(id) {
        for (var i = 0; i < this.feature.length; i++) {
            var f = this.feature[i];
            if (f.id === id) {
                return f;
            }
        }
        return null;
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

            var features = []
            for (var i = 0; i < this.feature.length; i++) {
                var f = this.feature[i];
                var p = this.getParams(f.params, {});
                var o = {
                    index: i,
                    wkt: f.wkt.toString()
                }
                for (var name in p.params) {
                    o[name] = p.params[name]
                }
                features.push(o)
            }

            var o = {
                params: params,
                map: this.currentMapState,
                features: features
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
                if (o.features) {
                    this.setCurrentFeatures(o.features);
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
                confirmbutton.click (function (params) {
                    jQuery('#messagebuttons').hide();
                    this.submitFinal(params);
                }.bind(this,params));
                var backbutton = jQuery('<button>Ret</button>');
                backbutton.click (function (params) {
                    jQuery('div#content').show();
                    jQuery('#message').hide();
                }.bind(this,params));
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
                        e.click(function (input) {
                            this.showTab(input.tab.id);
                            var element = document.getElementById(input.id);
                            if (element) {
                                element.focus();
                            }
                        }.bind(this,param));
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
        }

        jQuery('#messagebuttons').empty();
        for (var i=0;i<this.submitbuttons.length;i++) {

            if (typeof this.submitbuttons[i].condition === 'undefined') {
                this.submitbuttons[i].condition = function () {return true};
            } else {
                if (!(this.submitbuttons[i].condition instanceof Function)) {
                    this.submitbuttons[i].condition = new Function ('return '+this.submitbuttons[i].condition);
                }
            }

            if (this.submitbuttons[i].condition() === true) {
                jQuery('#messagebuttons').append(this.submitbuttons[i].e);
            }
        }

        if (this.pages.length > 0) {

            var pages = this.pages.slice(0);
            this.execute(params,pages);

        } else {
            //The old way
            params.page = this.submitpage;

            jQuery.ajax( {
                url : 'spatialmap',
                dataType : 'xml',
                type: 'POST',
                async: true,
                data : params,
                success : function(params, data, status) {
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
                                success: function (pdf,data) {
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
                                }.bind(this,pdf)
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
                                obj: JSON.stringify(params).substring(0,10000)
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
                }.bind(this, params),
                error : function(params, data, status) {
                    this.log({
                        type: 'error',
                        name: 'submitFinal',
                        message: 'No respose from server',
                        obj: JSON.stringify(params).substring(0,10000)
                    });
                    if (this.bootstrap === true) {
                        var html = '<div class="alert alert-danger"><div class="header">Der opstod en fejl i forbindelse med registreringen af ansøgningen</div>Prøv igen eller kontakt kommunen.</div></div>'+
                            jQuery('div#finalmessage').html(html);
                    } else {
                        jQuery('#messageloading').hide();
                        jQuery('#message').show().html('<div id="message_done" class="message-error"><span class="icon-warning">Der opstod en fejl i forbindelse med registreringen af ansøgningen. Prøv igen eller kontakt kommunen.</div>');
                    }
                }.bind(this, params)
            });

        }
    },

    execute: function (params, pages) {

        this.currentParams = params;

        if (!(pages[0].condition instanceof Function)) {
            pages[0].condition = new Function('return ' + pages[0].condition);
        }
        if (pages[0].condition() === false) {
            pages.shift();

            if (pages.length > 0) {
                this.execute(params, pages);
            } else {
                this.pagesDone(params);
            }
        } else {
            if (pages[0].loadingmessage) {
                var message = pages[0].loadingmessage;
                jQuery('#messageloading').html(message);
            }
            setTimeout(this.executeFinal.bind(this, params, pages), pages[0].delay)
        }
    },

    executeFinal: function (params, pages) {
        params.page = pages[0].name;
        params.outputformat = pages[0].type;
        params['jdaf.error.contenttype'] = pages[0].type;
        doAsync = this.errorHandling; //the errorpage handling must be synchronized - otherwise the pageDone method is called and therefor the session i invalidated before all errorpages are completed
        jQuery.ajax( {
            url : pages[0].url,
            dataType : pages[0].type,
            type: 'POST',
            async: doAsync,
            data : params,
            success : function(params, pages, data, status) {
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
            }.bind(this, params, pages),
            error : function(params, pages, data, status) {
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
            }.bind(this, params, pages)
        });
    },

    pagesDone: function (params) {

        var featureResp = 0;
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
                if (!this.mergeGeometries) {
                    p.params.wkt = this.feature[i].wkt.toString();
                }

                jQuery.ajax( {
                    url : 'spatialmap',
                    dataType : 'json',
                    type: 'POST',
                    async: false,
                    data : p.params,
                    success : function(featureResponse, data, status) {
                        featureResponse.count--;
                        if (featureResponse.fail === false) {
                            if (this.isErrorRespose(data)) {
                                featureResponse.fail = true;
                                this.showError();
                                this.pagesFail();
                            }
                        }
                    }.bind(this,featureResponse),
                    error : function(featureResponse, data, status) {
                        featureResponse.count--;
                        if (featureResponse.fail !== false) {
                            featureResponse.fail = true;
                            this.showError();
                            this.pagesFail();
                        }
                    }.bind(this,featureResponse)
                });
            }
        }
        if (typeof featureResponse !== 'undefined') {
            featureResp = featureResponse.count;
        }

        this.PageErrorHandling(params);
        if (featureResp == 0) {
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

            if ((typeof error === 'undefined' || error == null) && typeof data.exception !== 'undefined' && typeof data.exception.message !== 'undefined') {
                message = data.exception.message;
            }

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
                obj: JSON.stringify(params).substring(0,10000)
            });
        }
        return params;
    },

    removeSession: function () {

        if (this.localstore === true && this.localstoreClear === true) {
            this.clearLocalStore();
        }

        var params = {
            sessionid: this.sessionid,
            page: this.removeSessionPage
        };
        this.sessionid = null;
        jQuery.ajax( {
            url : '/spatialmap',
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

    removeInvalidFileNotice: function (id) {
        jQuery('#'+id+'_invalidfile').remove();
    },

    fileupload: function (filename,id,orgfilename,filesize) {
        this.endFileUpload();
        this.removeInvalidFileNotice(id);
        if (typeof filesize !== 'undefined' && (parseInt(filesize) <= this.maxUploadFileSize)) {
            jQuery('#'+id).val(filename);
            jQuery('#'+id+'_org').val(orgfilename);
            jQuery('#'+id+'_row .filupload-delete').show();
        } else {
            this.deleteFileUpload(id);
            var inputRow = jQuery('#'+id+'_row');
            var destinationTd = inputRow.children()[1];
            jQuery('<div/>', {
                id: id+'_invalidfile',
                text: 'Filen overskride den maksimale størrelse!'
            }).appendTo(destinationTd)

        }
    },

    start: function (options) {

        var s = document.location.search;

        if (typeof options !== 'undefined') {

            if (typeof options.keepMap !== undefined && options.keepMap === true) {

                if (typeof this.currentMapState !== 'undefined') {
                    var x = this.currentMapState.extent[0]+(this.currentMapState.extent[2]-this.currentMapState.extent[0])/2;
                    var y = this.currentMapState.extent[1]+(this.currentMapState.extent[3]-this.currentMapState.extent[1])/2;
                    var z = this.currentMapState.zoomLevel;
                    var mapoptions = x+','+y+','+z;

                    s = this.setParam(s, 'mapoptions', mapoptions);
                }

            } else {
                s = this.setParam(s, 'mapoptions', '');
            }

            if (typeof options.clear !== 'undefined' && options.clear === true) {
                this.clearLocalStore();
            }

        } else {
            s = this.setParam(s, 'mapoptions', '');
        }

        document.location.search = s

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

            count = Math.round((date2-date1)/1000/60/60/24);
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

        jQuery('#'+id).datepicker('option', 'beforeShowDay', function (options, date) {
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
        }.bind(this, options) );


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
            url : 'spatialmap',
            dataType : 'json',
            type: 'POST',
            async: true,
            data : params,
            success : function(data) {

                if (typeof data.row !== 'undefined' && typeof data.row[0] !== 'undefined' && typeof data.row[0].row !== 'undefined') {
                    var rows = data.row[0].row;
                    if (rows.length > 0) {
                        this.setCurrentValues(rows[0]);
                        if (typeof rows[0].wkt !== 'undefined') {
                            this.setCurrentFeatures([rows[0]]);
                        }
                    }
                }

            }.bind(this)
        });
    },

    getParam: function (name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    },

    setParam: function (str, name, value) {
        name = encodeURI(name);
        value = encodeURI(value);

        var kvp = str.substr(1).split('&');
        var i=kvp.length; var x; while(i--) {
            x = kvp[i].split('=');

            if (x[0]==name) {
                x[1] = value;
                kvp[i] = x.join('=');
                break;
            }
        }

        if(i<0) {
            kvp[kvp.length] = [name,value].join('=');
        }
        return kvp.join('&');
    },

    encodeParam: function (name,val) {
        return val;
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
                url : 'spatialmap',
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
    },

    paramHasValue: function (param) {
        var curParam = this.currentParams[param];
        if (typeof curParam !== 'undefined' && curParam != null && curParam.length > 0) {
            return true;
        }
        return false;
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
    if (params != null && typeof data.exception === 'undefined') {
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
            url: '/spatialmap',
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

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
    
    inputValidation: {},
    
    reportprofile: 'alt',
    reportlayers: 'default',
    reportxsl: 'kvitering',
    reportmapscale: null,
    
    confirm: null,
    submitbuttons: [],
    
    style: {
        strokeColor: '#FF0000',
        fillColor: '#FFFFFF'
    },
    
    validAddress: false,
    
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
                        jQuery('#content').hide ();
                	});
                	var button = jQuery('<button>Tilbage</button>');
            		button.click (function () {
                		jQuery('div.help').hide ();
                        jQuery('#helpbuttons').hide();
                        jQuery('#content').show ();
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

                this.config = jQuery(data).find('content');
                if (this.config) {
                    this.config = this.config.children();
                    for (var i=0; i<this.config.length; i++) {
                        var node = jQuery(this.config[i]);
                        var urlparam = node.attr('urlparam');
                        var id = 'input_'+i;
                        if (node.attr('id')) {
                        	id = node.attr('id');
                        }
                        if (urlparam) {
                            this.postparams[urlparam] = {
                            	id: id
                            };
                        }
                        var className = node.attr('class');
                        switch(this.config[i].nodeName) {
                            case 'address':
                                jQuery('#content > tbody:last').append('<tr><td><div class="labeldiv" id="'+id+'_displayname">'+node.attr('displayname')+'</div></td><td><div class="addressdiv"><input class="input1" id="'+id+'"/><input type="hidden" id="'+id+'_wkt"/></div></td></tr>');
                                var options = {
                                    apikey: node.attr('apikey'),
                                    area: node.attr('filter'),
                                    id: id
                                }
                                this.setAddressSelect(options);
                                if (urlparam) {
                                    this.postparams[urlparam+'_wkt'] = {
                                    	id: id+'_wkt'
                                    };
                                }
                            break;
                            case 'maptools':
                                //jQuery('#content > tbody:last').append('<tr><td colspan="2" align="right"><div id="button1" class="button button1"></div><div id="button2" class="button button2"></div></td></tr>');
                                jQuery('#content > tbody:last').append('<tr><td colspan="2" align="right"><div id="mapbuttons_'+i+'"></div></td></tr>');
                                var maptools = node.find('maptool');
                                for (var j=0;j<maptools.length;j++) {
                                    var name = jQuery(maptools[j]).attr('name').toString().toLowerCase();
                                    var displayname = jQuery(maptools[j]).attr('displayname');
                                    var title = '';
                                    if (displayname) {
                                        title = displayname.toString();
                                    }
                                    $('#mapbuttons_'+i).append('<div id="mapbutton_'+i+'_'+j+'" class="button" title="'+title+'"></div>');
                                    var id = 'mapbutton_'+i+'_'+j;
                                    jQuery('#'+id).addClass('button_'+name).click(SpatialMap.Function.bind(this.activateTool,this,name,maptools[j]));
                                    this.mapbuttons[name] = id;
                                }
                            break;
                            case 'map':
                                jQuery('#content > tbody:last').append('<tr><td colspan="2"><div id="map_'+i+'" class="map"></div></td></tr>');
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
                                    layers.push({
                                        layername: jQuery(themes[j]).attr('name'),
                                        host: jQuery(themes[j]).attr('host') + (jQuery(themes[j]).attr('host').indexOf('?')+1 ? '&' : '?') + 'sessionid='+this.sessionid,
                                        basemap:false,
                                        visible:true
                                    });
                                }
                                
                                var mapoptions = {
                                    extent: {x1:extent[0],y1:extent[1],x2:extent[2],y2:extent[3]},
                                    resolutions: resolutions,
                                    layers: layers
                                }
                                this.map = new SpatialMap.Map ('map_'+i,mapoptions);
                            break;
                            case 'area':
                                this.areaid = id;
                                jQuery('#content > tbody:last').append('<tr><td colspan="2"><div class="areadiv'+(className ? ' '+className : '')+'">'+node.attr('displayname')+'<span id="areaspan_'+id+'">0</span> m&#178;</div><input type="hidden" id="'+id+'" value=""/></td></tr>');
                            break;
                            case 'conflicts':
                                var html = '<tr><td colspan="2"><div id="container_conflictdiv_'+id+'" class="inputdiv conflictdivcontainer'+(className ? ' '+className : '')+'">';
                                if (node.attr('displayname')!='') {
                                    html += '<div class="doublelabeldiv">'+node.attr('displayname')+'</div>';
                                }
                                html += '<div class="conflictdiv" id="conflictdiv_'+id+'"/></div><input type="hidden" id="'+id+'" value=""/></td></tr>';
                                jQuery('#content > tbody:last').append(html);
                                this.spatialqueries.push({
                                    id: id, //'conflictdiv_'+i,
                                    targetsetfile: node.attr('targetsetfile'),
                                    targerset: node.attr('targerset')
                                });
                            break;
                            case 'input':
                                var type = node.attr('type');
                                var value = node.attr('defaultvalue');
                                if (type=='dropdown') {
                                    jQuery('#content > tbody:last').append('<tr><td><div class="labeldiv'+(className ? ' '+className : '')+'" id="'+id+'_displayname">'+node.attr('displayname')+'<div></td><td><div class="valuediv"><select class="select1" id="'+id+'"/></div></td></tr>');
                                    var option = node.find('option');
                                    for (var j=0;j<option.length;j++) {
                                        $('#'+id).append('<option value="'+jQuery(option[j]).attr('value')+'">'+jQuery(option[j]).attr('name')+'</option>');
                                    }
                                } else if (type=='textarea') {
                                    jQuery('#content > tbody:last').append('<tr><td><div class="labeldiv'+(className ? ' '+className : '')+'" id="'+id+'_displayname">'+node.attr('displayname')+'</div></td><td><div class="valuediv"><textarea class="textarea1" id="'+id+'">'+(value || '')+'</textarea></div></td></tr>');
                                } else if (type=='hidden') {
                                    jQuery('#content > tbody:last').append('<tr style="display:none;"><td><input type="hidden" id="'+id+'" value="'+(value || '')+'"/></div></td></tr>');
                                } else if (type=='text') {
                                    jQuery('#content > tbody:last').append('<tr><td colspan="2"><div class="textdiv'+(className ? ' '+className : '')+'">'+node.attr('displayname')+'</div></td></tr>');
                                } else if (type=='date') {
                                    jQuery('#content > tbody:last').append('<tr><td><div class="labeldiv'+(className ? ' '+className : '')+'" id="'+id+'_displayname">'+node.attr('displayname')+'</div></td><td><div class="valuediv"><input class="input1" id="'+id+'" value="'+(value || '')+'"/></div></td></tr>');
                                    jQuery('#'+id).datepicker({ dateFormat: 'dd.mm.yy' });
                                } else if (type=='file') {
                                    jQuery('#content > tbody:last').append('<tr><td><input type="hidden" id="'+id+'" value="'+(value || '')+'"/><div class="labeldiv'+(className ? ' '+className : '')+'" id="'+id+'_displayname">'+node.attr('displayname')+'</div></td><td><div class="valuediv"><form id="form_'+id+'" method="POST" target="uploadframe_'+id+'" enctype="multipart/form-data" action="/jsp/modules/formular/upload.jsp"><input type="file" name="file_'+id+'" id="file_'+id+'" /><input type="hidden" name="callbackhandler" value="parent.formular.fileupload"/><input type="hidden" name="id" value="'+id+'"/><input type="hidden" name="sessionid" value="'+this.sessionid+'"/></form><iframe name="uploadframe_'+id+'" id="uploadframe_'+id+'" frameborder="0" style="display:none;"></iframe></div></td></tr>');
                                    jQuery('#file_'+id).change (SpatialMap.Function.bind(function (id) {
                                    	jQuery('#form_'+id).submit();
                                    },this,id));
                                } else {
                                	type = 'input';
                                    jQuery('#content > tbody:last').append('<tr><td><div class="labeldiv'+(className ? ' '+className : '')+'" id="'+id+'_displayname">'+node.attr('displayname')+'</div></td><td><div class="valuediv"><input class="input1" id="'+id+'" value="'+(value || '')+'"/></div></td></tr>');
                                }
                                if (urlparam) {
                                	this.postparams[urlparam].type = type;
                                }
                                if (node.attr('regexp')) {
                                	this.inputValidation[id] = true;
                                	jQuery('#'+id).valid8({
                                        'regularExpressions': [
                                             { expression: new RegExp(node.attr('regexp')), errormessage: node.attr('validate') || 'Indtast en valid værdi!'}
                                         ]
                                    });
                                }
                                if (node.attr('onchange')) {
                                	jQuery('#'+id).change(new Function (node.attr('onchange')));
                                }
                                if (node.attr('onkeyup')) {
                                	jQuery('#'+id).keyup(new Function (node.attr('onkeyup')));
                                }
                                
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
                    if (this.map) {
                    	this.activateTool ('pan');
                    }
                    //add submit button
                    jQuery('#content > tbody:last').append('<tr><td colspan="2" align="right"><div class="submitbuttondiv" id="submitdiv"><button id="sendbutton">Send</button></div></td></tr>');
                    jQuery('#sendbutton').click(SpatialMap.Function.bind (function () {
                        this.submit();
                    },this));
                }
            },this)
        });
    },
    
    
    setAddressSelect: function (options) {
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
            select : SpatialMap.Function.bind(this.addressSelected,this)
        });
    },
    
    addressSelected: function (event,ui) {
        if (ui.item.data.type == 'street') {
            if (this.map) {
            	this.map.zoomToExtent({x1:ui.item.data.xMin,y1:ui.item.data.yMin,x2:ui.item.data.xMax,y2:ui.item.data.yMax});
            }
            this.validAddress = false;
            var id = jQuery(event.currentTarget).attr('id');
            jQuery('#'+id+'_wkt').val ('');
        } else {
            if (this.map) {
            	this.map.zoomToExtent({x1:ui.item.data.x-1,y1:ui.item.data.y-1,x2:ui.item.data.x+1,y2:ui.item.data.y+1});
            }
            this.validAddress = true;
            var id = jQuery(event.currentTarget).attr('id');
            jQuery('#'+id+'_wkt').val (ui.item.data.wkt);
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
            alert('Tegn på kortet og udfyld alle felter inden der trykkes på "Send"');
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
        			alert ('Der er ét felt, der ikke er indtastet korrekt!');
        		} else {
            		alert('Der er '+invalidCount+' felter, der ikke er indtastet korrekt!');
        		}
        		jQuery('#'+name).focus();
        		return;
        	}
        	
        	var confirmtext = '';
            for (var name in this.postparams) {
            	var val = jQuery('#'+this.postparams[name].id).val()
                params[name] = encodeURIComponent(val);
            	
            	var t = jQuery('#'+this.postparams[name].id+'_displayname').text ();
            	if (t && val) {
            		confirmtext+='<br/>'+t+' '+val;
            	}

            }
            jQuery('#content').hide();
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
                    jQuery('#content').show();
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
                var pdf = jQuery(data).find('col[name="url"]');
                if (pdf.length) {
                    jQuery('#message').show();
                    jQuery('#messagebuttons').show();
                    jQuery('#messagetext').html('<div id="message_done">Ansøgningen er nu registreret.<br/>Hent en kvitering på ansøgningen <a href="'+pdf.text()+'" target="_blank">her</a> (åbnes i et nyt vindue!)</div>');
                } else {
                    jQuery('#message').show();
                    jQuery('#messagetext').html('<div id="message_done">Der opstod en fejl i forbindelse med registreringen af ansøgningen. Kontakt venligst kommunen for yderligere oplysninger.</div>');
                }
            },this),
            error : SpatialMap.Function.bind( function(data, status) {
                jQuery('#message').show().html('<div id="message_done">Der opstod en fejl i forbindelse med registreringen af ansøgningen. Prøv igen eller kontakt kommunen.</div>');
            },this)
        });
    },
    
    fileupload: function (filename,id) {
    	jQuery('#'+id).val(filename);
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
    }

    
});

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

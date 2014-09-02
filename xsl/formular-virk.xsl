<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:output method="html" indent="yes" encoding="[cbinfo.html.encoding]" />
	<xsl:param name = "formular"/>
	<xsl:param name = "sessionid"/>
	<xsl:param name = "formular-css">/modules/formular/css/formular.css</xsl:param>
    <xsl:template match="/">
        <xsl:text disable-output-escaping='yes'>&lt;!DOCTYPE html&gt;</xsl:text>
        <xsl:text>&#xa;</xsl:text>
        <xsl:apply-templates select="config/formular[@name=$formular]"/>
    </xsl:template>
    <xsl:template match="formular[@name=$formular]">
        <html>
            <head>
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <meta name="HandheldFriendly" content="True" />
                <meta name="MobileOptimized" content="320" />
                <meta name="format-detection" content="telephone=no" />
                <meta name="viewport"
                    content="width=device-width, minimum-scale=1.0, maximum-scale=1.0" />
                <meta http-equiv="cleartype" content="on" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black" />

                <xsl:choose>
                    <xsl:when test="title">
                        <title><xsl:value-of select="title" /></title>
                    </xsl:when>
                    <xsl:otherwise>
                        <title><xsl:value-of select="header" /></title>
                    </xsl:otherwise>
                </xsl:choose>
                <xsl:variable name="cbinfo.jslib.jquery">[cbinfo.jslib.jquery]</xsl:variable>

                <script type="text/javascript" charset="ISO-8859-1" src="//code.jquery.com/jquery-1.11.0.min.js"></script>

                <xsl:variable name="cbinfo.jslib.jqueryui">[cbinfo.jslib.jqueryui]</xsl:variable>
                <xsl:choose>
                    <xsl:when test="substring($cbinfo.jslib.jqueryui,0,2) = '['">
                        <script type="text/javascript" charset="ISO-8859-1" src="/js/standard/jquery/jquery-1.6.2.min.js"></script>
                    </xsl:when>
                    <xsl:otherwise>
                        <script type="text/javascript" charset="ISO-8859-1" src="[cbinfo.jslib.jqueryui]"></script>
                    </xsl:otherwise>
                </xsl:choose>
				<script type="text/javascript" src="/modules/formular/js/jquery.ui.datepicker-[cbinfo.locale].js"></script>
                <xsl:variable name="cbinfo.spatialmap.jslib">[cbinfo.spatialmap.jslib]</xsl:variable>
                <xsl:choose>
                    <xsl:when test="substring($cbinfo.spatialmap.jslib,0,2) = '['">
                        <script type="text/javascript" src="/js/standard/spatialmap/1.3.0/api/SpatialMap.js?modules=map,events"></script>
                    </xsl:when>
                    <xsl:otherwise>
                        <script type="text/javascript" src="[cbinfo.spatialmap.jslib]"></script>
                    </xsl:otherwise>
                </xsl:choose>

                <link href="/modules/formular/css/bootstrap/css/bootstrap.min.css" rel="stylesheet" media="screen" />
                <link href="http://designmanual.virk.dk/virkdesign/designmanualv2/css/designmanual.css" rel="stylesheet" media="screen, print" />

                <xsl:variable name="cbinfo.css.jqueryui">[cbinfo.css.jqueryui]</xsl:variable>
                <xsl:choose>
                    <xsl:when test="substring($cbinfo.css.jqueryui,0,2) = '['">
                        <link rel="Stylesheet" type="text/css" href="/css/standard/jquery/jquery-ui-1.8.14.custom.css"></link>
                    </xsl:when>
                    <xsl:otherwise>
                        <link rel="Stylesheet" type="text/css" href="[cbinfo.css.jqueryui]"></link>
                    </xsl:otherwise>
                </xsl:choose>
                <link rel="Stylesheet" type="text/css" href="/modules/formular/css/formular.css"></link>
                <link rel="Stylesheet" type="text/css" href="/modules/formular/css/bootstrap-formular.css"></link>
                <xsl:if test="css">
                    <xsl:element name="link">
                        <xsl:attribute name="rel">Stylesheet</xsl:attribute>
                        <xsl:attribute name="href"><xsl:value-of select="css"/></xsl:attribute>
                        <xsl:attribute name="type">text/css</xsl:attribute>
                    </xsl:element>
                </xsl:if>
                <xsl:for-each select="css">
                    <xsl:element name="link">
                        <xsl:attribute name="rel">Stylesheet</xsl:attribute>
                        <xsl:attribute name="href"><xsl:value-of select="."/></xsl:attribute>
                        <xsl:attribute name="type">text/css</xsl:attribute>
                    </xsl:element>
                </xsl:for-each>
                
                <script type="text/javascript" src="/modules/formular/css/bootstrap/js/bootstrap.min.js"></script>
                <script type="text/javascript" src="/modules/formular/css/virk/modernizr.custom.js"></script>
                <script type="text/javascript" src="/modules/formular/css/virk/jquery.dlmenu.js"></script>
                <script type="text/javascript" src="/modules/formular/css/virk/common.js"></script>


                <script language="javascript" src="[cbinfo.js.url]/standard/proj4js/proj4js-compressed.js" type="text/javascript"></script>
                <script language="javascript" src="/modules/formular/js/jquery.valid8.js" type="text/javascript"></script>
                <script language="javascript" src="/modules/formular/js/store.js" type="text/javascript"></script>
                <script language="javascript" src="/modules/formular/js/json2.js" type="text/javascript"></script>
                <script language="javascript" src="/modules/formular/js/formular.js" type="text/javascript"></script>

                <xsl:for-each select="js">
                    <xsl:element name="script">
                        <xsl:attribute name="language">javascript</xsl:attribute>
                        <xsl:attribute name="src"><xsl:value-of select="."/></xsl:attribute>
                        <xsl:attribute name="type">text/javascript</xsl:attribute>
                    </xsl:element>
                </xsl:for-each>

                <script type="text/javascript" language="javascript">
                var formular;
                jQuery(function () {
                    formular = new Formular ({
                        bootstrap: true,
                        name: '<xsl:value-of select="$formular"/>',
                        sessionid:'<xsl:value-of select="$sessionid"/>'
                    });
                });
                </script>
            </head>
            <body>
            
            
    <a href="#contentstart" class="hide">Gå direkte til indhold</a>

    <header class="navbar">
        <div class="top">
            <div class="container">
                <div class="row">
                    <div class="col-sm-8 col-xs-12">
                        <a href="">
                            <img src="http://designmanual.virk.dk/virkdesign/designmanualv2/graphics/logo-top.png" height="57" width="240" alt="Virk / Indberetning - logo" class="logo" />
                        </a>
                    </div>
                    <div class="col-xs-4 align-right nav-tools hidden-xs">
                    </div>
                </div>
            </div>
        </div>
        <div class="topbar hidden-xs">
            <div class="container">
                <div class="row">
                    <div class="col-xs-8 info">
                        <a href="">Virk registrering &#8250;</a>
		                <xsl:choose>
		                    <xsl:when test="title">
		                        <p><xsl:value-of select="title" /></p>
		                    </xsl:when>
		                    <xsl:otherwise>
		                        <p><xsl:value-of select="header" /></p>
		                    </xsl:otherwise>
		                </xsl:choose>
                    </div>
                    <div class="col-xs-4 align-right">
                        <div class="inner-details">
                            <xsl:if test="contact">
	                            <xsl:element name="a">
	                                <xsl:attribute name="class">solution-author-link</xsl:attribute>
	                                <xsl:attribute name="href"><xsl:value-of select="contact/@link"/></xsl:attribute>
	                                <xsl:value-of select="contact" /> <span> &#8250;</span>
	                            </xsl:element>
	                            <div class="contact">
	                                Support: <span class="solution-author-phone"><xsl:value-of select="contact/@phone" /></span>
	                                <span class="divider">|</span>
				                    <xsl:element name="a">
				                        <xsl:attribute name="class">solution-author-email</xsl:attribute>
				                        <xsl:attribute name="href">mailto:<xsl:value-of select="contact/@email"/></xsl:attribute>
				                        E-mail <span>&#8250;</span>
				                    </xsl:element>
	                            </div>
                            </xsl:if>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Wrapper start -->
    <div class="container">
        <!-- Mobile menu, Open step guide, start -->
        <div class="row">
            <div class="col-xs-12">
                <button class="btn btn-steps visible-xs" type="button" data-toggle="collapse" data-target=".nav-collapse">Trin 1 af 5 <span class="caret"></span></button>
                <div id="dl-menu" class="dl-menuwrapper visible-xs">
                    <button class="dl-trigger">Open Menu</button>
                    <ul class="dl-menu">
                        <li>
                            <a href="eksempel02.html">Mine kladder</a>
                        </li>
                    </ul>
                </div>
                <!-- /dl-menuwrapper -->
            </div>
        </div>
        <!-- Mobile menu, Open step guide, end -->
        <!-- Main content wrapper start -->
        <div class="content row">
            <div class="col-sm-3">
                <ul class="nav style-2 nav-collapse collapse navlist" >
                
                <!-- 
                    <li class="active">
                        <a href="eksempel03-1.html">1. Betingelser for brug af denne indberetning</a>
                    </li>
                    <li>
                        <a href="eksempel03-2.html">2. Stamdata</a>
                    </li>
                    <li>
                        <a href="eksempel03-3.html">3. Startdato</a>
                    </li>
                    <li>
                        <a href="eksempel03-4.html">4. Opsummering og godkendelse</a>
                    </li>
                -->
                </ul>
            </div>

            <!-- Main content start -->
            <div class="col-sm-9 main-content">
                <!-- Hidden link for accesibility -->
                <a id="contentstart" class="hide">Indhold start</a>

                <!-- Page content start -->
                <h1 class="section">Betingelser for brug af denne indberetning</h1>

                <div class="row">
                    <div class="col-xs-12">
                        <ol>
                            <li>Indberetning af virksomhed, er underlagt de til enhver tid gældende love og bekendtgørelser, herunder reglerne om elektronisk registrering.</li>
                            <li>
                                Når du har afsluttet en anmeldelse, er det din pligt at gemme de originale dokumenter, der er blevet brugt i forbindelse med anmeldelsen. Du skal gemme dokumenterne i mindst fem år.
                                Eksempler på dokumenter, der skal gemmes, kan være: Eksamensbeviser, paskopier og øvrige dokumenter, der er blevet brugt til at lave registreringen.
                            </li>
                            <li>Du hæfter i enhver henseende for den brug - herunder misbrug - af Enhedsregistreringen, som du foretager med digital signatur/NemID. Det er således dig som anmelder, der er ansvarlig for rigtigheden af de indberettede oplysninger. Virksomheden hæfter for medarbejderes brug- og eventuelle misbrug – af systemet, når der bruges medarbejdersignatur.</li>
                            <li>Erhvervsstyrelsen ønsker at hjælpe dig med at få et overblik over eventuelle yderligere registreringskrav i forhold det offentlige. Derfor informerer Erhvervsstyrelsen dig i forbindelse med din anmeldelse om yderligere registreringskrav, der kan være relevante for din virksomhed. Erhvervsstyrelsen påtager sig intet ansvar for, at de viste adviseringer inkluderer samtlige relevante pligter for virksomheden. Det er til enhver tid ledelsen i virksomhedens ansvar, at virksomheden er korrekt registreret for pligter i forhold til det offentlige.</li>
                            <li>Hvis Erhvervsstyrelsen har begrundet mistanke om, at løsningen er blevet misbrugt, eller at den vil blive misbrugt, kan styrelsen med øjeblikkelig virkning lukke brugerens adgang til løsningen. Hvis det drejer sig om en bruger, der anvender en medarbejdersignatur, kan styrelsen lukke samtlige brugere, der anvender en signatur tilknyttet den pågældende virksomhed.</li>
                        </ol>

                            <fieldset>
                                <legend>Godkendelse</legend>
                                <div class="form-group">
                                    <div class="checkbox">
                                        <label>
                                            <input type="checkbox" value=""/>
                                            Jeg accepterer betingelserne for brug <span class="required">*</span>
                                        </label>
                                    </div>
                                </div>
                            </fieldset>

                            <fieldset>
                                <legend>Ejerforhold</legend>
                                <div class="form-group">
                                    <label for="virksomheds-navn">Virksomhedens navn <span class="required">*</span></label>
                                    <div class="required-enabled">
                                        <input type="text" class="form-control" id="virksomheds-navn"/>
                                        <div class="description">F.eks "Min forretning" <a data-content="Skriv navnet på den virksomhed, du ønsker at oprette." data-placement="bottom" data-toggle="popover" class="help" data-original-title="" title="">Hjælp</a></div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="vej-gade">Gade/vej <span class="required">*</span></label>
                                    <div class="required-enabled">
                                        <input type="text" class="form-control" id="vej-gade"/>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-sm-4">
                                        <div class="form-group">
                                            <label for="husnummer">Husnummer <span class="required">*</span></label>
                                            <div class="required-enabled">
                                                <input type="text" class="form-control" id="husnummer"/>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-4">
                                        <div class="form-group">
                                            <label for="etage">Etage</label>
                                            <input type="text" class="form-control" id="etage"/>
                                        </div>
                                    </div>
                                    <div class="col-sm-4">
                                        <div class="form-group">
                                            <label for="side">Side</label>
                                            <input type="text" class="form-control" id="side"/>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-sm-4">
                                        <div class="form-group">
                                            <label for="postnr">Postnummer <span class="required">*</span></label>
                                            <div class="required-enabled">
                                                <input type="text" class="form-control" id="postnr"/>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-8">
                                        <div class="form-group">
                                            <div class="required-enabled">
                                                <label for="by">By <span class="required">*</span></label>
                                                <input type="text" class="form-control" id="by"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="co">c/o</label>
                                    <input type="text" class="form-control" id="co"/>
                                </div>
                                <h2>Kontaktoplysninger</h2>
                                <div class="row">
                                    <div class="col-sm-6">
                                        <div class="form-group">
                                            <label for="telefon">Telefon <span class="required">*</span></label>
                                            <div class="required-enabled">
                                                <input type="text" class="form-control" id="telefon"/>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-6">
                                        <div class="form-group">
                                            <div class="required-enabled">
                                                <label for="mobilnummer">Mobilnummer <span class="required">*</span></label>
                                                <input type="text" class="form-control" id="mobilnummer"/>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-6">
                                        <div class="form-group">
                                            <div class="required-enabled">
                                                <label for="e-mail">E-mail <span class="required">*</span></label>
                                                <input type="text" class="form-control" id="e-mail"/>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-6">
                                        <div class="form-group">
                                            <label for="hjemmeside">Hjemmeside</label>
                                            <input type="text" class="form-control" id="hjemmeside"/>
                                        </div>
                                    </div>
                                </div>

                                <h2>Reklamebeskyttelse</h2>
                                <div class="row">
                                    <div class="col-sm-12">
                                        <div class="form-group">
                                            <div class="checkbox">
                                                <label>
                                                    <input type="checkbox" title="Jeg ønsker at reklamebeskytte min virksomhed" value=""/>
                                                    Jeg ønsker at reklamebeskytte min virksomhed
                                                </label>
                                            </div>
                                            <div class="description"><a data-content="Når du vælger reklamebeskyttelse, vil du ikke få tilsendt reklamer til de adresser, du tilknytter din virksomhed" data-placement="bottom" data-toggle="popover" role="button" class="help" data-original-title="" title="">Hjælp</a></div>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                        <div class="buttons">
                            <a id="previous" class="btn btn-primary button-prev pull-left" href="#">Forrige</a>
                            <a id="next" class="btn btn-primary button-next pull-right" href="#">Næste</a>
                            <a id="submit" class="btn btn-primary pull-right" href="#Send">Indsend </a>
                            <div class="clearfix"></div>
                        </div>
                    </div>
                </div>

                <div class="clearfix"></div>

            </div>

            <!-- Page content end -->
        </div>
        <!-- Main content end -->


        <div class="clearfix"></div>

        <!-- Main content wrapper (three-col) end -->
    </div>            
            
            
    <div class="footer visible-xs">
        <div class="container">
            <div class="row">
                <div class="col-xs-12 inner-details">
                    <xsl:if test="contact">
                        <xsl:element name="a">
                            <xsl:attribute name="class">solution-author-link</xsl:attribute>
                            <xsl:attribute name="href"><xsl:value-of select="contact/@link"/></xsl:attribute>
                            <xsl:value-of select="contact" /> <span> &#8250;</span>
                        </xsl:element>
                        <div class="contact">
                            Support: <span class="solution-author-phone"><xsl:value-of select="contact/@phone" /></span>
                            <span class="divider">|</span>
                            <xsl:element name="a">
                                <xsl:attribute name="class">solution-author-email</xsl:attribute>
                                <xsl:attribute name="href">mailto:<xsl:value-of select="contact/@email"/></xsl:attribute>
                                E-mail <span>&#8250;</span>
                            </xsl:element>
                        </div>
                    </xsl:if>
                </div>
                <div class="col-xs-12 logo-container">
                    <a href="">
                        <img src="http://designmanual.virk.dk/virkdesign/designmanualv2/graphics/logo-top.png" height="57" width="240" alt="Virk / Indberetning - logo" class="logo" />
                    </a>
                </div>
            </div>
        </div>
    </div>            
            
			     
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
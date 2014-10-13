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
                <script type="text/javascript" charset="ISO-8859-1" src="//code.jquery.com/ui/1.11.0/jquery-ui.min.js"></script>

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

                <link href="/modules/formular/css/virk/v2.1/css/bootstrap.min.css" rel="stylesheet" media="screen" />
                <link href="/modules/formular/css/virk/v2.1/css/designmanual.css" rel="stylesheet" media="screen, print" />
                <link href="/modules/formular/css/virk/v2.1/css/component.css" rel="stylesheet" media="screen" />

                <link rel="Stylesheet" type="text/css" href="//code.jquery.com/ui/1.11.0/themes/smoothness/jquery-ui.css"></link>

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
                
                <script type="text/javascript" src="/modules/formular/css/virk/v2.1/js/bootstrap.min.js"></script>
                <script type="text/javascript" src="/modules/formular/css/virk/v2.1/js/modernizr.custom.js"></script>
                <script type="text/javascript" src="/modules/formular/css/virk/v2.1/js/jquery.dlmenu.js"></script>
                <script type="text/javascript" src="/modules/formular/css/virk/v2.1/js/common.js"></script>


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

                    jQuery('div#receipt').hide();

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
                        <a href="http://virk.dk">
                            <img src="/modules/formular/css/virk/v2.1/graphics/logo-top.png" height="57" width="240" alt="Virk / Indberetning - logo" class="logo" />
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
                <div class="stepscontainer visible-xs">
                    <button class="btn btn-steps visible-xs" type="button" data-toggle="collapse" data-target=".nav-collapse"><span id="steps">Trin 1 af 5</span> <span class="caret"></span></button>
                </div>
            </div>
        </div>
        <!-- Mobile menu, Open step guide, end -->
        <!-- Main content wrapper start -->
        <div id="form" class="content row">
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

                <div class="row">
                    <div id="content" class="col-xs-12 content-loading">
                        <div class="content-loading-div"><div>Indlæser formular...</div></div>
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
        
        
        <div id="receipt" class="content row">
            <div class="col-sm-9 main-content">
                <!-- Hidden link for accesibility -->
                <a id="contentstart" class="hide">Indhold start</a>
                <!-- Page content start -->
    
                <div class="row">
                    <div id="finalmessage" class="col-xs-12">
                        <div id="messageloading" class="alert alert-warning"></div>
                        <div id="message"></div>
                        <div id="submessage"></div>
                    </div>
                </div>
    
                <div class="clearfix"></div>
    
            </div>
        </div>
        

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
                    <a href="http://virk.dk">
                        <img src="/modules/formular/css/virk/v2.1/graphics/logo-top.png" height="57" width="240" alt="Virk / Indberetning - logo" class="logo" />
                    </a>
                </div>
            </div>
        </div>
    </div>            
            
    <xsl:if test="virkid">
        <script>
           var _eOGsTM = {
               diaID      : '<xsl:value-of select="virkid" />', // Dia formular ID
               test       : <xsl:choose><xsl:when test="virkid/@test = 'false'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>       // False in production, true in test
           };
           (function(d,p,s){var e=d.createElement('script'),b=d.getElementsByTagName(p)[0];e.src=s+'/components/requirejs/require.js';e.setAttribute('data-main', s+'/scripts/eostm');b.appendChild(e)}(document,'body','//counter.virk.dk'));
        </script>
        <noscript><xsl:element name="img">
               <xsl:attribute name="alt"></xsl:attribute>
               <xsl:attribute name="height">1</xsl:attribute>
               <xsl:attribute name="width">1</xsl:attribute>
               <xsl:attribute name="src">//counter.virk.dk/tns.png?DiaID=<xsl:value-of select="virkid" />&amp;status=start</xsl:attribute>
           </xsl:element></noscript>              
    </xsl:if>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
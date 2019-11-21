<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:output method="html" indent="yes" encoding="[cbinfo.html.encoding]" />

    <!-- nye nemlogin parametre som kommer fra signeringen-->
    <xsl:param name = "RequestId"></xsl:param>
    <xsl:param name = "string_params"/>
    <xsl:param name = "SignedSignatureProof"/>
    <xsl:param name = "SignText"/>

    <xsl:param name = "formular"/>
    <xsl:param name = "sessionid"/>
    <xsl:param name = "formular-css">/modules/formular/css/formular.css</xsl:param>
    <xsl:param name = "s4.version">[s4.version]</xsl:param>
    <xsl:param name = "s4.search.script">[s4.search.script]</xsl:param>
    <xsl:param name = "s4.search.css">[s4.search.css]</xsl:param>
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
                <link rel="Stylesheet" type="text/css" href="/modules/formular/css/skin.css"></link>
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

                <xsl:if test="*//septimasearch and not($s4.version = '['+'s4.version'+']')">
                    <script type="text/javascript" src="//common.cdn.septima.dk/1.0.7/js/septima.js"></script>
                    <script type="text/javascript" src="//common.cdn.septima.dk/1.0.7/js/log.js"></script>
                    <xsl:element name="script">
                        <xsl:attribute name="language">javascript</xsl:attribute>
                        <xsl:attribute name="src"><xsl:value-of select="$s4.search.script"/></xsl:attribute>
                        <xsl:attribute name="type">text/javascript</xsl:attribute>
                    </xsl:element>
                    <xsl:element name="script">
                        <xsl:attribute name="rel">Stylesheet</xsl:attribute>
                        <xsl:attribute name="href"><xsl:value-of select="$s4.search.css"/></xsl:attribute>
                        <xsl:attribute name="type">text/css</xsl:attribute>
                    </xsl:element>
                </xsl:if>

                <xsl:for-each select="js">
                    <xsl:element name="script">
                        <xsl:attribute name="language">javascript</xsl:attribute>
                        <xsl:attribute name="src"><xsl:value-of select="."/></xsl:attribute>
                        <xsl:attribute name="type">text/javascript</xsl:attribute>
                    </xsl:element>
                </xsl:for-each>

                <script type="text/javascript" language="javascript">
                jQuery(function () {
                    formular = new Formular ({
                        bootstrap: true,
                        name: '<xsl:value-of select="$formular"/>',
                        sessionid:'<xsl:value-of select="$sessionid"/>',
                        _listeners: formular._listeners
                    });
                });
                </script>
            </head>
            <body>
            
            
    <a href="#contentstart" class="hide">Gå direkte til indhold</a>

    <xsl:choose>
        <xsl:when test="headerhtml">
            <xsl:choose>
                <xsl:when test="headerhtml[@url]">
                    <header class="navbar skin"></header>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="headerhtml" />
                </xsl:otherwise>
            </xsl:choose>
        </xsl:when>
        <xsl:otherwise>

            <header class="navbar">
                <div class="top hidden">
                    <div class="container">
                        <div class="row">
                            <!--<div class="col-sm-8 col-xs-12">-->
                            <!--<a href="http://virk.dk">-->
                            <!--<img src="/modules/formular/css/virk/v2.1/graphics/logo-top.png" height="57" width="240" alt="Virk / Indberetning - logo" class="logo" />-->
                            <!--</a>-->
                            <!--</div>-->
                            <div class="col-xs-4 align-right nav-tools hidden-xs">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="topbar hidden-xs">
                    <div class="container">
                        <div class="row">
                            <div class="col-xs-8 info">
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

        </xsl:otherwise>
    </xsl:choose>



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
                <ul class="nav style-2 nav-collapse collapse navlist" ></ul>
            </div>

            <!-- Main content start -->
            <div class="col-sm-9 main-content">
                <!-- Hidden link for accesibility -->
                <a id="contentstart" class="hide">Indhold start</a>

                <div class="row">
                    <div id="content" class="col-xs-12 content-loading">
                        <div class="content-loading-div"><div>Indlæser formular...</div></div>
                        <div class="buttons">
                            <button id="previous" class="btn btn-primary button-prev pull-left">Forrige</button>
                            <button id="next" class="btn btn-primary button-next pull-right">Næste</button>
                            <button id="submit" class="btn btn-primary pull-right">
                                <xsl:choose>
                                    <xsl:when test="submitbutton">
                                        <xsl:value-of select="submitbutton/@displayname" />
                                    </xsl:when>
                                    <xsl:otherwise>
                                        Indsend
                                    </xsl:otherwise>
                                </xsl:choose>
                            </button>
                            <div class="clearfix"></div>
                        </div>
                    </div>
                </div>

                <div class="clearfix"></div>

            </div>

            <!-- Page content end -->
        </div>
        <!-- Main content end -->
        
        
        <div id="receipt" class="content row" style="display:none;">
            <div class="col-sm-9 main-content">
                <!-- Hidden link for accesibility -->
                <a id="contentstart" class="hide">Indhold start</a>
                <!-- Page content start -->
    
                <div class="row">
                    <div id="finalmessage" class="col-xs-12">
                        <div id="messageloading" class="alert alert-warning"></div>
                        <div id="message"></div>
                        <div id="submessage"></div>

                        <div id="messagebuttons" class="buttons">
                            <button class="btn btn-primary pull-right">
                                test
                            </button>
                            <div class="clearfix"></div>
                        </div>

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
                <!--<div class="col-xs-12 logo-container">-->
                    <!--<a href="http://virk.dk">-->
                        <!--<img src="/modules/formular/css/virk/v2.1/graphics/logo-top.png" height="57" width="240" alt="Virk / Indberetning - logo" class="logo" />-->
                    <!--</a>-->
                <!--</div>-->
            </div>
        </div>
    </div>            
            
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>

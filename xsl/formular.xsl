<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
   version="1.0"
   xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output
    method="html"
    version="1.0"
    encoding="[cbinfo.html.encoding]"
    indent="yes"
    doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
    doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
/>
<!-- nye nemlogin parametre som kommer fra signeringen-->
<xsl:param name = "RequestId"></xsl:param>
<xsl:param name = "string_params"/>
<xsl:param name = "SignedSignatureProof"/>
<xsl:param name = "SignText"/>

<xsl:param name = "formular"/>
<xsl:param name = "sessionid"/>
<xsl:param name = "formular-css">/modules/formular/css/formular.css</xsl:param>
<xsl:param name = "s4.version">[s4.version]</xsl:param>
<xsl:param name = "s4.search.script">[s4.search.version]/septimasearch.min.js</xsl:param>
<xsl:param name = "s4.search.css">[s4.search.version]/css/defaultView.css</xsl:param>

<xsl:decimal-format decimal-separator="," grouping-separator="." />

    <xsl:template match="/">
        <xsl:apply-templates select="config/formular[@name=$formular]"/>
    </xsl:template>
    <xsl:template match="formular[@name=$formular]">
        <html>
            <head>
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <xsl:choose>
                    <xsl:when test="title">
                        <title><xsl:value-of select="title" /></title>
                    </xsl:when>
                    <xsl:otherwise>
                        <title><xsl:value-of select="header" /></title>
                    </xsl:otherwise>
                </xsl:choose>
                <xsl:variable name="cbinfo.jslib.jquery">[cbinfo.jslib.jquery]</xsl:variable>
                <xsl:choose>
                    <xsl:when test="substring($cbinfo.jslib.jquery,0,2) = '['">
                        <script type="text/javascript" charset="ISO-8859-1" src="/js/standard/jquery/jquery-1.6.2.min.js"></script>
                    </xsl:when>
                    <xsl:otherwise>
                        <script type="text/javascript" charset="ISO-8859-1" src="[cbinfo.jslib.jquery]"></script>
                    </xsl:otherwise>
                </xsl:choose>
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

                <script src="https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@main/dist/en/v[module.formular.olversion]/build/ol.js"></script>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@main/dist/en/v[module.formular.olversion]/css/ol.css" type="text/css"></link>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.7.5/proj4.min.js"></script>

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
                <script language="javascript" src="[cbinfo.js.url]/standard/proj4js/proj4js-compressed.js" type="text/javascript"></script>
                <script language="javascript" src="/modules/formular/js/jquery.valid8.js" type="text/javascript"></script>
                <script language="javascript" src="/modules/formular/js/store.js" type="text/javascript"></script>
                <script language="javascript" src="/modules/formular/js/json2.js" type="text/javascript"></script>
                <script language="javascript" src="/modules/formular/js/formular.js" type="text/javascript"></script>

                <xsl:if test="*//septimasearch and not($s4.version = '['+'s4.version'+']')">
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
                <xsl:if test="$RequestId != ''">
                var nemlogin = {
                    ssp: '<xsl:value-of select="$SignedSignatureProof"/>',
                    reqid: '<xsl:value-of select="$RequestId"/>',
                    signtext: '<xsl:value-of select="$SignText"/>',
                    url_params: '<xsl:value-of select="$string_params"/>'
                };</xsl:if>

                var formular;
                jQuery(function () {
                    formular = new Formular ({
                        name: '<xsl:value-of select="$formular"/>',
                        sessionid:'<xsl:value-of select="$sessionid"/>'
                    });
                });
                </script>
            </head>
            <body>
                <div class="formular_content">
                    <div id="message"><div id="messageloading" class="messagetext"></div><div id="messagetext" class="messagetext"></div><div id="messagebuttons" class="messagebuttons"></div></div>
                    <div id="content">
                        <div class="header"><xsl:value-of select="header" disable-output-escaping="yes"/></div>
                        <div class="subheader"><xsl:value-of select="subheader" disable-output-escaping="yes"/></div>
                        <xsl:if test="help">
                        <div class="helpbutton"><xsl:value-of select="help/@displayname" disable-output-escaping="yes"/></div>
                        </xsl:if>
                    </div>
                    <xsl:if test="help">
                    <div class="help">
                        <div id="helptext" class="messagetext"><xsl:value-of select="help" disable-output-escaping="yes"/></div>
                        <div id="helpbuttons" class="messagebuttons"></div>
                    </div>
                    </xsl:if>
                </div>
                <div id="loading">
					<table height="100%" width="100%" align="center">
					    <tr>
					        <td align="center">
					             <div class="loading">Henter formular</div>
					        </td>
					    </tr>
					</table>
			     </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
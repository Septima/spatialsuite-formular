<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <xsl:output encoding="ISO-8859-1"/> 

  <xsl:param name="sessionid"/>
  <xsl:param name="guid"><xsl:value-of select="$sessionid"></xsl:value-of> </xsl:param>
  <xsl:param name="logo">[module:formular.dir]/images/byvaaben.jpg</xsl:param>
  
  <xsl:param name="date"></xsl:param>

  <xsl:param name="hvad">IKKE ANGIVET</xsl:param>
  <xsl:param name="konflikttekst1">INTET FUNDET</xsl:param>
  <xsl:param name="areal">0</xsl:param>
  <xsl:param name="udnyttelse">IKKE ANGIVET</xsl:param>
  <xsl:param name="draenet">IKKE ANGIVET</xsl:param>
  <xsl:param name="begrundelse">IKKE ANGIVET</xsl:param>
  <xsl:param name="navn">IKKE ANGIVET</xsl:param>
  <xsl:param name="email">IKKE ANGIVET</xsl:param>
  <xsl:param name="tlf">IKKE ANGIVET</xsl:param>
  <xsl:param name="traeffetid">IKKE ANGIVET</xsl:param>
  
  <!--xmlns:exsl="urn:schemas-microsoft-com:xslt"-->
  <!--xmlns:exsl="http://xml.apache.org/xalan"-->
  
  <xsl:decimal-format decimal-separator = "," grouping-separator = "." NaN=" "/> 
    
  <xsl:attribute-set name="fixed-cell">
    <xsl:attribute name="overflow">hidden</xsl:attribute>
    <xsl:attribute name="wrap-option">no-wrap</xsl:attribute>
    <xsl:attribute name="padding-end">3pt</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="thisfont">
    <xsl:attribute name="font-family">arial</xsl:attribute>
    <xsl:attribute name="font-size">12pt</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="fixed-cell-header" >
    <xsl:attribute name="overflow">hidden</xsl:attribute>
    <xsl:attribute name="wrap-option">no-wrap</xsl:attribute>
    <xsl:attribute name="font-weight">bold</xsl:attribute>
    <xsl:attribute name="padding-end">3pt</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="header-cell" >
    <xsl:attribute name="border-after-width">0.5pt</xsl:attribute>
    <xsl:attribute name="border-after-color">black</xsl:attribute>
    <xsl:attribute name="border-after-style">solid</xsl:attribute>
    <xsl:attribute name="margin-left">1mm</xsl:attribute>
    <xsl:attribute name="wrap-option">nowrap</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="normal-cell" >
    <xsl:attribute name="margin-left">1mm</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="sum-cell" >
    <xsl:attribute name="border-after-width">1pt</xsl:attribute>
    <xsl:attribute name="border-after-color">black</xsl:attribute>
    <xsl:attribute name="border-after-style">double</xsl:attribute>
    <xsl:attribute name="margin-left">1mm</xsl:attribute>
    <xsl:attribute name="wrap-option">nowrap</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="footer-cell" >
<!--    <xsl:attribute name="border-before-width">0.5pt</xsl:attribute>-->
<!--    <xsl:attribute name="border-before-color">black</xsl:attribute>-->
<!--    <xsl:attribute name="border-before-style">solid</xsl:attribute>-->
<!--    <xsl:attribute name="margin-left">1mm</xsl:attribute>-->
    <xsl:attribute name="wrap-option">nowrap</xsl:attribute>
    <xsl:attribute name="font-size">8pt</xsl:attribute>
  </xsl:attribute-set>

    <xsl:template match="/">
        <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
            <fo:layout-master-set>
                <fo:simple-page-master master-name="all" page-height="29.7cm" page-width="21cm" margin-top="1cm" margin-bottom="1cm" margin-left="1.0cm" margin-right="1.0cm">
                    <fo:region-before extent="5mm" overflow="hidden"/>
                    <fo:region-body margin-top="5mm" margin-bottom="5mm"/>
                    <fo:region-after extent="5mm"/>
<!--                     <fo:region-after extent="5mm" border-top="0.1pt solid black"/> -->
                </fo:simple-page-master>
            </fo:layout-master-set>
            <fo:page-sequence master-reference="all" 
                xsl:use-attribute-sets="thisfont">
                <fo:static-content flow-name="xsl-region-before">
                </fo:static-content>
                <fo:static-content flow-name="xsl-region-after">
                    <xsl:call-template name="report-page-footer">
                        <xsl:with-param name="guid" select="$guid"/>
                    </xsl:call-template>
                </fo:static-content>
                <fo:flow flow-name="xsl-region-body">
                    <xsl:call-template name="bodyTemplate"/>
                </fo:flow>
            </fo:page-sequence>
        </fo:root>
    </xsl:template>

    <xsl:template name="bodyTemplate">
        <xsl:call-template name="reportheader">
            <xsl:with-param name="date" select="$date"/>
        </xsl:call-template>
    
        <fo:block>
            <xsl:attribute name="margin-top">50mm</xsl:attribute>
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            Ansøgning om <xsl:value-of select="$hvad"/>.
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            Det ansøgte vandhul berører:
        </fo:block>
        <fo:block linefeed-treatment="preserve">
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            <xsl:value-of select="$konflikttekst1"/>
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            Det ansøgte areal udgør <xsl:value-of select="$areal"/> m2 og benyttes i dag til <xsl:value-of select="$udnyttelse"/>.
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            Arealet er <xsl:value-of select="$draenet"/>.
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">10mm</xsl:attribute>
            Begrundelse for ansøgningen:
        </fo:block>
        <fo:block linefeed-treatment="preserve">
            <xsl:value-of select="$begrundelse"/>
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            Navn: <xsl:value-of select="$navn"/>
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            E-mail: <xsl:value-of select="$email"/>
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            Telefonnr.: <xsl:value-of select="$tlf"/>
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            Træffetid: <xsl:value-of select="$traeffetid"/>
        </fo:block>
        
        <fo:block page-break-before="always">
            <xsl:attribute name="margin-top">30mm</xsl:attribute>
            Bilag kort i 1:<xsl:value-of select="format-number(//row/col[@name='scale'], '#')"/>
        </fo:block>
        <fo:block>
            <fo:external-graphic height="150mm" width="190mm" content-height="150mm" content-width="190mm">
                <xsl:attribute name="src">url('[cbinfo.wwwroot.dir]/tmp/<xsl:value-of select="//row/col[@name='img']"/>')</xsl:attribute>
            </fo:external-graphic>
        </fo:block>
        <fo:block>
            
        </fo:block>
        
    </xsl:template>

    <xsl:template name="reportheader">
        <xsl:param name="date"/>
    <fo:table table-layout="fixed" break-before="page">
        <fo:table-column column-width="50%"/>
        <fo:table-column column-width="50%"/>
        <fo:table-body>
            <fo:table-row>
                <fo:table-cell 
                     height="25mm" border="0.1pt solid black"  border-end-style="none" padding="1mm">
                    <fo:block margin="1pt" font-weight="bold" font-size="15pt">
                        Randers Kommune
                    </fo:block>
                </fo:table-cell>
                <fo:table-cell 
                     height="25mm" border="0.1pt solid black" border-start-style="none" padding="1mm">
                    <fo:block text-align="end">
                   <fo:block text-align="end">
                       <fo:external-graphic height="25mm" width="22mm" 
                           content-height="25mm" content-width="22mm">
                           <xsl:attribute name="src">url('<xsl:value-of 
                               select="$logo"/>')</xsl:attribute>
                       </fo:external-graphic>
                   </fo:block>
                    </fo:block>
                </fo:table-cell>
            </fo:table-row>
        </fo:table-body>
    </fo:table>
    <fo:block margin="1pt" font-size="12pt"><xsl:value-of select="$date"/></fo:block>

  </xsl:template>

    <xsl:template name="report-page-footer">
      <xsl:param name="guid" select="''"/>
        <fo:table width="100%">
            <fo:table-column/>
            <fo:table-column/>
            <fo:table-column/>
            <fo:table-body>
                <fo:table-row>
                    <fo:table-cell margin="3mm" width="10%">
                    </fo:table-cell>
                    <fo:table-cell margin="3mm" width="90%" 
                        xsl:use-attribute-sets="footer-cell">
                        <fo:block text-align="right">Ref: <xsl:value-of select="$guid"/></fo:block>
                    </fo:table-cell>
                </fo:table-row>
            </fo:table-body>
        </fo:table>
    </xsl:template>
    
</xsl:stylesheet>

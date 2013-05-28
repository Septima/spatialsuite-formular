<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <xsl:output encoding="ISO-8859-1"/> 

  <xsl:param name="sessionid"/>
  <xsl:param name="guid"><xsl:value-of select="$sessionid"></xsl:value-of></xsl:param>
  
  <xsl:param name="header">[module.formular.pdf.header]</xsl:param>
  <xsl:param name="logo">[module.formular.pdf.logo]</xsl:param>
  <xsl:param name="nomap">false</xsl:param>
  
  <xsl:param name="date"></xsl:param>

  <xsl:param name="about">-</xsl:param>
  <xsl:param name="area">0</xsl:param>
  <xsl:param name="name">-</xsl:param>
  <xsl:param name="email">-</xsl:param>
  <xsl:param name="phone">-</xsl:param>
  
  <xsl:param name="val0">-</xsl:param>
  <xsl:param name="val1">-</xsl:param>
  <xsl:param name="val2">-</xsl:param>
  <xsl:param name="val3">-</xsl:param>
  <xsl:param name="val4">-</xsl:param>
  <xsl:param name="val5">-</xsl:param>
  <xsl:param name="val6">-</xsl:param>
  <xsl:param name="val7">-</xsl:param>
  <xsl:param name="val8">-</xsl:param>
  <xsl:param name="val9">-</xsl:param>
  
  <xsl:param name="val0_displayname"></xsl:param>
  <xsl:param name="val1_displayname"></xsl:param>
  <xsl:param name="val2_displayname"></xsl:param>
  <xsl:param name="val3_displayname"></xsl:param>
  <xsl:param name="val4_displayname"></xsl:param>
  <xsl:param name="val5_displayname"></xsl:param>
  <xsl:param name="val6_displayname"></xsl:param>
  <xsl:param name="val7_displayname"></xsl:param>
  <xsl:param name="val8_displayname"></xsl:param>
  <xsl:param name="val9_displayname"></xsl:param>
  
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
            <xsl:value-of select="$about"/>
        </fo:block>
        <xsl:if test="number($area)&gt;0">
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            Det ansøgte areal udgør <xsl:value-of select="$area"/> m2.
        </fo:block>
        </xsl:if>
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            Navn: <xsl:value-of select="$name"/>
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            E-mail: <xsl:value-of select="$email"/>
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            Telefonnr.: <xsl:value-of select="$phone"/>
        </fo:block>

        <fo:block>
            <xsl:attribute name="margin-top">10mm</xsl:attribute>
        </fo:block>

        <xsl:if test="$val0!='-'">
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            <xsl:value-of select="$val0_displayname"/><xsl:text> </xsl:text><xsl:value-of select="$val0"/>
        </fo:block>
        </xsl:if>
        <xsl:if test="$val1!='-'">
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            <xsl:value-of select="$val1_displayname"/><xsl:text> </xsl:text><xsl:value-of select="$val1"/>
        </fo:block>
        </xsl:if>
        <xsl:if test="$val2!='-'">
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            <xsl:value-of select="$val2_displayname"/><xsl:text> </xsl:text><xsl:value-of select="$val2"/>
        </fo:block>
        </xsl:if>
        <xsl:if test="$val3!='-'">
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            <xsl:value-of select="$val3_displayname"/><xsl:text> </xsl:text><xsl:value-of select="$val3"/>
        </fo:block>
        </xsl:if>
        <xsl:if test="$val4!='-'">
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            <xsl:value-of select="$val4_displayname"/><xsl:text> </xsl:text><xsl:value-of select="$val4"/>
        </fo:block>
        </xsl:if>
        <xsl:if test="$val5!='-'">
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            <xsl:value-of select="$val5_displayname"/><xsl:text> </xsl:text><xsl:value-of select="$val5"/>
        </fo:block>
        </xsl:if>
        <xsl:if test="$val6!='-'">
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            <xsl:value-of select="$val6_displayname"/><xsl:text> </xsl:text><xsl:value-of select="$val6"/>
        </fo:block>
        </xsl:if>
        <xsl:if test="$val7!='-'">
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            <xsl:value-of select="$val7_displayname"/><xsl:text> </xsl:text><xsl:value-of select="$val7"/>
        </fo:block>
        </xsl:if>
        <xsl:if test="$val8!='-'">
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            <xsl:value-of select="$val8_displayname"/><xsl:text> </xsl:text><xsl:value-of select="$val8"/>
        </fo:block>
        </xsl:if>
        <xsl:if test="$val9!='-'">
        <fo:block>
            <xsl:attribute name="margin-top">6mm</xsl:attribute>
            <xsl:value-of select="$val9_displayname"/><xsl:text> </xsl:text><xsl:value-of select="$val9"/>
        </fo:block>
        </xsl:if>





        <fo:block>
        <xsl:if test="$nomap='true'">
	        <fo:block page-break-before="always">
	            <xsl:attribute name="margin-top">30mm</xsl:attribute>
	            Bilag kort i 1:<xsl:value-of select="format-number(//row/col[@name='scale'], '#')"/>
	        </fo:block>
	        <fo:block>
	            <fo:external-graphic height="150mm" width="190mm" content-height="150mm" content-width="190mm">
	                <xsl:attribute name="src">url('[cbinfo.wwwroot.dir]/tmp/<xsl:value-of select="//row/col[@name='img']"/>')</xsl:attribute>
	            </fo:external-graphic>
	        </fo:block>
        </xsl:if>
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
                     height="15mm" border-bottom="0.1pt solid black"  border-end-style="none" padding="1mm">
                    <fo:block margin="1pt" font-weight="bold" font-size="15pt">
                        <xsl:value-of select="$header"/>
                    </fo:block>
                </fo:table-cell>
                <fo:table-cell 
                     height="15mm" border-bottom="0.1pt solid black" border-start-style="none" padding="1mm">
                    <fo:block text-align="end">
                   <fo:block text-align="end">
                       <fo:external-graphic height="15mm" width="56mm" 
                           content-height="15mm" content-width="56mm">
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

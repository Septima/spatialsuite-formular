<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <xsl:output encoding="ISO-8859-1"/> 

  <xsl:param name="sessionid"/>
  <xsl:param name="guid"><xsl:value-of select="$sessionid"></xsl:value-of> </xsl:param>
  <xsl:param name="logo">[module:formular.dir]/images/byvaaben.jpg</xsl:param>
  <xsl:param name="logo2">[module:formular.dir]/images/randerskommune.jpg</xsl:param>
  
  <xsl:param name="date"></xsl:param>
  
  <xsl:param name="address">Ikke oplyst</xsl:param>
  <xsl:param name="hvad">Ikke oplyst</xsl:param>
  <xsl:param name="konflikttekst1">Ingen ejendomme fundet</xsl:param>
  <xsl:param name="areal">0</xsl:param>
  <xsl:param name="anvendelse">Ikke oplyst</xsl:param>
  <xsl:param name="arbejdsopgave">Ikke oplyst</xsl:param>
  <xsl:param name="date1">Ikke oplyst</xsl:param>
  <xsl:param name="date2">Ikke oplyst</xsl:param>
  <xsl:param name="antal_dage">Ikke oplyst</xsl:param>
  <xsl:param name="navn">Ikke oplyst</xsl:param>
  <xsl:param name="email">Ikke oplyst</xsl:param>
  <xsl:param name="tlf">Ikke oplyst</xsl:param>
  <xsl:param name="pris">Ikke oplyst</xsl:param>
  
  <xsl:decimal-format decimal-separator = "," grouping-separator = "." NaN=" "/> 
    
  <xsl:attribute-set name="fixed-cell">
    <xsl:attribute name="overflow">hidden</xsl:attribute>
    <xsl:attribute name="wrap-option">no-wrap</xsl:attribute>
    <xsl:attribute name="padding-end">3pt</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="thisfont">
    <xsl:attribute name="font-family">arial</xsl:attribute>
    <xsl:attribute name="font-size">10pt</xsl:attribute>
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
                <fo:simple-page-master master-name="all" page-height="29.7cm" page-width="21cm" margin-top="0.3cm" margin-bottom="1cm" margin-left="2.1cm" margin-right="1cm">
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
    
        <fo:block font-weight="bold" font-size="15pt">
            <xsl:attribute name="margin-top">26mm</xsl:attribute>
            Ansøgning om opstilling af stillads, lift eller kran.
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">15mm</xsl:attribute>
            Ansøgningsadresse: <xsl:value-of select="$address"/>
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">3mm</xsl:attribute>
            Det ansøgte areal berører:
        </fo:block>
        <fo:block linefeed-treatment="preserve">
            <xsl:attribute name="margin-top">0mm</xsl:attribute>
            <xsl:value-of select="$konflikttekst1"/>
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">3mm</xsl:attribute>
            Det ansøgte areal udgør: <xsl:value-of select="$areal"/> m2.
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">3mm</xsl:attribute>
            Der søges om opstilling af: <xsl:value-of select="$hvad"/>.
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">3mm</xsl:attribute>
            Arealet anvendes normalt til: <xsl:value-of select="$anvendelse"/>.
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">3mm</xsl:attribute>
            Arbejdsopgave: <xsl:value-of select="$arbejdsopgave"/>.
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">3mm</xsl:attribute>
            Opsætningsdato: <xsl:value-of select="$date1"/>
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">3mm</xsl:attribute>
            Nedtagningsdato: <xsl:value-of select="$date2"/>
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">3mm</xsl:attribute>
            Antal dage: <xsl:value-of select="$antal_dage"/>
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">3mm</xsl:attribute>
            Navn: <xsl:value-of select="$navn"/>
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">3mm</xsl:attribute>
            E-mail: <xsl:value-of select="$email"/>
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">3mm</xsl:attribute>
            Telefonnr.: <xsl:value-of select="$tlf"/>
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">10mm</xsl:attribute>
            Pris for lejeperioden: <xsl:value-of select="$pris"/> kr.
        </fo:block>
        <fo:block>
            <xsl:attribute name="margin-top">3mm</xsl:attribute>
            ID-nummer til betaling: <xsl:value-of select="$sessionid"/>
        </fo:block>
        
        <fo:block page-break-before="always">
            <xsl:attribute name="margin-top">30mm</xsl:attribute>
            Bilag kort i 1:<xsl:value-of select="format-number(//row/col[@name='scale'], '#')"/>
        </fo:block>
        <fo:block>
            <fo:external-graphic height="150mm" width="170mm" content-height="150mm" content-width="170mm">
                <xsl:attribute name="src">url('[cbinfo.wwwroot.dir]/tmp/<xsl:value-of select="//row/col[@name='img']"/>')</xsl:attribute>
            </fo:external-graphic>
        </fo:block>
        <fo:block>
            
        </fo:block>
        
    </xsl:template>

    <xsl:template name="reportheader">
        <xsl:param name="date"/>
    <fo:table table-layout="fixed" break-before="page">
        <fo:table-column column-width="79%"/>
        <fo:table-column column-width="21%"/>
        <fo:table-body>
            <fo:table-row>
                <fo:table-cell 
                     height="25mm" border="none"  border-end-style="none" padding="1mm">
                    <fo:block text-align="left">
                   <fo:block text-align="left">
                       <fo:external-graphic height="4mm" width="45mm" 
                           content-height="4mm" content-width="45mm">
                           <xsl:attribute name="src">url('<xsl:value-of 
                               select="$logo2"/>')</xsl:attribute>
                       </fo:external-graphic>
                   </fo:block>
                    </fo:block>
                    <fo:block font-weight="bold" font-size="10pt">
                        <xsl:attribute  name="margin-top">24mm</xsl:attribute>
                        <xsl:value-of select="$navn"/>
                    </fo:block>
                </fo:table-cell>
                <fo:table-cell 
                     height="50mm" border="none" border-start-style="none" padding="1mm">
                    <fo:block text-align="left">
                   <fo:block text-align="left">
                       <fo:external-graphic height="20mm" width="17mm" 
                           content-height="20mm" content-width="17mm">
                           <xsl:attribute name="src">url('<xsl:value-of 
                               select="$logo"/>')</xsl:attribute>
                       </fo:external-graphic>
                   </fo:block>
                    </fo:block>
                    <fo:block margin="1pt" font-weight="bold" font-size="8pt">
                        <xsl:attribute  name="margin-top">2mm</xsl:attribute>
                        Randers Kommune
                    </fo:block>
                    <fo:block margin="1pt" font-weight="bold" font-size="8pt">
                        <xsl:attribute  name="margin-top">0mm</xsl:attribute>
                        Miljø og Teknik
                    </fo:block>
                    <fo:block margin="1pt" font-weight="bold" font-size="8pt">
                        <xsl:attribute  name="margin-top">0mm</xsl:attribute>
                        Laksetorvet 1
                    </fo:block>
                    <fo:block margin="1pt" font-weight="bold" font-size="8pt">
                        <xsl:attribute  name="margin-top">0mm</xsl:attribute>
                        8900 Randers C
                    </fo:block>
                    <fo:block margin="1pt" font-weight="bold" font-size="8pt">
                        <xsl:attribute  name="margin-top">4mm</xsl:attribute>
                        Telefon +45 8915 1515
                    </fo:block>
                    <fo:block margin="1pt" font-weight="bold" font-size="8pt">
                        <xsl:attribute  name="margin-top">4mm</xsl:attribute>
                        www.randers.dk
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

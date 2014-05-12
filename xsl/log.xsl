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

<xsl:param name = "datasource"/>
<xsl:param name = "command"/>

<xsl:decimal-format decimal-separator="," grouping-separator="." />

    <xsl:template match="/">
        <html>
            <head>
                <title>Formular log</title>
                <meta name="HandheldFriendly" content="True"/>
                <meta name="MobileOptimized" content="320"/>
                <meta name="format-detection" content="telephone=no"/>
                <meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0"/>
                <meta http-equiv="cleartype" content="on"/>
                <meta name="apple-mobile-web-app-capable" content="yes"/>
                <meta name="apple-mobile-web-app-status-bar-style" content="black"/>
                <meta http-equiv="content-type" content="text/html; charset=[cbinfo.html.encoding]"/> 
                <meta charset="[cbinfo.html.encoding]"/>
                <link rel="stylesheet" type="text/css" href="/modules/formular/css/log.css" />
            </head>
            <body>
                <table class="width-100 bordered striped">
                    <thead class="thead-gray">
                        <tr>
	                        <xsl:for-each select="//row[1]/col">
	                            <th><xsl:value-of select="@name"/></th>
	                        </xsl:for-each>
                        </tr>
                    </thead>
                    <tbody>
				        <xsl:for-each select="//row">
				            <tr>
                                <xsl:for-each select="col">
                                    <td><xsl:value-of select="."/></td>
                                </xsl:for-each>
				            </tr>
				        </xsl:for-each>
                    </tbody>
                </table>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" version="1.0" encoding="[cbinfo.html.encoding]" indent="yes"
                doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
                doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"/>
    <xsl:decimal-format decimal-separator="," grouping-separator="."/>
    <xsl:template match="/">
        <html>
            <head>
            </head>
            <body>
                <xsl:element name="a">
                    <xsl:attribute name="href"><xsl:value-of select="//col[@name='url']"/></xsl:attribute>
                    <xsl:attribute name="target">_blank</xsl:attribute>
                    <xsl:value-of select="//col[@name='url']"/>
                </xsl:element>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>

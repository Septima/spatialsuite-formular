<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" version="1.0" encoding="[cbinfo.html.encoding]" indent="yes" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"/>
  <xsl:decimal-format decimal-separator="." grouping-separator="."/>

  <xsl:template match="/">
    <html>
      <head>
        <title>List of all available formular</title>
        <script type="text/javascript">
        </script>
      </head>
      <body>
        <xsl:for-each select="config/formular">
            <div>
                <xsl:element name="a">
                    <xsl:attribute name="href">/cbkort?page=formular&amp;formular=<xsl:value-of select="@name"/></xsl:attribute>
                    <xsl:value-of select="header"/>
                </xsl:element>
            </div>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>

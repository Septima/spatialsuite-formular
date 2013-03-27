<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:param name = "formular"/>
    
    <xsl:decimal-format decimal-separator="," grouping-separator="." />

    <xsl:output method="xml" version="1.0" encoding="UTF-8" indent="yes"/>
    <xsl:template match="/">
        <xsl:apply-templates select="config/formular[@name=$formular]"/>
    </xsl:template>
    <xsl:template match="formular[@name=$formular]">
        <xsl:copy-of select = "."/>
    </xsl:template>
</xsl:stylesheet>
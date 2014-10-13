<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:output method="text" indent="yes" encoding="[cbinfo.html.encoding]" />
    <xsl:param name="virkid">none</xsl:param>
    <xsl:param name="test">true</xsl:param>
    <xsl:param name="script">start</xsl:param>
    <xsl:template match="/">
      <xsl:if test="$virkid != 'none'">
        <xsl:if test="$script = 'start'">
           var _eOGsTM = {
               diaID      : '<xsl:value-of select="$virkid"/>', // Dia formular ID
               test       : <xsl:value-of select="$test"/>      // False in production, true in test
           };
           (function(d,p,s){var e=d.createElement('script'),b=d.getElementsByTagName(p)[0];e.src=s+'/components/requirejs/require.js';e.setAttribute('data-main', s+'/scripts/eostm');b.appendChild(e)}(document,'body','//counter.virk.dk'));
        </xsl:if>
        <xsl:if test="$script = 'complete'">
           var _eOGsTM = {
               diaID      : '<xsl:value-of select="$virkid"/>', // Dia formular ID
               test       : <xsl:value-of select="$test"/>      // False in production, true in test
           };
           (function(d,p,s){var e=d.createElement('script'),b=d.getElementsByTagName(p)[0];e.src=s+'/components/requirejs/require.js';_eOGsTM.status='completed';e.setAttribute('data-main', s+'/scripts/eostm');b.appendChild(e)}(document,'body','//counter.virk.dk'));
        </xsl:if>
      </xsl:if>
    </xsl:template>
</xsl:stylesheet>
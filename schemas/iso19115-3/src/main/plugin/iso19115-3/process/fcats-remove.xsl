<?xml version="1.0" encoding="UTF-8"?>
<!--  
Stylesheet used to update metadata for a service and 
detach a dataset metadata
-->
<xsl:stylesheet version="2.0"
                xmlns:mrc="http://standards.iso.org/19115/-3/mrc/1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:gn="http://www.fao.org/geonetwork">

  <xsl:param name="uuidref"/>

  <!-- Detach -->
  <!-- Remove attributes uuidref and xlink:href -->
  <xsl:template
      match="mrc:featureCatalogueCitation[@uuidref = $uuidref]"
      priority="20">
    <xsl:copy>
      <xsl:apply-templates select="node()"/>
    </xsl:copy>
  </xsl:template>


  <!-- Do a copy of every nodes and attributes -->
  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>

  <!-- Remove geonet:* elements. -->
  <xsl:template match="gn:*" priority="2"/>

</xsl:stylesheet>
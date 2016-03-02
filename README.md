spatialsuite-formular
================

Dette modul giver brugeren en formular, som f.eks. kan bruges til ansøgninger.

--------------------
VEJLEDNING TIL FORMULARMODULET
--------------------

En formular er en page i CBkort. Indholdet af formularen styres vha. en parameter i URL'en, der refererer til en helt specifik navngivet konfiguration. Formularen kaldes med:

http://sandkasse.randers.dk/cbkort?page=formular&formular=soe

Dette giver en side, der kan indlejres som en Iframe i et CMS system. Stylingen er derfor gjort meget enkelt, så den vil passe ind (næsten) hvor som helst.

http://sandkasse.randers.dk/cbkort?page=formular.skin&formular=soe

Dette giver en stand-alone side med et nyt og modernet design.

Installer modulet:
```xml
<module name="formular" dir="custom/formular" permissionlevel="public"/>
```

Konfigurationen er placeret vha. parameteren "module.formular.config", og er pt. sat i filen "cbinfo_k730.xml:
```xml
<param name="module.formular.config">[module:formular.dir]/config/formular_config.xml</param>
```

På grund af problemer i CBkort, er det nødvendigt at angive denne URL for alle sites
```xml
<param name="module.formular.site.url">http://localhost:8080</param> 
```


I filen er der angivet én eller flere formular konfigurationer. Hver konfiguration kan indeholde følgende:

```xml
    <formular name="soe">                                       <!-- name er navnet på formularen og refererer til værdien af URL-parameteren "formular" -->
        <title>Ansøgningsskema til vandhuller</title>           <!-- OPTIONAL - Angiver den tekst, der står som titel i browseren -->
        <header>Ansøgningsskema til vandhuller</header>         <!-- OPTIONAL - Angiver den tekst, der står øverst på siden -->
        <subheader>Ansøgning efter naturbeskyttelsesloven</subheader>            <!-- OPTIONAL - Angiver den tekst, der står under overskriften på siden -->
        <headerhtml url="/modules/formularconfig/html/virkheader.html"></header> <!-- OPTIONAL - Bruges i forbindelse med "skin" for at tilføje en custom header til siden. HTML'en kan også tilføjes direkte som indhold til dette tag. -->
        <submitpage>formular.send.soe</submitpage>              <!-- DEPRECATED - BRUG SUBMITPAGES I STEDET - Den page, der skal kaldes for at gemme og danne kvitering - Denne page vil være specifik for hver formular. Se senere i dette dokument. -->
        <submitpages>                                           <!-- En liste af pages, der skal kaldes når der klikkes på "Send". Ved at det er en liste af pages, er det muligt at genbruge pages på tværs af formularer. -->
            <page parser="setFrid">formular.create-frid</page>  <!-- Det er muligt at tilføje en "parser", der kan læse output'et fra en page og sende relevante parametre videre til de efterfølgende -->
            <page parser="setFrid" urlparam="journalnummer">    <!-- Det er muligt at tilføje en "urlparam", der sendes til parseren. Herved kan man bestemme navnet på urlparametere der holder værdien -->
                formular.create-frid
            </page>  
            <page parser="setPdf">formular.create-pdf</page>    
            <page condition="false">formular.save</page>        <!-- Skal pagen kaldes? Afhængigt af om noget bestemt er valgt i et eller flere andre felter. Skrives som et JavaScript udtryk og skal returnere true eller false.-->
            <page type="json">mypage</page>                     <!-- Angiv "type" for at fortælle hvad pagen returnere. Default er "json" men det kan også være "xml" -->
            <page>formular.save</page>
            <page>formular.move.pdf</page>                      <!-- Med denne metode bliver PDF-dokumentet ikke flyttet væk fra tmp-mappen. Benyt derfor pagen "formular.move.pdf". Denne page kræver at parameteren "module.formular.site.url" er sat -->
            <page errortype="info">formular.save</page>         <!-- errortype definere hvilken type fejlen er hvis pagen returnere en fejl. Mulige værdier er: "info", "warning" og "error". Hvis errortype er "error" så stopper alt. 
                                                                     Hvis errortype er "info" eller "warning" fortsættes der men brugeren bliver informeret om at der er sket en fejl hvis der også er angivet en errormessage.
                                                                     Hvis log er aktiveret så logges alle fejl -->
            <page errormessage="Tekst">formular.save</page>     <!-- errormessage indeholder den tekst, der vises hvis der er en fejl. -->
        </submitpages>
        <errorpages>                                           <!-- En liste af pages, der skal kaldes hvis der opstår en fejl i forbindelse med submitpages -->
            <page>formular.send.errormail</page>                <!-- I den pages der kaldes, kan fejlbeskederne for hver enkel page, der er fejlet, hentes via parametren: errorpagemessage
                                                                <!-- eksempel:  hvis -->
                                                                <!--    <page errortype="warning" errormessage="Fejl i skrivning til databasen">formular.save</page> -->
                                                                <!-- fejler, vil errorpagemessage indeholde teksten: Fejl i skrivning til databasen. Derved er det muligt at sende et fejlbesked til en fælles postkasse med fejlbeskeden -->
        </errorpages>                                           
        <showreport>true</showreport>                           <!-- OPTIONAL - Skal der genereres et PDF-dokument når brugeren trykker på send (default er "true"). Hvis "false", så vises en simpel tekst hvis det er gået godt -->
        <reportprofile>alt</reportprofile>                      <!-- OPTIONAL - Profil, der skal anvendes til at danne kortet i kviteringen (default er "alt") -->
        <reportlayers>default</reportlayers>                    <!-- OPTIONAL - Layers, der skal anvendes til at danne kortet i kviteringen. Det kan være en liste adskilt af mellemrum (default er "default", der gør at det er profilen default viste temaer, der vises) -->
        <reportxsl>pdf</reportxsl>                              <!-- OPTIONAL - UDEN XSL EXTENSTION! Hvis der er behov for at have en specifik xsl til at danne PDF-kviteringen (default er kvitering og peget på filen kvitering.xsl under modulet) -->
        <reportmapscale>500</reportmapscale>                    <!-- OPTIONAL - Den scale som kortet skal være i PDF-kviteringen (default er tilpasses til den tegnede feature plus 25+pct!400+minimum) -->
        <css>/css/custom/my.css</css>                           <!-- OPTIONAL - Hvis man gerne vil have sin egen css på siden -->
        <js>/js/custom/my.js</css>                              <!-- OPTIONAL - Hvis man gerne vil have sin egen js på siden. Kan bruges til at tilføje sine egne funktioner så det ikke er nødvendigt at skrive det hele i konfigurationen -->
        <tabs>true</css>                                        <!-- OPTIONAL - Har man flere steps, kan man få vist de enkelte steps øverst på siden -->
        <parsedisplaynames>true</parsedisplaynames>             <!-- OPTIONAL - displayname på hvert input felt sendes med til serveren, så man kan bruge dem i forbindelse med en generisk XSL. Sendes som parameteren urlparam+'_displayname' -->
        <localstore clear="true">true</localstore>              <!-- OPTIONAL - Skal browseren huske seneste indtastede værdier hvis formularen forlades inden der er trykker på "Send". Når brugeren trykker på "Semd" slettes de gemte værdier. Alle værdier bliver gemt, dog ikke uploaded filer! (default er "false"). 
                                                                                Hvis atributten "clear" er sat til false, så slettes de gemte oplysninger ikke til næste gang man bruger siden. -->
        <log>true</log>                                         <!-- OPTIONAL - Skal fejl logges på serveren? For at se loggen kaldes http://hostnavn/spatialmap?page=formular.log.read (default er "false") -->
        <messages>                                              <!-- OPTIONAL - Mulghed for at få vist sin egen tekst når brugeren er færdig -->
            <message name="done">Mange tak for hjælpen! Hent kvittering &lt;a href="{{pdf}}"&gt;her&lt;/a&gt;</message>      <!-- OPTIONAL - Teksten, der vises hvis det går godt. {{pdf}} erstattes af stien til pdf-dokumentet -->
            <message name="saving">Ansøgningen registreres. Vent venligst... (Det kan tage op til et par minutter)</message> <!-- OPTIONAL - Teksten, der vises mens serveren gemmer. -->
            <message name="error">Der er opståer en fejl!</message>                                                          <!-- OPTIONAL - Teksten, der vises hvis det går galt -->
        </messages>
        <content displayname="Første step">                     <!-- Der kan tilføjes flere content elementer for at få flere sider i sin formular -->
            <!-- content, kan bestå af et vilkårligt antal elementer i en vilkårlig rækkefølge. I følgende er de enkelte typer elementer beskrevet.
                 Generelt indeholder alle elementer, der indeholder noget, der skal sendes til serveren, atributten "urlparam". Dette er navnet på 
                 den parameter i URL'en, der kan bruges i f.eks. datasourcen når data skal gemmes. 
                 Alle elementer kan indeholde atributten "displayname", der vil stå som ledeteksten for det pågældende element. Denne værdi sendes IKKE til serveren
                 Alle elementer kan som udgangspunkt indeholde:
                 - urlparam
                 - displayname
                 - id
                 - class
                 - onchange         - Function til at ændre andre elementer. Skrives som et JavaScript udtryk.
                 - onkeyup          - Funktion f.eks. til at lave beregninger. Brug "id"-atributten for at identificere specifikke inputfelter
                 - defaultvalue
                 - regexp           - Til validering på et felt. Skriv f.eks. "[0-9]" for at sikre at der altid bliver skrevet et tal
                 - validate         - Tekst til validering. Det skrives under feltet for at angive hvad der er gjort galt.
                 - condition        - Skal feltet vises? Afhængigt af om noget bestemt er valgt i et eller flere andre felter. Skrives som et JavaScript udtryk og skal returnere true eller false.
                  -->
            
            <!-- columns - Mulighed for at have input elementer i kolonner - tilføj class="mincss" for at få en kolonne til at opfører sig specielt -->
            <columns>
                <column>
                    ...
                </column>
                <column>
                    ...
                </column>
            </columns>
            
            <!-- input - type="hidden" -->
            <!-- Kan bruges til at sende værdier, der ikke vedrører brugeren, til serveren -->
            <input type="hidden" urlparam="pdfheadertext1" defaultvalue="Dette er en tekst, der skal sættes ind i kviteringen."/>
            
            <!-- input - type="dropdown" -->
            <!-- Vil populere en dropdown, som brugeren kan vælge fra.
                 Defaultvalue kan angives med samme værdi som value for den options som skal vælges fra start. -->
            <input type="dropdown" displayname="Hvad søges:" urlparam="hvad" defaultvalue="oprensning af sø">
                <option value="ny sø" name="Ny sø"/>
                <option value="oprensning af sø" name="Oprensning af sø"/>
                <option value="udvidelse af sø" name="Udvidelse af sø"/>
            </input>
            <!-- Eller hent fra en datasource -->
            <!-- Tilføj en "datasource" attribut til input elementet.
                 Datasourcen skal have en command, der hedder "read-dropdown".
                 Command'en er hårdkodet for at begrænse adgangen.
                 Command'en skal returnere to colonner, der skal hedde hhv. "value" og "name". -->
            <input type="dropdown" displayname="Hvad søges:" urlparam="hvad" datasource="ds_mintabel"/>
            
            <!-- input - type="radiobutton" -->
            <!-- Det samme som i dropdown -->
            <input type="radiobutton" displayname="Hvad søges:" urlparam="hvad">
                <option value="ny sø" name="Ny sø"/>
                <option value="oprensning af sø" name="Oprensning af sø"/>
                <option value="udvidelse af sø" name="Udvidelse af sø"/>
            </input>
            
            <!-- input - type="input" -->
            <!-- Et helt almindeligt input felt -->
            <input type="input" displayname="Navn:" urlparam="navn"/>

            <!-- input - type="textarea" -->
            <!-- Et helt almindeligt textarea felt hvor brugeren kan skrive flere linier -->
            <input type="textarea" urlparam="begrundelse" displayname="Begrundelse for ansøgning:"/>
            
            <!-- address -->
            <!-- Et felt hvor brugeren kan søge en adresse vha. SpatialAddress. Adressesøgningen benyttes som udgangspunkt til at finde noget i kortet.
                 vejen eller Adressepunktet markeres ikke i kortet. Hvis "urlparam" atributten er defineret, sendes den tekst, der står i feltet, videre til servere.
                 Derudover sendes adressepunktets wkt også til serveren som urlparam+"_wkt". Hvis urlparam="adresse" så vil adressepunktet blive sendt til serveren med adresse_wkt=POINT(XXXX YYYY)
                 Hvis der kun er valgt en vej, så vil adresse_wkt være tom! 
                 - disablemap - OPTIONAL (default false) - skal valg ikke knyttes til kortet (skal også angives hvis der ikke er noget kort)
                 - usegeometry - OPTIONAL (default false) - skal valgte geometri markeres i kortet og anvendes som om der var klikket i kortet det pågældende sted
                 - minzoom - OPTIONAL - Hvor langt skal der zoomes ind når der er fundet noget? Zoomlevel der mindst skal zoomes til. 0 er zoomet helt ud
                 - minscale - OPTIONAL - Hvor langt skal der zoomes ind når der er fundet noget? Målforhold der mindst skal zoomes til.
                 -->
            <address urlparam="address" displayname="Adresse:" apikey="[module.spatialaddress.apikey]" filter="komnr0153"></address>

            <!-- geosearch -->
            <!-- Et felt hvor brugeren kan søge bl.a. en adresse vha. GeoSearch fra GST. Søgningen benyttes som udgangspunkt til at finde noget i kortet.
                 vejen, martriklen, adressepunktet eller andet markeres som udgangspunkt ikke i kortet. Hvis "urlparam" atributten er defineret, sendes den tekst, der står i feltet, videre til servere.
                 Derudover sendes adressepunktets wkt også til serveren som urlparam+"_wkt". Hvis urlparam="adresse" så vil adressepunktet blive sendt til serveren med adresse_wkt=POINT(XXXX YYYY)
                 - resources - OPTIONAL (default "Adresser") - en liste af resurser fra GeoSearch f.eks. resources="Adresser,Matrikelnumre,Kommuner,Opstillingskredse,Politikredse,Postdistrikter,Regioner,Retskredse,Stednavne"
                 - filter - OPTIONAL (default "") - find kun en delmængde ud fra en filter. Det kunne f.eks. være inden for en kommune filter="muncode0101"
                 - disablemap - OPTIONAL (default false) - skal valg ikke knyttes til kortet (skal også angives hvis der ikke er noget kort)
                 - usegeometry - OPTIONAL (default false) - skal valgte geometri markeres i kortet og anvendes som om der var klikket i kortet det pågældende sted
                 - minzoom - OPTIONAL - Hvor langt skal der zoomes ind når der er fundet noget? Zoomlevel der mindst skal zoomes til. 0 er zoomet helt ud
                 - minscale - OPTIONAL - Hvor langt skal der zoomes ind når der er fundet noget? Målforhold der mindst skal zoomes til.
            -->
            <geosearch urlparam="address" displayname="Adresse:" resources="Adresser" filter="muncode0101" disablemap="true" usegeometry="false"/>

            <!-- input - type="date" -->
            <!-- Datovælger felt hvor man kan skrive en dato eller vælge.
                 - limitfromdatasource  - OPTIONAL - Hvis man angiver en "limitfromdatasource" attribut, så hentes der en liste af datoer ud fra den angivede datasource.
                                                     Datasourcen skal returnere flere rækker med en kolonne, der skal indeholde datoer, der ikke kan vælges. Formatet på
                                                     en dato skal pt være f.eks. 22.01.2013. Datasourcen SKAL indeholde en command, der hedder "read-dates"!
                 - onshow               - OPTIONAL - Funktion der kaldes når brugeren klikker på inputfeltet. Kan f.eks. bruges til at ændre datovælgeren. Skrives som et JavaScript udtryk.
            -->
            <input type="date" displayname="Dato:" urlparam="date" limitfromdatasource="ds_formular_booking"/>

            <!-- input - type="file" -->
            <!-- Felt til at vedhæfte en fil -->
            <input type="file" displayname="Vedhæft tegning:" urlparam="filnavn"/>

            <!-- input - type="checkbox" -->
            <!-- En check boks hvor brugeren kan vælge til eller fra. Serveren modtager "true", hvis brugeren har valgt at klikke den til, ellers sendes "false".
                 Defaultvale kan bruges til at bestemme om den check boksen skal være klikket til eller fra. Default er "true" -->
            <input type="checkbox" displayname="Godkendt:" urlparam="godkendt" defaultvalue="true"/>

            <!-- area -->
            <!-- Et felt, der viser arealet af de tegnede. Brugeren har ikke mulighed for at skrive i dette. -->
            <area urlparam="areal" displayname="Areal:"/>

            <!-- input - type="text" -->
            <!-- Dette er til at vise en tekst for brugeren. Det kan bruges til at lave en deloverskrift -->
            <input type="text" displayname="Dette er en over skrift"/>
            
            <!-- maptools -->
            <!-- Maptool, er nogle knapper, som brugeren kan vælge imellem når der skal interageres med kortet. Nedenstående liste er dem, der pt. er implementeret. "pan" toolet vil altid default være slået til. -->
            <!-- Følgende atributter kan tilføjes til et maptool:
                name        - Angiver hvilket maptool, knappen skal referere til. Mulige værdier er: pan, select, polygon, line, point, circle, location, delete, move og modify.
                default     - OPTIONAL - Den viste tekst når musen holdes over knappen
                displayname - OPTIONAL - Angiv hvilket tool, der skal være aktivt fra start. Det gøres ved at tilføje default="true" på et maptool
                disable     - OPTIONAL - Knappen er deaktiveret ved start. Kan ændres med formular.disableButton(['point'],false) ud fra valg i inputfelter eller skift i zoomlevel.
            -->
            <maptools>
                <maptool displayname="" name="pan" default="true"/>
                <maptool displayname="" name="select" datasource="NAVN_PÅ_DATASOURCE" buffer="<bufferværdi>"/>   <!-- Select udpeger fra en datasource, der skal angives som attribut. Med buffer er det muligt at lægge en buffer på udpegningen -->
                <maptool displayname="" name="polygon"/>
                <maptool displayname="" name="line"/>
                <maptool displayname="" name="point"/>
                <maptool displayname="" name="circle"/>
                <maptool displayname="" name="location"/>
                <maptool displayname="" name="delete"/>
                <maptool displayname="" name="move"/>
                <maptool displayname="" name="modify"/>
            </maptools>

            <!-- map -->
            <!-- Det element, der indeholder kortet. -->
            <map>
                <!-- Følgende atributter kan tilføjes til et map:
                    multiplegeometries  - Default false. Skal man kunne tegne flere geometrier i kortet
                    onchange            - Hvis man gerne vil have at der sker noget afhængigt af hvilket udsnit man ser eller hvilket zoomlevel man er i. 
					featurechange		- Man kan kalde en javascript funktion, hver gang der sker en ændring i geometrierne i kortet
                -->
                <style>		<!-- OPTIONAL -->					
					<!--
					mulighed for at sætte stylen for de geometrier der tegnes. Anvend standard CSS (husk case sensitiv)
					eks:
					<strokeColor>#00f</strokeColor>
					<fillColor>#f1a117</fillColor>
					<fontColor>#21f117</fontColor>
					-->
				</style>
				<extent>539430.4,6237856,591859.2,6290284.8</extent>                <!-- OPTIONAL -->
                <resolutions>0.4,0.8,1.6,3.2,6.4,12.8,25.6,51.2,102.4</resolutions> <!-- OPTIONAL -->
                <themes>
                    <theme name="theme-grundkort_2007" host="http://tile.randers.dk/service/wms"/>
                    <!-- Følgende atributter kan tilføjes til et theme:
                        host          - Url til WMS service. Hvis man vil bruge en intern URL, tilføjes blot host="/wms"
                        singleTile    - true | false
                        ratio         - Kun ved brug af singleTile. Default 1,5
                        opacity       - Skal laget være gennemsigtigt. Default 1 (ikke gennemsigtigt)
                        buffer        - Henter tiles, der ikke er synlige. Default 0)
                        maxScale
                        minScale
                        format        - Default image/png. Brug f.eks. image/jpeg til ortofoto
                        layername     - Hvis laget ikke hedder det samme som temaet i CBkort
                        useSessionID  - Sættes til "false" når wms IKKE hentes fra CBkort. Default er "true"
                        useTicket     - Sættes til "true" hvis servicen kommer fra Kortfosyningen. Default er "false"
						displayname   - Ved at sætte displayname på et tema dukker en checkbox op under kortet, hvor laget kan tændes/slukkes
                    -->
                </themes>
                <atributter page="formular.geometry.save" datasource="min-datasource" command="min-command">
                    <!-- Følgende atributter kan tilføjes til atributter:
                        page          - OPTIONAL - Deafult "formular.geometry.save". Angiv den page, der skal kaldes for hver geometri
                        datasource    - OPTIONAL - Angiv hvilken datasource geometrien skal gemmes i. Hvis man benytter sin egen page, kan datasource angives direkte på pagen, ellers skal den angives her!
                        command       - OPTIONAL - Angiv hvilken command, der skal benyttes for at gemme hver enkelt geometri. Hvis man benytter sin egen page, kan command angives direkte på pagen, ellers skal den angives her!
                    -->
                    <!-- En liste af "input" element, der kan konfigureres på samme måde som alle andre input felter. Dog er der en række typer, der ikke kan benyttes, herunder adressesøgning m.m.
                    -->
                    <input type="input" displayname="Nummer:" urlparam="nummer" defaultvalue=""/>
                </attributes>
            </map>
            
            <!-- conflicts -->
            <!-- Når der er angivet et "conflicts" element, betyder det at der foretages en spatiel søgning når der tegnes i kortet.
                 Resultatet af den spatielle søgning, vises på det sted hvor dette element er angivet.
                 Ud over "displayname" og "urlparam", kan der kan sættes en række andre atributter:
                 - "class"         - angiver den css class, som feltet skal have. Det kan f.eks. være "warning", der gør at feltet bliver rødt.
                                     Følgende værdier kan med fordel anvendes: "warning-info", "warning-success", "warning-warning" eller "warning-danger"
                 - "targetset"     - angiver navnet på det targetset, som der skal søges i.
                 - "targetsetfile" - angiver hvilken fil targetsettet ligger i. Default er [module:formular.dir]/queries/spatialqueries.xml
                 - "querypage"     - angiver en alternativ page, der kaldes når det søges i denne konfliktsøgning. Det kan f.eks. bruges hvis man vil benytte en proxy datasource til at søge med.
                 - "onconflict"    - angiver det javascript der skal kaldes når der er ramt noget med denne konfliktsøgning.
                 - "onnoconflict"  - angiver det javascript der skal kaldes når der IKKE er ramt noget med denne konfliktsøgning.
                 På et targetset vil der typisk være anigvet ét target, men der kan godt være flere. På dette target er der knyttet en presentation. 
                 Inholdet af denne presentation, vil blive vist for brugeren. Hvis presentation ikke indeholder nogen columns, så vil der ikke blive vist 
                 noget resultat, men "displayname" vises. Det kan f.eks. bruges til at vise at der er fundet noget, men det er ikke interessant hvad det præcist er -->
            <conflicts class="warning" displayname="Vær opmærksom på at arealet ligger inden for 10 meter fra et §3 område" targerset="konflikt" targetsetfile="[cbinfo.queries.dir]/custom/mytargetsetfile.xml"/>

            <!-- submitbutton -->
            <!-- En knap, der vises når formularen er sendt og gået godt. Knappen kan f.eks. bruges til at sende brugeren videre
                 til en ny formular eller en betalingsside.
                 Man skal skrive lige den funktion som man har lyst til. F.eks. "window.open('http://dmi.dk')" eller man kan bruge
                 nogle af de standard funktioner der er i modulet f.eks. "formular.start()" der starte samme formular igen. Eller
                 "formular.load('http://dmi.dk/ref=')" der sørge for at sende en reference til lige præcis denne indberetning/ansøgning. 
                 Følgende atributter kan tilføjes til en submitbutton:
                  - displayname
                  - function         - Function til at ændre andre elementer. Skrives som et JavaScript udtryk.
                  - condition        - Skal knappen vises? Afhængigt af om noget bestemt er valgt i et eller flere andre felter. Skrives som et JavaScript udtryk og skal returnere true eller false.
                 -->
            <submitbutton displayname="Opret ny" function="formular.start();" condition="jQuery('#test').val() === '1'"/>

        </content>
    </formular>
```


Page:
I konfigurationen angives "submitpage", der er den page, der kaldes når brugeren trykker på "Send". Denne page, vil være en ny for hver ny formular. Dette skyldes at vi herved beskytter vores site mod misbrug.
Pagen indeholder tre elementer:
1. Kald til én eller flere datasources.
2. Include af standard page, der danner kviteringen m.m.

En page kan se ud som følger:
```xml
    <page name="formular.send.soe" contenttype="text/xml" resultpassing="pass-all">
        <data handler="datasource" operation="execute-command">
            <url-parameters>
                <url-parameter name="dataspource">ds_formular_soe</url-parameter>
                <url-parameter name="command">write</url-parameter>
            </url-parameters>
        </data>
        
        <!-- REQUIRED -->
        <include src="[module:formular.dir]/pages/pages-includes.xml" nodes="/pages/page[@name='formular.send']/*" mustexist="true"/>
    </page>
```

Hvis der er data, der skal registreres i DriftWeb, så tilføjes der en DriftWeb datasource til pagen:
```xml
    <page name="formular.send.soe" contenttype="text/xml" resultpassing="pass-all">
        <data handler="datasource" operation="execute-command">
            <url-parameters>
                <url-parameter name="dataspource">ds_formular_soe</url-parameter>
                <url-parameter name="command">write</url-parameter>
            </url-parameters>
        </data>
        <data handler="datasource" operation="execute-command">
            <url-parameters>
                <url-parameter name="dataspource">driftweb_report</url-parameter>
                <url-parameter name="command">write</url-parameter>
                <url-parameter name="problemyypeid">81</url-parameter>
            </url-parameters>
        </data>
        
        <!-- REQUIRED -->
        <include src="[module:formular.dir]/pages/pages-includes.xml" nodes="/pages/page[@name='formular.send']/*" mustexist="true"/>
    </page>
```


Nyheder:
* 2015.05.26 - Nyt skin
* 2014.08.07 - Ny mulighed for at gemme flere geometrier med forskellige oplysninger
* 2014.07.02 - Minscale eller minzoom tilføjet til søgefunktionerne
* 2014.07.02 - Flere standard klasser til styling af konfliktsøgningsresultat
* 2014.05.12 - Mulighed for at logge fejl fra klienten
* 2014.05.02 - Mulighed for at angive beskeden, der skal vises når oplysningerne er registreret eller det er gået galt.
* 2014.05.02 - Mulighed for at bestemme navnet på urlparameteren som en parser på en submitpage.
* 2014.04.29 - localstore er tilføjet så det er muligt at få browseren til at gemme indtastede oplysninger til senere brug.
* 2014.03.05 - onchange tilføjet til kortet, så man kan gøre noget afhængigt af hvilket udsnit man ser eller hvilket zoomlevel man er i.
* 2014.03.05 - Mulighed for at disable et maptool.
* 2014.02.26 - Mulighed for at tegne flere geometrier af samme type i kortet.
* 2014.02.25 - Nyt maptool der kan benytte den aktuelle position til at navigere i kortet.
* 2014.02.16 - Mulighed for at opdele i kolonner.
* 2014.02.02 - onconflict og onnoconflict er tilføjet til konfliktsøgningsfunktionaliteten.
* 2013.11.14 - onshow funktion tilføjet til datovælgeren
* 2013.09.20 - Mulighed for at kalde en sekvens af pages ved submit
* 2013.07.01 - Brug adressepunktet som registreringspunkt
* 2013.07.01 - Ny adressesøgning med GeoSearch fra GST (SpatialMap 2.8 eller nyere)
* 2013.06.28 - Mulighed for at sende ledetekster med som URL-parameter til serveren
* 2013.06.03 - Nye options på temaer. Bl.a. singleTile og opacity
* 2013.05.28 - Udfyld dropdowns ud fra en dasource
* 2013.05.27 - Betingelser på input elementer
* 2013.05.27 - Visning af de enkelte steps øverst på siden
* 2013.05.08 - Change events på "area". Kan f.eks. bruges til at beregne priser ud fra tegnet areal
* 2013.04.18 - Paging - Flere sider i sin formular, så siden ikke bliver så lang
* 2013.04.18 - Default maptool - Angiv hvilket maptool, der skal være aktivt fra start
* 2013.04.10 - Checkbox - Ny input type
* 2013.04.10 - Radiobutton - Ny input type



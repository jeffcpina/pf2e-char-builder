console.debug("PF2e System | Jefffrey Custom Module| Started "); 
export const modName = "PF2e Character Builder";
const mod = "pf2e-char-builder";
var _domParser = new WeakMap;
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", {
    value,
    configurable: !0
});
var __defProp2 = Object.defineProperty,
    __defNormalProp = __name((obj, key, value) => key in obj ? __defProp2(obj, key, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value
    }) : obj[key] = value, "__defNormalProp"),
    __name2 = __name((target, value) => __defProp2(target, "name", {
        value,
        configurable: !0
    }), "__name"),
    __publicField = __name((obj, key, value) => (__defNormalProp(obj, typeof key != "symbol" ? key + "" : key, value), value), "__publicField"),
    __accessCheck = __name((obj, member, msg) => {
        if (!member.has(obj)) throw TypeError("Cannot " + msg)
    }, "__accessCheck"),
    __privateGet = __name((obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj)), "__privateGet"),
    __privateAdd = __name(
            (obj, member, value) => {
                if (member.has(obj)) throw TypeError("Cannot add the same private member more than once");
                member instanceof WeakSet ? member.add(obj) : member.set(obj, value)
            }, 
            "__privateAdd"
    )
class CompendiumBrowserTab1 {
    constructor(browser) {
        __publicField(this, "browser"), __publicField(this, "indexData", []), __publicField(this, "isInitialized", !1), __publicField(this, "totalItemCount", 0), 
        __publicField(this, "scrollLimit", 100), __privateAdd(this, _domParser, new DOMParser), __publicField(this, "searchFields", []), 
        __publicField(this, "storeFields", []), this.browser = browser;
    }
    async renderResults(start) {
        if (!this.templatePath) throw ErrorPF2e(`Tab "${this.tabName}" has no valid template path.`);
        const indexData = this.getIndexData(start),
            liElements = [];
        for (const entry of indexData) {
            const htmlString = await renderTemplate(this.templatePath, {
                    entry,
                    filterData: this.filterData
                }),
                html = __privateGet(this, _domParser).parseFromString(htmlString, "text/html");
            liElements.push(html.body.firstElementChild)
        }
        return liElements
    }
}
class CompendiumBrowserHeritageTab extends CompendiumBrowserTab1{
    constructor(browser) {
        super(browser),
        __publicField(this, "tabName", "heritage"),
        __publicField(this, "filterData"),
        __publicField(this, "templatePath", `modules/${mod}/templates/compendium-browser/partials/heritage.hbs`),
        __publicField(this, "searchFields", ["name"]),
        __publicField(this, "storeFields", ["type", "name", "img", "uuid", "traits", "source"]),
        __publicField(this, "index", ["img", "system.heritageType.value", "system.traits.value", "system.source.value"]),
        this.filterData = this.prepareFilterData()
    }
    async loadData() {
        console.debug("PF2e System | Compendium Browser | Started loading heritages");
        const heritages = []
          , indexFields = ["img", "system.traits.value", "system.source.value", "system.ancestry.name"]
          , ancestries = new Set //added by jcp
          , sources = new Set;
        for await(const {pack, index} of this.browser.packLoader.loadPacks("Item", this.browser.loadedPacks("heritage"), indexFields)) {
            console.debug(`PF2e System | Compendium Browser | ${pack.metadata.label} - Loading`);
            for (const heritageData of index)
                
                if (heritageData.type === "heritage") {
                    if (heritageData.system.ancestry === undefined) heritageData.system.ancestry = {name: "Versatile"};
                    if (!this.hasAllIndexFields(heritageData, indexFields)) {
                        console.warn(`Heritage '${heritageData.name}' does not have all required data fields. Consider unselecting pack '${pack.metadata.label}' in the compendium browser settings.`);
                        continue
                    }
                    
                    const source = heritageData.system.source.value;
                    var ancestry = heritageData.system.ancestry.name;
                    ancestry = ancestry.toLowerCase();

                    ancestry && ancestries.add(ancestry), 
                    source && (sources.add(source),
                    heritageData.system.source.value = game.pf2e.system.sluggify(source)),
                    heritages.push({
                        type: heritageData.type,
                        name: heritageData.name,
                        img: heritageData.img,
                        uuid: `Compendium.${pack.collection}.${heritageData._id}`,
                        traits: heritageData.system.traits.value,
                        ancestry: ancestry,
                        source: source
                    })
                }   
        }
        this.indexData = heritages,
        this.filterData.checkboxes.ancestry.options = this.generateSourceCheckboxOptions(ancestries),
        this.filterData.checkboxes.source.options = this.generateSourceCheckboxOptions(sources),
        console.debug("PF2e System | Compendium Browser | Finished loading heritages")
    }
    filterIndexData(entry) {
        const {checkboxes, 
              // multiselects
        } = this.filterData;
        return !( 
                  checkboxes.ancestry.selected.length && 
                  !checkboxes.ancestry.selected.includes(entry.ancestry) 
        )
    }
    prepareFilterData() {
        return {
            checkboxes: {
                ancestry: {
                    isExpanded: !1,
                    label: "Ancestry",
                    options: {},
                    selected: []
                },
                source: {
                    isExpanded: !1,
                    label: "PF2E.BrowserFilterSource",
                    options: {},
                    selected: []
                }
            },
            order: {
                by: "name",
                direction: "asc",
                options: {
                    name: "PF2E.BrowserSortyByNameLabel"
                }
            },
            search: {
                text: ""
            }
        }
    }
}
class CompendiumBrowserDeityTab extends CompendiumBrowserTab1{
    constructor(browser) {
        super(browser),
        __publicField(this, "tabName", "deity"),
        __publicField(this, "filterData"),
        __publicField(this, "templatePath", `modules/${mod}/templates/compendium-browser/partials/deity.hbs`),
        __publicField(this, "searchFields", ["name"]),
        __publicField(this, "storeFields", ["type", "name", "img", "uuid", "traits", "source"]),
        __publicField(this, "index", ["img", "system.category", "system.source.value", "system.weapons", "system.domains"]),
        this.filterData = this.prepareFilterData()
    }
    async loadData() {
        console.debug("PF2e System | Compendium Browser | Started loading deities");
        const deities = []
          , indexFields = ["img", "system.category", "system.source.value", "system.alignment", "system.weapons", "system.domains"]
          , categories = new Set //added by jcp
          , sources = new Set, alignmentList = CONFIG.PF2E.alignments
        for await(const {pack, index} of this.browser.packLoader.loadPacks("Item", this.browser.loadedPacks("deity"), indexFields)) {
            console.debug(`PF2e System | Compendium Browser | ${pack.metadata.label} - Loading`);
            for (const deityData of index)
                if (deityData.type === "deity") {
                    if (!this.hasAllIndexFields(deityData, indexFields)) {
                        console.warn(`Deity '${deityData.name}' does not have all required data fields. Consider unselecting pack '${pack.metadata.label}' in the compendium browser settings.`);
                        continue
                    }
                    const source = deityData.system.source.value;
                    const category = deityData.system.category;
                    const alignment = game.i18n.localize(alignmentList[deityData.system.alignment.own])
                    
                    category && categories.add(category), 
                    source && (sources.add(source),

                    deityData.system.source.value = game.pf2e.system.sluggify(source)),
                    deities.push({
                        type: deityData.type,
                        name: deityData.name,
                        img: deityData.img,
                        uuid: `Compendium.${pack.collection}.${deityData._id}`,
                        category: category,
                        alignments: deityData.system.alignment.follower,
                        alignment: alignment,
                        weapons: deityData.system.weapons,
                        domains: deityData.system.domains.primary,
                        source: source
                    })
                }   
        }
        var domainList=[], newArray = Object.entries(CONFIG.PF2E.deityDomains);
        newArray.map((val,idx)=>{var key=val[0],label=val[1].label; domainList[key]=label})
          
        this.indexData = deities,
        //this.filterData.checkboxes.category.options = this.generateSourceCheckboxOptions(categories),
        this.filterData.checkboxes.source.options = this.generateSourceCheckboxOptions(sources),
        this.filterData.multiselects.alignments.options = this.generateMultiselectOptions(
            {...CONFIG.PF2E.alignments}
        ),
        this.filterData.multiselects.weapons.options = this.generateMultiselectOptions(
            {...CONFIG.PF2E.baseWeaponTypes}
        ),
        this.filterData.multiselects.domains.options = this.generateMultiselectOptions(
            {...domainList}
        ),
        console.debug("PF2e System | Compendium Browser | Finished loading deities")
    }
    filterIndexData(entry) { 
        const { 
              multiselects,
              checkboxes
        } = this.filterData;

        return !( 
                  //checkboxes.category.selected.length && !checkboxes.category.selected.includes(entry.alignment) 
                  !this.filterTraits(entry.alignments, multiselects.alignments.selected, multiselects.alignments.conjunction) 
                  || !this.filterTraits(entry.weapons, multiselects.weapons.selected, multiselects.weapons.conjunction) 
                  || !this.filterTraits(entry.domains, multiselects.domains.selected, multiselects.domains.conjunction) 
        )
    }
    prepareFilterData() {
        return {
            checkboxes: {
                source: {
                    isExpanded: !1,
                    label: "PF2E.BrowserFilterSource",
                    options: {},
                    selected: []
                }
            },
            multiselects: {
                alignments: {
                    conjunction: "or",
                    label: "PF2E.Item.Deity.FollowerAlignments",
                    options: [],
                    selected: []
                },
                weapons: {
                    conjunction: "or",
                    label: "PF2E.Item.Deity.FavoredWeapons.Label",
                    options: [],
                    selected: []
                },
                domains: {
                    conjunction: "or",
                    label: "Domains",
                    options: [],
                    selected: []
                }
            },
            order: {
                by: "name",
                direction: "asc",
                options: {
                    name: "PF2E.BrowserSortyByNameLabel"
                }
            },
            search: {
                text: ""
            }
        }
    }
}

/*** end of classes */

function attach_compendium_tab(compendium){
        //reset parent of Compendium with embedded CompendiumBrowserTab
        var gparent = Object.getPrototypeOf(Object.getPrototypeOf(compendium))
        var browser_parent = Object.getPrototypeOf(game.pf2e.compendiumBrowser.tabs.action);
        Object.setPrototypeOf(gparent, browser_parent); 
}
function setHeritage(app){
    if (! (app.dataTabsList.indexOf("heritage") >= 0) ) {
        var new_compendiumBrowser = new CompendiumBrowserHeritageTab(game.pf2e.compendiumBrowser);    
        attach_compendium_tab(new_compendiumBrowser)
        app.tabs["heritage"] = new_compendiumBrowser;
        app.settings.heritage = { "pf2e.heritages" : {
            load: true,
            name: "Heritage"
        }}
        app.dataTabsList.push("heritage");
    }   
}
function setDeity(app){
    if (! (app.dataTabsList.indexOf("deity") >= 0) ) {
        var new_compendiumBrowser = new CompendiumBrowserDeityTab(game.pf2e.compendiumBrowser);    
        attach_compendium_tab(new_compendiumBrowser)
        app.tabs["deity"] = new_compendiumBrowser;
        app.settings.deity = { "pf2e.deities" : {
            load: true,
            name: "Deity"
        }}
        app.dataTabsList.push("deity");
    }   
}
function add_deity_link_to_actor_sheet(html){
    
    var el = html.find('.sheet-content').find('.character-details').find(".pc_deity ").find(".open-compendium");
    var new_html = '<a class="item-control deity-browse" data-filter="" data-level="1"><i class="fas fa-fw fa-search"></i></a>'
    el.after(new_html);el.remove();
    var set_element = html.find('.sheet-content').find('.character-details').find(".pc_deity").find(".deity-browse");    
    set_element.on("click", async event=>{
            const compendiumBrowser = game.pf2e.compendiumBrowser;
            const deityTab = game.pf2e.compendiumBrowser.tabs.deity, filter = await deityTab.getFilterData();
            return deityTab.open(filter)
    })
    
}
function add_heritage_link_to_actor_sheet(html){
    var el = html.find('.sheet-content').find('.detail-sheet').find(".pc_heritage").find(".open-compendium");
    var new_html = '<a class="item-control heritage-browse" data-filter="" data-level="1"><i class="fas fa-fw fa-search"></i></a>'
    el.after(new_html);el.remove();
    var set_element = html.find('.sheet-content').find('.detail-sheet').find(".pc_heritage").find(".heritage-browse");
    set_element.on("click", async event=>{
            //const compendiumBrowser = game.pf2e.compendiumBrowser;
            var ancestry =  html.find('.detail-sheet').find(".pc_ancestry").find(".value").html().toLowerCase();

            const heritageTab = game.pf2e.compendiumBrowser.tabs.heritage, filter = await heritageTab.getFilterData();
            const checkboxes = filter.checkboxes.ancestry;

            if (!ancestry) {
                ui.notifications.error("Must choose a valid Ancestry first");
                throw ErrorPF2e(`Must choose a valid Ancestry first`)
            }
            ancestry in checkboxes.options && (checkboxes.isExpanded = !1, checkboxes.options[ancestry].selected = !0, checkboxes.selected.push(ancestry));
            return heritageTab.open(filter)
    })
}
async function add_language_counter_to_actor_sheet(html,data){
    var lang_title =  html.find('.pc_languages').find(".details-label");
    var skillTitle = html.find(".tab.proficiencies").find(".overflow-list");
        //language
        var className=data.class.name,actIntMod=data.data.abilities.int.mod,uuid=data.class.flags.core.sourceId,
            currLang = data.document.toObject(), currLang = currLang.system.traits.languages.value.length,
            bonus = (data.document.system.traits.languages.bonus !== undefined)?data.document.system.traits.languages.bonus:0,
            totLang= actIntMod + bonus,
            langAvail=totLang-currLang,backFeats=data.background.system.trainedSkills.value,
            classFeats=data.class.system.trainedSkills.value
        if(langAvail!=0)
        lang_title.after((langAvail>0)?`<div class="remaining extra">${langAvail}</div>`:
                        `<span class='tags addLangs errTags'><span class='tag'>Too many languagues. Reduce by ${Math.abs(langAvail)}</span></span>`)
        //skills
        const [type2,scope,packId,id] = uuid.split(".");
        var classData = await game.packs.get(`${scope}.${packId}`).getDocument(id);
        var addSkills = classData.system.trainedSkills.additional;
        var totSkills = backFeats.length + classFeats.length + addSkills;
        var charSkills = data.data.skills;
        var cnt=0;Object.entries(charSkills).forEach(([key, skill])=>{cnt=cnt+((skill.modifiers[1].label!="Untrained")?1:0)});
        var skillsLeft=totSkills-cnt;
        if (skillsLeft!=0) 
            skillTitle.before((skillsLeft>0)?`<div class="remaining extra">${skillsLeft}</div>`:
                        `<div class='errRemaining'>Too many skills. Limit of ${totSkills} Remove ${Math.abs(skillsLeft)}</div>`)  
    
}
async function add_boost_indicator_to_sheet(html,data){
    var totAvailBack=0,totAvailAncestry=0,scoresLeft=0, allowedBoosts = data.actor.system.build.abilities.allowedBoosts;
    var boosts = data.actor.system.build.abilities.boosts;
    Object.keys(data.background.system.boosts).forEach(key=>{if (data.background.system.boosts[key].value.length != 0) totAvailBack+=1;})
    Object.keys(data.ancestry.system.boosts).forEach(key=>{if (data.ancestry.system.boosts[key].value.length != 0) totAvailAncestry+=1;})
    allowedBoosts['background']= totAvailBack; allowedBoosts['ancestry']= totAvailAncestry;
    Object.keys(allowedBoosts).forEach(key=>{scoresLeft+= allowedBoosts[key] - boosts[key].length})
    if (scoresLeft != 0)html.find(".tab.character h3.header button").addClass("highlight");
    console.debug['scores',allowedBoosts,boosts,scoresLeft]
}
async function add_spell_counter_to_prep_sheet(html,limit,spellcount){
    var title =  html.find(".sheet-header"), availCantrip = (spellcount !== null) ? limit.cantrip - spellcount[0].length: limit.cantrip,total=0;
    if (spellcount !== null) Object.values(spellcount).forEach(element=>total += element.length);
    var availSpells = (spellcount !== null) ? limit.spells - (total - spellcount[0].length) : limit.spells;

    if (! isNaN(availCantrip))
        if(availCantrip!=0)
            title.append((availCantrip>0)?`<p><span class='tags addspells'><span class='tag'>choose ${availCantrip} cantrip(s)</span></p>`:
                            `<p><span class='tags addspells'><span class='tag'>Too many skills. Limit of ${limit.cantrip} cantrip(s)  ${availCantrip}</span></p>`)

    if (! isNaN(availSpells))
        if(availSpells!=0)
        title.append((availSpells>0)?`<p><span class='tags addspells'><span class='tag'>choose ${availSpells} spell(s)</span></p>`:
                        `<p><span class='tags addspells'><span class='tag'>Too many skills. Limit of ${limit.spells} spell(s)  ${availSpells}</span></p>`)
}


//==========================
// Hooks
//==========================

function changeDefaultTemplate(newTemplate){
    this.options.template = newTemplate;
    return this.options;
}
Hooks.on('pf2e.systemReady', async () => {
    var compendiumBrowser = game.pf2e.compendiumBrowser;
    compendiumBrowser.changeDefaultTemplate = changeDefaultTemplate;
    compendiumBrowser.changeDefaultTemplate(`modules/${mod}/templates/compendium-browser/compendium-browser.hbs`);
    setHeritage(compendiumBrowser)
    setDeity(compendiumBrowser)
}); 
Hooks.on('renderCompendiumBrowser', async (app, html, data) => {
    var el = html.find('.spell-browser').find('.control-area').find('.filtercontainer[data-filter-name="domains"]');
    var new_html = '<p>&nbsp</p><p><strong>Cleric bonus based on deity chosen:</strong></p><ul><li>Cloister Cleric get bonus spells with domain</li><li>War Priest gets bonuses with the favored weapon</li></ul>'
    el.after(new_html);

})
Hooks.on('renderCharacterSheetPF2e', (app, html, data) => {
    add_deity_link_to_actor_sheet(html)
    add_heritage_link_to_actor_sheet(html);
    if((data.class !== null) && (data.ancestry !== null) && (data.background !== null) && (data.heritage !== null)){
        add_language_counter_to_actor_sheet(html,data);
        add_boost_indicator_to_sheet(html, data);
    }    
});
Hooks.on('renderBaseTagSelector', async (app,html,data) => {
    var classname=app.object.ancestry.name, allowedLangs=data.object.ancestry.system.additionalLanguages.value,li="",langOption="",options="",
        lang=data.object.ancestry.system.languages.value;
    lang.push["druidic"]   
    //get options
    if (data.title == "Languages"){
        options = html.find('.trait-item');
        if(classname=="Druid") lang.push("druidic")
        lang.push("common","celestial","draconic","dwarven","elven","sylvan","aquan","vanara","nagaji",
                  "undercommon","gnomish","jotun","orcish","infernal","goblin","grippli","kitsune","shoony")
        options.each( (idx, li) =>{ 
            var checkLang=!0;li = $( li ); langOption = li.find(".trait-label").html().toLowerCase();
            checkLang = (lang.includes(langOption) ) || (allowedLangs.includes(langOption) )
            if (!checkLang) li.hide();
        });
    }
 });  
 var helpApp="",inOptions=false;
 Hooks.on('renderPickAThingPrompt', async (app,html,data) => {
    // Deity and Cause x 2
    var titles = [
        {type:"Arcane School", uuid:"0MXNDsXMDFFvWM8E"},{type:"Arcane Thesis", uuid:"ga3H00S2YyLhUYai"},
        {type:"Research Field", uuid:"vUWcQBzQQaxQooWV"},{type:"Instinct", uuid:"S39SFGRS7H25VagT"},{type:"Muses", uuid:"nYx9xanx6AilaZnw"},
        {type:"Deity and Cause", uuid:"PktQELfKMeThfpw2", uuid2:"xx"},{type:"Doctrine", uuid:"ag37yQJv8UgfosSj"},
        {type:"Druidic Order", uuid:"krFCabaWotxWLoTj"},{type:"Gunslinger's Way", uuid:"lBMxolhytOQJkhtK"},{type:"Innovation", uuid:"lwhFfkYrxX8wdm93"},
        {type:"Methodology", uuid:"m5QqfHYzTsIHnNzn", uuid2:"xx"},{type:"Hybrid Study", uuid:"F0aY8BuYHy9RxdRb"},
        {type:"Mystery", uuid:"O1gfWHwUHqUN3l49"}, {type:"Conscious Mind", uuid:"xhWxQTjRzTAEoiOS"},{type:"Subconscious Mind", uuid:"qu4wR6YeXCAx2YQp"},
        {type:"Hunter's Edge", uuid:"NHTLehA9XaVFEgWZ"},{type:"Rogue's Racket", uuid:"e7fdMR1ZRH9W05PS"},{type:"Bloodline", uuid:"VRlsWKFsiqs0Kx73"},
        {type:"Swashbuckler's Style", uuid:"U2pjAiv80in5LXxB"},{type:"First Implement and Esoterica", uuid:"TPhcdLWv969yDSSb"},
        {type:"Patron", uuid:"VZC3Ql0mjsODUQRo"},
        //Could be elaborated currently on Major Subject
        {type:"Animal Instinct", uuid:"S39SFGRS7H25VagT"},{type:"Dragon Instinct", uuid:"S39SFGRS7H25VagT"},   
        {type:"Armor Innovation", uuid:"lwhFfkYrxX8wdm93", uuid2:"xx"},{type:"Weapon Innovation", uuid:"lwhFfkYrxX8wdm93", uuid2:"xx"},
        {type:"Bloodline: Elemental", uuid:"VRlsWKFsiqs0Kx73"},{type:"Bloodline: Draconic", uuid:"VRlsWKFsiqs0Kx73"},
        //
        {type:"Evolution Feat", uuid:"ZfpzcaDdKRUsn5LQ"},
        {type:"Eldritch Trickster", uuid:"yFGxbfZcBkgKNaDn"},
        {type:"Arcane", uuid:"xx"},//????
        {type:"Deity", uuid:"mIWgvbYTfRNwTChv"},
        {type:"Domain Initiate", uuid:"QSCh7G246JlrQB2l"},
        //add druidic order Wave, Stone, Flame
        //maybe add seperate weapon and armor Innovations
        //accordian file on Hybrid Studies
        //Patrons Baba Yaga, Mosquito Witch, Pacts, Wild
    ]    
    var uuid="", title_found;
    titles.some((el) => {if (app.title==el.type){uuid=el.uuid;title_found=el.type; return true}});
    if (uuid!==""){
        var el = html.find('h3');

        
        //Compendium.pf2e-char-builder.options.shaOL1XYgNiYPUWl.JournalEntryPage.0MXNDsXMDFFvWM8E
        var jrnPage = "JournalSheetPF2e-Compendium-jcp-custom-module-jcp-journals-shaOL1XYgNiYPUWl"
        
        //var pack = "Compendium.jcp-custom-module";
        var pack = "Compendium.pf2e-char-builder.options";

        //var uuidPrefix = "Compendium.jcp-custom-module.jcp-journals.shaOL1XYgNiYPUWl.JournalEntryPage"
        var uuidPrefix = "Compendium.pf2e-char-builder.options.shaOL1XYgNiYPUWl.JournalEntryPage"

        var qlink = `<a class="content-link help-link" data-uuid="${uuidPrefix}.${uuid}" data-type="Item" data-pack="${pack}">  &nbsp; <i class="fa fa-question-circle"></i></a>`
        //<style>#${jrnPage} aside{display: none;}</style>`;
        el.append(qlink);
        inOptions=true;

        if (uuid==="mIWgvbYTfRNwTChv" || uuid==="PktQELfKMeThfpw2"){
            var deitylink = `<a class="help-link deity-browse" data-filter="" data-level="1"><i class="fas fa-fw fa-edit"></i></a>`
            el.append(deitylink);
            html.find(".deity-browse").on("click", async event=>{
                    const compendiumBrowser = game.pf2e.compendiumBrowser;
                    const deityTab = game.pf2e.compendiumBrowser.tabs.deity, filter = await deityTab.getFilterData();
                    return deityTab.open(filter)
            })
        }
    }
 })
Hooks.on('renderJournalSheetPF2e', async (app,html,data) => {
    if ( (data.document.id == "shaOL1XYgNiYPUWl")){
        if(inOptions==true) {
            html.css({"min-width": "350px"});
            html.width("350");
            html.find("aside").hide();
            helpApp=app;
        }
        else {
            html.css({"min-width": "680px"});
            html.width("960");
            html.find("aside").show();
        }
    }
}) 
Hooks.on('closeChoiceSetPrompt', async (app,html,data) => { 
    if(helpApp!="") {
        helpApp.close();
        helpApp="";
    }
    if (inOptions==true) inOptions=false;
}) 
Hooks.on('renderItemSheet', (app, html, data) => {
    let showBtn = $(`<a class="show-compendium-button" alt="display document" data-tooltip="Display Document Link on Chat" ><i class="fa fa-eye"></i></a>`);
    html.closest('.app').find('.show-compendium-button').remove();
    let titleElement = html.closest('.app').find('.window-title');
    showBtn.appendTo(titleElement);
    let uuid = data.document.flags.core.sourceId;    
    showBtn.click(ev => {
        var content = `
        @UUID[${uuid}] 
        `;
        ChatMessage.create({content});
    });
    //maybe convert to a add to compedium data routine
    var vids = []; var vidBtn = "";
    vids["XwfcJuskrhI9GIjX"]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.LvJS7hzIl5Os2aT6`;//Alchemist
    vids[`YDRiP7uVvr9WRhOI`]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.IHoEj7FzIhDRP99Y`;//"Barbarian
    vids[`3gweRQ5gn7szIWAv`]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.DSRN9zHn51SDjynF`;//"Bard
    vids[`x8iwnpdLbfcoZkHA`]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.QT9L2wywBLeWiC33`;//"Champion
    vids[`EizrWvUPMS67Pahd`]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.ugebghE6bw8ZJ4zU`;//"Cleric
    vids[`7s57JDCaiYYCAdFx`]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.EINUpj9gI8vOITNJ`;//"Druid
    vids[`8zn3cD6GSmoo1LW4`]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.HDwEzuH82DJ9e9E8`;//"Fighter
    vids[`Z9li154CPNmun29Q`]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.9nCq4KgekZaUG9fo`;//"Gunslinger
    vids[`30qVs46dVNflgQNx`]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.cglQYwat1B931AHV`;//"Investigator
    vids[`4wrSCyX6akmyo7Wj`]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.cglQYwat1B931AHV`;//"Inventor
    vids[`HQBA9Yx2s8ycvz3C`]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.GTLZwxMxA8A6I2QH`;//"Magus
    vids[`YPxpk9JbMnKjbNLc`]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.0VDcoZUaZM9uVIhS`;//"Monk
    vids[`pWHx4SXcft9O2udP`]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.02XIhyDLFBNZl9Uv`;//"Oracle
    vids[`Inq4gH3P5PYjSQbD`]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.i730el8QkFjR3Lfh`;//"Psychic
    vids[`Yix76sfxrIlltSTJ`]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.FPf0fbVP5XU8v46J`;//"Ranger
    vids[`LO9STvskJemPkiAI`]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.rrnsfSqzFzeqW0op`;//"Rogue
    vids[`15Yc1r6s9CEhSTMe`]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.9yzCrSTZbEq9fPpX`;//"Sorcerer
    vids[`YtOm245r8GFSFYeD`]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.ucPuLPx1p60qZdgf`;//"Summoner
    vids[`uJ5aCzlw34GGdWjp`]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.OfC15pnHKffi0go0`;//"Swashbuckler
    vids[`Y5GsHqzCzJlKka6x`]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.c4y6ZA2ivTCeOjDs`;//"Thaumaturge
    vids[`bYDXk9HUMKOuym9h`]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.7W1Hh99Rav2g3HGa`;//"Witch
    vids[`RwjIZzIxzPpUglnK`]=`Compendium.pf2e-char-builder.options.YCTH8HAHnsd1e3b2.JournalEntryPage.6I4GHbGtugalKapc`;//"Wizard
    vids[`xx`]=``;//"Kineticist

    vids[`TQEqWqc7BYiadUdY`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.sqMtDee0yQnOFNpv`;//https://youtu.be/dB_lFBxjD3M?si=vyyjkJjPeoGl-_SX`;//Anadi
    vids[`GfLwE884NoRC7cRi`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.bOru6Yi0M3MYupsa`;//https://youtu.be/YddTAkFCt8k?si=2tfKqLnVXEwlfduq`;//Android
    vids[`kYsBAJ103T44agJF`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.I7c6bRvh1ATYE0pd`;//https://youtu.be/NmP6So896LU?si=qcI5k1fWp2iAWucV`;//Automaton
    vids[`yFoojz6q3ZjvceFw`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.hIYJIL1txLXZQd8t`;//https://youtu.be/_taHqY7Zg80?si=JJa0mdqRCw6wKSDr`;//Azarketi
    vids[`972EkpJOPv9KkQIW`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.TfCecppUp0tUH8um`;//https://youtu.be/e0fejpVbkJo?si=8_ZImdwnwLOlAOLy`;//Catfolk
    vids[`tZn4qIHCUA6wCdnI`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.pke0567a9N1m3WJz`;//https://youtu.be/Go6w2T50O4A?si=SAbSYB5pUuJLfnkL`;//Conrasu
    vids[`BYj5ZvlXZdpaEgA6`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.obSglyAHlFKs3jTt`;//https://youtu.be/jVOFhVdv434?si=ZhfaZFmpwaY7AFEw`;//Dwarf
    vids[`PgKmsA2aKdbLU6O0`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.aIGkrfK12w2vLw2T`;//https://youtu.be/4m0UtXQTUpY?si=ivntPdOr2QSPdn6B`;//Elf
    //vids[`hIA3qiUsxvLZXrFP`]=``;//Fetchling
    vids[`FXlXmNBFiiz9oasi`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.9y2fhWuFqaC7PXIg`;//https://youtu.be/dNkFzuLQd2s?si=afU4Eb_T2oD4cUD-`;//Fleshwarp
    vids[`tSurOqRcfumadTfr`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.wJ1HpxByFNeWHlr5`;//https://youtu.be/3Omrgcq_p6M?si=WKYjhJJMccQz6QXI`;//Ghoran
    vids[`vxbQ1Yw4qwgjTzqo`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.54OmxV3YbvO7M4Ex`;//https://youtu.be/jRC8LMY7MZ4?si=7iaA_9TX6qmb8cLi`;//Gnoll
    vids[`CYlfsYLJcBOgqKtD`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.BibIJrSF73j38Q9D`;//https://youtu.be/FPe7Y99v72k?si=GaruhM91WRJjqr6Y`;//Gnome
    vids[`sQfjTMDaZbT9DThq`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.DhmFHWi4ytHkdQne`;//https://youtu.be/GLerWYi0zN8?si=oPJk8yvW0M9xTo5E`;//Goblin
    vids[`c4secsSNG2AO7I5i`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.E5D0Bd5pRuDtgEWb`;//https://youtu.be/gRoMGn4_NAg?si=td70SIt8Urdh0L0h`;//Goloma
    vids[`hXM5jXezIki1cMI2`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.P0nKWSUy68ukLpdx`;//https://youtu.be/X0MVWwaaUCM?si=p5xL3dWd047RsaxQ`;//Grippli
    vids[`GgZAHbrjnzWOZy2v`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.MBTBhHHKLwHhncbs`;//https://youtu.be/3XYyWMSuuVw?si=TX9p_G5XMe-f-fsD`;//Halfling
    vids[`piNLXUrm9iaGqD2i`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.lP53YCPKJPWmpMEY`;//https://youtu.be/zDPVr8GJwO8?si=3lzkypG5lCKjT363`;//Hobgoblin
    vids[`IiG7DgeLWYrSNXuX`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.PTcXLs6kwL6qqsGc`;//https://youtu.be/fSBwD8OtBlI?si=TodgoDlRSkl9p4l0`;//Human
    vids[`dw2K1AJR9mQ25nDP`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.8pREO6JwigzocAGf`;//https://youtu.be/YGyij055E1I?si=3vrSNNeSx3yYiq-j`;//Kashrishi
    vids[`4BL5wf1VF9feC2rY`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.FELRCcg7QxZc5hqM`;//https://youtu.be/EnBhgC0A3_Q?si=ORelqbOcAxK1u3RO`;//Kitsune
    vids[`7oQxL6wgsokD3QXG`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.QbBzlU5i8nF62tbq`;//https://youtu.be/HVdsEkgUxxU?si=7BiZc97ed56zvJ48`;//Kobold
    vids[`cdhgByGG1WtuaK73`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.4Yclfnt95kiHa9jg`;//https://youtu.be/RbYAmmKR0WI?si=FIlUkIkbsRDY6gQU`;//Leshy
    vids[`HWEgF7Gmoq55VhTL`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.kjJWcXK1yeaKqG4x`;//https://youtu.be/HI5eAxtNUwE?si=2UDxQ1pmtHS9J3ah`;//Lizardfolk
    vids[`J7T7bDLaQGoY1sMF`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.bowxODW6Qt8INdom`;//https://youtu.be/fARI9n-3HNc?si=vsbnXJ5N7hdrBaCH`;//Nagaji
    vids[`lSGWXjcbOa6O5fTx`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.pL1xvSfOFiDThv3H`;//https://youtu.be/HVdsEkgUxxU?si=7BiZc97ed56zvJ48`;//Orc
    vids[`6F2fSFC1Eo1JdpY4`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.mIHMWaI1Xmk0JH36`;//https://youtu.be/iUtGj6HEXso?si=mDVhNSnuUn8kEALn`;//Poppet
    vids[`P6PcVnCkh4XMdefw`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.4HGvkFmjK2GAnI2r`;//https://youtu.be/QFnyBv6zk9w?si=EDpHdfB0wsUAp-Xo`;//Ratfolk
    vids[`x1YinOddgUxwOLqP`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.vrWsHSGDtFshGMja`;//https://youtu.be/F9JaN867Ksg?si=IjcrjnOvCV5VpHV6`;//Shisk
    vids[`q6rsqYARyOGXZA8F`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.nBkgNnqQjccgfo6g`;//https://youtu.be/zgkTPrreDUU?si=8nm74RKj11ohV-Oh`;//Shoony
    vids[`58rL5sg2y4arW1i5`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.AgLQYwaEqX2APnmQ`;//https://youtu.be/suSjk4MkAPQ?si=SCT3cLS5wbk4ewNC`;//Skeleton
    vids[`TRqoeYfGAFjQbviF`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.nHxai2MvBr0groZz`;//https://youtu.be/LnJOG0phhKY?si=WAfre4Wl36Hk2hSI`;//Sprite
    //vids[`GXcC6oVa5quzgNHD`]=``;//Strix
    vids[`18xDKYPDBLEv2myX`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.JGVv8Pwf6Oo3BLba`;//https://youtu.be/WuvcEn9IHaI?si=SUtJKE9y-3AaCE1r`;//Tengu
    vids[`cLtOGIkuSSa4UDHY`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.bHf1LIzDXrvlbWRY`;//https://youtu.be/RDmN6ma3R_U?si=UPKI-Jks5QTz8FZq`;//Vanara
    vids[`u1VJEXsVlmh3Fyx0`]=`Compendium.pf2e-char-builder.options.mN2qmLbiV1PesCwn.JournalEntryPage.Kl64TE4CBKGupVxv`;//https://youtu.be/ZD7l5AKqG08?si=5y4KqlWyLXtro41e`;//Vishkanya']

    if (vids[app.object._id] != undefined){
        html.find('.details').length
        console.debug(["found",app.object.name, app.object._id])
        var header=html.find('.sheet-header');
        var splitComp = vids[app.object._id];
        splitComp = splitComp.split(".");
        console.log(["split",splitComp,splitComp[5]]);
        vidBtn = $(`<a class="content-link show-video" alt="watch video" data-tooltip="Watch video" data-type="JournalEntryPage" 
                           data-uuid="${vids[app.object._id]}" data-id="${splitComp[5]}">
                      <i class="fa fa-film fa-2x"></i></a>`);
        vidBtn.appendTo(header);
    }

    console.debug(["id",app.object.name, html.find('.sheet-header').length])
});
Hooks.on('renderSpellPreparationSheet', async (app,html,data) => { 
    var id = data.entry.id, spellbook = Object.entries(data.document.spellcasting),
    entries = spellbook[0][1], book = entries.get(id).entry.spells, limit = entries.get(id).entry.system.prepared,
    spells = await book.getSpellData(), spellcount = spells.spellPrepList;
    add_spell_counter_to_prep_sheet(html,limit, spellcount)
}) 
Hooks.on('renderCompendium', (app, html, data) => {
    if (app.collection.metadata.path == "systems/pf2e/packs/classes.db" || app.collection.metadata.path == "systems/pf2e/packs/ancestries.db") {
        var links = html.closest('.app').find('.document-name a');
        var desc = [];
        desc["Barbarian"] =`Barbarians are often built as brutish, front-line fighters, making them a perfect choice for players who love to get into the thick of battle. They can summon their rage as an ability to get buffs and special powers`
        desc["Alchemist"] = "Uncontested masters of alchemical items, alchemists can create free, high-level alchemical items using a daily pool of Infused Reagents, allowing them to create powerful items like bombs, mutagens, and poisons which would normally be too expensive or impractical to use, and use them either offensively or to empower the party."
        desc["Bard"] = `Bards are extremely versatile, they get all the skills, good spells, and are pretty decent in combat. You’ll often find yourself not being the best for any particular role, but great at fulfilling any role that’s needed.`
        desc["Champion"] = `Champions are Pathfinder's answer to Paladins but without the restrictive alignment requirements. They are described as emissaries for deities, and the only requirement is that their alignment be compatible with that of their deity. In combat, Champions lean into a tanky role, either by protecting their allies with their handy reaction abilities or by buffing their shield`
        desc["Cleric"] = `Clerics are the religious spellcasters of Pathfinder. They vary wildly depending on which deity they worship, and this choice affects some of the spells they can cast, whether their Divine Font is harming or healing, and what weapons they favor.`
        desc["Druid"] = `Druids harness the power of nature to fight battles and defend their allies. They cast spells from the primal school of magic and are an extremely versatile class perfect for players who like to keep their options open. Druids align themselves with a druidic order, all of which have blessings and rules to follow. One of these grants the Druid an animal companion, which is great for players who love having that sort of gameplay option available to them.`
        desc["Fighter"] = `Fighters are masters of combat who thrive on the battlefield. While they obviously focus on their martial development, there are other things that Fighters can do well. For example, they are likely to be great at intimidating others in social situations and on the battlefield, and they will probably do well when it comes to manual labor.`
        desc["Gunslinger"] = `Master of firearms and crossbows, gunslingers can feel somewhat similar to a fighter, but their ability to use firearms and crossbows to great effect makes them unique and exciting.`
        desc["Investigator"] =  `Outside of combat, the Investigator pursues one or more ongoing cases, and gets clues and bonuses when working toward solving them. They also get more skill increases than most classes, allowing them to fill a variety of skill-based rolls. In combat, the Investigator’s Devise a Stratagem feature allows them to apply their intellect in combat.`
        desc["Inventor"] = `Take PF2’s complex item mechanics and make them even more engaging. The Inventory builds around on piece of equipment (or a pet robot) and gradually improves it as they gain levels.`
        desc["Magus"] = `Live your fantasy of hitting someone with a lightning bolt a sword at the same time. The Magus blends arcane spellcasting and martial prowess in one class and can deliver spells through their weapon attacks using the Spellstrike feature.`
        desc["Monk"] = `Monks use hand-to-hand combat to defeat their enemies with alacrity and with style. This class is based on treating the body as a temple and excelling in combat with just their fists. It offers a multitude of feats that allow the Monk to use various combat stances to bolster their offense and ki spells that use energy from within the body to effect spell-like abilities.`
        desc["Oracle"] = `Players who are looking for an easy way to craft a spellcaster with an interesting background need to look no further than the Oracle. These magicians get their magical power from understanding a grand mystery of the universe, concepts and ideals that gain the attention of multiple deities.`
        desc["Psychic"] = `The Psychic is an Occult spellcaster that plays a bit like the Sorcerer. The Psychic’s spellcasting emphasizes spell slots less than most full spellcasters, instead relying more heavily on spending Focus Points to “Amp” cantrips for additional effects.`
        desc["Ranger"] = `Rangers are experts when it comes to traversing the wilderness and dealing with both wild animals and monsters. In combat, they are great and singling out a target and taking them down with stacking bonuses. They have a lot of feats that favor ranged weaponry, but they are by no means limited to them. As they level up, Rangers get better at using their Hunt Prey action, gaining bonuses when attacking their target. `
        desc["Rogue"] = `Rogues are skilled warriors with a range of character customization options that make them extremely versatile. A big draw is the huge number of skills that Rogues can train in, making them very useful in a number of situations. They can also perform sneak attacks against enemies when caught off guard, which can be a huge source of damage.`
        desc["Sorcerer"] = `Sorcerers are simply born with magic in their blood. Each Sorcerer chooses the exact source of their power during character creation, whether it be demonic, draconic or otherwise. These choices can play a role in the character's backstory or simply be a means to an end, as each grants their own skill specialties and spell lists.`
        desc["Summoner"] = `The ultimate pet class, the Summoner bonds you to a magical creature called an Eidolon which you customize as you gain levels. It’s like build-a-bear if build-a-bear let you build a dragon.`
        desc["Swashbuckler"] = `These warriors use flair and flourishes to fell their foes in battle. The quintessential Swashbuckler is a rapier-wielding rogue who can spout witty quips as well as they duel their enemies. This makes them attractive to players who want to be the star of the party and have all eyes on them.`
        desc["Thaumaturge"] = `Martial characters who study and hunt monsters, thaumaturges use special implements to gain various ability and can use their class features to impose temporary damage vulnerabilities on enemies.`
        desc["Witch"] = `Witches command power that is granted by an element of the unknown. For these spellcasters, mysterious patrons grant them their abilities through a conduit that takes the form of a spectral familiar. This familiar is a big draw for players who like the idea of taking a pet along with them and having them be crucial to their playstyle.`
        desc["Wizard"] = `Wizards are the classic spellcaster class, appealing to players who appreciate the sheer power potential of magic in Pathfinder. They are studious mages who can pull an answer to anything out of their spellbook, given enough time and preparation.`
        desc["Kineticist"] = `Masters of the elements, the Kineticist channels elemental power in a variety of ways. Depending on your choices of elements and Impulses, Kineticists can play very differently, ranging from durable Defender builds to high-damage Blaster builds. While their capabilities often feel like spells, they have neither spell slots nor Focus Points to worry about, allowing them to use their abilities freely without rest.`


        desc['Anadi'] = `Anadi people are reclusive, sapient spiders who hail from the jungles of southern Garund.`
        desc['Android'] = `Technological wonders from another world, androids have synthetic bodies and living souls.`
        desc['Automaton']  = `Automatons are immortal constructs infused with living souls who often believe they serve a grand purpose.`
        desc['Azarketi'] = `The aquatic humanoids of the Inner Sea share a somber and burdened history. Most refer to these aquatic peoples as gillmen, or sometimes Low Azlanti, though they typically refer to themselves as azarketis, an Azlanti word that translates roughly to “people of the seas."`
        desc['Catfolk'] = `Catfolk are highly social, feline humanoids prone to curiosity and wandering.`
        desc['Conrasu'] = `Conrasus are shards of cosmic force given consciousness who construct intricate exoskeletons to interface with the mortal world. Both an integral part of the underlying processes of the universe and strangely set apart, conrasus look to aeons to understand their existence.`
        desc['Dwarf'] = `Dwarves are a short, stocky people who are often stubborn, fierce, and devoted.`
        desc['Elf'] = `Elves are a tall, slender, long-lived people with a strong tradition of art and magic.`
        desc['Fetchling'] = `Once human and now something apart, fetchlings display the Shadow Plane’s ancient influence through monochrome complexions, glowing eyes, and the casting of supernatural shadows.`
        desc['Fleshwarp'] = `Fleshwarps are people whose forms were created or radically transformed by magic, alchemy, or unnatural energies. Their unorthodox appearance can make it difficult for them to find a place for themselves in the world.`
        desc['Ghoran'] = `These intelligent plant people, created by a long-dead druid, possess a sort of immortality through their seeds`
        desc['Gnoll'] = `Powerfully-built humanoids that resemble hyenas, gnolls are cunning warriors and hunters.`
        desc['Gnome'] = `Gnomes are short and hardy folk, with an unquenchable curiosity and eccentric habits.`
        desc['Goblin'] = `Goblins are a short, scrappy, energetic people who have spent millennia maligned and feared.`
        desc['Goloma'] = `Golomas fear most other people and deliberately use their unusual biology to frighten off those they consider to be dangerous predators. Rarely seen and poorly understood, golomas’ many-eyed and wooden faced visages instill terror in most they meet.`
        desc['Grippli'] = `Gripplis are a shy and cautious frog-like people who generally seek to avoid being drawn into the complicated and dangerous affairs of others. Despite their outlook and small stature, gripplis often take bold and noble action when the situation demands it.`
        desc['Halfling'] = `Halflings are a short, adaptable people who exhibit remarkable curiosity and humor.`
        desc['Hobgoblin'] = `Taller and stronger than their goblin kin, hobgoblins are equals in strength and size to humans, with broad shoulders and long, powerful arms.`
        desc['Human'] = `Humans are incredibly diverse. Some, such as half-elves and half-orcs, even have non-human ancestors.`
        desc['Kashrishi'] = `These quiet Rhino-like beings have stout, durable frames and distinctive crystalline horns. Their inherent psychic abilities make them natural empaths but also occasionally burden them with the unceasing thoughts of their neighbors.`
        desc['Kitsune'] = `Kitsune are a charismatic and witty fox-like people with a connection to the spiritual that grants them many magical abilities, chiefly the power to shapechange into other forms. Whether they pass unseen among other peoples or hold their tails high, kitsune are clever observers of the societies around them.`
        desc['Kobold'] = `Kobolds are small, reptilian creatures with outsized personalities and a love of dragons.`
        desc['Leshy'] = `Guardians and emissaries of the environment, leshies are immortal spirits of nature temporarily granted a physical form.`
        desc['Lizardfolk'] = `Lizardfolk are consummate survivors, heirs to empires considered ancient even by the elves.`
        desc['Nagaji'] = `With humanoid figures and serpentine heads, nagaji are heralds, companions, and servitors of powerful nagas. They hold a deep reverence for holy areas and spiritual truths, an aspect many others find as intimidating as a nagaji’s appearance.`
        desc['Orc'] = `Orcs are proud, strong people with hardened physiques who value physical might and glory in combat.`
        desc['Poppet'] = `Poppets are small, basic constructs that typically help their owners with simple tasks.`
        desc['Ratfolk'] = `Ratfolk are small, clever, and adaptable humanoids with ratlike features and a love of community.`
        desc['Shisk'] = `Shisks are secretive mountain-dwellers, bone-feathered humanoids who lurk underground in dark tunnels and caverns. Their fascination with collecting and protecting esoteric knowledge is one of the few things that can persuade them to explore the outside world.`
        desc['Shoony'] = `Diminutive humanoids who resemble squat, bipedal dogs, shoonies are sometimes mistaken for weak and insular pacifists. However, their sheer perseverance, incredible work ethic, and resourceful use of diplomacy make shoonies far from helpless.`
        desc['Skeleton'] = `Skeletons are considered among the lowest types of undead.`
        desc['Sprite'] = `Sprites are diminutive, whimsical, and exuberant creatures from the fey realm known as the First World.`
        desc['Strix'] = `Known as itarii in their own language, strix are reclusive avian humanoids devoted to their homelands and their tribes. They defend their precious communities with broad wingspans and razor talons.`
        desc['Tengu'] = `Tengus are gregarious and resourceful avian humanoids who collect knowledge and treasures alike.`
        desc['Vanara'] = `Vanaras are inquisitive and mischievous monkey-like humanoids with short, soft fur, expressive eyes, and long, prehensile tails. Their handlike feet and agile builds serve them well in the jungle realms where most vanaras live.`
        desc['Vishkanya'] = `Vishkanyas are ophidian humanoids who carry potent venom within their blood and saliva. Largely misunderstood due to old tales of their toxicity and natural finesse, vishkanyas work to grow into more than just what stories paint them to be.`

        Object.keys(links).forEach(key=>{
            var link = links[key]
            if (desc[link.innerHTML] != undefined) {
                $(link).wrap(`<span title="${desc[link.innerHTML]}"><span>`)
            }
        })
    }
})
class CustomOldEnglish extends JournalSheet {
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push('custom-old-english');
		return options;
	}
}
class CustomOne extends JournalSheet {
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push('custom-one');
		return options;
	}
}
Hooks.on("init", (documentTypes) => {
    console.log("My Custom Journals | Registering ");
    /*CUSTOMIZE
     * Here, register your sheet so it shows up properly in the dropdown, just change
     * for your sheet name and you're good to go
     */
    Journal.registerSheet("journals", CustomOldEnglish, {
        label: "Custom Olde English",
        types: ["base"],
        makeDefault: false
    });
    Journal.registerSheet("journals", CustomOne, {
        label: "Custom One",
        types: ["base"],
        makeDefault: false
    });
    
    console.log("Custom Journals | Ready.")
});
//todo
//add player core rules
//remove sections and menu on tutorial front sheet
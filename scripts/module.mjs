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
    var el = html.find('.sheet-content').find('.character-details').find(".pc_deity ").find(".detail-item-control");
    var new_html = '<a class="item-control deity-browse" data-filter="" data-level="1"><i class="fas fa-fw fa-edit"></i></a>'
    el.after(new_html);el.hide();
    var set_element = html.find('.sheet-content').find('.character-details').find(".pc_deity").find(".deity-browse");    
    set_element.on("click", async event=>{
            const compendiumBrowser = game.pf2e.compendiumBrowser;
            const deityTab = game.pf2e.compendiumBrowser.tabs.deity, filter = await deityTab.getFilterData();
            return deityTab.open(filter)
    })
    
}
function add_heritage_link_to_actor_sheet(html){
    var el = html.find('.sheet-content').find('.detail-sheet').find(".pc_heritage").find(".open-compendium");
    var new_html = '<a class="item-control heritage-browse" data-filter="" data-level="1"><i class="fas fa-fw fa-edit"></i></a>'
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
        lang_title.after((langAvail>0)?`<span class='tags addLangs'><span class='tag'>Add Bonus Languages to choose: ${langAvail}</span></span>`:
                        `<span class='tags addLangs'><span class='tag'>Too many Bonus languagues. Limit of ${totLang}</span></span>`)
        //skills
        const [type2,scope,packId,id] = uuid.split(".");
        var classData = await game.packs.get(`${scope}.${packId}`).getDocument(id);
        var addSkills = classData.system.trainedSkills.additional;
        var totSkills = backFeats.length + classFeats.length + addSkills;
        var charSkills = data.data.skills;
        var cnt=0;Object.entries(charSkills).forEach(([key, skill])=>{cnt=cnt+((skill.modifiers[1].label!="Untrained")?1:0)});
        var skillsLeft=totSkills-cnt;
        if (skillsLeft!=0) 
            skillTitle.before((skillsLeft>0)?`<p class='tags addSkills'><span class='tag'>Additional skills to choose: ${skillsLeft}</span></p>`:
                        `<p class='tags addSkills'><span class='tag'>Too many skills. Limit of ${totSkills} ${skillsLeft}</span></p>`)  
    
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
});
Hooks.on('renderSpellPreparationSheet', async (app,html,data) => { 
    var id = data.entry.id, spellbook = Object.entries(data.document.spellcasting),
    entries = spellbook[0][1], book = entries.get(id).entry.spells, limit = entries.get(id).entry.system.prepared,
    spells = await book.getSpellData(), spellcount = spells.spellPrepList;
    add_spell_counter_to_prep_sheet(html,limit, spellcount)
}) 
console.debug("PF2e System | PF2e Character Builder - SpellBuilder | Started "); 
export const modName = "PF2e Character Builder";
const mod = "pf2e-char-builder";

/******** Start of Feats Modifications *****/
var rootPath = "flags.pf2e.spellcasting.templates", builtRules = [], spellEntries=[];
//add choice set to Bloodline:Genie feat Compendium.pf2e.classfeatures.tYOMBiH3HbViNWwn
//add choice set to Eiodolon feat Compendium.pf2e.classfeatures.qOEpe596B0UjhcG0
async function compendiumSpellModifications(modifications, modify){
    //modify = false; /********* added ************/
    console.debug([`${mod} - modifying feat modification for spells:`,modifications, (modify)?"Updating.....":"Deleting....."])
    for (let modIdx of modifications.index){
        var compendium = await modifications.getDocument(modIdx._id)
        var classRules = compendium.system.rules, featRules=[]
        var isSpell = (classRules[0].label != "direct_tx") 
        //make sure all direct_tx has slug to work properly
        
        if (isSpell) classRules.forEach(feat=>{featRules.push(feat.value)})
        else featRules = compendium.system.rules
        
        console.debug(["starting compendium",compendium.name,compendium,classRules,featRules,!isSpell])
        
        //if (!isSpell){//just do direct or spells **********
            //console.debug(["looking at featRules",featRules])
            for (let entry of featRules){
                //console.debug(["looking at entries",entry])
                if (entry == undefined) continue
                if(entry.id == undefined) { console.debug(["entry.id not found *******"]); continue;}
                var id = entry.id, id=id.split("."), db=`${id[1]}.${id[2]}`;
                var feat = await game.packs.get(db).getDocument(id[4])
                if (feat!=null){
                    ///console.debug(["looking at feat",feat,id[4]])
                    //if (id[4] == "y0jGimYdMGDJWrEq"){/****************** jcp    ********/
                        //console.debug(["working on feat",feat.name,id[4],feat])
                        
                        var originRules = feat.system.rules
                        var rules = (isSpell) ? process_spell_commands(originRules,entry, modify)
                                : process_direct_commands(originRules, entry, modify)
                        
                        if (rules) {
                                await Item.updateDocuments([{_id: id[4], system:{rules: rules} }], {pack: db});
                                var descript = (modify)?"no of modifications":"reset to"
                                console.debug("updating rules",[id[4], feat.name, rules, `${descript}: ${rules.length}`]  );
                        }
                    //}/****************** jcp    ********/
                } else console.debug(["*****  feat not found   *****", db,id[4]])
            }
        //}/****************** jcp    ********/
    }
    return (modify)?"Wizard Generator has been added":"Wizard Generator has been removed";
}
function process_direct_commands(originRules, entry, modify){
    //console.debug(["direct process", originRules, entry])
    var rules = false;
    if(!(originRules.find(selected=>selected.slug==entry.slug))){
        if(modify){
            var rule=entry; delete rule.label; originRules.push(rule);rules = originRules
        }
    } else if(!modify){rules = originRules.filter(selected=>selected.slug!=entry.slug)}   
    //console.debug(["Got Rules",rules, originRules])     
    return rules
}
function process_spell_commands(originRules, entry, modify){
    builtRules = []; 
    if (entry.tradition !== undefined) createLine("tradition",entry.tradition,entry.slug)
    getLines(entry.rules, entry.slug );
    var rules = (modify) ? addLines( originRules,builtRules) : delLines(originRules,builtRules);
    var rules = (!modify || (modify && rules.length)) ? rules : false
    return rules
}
function addLines(orig,changes){
    var Condition = false;
    if  ( (! orig instanceof Array ) ||   (! changes instanceof Array ) ) return [];
    if (changes.length == 0) return []
    var validRules = [];
    changes.forEach((val,idx)=>{
        if (!orig.some((statement) => {     
             if (val == null || statement == null) return;
             if ((val.mode == statement.mode) && (val.path == statement.path) && (val.priority == statement.priority)){ return true } }) 
        ) {validRules.push(val)}    
    })
    if (validRules.length == 0) return []
    return [...orig, ...validRules];
}
function delLines(orig,changes){
    var Condition = false;
    if  ( (! orig instanceof Array ) ||   (! changes instanceof Array ) ) return [];
    if (changes.length == 0) return []
    var validRules = [];
    orig.forEach((val,idx)=>{
        if (!changes.some((statement) => {     
             if (val == null || statement == null) return;
             if ((val.mode == statement.mode) && (val.path == statement.path) && (val.priority == statement.priority)){ return true } }) 
        ) {validRules.push(val)}    
    })
    if (validRules.length == 0) return []
    return [...validRules];;
}
function getLines(data, rootSuffix){
    if (data instanceof Array) {
        data.forEach((list, key)=>{
            if (list instanceof Array) {getLines(list, rootSuffix) } 
                else if (list instanceof Object) {getLines(list, rootSuffix) } 
                    else createLine(key, list, rootSuffix)
        })
    } else {
        Object.keys(data).forEach( label =>{
            var slug = "", titleLabel = isNaN(label) ? "." + label : "" 
            var slug = (data.slug !== undefined) ? `.${data.slug}` : ""
            if ((data[label] instanceof Array)) slug =  slug +`.${label}` 

            if (data[label] instanceof Array) {getLines(data[label],`${rootSuffix}${slug}` ) } 
                else if (data[label] instanceof Object) {getLines(data[label], `${rootSuffix}${slug}`)} 
                    else createLine(label, data[label], `${rootSuffix}${slug}`)
        } );
    }
    return builtRules
}
function createLine(label, val, rootSuffix ){
    var lastSeg = rootSuffix.split("."), lastSeg = lastSeg[lastSeg.length -1], term
    if (isNaN(label)) term=label; else {
        var newSeg = lastSeg;
        if (["books","slots","filters"].includes(lastSeg) ) {newSeg = lastSeg.substr(0,lastSeg.length -1); }//term = `${term}${label}`
        if (["books","slots"].includes(lastSeg)) {label = `${label}.max`}
        term = `${newSeg}${label}`
    };
    var obj = {key:"ActiveEffectLike",mode:"override",path:`${rootPath}.${rootSuffix}.${term}`,priority:33,value: val} 
    builtRules.push(obj)
    return obj
}
/******** End of Feats Modifications *****/

/******** Start of spellbook Creation *****/
async function processEachSpellBook(data){
    var actor = game.actors.get(data.actor._id)

    if (actor.flags.pf2e?.spellcasting !=undefined){
        var spellSets = actor.flags.pf2e.spellcasting.templates
        if (spellSets !== undefined ) await cycleThruCollectedSpellBooks(collectSpellBooks(spellSets, actor), actor)
        addSpellsGrantedToClericFromDeity(actor)
    }
    else ui.notifications.info("There are no registered spellbooks for your character's class");

}
function collectSpellBooks(spellSets, actor){
    var entries = [],  pass=0, morePasses = false, info;
    do {
        morePasses = false;
        Object.keys(spellSets).forEach( async actorClass  => {
            var spellBooks = spellSets[actorClass]
            var actorClassName = (spellBooks.class === undefined) ? actorClass : spellBooks.class;
            if (spellBooks.condition === undefined || spellConditionMet(actor, spellBooks.condition) ) {
                if (spellBooks.spells !== undefined){
                   for (let key in spellBooks.spells){
                        var spellBook = spellBooks.spells[key], spellPass = (spellBook.pass !== undefined) ?  spellBook.pass : (spellBooks.pass !== undefined ? spellBooks.pass : 0)
                        if(spellBook != "folder"){
                            if (spellPass == pass) {  
                                console.debug(["collect",spellBook])
                                if(spellBook.slug != "undefined") spellBook.slug = key; //forgiveness for forgetting slug in spellbook
                                if( spellBook.slug.includes("-") ) data = spellBook.slug.split("-")[1]  
                                var dedication = (actor.class.name.toLowerCase() != actorClassName) ? "-dedication" : ""                           
                                spellBook.key = key; spellBook.class = actorClassName; spellBook.slug = `${spellBook.class}-${spellBook.slug}${dedication}`,
                                spellBook.tradition = (spellBook.tradition !== undefined) ?  spellBook.tradition : (spellBooks.tradition !== undefined ? spellBooks.tradition : undefined)
                                if (spellbookValid(spellBook,actor)) entries.push(spellBook)
                            }
                            if (spellPass > pass) morePasses = true;
                        }
                    }
                }
            }
        })
        pass =+ 1;
    }
    while (morePasses);
    return entries
}
function spellbookValid(spells,actor){
    //added for compatibility with dedications
    var data = spells.slug.split("-"), spellClass = data[0].toLowerCase(),
    isCharClass= actor.class.name.toLowerCase() == spellClass,
    isValidDedication=((!isCharClass) && (data[1] == "main"));

    return (isValidDedication || isCharClass)
}
function spellConditionMet(actor, conditions){
    var res = false; Object.keys(conditions).forEach(key => {if (conditions[key].type == "feat") res = actor.items.some(feat=>conditions[key].value == feat.slug)})
    return res;
}
async function cycleThruCollectedSpellBooks(entries, actor){
    var actorSpellEntries;    
    //console.debug(["entries",entries]);
    for (let entry of entries){
        //console.debug(["entry",entry]);
        var entryExists = actor.spellcasting.collections.find(el=>{return el.entry.slug.value==entry.slug})
        //create or retrieve SpellcastingEntryPF2e
        actorSpellEntries = (! (entry.id = (entryExists) ? entryExists.id : false) ) 
            ? await createSpellEntryFromSource(actor,getSysInfo(actor,entry)) 
            : await actor.getEmbeddedDocument("Item",entry.id);
        
        entry.id = (entry.id)? entry.id : actorSpellEntries.id; 
        //console.debug(["entry enter",actorSpellEntries, entry]);
        await addSpellBookModifications(entry, actor)    
    }
}
function getSysInfo(actor, spells){
    var spellType = (spells.type !== undefined) ? spells.type: "focus", spellsAbility = (spells.ability !== undefined) ? spells.ability : actor.class.system.keyAbility.selected;
    var info ={"proficiency" : "1", "tradition" :  (spells.tradition !== undefined) ? spells.tradition : spells.tradition,
               "prepared": spellType, "ability": spellsAbility,"slug":  spells.slug}
    if (spells.name !== undefined ) info["name"] = spells.name;  

    return info;
}  
async function createSpellEntryFromSource(actor,spellbook){
    console.debug(["initial",spellbook])
    var model = (await game.packs.get("pf2e-char-builder.pf2e-cb-actors").getDocument( 
                            game.packs.get("pf2e-char-builder.pf2e-cb-actors").index.contents[0]._id
                )).spellcasting.contents[0]
    var addition = (await (actor.createEmbeddedDocuments("Item", [model]))).shift()
    var data = {_id: addition.id, 
        system: {
            tradition: {value: spellbook.tradition},
            prepared: {value: spellbook.prepared},
            ability: {value: spellbook.ability},
            slug: {value: spellbook.slug}
        } 
    }
    var className = cap(spellbook.slug.split("-")[0])
    //rename spellbook: append spec name to configured name
    data[`name`] = (spellbook.name !== undefined) ? className + " - " + spellbook.name + " - " + cap(spellbook.tradition) + " " + cap(spellbook.prepared) + " Spells"
        : className + " - " + cap(spellbook.tradition) + " " + cap(spellbook.prepared) + " Spells"
    console.debug(["data",data]);
    return (await actor.updateEmbeddedDocuments("Item", [data])).shift()
}
function cap(word){return (word!==undefined)?word.charAt(0).toUpperCase() + word.slice(1):""}
async function addSpellBookModifications(spells, actor){
    //console.debug(["spells",spells]) 
    var data = spells.slug.split("-"), isCharClass= actor.class.name.toLowerCase() == data[0],
    isValidDedication=((!isCharClass) && (data[1] == "main"));
    
    if (isValidDedication || isCharClass)  addSpellSlots(spells, actor)
    if (isCharClass) addSpelltoSpellbook(spells, actor)
}
async function getClassSpellSlots(actor){
    //get journal of class retrive spell qty and level info
    var data = {}, lvl = 0, journal = actor.class.system.description.value, 
    start = journal.indexOf("@UUID"), word=journal.substring(start,journal.indexOf("]",start)), info=word.split(".");
    var desc = (await game.packs.get("pf2e.journals").getDocument(info[4])).getEmbeddedCollection("pages").get(info[6]).text.content
    var $div = $(document.createElement("div")).html(desc).find("table");
    var $row = $div.find('th:contains("Cantrips")').closest("table").find("tr:eq("+actor.level+")"), $rowData = $row.find("td");
    $rowData.each((idx,el)=>{//cycle thru columns
        var spellAmt=el.innerHTML; spellAmt=spellAmt.substr(0,1); 
        //console.debug(["count",el.innerHTML, lvl, spellAmt ])
        if (lvl!=0){
            if (!isNaN(spellAmt)){ data[`system.slots.slot${lvl-1}.max`] = spellAmt; data[`system.slots.slot${lvl-1}.value`] = spellAmt;}
        }
        lvl += 1;
    })
    return data
} 
async function addSpellSlots(spells, actor){
    var data = {};
    //add spell slots & spells learn 
    if (spells?.perRank != undefined) {
            var books = spells.books; books.perRank=spells.perRank,books.slots = actor.spellcasting.get(spells.id).system.slots
            data = await getSlotsPerRank(actor,books) //rank
        }
        else if ((spells.slots !== undefined && spells.key!="main") ||  (spells.key=="main" && actor.class.name.toLowerCase() != spells.class) ){//general
            //console.debug(["slots",spells.slots])
            var slots = spells.slots;
            Object.keys(slots).forEach(async function(key) {
                //check for folder
                if (key!="_folder"){var qty = slots[key].max; data[`system.slots.${key}.max`] = qty; data[`system.slots.${key}.value`] = qty; }
            })
        } 
            else {//get main spell slots from table in Journal //class
                if (spells.key=="main" && (spells.type !== undefined)) {
                    var foundSlots = await getClassSpellSlots(actor)
                    data = {...data, ...(foundSlots)}
                }    
            }
    if (spells.books !== undefined){
        if (data["system.prepared.value"]=="prepared"){ data[`system.prepared.cantrip`] = spells.books.book0.max; data[`system.prepared.spells`] = spells.books.totals;}
    } 
    if (! $.isEmptyObject(data)){ 
        data["_id"]=spells.id;  await actor.updateEmbeddedDocuments("Item", [data]) 
        console.debug(["slots added",data])
    }
}
async function getSlotsPerRank(actor,limits){
    var level = actor.level, slots = limits.slots , data = {}, maxLevel = Math.ceil((actor.level)/2)
    for (let i = 0; i < 11; i++) {
        if (maxLevel >= i) { 
            if (slots[`slot${i}`]?.max != limits.perRank){
                data[`system.slots.slot${i}.max`] = limits.perRank; data[`system.slots.slot${i}.value`] = limits.perRank;
            }     
        }
    }
    return data;
}
export async function addSpelltoSpellbook(spells, actor, update=false){
    //add spells
    var data = spells.slug.split("-"), className=data[0], bookName=data[1], suffix = (bookName=="main")?" - Bonus":"",
        spellCollection = []
    if (spells.spellList !== undefined){
        var spellArrays = spells.spellList;
        Object.keys(spellArrays).forEach(spellIndex=>{
            var spelsPerLevel = spellArrays[spellIndex];
            Object.keys(spelsPerLevel).forEach(async spellName=>{ 
                if (spellName!="_folder"){
                    if (Number(spellIndex) <= Math.ceil(actor.level/2) ){
                        var spellFound = actor.items.find(el=>el.sourceId==spelsPerLevel[spellName]),//check if spell exists --- need to add
                        spell_id = spelsPerLevel[spellName], splitW = spell_id.split("."),
                        spelldb = `${splitW[1]}.${splitW[2]}`, spell_id = splitW[4]; 
                        var spellOrig = await game.packs.get(spelldb).getDocument(spell_id);
                        //console.debug(["spellClone",spellIndex, spellName, spelldb,spell_id,spellObj, spellFound])
                        console.debug(["attempted to add:",spellOrig,spell_id,spellName]);
                        if(spellOrig != null) {    
                            var spellClone = await ((spellOrig))
                                .clone({"name":`${spellOrig.name}${suffix}`,"system.location.value": spells.id,"system.isBonus":true}).toObject()
                            //console.debug(["name",spellOrig,spellOrig.name,bookName, !spellFound])
                            if (!spellFound) {
                                await actor.createEmbeddedDocuments("Item", [spellClone])
                                console.debug(["added ",spellOrig.name,spellClone]);
                            }
                        } else console.debug(["Spell not found ",spellOrig,spell_id,spellName,spelsPerLevel])
                    }
                }
            })
        })
    }     
    return (update) ? spellCollection : spells;
}
async function checkForDeityDomainFeats(actor){
        //find targets
        //     add for oracle mysteries
        //     add logic for sorcerer bloodline genie
        var feats = [], domain//, slug = actor.class.slug , domains = [];
        var slugs = ["domain-initiate","deitys-domain","advanced-domain","advanced-deitys-domain"];
        actor.items.forEach(el=>{if(slugs.includes(el.slug)){
            feats.push(el)
        }})
        feats.forEach(async (feat, idx) =>{
            feat.system.rules.some(rule=>{if (rule.key=="ChoiceSet") {domain=rule.selection;return true}})        
            //using journal entries
            var source = await getDomainSpells(domain); 
            var sourceRule = source[feat.system.level.value==1?0:1]; 

            var sourcePath = sourceRule.path;
            sourceRule.path = sourcePath.replace("classname", feat.system.traits.value[0]);
            var targetRules = feat.system.rules;
            if ( !( targetRules.some(el=>{return el.path==sourceRule.path} ) ) ){//if rule not embedded 
                targetRules.push(sourceRule);
                //targetRules = addFolders(targetRules);
                await actor.updateEmbeddedDocuments("Item", [{_id: feat.id, "system.rules": targetRules}]) 
                console.log(`${modName} - Rule added to domain feat for spellbook`)
            } 
        })
}
function journalSpellsBreakdown(text, level){
    var value = "Compendium." + text.substring(1,text.indexOf("]")) , name = text.substring( text.indexOf("{") + 1  , text.indexOf("}")) 
    name = name.replaceAll(" ","_");
    return createFeatRule( level , name,  value )
}
async function  getDomainSpells(domain){
   var spells = []
   domain = domain.replace(/\w\S*/g,function (txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});//title-case
   var domain_journal = (await game.packs.get("pf2e.journals").getDocuments({"name": "Domains"})).shift().pages.contents
   var found = domain_journal.filter(journal=>journal.name == `${domain} Domain`)
   if (found){
       var compendium = (found.shift().text.content.split("Compendium")).reverse()
       spells[1] = journalSpellsBreakdown(compendium.shift(),4)
       spells[0] = journalSpellsBreakdown(compendium.shift(),1)
       found = spells
   } else found = false;
   
   return found;
}
function createFeatRule(level,name,value) {
   return {
       key: "ActiveEffectLike",
       mode: "override",
       path: `${rootPath}.classname.spells.focus.spellList.${level}.${name}`,
       priority: 33,
       value: value
   }
}
async function addSpellsGrantedToClericFromDeity(actor){
   if (actor.class.name=="Cleric"){
       var spells = actor.deity.system.spells, slug = `${actor.class.name}-main`, suffix = " - Bonus",
       spellsToPost = [] 
       slug=slug.toLowerCase()
       var entry = actor.spellcasting.collections.find(el=>{return el.entry.system.slug.value==slug})
       
       if (entry){
           for (let spellIndex of Object.keys(spells)){
               if (Number(spellIndex) <= Math.ceil(actor.level/2) ){
                   var spellFound = actor.items.find(el=>el.sourceId==spells[spellIndex])//check if spell exists in book
                   if (!spellFound) {
                        var spell_id = spells[spellIndex], splitW = spell_id.split(".")
                        var spelldb = `${splitW[1]}.${splitW[2]}`, spell_id = splitW[4];
                        var deitySpell = await game.packs.get(spelldb).getDocument(spell_id)
                        if (deitySpell!=undefined){
                            var spellClone = await deitySpell.clone({"name":`${deitySpell.name}${suffix}`,"system.location.value": entry.id,"system.isBonus":true}).toObject()         
                        spellsToPost.push(spellClone)
                        } else console.debug(["****  Could not find spell in database"])
                   }
               }
           }
           var result = await actor.createEmbeddedDocuments("Item", spellsToPost)
       }
   }
}
/******** End of spellbook Creation *****/

//==========================
// Settings utilities
//==========================
export class Settings {
    static registerSettings() {
        /*
        game.settings.registerMenu(mod, "settingsMenu", {
            name: "Configuration",
            label: "Modifications",
            icon: "fas fa-cog",
            type: AddRemoveConfig,
            restricted: true,
        });
        */
        game.settings.register(mod, 'showCharTut', {
            name: 'Auto Tutorial',
            hint: 'check box if you do not wish tutorial to automatically run when character sheet is pulled up',
            scope: 'client',     // "world" = sync to db, "client" = local storage
            config: true,       // false if you dont want it to show in module config
            default: false,
            type: Boolean       // Number, Boolean, String, Object
        });
        game.settings.register(mod, 'isCompiled', {
            name: 'Add Spell Generator Wizard',
            //hint: 'Indicator the info has been compiled',
            scope: 'world',     // "world" = sync to db, "client" = local storage
            config: true,       // false if you dont want it to show in module config
            type: Boolean,       // Number, Boolean, String, Object
            default: false,
            onChange: value => { // value is the new value of the setting
                this.updateSpellCompendiums(value);
            }
        });
        game.settings.register(mod, 'charOnly', {
            name: 'Session 0 Environment',
            hint: 'Foundry interface focus on creating characters, removing non essentials display items',
            scope: 'world',     // "world" = sync to db, "client" = local storage
            config: true,       // false if you dont want it to show in module config
            type: Boolean,       // Number, Boolean, String, Object
            default: false
        });
        game.settings.register(mod, 'storeVerbage', {
            name: 'Store location description',
            hint: 'Fill with verbiage to describe store in Canvas, leave blank if not available',
            scope: 'world',     // "world" = sync to db, "client" = local storage
            config: true,       // false if you dont want it to show in module config
            type: String,       // Number, Boolean, String, Object
            default: "",
            onChange: value => { // value is the new value of the setting
                console.debug(["hello variable"])
            }
        });
        game.settings.register(mod, 'viewing_store', {
            name: 'viewing Store',
            scope: 'client',     // "world" = sync to db, "client" = local storage
            config: false,       // false if you dont want it to show in module config
            type: Boolean,       // Number, Boolean, String, Object
            default: false,
        });
        game.settings.register(mod, 'current_tab', {
            name: 'current tutorial tab',
            scope: 'client',     // "world" = sync to db, "client" = local storage
            config: false,       // false if you dont want it to show in module config
            type: String,       // Number, Boolean, String, Object
            default: "",
        });
        game.settings.register(mod, 'gm_char', {
            name: 'gm character token simulator',
            scope: 'client',     // "world" = sync to db, "client" = local storage
            config: false,       // false if you dont want it to show in module config
            type: String,       // Number, Boolean, String, Object
            default: "",
        });
    }
    static async updateSpellCompendiums(isSubmit) {
        var db = "pf2e-char-builder.pf2e-cb-addons";
        var classFeats = game.packs.get("pf2e.classfeatures")
        var regFeats = game.packs.get("pf2e.feats-srd")
        await classFeats.configure({locked:false})
        await regFeats.configure({locked:false})
        if (classFeats.locked) ui.notifications.info("***  Could not unlock Class Features ***")
        ui.notifications.info("*** Modifying Class Features ***")
        var msg = await compendiumSpellModifications(game.packs.get(db), isSubmit);
        ui.notifications.info(msg);
        await classFeats.configure({locked:true})
        await regFeats.configure({locked:true})
    }
}

// Edit functions
class AddRemoveConfig extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "add-remove-enhance-confing";
        options.template = `modules/${mod}/templates/settings/add-remove.hbs`;
        options.width = 500;
        return options;
    }
    get title() {
        return "Add / Remove Modifications";
    }
    async getData(options) {
        return {
            msg: game.settings.get(mod,'isCompiled')?"Reset Compendium Rules to Original":"Modify Compendium Rules"
          };
    }
    async _updateObject(event, formData) {
        game.settings.set(mod,'isCompiled',!isSubmit)
        const isSubmit = (event.submitter.id=="submit") 
        var db = "pf2e-char-builder.pf2e-cb-addons";
        //var db = "world.jeff-tests";
        var msg = await compendiumSpellModifications(game.packs.get(db), isSubmit);
        ui.notifications.info(msg);
        //game.settings.set(mod,'isCompiled',!isSubmit)
    }
}

/*** end of classes */

function add_spellcaster_generator(app,html,data){
    var new_html = $('<div class="wizSection"><a class="blue wizard" title="Generate Spells"><i class="fas fa-bolt"></i>Generate</a><div>');
    var el2 = html.find('.sheet-content').find(".spellcasting").find('[data-action="spellcasting-create"]')
    el2.width(200)
    el2.after(new_html); 
    html.find('.sheet-content').find(".spellcasting").find('.wizSection').prepend(el2)
    
    new_html.on("click", async event=>{
        processEachSpellBook(data);
        return;
    })
}

async function checkifClassDeletedToRemoveSpells(actor,html){
        var content = await renderTemplate(`modules/${mod}/templates/actors/delete-spellcasting-dialog.hbs`)
        let d = new Dialog({
            title: "Delete All SpellBook?",
            content: content,
            buttons: {
                yes: {
                icon: '<i class="fas fa-check"></i>',
                label: "Yes",
                callback: async () => {await removeAllSpells(actor) }
                },
                no: {
                icon: '<i class="fas fa-times"></i>',
                label: "No",
                callback: () => console.log(`${mod} - all spellbooks retained`)
                }
            },
            default: "no"
        });
        await d.render(true);
}
async function removeAllSpells(actor){
    var delDocIds = []
    actor.items.forEach(el=>{if (el.constructor.name=="SpellcastingEntryPF2e"){delDocIds.push(el.id)}})
    await actor.deleteEmbeddedDocuments("Item",delDocIds); console.log(`${mod} - all spellbooks deleted`)
    console.log(`${mod} - all spellbooks deleted`)
}

//==========================
// Hooks
//==========================
Hooks.once( "init", function() {
    Settings.registerSettings();
    CONFIG.debug.hooks = !CONFIG.debug.hooks;
    if (CONFIG.debug.hooks)
        console.log("NOW LISTENING TO ALL HOOK CALLS!");
    else
        console.log("HOOK LISTENING DISABLED.");
    });
Hooks.on('renderCharacterSheetPF2e', (app, html, data) => {
    if (game.settings.get(mod,'isCompiled')){
        var actor = game.actors.get(data.actor._id);
        if((data.class !== null)) {
            add_spellcaster_generator(app,html,data)
        }   
        checkForDeityDomainFeats(actor); 
    }
});
Hooks.on('renderActorSheet', (app, html, data) => {
    var actor = game.actors.get(data.actor._id);
    //add and spellbook exists
    if (actor.class==null) 
       if (actor.constructor.name == "CharacterPF2e")
           if(actor.spellcasting.collections.contents.length != 0)
               checkifClassDeletedToRemoveSpells(actor, html)
});
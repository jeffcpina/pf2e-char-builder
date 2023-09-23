console.debug("PF2e System | PF2e Character Builder - SpellBuilder | Started "); 
export const modName = "PF2e Character Builder";
const mod = "pf2e-char-builder";
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
function setHasElement(set, value) {
    return set.has(value)
}
const MAGIC_SCHOOLS = new Set(["abjuration", "conjuration", "divination", "enchantment", "evocation", "illusion", "necromancy", "transmutation"])
  , MAGIC_TRADITIONS = new Set(["arcane", "divine", "occult", "primal"]);

class ItemPF2e extends Item {
    get slug() {
        return this.system.slug
    }
    get sourceId() {
        var _a;
        return ((_a = this.flags.core) == null ? void 0 : _a.sourceId) ?? null
    }
    get schemaVersion() {
        var _a;
        return Number((_a = this.system.schema) == null ? void 0 : _a.version) || null
    }
    get description() {
        return this.system.description.value.trim()
    }
    get grantedBy() {
        var _a, _b;
        return ((_b = this.actor) == null ? void 0 : _b.items.get(((_a = this.flags.pf2e.grantedBy) == null ? void 0 : _a.id) ?? "")) ?? null
    }
    get isTemporary() {
        return !!this.actor && !this.actor.items.has(this.id ?? "")
    }
    _initialize() {
        this.rules = [],
        super._initialize()
    }
}

class SpellcastingEntryPF2e extends ItemPF2e {
    get ability() {
        return this.system.ability.value || "int"
    }
    get tradition() {
        const defaultTradition = this.system.prepared.value === "items" ? null : "arcane"
          , tradition = this.system.tradition.value;
        return setHasElement(MAGIC_TRADITIONS, tradition) ? tradition : defaultTradition
    }
    get category() {
        return this.system.prepared.value
    }
    get rank() {
        return this.system.proficiency.value ?? 0
    }
    get isPrepared() {
        return this.system.prepared.value === "prepared"
    }
    get isFlexible() {
        return this.isPrepared && !!this.system.prepared.flexible
    }
    get isSpontaneous() {
        return this.system.prepared.value === "spontaneous"
    }
    get isInnate() {
        return this.system.prepared.value === "innate"
    }
    get isFocusPool() {
        return this.system.prepared.value === "focus"
    }
    get isRitual() {
        return !1
    }
    get highestLevel() {
        var _a;
        return ((_a = this.spells) == null ? void 0 : _a.highestLevel) ?? 0
    }
    get showSlotlessLevels() {
        return this.system.showSlotlessLevels.value
    }
    prepareBaseData() {
        var _a, _b, _c;
        super.prepareBaseData(),
        (_a = this.system.proficiency).slug || (_a.slug = this.system.tradition.value),
        this.system.proficiency.value = Math.max(1, this.system.proficiency.value),
        (_b = this.system.prepared).flexible ?? (_b.flexible = !1),
        (_c = this.system.prepared).validItems || (_c.validItems = null),
        this.actor && (this.statistic = new Statistic(this.actor,{
            slug: this.slug ?? game.pf2e.system.sluggify(this.name),
            label: "PF2E.Actor.Creature.Spellcasting.InvalidProficiency",
            check: {
                type: "check"
            }
        }))
    }
    prepareSiblingData() {
        if (!this.actor || this.system.prepared.value === "items")
            this.spells = null;
        else {
            this.spells = new SpellCollection(this);
            const spells = this.actor.itemTypes.spell.filter(i=>i.system.location.value === this.id);
            for (const spell of spells)
                this.spells.set(spell.id, spell);
            this.actor.spellcasting.collections.set(this.spells.id, this.spells)
        }
    }
    prepareActorData() {
        const actor = this.actor
          , tradition = this.tradition;
        if (actor.isOfType("character") && !this.isInnate && tradition) {
            const proficiency = actor.system.proficiencies.traditions[tradition]
              , rank = this.system.proficiency.value;
            proficiency.rank = Math.max(rank, proficiency.rank)
        }
    }
    getLinkedItems() {
        var _a;
        return ((_a = this.actor) == null ? void 0 : _a.itemTypes.spell.filter(i=>i.system.location.value === this.id)) ?? []
    }
    canCast(spell, {origin}={}) {
        if (this.system.prepared.value === "items")
            return origin ? this.system.prepared.validItems === "scroll" ? origin.traits.has("scroll") : !0 : !1;
        const isSpellcastingFeature = this.isPrepared || this.isSpontaneous;
        if (origin && !isSpellcastingFeature || !this.spells)
            return !1;
        const matchesTradition = this.tradition && spell.traditions.has(this.tradition)
          , isInSpellList = this.spells.some(s=>s.slug === spell.slug);
        return matchesTradition || isInSpellList
    }
    async cast(spell, options={}) {
        const consume = options.consume ?? !0
          , message = options.message ?? !0
          , slotLevel = options.level ?? spell.level
          , valid = !consume || spell.isCantrip || await this.consume(spell, slotLevel, options.slot);
        if (message && valid) {
            const castLevel = spell.computeCastLevel(slotLevel);
            await spell.toMessage(void 0, {
                rollMode: options.rollMode,
                data: {
                    castLevel
                }
            })
        }
    }
    async consume(spell, level, slot) {
        var _a, _b, _c;
        const actor = this.actor;
        if (!(actor instanceof CharacterPF2e || actor instanceof NPCPF2e))
            throw ErrorPF2e("Spellcasting entries require an actor");
        if (this.isRitual)
            return !0;
        if (spell.isVariant && (spell = spell.original),
        this.isFocusPool && actor.isOfType("character", "npc")) {
            const currentPoints = ((_a = actor.system.resources.focus) == null ? void 0 : _a.value) ?? 0;
            return currentPoints > 0 ? (await actor.update({
                "system.resources.focus.value": currentPoints - 1
            }),
            !0) : (ui.notifications.warn(game.i18n.localize("PF2E.Focus.NotEnoughFocusPointsError")),
            !1)
        }
        const levelLabel = game.i18n.localize(CONFIG.PF2E.spellLevels[level])
          , slotKey = goesToEleven(level) ? `slot${level}` : "slot0";
        if (this.system.slots === null || !this.spells)
            return !1;
        if (this.isPrepared && !this.isFlexible) {
            const preparedData = this.system.slots[slotKey].prepared;
            if (slot ?? (slot = Number((_b = Object.entries(preparedData).filter(([_,slot2])=>slot2.id === spell.id && !slot2.expended).at(0)) == null ? void 0 : _b[0])),
            !Number.isInteger(slot))
                throw ErrorPF2e("Slot not given for prepared spell, and no alternative slot was found");
            return preparedData[slot].expended ?? !1 ? (ui.notifications.warn(game.i18n.format("PF2E.SpellSlotExpendedError", {
                name: spell.name
            })),
            !1) : (await this.spells.setSlotExpendedState(level, slot, !0),
            !0)
        }
        if (this.isInnate) {
            const remainingUses = ((_c = spell.system.location.uses) == null ? void 0 : _c.value) || 0;
            return remainingUses <= 0 ? (ui.notifications.warn(game.i18n.format("PF2E.SpellSlotExpendedError", {
                name: spell.name
            })),
            !1) : (await spell.update({
                "system.location.uses.value": remainingUses - 1
            }),
            !0)
        }
        const slots = this.system.slots[slotKey];
        return slots.value > 0 ? (await this.update({
            [`system.slots.${slotKey}.value`]: slots.value - 1
        }),
        !0) : (ui.notifications.warn(game.i18n.format("PF2E.SpellSlotNotEnoughError", {
            name: spell.name,
            level: levelLabel
        })),
        !1)
    }
    async addSpell(spell, options) {
        var _a;
        return ((_a = this.spells) == null ? void 0 : _a.addSpell(spell, options)) ?? null
    }
    async prepareSpell(spell, slotLevel, spellSlot) {
        var _a;
        return ((_a = this.spells) == null ? void 0 : _a.prepareSpell(spell, slotLevel, spellSlot)) ?? null
    }
    async unprepareSpell(spellLevel, slotLevel) {
        var _a;
        return ((_a = this.spells) == null ? void 0 : _a.unprepareSpell(spellLevel, slotLevel)) ?? null
    }
    async setSlotExpendedState(slotLevel, spellSlot, isExpended) {
        var _a;
        return ((_a = this.spells) == null ? void 0 : _a.setSlotExpendedState(slotLevel, spellSlot, isExpended)) ?? null
    }
    async getSheetData() {
        var _a, _b;
        if (!((_a = this.actor) != null && _a.isOfType("character", "npc")))
            throw ErrorPF2e("Spellcasting entries can only exist on characters and npcs");
        const spellCollectionData = await ((_b = this.spells) == null ? void 0 : _b.getSpellData()) ?? {
            levels: [],
            spellPrepList: null
        };
        return {
            id: this.id,
            name: this.name,
            sort: this.sort,
            ability: this.ability,
            statistic: this.statistic.getChatData(),
            tradition: this.tradition,
            category: this.system.prepared.value,
            isPrepared: this.isPrepared,
            isSpontaneous: this.isSpontaneous,
            isFlexible: this.isFlexible,
            isInnate: this.isInnate,
            isFocusPool: this.isFocusPool,
            isRitual: this.isRitual,
            hasCollection: !!this.spells,
            showSlotlessLevels: this.showSlotlessLevels,
            ...spellCollectionData
        }
    }
    getRollOptions(prefix="spellcasting") {
        return [`${prefix}:${this.ability}`, `${prefix}:${this.tradition}`, `${prefix}:${this.system.prepared.value}`]
    }
    async _preUpdate(changed, options, user) {
        var _a;
        if ((_a = changed.system) != null && _a.slots)
            for (const key of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
                const slotKey = `slot${key}`
                  , slotData = changed.system.slots[slotKey];
                if (slotData && ("max"in slotData && (slotData.max = Math.max(Number(slotData.max) || 0, 0)),
                "value"in slotData)) {
                    const max = "max"in slotData ? Number(slotData?.max) || 0 : this.system.slots[slotKey].max;
                    slotData.value = Math.clamped(Number(slotData.value), 0, max)
                }
            }
        await super._preUpdate(changed, options, user)
    }
    getSpellData() {
        return this.getSheetData()
    }
}
var _canSetAbility = new WeakSet, actor;
class spellcastingCreateEntry extends FormApplication {
    constructor(actor) {
        super(createEmptySpellcastingEntry(actor));
        
        __privateAdd(this, _canSetAbility),
        __publicField(this, "actor"),
        this.actor = deepClone(actor)
        //this.app = app
    }
    async createEntry(formData) {
        var _a, _b;
        const wasInnate = this.object.isInnate
          , inputData = expandObject(formData)
          , system2 = mergeObject(inputData.system ?? {}, {
            prepared: {
                value: this.object.system.prepared.value
            },
            ability: {
                value: "cha"
            }
        }, {
            overwrite: !1
        });
        if (inputData.system = system2,
        system2.prepared.value === "innate" && !wasInnate && (system2.ability.value = "cha"),
        (_a = system2.proficiency) != null && _a.slug && (system2.ability.value = ""),
        system2?.autoHeightenLevel && ((_b = system2.autoHeightenLevel).value || (_b.value = null)),
        this.object.updateSource(inputData),
        this.object.reset(),
        true) {
            return this.addEntry()
        }
    }
    async addEntry() {
        const updateData = this.object.toObject();
        this.actor = game.actors.get(this.actor._id);
        var spellEntries;

        if (this.object.isRitual && (updateData.system.tradition.value = "",
        updateData.system.ability.value = ""),
        this.object.isPrepared || delete updateData.system.prepared.flexible,
        this.object.id === null)
            updateData.name = (()=>{
                const preparationType = game.i18n.localize(CONFIG.PF2E.preparationType[updateData.system.prepared.value]) ?? ""
                  , magicTraditions2 = CONFIG.PF2E.magicTraditions
                  , traditionSpells = game.i18n.localize(magicTraditions2[this.object.tradition ?? ""]);
                return this.object.isRitual || !traditionSpells ? preparationType : game.i18n.format("PF2E.SpellCastingFormat", {
                    preparationType,
                    traditionSpells
                })
            }
            )(),  spellEntries = await this.actor.createEmbeddedDocuments("Item", [updateData]);
        else {
            const actualEntry = this.actor.spellcasting.get(this.object.id);
            if (!(actualEntry instanceof SpellcastingEntryPF2e))
                return;
            const system2 = pick(updateData.system, ["prepared", "tradition", "ability", "proficiency", "autoHeightenLevel"]);
            spellEntries = await actualEntry.update({ system: system2 })
        }
        return spellEntries
    }
}
function createEmptySpellcastingEntry(actor) {
    return new SpellcastingEntryPF2e({
        name: "Untitled",
        type: "spellcastingEntry",
        system: {
            ability: {
                value: "cha"
            },
            spelldc: {
                value: 0,
                dc: 0
            },
            tradition: {
                value: "arcane"
            },
            prepared: {
                value: "innate"
            }
        }
    },{
        actor
    })
}
var rootPath = "spellcasting.templates", builtRules = [], spellEntries=[];
//add choice set to Bloodline:Genie feat Compendium.pf2e.classfeatures.tYOMBiH3HbViNWwn
//add choice set to Eiodolon feat Compendium.pf2e.classfeatures.qOEpe596B0UjhcG0
function compendiumSpellModifications(modifications, modify){
    console.debug([`${mod} - modifying feat modification for spells`,modifications, modify])
    modifications.index.forEach( async modIdx => {
        var compendium = await modifications.getDocument(modIdx._id)
        var classRules = compendium.system.rules, featRules=[]
        var isSpell = (classRules[0].label != "direct_tx") 
        if (isSpell) classRules.forEach(feat=>{featRules.push(feat.value)})
            else featRules = compendium.system.rules
        for (let entry of featRules){
            var id = entry.id, id=id.split("."), db=`${id[1]}.${id[2]}`;
            var feat = await game.packs.get(db).getDocument(id[3]), originRules = feat.system.rules
            var rules = (isSpell) ? process_spell_commands(originRules,entry, modify)
                      : process_direct_commands(originRules, entry, modify)
            if (rules) {
                await Item.updateDocuments([{_id: id[3], system:{rules: rules} }], {pack: db});
                var descript = (modify)?"no of modifications":"reset to"
                console.debug([id[3], feat.name, rules, `${descript}: ${rules.length}`]  );
            }
        }
    })
    return (modify)?"Wizard Generator has been added":"Wizard Generator has been removed";
}
function process_direct_commands(originRules, entry, modify){
    var rules = false;
    if(!(originRules.find(selected=>selected.slug==entry.slug))){
        if(modify){
            var rule=entry; delete rule.label; originRules.push(rule);rules = originRules
        }
    } else if(!modify){rules = originRules.filter(selected=>selected.slug!=entry.slug)}        
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
async function processEachSpellBook(data){
    var actor = game.actors.get(data.actor._id)
    if (actor.spellcasting.templates !=undefined){
        var spellSets = actor.spellcasting.templates
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
                        if (spellPass == pass) {                            
                            spellBook.key = key; spellBook.class = actorClassName; spellBook.slug = `${spellBook.class}-${spellBook.slug}`,
                            spellBook.tradition = (spellBook.tradition !== undefined) ?  spellBook.tradition : (spellBooks.tradition !== undefined ? spellBooks.tradition : undefined)
                            entries.push(spellBook)
                        }
                        if (spellPass > pass) morePasses = true;
                    }
                }
            }
        })
        pass =+ 1;
    }
    while (morePasses);
    return entries
}
async function cycleThruCollectedSpellBooks(entries, actor){
    var actorSpellEntries;
    for (let entry of entries){
        var entryExists = actor.spellcasting.collections.find(el=>{return el.entry.slug==entry.slug})
        actorSpellEntries = (! (entry.id = (entryExists) ? entryExists.id : false) ) 
            ? (await (new spellcastingCreateEntry(actor)).createEntry(getSystemInfo(actor,entry))).shift()
            : await actor.getEmbeddedDocument("Item",entry.id)
        entry.id = (entry.id)? entry.id : actorSpellEntries.id; entry.origName = actorSpellEntries.name;
        await addSpellBookModifications(entry, actor)        
    }
}
function spellConditionMet(actor, conditions){
    var result = false;
    Object.keys(conditions).forEach(key => {if (conditions[key].type == "feat") result = actor.items.some(feat=>conditions[key].value == feat.slug)})
    return result;
}
function getSystemInfo(actor, spells){
        var spellType = (spells.type !== undefined) ? spells.type: "focus", spellsAbility = (spells.ability !== undefined) ? spells.ability : actor.class.system.keyAbility.selected;
        var info ={"system.proficiency.value" : "", "system.tradition.value" :  (spells.tradition !== undefined) ? spells.tradition : spells.tradition,
                   "system.prepared.value": spellType, "system.ability.value": spellsAbility,"system.slug":  spells.slug}        
        return info;
}   
function getClassSpellSlots(actor){
    var data = {}, lvl = 0, $div = $(document.createElement("div")).html(actor.class.system.description.value).find("table");
    var $row = $div.find('th:contains("Cantrips")').closest("table").find("tr:eq("+actor.level+")"), $rowData = $row.find("td");
    $rowData.each((idx,el)=>{
        var spellAmt=el.innerHTML; spellAmt=spellAmt.substr(0,1); 
        if (lvl!=0){
            if (!isNaN(spellAmt)){ data[`system.slots.slot${lvl-1}.max`] = spellAmt; data[`system.slots.slot${lvl-1}.value`] = spellAmt;}
        }
        lvl += 1;
    })
    return data
} 
async function addSpellBookModifications(spells, actor){
    var data = {};
    //rename spellbook: append to preexisting name
    if (spells.name !== undefined && (! spells.origName.includes(spells.name)) ) data[`name`]= spells.origName + " - " + spells.name;
    //add spell slots & spells learn 
    if (spells.slots !== undefined){
        var slots = spells.slots;
        Object.keys(slots).forEach(async function(key) {
            var qty = slots[key].max; data[`system.slots.${key}.max`] = qty; data[`system.slots.${key}.value`] = qty; 
        })
    } 
    else if (spells.key=="main" && (spells.type !== undefined)) data = {...data, ...getClassSpellSlots(actor)}
    if (spells.books !== undefined){
        if (data["system.prepared.value"]=="prepared"){ data[`system.prepared.cantrip`] = spells.books.book0.max; data[`system.prepared.spells`] = spells.books.totals;}
    } 
    if (! $.isEmptyObject(data)){ 
        data["_id"]=spells.id;  
        await actor.updateEmbeddedDocuments("Item", [data])
    }
    //add spells
    if (spells.spellList !== undefined){
        var spellArrays = spells.spellList;
        Object.keys(spellArrays).forEach(spellIndex=>{
            var spelsPerLevel = spellArrays[spellIndex];
            Object.keys(spelsPerLevel).forEach(async spellName=>{ 
                if (Number(spellIndex) <= Math.ceil(actor.level/2) ){
                    var spellFound = actor.items.find(el=>el.sourceId==spelsPerLevel[spellName])//check if spell exists --- need to add
                    var spell_id = spelsPerLevel[spellName], splitW = spell_id.split(".")
                    var spelldb = `${splitW[1]}.${splitW[2]}`, spell_id = splitW[3]; 
                    var spellClone = await ((await game.packs.get(spelldb).getDocuments({_id: spell_id})
                                        ).shift()).clone({"system.location.value": spells.id}
                    ).toObject()
                    if (!spellFound) (await actor.createEmbeddedDocuments("Item", [spellClone])).shift() 
                }
            })
        })
    }    
    return spells;
}
async function checkForDeityDomainFeats(actor){
        //find targets
        //     add for oracle mysteries
        //     add logic for sorcerer bloodline genie
        var feats = [], domain//, slug = actor.class.slug , domains = [];
        var slugs = ["domain-initiate","deitys-domain","advanced-domain","advanced-deitys-domain"];
        actor.items.forEach(el=>{if(slugs.includes(el.slug)){ //domains.push(el.flags.pf2e.rulesSelections.domainInitiate);
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
                await actor.updateEmbeddedDocuments("Item", [{_id: feat.id, "system.rules": targetRules}]) //actor.render();//var template = actor.spellcasting.templates;
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
       path: `spellcasting.templates.classname.spells.focus.spellList.${level}.${name}`,
       priority: 33,
       value: value
   }
}
async function addSpellsGrantedToClericFromDeity(actor){
   if (actor.class.name=="Cleric"){
       var spells = actor.deity.system.spells;
       var slug = `${actor.class.name}-main`; slug=slug.toLowerCase()
       var entry = actor.spellcasting.collections.find(el=>{return el.entry.slug==slug})
       var spellsToPost = []
       if (entry){
           Object.keys(spells).forEach( async spellIndex=>{
               if (Number(spellIndex) <= Math.ceil(actor.level/2) ){
                   var spellFound = actor.items.find(el=>el.sourceId==spells[spellIndex])//check if spell exists --- need to add
                   if (!spellFound) {
                        var spell_id = spells[spellIndex], splitW = spell_id.split(".")
                        var spelldb = `${splitW[1]}.${splitW[2]}`, spell_id = splitW[3];
                        var spellClone = await ((await game.packs.get(spelldb).getDocuments({_id: spell_id})
                                            ).shift()).clone({"system.location.value": entry.id}
                        ).toObject()
                        spellsToPost.push(spellClone)
                   }
                   
               }
           })
           var result = await actor.createEmbeddedDocuments("Item", spellsToPost)
       }
   }
}
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
                console.debug(["hello veribale"])
            }
        });
    }
    static updateSpellCompendiums(isSubmit) {
        var db = "pf2e-char-builder.addons";
        var msg = compendiumSpellModifications(game.packs.get(db), isSubmit);
        ui.notifications.info(msg);
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
        const isSubmit = (event.submitter.id=="submit") 
        var db = "pf2e-char-builder.addons";
        //var db = "world.jeff-tests";
        var msg = compendiumSpellModifications(game.packs.get(db), isSubmit);
        ui.notifications.info(msg);
        game.settings.set(mod,'isCompiled',!isSubmit)
    }
}

/*** end of classes */

function add_spellcaster_generator(app,html,data){
    var new_html = $('<a class="item-control blue-button" data-action="spellcasting-generate" title="Generate Spells" data-type="spell" data-level="" style="width: 100px;"><i class="fas fa-bolt"></i>Generate</a>');
    var el2 = html.find('.sheet-content').find(".spellcasting").find(".spellcastingEntry-list").find('.item-control[data-action="spellcasting-create"]');
    el2.width(200)
    el2.after(new_html); 
    new_html.on("click", async event=>{
        processEachSpellBook(data);
        return;
    })
    //for diagnostic use only
    /*
    var feat_html = $('<a class="item-control blue-button" data-action="spellcasting-generate" title="Set Feats" data-type="feats" data-level="" style="width: 100px;"><i class="fas fa-cogs"></i>Set Feats</a>');
    new_html.after(feat_html)
    feat_html.on("click", async event=>{
        var db = "world.jeff-tests", isSubmit = false
        actor = game.actors.get(data.actor._id)
        checkifClassDeletedToRemoveSpells(actor,html)
        //getClassSpellSlots(game.actors.get(data.actor._id))
        return;
    })
    */
}
async function checkifClassDeletedToRemoveSpells(actor,html){
    var spellbooks = html.find('.sheet-content').find(".spellcasting").find(".spellcasting-entry")
    var query = $(".dialog").find(".dialog-content")//.find(".delete-all-spellcasting-dialog")
    if (spellbooks.length !== 0 && query.length == 0){

        var content = await renderTemplate("systems/pf2e/templates/actors/delete-spellcasting-dialog.hbs");
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
});
Hooks.on('renderCharacterSheetPF2e', (app, html, data) => {
    if (game.settings.get(mod,'isCompiled')){
        actor = game.actors.get(data.actor._id);
        if((data.class !== null) && (data.ancestry !== null) && (data.background !== null) && (data.heritage !== null)){
            add_spellcaster_generator(app,html,data)
        }   
        checkForDeityDomainFeats(actor); 
    }
});
Hooks.on('dropActorSheetData', async (actor, actorSheet, data) => {
    await removeAllSpells(actor) 
});
Hooks.on('renderActorSheet', (actor, html, data) => {
    actor = game.actors.get(data.actor._id);
    if (actor.class==null) checkifClassDeletedToRemoveSpells(actor, html)
});
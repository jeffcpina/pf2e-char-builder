console.debug("PF2e System | PF2e Character Builder - Tutorial | Started "); 
export const modName = "PF2e Character Builder";
const mod = "pf2e-char-builder";

async function loadHandleBarTemplates()
{
  // register templates parts
  var tutDir = `modules/${mod}/templates/tutorial/tabs/`
    const templatePaths = [
        `${tutDir}intro.hbs`,
        `${tutDir}interface.hbs`,
        `${tutDir}ancestry.hbs`,
        `${tutDir}background.hbs`,
        `${tutDir}classSheet.hbs`,
        `${tutDir}scores.hbs`,
        `${tutDir}misc.hbs`,
        `${tutDir}profs.hbs`,
        `${tutDir}feats.hbs`,
        `${tutDir}spells.hbs`,
        `${tutDir}stuff.hbs`,
        `${tutDir}bio.hbs`
    ];
    return loadTemplates( templatePaths );
}

let socket;

Hooks.once("socketlib.ready", () => {
	socket = socketlib.registerModule(mod);
	socket.register("changeCanvasImage", changeCanvasImage);
});

class tutorial extends Application {
    constructor(actor_id) {
        super();
        this.options.id = `tutorial-module-${actor_id}`;
        this._initialize();
    }  
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = `modules/${mod}/templates/tutorial/tutorial.hbs`;
        options.width = 730;
        options.height = 733;
        options.classes = ['creation-tutorial'];
        options.title = "Creation Tutorial";
        options.top = 0;
        options.left = 780;
        options.tabs = [{
            navSelector: ".sheet-navigation",
            contentSelector: ".sheet-content",
            initial: "intro"
        }]
        return options;
    }
    getData() {
        let data = {};
        data.mod = mod; var tutDir = `modules/${mod}/templates/tutorial/tabs/`
        data["intro"]=`${tutDir}intro.hbs`
        data["interface"]=`${tutDir}interface.hbs`
        data["ancestry"]=`${tutDir}ancestry.hbs`
        data["background"]=`${tutDir}background.hbs`
        data["classSheet"]=`${tutDir}classSheet.hbs`
        data["scores"]=`${tutDir}scores.hbs`
        data["misc"]=`${tutDir}misc.hbs`
        data["profs"]=`${tutDir}profs.hbs`
        data["feats"]=`${tutDir}feats.hbs`
        data["spells"]=`${tutDir}spells.hbs`
        data["bio"]=`${tutDir}bio.hbs`
        data["stuff"]=`${tutDir}stuff.hbs`
        data["store_info"]= game.settings.get(mod,'storeVerbage')
        return data;
    }
    activateListeners($html) {
            $html.find(".sheet-navigation").on("click",event=>{
            var active = $html.find(".sheet-navigation .item.active");
            this.move_windows($html,active);
           })
           $html.find(".next").on("click",event=>{
            var active = $html.find(".sheet-navigation .item.active"),
                tabName = active.attr("data-tab");
                if ($(event.currentTarget).hasClass("section") && ($html.find(`.tab.${tabName} .mainsection`).is(":visible")) ) {
                    var ancestry =  this.charSheet.find('.character-details').find(".ancestry").find(".value").html().toLowerCase();
                    if (!ancestry && tabName=="ancestry") {
                        ui.notifications.error("Must choose a valid Ancestry first");
                        throw ErrorPF2e(`Must choose a valid Ancestry to Continue`)
                    }
                    $html.find(`.tab.${tabName} .mainsection`).hide();
                    $html.find(`.tab.${tabName} .subsection`).show();
                    this.highlight($html,active);
                    this.manageResource($html,active);
                } 
                else {
                    $html.find(`.tab.${tabName} .mainsection`).show();
                    $html.find(`.tab.${tabName} .subsection`).hide();
                    var active = $html.find(".sheet-navigation .item.active"),
                    active = active.next(".item");
                    this.move_windows($html,active);
                    tabName = active.attr("data-tab");
                    $html.find(`.tab.${tabName} .mainsection`).show();
                    $html.find(`.tab.${tabName} .subsection`).hide();
                }
           })
           
           $html.find(".autocheck input").prop( "checked", game.settings.get(mod,'showCharTut') )
           $html.find(".autocheck input").on("click",event=>{
                game.settings.set(mod,'showCharTut', $html.find(".autocheck input").prop( "checked" ))
           })
           $html.find(".littleShop").on("click",async event=>{
            game.journal.getName("Rick's Prospector's Emporium Bazaar").sheet.render(true)
/*
                const compendiumBrowser = game.pf2e.compendiumBrowser;
                var equipmentTab = game.pf2e.compendiumBrowser.tabs.equipment, 
                filter = await equipmentTab.getFilterData(),
                l = filter.sliders.level.values,
                r = filter.checkboxes.rarity.options;
                l.min = 0;l.max = 1;
                r.common.selected = true; 
                r.uncommon.selected = false; 
                r.rare.selected = false; 
                r.unique.selected = false;
                filter.checkboxes.rarity.selected = ["common","uncommon"];
                game.settings.set(mod,'viewing_store',true)
                equipmentTab.open(filter);
            */
           })
           if (! game.user.isGM) {
                this.charSheet.find(".image-container").on("click",async event=>{
                    const myContent = `URL <input type="text" class="image_url_link">`;

                    new Dialog({
                    title: "Character Image URL",
                    content: myContent,
                    buttons: {
                        button1: {
                        label: "Submit",
                        callback: async () => {
                            this.save_url_image();
                        },
                        icon: `<i class="fas fa-check"></i>`
                        }
                    }
                    }).render(true);
                });
            }
    }
    async save_url_image(){
        try { 

            var image_url = $('.image_url_link').val();
            var userActorId = game.user.character.id, actor = game.actors.get(userActorId),
                tokens = game.canvas.tokens.ownedTokens;
            if (! this.isValidUrl(image_url)) throw "Invalid Url";

            var userToken = tokens.find(token=>token.document.actorId == userActorId);
            userToken = userToken.document;

            await userToken.update({"texture.src": image_url})
            await actor.update({img: image_url})
            ui.notifications.info("***  Character Image Changed ***")
            /*
                const compendiumBrowser = game.pf2e.compendiumBrowser;
                var equipmentTab = game.pf2e.compendiumBrowser.tabs.equipment, 
                filter = await equipmentTab.getFilterData(),
                l = filter.sliders.level.values,
                r = filter.checkboxes.rarity.options;
                l.min = 0;l.max = 1;
                r.common.selected = true; 
                r.uncommon.selected = false; 
                r.rare.selected = false; 
                r.unique.selected = false;
                filter.checkboxes.rarity.selected = ["common","uncommon"];
                game.settings.set(mod,'viewing_store',true)
                equipmentTab.open(filter);
            */
            //var myTile = game.scenes.get(sceneId).tiles.get(iconsId[iconInfo[1]]);
            //await myTile.update({"texture.src": image_url})
            //const result = await socket.executeAsGM("changeCanvasImage", image_url, myTile);
        }
        catch(e){ui.notifications.error(e);}
    }
    getUserCharacters(){
        var id=game.user.id, myActors = [], iconCnt = 0, curIconId = -1; 
        var curChar = game.user.character;
        var compareById = function (a,b) { return (a.id < b.id) ? -1 : (a.id > b.id) ? 1 : 0 }
        var characters = game.actors.contents.sort(compareById)
        Object.keys(characters).forEach(key=>{
            var owners = game.actors.contents[key].ownership;
            Object.keys(owners).forEach(owner=>{
                if (id==owner && owners[owner]==3) {
                    myActors.push(game.actors.contents[key]);
                    if (curChar.id == game.actors.contents[key].id) curIconId = iconCnt;
                    iconCnt = iconCnt + 1;
                }    
            })
        })
        return [myActors , curIconId];
    }
    isValidUrl(urlString) {
        try { 
            return Boolean(new URL(urlString)); 
        }
        catch(e){ 
            return false; 
        }
    }
    move_windows($html, active){
        var coord = active.attr("data-coord").split(","),
            $app = $html.closest(".app.creation-tutorial"),
            heading = '';
                
            $html.find(".tut-head").html(active.attr("title"))
            this.charTabs.activate(active.attr("data-parent-tab"))
            $app.css({"width": coord[2], "height":coord[3]})
            $app.offset({ top: coord[0], left: coord[1] })
            this.tutTabs.activate(active.attr("data-tab"))
            game.settings.set(mod,'current_tab',active.attr("data-tab"))

            this.highlight($html,active);
            this.manageResource($html,active);
    }
    highlight($html,active){
        this.charSheet.find(".abcd h3").removeClass("highlight");
        var editattr = this.charSheet.find("button.has-unallocated");
        if (! editattr.hasClass("unhighlight")) editattr.addClass("unhighlight")
        var highlight = false;
        switch(active.attr("data-tab")) {
            case "ancestry":
              if ($html.find(`.tab.${active.attr("data-tab")} .mainsection`).is(":visible"))
                    highlight=".ancestry h3";
              else  {
                highlight=".heritage h3";
                $html.closest(".app.creation-tutorial").css({"height":535})
              }
              break;
            case "background":
                highlight=".background h3";
              break;
            case "classSheet":
                highlight=".class h3";
              break;
            case "scores":
                editattr.removeClass("unhighlight");
              break;    
          }
          if (highlight) this.charSheet.find(highlight).addClass("highlight");
    }
    async manageResource($html,active){
        var $app = $html.closest(".app.creation-tutorial");
        var activeTab = active.attr("data-tab")
        if (activeTab != "background"){
            const killList = ["compendium-pf2e.ancestries","compendium-pf2e.background","compendium-pf2e.classes","compendium-browser",]
            for (const id in ui.windows){ 
                if (killList.includes(ui.windows[id].id )){ 
                    ui.windows[id].close()
                }
                if (String(ui.windows[id].id).startsWith("attribute-builder")) ui.windows[id].close()
            }
        }
        switch(activeTab) {
            case "ancestry":
              if ($html.find(`.tab.${active.attr("data-tab")} .mainsection`).is(":visible")){
                    game.packs.get("pf2e.ancestries").render(!0)
                    $app.offset({ top: 0, left: 1108 })
              }
              else  {
                    if (game.pf2e.compendiumBrowser.tabs.heritage != undefined) {
                        var ancestry =  this.charSheet.find('.character-details').find(".ancestry").find(".value").html().toLowerCase();
                        const heritageTab = game.pf2e.compendiumBrowser.tabs.heritage, 
                        filter = await heritageTab.getFilterData();
                        const checkboxes = filter.checkboxes.ancestry;

                        ancestry in checkboxes.options && (checkboxes.isExpanded = !1, checkboxes.options[ancestry].selected = !0, checkboxes.selected.push(ancestry));
                        heritageTab.open(filter)
                        $app.offset({ top: 0, left: 759 }) 
                    }
                    else {
                        game.packs.get("pf2e.heritages").render(!0)
                        $app.offset({ top: 0, left: 1108 }) 
                    }
              }
              break;
            case "background":
                if (game.pf2e.compendiumBrowser.tabs.background != undefined) {
                    const compendiumBrowser = game.pf2e.compendiumBrowser;
                    const backgroundTab = game.pf2e.compendiumBrowser.tabs.background, 
                    filter = await backgroundTab.getFilterData();
                    backgroundTab.open(filter)
                    $app.offset({ top: 0, left: 759 }) 
                }
                else {
                    game.packs.get("pf2e.backgrounds").render(!0)
                    $app.offset({ top: 0, left: 1108 }) 
                }

              break;
            case "classSheet":
                game.packs.get("pf2e.classes").render(!0)
                $app.offset({ top: 0, left: 1108 })  
              break; 
          }
    }
    async _initialize() {
        this.render();  
    }
    async openForActor(app, html, data) {
        this.actorId = data.actor._id
        this.parentApp = app
        this.parentHtml = html
        this.parentData = data
        this.parentAppId = app.id
        this.charSheet = this.parentHtml.closest(`#${this.parentAppId}`);
        this.parentApp.setPosition({top: 0, left: 0})
        //this.charSheet.css({top: 0, left: 0});
        this.charTabs = app._tabs[0]
        this.tutTabs = this._tabs[0]
        this.render(true);
        this.charTabs.activate("character")
    }
    closex (){
        this.charSheet.find(".pc h3").removeClass("highlight")
        //this.close()
    }
}
async function changeCanvasImage(image_url,myTile){
        console.debug(["tiles",myTile,image_url]);
        await myTile.update({"texture.src": image_url})
        console.debug(["tiles",myTile,image_url]);
        return ["titles",myTile,image_url]
}
async function delChar(id){
        let d = new Dialog({
            title: "Delete Character?",
            content: "Are you sure, Deletion is permanent",
            buttons: {
                yes: {
                icon: '<i class="fas fa-check"></i>',
                label: "Yes",
                callback: async () => { await Actor.deleteDocuments([id]);}
                },
                no: {
                icon: '<i class="fas fa-times"></i>',
                label: "No"
                }
            },
            default: "no"
        });
        await d.render(true);
}

Hooks.on('rendertutorial', (app, html, data) => {
    app.tutTabs.activate("info")
});
Hooks.on('closetutorial', (app, html, data) => {
    app.charSheet.find(".pc h3").removeClass("highlight");
});
Hooks.once( "init", function() {
    loadHandleBarTemplates();
});
var sidebar;
Hooks.on('pf2e.systemReady', async () => {
    
    if (!game.user.isTrusted && game.settings.get(mod,'charOnly') ) {
        $(`[data-tab="combat"]`).hide()
        $(`[data-tab="items"]`).hide()
        $(`[data-tab="cards"]`).hide()
        $(`[data-tab="playlists"]`).hide()
        $(`[data-tab="actors"]`).hide()
        $(`[data-tab="tables"]`).hide()
        $(`[data-tab="journal"]`).hide()
        $(`[data-tab="compendium"]`).hide()
        $(`[data-tab="Collapse or Expand"]`).hide()
        $(`#ui-right a.collapse`).hide()
        $(`#ui-bottom`).hide()
        $(`#pause.paused`).hide();
        $(`section#settings ul#game-details`).hide();
        $(`section#settings ul#settings-documentation`).hide();
        $(`section#settings h2`).hide();
        $(`h2`).hide();
        $(`div#settings-documentation`).hide();
        $(`[data-action="modules"]`).hide()

        sidebar.collapse()
    }
    
}) 
Hooks.on('collapseSidebar', async () => {
    
    if (!game.user.isTrusted && game.settings.get(mod,'charOnly') ) {
        $(`nav#controls`).hide()
    }
    
}) 
Hooks.on( "renderSidebar", function(app) {sidebar = app});

async function tutorial_button(app, html, data){
    if (app.actor.type === 'npc') return;
    if (html.find(".window-header").length != 1) return;
    if (html.find(".tutorial-drawer").length != 0) return;

    var id = app.actor.id;
    if (tutorialInstance[id] === undefined) tutorialInstance[id] = new tutorial(id);

    /*
    html.closest('.app').find("div .image-container").click(ev=>{
        deleteAllSpells(app.actor)
    })
    */

    //let delBtn = $(`<a class="del-button"><i class="fas fa-trash"></i>Delete</a>`);
    //delBtn.click(ev => { delChar(id) });
    //delBtn.insertAfter(openBtn);

    let openBtn = $(`<a class="tutorial-drawer"><i class="fas fa-layer-group"></i> Creation Tutorial</a>`);
    openBtn.click(ev => { tutorialInstance[id].openForActor(app, html, data) });
    let titleElement = html.closest('.app').find('.window-title');
    openBtn.insertAfter(titleElement);
    
    if (data.actor.ownership.default != 0 && !game.user.isTrusted ){ //add condition on setting check mark for allow creation of characters
        const updates = [{_id: id, "ownership.default": 0}];
        const updated = await Actor.updateDocuments(updates);
    }

    if (! game.settings.get(mod,'showCharTut')) tutorialInstance[id].openForActor(app, html, data)
};
Hooks.on('renderCharacterSheetPF2e', (app, html, data) => {
    tutorial_button(app, html, data);
    if (!game.user.isTrusted && game.settings.get(mod,'charOnly') ) {
        $(`.inventory-list .item-controls [data-action="edit-item"]`).hide();
        $(`.inventory-list .item-controls [data-action="delete-item"]`).hide();
        $(`.inventory-list .item-controls .toggle-identified`).hide();
        $(`[data-action="add-coins"]`).hide()
        $(`[data-action="remove-coins"]`).hide()
        $(`.inventory-list a.decrease`).hide()
        $(`.inventory-list a.increase`).hide()
    }
    if (! game.user.isGM) {game.user.update({character: app.actor})}
});
Hooks.on('renderCompendium', (app, html, data) => {
    if ($(".creation-tutorial").length == 1) 
        app.setPosition({left:756, top: 0})
    //html.offset({ top: 0, left: 756 })
});
Hooks.on('renderCompendiumBrowser', (app, html, data) => {
    console.debug(["tab",game.settings.get(mod,'current_tab')]);
    if ($(".creation-tutorial").length == 1) 
        if (game.settings.get(mod,'current_tab')!="stuff")
            app.setPosition({left:765, top: 520, width: 655, height: 300})
        else{
            app.setPosition({left:765, top: 0, width: 730, height: 670})
            //console.debug(["stuff"]);
            app.setPosition({left:765, top: 0, width: 730, height: 670})
        }
            
    //html.offset({ top: 489, left: 756, width: 655, height: 470 })

    //style compendium store
    /*
    console.debug(["store status", (game.settings.get(mod,'viewing_store'))?"true":"false"])
    if (game.settings.get(mod,'viewing_store')){
        console.debug(["check viewStore", "working"])
        html.find("nav").hide();
        html.find(`[data-filter-name="rarity"]`).hide();
        html.find(`[data-filter-name="source"]`).hide();
        html.find(`[data-filter-name="level"]`).hide();
        html.find(`.window-title`).html("Luigi's Shop - I got what you need ... forget about it.");
        game.settings.set(mod,'viewing_store',false)
    }
    else {
      html.find("nav").show();
      html.find(`[data-filter-name="rarity"]`).show();
      html.find(`[data-filter-name="source"]`).hide();
      html.find(`[data-filter-name="level"]`).hide();
      html.find(`.window-title`).html("Compendium Browser");
    }
    */
})



Hooks.on('createItem', async (item, status, id) => {addItemsfromkit(item, status, id)});
Hooks.on('updateItem', async (item, status, id) => {addItemsfromkit(item, status, id)});
async function addItemsfromkit(item, status, id) {
    if (item.constructor.name == "ContainerPF2e"){
        var rule = item.rules[0];
        if (rule.path == "flags.pf2e.kit.id"){
            var actor = item.parent;
            var container = await game.packs.get("pf2e.equipment-srd").getDocument(rule.value);
            var conItems = container.system.items;
            var kitList = Object.values(conItems[Object.keys(conItems)[0]].items);
            var newItems = [];
            for (let listItem of kitList){
                var itemId = String(listItem.uuid).split(".")[4];
                var itemClone = await ((await game.packs.get("pf2e.equipment-srd").getDocuments({_id: itemId})
                                                ).shift()).clone({"system.containerId": item.id});
                newItems.push(itemClone)
                //await actor.createEmbeddedDocuments("Item",[itemClone]);
                //await actor.updateEmbeddedDocuments("Item",[{_id: itemClone.id, _container: item.id}]);
            }
            await actor.createEmbeddedDocuments("Item",newItems);
            await actor.deleteEmbeddedDocuments([item.id]);
            console.debug(["createItem",rule.path, kitList, container.id, newItems]);
        }
    }
}


Hooks.on('sightRefresh', (app, html) => {
    var tokens = game.canvas.tokens.placeables;
    if (!game.user.isGM)for (let token of tokens){ if ( !token.actor.isOwner) {token.visible = false;} }
    else {
        var playerId = game.settings.get(mod,'gm_char');
        for (let token of tokens){
            //ownersList = Object.keys(token.actor.ownership);
            if ( ! (Object.keys(token.actor.ownership)).includes(playerId)) token.visible = false;
                else token.visible = true;
        }
    }
 });
 Hooks.on('refreshToken', async (app, html) => {
    if (!game.user.isGM){
        var userActorId = game.user.character.id, actor = game.actors.get(userActorId),
                tokens = game.canvas.tokens.ownedTokens,
                userToken = tokens.find(token=>token.document.actorId == userActorId);
        userToken = userToken.document;
        if (userToken.name != actor.name) await userToken.update({name: actor.name})
    }
 });
Hooks.on('renderAttributeBuilder', (app, html) => {
   if ($(".attribute-builder").length){
        var tutWin=$(".creation-tutorial")
        if (tutWin.find(`.tab.scores .mainsection`).is(":visible")){    
            app.setPosition({ top: 316, left: 0 })
            tutWin.find(`.tab.scores .mainsection`).hide();
            tutWin.find(`.tab.scores .subsection`).show();
        }
   }
});

Hooks.on('closeCharacterSheetPF2e', (app, html, data) => {
    var actorId = app.actor.id;
    for (const id in ui.windows){ 
        if (ui.windows[id].id == `tutorial-module-${actorId}`) ui.windows[id].close();
    }
})

Hooks.on('renderDialog', (app, html, data) => {
    if (app.title == "Create New Actor")
        if (!game.user.isTrusted )
            html.find('.form-group').eq(1).find('option').not(':selected').remove() 
});
//Character environment features


let tutorialInstance = [];

//todo 
//voice character for merchants
//check video in books, make sure working
//add video to tutorial explaining spontanaeous and prepared spells
//make sure all resource videos are working
//racial merchants

//add video to tutorial explaining spontanaeous and prepared spells
//2nd level class feats is featuring archetype as well
//additonal skills added to count when added by feats.
//compendium window keeps going back to original shape and location


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
        `${tutDir}bio.hbs`
    ];
    return loadTemplates( templatePaths );
}
class tutorial extends Application {
    resource = false;
    constructor(actor_id) {
        super();
        this.options.id = `tutorial-module-${actor_id}`;
        this._initialize();
    }  
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = `modules/${mod}/templates/tutorial/tutorial.hbs`;
        options.width = 655;
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

            this.highlight($html,active);
            this.manageResource($html,active);
    }
    highlight($html,active){
        this.charSheet.find(".pc h3").removeClass("highlight");
        var editattr = this.charSheet.find("button.has-unallocated");
        if (! editattr.hasClass("unhighlight")) editattr.addClass("unhighlight")
        var highlight = false;
        switch(active.attr("data-tab")) {
            case "ancestry":
              if ($html.find(`.tab.${active.attr("data-tab")} .mainsection`).is(":visible"))
                    highlight=".ancestry h3";
              else  highlight=".heritage h3";
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
        if (ui.windows[this.resource] != undefined) {
            var isheritage = $html.find(`.tab.${active.attr("data-tab")} .subsection`).is(":visible")
            if(this.resource == 115){
                if( !(isheritage || activeTab == "background")) ui.windows[this.resource].close()
            }
            else ui.windows[this.resource].close()
        }    
        switch(activeTab) {
            case "ancestry":
              if ($html.find(`.tab.${active.attr("data-tab")} .mainsection`).is(":visible")){
                    this.resource = "pf2e.ancestries";
                    this.resource = game.packs.get(this.resource).render(!0)
                    $app.offset({ top: 0, left: 1108 })
                    this.resource = 74;
              }
              else  {
                    if (game.pf2e.compendiumBrowser.tabs.heritage != undefined) {
                        var ancestry =  this.charSheet.find('.character-details').find(".ancestry").find(".value").html().toLowerCase();

                        const heritageTab = game.pf2e.compendiumBrowser.tabs.heritage, 
                        filter = await heritageTab.getFilterData();
                        const checkboxes = filter.checkboxes.ancestry;
            
                        if (!ancestry) {
                            ui.notifications.error("Must choose a valid Ancestry first");
                            throw ErrorPF2e(`Must choose a valid Ancestry first`)
                        }
                        ancestry in checkboxes.options && (checkboxes.isExpanded = !1, checkboxes.options[ancestry].selected = !0, checkboxes.selected.push(ancestry));
                        heritageTab.open(filter)
                        $app.offset({ top: 0, left: 759 }) 
                        this.resource = 115;
                    }
                    else {
                        this.resource = "pf2e.heritages";
                        this.resource = game.packs.get(this.resource).render(!0)
                        $app.offset({ top: 0, left: 1108 }) 
                        this.resource = 81;
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
                    this.resource = 115;
                }
                else {
                    this.resource = "pf2e.backgrounds";
                    this.resource = game.packs.get(this.resource).render(!0)
                    $app.offset({ top: 0, left: 1108 }) 
                    this.resource = 76;
                }

              break;
            case "classSheet":
                this.resource = "pf2e.classes";
                this.resource = game.packs.get(this.resource).render(!0)
                $app.offset({ top: 0, left: 1108 })  
                this.resource = 77;
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
async function enterHTMLimage(actor,html){
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
        $(`#pause.paused`).hide()
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

    html.closest('.app').find("div .image-container").click(ev=>{
        enterHTMLimage(app.actor)
    })

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
};
Hooks.on('renderCharacterSheetPF2e', (app, html, data) => {
    tutorial_button(app, html, data);
});
Hooks.on('renderCompendium', (app, html, data) => {
    if ($(".creation-tutorial").length == 1) 
        app.setPosition({left:756, top: 0})
    //html.offset({ top: 0, left: 756 })
});
Hooks.on('renderCompendiumBrowser', (app, html, data) => {
    if ($(".creation-tutorial").length == 1) 
        app.setPosition({left:765, top: 756, width: 655, height: 470})
    //html.offset({ top: 489, left: 756, width: 655, height: 470 })
})
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
/*
Hooks.on('closeAttributeBuilder', (app, html) => {
    var tutWin=$(".creation-tutorial")
    console.debug(["exist",tutWin.length]);
    if (tutWin.length){
        tutWin.find(`.tab.scores`).removeClass("active").hide();
        tutWin.find(`.tab.profs`).show().addClass("active");
    }
})
*/
Hooks.on('renderDialog', (app, html, data) => {
    if (app.title == "Create New Actor")
        if (!game.user.isTrusted )
            html.find('.form-group').eq(1).find('option').not(':selected').remove() 
});
//Character environment features


let tutorialInstance = [];

//todo 
//add image dialog to add url image to token
//Finish landscape library
//correct css issuse with mods added
   //journal has two background, make internal transpanrent
   //text color in some area not visible
//macro to save settings and give a name to it
//macro not visible to users

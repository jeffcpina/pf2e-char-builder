console.debug("PF2e System | PF2e Character Builder - Tutorial | Started "); 
export const modName = "PF2e Character Original Builder";
const mod = "pf2e-char-builder";


async function loadHandleBarTemplates()
{
  // register templates parts
  const templatePaths = [
    `modules/${mod}/templates/tutorial/tabs/intro.hbs`,
    `modules/${mod}/templates/tutorial/tabs/ancestry.hbs`,
    `modules/${mod}/templates/tutorial/tabs/background.hbs`,
    `modules/${mod}/templates/tutorial/tabs/classSheet.hbs`,
    `modules/${mod}/templates/tutorial/tabs/scores.hbs`,
    `modules/${mod}/templates/tutorial/tabs/misc.hbs`,
    `modules/${mod}/templates/tutorial/tabs/profs.hbs`,
    `modules/${mod}/templates/tutorial/tabs/feats.hbs`,
    `modules/${mod}/templates/tutorial/tabs/spells.hbs`,
    `modules/${mod}/templates/tutorial/tabs/bio.hbs`
  ];
  return loadTemplates( templatePaths );
}

class tutorial extends Application {
    constructor() {
        super();
        this._initialize();
    }  
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = `modules/${mod}/templates/tutorial/tutorial.hbs`;
        options.width = 595;
        options.height = 620;
        options.classes = ['creation-tutorial'];
        options.title = "Creation Tutorial";
        options.top = 102;
        options.left = 228
        options.tabs = [{
            navSelector: ".sheet-navigation",
            contentSelector: ".sheet-content",
            initial: "intro"
        }]
        return options;
    }
    getData() {
        var test = "hello";
        let data = {test};
        return data;
    }
    activateListeners($html) {
        $html.find(".sheet-navigation").on("click",event=>{
        var active = $html.find(".sheet-navigation .item.active"),
            coord = active.attr("data-coord").split(","),
            $app = $html.closest(".app.creation-tutorial")

            $html.find(".tut-head").html(active.attr("title"))
            this.charTabs.activate(active.attr("data-parent-tab"))
            $app.css({"width": coord[2], "height":coord[3]})
            $app.offset({ top: coord[0], left: coord[1] })
       })
       
       $html.find(".next").on("click",event=>{
        var active = $html.find(".sheet-navigation .item.active"),
            active = active.next(".item"),
            coord = active.attr("data-coord").split(","),
            $app = $html.closest(".app.creation-tutorial");

            $html.find(".tut-head").html(active.attr("title"))
            this.charTabs.activate(active.attr("data-parent-tab"))
            $app.css({"width": coord[2], "height":coord[3]})
            $app.offset({ top: coord[0], left: coord[1] })
            this.tutTabs.activate(active.attr("data-tab"))
            console.debug(["click",active.html(), this.tutTabs])

       })
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
        var charSheet = this.parentHtml.closest(`#${this.parentAppId}`);
        charSheet.css({top: 0, left: 0});
        this.charTabs = app._tabs[0]
        this.tutTabs = this._tabs[0]
        this.render(true);
    }
}


Hooks.once( "init", function() {
    loadHandleBarTemplates();
});
function tutorial_button(app, html, data){
    if (app.actor.type === 'npc') return;
    if (tutorialInstance === undefined) tutorialInstance = new tutorial(); else return;
    if (html.find(".tutorial-drawer").length != 0) return;
    let openBtn = $(`<a class="tutorial-drawer"><i class="fas fa-layer-group"></i> Creation Tutorial</a>`);
    openBtn.click(ev => { tutorialInstance.openForActor(app, html, data) });
    let titleElement = html.closest('.app').find('.window-title');
    openBtn.insertAfter(titleElement);
};
Hooks.on('renderCharacterSheetPF2e', (app, html, data) => {
    tutorial_button(app, html, data);
});
let tutorialInstance;
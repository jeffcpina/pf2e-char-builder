console.debug("PF2e System | PF2e Character Builder - Scoredrawer| Started "); 
export const modName = "PF2e Character Original Builder";
const mod = "jcp-custom-module";

class ScoreDrawer extends Application {
    //will improve this by reading attributes from actor template and base form on that 
    //will improve make a back end for settings
    
    constructor() {
        super();
        this._initialize();
        
        this.Points =        [-20, -16, -12, -9, -6, -4, -2, -1, 0, 1, 2, 3, 4, 5, 7, 9, 12, 15, 19];
        this.PointsDefault = [-20, -16, -12, -9, -6, -4, -2, -1, 0, 1, 2, 3, 4, 5, 7, 9, 12, 15, 19];
        
        this.StandardArray = [15, 14, 13, 12, 10, 8];
        this.atttribNames  =[["Strength","Str"],["Dexterity","Dex"],["Constitution","Con"],
                             ["Intelligence","Int"],["Wisdom","Wis"],["Charisma","Cha"]];
        this.attributes =[];
        this.heropoint = 1;
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = `modules/${mod}/templates/tutorial/tutorial.hbs`;
        options.width = 740;
        options.height = 520;
        options.classes = ['score-drawer'];
        options.title = "Score Drawer";
        return options;
    }

    getData() {
      var points_in_reverse = [];

      /*
      for (let i = 18; i > 0; i--) {
        points_in_reverse[i] = this.Points[i];
      } 
      */
      
      let data = {};
      data.heropoint = this.heropoint;
      data.points = this.Points;
      data.attribnames = this.atttribNames;

      return data;
    }

    activateListeners(html) {
        html.find('.apply_stats').click(ev => this._onApplyStats(ev));
        this.attributes = html.find('.FinalAttr');
        this.getTotals();
    }

    _changeMethods(ev){
        ui.notifications.info("This is currently under contruction");
    }

    getTotals() {

        var AbilityModifiers = [-5, -5, -4, -4, -3, -3, -2, -2, -1, -1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7];
        
        var AttributeStr = parseInt($('input#AttributeStr').val());
        var AttributeDex = parseInt($('input#AttributeDex').val());
        var AttributeCon = parseInt($('input#AttributeCon').val());
        var AttributeInt = parseInt($('input#AttributeInt').val());
        var AttributeWis = parseInt($('input#AttributeWis').val());
        var AttributeCha = parseInt($('input#AttributeCha').val());


        var TotalStr = AttributeStr + parseInt( $('#RacialStr').html() );
        var TotalDex = AttributeDex + parseInt( $('#RacialDex').html() );
        var TotalCon = AttributeCon + parseInt( $('#RacialCon').html() );
        var TotalInt = AttributeInt + parseInt( $('#RacialInt').html() );
        var TotalWis = AttributeWis + parseInt( $('#RacialWis').html() );
        var TotalCha = AttributeCha + parseInt( $('#RacialCha').html() );
      
        $('span#TotalStr').html(TotalStr);
        $('span#TotalDex').html(TotalDex);
        $('span#TotalCon').html(TotalCon);
        $('span#TotalInt').html(TotalInt);
        $('span#TotalWis').html(TotalWis);
        $('span#TotalCha').html(TotalCha);
      
        var PointcostStr = this.Points[AttributeStr];
        var PointcostDex = this.Points[AttributeDex];
        var PointcostCon = this.Points[AttributeCon];
        var PointcostInt = this.Points[AttributeInt];
        var PointcostWis = this.Points[AttributeWis];
        var PointcostCha = this.Points[AttributeCha];
      
        var ModifierStr = AbilityModifiers[TotalStr];
        var ModifierDex = AbilityModifiers[TotalDex];
        var ModifierCon = AbilityModifiers[TotalCon];
        var ModifierInt = AbilityModifiers[TotalInt];
        var ModifierWis = AbilityModifiers[TotalWis];
        var ModifierCha = AbilityModifiers[TotalCha];
      
        var TotalCost = parseInt(PointcostStr) + parseInt(PointcostDex) + parseInt(PointcostCon) + parseInt(PointcostInt) + parseInt(PointcostWis) + parseInt(PointcostCha);
        var AvailablePointsTotal = AvailablePoints;
      
        var AvailablePoints = parseInt($('input#AvailablePoints').val());
      
        var AttributeMax = parseInt($('input#AttributeMax').val());
        var AttributeMin = parseInt($('input#AttributeMin').val());
      
        $('input#AttributeStr').attr('max', AttributeMax);
        $('input#AttributeDex').attr('max', AttributeMax);
        $('input#AttributeCon').attr('max', AttributeMax);
        $('input#AttributeInt').attr('max', AttributeMax);
        $('input#AttributeWis').attr('max', AttributeMax);
        $('input#AttributeCha').attr('max', AttributeMax);
      
        $('input#AttributeStr').attr('min', AttributeMin);
        $('input#AttributeDex').attr('min', AttributeMin);
        $('input#AttributeCon').attr('min', AttributeMin);
        $('input#AttributeInt').attr('min', AttributeMin);
        $('input#AttributeWis').attr('min', AttributeMin);
        $('input#AttributeCha').attr('min', AttributeMin);
      
        $('span#AvailablePointsTotal').html(AvailablePoints);
        $('span#TotalCost').html(TotalCost);
      
        $('span#PointcostStr').html(PointcostStr);
        $('span#PointcostDex').html(PointcostDex);
        $('span#PointcostCon').html(PointcostCon);
        $('span#PointcostInt').html(PointcostInt);
        $('span#PointcostWis').html(PointcostWis);
        $('span#PointcostCha').html(PointcostCha);
      
        $('span#ModifierStr').html(ModifierStr);
        $('span#ModifierDex').html(ModifierDex);
        $('span#ModifierCon').html(ModifierCon);
        $('span#ModifierInt').html(ModifierInt);
        $('span#ModifierWis').html(ModifierWis);
        $('span#ModifierCha').html(ModifierCha);
      }
      
      fullReset() {
        this.Points = [-20, -16, -12, -9, -6, -4, -2, -1, 0, 1, 2, 3, 4, 5, 7, 9, 12, 15, 19];
      
      
        $('input#AttributeMax').val('15');
        $('input#AttributeMin').val('8');
        $('input#AvailablePoints').val('27');
      
        $('input#AttributeStr').val('8');
        $('input#AttributeDex').val('8');
        $('input#AttributeCon').val('8');
        $('input#AttributeInt').val('8');
        $('input#AttributeWis').val('8');
        $('input#AttributeCha').val('8');
      
        $('span#RacialStr').html('0');
        $('span#RacialDex').html('0');
        $('span#RacialCon').html('0');
        $('span#RacialInt').html('0');
        $('span#RacialWis').html('0');
        $('span#RacialCha').html('0');
      
        $('input.value18').val('19');
        $('input.value17').val('15');
        $('input.value16').val('12');
        $('input.value15').val('9');
        $('input.value14').val('7');
        $('input.value13').val('5');
        $('input.value12').val('4');
        $('input.value11').val('3');
        $('input.value10').val('2');
        $('input.value9').val('1');
        $('input.value8').val('0');
        $('input.value7').val('-1');
        $('input.value6').val('-2');
        $('input.value5').val('-4');
        $('input.value4').val('-6');
        $('input.value3').val('-9');
      
    
        getTotals();
      }
      
      pointsReset() {
        $('input#AttributeStr').val('8');
        $('input#AttributeDex').val('8');
        $('input#AttributeCon').val('8');
        $('input#AttributeInt').val('8');
        $('input#AttributeWis').val('8');
        $('input#AttributeCha').val('8');
      
        this.getTotals();
      }
      
      _onIncrement(e) {
        var e = window.event || e;
        var evt = e.target || e.srcElement;
        var abilityType = evt.value;
        var abilityScore = parseInt($('input#' + [abilityType]).val());
        var abilityMax = '';
        if (abilityType == 'AttributeMax' ) {
          abilityMax = $('input#AttributeMax').attr('max');
          this.pointsReset();
        }
        else if (abilityType == 'AttributeMin' ) {
          abilityMax = parseInt($('input#AttributeMax').val());
          this.pointsReset();
        }
        else if (abilityType == 'AvailablePoints' ) {
          abilityMax = $('input#AvailablePoints').attr('max');
        }
        else if (abilityType.indexOf('Racial') === 0 ) {
          abilityMax = $('input#' + abilityType).attr('max');
        }
        else {
          abilityMax = parseInt($('input#AttributeMax').val());
        }
      
        if (abilityScore == abilityMax) {
          abilityType = null;
          return false;
        }
        else {
          $('input#' + [abilityType]).val(function(i, abilityVal) {
            return ++abilityVal;
          });
          abilityType = null;
        }
        this.getTotals();
      }
      
      _onDecrement(e) {
        var e = window.event || e;
        var evt = e.target || e.srcElement;
        var abilityType = evt.value;
        var abilityScore = parseInt($('input#' + [abilityType]).val());
        var abilityMin = '';
        if (abilityType == 'AttributeMax' ) {
          abilityMin = $('input#AttributeMin').val();
          this.pointsReset();
        }
        else if (abilityType == 'AttributeMin' ) {
          abilityMin = $('input#AttributeMin').attr('min');
          this.pointsReset();
        }
        else if (abilityType == 'AvailablePoints' ) {
          abilityMin = $('input#AvailablePoints').attr('min');
        }
        else if (abilityType.indexOf('Racial') === 0 ) {
          abilityMin = $('input#' + abilityType).attr('min');
        }
        else {
          abilityMin = parseInt($('input#AttributeMin').val());
        }
      
        if (abilityScore <= abilityMin) {
          abilityType = null;
          return false;
        }
        else {
          $('input#' + [abilityType]).val(function(i, abilityVal) {
            return --abilityVal;
          });
        abilityType = null;
        }
        this.getTotals();
      }
      
      increase(e) {
        var e = window.event || e;
        var evt = e.target || e.srcElement;
        var abilityNumber = evt.value;
        var abilityScore = parseInt($('input.value' + [abilityNumber]).val());
      
        var abilityMax = parseInt($('input.value' + [abilityNumber]).attr('max'));
        var abilityMin = parseInt($('input.value' + [abilityNumber]).attr('min'));
        var high = 18;
      
        if (abilityScore == abilityMax) {
          abilityNumber = null;
          return false;
        }
        else if (abilityNumber < 8) {
          $('input.value' + [abilityNumber]).val(function(i, abilityVal) {
            do {
              ++this.Points[abilityNumber];
              --abilityNumber;
            }
            while (abilityNumber >= 3);
            return ++abilityVal;
          });
        }
        else {
          $('input.value' + [abilityNumber]).val(function(i, abilityVal) {
            while (high >= abilityNumber) {
              ++this.Points[abilityNumber];
              abilityNumber++;
            }
            return ++abilityVal;
          });
        }
        this.pointsReset();
        for (var j=3; j<=18; j++) {
          $('input.value' + [j]).val(this.Points[j]);
        }
      }
      
      decrease(e) {
        var e = window.event || e;
        var evt = e.target || e.srcElement;
        var abilityNumber = evt.value;
        var abilityScore = parseInt($('input.value' + [abilityNumber]).val());
      
        var abilityMax = parseInt($('input.value' + [abilityNumber]).attr('max'));
        var abilityMin = parseInt($('input.value' + [abilityNumber]).attr('min'));
        var low = 3;
      
        if (abilityScore == abilityMin) {
          abilityNumber = null;
          return false;
        }
        else if (abilityNumber >= 8) {
          $('input.value' + [abilityNumber]).val(function(i, abilityVal) {
            do {
              --this.Points[abilityNumber];
              ++abilityNumber;
            }
            while (abilityNumber <= 18);
            return --abilityVal;
          });
        }
        else {
          $('input.value' + [abilityNumber]).val(function(i, abilityVal) {
            while (low <= abilityNumber) {
              --this.Points[abilityNumber];
              abilityNumber--;
            }
            return --abilityVal;
          });
        }
        this.pointsReset();
        for (var j=3; j<=18; j++) {
          $('input.value' + [j]).val(this.Points[j]);
        }
      }
    
    _onSelectStats(ev, selectors) {
        let setId = ev.target.closest('.result').dataset.setid;
        let selected = ev.target.value;
        for (let sel of selectors) {
            let id = sel.closest('.result').dataset.setid;
            if (id !== setId && sel.value == selected) {
                sel.value = 'none';
            } 
        }
    }

    _onApplyStats(ev) {
        let actor = game.actors.get(this.actorId);
        
        var finalAttr = this.attributes;
        var attribName = "";
        var attrValue = 0;
        let data = {};
        finalAttr.each( function() {
            attribName = $(this).attr("id");
            attribName = attribName.replace("Total","");
            attribName = attribName.toLowerCase();
            attrValue = parseInt($(this).html()); 
            data[`data.abilities.${attribName}.value`] = attrValue;
        });
        
        if (Object.keys(data).length === 6) {
            let actor = game.actors.get(this.actorId);
            actor.update(data);
            ui.notifications.info("Abilities have been applied.");
            this.close();
        }

    return;        
        
        for (let sel of selectors) {
            let setId = sel.closest('.result').dataset.setid;
            let ability = sel.value;
            let set = this.resultDeck[setId];

            if (ability !== 'none' && set[1].value && set[2].value && set[3].value) {
                let val = set[1].value + set[2].value + set[3].value
                data[`data.abilities.${ability}.value`] = val;
            } else {
                ui.notifications.warn("The Abilities could not be aplied.");
                break;
            }
        }

        if (Object.keys(data).length === 6) {
            let actor = game.actors.get(this.actorId);
            actor.update(data);
            ui.notifications.info("Abilities have been applied.");
            this.close();
        }
    }

    _toggleHelp(html) {
        html.find('.help-display').toggle(50);
    } 

    async updateChatMessage() {
        let actor = game.actors.get(this.actorId);
        let templateData = { resultDeck: this.resultDeck, name: actor.data.name}
        let template = `modules/${mod}/templates/chatMessage.html`;
        let messageContent = await renderTemplate(template, templateData);

        if (this.messageId === undefined) {
            let chatData = {
                user: game.user._id,
                speaker: {
                    actor: actor.data._id,
                    token: actor.data.token,
                    alias: actor.data.name
                },
                content: messageContent
            };
            let message = await ChatMessage.create(chatData, {});
            
            this.messageId = message.data._id;
        } else {
            let message = game.messages.get(this.messageId);
            message.update({ content: messageContent });
        }
    }

    async _initialize() {
        this.render();
    }

    async openForActor(actorId) {
        this.actorId = actorId;
        this.render(true);
    }

}    
let scoreInstance;
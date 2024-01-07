export class A5e implements SystemApi {

    get version() {
        return 2;
    }

    get id() {
        return "a5e";
    }

    async actorRollSkill(actor, skillId):Promise<Roll|null> {
        const result = await actor.rollSkillCheck(skillId)
        return result.rolls[0];
    }

    async actorRollAbility(actor, abilityId): Promise<Roll|null> {
        const result = await actor.rollAbilityCheck(abilityId)
        return result.rolls[0];
    }

    actorCurrenciesGet(actor):Currencies {
        return actor["system"].currency;
    }

    async actorCurrenciesStore(actor, currencies: Currencies): Promise<void> {
        await actor.update({system: {currency: currencies}});
    }

    //how should i append this to svelte ? evil shit follows...
    actorSheetAddTab(sheet, html, actor, tabData:{ id: string, label: string, html: string }, tabBody:string): void {
        if($(sheet.element).find(".primary-body").length === 0) {
            const lastElement = $(sheet.element).find('nav.a5e-nav');
            const tabs = $(lastElement).find('ul');
            const tabItem = $(`<li class="a5e-nav-item fa-solid" data-group="primary" data-id="${tabData.id}" data-tooltip="${tabData.label}" data-tooltip-direction="UP">${tabData.html}</li>`);
            tabs.find("li:last").before(tabItem);
            const primary = $('<div class="primary-body" style="overflow-x:hidden"></div>');
            const tabContent = $('<div class="tab" data-group="primary" data-tab="' + tabData.id + '"></div>');
            primary.append(tabContent);
            lastElement.after(primary);
            tabs.find("li").on("click",(e)=>{
                tabs.find("li").removeClass("a5e-nav-item--active");
                $(e.currentTarget).addClass("a5e-nav-item--active");
                if($(e.currentTarget).data().id === tabData.id){
                    primary.nextAll().hide();
                    tabContent.show();
                }else{
                    primary.nextAll().show();
                    tabContent.hide();
                }
            })
        }
        $(sheet.element).find(`div.tab[data-tab="${tabData.id}`).html(tabBody);
        if (!sheet._tabs?.[0] ) {
            sheet.options.tabs = [{navSelector: ".a5e-nav ul", contentSelector: ".primary-body", initial: "details"}];
            sheet._tabs = sheet._createTabHandlers();
        }
    }
    //how should i append this to svelte ? evil shit follows...
    itemSheetReplaceContent(app, html, element): void {
        app._activateEditor=(element)=>{};
        if(app._dragDrop?.find(d=>d.name ==="recipeSheet")){
            app._dragDrop = [];
        }
        const body = $(app.element).find('main');
        const header = $(body).find('header');
        header.nextAll().remove();
        body.append(element);
        //it's not a FORMApplication !! so i need to update it myself
        const update=(e)=>{
            let value = $(e.currentTarget).val();
            if(e.currentTarget.type === "checkbox"){
                // @ts-ignore
                value = $(e.currentTarget).is(":checked")
            }
            const path = e.currentTarget.name;
            const flags={};
            setProperty(flags,path,value);
            app.item.update(flags)
        };
        window.setTimeout(()=>{
            element.find("input").on("change",update);
            element.find("select").on("change",update);
        }, 200);
    }

    get configSkills(): SkillConfig[] {
        return Object.entries(CONFIG["A5E"].skills).map(([key,value]) => {
            return {
                id: key,
                label: value as string
            };
        });
    }

    get configAbilities(): AbilityConfig[] {
        return Object.entries(CONFIG["A5E"].abilities).map(([key,value]) => {
            return {
                id: key,
                label: value as string
            };
        });
    }

    get configCurrencies(): CurrencyConfig[] {
        return [
            {
                id: "pp",
                factor: 10000,
                label: "PP",
            },
            {
                id: "ep",
                factor: 50,
                label: "EP",
            },
            {
                id: "gp",
                factor: 100,
                label: "GP",
            },
            {
                id: "sp",
                factor: 10,
                label: "SP",
            },
            {
                id: "cp",
                factor: 1,
                label: "CP",
            }
        ]
    }

    get configCanRollAbility():boolean {
        return true;
    }
    get configLootItemType(): string {
        return "object";
    }

    get itemPriceAttribute(): string {
        return "system.price";
    }

    get itemQuantityAttribute(): string {
        return "system.quantity";
    }

}
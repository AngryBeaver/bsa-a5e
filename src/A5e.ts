export class A5e implements SystemApi {

    get version() {
        return 2;
    }

    get id() {
        return "a5e";
    }

    // a5e returns the chat message of the roll, or null when the roll dialog was closed
    async actorRollSkill(actor, skillId):Promise<Roll|null> {
        const message = await actor.rollSkillCheck(skillId);
        return message?.rolls?.[0] ?? null;
    }

    async actorRollAbility(actor, abilityId): Promise<Roll|null> {
        const message = await actor.rollAbilityCheck(abilityId);
        return message?.rolls?.[0] ?? null;
    }

    actorCurrenciesGet(actor):Currencies {
        return actor["system"].currency;
    }

    async actorCurrenciesStore(actor, currencies: Currencies): Promise<void> {
        await actor.update({system: {currency: currencies}});
    }

    // beavers-crafting binds this selector to remember the tab and calls changeTab on the next render,
    // which a svelte sheet does not support. The tab state is kept in actorSheetAddTab instead, so match nothing.
    get actorSheetTabSelector(): string {
        return ".bsa-a5e-no-tab-handling";
    }

    /**
     * a5e renders its sheets with svelte (ApplicationV2), so there is no foundry tab handling to hook into.
     * The tab is added to the svelte nav and its content placed in front of the svelte page; switching is done here.
     * Svelte keeps the nodes it does not know about, so they survive re-renders and only the content is replaced.
     */
    actorSheetAddTab(sheet, html, actor, tabData:{ id: string, label: string, html: string }, tabBody:string): void {
        // beavers-crafting asks for its tab by setting activeTab (e.g. after crafting) and calling changeTab,
        // which svelte does not know. changeTab is taken over for this tab id and activeTab is consumed here,
        // so the tab does not stick after the user switched to another one.
        if (!sheet._bsaA5eChangeTab) {
            const changeTab = sheet.changeTab?.bind(sheet);
            sheet._bsaA5eChangeTab = true;
            sheet.changeTab = (tab, group, options) => {
                if (tab !== tabData.id) return changeTab?.(tab, group, options);
                if (sheet.activeTab === tab) delete sheet.activeTab;
                sheet._bsaA5eTabActive = true;
                sheet._bsaA5eShowTab?.(true);
            };
        }
        const requested = sheet.activeTab === tabData.id;
        if (requested) {
            delete sheet.activeTab;
            sheet._bsaA5eTabActive = true;
        }
        const element = $(sheet.element instanceof HTMLElement ? sheet.element : sheet.element?.[0]);
        const nav = element.find("nav.a5e-nav");
        const list = nav.find("ul.a5e-nav-list");
        if (list.length === 0) return;
        let content = element.find(`div.bsa-a5e-tab[data-tab="${tabData.id}"]`);
        if (content.length === 0) {
            const tabItem = $(`<li class="a5e-nav-item fa-solid bsa-a5e-tab-item" data-tab="${tabData.id}" data-tooltip="${tabData.label}" data-tooltip-direction="UP">${tabData.html}</li>`);
            const last = list.children("li").last();
            if (last.length) last.before(tabItem); else list.append(tabItem);
            const label = $(`<span class="a5e-nav__current-tab-label bsa-a5e-tab-label">${tabData.label}</span>`);
            const labels = nav.children("span.a5e-nav__current-tab-label");
            if (labels.length) labels.last().after(label); else nav.prepend(label);
            content = $(`<div class="tab bsa-a5e-tab" data-tab="${tabData.id}" style="overflow-x:hidden; display:none"></div>`);
            nav.after(content);
            const show = (active: boolean) => {
                sheet._bsaA5eTabActive = active;
                // svelte owns the active classes of its own items, they are overruled by css instead of removed
                list.children("li").not(tabItem).toggleClass("bsa-a5e-inactive", active);
                nav.children("span.a5e-nav__current-tab-label").not(label).toggleClass("bsa-a5e-inactive", active);
                tabItem.toggleClass("a5e-nav-item--active", active);
                label.toggleClass("a5e-nav__current-tab-label--active", active);
                content.toggle(active);
                content.nextAll().toggle(!active);
            };
            list.on("click", "li", (e) => show(e.currentTarget === tabItem[0]));
            sheet._bsaA5eShowTab = show;
            if (sheet._bsaA5eTabActive) show(true);
        } else if (requested) {
            sheet._bsaA5eShowTab?.(true);
        }
        content.html(tabBody);
    }

    // only used for beavers-crafting containers, recipe, AnyOf and Script have their own sheets
    itemSheetReplaceContent(app, html, element): void {
        app._activateEditor=(element)=>{};
        if(Array.isArray(app._dragDrop) && app._dragDrop.find(d=>d.name ==="recipeSheet")){
            app._dragDrop = [];
        }
        const root = $(app.element instanceof HTMLElement ? app.element : app.element?.[0]);
        const body = root.find('main');
        const header = $(body).find('header');
        header.nextAll().remove();
        body.css("overflow","auto");
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
            foundry.utils.setProperty(flags,path,value);
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
import {A5e} from "./A5e.js";

Hooks.on("beavers-system-interface.init", async function(){
    beaversSystemInterface.register(new A5e());
});

// a5e's svelte sheets update themselves without a foundry render, so the crafting tab would show stale data.
Hooks.on("updateActor",(actor)=>{
    const sheet = actor?._sheet;
    if(sheet?.rendered && sheet.beaversCraftingTabSheet){
        sheet.beaversCraftingTabSheet.init();
    }
})

Hooks.on("beavers-system-interface.ready", async function(){
    import("./SkillTest.js");
    import("./AbilityTest.js");
});

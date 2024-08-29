import {A5e} from "./A5e.js";

Hooks.on("beavers-system-interface.init", async function(){
    beaversSystemInterface.register(new A5e());
    console.warn("a5e uses svelte for sheets this is not greatly compatible with jquery extension plz fix bsa-a5e i do evil stuff here")
});
//update Actor will not update ui window in this system !
Hooks.on("updateActor",(actor,flags,diff,id)=>{
    const appId = actor?._sheet?.appId
    //special fix for beavers-crafting this is all evil think about ways to remove it here!
    if(ui.windows[appId] && ui.windows[appId].beaversCraftingTabSheet){
        ui.windows[appId].beaversCraftingTabSheet.init();
    }
})

Hooks.on("beavers-system-interface.ready", async function(){
    import("./SkillTest.js");
    import("./AbilityTest.js");
});


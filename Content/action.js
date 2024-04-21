window.Actions = {
    damage1: {
        name: "whomp",
        description: "Pillowy punch of dough",
        success: [
            {type: "textMessage", text: "{CASTER} uses {ACTION}!"},
            {type: "animation", animation: "spin"},
            {type: "stateChange", damage: 10,}
        ]
    },
    
    saucyStatus: {
        name: "Tomato Squeeze",
        description: "Delicious Tomato Sauce restores your energy",
        targetType: "friendly",
        success: [
            {type: "textMessage", text: "{CASTER} uses {ACTION}!"},
            {type: "stateChange",  status: { type: "saucy", expiresIn: 3} }
        ]
    },
    clumsyStatus: {
        name: "Olive Oil",
        description: "watch out you might fall!",
        success: [
            {type: "textMessage", text: "{CASTER} uses {ACTION}!"},
            { type: "animation" , animation: "glob", color: "#dafd2a"},
            {type: "stateChange", status: { type: "clumsy", expiresIn: 3} },
            {type: "textMessage", text: "{TARGET} is slipping all around!"},
        ]
    },
    
    //Items
    item_recoverStatus: {
        name: "Healing Lamp",
        description: "Feeling fresh and warm",
        targetType: "friendly",
        success: [
            {type: "textMessage", text: "{CASTER} uses a {ACTION}!" },
            {type: "stateChange", status: null},
            {type: "textMessage", text: "Feeling Fresh" },
        ]
    },
    item_recoverHp: {
        name: "Parmesan",
        targetType: "friendly",
        success: [
            {type: "textMessage", text: "{CASTER} sprinkles on some {ACTION}!" },
            {type: "stateChange", recover: 10},
            {type: "textMessage", text: "{CASTER} recovers HP!" },
        ]
    }
}
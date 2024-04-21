class OverworldMap {
    constructor(config){
        this.overworld = null;
        this.GameObjects = {}; //Live Objects are in here
        this.configObjects = config.configObjects; //Configuration Content

        this.cutSceneSpaces = config.cutSceneSpaces || {};
        this.walls = config.walls || {};

        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;

        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc;

        this.isCutscenePlaying = false;
        this.isPaused = false;
    }

    drawLowerImage(ctx, cameraPerson){
        ctx.drawImage(this.lowerImage, 
        utils.withGrid(10,5) - cameraPerson.x, 
        utils.withGrid(6) - cameraPerson.y
        )
    }

    drawUpperImage(ctx, cameraPerson){
        ctx.drawImage(this.upperImage,
            utils.withGrid(10,5) - cameraPerson.x, 
            utils.withGrid(6) - cameraPerson.y
             )
    }
    isSpaceTaken(currentX, currentY, direction){
        const {x,y} = utils.nextPosition(currentX, currentY, direction);
        if(this.walls[`${x},${y}`]){
            return true;
        }
        //Check for game objects at this position
        return Object.values(this.GameObjects).find(obj => {
            if (obj.x === x && obj.y === y){return true;}
            if (obj.intentPosition && obj.intentPosition[0] === x && obj.intentPosition[1] === y){
                return true;
            }
            return false;
        })
    }

    mountObjects (){
        Object.keys(this.configObjects).forEach(key => {

            let object = this.configObjects[key];
            object.id = key;
          
            let instance;
            if(object.type === "Person"){
                instance = new Person(object);
            }
            if(object.type === "PizzaStone"){
                instance = new PizzaStone(object);
            }
            this.GameObjects[key] = instance;
            this.GameObjects[key].id = key;
            instance.mount(this);


        })
    }

    async startCutscene(events){
        this.isCutscenePlaying = true;

        for (let i = 0; i < events.length; i++){
            const eventHandler = new OverworldEvent({
                event: events[i],
                map: this,
            })
            const result = await eventHandler.init();
            if (result === "LOSE_BATTLE"){
                break;
            }
        }

        this.isCutscenePlaying = false;

        
    }

   

    checkForActionCutscene(){
        const hero = this.GameObjects["hero"];
        const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
        const match = Object.values(this.GameObjects).find(object => {
            return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
        });
        if (!this.isCutscenePlaying && match && match.talking.length){

            const relevantScenario = match.talking.find(scenario => {
                return (scenario.required || []).every(sf => {
                    return playerState.storyFlags[sf]
                })
            })

            relevantScenario && this.startCutscene(relevantScenario.events)
        }
    }

    checkForFootstepCutscene(){
        const hero = this.GameObjects["hero"];
        const match = this.cutSceneSpaces[ `${hero.x},${hero.y}`];
        if (!this.isCutscenePlaying && match ){
            this.startCutscene( match[0].events)
        }
    }
}

window.OverworldMaps = {
    DemoRoom: {
        id: "DemoRoom",
        lowerSrc: "images/maps/DemoLower.png",
        upperSrc: "images/maps/DemoUpper.png",
        configObjects: {
                hero: {
                    type: "Person",
                    id : "hero",
                    isPlayerControlled : true,
                    x: utils.withGrid(5),
                    y: utils.withGrid(6),
                    
                },
            npcA: {
                type: "Person",
                x: utils.withGrid(7),
                y: utils.withGrid(9),
                src : "images/characters/people/npc1.png",
                behaviorLoop :[
                    {type : "stand", direction : "left", time : 1000},
                    {type : "stand", direction : "up", time : 1000},
                    {type : "stand", direction : "right", time : 1200},
                    {type : "stand", direction : "up", time : 500},
                ],
                talking: [
                    {
                        required: ["TALKED_TO_ERIO"],
                        events: [
                            {type: "textMessage", text: "Isn't Erio the coolest?", faceHero:"npcA"},
                        ]
                    },
                    {
                        required: ["DEFEATED_BETH"],
                        events: [
                            {type: "textMessage", text: "Yo Hallo", faceHero: "npcA"},
                        ]
                    },
                    {
                        events: [
                            {type: "textMessage", text: "Aku akan menghancurkanmu!!", faceHero: "npcA"},
                            {type: "battle", enemyId:"beth"},
                            {type: "addStoryFlag", flag: "DEFEATED_BETH"},
                            {type: "textMessage", text: "Kamu menghancurkanku seperti lada yang lemah. ", faceHero: "npcA"},
                            // {type: "textMessage", text: "Karena Mau Bulan Ramadhan, Mohon Maaf Lahir dan Batin"},
                            //{who: "hero", type:"walk", direction: "up"},
                        ]
                    },
                ]
            },
            npcB: {
                type: "Person",
                x: utils.withGrid(8),
                y: utils.withGrid(5),
                src : "images/characters/people/erio.png",
                talking: [
                 {
                    events: [
                       {type: "textMessage", text: "Bahahahaha!", faceHero: "npcB"},
                       {type: "addStoryFlag", flag: "TALKED_TO_ERIO"},
                    //    {type: "battle", enemyId: "erio"}, 
                    ]
                }
                ]
                // behaviorLoop: [
                    //     {type : "walk", direction : "left"},
                    //     {type : "stand", direction : "up", time : 800},
                    //     {type : "walk", direction : "up"},
                //     {type : "walk", direction : "right"},
                //     {type : "walk", direction : "down"},
                // ],
                
            },
            pizzaStone: {
                type:"PizzaStone",
                x: utils.withGrid(2),
                y: utils.withGrid(7),
                storyFlag: "USED_PIZZA_STONE",
                pizzas: ["v002","v003"],
            },
            // pizzaStone: new PizzaStone({
            //     x: utils.withGrid(2),
            //     y: utils.withGrid(7),
            //     storyFlag: "USED_PIZZA_STONE",
            //     pizzas: ["s002","s003"],
            // }),
        },
        walls: {
            // "16, 16": true
            [utils.asGridCoords(7,6)]: true,
            [utils.asGridCoords(8,6)]: true,
            [utils.asGridCoords(7,7)]: true,
            [utils.asGridCoords(8,7)]: true,
            [utils.asGridCoords(1,3)]: true,
            [utils.asGridCoords(2,3)]: true,
            [utils.asGridCoords(3,3)]: true,
            [utils.asGridCoords(4,3)]: true,
            [utils.asGridCoords(5,3)]: true,
            [utils.asGridCoords(6,4)]: true,
            [utils.asGridCoords(6,3)]: true,
            [utils.asGridCoords(6,2)]: true,
            [utils.asGridCoords(6,1)]: true,
            [utils.asGridCoords(8,4)]: true,
            [utils.asGridCoords(8,3)]: true,
            [utils.asGridCoords(8,2)]: true,
            [utils.asGridCoords(8,1)]: true,
            [utils.asGridCoords(9,3)]: true,
            [utils.asGridCoords(10,3)]: true,
            [utils.asGridCoords(11,3)]: true,
            [utils.asGridCoords(11,4)]: true,
            [utils.asGridCoords(11,5)]: true,
            [utils.asGridCoords(11,6)]: true,
            [utils.asGridCoords(11,7)]: true,
            [utils.asGridCoords(11,8)]: true,
            [utils.asGridCoords(11,9)]: true,
            [utils.asGridCoords(11,10)]: true,
            [utils.asGridCoords(1,10)]: true,
            [utils.asGridCoords(2,10)]: true,
            [utils.asGridCoords(3,10)]: true,
            [utils.asGridCoords(4,10)]: true,
            [utils.asGridCoords(6,10)]: true,
            [utils.asGridCoords(7,10)]: true,
            [utils.asGridCoords(8,10)]: true,
            [utils.asGridCoords(9,10)]: true,
            [utils.asGridCoords(10,10)]: true,
            [utils.asGridCoords(5,11)]: true,
            [utils.asGridCoords(7,3)]: true,
            [utils.asGridCoords(0,4)]: true,
            [utils.asGridCoords(0,5)]: true,
            [utils.asGridCoords(0,6)]: true,
            [utils.asGridCoords(0,7)]: true,
            [utils.asGridCoords(0,8)]: true,
            [utils.asGridCoords(0,9)]: true,
        

        },
        cutSceneSpaces: {
            [utils.asGridCoords(7,4)]: [
                {
                    
                    events: [
                        {
                        type: "changeMap", 
                        map: "Shop",
                        x: utils.withGrid(5),
                        y: utils.withGrid(12),
                        direction: "up" 
                    }
                    ]
                }
            ],
            [utils.asGridCoords(5,10)]: [
                {
                    required:["APPRENTICE"],
                    events: [
                        {type: "changeMap", 
                        map: "Street",
                        x: utils.withGrid(5),
                        y: utils.withGrid(9),
                        direction: "down" 
                    },
                       
                        
                    ]
                }
            ],
            [utils.asGridCoords(5,10)]: [
                {
                   
                    events: [
                       {type: "textMessage", text: "<--Kamu Tidak Bisa Kesana-->"}
                    ]
                }
            ],
        }
    }, 
    Kitchen: {
        id: "Kitchen",
        lowerSrc: "images/maps/KitchenLower.png",
        upperSrc: "images/maps/KitchenUpper.png",
        configObjects: {
            hero: {
                type: "Person",
                isPlayerControlled : true,
                x: utils.withGrid(4),
                y: utils.withGrid(6),
            },
            npcA: {
                type: "Person",
                x: utils.withGrid(9),
                y: utils.withGrid(6),
                src : "images/characters/people/npc2.png",
                talking: [
                 {
                        events: [
                            {type: "textMessage", text: "Aku Sibuk", faceHero: "npcA"},
                            {type: "textMessage", text: "Jangan Ganggu Aku"},
                           
                        ]
                    }
                ],
            },
            npcB: {
                type: "Person",
                x: utils.withGrid(5),
                y: utils.withGrid(5),
                src : "images/characters/people/npc3.png",
                talking: [
                    {
                        events: [
                            {type: "textMessage", text: "Assalamualaikum, Apa Kabar?", faceHero: "npcB"},
                            {type: "textMessage", text: "Mohon Maaf Lahir dan Batin"},
                           
                        ]
                    }
                ],
                behaviorLoop: [
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "up"},
                    {type: "walk", direction: "up"},
                    {type: "stand", direction: "left", time: "800"},
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "right"},
                ]
            },
        },
        walls: {
            [utils.asGridCoords(1,3)]: true,
            [utils.asGridCoords(2,3)]: true,
            [utils.asGridCoords(3,3)]: true,
            [utils.asGridCoords(4,3)]: true,
            [utils.asGridCoords(5,3)]: true,
            [utils.asGridCoords(6,3)]: true,
            [utils.asGridCoords(7,3)]: true,
            [utils.asGridCoords(8,3)]: true,
            [utils.asGridCoords(9,3)]: true,
            [utils.asGridCoords(10,3)]: true,
            [utils.asGridCoords(11,4)]: true,
            [utils.asGridCoords(12,4)]: true,
            [utils.asGridCoords(6,7)]: true,
            [utils.asGridCoords(7,7)]: true,
            [utils.asGridCoords(9,7)]: true,
            [utils.asGridCoords(10,7)]: true,
            [utils.asGridCoords(1,5)]: true,
            [utils.asGridCoords(1,6)]: true,
            [utils.asGridCoords(1,7)]: true,
            [utils.asGridCoords(1,9)]: true,
            [utils.asGridCoords(2,9)]: true,       
            [utils.asGridCoords(9,9)]: true,
            [utils.asGridCoords(10,9)]: true,
            [utils.asGridCoords(1,10)]: true,
            [utils.asGridCoords(2,10)]: true,
            [utils.asGridCoords(3,10)]: true,
            [utils.asGridCoords(4,10)]: true,
            [utils.asGridCoords(6,10)]: true,
            [utils.asGridCoords(7,10)]: true,
            [utils.asGridCoords(8,10)]: true,
            [utils.asGridCoords(9,10)]: true,
            [utils.asGridCoords(10,10)]: true,
            [utils.asGridCoords(11,10)]: true,
            [utils.asGridCoords(12,10)]: true,
            [utils.asGridCoords(13,5)]: true,
            [utils.asGridCoords(13,6)]: true,
            [utils.asGridCoords(13,7)]: true,
            [utils.asGridCoords(13,8)]: true,
            [utils.asGridCoords(13,9)]: true,
            [utils.asGridCoords(13,10)]: true,
            [utils.asGridCoords(0,4)]: true,
            [utils.asGridCoords(0,5)]: true,
            [utils.asGridCoords(0,6)]: true,
            [utils.asGridCoords(0,7)]: true,
            [utils.asGridCoords(0,8)]: true,
            [utils.asGridCoords(0,9)]: true,
        },
        cutSceneSpaces: {
        [utils.asGridCoords(5,10)]: [
            {
                events: [
                    {type: "changeMap", 
                    map: "DiningRoom",
                    x: utils.withGrid(7),
                    y: utils.withGrid(3),
                    direction: "down"
                    }
                ]
            }
        ]
    }
    }, 
    Street: {
        id: "Street",
        lowerSrc: "images/maps/StreetLower.png",
        upperSrc: "images/maps/StreetUpper.png",
         configObjects: {
            hero: {
                type: "Person",
                id: "hero",
                isPlayerControlled : true,
                x: utils.withGrid(4),
                y: utils.withGrid(12),
            },
            npcA: {
                type: "Person",
                x: utils.withGrid(28),
                y: utils.withGrid(10),
                src : "images/characters/people/npc7.png",
                talking: [
                 {
                        events: [
                            {type: "textMessage", text: "Yo Hallo!", faceHero: "npcA"},
                            {type: "textMessage", text: "Disini Panas Sekali"},
            
                           
                        ]
                    }
                ],
            },
            Walikota: {
                type: "Person",
                x: utils.withGrid(18),
                y: utils.withGrid(12),
                src : "images/characters/people/secondBoss.png",
                talking: [
                 {
                        events: [
                            {type: "textMessage", text: "Apa Kabar Anak Muda?", faceHero: "Walikota"},
                            {type: "textMessage", text: "Apakah Kamu Betah disini?"},
            
                           
                        ]
                    }
                ],
            },
        },
        walls: {
            
            [utils.asGridCoords(4,14)]: true,
            [utils.asGridCoords(5,14)]: true,
            [utils.asGridCoords(6,14)]: true,
            [utils.asGridCoords(7,14)]: true,
            [utils.asGridCoords(8,14)]: true,
            [utils.asGridCoords(9,14)]: true,
            [utils.asGridCoords(10,14)]: true,
            [utils.asGridCoords(11,14)]: true,
            [utils.asGridCoords(12,14)]: true,
            [utils.asGridCoords(13,14)]: true,
            [utils.asGridCoords(14,14)]: true,
            [utils.asGridCoords(15,14)]: true,
            [utils.asGridCoords(16,14)]: true,
            [utils.asGridCoords(17,14)]: true,
            [utils.asGridCoords(18,14)]: true,
            [utils.asGridCoords(19,14)]: true,
            [utils.asGridCoords(20,14)]: true,
            [utils.asGridCoords(21,14)]: true,
            [utils.asGridCoords(22,14)]: true,
            [utils.asGridCoords(23,14)]: true,
            [utils.asGridCoords(24,14)]: true,
            [utils.asGridCoords(25,14)]: true,
            [utils.asGridCoords(26,14)]: true,
            [utils.asGridCoords(27,14)]: true,
            [utils.asGridCoords(28,14)]: true,
            [utils.asGridCoords(29,14)]: true,
            [utils.asGridCoords(30,14)]: true,
            [utils.asGridCoords(31,14)]: true,
            [utils.asGridCoords(32,14)]: true,
            [utils.asGridCoords(33,14)]: true,
            [utils.asGridCoords(34,14)]: true,
            [utils.asGridCoords(3,13)]: true,
            [utils.asGridCoords(3,12)]: true,
            [utils.asGridCoords(3,11)]: true,
            [utils.asGridCoords(3,10)]: true,
            [utils.asGridCoords(3,9)]: true,
            [utils.asGridCoords(4,9)]: true,
            [utils.asGridCoords(6,9)]: true,
            [utils.asGridCoords(7,9)]: true,
            [utils.asGridCoords(8,9)]: true,
            [utils.asGridCoords(9,9)]: true,
            [utils.asGridCoords(10,9)]: true,
            [utils.asGridCoords(11,9)]: true,
            [utils.asGridCoords(12,9)]: true,
            [utils.asGridCoords(13,9)]: true,
            [utils.asGridCoords(13,8)]: true,
            [utils.asGridCoords(14,8)]: true,
            [utils.asGridCoords(15,7)]: true,
            [utils.asGridCoords(16,7)]: true,
            [utils.asGridCoords(17,7)]: true,
            [utils.asGridCoords(18,7)]: true,
            [utils.asGridCoords(19,7)]: true,
            [utils.asGridCoords(20,7)]: true,
            [utils.asGridCoords(21,7)]: true,
            [utils.asGridCoords(22,7)]: true,
            [utils.asGridCoords(23,7)]: true,
            [utils.asGridCoords(24,7)]: true,
            [utils.asGridCoords(24,6)]: true,
            [utils.asGridCoords(24,5)]: true,
            [utils.asGridCoords(25,4)]: true,
            [utils.asGridCoords(26,5)]: true,
            [utils.asGridCoords(26,6)]: true,
            [utils.asGridCoords(26,7)]: true,
            [utils.asGridCoords(27,7)]: true,
            [utils.asGridCoords(28,8)]: true,
            [utils.asGridCoords(28,9)]: true,
            [utils.asGridCoords(30,9)]: true,
            [utils.asGridCoords(31,9)]: true,
            [utils.asGridCoords(32,9)]: true,
            [utils.asGridCoords(33,9)]: true,
            [utils.asGridCoords(34,10)]: true,
            [utils.asGridCoords(34,11)]: true,
            [utils.asGridCoords(34,12)]: true,
            [utils.asGridCoords(34,13)]: true,
            [utils.asGridCoords(16,9)]: true,
            [utils.asGridCoords(16,10)]: true,
            [utils.asGridCoords(16,11)]: true,
            [utils.asGridCoords(17,9)]: true,
            [utils.asGridCoords(17,10)]: true,
            [utils.asGridCoords(17,11)]: true,
            [utils.asGridCoords(18,11)]: true,
            [utils.asGridCoords(19,11)]: true,
            [utils.asGridCoords(25,9)]: true,
            [utils.asGridCoords(25,10)]: true,
            [utils.asGridCoords(25,11)]: true,
            [utils.asGridCoords(26,9)]: true,
            [utils.asGridCoords(26,10)]: true,
            [utils.asGridCoords(26,11)]: true,
        },
        cutSceneSpaces: {
            [utils.asGridCoords(5,9)]: [
                {
                    events: [
                        {type: "changeMap", 
                        map: "DemoRoom",
                        x: utils.withGrid(5),
                        y: utils.withGrid(10),
                        direction: "up" 
                    },
                    ]
                }
            ],
            [utils.asGridCoords(29,9)]: [
                {
                    events: [
                        {type: "changeMap",
                         map: "DiningRoom",
                         x: utils.withGrid(6),
                         y: utils.withGrid(12),
                         direction: "up"
                         }
                    ]
                }
            ],
            [utils.asGridCoords(25,5)]: [
                {
                    events: [
                        {type: "changeMap",
                         map: "StreetNorth",
                         x: utils.withGrid(7),
                         y: utils.withGrid(16),
                         direction: "up"
                         }
                    ]
                }
            ],
        },
        
       
    },
    Shop: {
        id: "Shop",
        lowerSrc: "images/maps/PizzaShopLower.png",
        upperSrc: "images/maps/PizzaShopUpper.png",
        configObjects: {
            hero: {
                type: "Person",
                id : "hero",
                isPlayerControlled : true,
                x: utils.withGrid(5),
                y: utils.withGrid(5),
             
            },
            npcA: {
                type: "Person",
                id : "Rachel",
                x: utils.withGrid(3),
                y: utils.withGrid(5),
                src : "images/characters/people/npc4.png",
            },
    },
    walls: {
        [utils.asGridCoords(1,3)]: true,
        [utils.asGridCoords(3,3)]: true,
        [utils.asGridCoords(4,3)]: true,
        [utils.asGridCoords(5,3)]: true,
        [utils.asGridCoords(6,3)]: true,
        [utils.asGridCoords(7,3)]: true,
        [utils.asGridCoords(8,3)]: true,
        [utils.asGridCoords(10,3)]: true,
        [utils.asGridCoords(9,4)]: true,
        [utils.asGridCoords(9,5)]: true,
        [utils.asGridCoords(9,6)]: true,
        [utils.asGridCoords(8,6)]: true,
        [utils.asGridCoords(7,6)]: true,
        [utils.asGridCoords(11,4)]: true,
        [utils.asGridCoords(11,5)]: true,
        [utils.asGridCoords(11,6)]: true,
        [utils.asGridCoords(11,7)]: true,
        [utils.asGridCoords(11,8)]: true,
        [utils.asGridCoords(11,9)]: true,
        [utils.asGridCoords(11,10)]: true,
        [utils.asGridCoords(11,11)]: true,
        [utils.asGridCoords(10,12)]: true,
        [utils.asGridCoords(9,12)]: true,
        [utils.asGridCoords(8,12)]: true,
        [utils.asGridCoords(7,12)]: true,
        [utils.asGridCoords(6,12)]: true,
        [utils.asGridCoords(4,12)]: true,
        [utils.asGridCoords(3,12)]: true,
        [utils.asGridCoords(2,12)]: true,
        [utils.asGridCoords(1,12)]: true,
        [utils.asGridCoords(0,12)]: true,
        [utils.asGridCoords(0,11)]: true,
        [utils.asGridCoords(0,10)]: true,
        [utils.asGridCoords(0,9)]: true,
        [utils.asGridCoords(0,8)]: true,
        [utils.asGridCoords(0,7)]: true,
        [utils.asGridCoords(0,6)]: true,
        [utils.asGridCoords(0,5)]: true,
        [utils.asGridCoords(0,4)]: true,
        [utils.asGridCoords(2,4)]: true,
        [utils.asGridCoords(2,5)]: true,
        [utils.asGridCoords(2,6)]: true,
        [utils.asGridCoords(3,6)]: true,
        [utils.asGridCoords(4,6)]: true,
        [utils.asGridCoords(5,6)]: true,
        [utils.asGridCoords(4,8)]: true,
        [utils.asGridCoords(4,9)]: true,
        [utils.asGridCoords(4,10)]: true,
        [utils.asGridCoords(3,8)]: true,
        [utils.asGridCoords(3,9)]: true,
        [utils.asGridCoords(3,10)]: true,
        [utils.asGridCoords(7,8)]: true,
        [utils.asGridCoords(7,9)]: true,
        [utils.asGridCoords(8,8)]: true,
        [utils.asGridCoords(8,9)]: true,
        [utils.asGridCoords(5,13)]: true,
    },
    cutSceneSpaces: {
        [utils.asGridCoords(5,12)]: [
            {
                events: [
                    {type: "changeMap", 
                    map: "DemoRoom",
                    x: utils.withGrid(7),
                    y: utils.withGrid(4),
                    direction: "down" 
                },
                ]
            }
        ],
    }
},
    StreetNorth:{
    id: "StreetNorth",
    lowerSrc: "images/maps/StreetNorthLower.png",
    upperSrc: "images/maps/StreetNorthUpper.png",
    configObjects: {
        hero: {
            type: "Person",
            id : "hero",
            isPlayerControlled : true,
            x: utils.withGrid(5),
            y: utils.withGrid(6),
         
        },
},
walls:{
    [utils.asGridCoords(3,6)]: true,
    [utils.asGridCoords(3,7)]: true,
    [utils.asGridCoords(2,7)]: true,
    [utils.asGridCoords(1,8)]: true,
    [utils.asGridCoords(1,9)]: true,
    [utils.asGridCoords(1,10)]: true,
    [utils.asGridCoords(1,11)]: true,
    [utils.asGridCoords(1,12)]: true,
    [utils.asGridCoords(1,13)]: true,
    [utils.asGridCoords(1,14)]: true,
    [utils.asGridCoords(1,15)]: true,
    [utils.asGridCoords(2,15)]: true,
    [utils.asGridCoords(3,15)]: true,
    [utils.asGridCoords(4,15)]: true,
    [utils.asGridCoords(5,15)]: true,
    [utils.asGridCoords(6,15)]: true,
    [utils.asGridCoords(4,5)]: true,
    [utils.asGridCoords(5,5)]: true,
    [utils.asGridCoords(6,5)]: true,
    [utils.asGridCoords(8,5)]: true,
    [utils.asGridCoords(9,5)]: true,
    [utils.asGridCoords(10,5)]: true,
    [utils.asGridCoords(11,6)]: true,
    [utils.asGridCoords(12,6)]: true,
    [utils.asGridCoords(13,6)]: true,
    [utils.asGridCoords(14,7)]: true,
    [utils.asGridCoords(14,8)]: true,
    [utils.asGridCoords(14,9)]: true,
    [utils.asGridCoords(14,10)]: true,
    [utils.asGridCoords(14,11)]: true,
    [utils.asGridCoords(14,12)]: true,
    [utils.asGridCoords(14,13)]: true,
    [utils.asGridCoords(14,14)]: true,
    [utils.asGridCoords(14,15)]: true,
    [utils.asGridCoords(13,15)]: true,
    [utils.asGridCoords(12,15)]: true,
    [utils.asGridCoords(11,15)]: true,
    [utils.asGridCoords(10,15)]: true,
    [utils.asGridCoords(9,15)]: true,
    [utils.asGridCoords(8,15)]: true,
    [utils.asGridCoords(6,16)]: true,
    [utils.asGridCoords(7,17)]: true,
    [utils.asGridCoords(8,16)]: true,
    [utils.asGridCoords(7,8)]: true,
    [utils.asGridCoords(7,9)]: true,
    [utils.asGridCoords(7,10)]: true,
    [utils.asGridCoords(8,8)]: true,
    [utils.asGridCoords(8,9)]: true,
    [utils.asGridCoords(8,10)]: true,
    [utils.asGridCoords(9,10)]: true,
    [utils.asGridCoords(10,10)]: true,
},
cutSceneSpaces: {
    [utils.asGridCoords(7,16)]: [
        {
            events: [
                {type: "changeMap", 
                map: "Street",
                x: utils.withGrid(25),
                y: utils.withGrid(5),
                direction: "down" 
            },
            ]
        }
    ],
    [utils.asGridCoords(7,5)]: [
        {
            events: [
                {type: "changeMap", 
                map: "GreenKitchen",
                x: utils.withGrid(5),
                y: utils.withGrid(12),
                direction: "down" 
            },
            ]
        }
    ],
}
},
    GreenKitchen: {
    id: "GreenKitchen",
    lowerSrc: "images/maps/GreenKitchenLower.png",
    upperSrc: "images/maps/GreenKitchenUpper.png",
    configObjects: {
        hero: {
            type: "Person",
            id : "hero",
            isPlayerControlled : true,
            x: utils.withGrid(5),
            y: utils.withGrid(5),
        },
        npcA: {
            type: "Person",
            id : "Finn",
            x: utils.withGrid(1),
            y: utils.withGrid(5),
            src : "images/characters/people/npc8.png",
        },
    },
    walls: {
        [utils.asGridCoords(6,6)]: true,
        [utils.asGridCoords(5,6)]: true,
        [utils.asGridCoords(4,6)]: true,
        [utils.asGridCoords(3,6)]: true,
        [utils.asGridCoords(2,6)]: true,
        [utils.asGridCoords(1,6)]: true,
        [utils.asGridCoords(0,5)]: true,
        [utils.asGridCoords(0,4)]: true,
        [utils.asGridCoords(0,7)]: true,
        [utils.asGridCoords(0,8)]: true,
        [utils.asGridCoords(0,9)]: true,
        [utils.asGridCoords(0,10)]: true,
        [utils.asGridCoords(0,11)]: true,
        [utils.asGridCoords(1,12)]: true,
        [utils.asGridCoords(2,12)]: true,
        [utils.asGridCoords(3,12)]: true,
        [utils.asGridCoords(4,12)]: true,
        [utils.asGridCoords(6,12)]: true,
        [utils.asGridCoords(7,12)]: true,
        [utils.asGridCoords(8,12)]: true,
        [utils.asGridCoords(9,12)]: true,
        [utils.asGridCoords(5,13)]: true,
        [utils.asGridCoords(1,3)]: true,
        [utils.asGridCoords(2,3)]: true,
        [utils.asGridCoords(3,3)]: true,
        [utils.asGridCoords(4,3)]: true,
        [utils.asGridCoords(5,3)]: true,
        [utils.asGridCoords(6,3)]: true,
        [utils.asGridCoords(7,3)]: true,
        [utils.asGridCoords(8,4)]: true,
        [utils.asGridCoords(9,4)]: true,
        [utils.asGridCoords(10,5)]: true,
        [utils.asGridCoords(10,6)]: true,
        [utils.asGridCoords(10,7)]: true,
        [utils.asGridCoords(10,8)]: true,
        [utils.asGridCoords(10,9)]: true,
        [utils.asGridCoords(10,10)]: true,
        [utils.asGridCoords(10,11)]: true,
        [utils.asGridCoords(9,10)]: true,
        [utils.asGridCoords(8,10)]: true,
        [utils.asGridCoords(7,10)]: true,
        [utils.asGridCoords(4,9)]: true,
        [utils.asGridCoords(3,9)]: true,
        [utils.asGridCoords(2,9)]: true,
        [utils.asGridCoords(3,7)]: true,
        [utils.asGridCoords(4,7)]: true,
        [utils.asGridCoords(6,7)]: true,
        [utils.asGridCoords(8,5)]: true,
    },
    cutSceneSpaces: {
        [utils.asGridCoords(5,12)]: [
            {
                events: [
                    {type: "changeMap", 
                    map: "StreetNorth",
                    x: utils.withGrid(7),
                    y: utils.withGrid(5),
                    direction: "down" 
                },
                ]
            }
        ],
    }
},
    DiningRoom: {
    id:"DiningRoom",
    lowerSrc: "images/maps/DiningRoomLower.png",
    upperSrc: "images/maps/DiningRoomUpper.png",
     configObjects: {
        hero: {
            type: "Person",
            id: "hero",
            isPlayerControlled : true,
            x: utils.withGrid(6),
            y: utils.withGrid(10),
        },
        npcA: {
            type: "Person",
            id : "Ethan",
            x: utils.withGrid(2),
            y: utils.withGrid(4),
            src : "images/characters/people/npc5.png",
        },
},
walls: {
    [utils.asGridCoords(0,3)]: true,
    [utils.asGridCoords(0,4)]: true,
    [utils.asGridCoords(0,5)]: true,
    [utils.asGridCoords(0,6)]: true,
    [utils.asGridCoords(0,7)]: true,
    [utils.asGridCoords(0,8)]: true,
    [utils.asGridCoords(0,9)]: true,
    [utils.asGridCoords(0,10)]: true,
    [utils.asGridCoords(0,11)]: true,
    [utils.asGridCoords(1,12)]: true,
    [utils.asGridCoords(2,12)]: true,
    [utils.asGridCoords(3,12)]: true,
    [utils.asGridCoords(4,12)]: true,
    [utils.asGridCoords(5,12)]: true,
    [utils.asGridCoords(7,12)]: true,
    [utils.asGridCoords(8,12)]: true,
    [utils.asGridCoords(9,12)]: true,
    [utils.asGridCoords(10,12)]: true,
    [utils.asGridCoords(11,12)]: true,
    [utils.asGridCoords(12,12)]: true,
    [utils.asGridCoords(13,11)]: true,
    [utils.asGridCoords(13,10)]: true,
    [utils.asGridCoords(13,9)]: true,
    [utils.asGridCoords(13,8)]: true,
    [utils.asGridCoords(13,7)]: true,
    [utils.asGridCoords(13,6)]: true,
    [utils.asGridCoords(13,5)]: true,
    [utils.asGridCoords(13,4)]: true,
    [utils.asGridCoords(12,4)]: true,
    [utils.asGridCoords(11,4)]: true,
    [utils.asGridCoords(10,4)]: true,
    [utils.asGridCoords(1,3)]: true,
    [utils.asGridCoords(2,3)]: true,
    [utils.asGridCoords(3,3)]: true,
    [utils.asGridCoords(4,3)]: true,
    [utils.asGridCoords(5,3)]: true,
    [utils.asGridCoords(6,3)]: true,
    [utils.asGridCoords(1,5)]: true,
    [utils.asGridCoords(2,5)]: true,
    [utils.asGridCoords(3,5)]: true,
    [utils.asGridCoords(4,5)]: true,
    [utils.asGridCoords(6,4)]: true,
    [utils.asGridCoords(6,5)]: true,
    [utils.asGridCoords(9,4)]: true,
    [utils.asGridCoords(6,13)]: true,
    [utils.asGridCoords(2,7)]: true,
    [utils.asGridCoords(3,7)]: true,
    [utils.asGridCoords(4,7)]: true,
    [utils.asGridCoords(2,10)]: true,
    [utils.asGridCoords(3,10)]: true,
    [utils.asGridCoords(4,10)]: true,
    [utils.asGridCoords(7,7)]: true,
    [utils.asGridCoords(8,7)]: true,
    [utils.asGridCoords(9,7)]: true,
    [utils.asGridCoords(10,5)]: true,
    [utils.asGridCoords(11,5)]: true,
    [utils.asGridCoords(12,5)]: true,
    [utils.asGridCoords(11,7)]: true,
    [utils.asGridCoords(12,7)]: true,
    [utils.asGridCoords(7,10)]: true,
    [utils.asGridCoords(8,10)]: true,
    [utils.asGridCoords(9,10)]: true,
},
cutSceneSpaces: {
    [utils.asGridCoords(7,3)]: [
        {
            events: [
                {type: "changeMap", 
                map: "Kitchen",
                x: utils.withGrid(5),
                y: utils.withGrid(10),
                direction: "up" 
            },
            ]
        }
    ],
    [utils.asGridCoords(6,12)]: [
        {
            events: [
                {type: "changeMap", 
                map: "Street",
                x: utils.withGrid(29),
                y: utils.withGrid(9),
                direction: "down" 
            },
            ]
        }
    ],
}
}
}
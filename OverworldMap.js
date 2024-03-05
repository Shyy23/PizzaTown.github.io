class OverworldMap {
    constructor(config){
        this.GameObjects = config.GameObjects;
        this.walls = config.walls || {};

        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;

        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc;

        this.isCutscenePlaying = true;
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
        return this.walls[`${x},${y}`] || false;
    }

    mountObjects (){
        Object.keys(this.GameObjects).forEach(key => {

            let object = this.GameObjects[key];
            object.id = key;
            //TODO: determine if this object should actually mount
            object.mount(this);


        })
    }

    async startCutscene(events){
        this.isCutscenePlaying = true;

        for (let i = 0; i < events.length; i++){
            const eventHandler = new OverworldEvent({
                event: events[i],
                map: this,
            })
            await eventHandler.init();
        }

        this.isCutscenePlaying = false;

        //Reset NPCs to do their idle behavior
        Object.values(this.GameObjects).forEach(object => object.doBehaviorEvent(this))



    }

    addWall(x,y){
       this.walls[`${x},${y}`] = true;
    }
    removeWall(x,y){
        delete this.walls[`${x},${y}`]
    }
    moveWall(wasX, wasY, direction){
        this.removeWall(wasX, wasY)
        const {x,y} = utils.nextPosition(wasX, wasY, direction);
        this.addWall(x,y);
    }

}

window.OverworldMaps = {
    DemoRoom: {
        lowerSrc: "images/maps/DemoLower.png",
        upperSrc: "images/maps/DemoUpper.png",
        GameObjects: {
            hero: new Person({
                id : "hero",
                isPlayerControlled : true,
                x: utils.withGrid(5),
                y: utils.withGrid(6),
            }),
            npcA: new Person({
                x: utils.withGrid(7),
                y: utils.withGrid(9),
                src : "images/characters/people/npc1.png",
                behaviorLoop :[
                    {type : "stand", direction : "left", time : 800},
                    {type : "stand", direction : "up", time : 800},
                    {type : "stand", direction : "right", time : 1200},
                    {type : "stand", direction : "up", time : 300},
                ]
            }),
            npcB: new Person({
                x: utils.withGrid(3),
                y: utils.withGrid(7),
                src : "images/characters/people/npc2.png",
                behaviorLoop: [
                    {type : "walk", direction : "left"},
                    {type : "stand", direction : "up", time : 800},
                    {type : "walk", direction : "up"},
                    {type : "walk", direction : "right"},
                    {type : "walk", direction : "down"},
                ]
            }),
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
            [utils.asGridCoords(1,-1)]: true,
            [utils.asGridCoords(2,-1)]: true,
            [utils.asGridCoords(3,-1)]: true,
            [utils.asGridCoords(4,-1)]: true,
            [utils.asGridCoords(5,-1)]: true,
            [utils.asGridCoords(6,-1)]: true,
            [utils.asGridCoords(7,-1)]: true,
            [utils.asGridCoords(8,-1)]: true,
        },
    }, 



    Kitchen: {
        lowerSrc: "images/maps/KitchenLower.png",
        upperSrc: "images/maps/KitchenUpper.png",
        GameObjects: {
            hero: new Person({
                isPlayerControlled : true,
                x: utils.withGrid(5),
                y: utils.withGrid(7),
            }),
            npcA: new Person({
                x: utils.withGrid(9),
                y: utils.withGrid(6),
                src : "images/characters/people/npc2.png"
            }),
            npcB: new GameObject({
                x: utils.withGrid(10),
                y: utils.withGrid(4),
                src : "images/characters/people/npc3.png"
            })
        }
    }, 
}
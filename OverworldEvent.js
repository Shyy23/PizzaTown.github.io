class OverworldEvent {
    constructor({map, event}){
        this.map = map;
        this.event = event;
    }

    stand(resolve){
        const who = this.map.GameObjects [this.event.who];
        who.startBehavior({
            map: this.map
        }, {
            type: "stand",
            direction : this.event.direction,
            time: this.event.time
        })

        //set up a handler to complete when correct person is done Stand, then resolve the event
        const completeHandler = e => {
            if (e.detail.whoId === this.event.who){
                document.removeEventListener("PersonStandComplete", completeHandler);
                resolve();
            }
        }

        document.addEventListener("PersonStandComplete", completeHandler)
    }

    walk(resolve){
        const who = this.map.GameObjects [this.event.who];
        who.startBehavior({
            map: this.map
        }, {
            type: "walk",
            direction : this.event.direction,
            retry : true
        })

        //set up a handler to complete when correct person is done walking, then resolve the event
        const completeHandler = e => {
            if (e.detail.whoId === this.event.who){
                document.removeEventListener("PersonWalkingComplete", completeHandler);
                resolve();
            }
        }

        document.addEventListener("PersonWalkingComplete", completeHandler)
        }

        textMessage(resolve) {

            if(this.event.faceHero){
                const obj = this.map.GameObjects[this.event.faceHero];
                obj.direction = utils.oppositeDirection(this.map.GameObjects["hero"].direction);
            }

            const message = new TextMessage({
                text: this.event.text,
                onComplete: () => resolve()
            })
            message.init ( document.querySelector(".game-container"))
        }

        changeMap(resolve){

            //Deactivate old Obkects
            Object.values(this.map.GameObjects).forEach(obj => {
                obj.isMounted = false;
            })

            const sceneTransition = new SceneTransition();
            sceneTransition.init(document.querySelector(".game-container"), () => {
                this.map.overworld.startMap(window.OverworldMaps[this.event.map],{
                x: this.event.x,
                y: this.event.y,
                direction: this.event.direction,
                });
                resolve();

                sceneTransition.fadeOut();
            })
        }

        battle(resolve){
            const battle = new Battle({
                enemy: Enemies[this.event.enemyId],
                onComplete: (didWin) => {
                    resolve(didWin ? "WON_BATTLE": "LOSE_BATTLE");
                }
            })
            battle.init(document.querySelector(".game-container"));
        }

        pause(resolve){
            // console.log("PAUSE NOW!")
            this.map.isPaused = true;
            const menu = new PauseMenu({
                progress: this.map.overworld.progress,
                onComplete: () => {
                    resolve();
                    this.map.isPaused = false;
                    this.map.overworld.startGameLoop();
                }
            });
            menu.init(document.querySelector(".game-container"));
        }

        addStoryFlag(resolve){
            window.playerState.storyFlags[this.event.flag] = true;
            resolve();
        }

        craftingMenu(resolve){
            const menu = new CraftingMenu({
                pizzas: this.event.pizzas,
                onComplete: () => {
                    resolve();
                }
            })

            menu.init(document.querySelector(".game-container"))
        }

    init(){
        return new Promise(resolve => {
            this[this.event.type](resolve)
        })
    }

}
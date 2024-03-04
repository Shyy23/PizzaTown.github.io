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
    init(){
        return new Promise(resolve => {
            this[this.event.type](resolve)
        })
    }

}
class Overworld {
    constructor(config) {
        this.element = config.element;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.map = null;
    }

    gameLoopStepWork(delta){
      // Clear off the canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // etablish camera person 
      const cameraPerson = this.map.GameObjects.hero;

      // Update all objects 
     Object.values(this.map.GameObjects).forEach(object => {
     object.update ({
      delta,
     arrow : this.directionInput.direction,
     map : this.map,
   })
 })

 // Draw Lower Layer
 this.map.drawLowerImage(this.ctx, cameraPerson);

 // Draw Game Object
 Object.values(this.map.GameObjects).sort((a, b) => {
   return a.y - b.y;
 }).forEach(object => { 
   object.sprite.draw(this.ctx, cameraPerson);
 })

 // Draw Upper Layer
 this.map.drawUpperImage(this.ctx, cameraPerson);
    }

    startGameLoop() {

      let previousMs;
      const step = 1/60;

      const stepFn = (timestampMs) => {
       
        if(this.map.isPaused){
          return;
        }
        if(previousMs === undefined){
          previousMs = timestampMs;
        }
        let delta = (timestampMs - previousMs) / 1000;
        while(delta >= step){
          this.gameLoopStepWork(delta);
          delta -= step;
        }
        previousMs = timestampMs - delta * 1000;

        //Business as usual tick
        requestAnimationFrame(stepFn)
      }
      //First kick off tick
      requestAnimationFrame(stepFn)
    }

    bindActionInput () {
      new KeyPressListener("Enter", () => {
        //Disini tempat seseorang akan berbicara kepada?
        this.map.checkForActionCutscene()
      })
      new KeyPressListener("Escape", () => {
        if(!this.map.isCutscenePlaying){
          this.map.startCutscene([
            {type: "pause"}
          ])
        }
      })
    }

    bindHeroPositionCheck(){
      document.addEventListener("PersonWalkingComplete", e => {
        if(e.detail.whoId === "hero"){
          
          //Posisi hero dapat dirubah
          this.map.checkForFootstepCutscene()
        }
      })
    }
    
    startMap(mapConfig, heroInitialState=null){
      this.map = new OverworldMap(mapConfig);
      this.map.overworld = this;
      this.map.mountObjects();

      if(heroInitialState){
        const {hero} = this.map.GameObjects;
        hero.x = heroInitialState.x;
        hero.y = heroInitialState.y;
        hero.direction = heroInitialState.direction;
      }

      this.progress.mapId = mapConfig.id;
      this.progress.startingHeroX = this.map.GameObjects.hero.x;
      this.progress.startingHeroY = this.map.GameObjects.hero.y;
      this.progress.startingHeroDirection = this.map.GameObjects.hero.direction;
    }

  
    async init() {
      
      const container = document.querySelector(".game-container");
      //Create a new Progress tracker
      this.progress = new Progress();

      //Show the Tittle Screen
      this.titleScreen = new TitleScreen({
        progress: this.progress
      })
      const useSaveFile = await this.titleScreen.init(container)
    

      //Potentially load save data
      let initialHeroState = null;
      if(useSaveFile){
        this.progress.load();
        initialHeroState = {
          x: this.progress.startingHeroX,
          y: this.progress.startingHeroY,
          direction: this.progress.startingHeroDirection,
        }
      }

      //Load the Hud
      this.hud = new Hud();
      this.hud.init(container);
  
      //Mulai map pertama
      this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState);

      //Buat kontrol
      this.bindActionInput();
      this.bindHeroPositionCheck();

      this.directionInput = new DirectionInput();
      this.directionInput.init();
      
      //Mulai Permainan
      this.startGameLoop();



        
      this.map.startCutscene([
      
      {who: "hero", type: "walk", direction:"right"}, 
      {who: "hero", type: "walk", direction:"up"}, 
      {type: "textMessage", text: "..........."},
      {who: "hero", type: "stand", direction:"left", time: "800"}, 
      {who: "hero", type: "stand", direction:"right", time: "800"}, 
      {who: "hero", type: "stand", direction:"up"}, 
      {who: "Walikota", type: "walk", direction:"left"}, 
      {who: "Walikota", type: "walk", direction:"left"}, 
      {who: "Walikota", type: "walk", direction:"left"}, 
      {who: "Walikota", type: "walk", direction:"left"}, 
      {who: "Walikota", type: "walk", direction:"left"}, 
      {who: "Walikota", type: "walk", direction:"left"}, 
      {who: "Walikota", type: "walk", direction:"left"}, 
      {who: "Walikota", type: "walk", direction:"left"}, 
      {who: "Walikota", type: "walk", direction:"left"}, 
      {who: "Walikota", type: "walk", direction:"left"}, 
      {type: "textMessage", text: "Halo Anak Muda!"},
      {type: "textMessage", text: "????"},
      {who: "hero", type: "stand", direction:"right"}, 
      {who: "hero", type: "walk", direction:"right"}, 
      {who: "hero", type: "walk", direction:"down"}, 
      {who: "hero", type: "walk", direction:"right"}, 
      {type: "textMessage", text: "Perkenalkan aku Walikota di Pizza Town ini!"},
      {type: "textMessage", text: "Yah seperti namanya , Makanan Khas disini adalah Pizza!"},
      {type: "textMessage", text: "Banyak Koki dari seluruh Kota datang ke sini untuk menguji keahliannya!"},
      {type: "textMessage", text: "Karena setiap 4 tahun sekali akan diadakan Pizza War!! "},
      {type: "textMessage", text: "yaitu, Event menentukan koki terhebat dikota ini!! "},
      {type: "textMessage", text: "Wow!!, Kedengarannya Baik."},
      {type: "textMessage", text: "Ya tentu saja baik karena hadiahnya dia mendapat resep rahasia Pizza Legendaris "},
      {type: "textMessage", text: "yang hanya bisa dibuat beberapa orang!!"},
      {type: "textMessage", text: "Dia juga bisa menjadi Walikota sepertiku!!"},
      {type: "textMessage", text: "dan kamu beruntung karena event itu akan diadakan 1 tahun lagi!!  "},
      {type: "textMessage", text: "Bersiaplah dan belajar di Kota ini. "},
      {type: "textMessage", text: "Pertama, kau bisa belajar di toko yang berada di sampingmu itu!"},
      {who: "Walikota", type: "stand", direction:"up"}, 
      {who: "hero", type: "stand", direction:"up"}, 
      {type: "textMessage", text: "Disana ada 3 orang yang akan membimbingmu."},
      {type: "textMessage", text: "Namun Bersiaplah!!"},
      {type: "textMessage", text: "Kau tidak akan bisa keluar sebelum pembelajaranmu selesai!!"},
      {type: "textMessage", text: "Kalau begitu cukup disini saja penjelasanku."},
      {type: "textMessage", text: "Aku akan menyapamu lagi setelah kau selesai disana."},
      {type: "textMessage", text: "Sampai Jumpa Lagi."},
      {who: "Walikota", type: "walk", direction:"right"}, 
      {who: "Walikota", type: "walk", direction:"right"}, 
      {who: "Walikota", type: "walk", direction:"right"}, 
      {who: "Walikota", type: "walk", direction:"right"}, 
      {who: "Walikota", type: "walk", direction:"right"}, 
      {who: "Walikota", type: "walk", direction:"right"}, 
      {who: "Walikota", type: "walk", direction:"right"}, 
      {who: "Walikota", type: "walk", direction:"right"}, 
      {who: "Walikota", type: "walk", direction:"right"}, 
      {who: "Walikota", type: "walk", direction:"right"}, 
      {who: "Walikota", type: "walk", direction:"right"}, 
      {who: "hero", type: "walk", direction:"left"}, 
      {who: "hero", type: "walk", direction:"left"}, 
      {who: "hero", type: "walk", direction:"up"}, 
      {who: "hero", type: "walk", direction:"up"}, 
      {who: "hero", type: "walk", direction:"up"}, 
      { type: "changeMap", map:"DemoRoom",   x: utils.withGrid(5),
      y: utils.withGrid(10),
      direction: "up" }, 
      
      
      
    
    ])
       
}

}
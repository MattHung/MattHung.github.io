UIBillboard=gameLayer.extend({    
    ctor: function (rootNode) {
        this._super(rootNode);
        this.initUI();

        this.schedule(this.update);
    },

    initUI:function(){         
        this.getNode("billboard").setLocalZOrder(1);
    },
    update:function(dt){
      
    },
});
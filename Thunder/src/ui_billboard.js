UIBillboard=gameLayer.extend({    
    MAX_RANK_COUNT:5,
    _score_text:null,

    ctor: function (rootNode) {
        this._super(rootNode);
        this.initUI();

        this.schedule(this.update);
    },

    initUI:function(){         
        this._score_text = [];

        for(var i=1; i<=this.MAX_RANK_COUNT; i++)
            this._score_text[i] = this.getNode(String.format("billboard/txt_score_{0}", i));

        this.getNode("billboard").setLocalZOrder(1);
    },
    update:function(dt){
        var rankInfo = AccountManager.getInstance().getRankedInfo();

        for(var i=1; i<=this.MAX_RANK_COUNT; i++){
            var index = i-1;

            if(!rankInfo[index]){
                this._score_text[i].setVisible(false);
                continue;
            }

            var user_id = rankInfo[i];

            this._score_text[i].setVisible(true);
            this._score_text[i].setString(String.format("{0} :{1}", AccountManager.getInstance().getSave(user_id).UserName, AccountManager.getInstance().getSave(user_id).Score));
        }
    },
});
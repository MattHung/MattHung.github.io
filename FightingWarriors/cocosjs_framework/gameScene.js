/**
 * Created by matt1201 on 2016/3/21.
 */

var scenes=[];

var gameScene = cc.Scene.extend({

    ctor:function(scene_res_name){
        this._super();
        scenes.push(this);
    },
    onExit:function(){
        var index = scenes.indexOf(this);
        if(index>=0)
            scenes.splice(index, 1);
    }
});

var SceneManger =(function(){
    var _instance=null;
    function createInstance(){
        function findSpecifyScene(sceneClass){
            for(var i =0; i<scenes.length; i++)
                if(scenes[i] instanceof sceneClass )
                    return scenes[i];

            return null;
        }

        return{
            findSpecifyScene:findSpecifyScene
        }
    }

    return {
        getInstance:function(){
            if(!_instance)
                _instance = createInstance();
            return _instance;
        }
    }

})();
/**
 * Created by jeff_chien on 2017/1/11.
 */

var RoomLayer = gameLayer.extend({

    ctor: function () {
        this._super(res.RoomScene_json);

        this.initEventSet();
        GameManager.getInstance().initialRoomSceneUI(this.root_node);
        baccaratPeer.getInstance().sendMessage("RoomList", {RoomType: RoomType.GodOfGambler});
        return true;
    },

    initEventSet: function () {
        CocosWidget.eventRegister.getInstance().setRootNode(this.root_node);
    }
});

var res = {
    HelloWorld_png: "res/HelloWorld.png",
    WhiteBg_png: "res/Gambler_res/whiteBG.png",
    MsgBox_BG:"res/Msg_Box/MsgBox_BG.png",    
    ClippingNode_png: "res/ClippingNode.png",
    Language_en_json: "res/language/language_en.json",
    Language_cn_json: "res/language/language_cn.json",
    Language_tw_json: "res/language/language_tw.json",
    Sound_json: "res/Sound/SoundMusic.json"
};

var scene_json = {
    MainScene_json: "res/MainScene.json",
    GamblerScene_json: "res/GamblerScene.json",
    LoginPanel_json: "res/LoginScene.json",
    RoomScene_json: "res/RoomScene.json",
}

var rp = {};
rp.resPath = "src/Vendor/CYRoadMap/res/";

rp.res = {
    newRoadMapPng: rp.resPath + "RoadMapForAll.png",
    newRoadMapPlist: rp.resPath + "RoadMapForAll.plist",
    roadmapDefaultBG_14: rp.resPath + "roadMap_BigRoad_14_bg.png",
    roadmapDefaultBG_28: rp.resPath + "roadMap_Hybrid_28_bg.png",
    askPlayerBtn_up: rp.resPath + "tw/ask_btn_player_up_tw.png",
    askPlayerBtn_down: rp.resPath + "tw/ask_btn_player_down_tw.png"
};

var msg_res = {
    bg: "res/Msg_Box/MsgBox_BG.png",
    mask_bg: "res/Msg_Box/mask.png",
    mouse_up: "res/Msg_Box/btn_confirm_up.png",
    mouse_down: "res/Msg_Box/btn_confirm_down.png",
    leave_mouse_down: "res/Msg_Box/btn_s_withdraw_down.png",
    leave_mouse_up: "res/Msg_Box/btn_s_withdraw_up.png",
    leave_mouse_over: "res/Msg_Box/btn_s_withdraw_over.png",
    red_mouse_down:"res/Msg_Box/btn_s_enroll_down.png",
    red_mouse_up:"res/Msg_Box/btn_s_enroll_up.png",
    red_mouse_over:"res/Msg_Box/btn_s_enroll_over.png"
};

var g_resources = [];
for (var i in res)
    g_resources.push(res[i]);

for (var i in rp.res)
    g_resources.push(rp.res[i]);

for (var i in msg_res)
    g_resources.push(msg_res[i]);

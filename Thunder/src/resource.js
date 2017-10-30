var res = {    
	Login_json : "res/Login.json",
	Message_json : "res/MessageBox.json",
    MainScene_json : "res/MainScene.json",
    Level1_json : "res/Level1.json",

    music_scene : "res/assets/audio/bgMusic_Scene_Menu.mp3",
    music_play : "res/assets/audio/bgMusic_Scene_Play.mp3"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}

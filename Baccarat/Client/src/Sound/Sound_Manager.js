/**
 * Created by nora_wang on 2016/12/16.
 */

var sound_manager = cc.Class.extend({
    _isSoundEffect: true,
    _isSoundVoice: true,
    _isSoundBGM: true,
    _bg: null,
    _RoomBGM: null,
    SoundMap: [],
    _allSound: null,
    _audioEngine: null,
    _tempChoiceLan: null,
    _BGMusicName: null,
    _VoiceName: null,
    _EffectsName: null,
    _MusicLanguage: {
        en: 0,
        cn: 1,
        tw: 2
    },
    _Music: {
        "Voice": "Voice"
    },
    effectPool: {},
    _Voice: 0,
    _Status: {
        InRoom: 0,
        InGame: 1
    },

    getLobbyMusic: function () {
        if (!cc.audioEngine.isMusicPlaying())
            return "gog1";
        var curtMusic = cc.audioEngine._currMusic;
        if (curtMusic)
            if (curtMusic.src)
                var music_name = curtMusic.src.split("/")[curtMusic.src.split("/").length - 1].split(".")[0];
        if (music_name)
            return music_name;
    },

    getInitMusicName: function () {
        if (this.getLobbyMusic() == "gog1")
            return "live 01";
        if (!this._bg)
            return "live 01";
        var music = "live 01";
        var music_name = this._bg.split("/")[this._bg.split("/").length - 1].split(".")[0];
        if (music_name.length > 0) {
            music = music_name.substr(0, 4);
            music += " 0" + music_name.substr(music_name.length - 1, 1);
            return music;
        }
        return "live 01";
    },

    getInitEffect: function (index) {
        switch (index) {
            case EffectClassify.BGMusic:
                return this._isSoundBGM;
            case EffectClassify.Effect:
                return this._isSoundEffect;
            case EffectClassify.Voice:
                return this._isSoundVoice;
        }
    },

    setSoundBGM: function (isOn) {
        this._isSoundBGM = isOn;
    },

    setSoundEffect: function (isOn) {
        this._isSoundEffect = isOn;
    },

    isSoundEffectOn: function () {
        return this._isSoundEffect;
    },

    setSoundVoice: function (isOn) {
        this._isSoundVoice = isOn;
    },

    isSoundVoiceOn: function () {
        return this._isSoundVoice;
    },

    ctor: function () {
        this._allSound = cc.loader.getRes(res.Sound_json);

        this._tempChoiceLan = language_manager.getInstance().getLanguage();
        this.initMap();

    },

    initMap: function () {
        this.SoundMap[EffectClassify.Voice] = null;
        this.SoundMap[EffectClassify.Effect] = null;
        this.SoundMap[EffectClassify.BGMusic] = null;

        this.effectPool["Voice"] = null;
        this.effectPool["Effect"] = null;
    },

    setBGMusic: function (music_name, option) {

        this.SoundMap[EffectClassify.BGMusic] = music_name;
        this._BGMusicName = music_name;
        this._Music.BGMusic = 2;
        this._Music.RoomThemeBGM = 1;
        if (option == this._Status.InGame) {
            this._bg = this._allSound[this._Music.BGMusic]["BGMusic"][this._BGMusicName];
            this.playBG();
        }

        if (option == this._Status.InRoom) {
            this._RoomBGM = this._allSound[this._Music.BGMusic]["RoomBGMusic"][1]["ThemeMusic"][this._BGMusicName];
            this.playRoomBg();
        }
    },

    setEffectName: function (EffectsName) {
        this.SoundMap[EffectClassify.Effect] = EffectsName;
        this._EffectsName = EffectsName;
        this._Music.other = 1;
        this.effectPool["Effect"] = cc.audioEngine.playEffect(this._allSound[this._Music.other]["otherEffect"][this._EffectsName], false);
    },

    getSoundMap: function () {
        return this.SoundMap;
    },

    setVoiceName: function (VoiceName) {
        this.SoundMap[EffectClassify.Voice] = VoiceName;
        cc.audioEngine.setMusicVolume(1);
        cc.audioEngine.setEffectsVolume(1);
        this._VoiceName = VoiceName;

        var path = null;
        switch (this._tempChoiceLan) {
            case language_manager.getInstance().Choose_Language.lan_English:
                path = this._allSound[this._Voice][this._Music.Voice][this._MusicLanguage.en][this._Voice][this._VoiceName];
                break;
            case language_manager.getInstance().Choose_Language.lan_simCh:
                path = this._allSound[this._Voice][this._Music.Voice][this._MusicLanguage.cn][this._Voice]["cn"][this._VoiceName];
                break;
            case language_manager.getInstance().Choose_Language.lan_tradCh:
                path = this._allSound[this._Voice][this._Music.Voice][this._MusicLanguage.tw][this._Voice]["tw"][this._VoiceName];
                break;
        }

        this.effectPool["Voice"] = cc.audioEngine.playEffect(path, false);

    },

    setEffectMute: function () {
        cc.audioEngine.setEffectsVolume(0);
    },

    setMusicMute: function () {
        cc.audioEngine.setMusicVolume(0);

    },

    setVoiceVol: function (Vol) {
        if (this.effectPool["Voice"])
            this.effectPool["Voice"].setVolume(Vol);

    },
    setEffectVol: function (Vol) {
        if (this.effectPool["Effect"])
            this.effectPool["Effect"].setVolume(Vol);
    },

    setMusicVol: function (Vol) {
        cc.audioEngine.setMusicVolume(Vol);
    },

    playBG: function () {
        cc.audioEngine.playMusic(this._bg, true);

    },

    playRoomBg: function () {
        cc.audioEngine.playMusic(this._RoomBGM, true);

    },

    stopBG: function () {
        if (this._bg != null) {
            cc.audioEngine.stopMusic(this._bg);
        }
    },

    stopRoomBG: function () {
        if (this._RoomBGM != null) {
            cc.audioEngine.stopMusic(this._RoomBGM);
        }
    },

    pauseRoomBG: function () {
        if (this._RoomBGM != null) {
            cc.audioEngine.pauseMusic(this._RoomBGM);
        }

    },

    resumeRoomBG: function () {
        if (this._RoomBGM != null) {
            cc.audioEngine.playMusic(this._RoomBGM, true);
        }
    },

    playEffect: function (url, loop) {

        if (SWB && this._currMusic && this._currMusic.getPlaying()) {
            cc.log('Browser is only allowed to play one audio');
            return null;
        }

        var effectList = this._audioPool[url];
        if (!effectList) {
            effectList = this._audioPool[url] = [];
        }

        for (var i = 0; i < effectList.length; i++) {
            if (!effectList[i].getPlaying()) {
                break;
            }
        }

        if (!SWA && i > this._maxAudioInstance) {
            var first = effectList.shift();
            first.stop();
            effectList.push(first);
            i = effectList.length - 1;
            // cc.log("Error: %s greater than %d", url, this._maxAudioInstance);
        }

        var audio;
        if (effectList[i]) {
            audio = effectList[i];
            audio.setVolume(this._effectVolume);
            audio.play(0, loop || false);
            return audio;
        }

        audio = cc.loader.getRes(url);

        if (audio && SWA && audio._AUDIO_TYPE === 'AUDIO') {
            cc.loader.release(url);
            audio = null;
        }

        if (audio) {

            if (SWA && audio._AUDIO_TYPE === 'AUDIO') {
                loader.loadBuffer(url, function (error, buffer) {
                    audio.setBuffer(buffer);
                    audio.setVolume(cc.audioEngine._effectVolume);
                    if (!audio.getPlaying())
                        audio.play(0, loop || false);
                });
            } else {
                audio = audio.cloneNode();
                audio.setVolume(this._effectVolume);
                audio.play(0, loop || false);
                effectList.push(audio);
                return audio;
            }

        }

        //var cache = loader.useWebAudio;
        //
        //cc.loader.load(url, function (audio) {
        //    audio = cc.loader.getRes(res.Sound_json);
        //    audio = audio.cloneNode();
        //    audio.setVolume(cc.audioEngine._effectVolume);
        //    audio.play(0, loop || false);
        //    effectList.push(audio);
        //});
        //loader.useWebAudio = cache;
        //
        //return audio;
    },

    getGameLanguage: function (lang) {
        this._tempChoiceLan = lang;
    }

});

sound_manager._instance = null;

sound_manager.getInstance = function () {

    if (sound_manager._instance == null)
        sound_manager._instance = new sound_manager();

    return sound_manager._instance;
};


function setRoomBackgroundMusic(power) {
    if (power == true) {
        if (ui_Effect.getInstance().isMute())
            return;
        if (sound_manager.getInstance()._RoomBGM == null)
            sound_manager.getInstance().setBGMusic("gog1", 0);
        else {
            sound_manager.getInstance().resumeRoomBG();

        }
        sound_manager.getInstance().setSoundBGM(true);
        sound_manager.getInstance().setSoundEffect(true);
        sound_manager.getInstance().setSoundVoice(true);
    }
    else {
        sound_manager.getInstance().pauseRoomBG();
        sound_manager.getInstance().setSoundBGM(false);
        sound_manager.getInstance().setSoundEffect(false);
        sound_manager.getInstance().setSoundVoice(false);
    }

}

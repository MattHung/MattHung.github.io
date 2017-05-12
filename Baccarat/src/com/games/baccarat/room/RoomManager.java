package com.games.baccarat.room;

import com.eject.custom.types.AccOperationResult;
import com.eject.custom.types.ExchangeRatio;
import com.eject.custom.types.OperationType;
import com.eject.interop.ActorBase;
import com.games.baccarat.Entry;
import com.games.baccarat.ProtocolHandler;
import com.games.baccarat.ScannerReceiver;
import com.games.baccarat.actor.ActorManager;
import com.games.baccarat.types.*;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import java.lang.reflect.Field;
import java.sql.Time;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by matt1201 on 2016/11/28.
 */
public class RoomManager {
    public static Map<Long, Integer> ActorMap = new HashMap<>();
    private static Map<Integer, IBaccaratRoom> _rooms = new ConcurrentHashMap();
    private static Gson gson = new Gson();

    public static Map<Integer, IBaccaratRoom> getRooms(){
        return _rooms;
    }

    static {
        addTestTable();

        Entry.Instance().queryWagers(SQLQuerys.QUERY_GAME_SETTINGS);

//        Entry.TickEvent.AddOnInterval(1 * 1000, new Runnable() {
//            @Override
//            public void run() {
//                Entry.Instance().queryWagers(SQLQuerys.QUERY_GAME_SETTINGS);
//            }
//        });
    }

    public static void addTestTable(){
        List<SessionSetting> settings = new LinkedList<>();
        for(int i=0; i<5; i++) {
            int room_id = 1000+i;
            SessionSetting setting = new SessionSetting();

            setting.Name = String.format("Room%d", room_id);
            setting.Requirement = 0;
            setting.RunningMinutes = 0;
            setting.TotalReward = 888888;
            setting.HallID = 0;
            setting.PassCount = 3;
            setting.HideCount = 3;

            setting.RoomID = room_id;
            setting.Max_enroll_count = 1;
            setting.Entrance_fee = 10;
            setting.Service_fee = 0;

            setting.Initial_chips = 300000;

            setting.MinBet = 5;
            setting.MaxBet = 5000;

            setting.PassTimes = 3;   //過牌次數
            setting.HideTimes = 3;   //暗注次數
            setting.ResumeTimes =3;  //斷線離局次數 (EX離開時間不可超過2局，若超過則自動淘汰)

            settings.add(setting);
//            createRoom(setting.RoomID, setting);
        }

        String str = gson.toJson(settings);

        JsonArray j_array = gson.fromJson(str, JsonArray.class);

        for(int i=0; i<j_array.size(); i++){
            j_array.get(i).getAsJsonObject().addProperty("ApplyDate", "0000/00/00 am 00:00:00");
            j_array.get(i).getAsJsonObject().addProperty("ApplyTimeBegin", "00:00:00");
            j_array.get(i).getAsJsonObject().addProperty("ApplyTimeEnd", "23:59:59");
            j_array.get(i).getAsJsonObject().addProperty("SessionStartTime", "00:00:00");
            j_array.get(i).getAsJsonObject().addProperty("DefaultSession", "0");

            j_array.get(i).getAsJsonObject().addProperty("SettingType", "1");

            j_array.get(i).getAsJsonObject().addProperty("Rank1", "58888");
            j_array.get(i).getAsJsonObject().addProperty("Rank2", "20000");
            j_array.get(i).getAsJsonObject().addProperty("Rank3", "10000");
        }

        SettingManger.updateSetting(j_array.toString());
    }

    public static int getRestoreRoomID(int user_id){
        for(IBaccaratRoom room :_rooms.values())
        if(room instanceof GodOfGambler)
        if(((GodOfGambler)room).containsUser(user_id))
            return ((GodOfGambler) room).getRoomID();

        return 0;
    }

    public static void restoreSession(long actor_id){
        for(IBaccaratRoom room :_rooms.values())
        if(room instanceof GodOfGambler)
        if(((GodOfGambler)room).containsUser(ActorBase.getUserID(actor_id))) {
            ((GodOfGambler) room).restoreSession(actor_id);
            return;
        }
    }

    private static boolean compareSettings(SessionSetting settingA, SessionSetting settingB){
        Field[] fields = settingA.getClass().getDeclaredFields();

        for(int i=0; i<fields.length; i++)
        try {
            if(fields[i].get(settingA)==null)
                continue;
            if(!fields[i].get(settingA).equals(fields[i].get(settingB)))
                return false;
        } catch (Exception e) {
            e.printStackTrace();
        }

        return true;
    }

    public static void checkTimeSetPrepareRoom(){
        for(int room_id : SettingManger.DB_Source_Settings.Settings.keySet()) {
            SessionSetting setting_time_set = SettingManger.getCurrentSetting(room_id, SessionSettingType.TimeSet);

            if(setting_time_set==null)
                continue;

            int prepare_room_id = GodOfGambler.getPrepareRoomID(room_id, SessionSettingType.TimeSet);

            if(_rooms.containsKey(prepare_room_id))
                continue;

            GodOfGambler gog_room = createRoom(prepare_room_id, setting_time_set);
            gog_room.updatePreview();
        }
    }

    private static void checkSessionConflict(){
        for(IBaccaratRoom room : _rooms.values()){
            if(!(room instanceof GodOfGambler))
                continue;

            GodOfGambler godOfGambler = (GodOfGambler)room;

            if(godOfGambler.getSetting().SettingType!=SessionSettingType.SitAndGo)
                continue;

            int room_id = GodOfGambler.getSourceRoomID(godOfGambler.RoomID());
            if(SettingManger.checkTimeSetConflict(room_id, godOfGambler.getSetting().RunningMinutes))
                cancelSession(room_id, SessionSettingType.SitAndGo);
        }
    }

    public static void cancelSession(int room_id, SessionSettingType type){
        for(IBaccaratRoom room : _rooms.values()){
            if(!(room instanceof GodOfGambler))
                continue;

            GodOfGambler godOfGambler = (GodOfGambler)room;

            if(godOfGambler.getIsRunning())
                continue;

            if(GodOfGambler.getSourceRoomID(room_id)!=room_id)
                continue;

            if(godOfGambler.getSetting().SettingType!=type)
                continue;

            godOfGambler.SessionOver(1, LeaveCause.SessionConflict);
            _rooms.remove(((GodOfGambler) room).getRoomID());
        }
    }

    public static void checkSitAndGoPrepareRoom(){
        List<GodOfGambler> gog_rooms = new LinkedList<>();

        for(IBaccaratRoom room : _rooms.values())
        if(room instanceof GodOfGambler)
        if(!GodOfGambler.checkIsPrepareRoom(((GodOfGambler) room).getRoomID()))
            gog_rooms.add((GodOfGambler)room);

        //check create prepare room
        for(int i=0; i<gog_rooms.size(); i++){
            if(gog_rooms.get(i).getSetting().SettingType == SessionSettingType.SitAndGo)
            if(!gog_rooms.get(i).getIsRunning())
                continue;

            int prepare_room_id = GodOfGambler.getPrepareRoomID(gog_rooms.get(i).getRoomID(), SessionSettingType.SitAndGo);

            if(_rooms.containsKey(prepare_room_id))
                continue;

            SessionSetting setting_sit_and_go = SettingManger.getCurrentSetting(gog_rooms.get(i).getRoomID(), SessionSettingType.SitAndGo);
            GodOfGambler prepare_room = createRoom(prepare_room_id, setting_sit_and_go);
            if(prepare_room!=null)
                prepare_room.updatePreview();
        }
    }

    private static void checkPromotePrepareRoom(){
        HashMap<Integer, List<GodOfGambler>> prepare_rooms = new HashMap<>();

        for(IBaccaratRoom room : _rooms.values())
        if(room instanceof GodOfGambler) {
            if (!GodOfGambler.checkIsPrepareRoom(((GodOfGambler) room).getRoomID()))
                continue;

            int source_room_id = GodOfGambler.getSourceRoomID(((GodOfGambler) room).getRoomID());

            if(!prepare_rooms.containsKey(source_room_id))
                prepare_rooms.put(source_room_id, new LinkedList<>());

            prepare_rooms.get(source_room_id).add((GodOfGambler)room);
        }


        for(int source_room_id : prepare_rooms.keySet()){
            prepare_rooms.get(source_room_id).sort(new Comparator<GodOfGambler>() {
                @Override
                public int compare(GodOfGambler o1, GodOfGambler o2) {
                    return (o1.getSetting().SettingType == SessionSettingType.TimeSet)? 1: -1;
                }
            });

            GodOfGambler source_room = null;

            if(_rooms.containsKey(source_room_id)) {
                source_room = (GodOfGambler)_rooms.get(source_room_id);

                if (((GodOfGambler) (_rooms.get(source_room_id))).getIsRunning())
                    continue;
            }

            if(prepare_rooms.get(source_room_id).size() <=0 )
                continue;

            int prepare_room_id = prepare_rooms.get(source_room_id).get(0).getRoomID();
            if(_rooms.containsKey(prepare_room_id)) {
                GodOfGambler running_room = ((GodOfGambler) _rooms.get(prepare_room_id));

                if(running_room.getSetting().SettingType == SessionSettingType.TimeSet){
                    Calendar cal_now = Calendar.getInstance();

                    Calendar cal_start_time = Calendar.getInstance();
                    cal_start_time.setTime(running_room.getSetting().SessionStartTime);


                    int time_stamp_now = SettingManger.getSeconds(cal_now);
                    int time_stamp_start =  SettingManger.getSeconds(cal_start_time);

                    if(time_stamp_now < time_stamp_start)
                        continue;
                }

                if(source_room==null)
                    running_room.changeRoomID(source_room_id);
                else
                    running_room.changeRoomID(source_room_id, source_room.getShoeInfo(), source_room.getRoadMapStr());

                _rooms.remove(prepare_room_id);
                _rooms.put(running_room.getRoomID(), running_room);
            }
        }
    }

    private static GodOfGambler createRoom(int room_id, SessionSetting setting){
        if(_rooms.containsKey(room_id))
            return null;

//        if(setting.SettingType==SessionSettingType.SitAndGo)
//        if(SettingManger.checkTimeSetConflict(GodOfGambler.getSourceRoomID(room_id), setting.RunningMinutes))
//            return null;

        int source_room_id = GodOfGambler.getSourceRoomID(room_id);

        GodOfGambler result = new GodOfGambler(room_id, setting);
        _rooms.put(room_id, result);
        return result;
    }

    public static void ApplySettingOnRoom(){
        for(int room_id : SettingManger.DB_Source_Settings.Settings.keySet()){
            SessionSetting setting = SettingManger.getCurrentSetting(room_id, SessionSettingType.SitAndGo);

            if(setting==null)
                continue;

            createRoom(room_id, setting);
        }

        for(int i=0; i<_rooms.size(); i++){
            if(!(_rooms.get(i) instanceof GodOfGambler))
                continue;

            int room_id = _rooms.get(i).RoomID();
            GodOfGambler godOfGamblerRoom = ((GodOfGambler)_rooms.get(room_id));

            int source_room_id = GodOfGambler.getSourceRoomID(room_id);

            SessionSetting setting = SettingManger.getCurrentSetting(source_room_id, godOfGamblerRoom.getSetting().SettingType);

            if(setting==null)
                continue;

            if(compareSettings(setting, godOfGamblerRoom.getSetting()))
                continue;

            godOfGamblerRoom.setSetting(setting);
            godOfGamblerRoom.initialTables();
        }
    }

    public static void removeRedundantRooms(){
        for(IBaccaratRoom room : _rooms.values()){
            if(!(room instanceof GodOfGambler))
                continue;

            GodOfGambler godOfGamblerRoom = (GodOfGambler)room;

            if(godOfGamblerRoom.getIsRunning())
                continue;

            int room_id = GodOfGambler.getSourceRoomID(((GodOfGambler)room).getRoomID());
            if(SettingManger.getCurrentSetting(room_id, SessionSettingType.SitAndGo)==null)
                _rooms.remove(((GodOfGambler) room).getRoomID());
        }
    }

    public static void checkSessionStart(){
        for(IBaccaratRoom room : _rooms.values()){
            if(!(room instanceof GodOfGambler))
                continue;

            GodOfGambler gog_room = ((GodOfGambler) room);
            gog_room.checkStart();
        }
    }

    public static void update(){
        ApplySettingOnRoom();
        checkSessionConflict();
        checkTimeSetPrepareRoom();
        checkSitAndGoPrepareRoom();
        checkPromotePrepareRoom();

        removeRedundantRooms();
        checkSessionStart();
        _rooms.values().forEach(IBaccaratRoom::updateRoom);
    }

    public static void receive_card(int camera_id, int device_id, PokerCard.Card card){
        if(!_rooms.containsKey(camera_id))
            return;

        _rooms.get(camera_id).scanner_input(device_id, card);
    }

    public static Status getRoomStatus(int camera_id){
        return _rooms.get(camera_id).getStatus();
    }

    public static void enterRoom(long actor_id, int room_id){
//        3:房間不存在
        if(!_rooms.containsKey(room_id)) {
            ProtocolHandler.sendEnterResult(actor_id, room_id, 3);
            return;
        };

        _rooms.get(room_id).enterRoom(actor_id);
        if(_rooms.get(room_id).contains(actor_id))
            addActor(actor_id, room_id);
    }

    public static void addActor(long actor_id, int room_id){
        ActorMap.put(actor_id, room_id);
    }

    private static void clearGOGLeaveMessage(long actor_id, LeaveCause cause){
        for(IBaccaratRoom room : _rooms.values()){
            if(!(room instanceof GodOfGambler))
                continue;

            GodOfGambler gog_room = ((GodOfGambler)room);

            gog_room.clearGOGLeaveMessage(actor_id);

            if(!gog_room.contains(actor_id))
                continue;

            gog_room.leaveRoom(actor_id, cause);
        }
    }

    public static boolean leaveRoom(long actor_id, LeaveCause cause){
        if(actor_id==0)
            return false;

        if(!ActorMap.containsKey(actor_id)) {
            clearGOGLeaveMessage(actor_id, cause);
            return false;
        }

        int room_id = ActorMap.get(actor_id);

        if(!_rooms.containsKey(room_id))
            return false;

        boolean success = _rooms.get(room_id).leaveRoom(actor_id, cause);
        ActorMap.remove(actor_id);

        return success;
    }

    public static void silentLeaveRoom(long actor_id, LeaveCause cause){
        if(actor_id==0)
            return;

        if(!ActorMap.containsKey(actor_id))
            return;

        int room_id = ActorMap.get(actor_id);

        if(!_rooms.containsKey(room_id))
            return;

        _rooms.get(room_id).silentLeaveRoom(actor_id, cause);
        ActorMap.remove(actor_id);
    }

    public static void placeBet(long actor_id, JsonObject jsonObject){
        if(!ActorMap.containsKey(actor_id))
            return;

        int room_id = ActorMap.get(actor_id);

        if(!_rooms.containsKey(room_id))
            return;

        _rooms.get(room_id).requestPlaceBet(actor_id, jsonObject);
    }

    public static void onAccResponse(long actor_id, OperationType type, AccOperationResult result,
                  ExchangeRatio ratio, double value, double balance, SimpleRoomInfo betInfo, String httpRes){

        if(!ActorManager.Contains(actor_id))
            return;

        switch (type){
            case Exchange:
                if(result == AccOperationResult.Success)
                    Entry.Instance().AddScore(actor_id, -1 * value);

                if(!_rooms.containsKey(betInfo.RoomID))
                    return;

                _rooms.get(betInfo.RoomID).onExchange(result, actor_id, (int)value, betInfo);
                break;
            case Recompensate:
                if(result != AccOperationResult.Success)
                    return;

                if(betInfo==null)
                    return;

                if(httpRes==null)
                    return;
                if(httpRes.equals(""))
                    return;
                if(httpRes.isEmpty())
                    return;

                JsonObject jsonObject = gson.fromJson(httpRes, JsonObject.class);
                if(!jsonObject.get("result").getAsString().equals("ok"))
                    return;

                jsonObject = jsonObject.get("ret").getAsJsonObject().get("cash_entry").getAsJsonObject();
                AuditNotify.send(jsonObject);
                break;
        }
    }

    public static void onChangeDealer(int camera_id){
        _rooms.get(camera_id).onChangeDealer();
    }

    public static void setPause(int camera_id, boolean value){
        _rooms.get(camera_id).setPause(value);

        boolean nextStatus = false;

        if(_rooms.get(camera_id).getStatus()==Status.RoundOver)
            nextStatus = true;

        if(!value) {
            if (nextStatus)
                ((BaccaratBase) _rooms.get(camera_id)).NextStatus();

            ScannerReceiver.pushRoundStatus(camera_id, _rooms.get(camera_id).getStatus());
        }
    }

    public static boolean checkPausing(int camera_id){
        return ((BaccaratBase)_rooms.get(camera_id)).getIsPausing();
    }

    public static void clearRoadMap(int camera_id){
        ((BaccaratBase)_rooms.get(camera_id)).clearRoadMap();
    }

    public static void cancelRound(int camera_id){
        ((BaccaratBase)_rooms.get(camera_id)).cancelRound();
    }
}

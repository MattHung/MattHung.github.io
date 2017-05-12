package com.games.baccarat;

import com.eject.interop.ActorBase;
import com.eject.interop.ProtocolData;
import com.eject.protocol.ProtocolBuilder;
import com.eject.widget.DebugMessage;
import com.eject.widget.Worker;
import com.games.baccarat.actor.ActorManager;
import com.games.baccarat.actor.CustomActor;
import com.games.baccarat.billboard.Billboard_GodGambler;
import com.games.baccarat.player.PlayerManager;
import com.games.baccarat.room.*;
import com.games.baccarat.seat.BaccaratSeat;
import com.games.baccarat.seat.BaccaratViewer;
import com.games.baccarat.types.*;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.stream.JsonToken;
import com.sun.xml.internal.ws.resources.SenderMessages;

import java.lang.reflect.Method;
import java.nio.ByteBuffer;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Created by matt1201 on 2016/5/26.
 */
public class ProtocolHandler {
    private static Gson _gson = new Gson();
    private static Map<String, Method> m_recv_methods = new LinkedHashMap<>();

    static {
        cacheMethod();
        init();
    }

    static void init(){

    }

    private static void cacheMethod(){
        Method[] arr_methods = ProtocolHandler.class.getDeclaredMethods();
        Map<String, Method> methodMap = new HashMap<>();

        for(int i=0; i<arr_methods.length; i++){
            String methodName = arr_methods[i].getName();

            if(methodName.contains("action_"))
                m_recv_methods.put(methodName.replace("action_", ""), arr_methods[i]);
        }
    }

    //傳送訊息給單一玩家
    public static void sendMessage(long actorID, ProtocolData protocol)
    {
        if (actorID == 0)
            return;

        Entry.Instance().sendMessage(actorID, protocol);
    }

    //傳送訊息給指定桌次內所有人
    public static void broadcastMessage(IBaccaratRoom room, ProtocolData protocol)
    {
        for(BaccaratViewer player : room.getPlayers())
        if(player!=null)
        if(player.getActorID()>0)
            sendMessage(player.getActorID(), protocol);
    }

    //傳送訊息給目前遊戲內所有人 會降低效能 勿頻繁呼叫
    public static void brocastToAllPlayer(ProtocolData protocol)
    {
        for (CustomActor Actor : ActorManager.Actors())
            sendMessage(Actor.ID(), protocol);
    }

    //傳送訊息給指定玩家 並一併傳送給屬於此玩家的連線
    public static void broadcastToPlayer(long actorID, ProtocolData protocol)
    {
        int userID = ActorBase.getUserID(actorID);
        broadcastToPlayer(userID, protocol);
    }

    public static void RecvMessage(long ActorID, ProtocolData protocol)
    {
       if(!m_recv_methods.containsKey(protocol.Action))
           return;

        try
        {
            if(ActorManager.getActor(ActorID)==null)
                return;

            JsonElement  jsonElement = _gson.fromJson(protocol.Data, JsonElement.class);
            m_recv_methods.get(protocol.Action).invoke(null, ActorID, protocol, jsonElement);
        }
        catch (Exception | Error e)
        {
//            DebugMessage.addException(e);
        }
    }

    public static final void action_RoomList(long actor_id, ProtocolData protocol, JsonObject jsonObject){
        JsonElement jsonElement = jsonObject.get("RoomType");
        if(jsonElement==null)
            return;

        byte type = jsonElement.getAsByte();

        sendRoomList(actor_id, type);
    }

    public static final void sendRoomList(long actor_id, byte room_type){
        ProtocolData protocol = new ProtocolData("RoomList");

        CustomActor actor = ActorManager.getActor(actor_id);

        List<RoomPreview> rooms_info = new LinkedList<>();
        for(IBaccaratRoom room : RoomManager.getRooms().values()) {
            if (room.getType().getValue() == room_type) {
                RoomPreview preview = room.getPreview();
                //賭神廳只可顯示自己廳的桌次
                if(!Entry.Instance().IsAdministrator(actor.UserID()))
                if(room_type == RoomTypes.GodOfGambler.getValue()) {
                    if (actor.getAccount().HallID != ((GodOfGambler) room).getSetting().HallID)
                        continue;
                }

                if(((GodOfGambler) room).enrolled(actor_id)) {
                    try {
                        preview = ((GodOfGambler.GamblerPreview) preview).clone();
                        ((GodOfGambler.GamblerPreview) preview).Quit = true;
                    } catch (CloneNotSupportedException e) {
                        e.printStackTrace();
                    }
                }

                rooms_info.add(preview);
            }
        }

        JsonObject jsonObject = new JsonObject();

        jsonObject.addProperty("RoomType", room_type);
        jsonObject.add("Rooms", _gson.toJsonTree(rooms_info));

        protocol.Data =jsonObject.toString();
        sendMessage(actor_id, protocol);
    }

    public static final void sendEnterResult(long actor_id, int room_id, int result){
        sendEnterResult(actor_id, room_id, 0, result, false, false);
    }

    public static final void sendEnterResult(long actor_id, int room_id, int table_id, int result, boolean restoreSession, boolean registered){
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("RoomID", room_id);
        jsonObject.addProperty("TableID", table_id);
        jsonObject.addProperty("Result", result);
        jsonObject.addProperty("RestoreSession", restoreSession?1:0);
        jsonObject.addProperty("Registered", registered?1:0);

        ProtocolData protocol = new ProtocolData();
        protocol.Action = "EnterRoom";
        protocol.Data =jsonObject.toString();
        sendMessage(actor_id, protocol);
    }

    public static final void sendUserName(IBaccaratRoom room, long actor_id, String userName, int user_id){
        JsonObject jsonObject = new JsonObject();
        userName = userName.substring(userName.length()- 3 , userName.length());
        jsonObject.addProperty("UserName", String.format("***%s", userName));
        jsonObject.addProperty("UserID", user_id);

        ProtocolData protocol = new ProtocolData();
        protocol.Action = "UserName";
        protocol.Data =jsonObject.toString();

        if(actor_id==0)
            broadcastMessage(room, protocol);
        else
            sendMessage(actor_id, protocol);
    }

    public static final void broadcastSessionStart(IBaccaratRoom room, int remainMinutes){
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("remainMinutes", remainMinutes);

        ProtocolData protocol = new ProtocolData();
        protocol.Action = "SessionNotification";
        protocol.Data =jsonObject.toString();
        broadcastMessage(room, protocol);
    }

    public static final void broadcastRevokeRound(IBaccaratRoom room){
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("RoomID", room.RoomID());

        ProtocolData protocol = new ProtocolData();
        protocol.Action = "RevokeRound";
        protocol.Data =jsonObject.toString();
        broadcastMessage(room, protocol);
    }

    public static final void broadcastClearRoadMap(IBaccaratRoom room){
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("RoomID", room.RoomID());

        ProtocolData protocol = new ProtocolData();
        protocol.Action = "ClearRoadMap";
        protocol.Data =jsonObject.toString();
        broadcastMessage(room, protocol);
    }

    public static final void sendRoundID(IBaccaratRoom room, long actor_id){
//        廣播局號: RoundID : {"RoomID":1001,"RoundID": 0}
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("RoomID", room.RoomID());
        jsonObject.addProperty("RoundID", room.getRoundID());
        jsonObject.addProperty("ShoeInfo", room.getShoeInfo().toString());

        ProtocolData protocol = new ProtocolData();
        protocol.Action = "RoundID";
        protocol.Data =jsonObject.toString();

        if(actor_id==0)
            broadcastMessage(room, protocol);
        else
            sendMessage(actor_id, protocol);
    }

    public static final void sendRankInfo(long actor_id, int round_id, int rank, int award, boolean quited){
//        傳送名次資訊: RankInfo : {"RoundID":1000,"Rank":1,"Award":333}
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("RoundID", round_id);
        jsonObject.addProperty("Rank", rank);
        jsonObject.addProperty("Award", award);
        jsonObject.addProperty("Quited", quited);

        ProtocolData protocol = new ProtocolData();
        protocol.Action = "RankInfo";
        protocol.Data =jsonObject.toString();
        sendMessage(actor_id, protocol);
    }

    public static final void sendTakeSeatResult(long actor_id, int seat_id, int result){
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("SeatID", seat_id);
        jsonObject.addProperty("Result", result);

//        請求入座結果 : TakeSeat: {SeatID:10001, Result:1}
//result:         0:無此房間
//                1:入座成功
//                2:座位已有玩家
        ProtocolData protocol = new ProtocolData();
        protocol.Action = "TakeSeat";
        protocol.Data =jsonObject.toString();
        sendMessage(actor_id, protocol);
    }

    public static final void sendPlaceBetResult(IBaccaratRoom room, long actor_id, int user_id, int seat_id, CardTypes betArea, int amount, int result) {
//        請求下注: PlaceBet: {"SeatID":1, "UserID":001, "BetArea": 1, "Amount":10, "Result":1}
//        Result: 1:成功
//                2:餘額不足
//                3:非可下注時間
//                4:無效下注區
//                5:下注失敗(API Error)
//                6:無效下注額

        ProtocolData protocol = new ProtocolData("PlaceBet");
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("UserID", user_id);
        jsonObject.addProperty("SeatID", seat_id);
        jsonObject.addProperty("BetArea", betArea.getValue());
        jsonObject.addProperty("Amount", amount);
        jsonObject.addProperty("Result", result);

        protocol.Data = jsonObject.toString();

        if(actor_id != 0)
            sendMessage(actor_id, protocol);
        else
            broadcastMessage(room, protocol);
    }

    public static void sendLeaveRoom(long actor_id, int user_id, int seat_id, LeaveCause cause){
        //        離開房間結果 : LeaveRoom: { Result: 1, UserID:1000, SeatID:1}
        ProtocolData protocolData = new ProtocolData("LeaveRoom");
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("UserID", user_id);
        jsonObject.addProperty("SeatID", seat_id);
        jsonObject.addProperty("Cause", cause.getValue());

        jsonObject.addProperty("Result", 1);
        protocolData.Data = jsonObject.toString();
        sendMessage(actor_id, protocolData);
    }

    public static final void sendChipSetting(long actor_id, String setting) {
        JsonObject roadMapInfo = new JsonObject();
        roadMapInfo.addProperty("Setting", setting);
        ProtocolData protocol = new ProtocolData("ChipSetting");
        protocol.Data = roadMapInfo.toString();

        sendMessage(actor_id, protocol);
    }

    public static final void sendRoadMap(Baccarat room, long actor_id, String roadMapStr) {
//        廣播路紙: RoadMap: {MapStr:"33-5, 22-5"}
        JsonObject roadMapInfo = new JsonObject();
        roadMapInfo.addProperty("MapStr", roadMapStr);
        ProtocolData protocol = new ProtocolData("RoadMap");
        protocol.Data = roadMapInfo.toString();

        if(actor_id != 0)
            sendMessage(actor_id, protocol);
        else
            broadcastMessage(room, protocol);
    }

    public static final void action_EnterRoom(long actor_id, ProtocolData protocol, JsonObject jsonObject){
        try {
            CustomActor actor = ActorManager.getActor(actor_id);

            if(actor==null)
                return;

            int room_id = jsonObject.get("RoomID").getAsInt();

            RoomManager.enterRoom(actor.ID(), room_id);
        }catch (Exception e){
            DebugMessage.addException(e);
        }
    }

    public static final void action_LeaveRoom(long actor_id, ProtocolData protocol, JsonObject jsonObject){
        try {
            CustomActor actor = ActorManager.getActor(actor_id);

            if(actor==null)
                return;

            boolean found = false;

            int room_id = jsonObject.get("RoomID").getAsInt();
            if(RoomManager.getRooms().containsKey(room_id))
            if(RoomManager.leaveRoom(actor_id, LeaveCause.Active))
                found = true;

            if(!found)
                ProtocolHandler.sendLeaveRoom(actor_id, ActorBase.getUserID(actor_id), 0, LeaveCause.Active);
        }catch (Exception e){
            DebugMessage.addException(e);
        }
    }

    public static final void action_ChipSetting(long actor_id, ProtocolData protocol, JsonObject jsonObject){
        String setting = jsonObject.get("Setting").getAsString();
        BaccaratSave.onUpdateChipSetting(actor_id,setting);
    }

    public static final void action_TakeSeat(long actor_id, ProtocolData protocol, JsonObject jsonObject){
        int room_id = jsonObject.get("RoomID").getAsInt();
        byte seat_id = jsonObject.get("SeatID").getAsByte();

        int result =0;

        if(RoomManager.getRooms().containsKey(room_id))
            RoomManager.getRooms().get(room_id).takeSeat(actor_id, seat_id);
    }

    public static final void action_PlaceBet(long actor_id, ProtocolData protocol, JsonObject jsonObject){
        RoomManager.placeBet(actor_id, jsonObject);
    }

    public static final void action_Billboard(long actor_id, ProtocolData protocol, JsonObject jsonObject){
        Billboard_GodGambler.onBillboardRequest(actor_id);
    }

    public static final void action_EnrollHistory(long actor_id, ProtocolData protocol, JsonObject jsonObject){
        Billboard_GodGambler.onEnrollHistory(actor_id);
    }
}

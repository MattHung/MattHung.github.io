package com.games.baccarat.types;

/**
 * Created by matt1201 on 2016/12/7.
 */
public class SimpleRoomInfo {
    public RoomTypes Type;
    public int RoomID;
    public int TableID;

    public SimpleRoomInfo(RoomTypes type, int room_id){
        Type = type;
        RoomID = room_id;
    }
}

package com.games.baccarat.types;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by matt1201 on 2016/12/8.
 */
public class SimpleBetInfo extends SimpleRoomInfo {
    public long ActorID;
    public int SeatID;
    public int Hide;

    public List<BetInfo> Bets = new LinkedList<>();

    public SimpleBetInfo(RoomTypes type, int room_id, long actorID, int seatId, int hide) {
        super(type, room_id);

        ActorID = actorID;
        SeatID = seatId;
        Hide = hide;
    }
}

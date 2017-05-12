package com.games.baccarat.room;

import com.eject.custom.types.AccOperationResult;
import com.games.baccarat.seat.BaccaratViewer;
import com.games.baccarat.types.*;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import java.util.List;

/**
 * Created by matt1201 on 2016/12/1.
 */
public interface IBaccaratRoom {
    int RoomID();

    RoomTypes getType();

    Status getStatus();

    CardInfo getCards();

    List<BaccaratViewer> getPlayers();

    RoomPreview getPreview();

    boolean contains(long actor_id);

    int getRoundID();

    ShoeInfo getShoeInfo();

    void enterRoom(long actor_id);

    boolean leaveRoom(long actor_id, LeaveCause cause);

    boolean silentLeaveRoom(long actor_id, LeaveCause cause);

    void sendRoomInfo(long actor_id);

    void sendCountDown(long actor_id);

    void takeSeat(long actor_id, int seat_id);

    void requestPlaceBet(long actor_id, JsonObject jsonObject);

    void onExchange(AccOperationResult operationResult, long actor_id, int amount, SimpleRoomInfo info);

    void onChangeDealer();

    void updateRoom();

    void scanner_input(int device_id, PokerCard.Card card);

    void setPause(boolean value);
}

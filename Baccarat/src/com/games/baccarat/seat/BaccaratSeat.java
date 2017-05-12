package com.games.baccarat.seat;

import com.games.baccarat.room.IBaccaratRoom;

/**
 * Created by matt1201 on 2016/12/1.
 */
public class BaccaratSeat extends BaccaratViewer{
    private boolean _is_online = true;
    protected int _seat_id = 0;

    public boolean getIsOnline(){return _is_online;}

    public BaccaratSeat(IBaccaratRoom room, int seat_id) {
        super(room, 0);

        _seat_id = seat_id;
    }

    public int getSeatID(){return _seat_id;}

    public void takeSeat(long actor_id){
        set(actor_id);
    }

    public void leaveSeat(){
        clear();
    }

    public void setOnline(boolean val){
        _is_online= val;
    }
}

package com.games.baccarat.types;

import com.games.baccarat.room.GodOfGambler;

/**
 * Created by matt1201 on 2016/12/1.
 */
public enum  RoomTypes {
    Baccarat(1),
    GodOfGambler(2);

    private int _value;
    public int getValue(){return _value;}

    RoomTypes(int value){
        _value = value;
    }
}

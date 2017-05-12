package com.games.baccarat.types;

/**
 * Created by matt1201 on 2017/2/7.
 */
public enum WagersType {
    SessionBet(1),
    ViewerBet(2),
    ServiceFee(3);

    private int _value;

    public int getValue(){return _value;}

    WagersType(int value){
        _value = value;
    }
}

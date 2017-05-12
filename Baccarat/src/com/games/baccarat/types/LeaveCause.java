package com.games.baccarat.types;

/**
 * Created by matt1201 on 2017/2/6.
 */
public enum LeaveCause {
    KickLoser("KickLoser"),
    kickAll("kickAll"),
    SessionOver("SessionOver"),
    SessionAbort("SessionAbort"),
    SystemShutDown("SystemShutDown"),
    Active("Active"),
    KickSeat("KickSeat"),
    Disconnect("Disconnect"),
    KickIdle("KickIdle"),
    SessionConflict("SessionConflict"),
    MergeTable("MergeTable");

    private String _value;

    public String getValue(){return _value;}

    LeaveCause(String value){
        _value = value;
    }
}

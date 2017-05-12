package com.games.baccarat.types;

import java.util.Enumeration;

/**
 * Created by matt1201 on 2017/3/13.
 */
public enum SessionSettingType {
    None(0),
    SitAndGo(1),
    TimeSet(2);

    int _value = 0;
    SessionSettingType(int value){
        _value = value;
    }

    public int getValue(){return _value;}

    public static SessionSettingType getValue(int value){

        SessionSettingType[] values = SessionSettingType.values();

        for(SessionSettingType sessionSettingType : values)
        if(sessionSettingType.getValue() == value)
            return sessionSettingType;

        return None;
    }
}

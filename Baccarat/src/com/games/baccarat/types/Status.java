package com.games.baccarat.types;

/**
 * Created by matt1201 on 2016/11/28.
 */
public enum Status {
    DrawGame(-2, -1),
    None(-1, -1),
    Reset(0, 1000),
    RoundStart(1, 1000),
    DealCard(2, 10 * 1000),
    CheckResult(3, -1),
    RoundOver(4, 3 * 1000);

    private int _value = 0;
    private int _duration = 0;
    public int getValue(){return _value;}
    public int getDuration(){return _duration;}

    Status(int value, int duration){
        _value = value;
        _duration = duration;
    }

    public static Status get(int value){
        Status[] status = Status.values();
        for(int i=0; i < status.length; i++)
        if(status[i].getValue() == value)
            return status[i];

        return Reset;
    }

    public Status Next(){
        int next_value = _value +1 ;

        if(next_value > RoundOver.getValue())
            next_value = 1;

        return get(next_value);
    }
}

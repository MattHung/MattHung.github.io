package com.games.baccarat.types;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * Created by matt1201 on 2016/12/29.
 */
public class BetRecord {
    public long ActorID;    //連線ID
    public int SeatID;      //座位ID
    public int UserID;
    public int WinMoney;    //贏錢金額
    public String Note;     //備註

    public Map<CardTypes, BetInfo> BetArea = new HashMap<>();   //下注區域
    public Map<CardTypes, BetInfo> HitArea = new HashMap<>();   //贏得區域
}

package com.games.baccarat.record;

import com.games.baccarat.types.BetRecord;
import com.games.baccarat.types.CardTypes;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by matt1201 on 2016/12/29.
 */
public class TableRecord_Player{
    public int Chips;           //籌碼
    public int SeatID;          //座位編號
    public int UserID;          //使用者ID

    public BetRecord Record;    //下注紀錄
}

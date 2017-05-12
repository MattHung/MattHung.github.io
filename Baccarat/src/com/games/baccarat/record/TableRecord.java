package com.games.baccarat.record;

import com.games.baccarat.types.CardTypes;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by matt1201 on 2016/12/29.
 */
public class TableRecord {
    public int TableID;   //虛擬桌桌次編號

    public List<TableRecord_Player> Players = new LinkedList<>(); // 玩家紀錄

    public List<Integer> Cards = new LinkedList<>();              //公牌紀錄 (牌ID 1~52)

    public List<CardTypes> HitAreas = new LinkedList<>();         //中獎區域

    public int player_point;
    public int banker_point;
}

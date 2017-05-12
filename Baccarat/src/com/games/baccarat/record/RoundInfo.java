package com.games.baccarat.record;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by matt1201 on 2016/12/29.
 */
public class RoundInfo{
    public int RoundCount;  //回合數
    public List<TableRecord> Tables = new LinkedList<>();
}

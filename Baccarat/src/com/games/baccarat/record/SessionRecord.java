package com.games.baccarat.record;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by matt1201 on 2016/12/29.
 */
public class SessionRecord {
    public List<RoundInfo> RoundInfo = new LinkedList<>(); // 回合資訊

    public void clear(){
        RoundInfo.clear();
    }
}

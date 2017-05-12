package com.games.baccarat.types;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * Created by matt1201 on 2016/12/29.
 */

public class RoundRecord {
    public Map<Integer, BetRecord> PlayerBet = new HashMap<>();
    public List<PokerCard.Card> Cards = new LinkedList<>();
    public List<CardTypes> HitArea = new LinkedList<>();

    public int player_point;
    public int banker_point;

    public void clear(){
        PlayerBet = new HashMap<>();
        Cards = new LinkedList<>();
        HitArea = new LinkedList<>();
    }
}

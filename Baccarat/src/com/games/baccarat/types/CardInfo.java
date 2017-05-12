package com.games.baccarat.types;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by matt1201 on 2016/12/1.
 */
public class CardInfo{
    final int TotalCard = 6;
    public List<PokerCard.Card> TableCards = new LinkedList<>();

    public CardInfo(){
        for(int i=0; i<=TotalCard; i++)
            TableCards.add(null);
    }

    public int getPlayerPoint(){
        List<PokerCard.Card> cards = TableCards;

        int player_point = cards.get(1).Point + cards.get(2).Point + cards.get(5).Point;
        return player_point % 10;
    }

    public int getBankerPoint(){
        List<PokerCard.Card> cards = TableCards;

        int banker_point = cards.get(3).Point + cards.get(4).Point + cards.get(6).Point;
        return  banker_point % 10;
    }

    public void set(int device_id, PokerCard.Card card){
        TableCards.set(device_id, card);
    }

    public void clear(){
        for(int i=0; i<TableCards.size(); i++)
            TableCards.set(i, null);
    }

    public int getCount(){
        int result = 0;
        for(int i=0; i<TableCards.size(); i++)
        if(TableCards.get(i)!=null)
            result++;

        return result;
    }
}

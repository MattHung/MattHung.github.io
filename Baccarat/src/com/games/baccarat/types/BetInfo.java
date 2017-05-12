package com.games.baccarat.types;

/**
 * Created by matt1201 on 2016/12/7.
 */
public class BetInfo {
    public CardTypes Area;
    private int Amount;

    public int getAmount(){return Amount;}
    public void addAmount(int value){
        Amount +=value;
    }

    public BetInfo(CardTypes area, int amount){
        Area = area;
        Amount = amount;
    }
}

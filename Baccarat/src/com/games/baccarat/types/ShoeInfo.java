package com.games.baccarat.types;

/**
 * Created by matt1201 on 2017/1/10.
 */
public class ShoeInfo {

    private int _shoeNum;
    private int _roundNum;

    public int getShoeNum(){return _shoeNum;}
    public int getRoundNum(){return _roundNum;}

    public ShoeInfo(int shoe_num, int round_num){
        _shoeNum = shoe_num;
        _roundNum = round_num;
    }

    public void nextShoe(){
        _shoeNum++;
        _roundNum = 0;
    }

    public void nextRound(){
        _roundNum++;
    }

    @Override
    public String toString() {
//        return super.toString();
        return String.format("%d-%d", getShoeNum(), getRoundNum());
    }
}

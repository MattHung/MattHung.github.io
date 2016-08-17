package com.exericse.game;

/**
 * Created by matt1201 on 2016/8/11.
 */
public class BetButtonInfo extends FruitPattern{
    public int ID;
    public String ImgSerialName;
    public int BetRatio;


    public BetButtonInfo(int id, String name, int betRatio){
        super(id, betRatio);

        ID= id;
        ImgSerialName = name;
        BetRatio = betRatio;
    }
}

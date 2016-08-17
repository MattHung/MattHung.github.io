package com.exericse.game;

/**
 * Created by matt1201 on 2016/8/14.
 */
public class FruitPattern {
    private int _id;
    private int _ratio;

    public int get_id(){return _id;}
    public int get_ratio(){return _ratio;}

    public FruitPattern(int id, int ratio){
        _id = id;
        _ratio = ratio;
    }
}

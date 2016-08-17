package com.exericse.game;

import com.badlogic.gdx.utils.Timer;

/**
 * Created by Matt on 2016/8/14.
 */
public class StepController {
    private int _current_light_index = 3;
    private int _second_light_index = -1;
    private int _third_light_index =  -1;

    private int _light_steps = 0;
    private int _light_remain_steps = 0;
    private int _light_slow_down_index = 0;

    private int _total_steps = 0;

    public int get_current_light_index(){return _current_light_index;}
    public int get_second_light_index(){return _second_light_index;}
    public int get_third_light_index(){return _third_light_index;}

    public int get_light_steps(){return _light_steps;}
    public int get_light_remain_steps(){return _light_remain_steps;}
    public int get_light_slow_down_index(){return _light_slow_down_index;}

    public StepController(int total_step){
        _total_steps =total_step;

    }

    public void startBet(){
        _light_steps = 0;
        _light_remain_steps = (int)(Math.random() * 50) + 5;
        _light_slow_down_index = (int)(Math.random() * 5) +1;
        _light_slow_down_index = Math.min(_light_slow_down_index, _light_remain_steps);
    }

    public void update(){
        _second_light_index = -1;
        _third_light_index =  -1;

        _current_light_index++;
        _light_remain_steps--;
        _light_steps++;

        if(_light_steps>0) {
            _second_light_index = _current_light_index - 1;
            if(_second_light_index<0)
                _second_light_index = _total_steps + _second_light_index;
        }
        if(_light_steps>1) {
            _third_light_index = _current_light_index - 2;

            if(_third_light_index<0)
                _third_light_index = _total_steps + _third_light_index;
        }

        if(_current_light_index>=_total_steps-1)
            _current_light_index = 0;
    }
}

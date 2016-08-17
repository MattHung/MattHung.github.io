package com.exericse.game;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.Animation;
import com.badlogic.gdx.graphics.g2d.Batch;
import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.badlogic.gdx.scenes.scene2d.Stage;
import com.libgdx.html5.gameframework.DebugMessage;

import java.awt.geom.Point2D;
import java.util.LinkedList;
import java.util.List;

/**
 * Created by Matt on 2016/8/14.
 */
public class MoneyGroup {
    class NumberField{
        private Texture _src_texture = null;
        private Point _position =null;
        private Animation _anim_num = null;

        private int _num = 0;
        public int get_num(){return _num;}

        public NumberField(String image_path, int digit_count, Point position){
            _src_texture = new Texture(Gdx.files.internal(image_path));
            _position = position;

            TextureRegion[][] src_texture_regions = TextureRegion.split(_src_texture, 8, 13);
            TextureRegion[] frames = new TextureRegion[src_texture_regions[0].length];
            for (int i = 0; i < frames.length; i++)
                frames[i] = src_texture_regions[0][i];

            _anim_num = new Animation(1, frames);
        }

        public void setNum(int num){
            _num = num;
        }

        public void draw(Batch batch){
            String num_text = String.valueOf(_num);

            if(num_text.equals(""))
                return;

            String[] digit_text = num_text.split("");

            Point position = _position;

            int count = 0;

            try {
                for (int i = digit_text.length - 1; i >=0; i--) {
                    if (!digit_text[i].equals("")) {
                        int digit = Integer.parseInt(digit_text[i]);
                        batch.draw(_anim_num.getKeyFrame(digit), position.x - (count * 10), position.y);
                    }
                    count++;
                }
            }catch (Exception e){
                Gdx.app.log("eee", DebugMessage.getStackTrace(e));
            }
        }
    }

    private NumberField _field_score;
    private NumberField _field_money;
    private NumberField _field_bonus;

    public int get_score(){return _field_score.get_num();}
    public int get_money(){return _field_money.get_num();}
    public int get_bonus(){return _field_bonus.get_num();}

    public void set_score(int value){_field_score.setNum(value);}
    public void set_money(int value){_field_money.setNum(value);}
    public void set_bonus(int value){_field_bonus.setNum(value);}


    public MoneyGroup(Stage stage, Point score_position, Point money_potion, Point bonus_potion){
        score_position.x+=90;
        score_position.y+=5;
        _field_score = new NumberField("anims\\Number_money.png", 6, score_position);

        money_potion.x+=90;
        money_potion.y+=5;
        _field_money = new NumberField("anims\\Number_money.png", 6, money_potion);

        bonus_potion.x+=120;
        bonus_potion.y+=5;
        _field_bonus = new NumberField("anims\\Number_money.png", 6, bonus_potion);
    }

    public void draw(Batch batch){
        _field_score.draw(batch);
        _field_money.draw(batch);
        _field_bonus.draw(batch);
    }
}

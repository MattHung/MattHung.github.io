package com.exericse.game;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.Animation;
import com.badlogic.gdx.graphics.g2d.Batch;
import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.badlogic.gdx.scenes.scene2d.InputEvent;
import com.badlogic.gdx.scenes.scene2d.InputListener;
import com.badlogic.gdx.scenes.scene2d.Stage;
import com.badlogic.gdx.scenes.scene2d.ui.ImageButton;
import com.badlogic.gdx.scenes.scene2d.utils.TextureRegionDrawable;
import com.libgdx.html5.gameframework.Utility;

/**
 * Created by matt1201 on 2016/8/11.
 */
public class BetCell {
    private int _ratio;
    private int _pattern_id;

    private  ImageButton _btn_bet;

    private Point _img_bet_num;
    private Animation _anim_bet_count;
    private int _bet_count = 0;

    public int get_ratio(){return _ratio;}
    public int get_pattern_id(){return _pattern_id;}
    public int get_bet_count(){return _bet_count;};

    public BetCell(Stage stage, FruitPattern pattern, String imgName, Point p_btn_bet, Point p_img_bet_num){
        _ratio = pattern.get_ratio();
        _pattern_id = pattern.get_id();

        _img_bet_num = p_img_bet_num;

        TextureRegion[][] src_texture_regions = null;
        Texture src_texture = null;

        src_texture = new Texture(Gdx.files.internal(Utility.formatString("buttons\\%s.png", imgName)));
        src_texture_regions= TextureRegion.split(src_texture, 36, 36);
        ImageButton.ImageButtonStyle style = new ImageButton.ImageButtonStyle();
        style.imageUp = new TextureRegionDrawable(src_texture_regions[0][0]);
        style.imageDown = new TextureRegionDrawable(src_texture_regions[2][0]);
        style.imageOver = new TextureRegionDrawable(src_texture_regions[1][0]);

        _btn_bet = new ImageButton(style);
        _btn_bet.setHeight(50);
        _btn_bet.setWidth(50);
        _btn_bet.setPosition(p_btn_bet.x, p_btn_bet.y);
        _btn_bet.setVisible(true);

        _btn_bet.addListener(new InputListener() {
            public boolean touchDown (InputEvent event, float x, float y, int pointer, int button) {
                if((_bet_count)>_anim_bet_count.getKeyFrames().length-1)
                    return true;

                if(Mario.getInstance().Is_RunningMarquee())
                    return true;

                _bet_count++;

                return true;
            }

            @Override
            public boolean mouseMoved(InputEvent event, float x, float y) {

                return true;
            }

            public void touchUp (InputEvent event, float x, float y, int pointer, int button) {

            }
        });


        src_texture = new Texture(Gdx.files.internal(Utility.formatString("anims\\%s.png", "Number_ELE")));
        src_texture_regions= TextureRegion.split(src_texture, 15, 17);
        TextureRegion[] frames = new TextureRegion[src_texture_regions[0].length];
        for(int i=0; i<frames.length; i++)
            frames[i] = src_texture_regions[0][i];
        _anim_bet_count = new Animation(1, frames);
        stage.addActor(_btn_bet);
    }

    public void draw(Batch batch){
        batch.draw(_anim_bet_count.getKeyFrame(_bet_count), _img_bet_num.x, _img_bet_num.y);
    }

    public void clearBet(){
        _bet_count = 0;
    }
}

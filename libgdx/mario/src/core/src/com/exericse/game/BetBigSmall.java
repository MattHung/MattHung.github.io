package com.exericse.game;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.files.FileHandle;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.*;
import com.badlogic.gdx.scenes.scene2d.InputEvent;
import com.badlogic.gdx.scenes.scene2d.InputListener;
import com.badlogic.gdx.scenes.scene2d.Stage;
import com.badlogic.gdx.scenes.scene2d.ui.ImageButton;
import com.badlogic.gdx.scenes.scene2d.utils.TextureRegionDrawable;
import com.badlogic.gdx.utils.Timer;

import java.awt.geom.Point2D;

/**
 * Created by matt1201 on 2016/8/14.
 */
public class BetBigSmall {
    private ImageButton _btn_bet_big;
    private ImageButton _btn_bet_small;

    private Animation _anim_light_big;
    private Animation _anim_light_small;

    private Point _p_light_big;
    private Point _p_light_small;

    private int _bet_light_id = -1;
    private int _hit_light_id = -1;
    private int _remain_steps = 0;

    private Runnable _event_on_hit_light = null;

    private Timer _timer_update_marquee = new Timer();

    public int get_bet_light_id(){return _bet_light_id;}
    public int get_hit_light_id(){return _hit_light_id;}

    public int get_remain_steps(){return _remain_steps;}

    public BetBigSmall(Stage stage, Point p_btn_big, Point p_btn_small,
                       Point p_light_big, Point p_light_small,
                       Runnable onBetBig, Runnable onBetSmall, Runnable event_on_hit_light){

        _p_light_big = p_light_big;
        _p_light_small = p_light_small;

        _btn_bet_big = get_button("buttons\\sprite_big.txt", new Point(p_btn_big.x, p_btn_big.y), onBetBig);
        _btn_bet_small = get_button("buttons\\sprite_small.txt", new Point(p_btn_small.x, p_btn_small.y), onBetSmall);

        TextureAtlas atlas = null;
        atlas = new TextureAtlas(Gdx.files.internal("anims\\sprite_light.txt"));
        _anim_light_big = new Animation(1, atlas.getRegions());
        _anim_light_small = new Animation(1, atlas.getRegions());

        stage.addActor(_btn_bet_big);
        stage.addActor(_btn_bet_small);

        _event_on_hit_light = event_on_hit_light;
    }

    private ImageButton get_button(String sheet_path, Point position, final Runnable onClick){
        TextureRegion[] src_texture_regions = null;
        TextureAtlas atlas = null;

        FileHandle fileHandle = Gdx.files.internal(sheet_path);

//        TextureAtlas.TextureAtlasData textureAtlasData = new TextureAtlas.TextureAtlasData(fileHandle, fileHandle.parent(), false);
//        Sprite sprite = atlas.createSprite("Ico_Light [www.imagesplitter.net]-1-0");
//        sprite = atlas.createSprite("Btn_Big [www.imagesplitter.net]-2-0");


        atlas = new TextureAtlas(fileHandle);
        src_texture_regions= atlas.getRegions().toArray(TextureRegion.class);

        ImageButton.ImageButtonStyle style = new ImageButton.ImageButtonStyle();
        style.imageUp = new TextureRegionDrawable(src_texture_regions[0]);
        style.imageDown = new TextureRegionDrawable(src_texture_regions[2]);
        style.imageOver = new TextureRegionDrawable(src_texture_regions[1]);

        ImageButton result = null;
        result = new ImageButton(style);
        result.setHeight(36);
        result.setWidth(36);
        result.setPosition(position.x, position.y);
        result.setVisible(true);

        result.addListener(new InputListener(){
            @Override
            public boolean touchDown(InputEvent event, float x, float y, int pointer, int button) {
                onClick.run();
                return true;
            }
        });

        return result;
    }

    public void draw(Batch batch){
        batch.draw(_anim_light_big.getKeyFrame(_hit_light_id==1?1:0), _p_light_big.x, _p_light_big.y);
        batch.draw(_anim_light_small.getKeyFrame(_hit_light_id==0?1:0), _p_light_small.x, _p_light_small.y);
    }

    public void startBet(int bet_light_id){
        _remain_steps= (int)((Math.random() * 10) + 2);

        _bet_light_id = bet_light_id;

        if(_hit_light_id<0)
            _hit_light_id=0;

        resetSchedule(0.1f);
    }

    private void resetSchedule(float interval){
        _timer_update_marquee.clear();
        _timer_update_marquee.scheduleTask(
                new Timer.Task(){
                    @Override
                    public void run() {
                        onUpdateRunMarquee();
                    }
                },
                0, interval);
    }

    private void onUpdateRunMarquee(){
        if(_remain_steps<=0) {
            _timer_update_marquee.clear();
            _event_on_hit_light.run();
            return;
        }

        _remain_steps--;

        _hit_light_id = _hit_light_id==1?0:1;
    }
}

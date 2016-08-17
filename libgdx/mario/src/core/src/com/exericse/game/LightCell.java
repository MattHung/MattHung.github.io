package com.exericse.game;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.Animation;
import com.badlogic.gdx.graphics.g2d.Batch;
import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.badlogic.gdx.scenes.scene2d.Stage;
import com.libgdx.html5.gameframework.Utility;

/**
 * Created by matt1201 on 2016/8/11.
 */
public class LightCell {
    private Point _position;
    private int _ratio =0;
    private int _pattern_id;

    private Animation _anim_light;
    private boolean _is_hit = false;
    public boolean get_is_hit(){return _is_hit;}
    public int get_pattern_id(){return _pattern_id;}

    public LightCell(Stage stage, Point position, FruitPattern fruitPattern){
        _position = position;
        _ratio = fruitPattern.get_ratio();

        Texture src_texture = new Texture(Gdx.files.internal(Utility.formatString("anims\\%s.png", "Ico_Light")));
        TextureRegion[][] src_texture_regions= TextureRegion.split(src_texture, 12, 12);
        TextureRegion[] frames = new TextureRegion[src_texture_regions.length];
        for(int i=0; i<frames.length; i++)
            frames[i] = src_texture_regions[i][0];
        _anim_light = new Animation(1, frames);
    }

    public void hit(){
        _is_hit = true;
    }

    public void reset(){
        _is_hit = false;
    }

    public void draw(Batch batch){
        batch.draw(_anim_light.getKeyFrame(_is_hit?1:0), _position.x, _position.y);
    }
}

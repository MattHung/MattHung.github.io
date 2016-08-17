package com.exericse.game;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.badlogic.gdx.scenes.scene2d.InputEvent;
import com.badlogic.gdx.scenes.scene2d.InputListener;
import com.badlogic.gdx.scenes.scene2d.Stage;
import com.badlogic.gdx.scenes.scene2d.ui.ImageButton;
import com.badlogic.gdx.scenes.scene2d.utils.TextureRegionDrawable;

import java.awt.geom.Point2D;

/**
 * Created by matt1201 on 2016/8/13.
 */
public class BtnGroup {
    private ImageButton _btn_start;
    private ImageButton _btn_get_score;
    private ImageButton _btn_get_clear;
    private ImageButton _btn_get_quit;

    public BtnGroup(Stage stage, Point bet_group_position, Point btn_quit_potion,
                    Runnable onStart, Runnable onCollectScore, Runnable onClearBet, Runnable onQuit){
        _btn_start = get_button("buttons\\btnStart.png", new Point(bet_group_position.x, bet_group_position.y+42), onStart);
        _btn_get_score = get_button("buttons\\btn_GetGrade.png", new Point(bet_group_position.x, bet_group_position.y+21), onCollectScore);
        _btn_get_clear = get_button("buttons\\btnClear.png", new Point(bet_group_position.x, bet_group_position.y), onClearBet);

        _btn_get_quit = get_button("buttons\\btn_Leave.png", btn_quit_potion, onQuit);

        stage.addActor(_btn_start);
        stage.addActor(_btn_get_score);
        stage.addActor(_btn_get_clear);
        stage.addActor(_btn_get_quit);
    }

    private ImageButton get_button(String image_path, Point position, final Runnable onClick){
        TextureRegion[][] src_texture_regions = null;
        Texture src_texture = null;

        src_texture = new Texture(Gdx.files.internal(image_path));
        src_texture_regions= TextureRegion.split(src_texture, 39, 21);

        ImageButton.ImageButtonStyle style = new ImageButton.ImageButtonStyle();
        style.imageUp = new TextureRegionDrawable(src_texture_regions[0][0]);
        style.imageDown = new TextureRegionDrawable(src_texture_regions[2][0]);

        ImageButton result = null;
        result = new ImageButton(style);
        result.setHeight(21);
        result.setWidth(39);
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
}

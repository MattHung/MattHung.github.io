package com.exericse.game;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.scenes.scene2d.Stage;
import com.badlogic.gdx.scenes.scene2d.ui.ScrollPane;
import com.badlogic.gdx.scenes.scene2d.ui.Skin;
import com.badlogic.gdx.scenes.scene2d.ui.List;

import java.awt.geom.Point2D;
import java.util.ArrayList;

/**
 * Created by matt1201 on 2016/8/14.
 */
public class ListView {
    private ArrayList<String> _content = new ArrayList<String>();
    private List _ui_list = null;
    private ScrollPane _scrollPane = null;

    public ListView(Stage stage, float width, float height){
        Skin skin = new Skin(Gdx.files.internal("data/uiskin.json"));

        _ui_list = new  com.badlogic.gdx.scenes.scene2d.ui.List(skin);

        _ui_list.getSelection().setMultiple(true);
        _ui_list.getSelection().setRequired(false);
        _ui_list.getSelection().setToggle(true);
        _ui_list.clearItems();

        _scrollPane = new ScrollPane(_ui_list, skin);
        _scrollPane.setFlickScroll(false);
        _scrollPane.setWidth(width);
        _scrollPane.setHeight(height);
        stage.addActor(_scrollPane);
    }

    public void setPosition(float x, float y){
        _scrollPane.setPosition(x, y);
    }

    public void add(String text)
    {
        _content.add(text);
        _ui_list.setItems(_content.toArray());
        _scrollPane.setScrollPercentY(100);
    }
}

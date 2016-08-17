package com.exericse.game;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.files.FileHandle;
import com.badlogic.gdx.graphics.g2d.Sprite;
import com.badlogic.gdx.graphics.g2d.TextureAtlas;
import com.badlogic.gdx.scenes.scene2d.Stage;
import com.badlogic.gdx.scenes.scene2d.ui.Image;
import com.badlogic.gdx.utils.Array;
import com.badlogic.gdx.utils.JsonReader;
import com.badlogic.gdx.utils.JsonValue;
import com.badlogic.gdx.utils.viewport.Viewport;
import com.exericse.game.Point;
import com.libgdx.html5.gameframework.Utility;

import java.util.ArrayList;
import java.util.HashMap;

/**
 * Created by matt1201 on 2016/8/15.
 */
public class GameStage extends Stage{
    public class CompositeImage{
        class Picture{
            public Sprite Sprite;
            public Image Image;
            public Point Position;
            Picture(Sprite sprite, Image image, Point position){
                Sprite = sprite;
                Image = image;
                Position = position;
            }
        }

        private HashMap<Integer, Picture> images = new HashMap<Integer, Picture>();

        private Point _position = new Point(0, 0);

        public float get_x(){return _position.x;}
        public float get_y(){return _position.y;}

        public Point get_position(){return _position;}

        public Image add(int uniqueId, Sprite sprite, Point point){

            sprite = new Sprite(sprite);

            Image image = new Image(sprite);
            images.put(uniqueId, new Picture(sprite, image, point));
            return image;
        }

        public void setPosition(float x, float y){
            _position.x =x;
            _position.y =y;

            for(Picture picture: images.values())
                picture.Image.setPosition(picture.Position.x + x, picture.Position.y + y);
        }
    }

    private TextureAtlas.TextureAtlasData _textureAtlasData = null;
    private HashMap<String, Sprite> _sprite_samples = new HashMap<String, Sprite>();
    private HashMap<String, CompositeImage> _images = new HashMap<String, CompositeImage>();

    public CompositeImage getItem(String itemIdentifier){
        return _images.get(itemIdentifier);
    }

    public GameStage(String sceneName, Viewport viewport){
        super(viewport);

        loadAtlasData("pack");
        loadScene(sceneName);
    }

    private void loadAtlasData(String pack_name){
        FileHandle fileHandle =Gdx.files.internal(Utility.formatString("orig\\%s.atlas", pack_name));
        _textureAtlasData = new TextureAtlas.TextureAtlasData(fileHandle, fileHandle.parent(), false);
        Array<TextureAtlas.TextureAtlasData.Region> regions = _textureAtlasData.getRegions();
        TextureAtlas textureAtlas = new TextureAtlas(_textureAtlasData);

        for(int i=0; i<regions.size; i++) {
            TextureAtlas.TextureAtlasData.Region region = regions.get(i);
            Sprite sprite = textureAtlas.createSprite(region.name);
            _sprite_samples.put(region.name, sprite);
        }
    }

    private ArrayList<JsonValue> getSprites(JsonValue element){

        ArrayList<JsonValue> result = new ArrayList<JsonValue>();

        if(element.get("ImageName")!=null)
            result.add(element);
        else{
            JsonValue elements = element.get("composite").get("sImages");

            for(JsonValue composite_element : elements.iterator())
                result.add(composite_element);
        }

        return result;
    }

    private void resolve(JsonValue json_values){
        for(JsonValue node : json_values.iterator()){
            String itemIdentifier = "";
            int uniqueId = -1;
            String ImageName="";
            float x = 0;
            float y = 0;
            float scaleX =0;
            float scaleY =0;

            if(node.get("uniqueId")!=null)
                uniqueId =node.get("uniqueId").asInt();

            ArrayList<JsonValue> elements = getSprites(node);
            CompositeImage compositeImage = new CompositeImage();

            JsonValue element = null;

            for(int i=0; i<elements.size(); i++) {
                element = elements.get(i);

                x=0;
                y=0;

                ImageName = element.get("ImageName").asString();

                uniqueId =element.get("uniqueId").asInt();

                if (element.get("x") != null)
                    x = element.get("x").asFloat();
                if (element.get("y") != null)
                    y = element.get("y").asFloat();

                Sprite sprite = _sprite_samples.get(ImageName);
                Image image = compositeImage.add(uniqueId, sprite, new Point(x, y));

                if (element.get("scaleX") != null)
                    scaleX = element.get("scaleX").asFloat();
                if (element.get("scaleY") != null)
                    scaleY = element.get("scaleY").asFloat();

                scaleX = scaleX == 0 ? 1 : scaleX;
                scaleY = scaleY == 0 ? 1 : scaleY;

                image.setPosition(x, y);
                image.setWidth(image.getWidth() * scaleX);
                image.setHeight(image.getHeight() * scaleY);
                addActor(image);
            }

            if(node.get("itemIdentifier")!=null) {
                itemIdentifier = node.get("itemIdentifier").asString();
                _images.put(itemIdentifier, compositeImage);
            }

            //composite image
            if(elements.size()>1){
                x = node.get("x").asFloat();
                y = node.get("y").asFloat();
                compositeImage.setPosition(x, y);
            }
        }
    }

    private void loadScene(String sceneName){

        FileHandle fileHandle = Gdx.files.internal(Utility.formatString("scenes\\%s.dt", sceneName));

        String json_text = fileHandle.readString();

        JsonValue json = new JsonReader().parse(json_text);

        JsonValue json_images = json.get("composite").get("sImages");

        JsonValue json_composite = json.get("composite").get("sComposites");

        resolve(json_images);
        resolve(json_composite);
    }
}

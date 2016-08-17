package com.libgdx.html5.gameframework;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.files.FileHandle;
import com.badlogic.gdx.graphics.g2d.Batch;
import com.badlogic.gdx.graphics.g2d.Sprite;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.g2d.TextureAtlas;
import com.badlogic.gdx.scenes.scene2d.Stage;
import com.badlogic.gdx.scenes.scene2d.ui.Image;
import com.badlogic.gdx.utils.Array;
import com.badlogic.gdx.utils.JsonReader;
import com.badlogic.gdx.utils.JsonValue;
import com.badlogic.gdx.utils.viewport.Viewport;
import com.exericse.game.Point;

import java.util.ArrayList;
import java.util.HashMap;

/**
 * Created by matt1201 on 2016/8/15.
 */
public class GameStage extends Stage{
    public class CompositeImage{
        class Picture{
            public int UniqueID;
            public Sprite Sprite;
            public Image Image;
            public Point Position;
            public float Width;
            public float Height;
            Picture(int uniqueID, Sprite sprite, Image image, Point position, float width, float height){
                UniqueID = uniqueID;
                Sprite = sprite;
                Image = image;
                Position = position;

                Width = width;
                Height = height;
            }
        }

        private HashMap<Integer, Picture> images = new HashMap<Integer, Picture>();

        private Point _position = new Point(0, 0);
        private Point _scale = new Point(0, 0);

        public float get_x(){return _position.x;}
        public float get_y(){return _position.y;}

        public Point get_position(){return _position;}

        public Image add(int uniqueId, Sprite sprite, Point point, float width, float height){

            sprite = new Sprite(sprite);

            Image image = new Image(sprite);
            images.put(uniqueId, new Picture(uniqueId, sprite, image, point, width, height));
            image.setPosition(point.x, point.y);
            return image;
        }

        public void setPosition(float x, float y){
            _position.x =x;
            _position.y =y;

            for(Picture picture: images.values()) {
                float p_x = x;
                float p_y = y;

                if(images.size() > 1) {
                    p_x = picture.Position.x + x;
                    p_y = picture.Position.y + y;
                }else {
                    float offset_x = Math.abs(picture.Image.getWidth() - picture.Sprite.getWidth()) / 2;
                    float offset_y = Math.abs(picture.Image.getHeight() - picture.Sprite.getHeight()) / 2;

                    if (_scale.x > 1)
                        p_x -= offset_x;
                    if (_scale.y > 1)
                        p_y -= offset_y;

                    if (_scale.x < 1)
                        p_x += offset_x;
                    if (_scale.y < 1)
                        p_y += offset_y;
                }

                picture.Image.setPosition(p_x, p_y);
            }
        }

        public void setScale(float x, float y){
            _scale.x = x;
            _scale.y = y;

            for(Picture picture: images.values()){
                picture.Image.setWidth(picture.Sprite.getWidth() * x);
                picture.Image.setHeight(picture.Sprite.getHeight() * y);
            }
        }

        public void removeActor(){
            for(Picture picture: images.values())
                picture.Image.remove();
        }
    }

    private TextureAtlas.TextureAtlasData _textureAtlasData = null;
    private HashMap<String, Sprite> _sprite_samples = new HashMap<String, Sprite>();
    private HashMap<String, CompositeImage> _images = new HashMap<String, CompositeImage>();
    private SpriteBatch _spriteBatch = new SpriteBatch();

    public CompositeImage getItem(String itemIdentifier){
        return _images.get(itemIdentifier);
    }

    @Override
    public Batch getBatch() {
        return _spriteBatch;
    }

    public GameStage(String sceneName, Viewport viewport){
        super(viewport);

        loadAtlasData("pack");
        loadScene(sceneName);
    }

    private void loadAtlasData(String pack_name){
        FileHandle fileHandle =Gdx.files.internal(Utility.formatString("orig/%s.atlas", pack_name));
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
            int uniqueId_node = -1;
            int uniqueId_element = -1;
            String ImageName="";
            float element_x = 0;
            float element_y = 0;
            float element_scaleX =0;
            float element_scaleY =0;

            float node_x = 0;
            float node_y = 0;
            float node_width = 0;
            float node_height = 0;
            float node_scaleX =1;
            float node_scaleY =1;

            if(node.get("uniqueId")!=null)
                uniqueId_node =node.get("uniqueId").asInt();

            ArrayList<JsonValue> elements = getSprites(node);
            CompositeImage compositeImage = new CompositeImage();

            JsonValue element = null;

            if (node.get("scaleX") != null)
            if (node.get("scaleY") != null) {
                node_scaleX = node.get("scaleX").asFloat();
                node_scaleY = node.get("scaleY").asFloat();
            }

            for(int i=0; i<elements.size(); i++) {
                element = elements.get(i);

                element_x=0;
                element_y=0;
                element_scaleX = 0;
                element_scaleY = 0;

                ImageName = element.get("ImageName").asString();

                uniqueId_element =element.get("uniqueId").asInt();

                if (element.get("x") != null)
                    element_x = element.get("x").asFloat();
                if (element.get("y") != null)
                    element_y = element.get("y").asFloat();

                if (element.get("scaleX") != null)
                if (element.get("scaleY") != null) {
                    element_scaleX = element.get("scaleX").asFloat();
                    element_scaleY = element.get("scaleY").asFloat();
                }

                element_scaleX = element_scaleX == 0 ? 1 : element_scaleX;
                element_scaleY = element_scaleY == 0 ? 1 : element_scaleY;

                Sprite sprite = _sprite_samples.get(ImageName);
                float width = sprite.getWidth() * element_scaleX;
                float height = sprite.getHeight() * element_scaleY;

                Image image = null;

                if(elements.size()<=1)
                    image = compositeImage.add(uniqueId_element, sprite, new Point(element_x, element_y),
                                                width, height);
                else
                    image = compositeImage.add(uniqueId_element, sprite, new Point(element_x * node_scaleX, element_y * node_scaleY),
                            width, height);

                image.setWidth(sprite.getWidth() * element_scaleX);
                image.setHeight(sprite.getHeight() * element_scaleY);

                addActor(image);
            }

            if(node.get("itemIdentifier")!=null) {
                itemIdentifier = node.get("itemIdentifier").asString();
                _images.put(itemIdentifier, compositeImage);
            }

            node_x=0;
            node_y=0;

            //composite image
            if(node.get("x")!=null)
            if(node.get("y")!=null){
                node_x = node.get("x").asFloat();
                node_y = node.get("y").asFloat();
            }

            compositeImage.setScale(node_scaleX, node_scaleY);
            compositeImage.setPosition(node_x, node_y);
        }
    }

    private void loadScene(String sceneName){

        FileHandle fileHandle = Gdx.files.internal(Utility.formatString("scenes/%s.dt", sceneName));

        String json_text = fileHandle.readString();

        JsonValue json = new JsonReader().parse(json_text);

        JsonValue json_images = json.get("composite").get("sImages");

        JsonValue json_composite = json.get("composite").get("sComposites");

        resolve(json_images);
        resolve(json_composite);
    }
}

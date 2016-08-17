package com.exericse.game.client;

import com.badlogic.gdx.ApplicationListener;
import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.backends.gwt.GwtApplication;
import com.badlogic.gdx.backends.gwt.GwtApplicationConfiguration;
import com.exericse.game.Mario;

public class HtmlLauncher extends GwtApplication {

        @Override
        public GwtApplicationConfiguration getConfig () {
                return new GwtApplicationConfiguration(500, 550);
        }

        @Override
        public ApplicationListener createApplicationListener () {
                return new Mario();
        }

        @Override
        public void log(String tag, String message) {
//                super.log(tag, message);
                consoleLog(tag + ": " + message + "\n");
        }
}
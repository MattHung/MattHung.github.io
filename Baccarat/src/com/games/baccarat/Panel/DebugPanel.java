package com.games.baccarat.Panel;

import java.awt.*;

/**
 * Created by matt1201 on 2016/12/1.
 */
public class DebugPanel{
    public static final int WINDOWS_WIDTH = 1280;
    public static final int WINDOWS_HEIGHT = 720;

    private static Frame _frame = new Frame("Baccart");

    public static void initialization(){
        _frame.setBackground(Color.gray);
        _frame.setSize(WINDOWS_WIDTH+20, WINDOWS_HEIGHT+40);
        _frame.setVisible(true);
    }
}

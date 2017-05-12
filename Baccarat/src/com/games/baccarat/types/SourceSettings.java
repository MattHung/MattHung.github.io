package com.games.baccarat.types;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by matt1201 on 2017/3/9.
 */
public class SourceSettings {
    public Map<Integer, SessionSettingGroup> Settings = new ConcurrentHashMap<>();
}

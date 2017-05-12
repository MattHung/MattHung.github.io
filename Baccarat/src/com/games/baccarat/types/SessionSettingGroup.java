package com.games.baccarat.types;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;

/**
 * Created by matt1201 on 2017/3/13.
 */
public class SessionSettingGroup {
    public HashSet<String> RanSessions = new HashSet<>();
    public List<SessionSetting> Settings = new LinkedList<>();
}

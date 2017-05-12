package com.games.baccarat.types;

import com.eject.interop.ActorBase;
import com.games.baccarat.Entry;
import com.games.baccarat.ProtocolHandler;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by matt1201 on 2017/3/17.
 */
public class BaccaratSave {
    public static Gson GsonObject = new Gson();

    private static Map<Integer, String> _cache = new ConcurrentHashMap<>();

    public static void onPlayerEnter(long actor_id){
        int user_id = ActorBase.getUserID(actor_id);
        if(Entry.Instance().IsAdministrator(user_id))
            return;

        if(!_cache.containsKey(user_id)) {
            String query = String.format("select *, %d as ActorID from %s where UserID=%d", actor_id, SQLQuerys.QUERY_USER_SETTING, user_id);
            Entry.Instance().queryWagers(query);
            return;
        }

        sendSetting(actor_id);
    }

    public static void onUpdateChipSetting(long actor_id, String str){
        int user_id = ActorBase.getUserID(actor_id);
        if(user_id==0)
            return;
        if(Entry.Instance().IsAdministrator(user_id))
            return;

        String query = String.format("update %s set BaccaratSettings = '%s' where UserID=%d",
                                    SQLQuerys.QUERY_USER_SETTING, str, user_id);
        Entry.Instance().queryWagers(query);

        _cache.put(user_id, str);
        sendSetting(actor_id);
    }

    public static void sendSetting(long actor_id){
        int user_id = ActorBase.getUserID(actor_id);

        if(Entry.Instance().IsAdministrator(user_id))
            return;

        String result = "";
        if(_cache.containsKey(user_id))
            result = _cache.get(user_id);

        ProtocolHandler.sendChipSetting(actor_id, result);
    }

    public static void onSQLResponse(String sql_result){
        JsonArray jsonArray = GsonObject.fromJson(sql_result, JsonArray.class);

        if(jsonArray==null)
            return;

        if(jsonArray.size() <= 0)
            return;

        JsonObject jsonObject = jsonArray.get(0).getAsJsonObject();

        if(jsonObject.get("ActorID")==null)
            return;

        long actor_id = jsonObject.get("ActorID").getAsLong();
        if(actor_id==0)
            return;

        String setting = jsonObject.get("BaccaratSettings").getAsString();
        _cache.put(ActorBase.getUserID(actor_id), setting);
        sendSetting(actor_id);
    }

}

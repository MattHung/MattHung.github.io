package com.games.baccarat.billboard;

import com.eject.interop.ProtocolData;
import com.eject.widget.eventgent.StandardTimeEvent;
import com.eject.widget.eventgent.TickEvent;
import com.games.baccarat.DateUtils;
import com.games.baccarat.Entry;
import com.games.baccarat.ProtocolHandler;
import com.games.baccarat.types.BillBoardRank;
import com.games.baccarat.types.EnrollmentInfo;
import com.games.baccarat.types.PastStatisticBoardRank;
import com.games.baccarat.types.SQLQuerys;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Created by matt1201 on 2017/1/6.
 */
public class Billboard_GodGambler {
    public static Gson GsonObject = new Gson();

    private static DateFormat _df_source = new SimpleDateFormat("yyyy/MM/dd a HH:mm:ss");
    private static DateFormat _df_target_full = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    private static DateFormat _df_target_date = new SimpleDateFormat("yyyy-MM-dd");

    private static int _query_enroolment_history_index = 0;
    private static Map<Long, EnrollmentInfo> _history_wagers = new ConcurrentHashMap<>();

    public static List<BillBoardRank> GodGambler_Today = new LinkedList<>();
    public static List<PastStatisticBoardRank> GodGambler_Past = new LinkedList<>();
    public static int GodGambler_Participator_Today = 0;
    public static int GodGambler_Participator_Past = 0;

    public static String Json_GodGambler_Today = "[]";
    public static String Json_GodGambler_Past = "[]";

    public static String Json_GodGambler_Participator_Today = "0";
    public static String Json_GodGambler_Participator_Past = "0";
    public static List<String> Json_GodGambler_Enroll_History = new LinkedList<>();

    public static TickEvent TickEvent = new TickEvent();
    public static StandardTimeEvent StandardTimeEvent = new StandardTimeEvent();

    public static void initialization()
    {
        updateBillBoard();

        for(byte hour = 0; hour<24; hour++)
        for(byte minute = 0; minute <60 ;minute++) {
//            if(minute % 10 !=0)
//                continue;

            StandardTimeEvent.AddOnInterval_EveryDay(hour, minute, (byte)0, new Runnable() {
                @Override
                public void run() {
                    updateBillBoard();
                }
            });
        }
    }

    public static void updateBillBoard(){
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Date date = Calendar.getInstance().getTime();
        String date_s = sdf.format(date);

        SQLQuerys.QUERY_RANK_CMD_TODAY = String.format(SQLQuerys.QUERY_RANK_CMD_TODAY, Entry.Instance().gameGameID().getValue(), date_s);
        SQLQuerys.QUERY_RANK_CMD_PAST = String.format(SQLQuerys.QUERY_RANK_CMD_PAST, Entry.Instance().gameGameID().getValue(), date_s);

        SQLQuerys.QUERY_PARTICIPATOR_CMD_TODAY = String.format(SQLQuerys.QUERY_PARTICIPATOR_CMD_TODAY, Entry.Instance().gameGameID().getValue());
        SQLQuerys.QUERY_PARTICIPATOR_CMD_PAST = String.format(SQLQuerys.QUERY_PARTICIPATOR_CMD_PAST, Entry.Instance().gameGameID().getValue());

        SQLQuerys.QUERY_GAME_SETTINGS = String.format(SQLQuerys.QUERY_GAME_SETTINGS, Entry.Instance().gameGameID().getValue());

        SQLQuerys.QUERY_ENROLLMENT_HISTORY = String.format(SQLQuerys.QUERY_ENROLLMENT_HISTORY, Entry.Instance().gameGameID().getValue());

        TickEvent.Add(500, new Runnable() {
            @Override
            public void run() {
                Entry.Instance().queryWagers(SQLQuerys.QUERY_RANK_CMD_TODAY);
                Entry.Instance().queryWagers(SQLQuerys.QUERY_RANK_CMD_PAST);

                Entry.Instance().queryWagers(SQLQuerys.QUERY_PARTICIPATOR_CMD_TODAY);
                Entry.Instance().queryWagers(SQLQuerys.QUERY_PARTICIPATOR_CMD_PAST);

                _history_wagers.clear();
                queryEnrollmentHistory(0);
            }
        });
    }

    private static void queryEnrollmentHistory(int start_index){
        String query_enrollment = SQLQuerys.QUERY_ENROLLMENT_HISTORY +
                String.format(" order by WagersDate asc limit %d, 1000", start_index);
        Entry.Instance().queryWagers(query_enrollment);
    }

    public static void postGodGamblerBillboard(String cmd, String sql_result){
        if (cmd.equals(SQLQuerys.QUERY_RANK_CMD_TODAY)) {
            GodGambler_Today = GsonObject.fromJson(sql_result, new TypeToken<List<BillBoardRank>>() {}.getType());
            Json_GodGambler_Today = GsonObject.toJson(GodGambler_Today);
            return;
        }

        if (cmd.equals(SQLQuerys.QUERY_RANK_CMD_PAST)) {
            GodGambler_Past = GsonObject.fromJson(sql_result, new TypeToken<List<PastStatisticBoardRank>>() {}.getType());
            Json_GodGambler_Past = GsonObject.toJson(GodGambler_Past);
            return;
        }

        if(cmd.equals(SQLQuerys.QUERY_PARTICIPATOR_CMD_TODAY)){
            JsonArray jsonArray = GsonObject.fromJson(sql_result, JsonArray.class);
            GodGambler_Participator_Today = jsonArray.get(0).getAsJsonObject().get("count").getAsInt();
            Json_GodGambler_Participator_Today = GsonObject.toJson(GodGambler_Participator_Today);
            return;
        }

        if(cmd.equals(SQLQuerys.QUERY_PARTICIPATOR_CMD_PAST)){
            JsonArray jsonArray = GsonObject.fromJson(sql_result, JsonArray.class);
            GodGambler_Participator_Past = jsonArray.get(0).getAsJsonObject().get("count").getAsInt();
            Json_GodGambler_Participator_Past = GsonObject.toJson(GodGambler_Participator_Past);
            return;
        }

        if(cmd.contains(SQLQuerys.QUERY_ENROLLMENT_HISTORY))
        {
            JsonArray jsonArray = GsonObject.fromJson(sql_result, JsonArray.class);

            for(int i=0; i<jsonArray.size(); i++){
                JsonObject jsonObject = jsonArray.get(i).getAsJsonObject();

                EnrollmentInfo info = new EnrollmentInfo();
                long wager_id = jsonObject.get("WagersID").getAsLong();

                info.N = jsonObject.get("UserName").getAsString();
                info.F = jsonObject.get("EntranceFee").getAsInt();
                info.R = jsonObject.get("RoundSerial").getAsInt();
                info.DT  = jsonObject.get("WagersDate").getAsString();

                boolean is_pm = false;

                if(info.DT.toLowerCase().contains("pm"))
                    is_pm = true;
                if(info.DT.toLowerCase().contains("下午"))
                    is_pm = true;

                try {
                    Date src_date = _df_source.parse(info.DT);
                    if(is_pm) {
                        Calendar cal = Calendar.getInstance();
                        cal.setTime(src_date);
                        cal.add(Calendar.HOUR_OF_DAY, 12);
                        src_date = cal.getTime();
                    }

                    info.DT = _df_target_full.format(src_date);
                    info.D = _df_target_date.format(src_date);

                    //mark today
                    Date tw_date = new Date(src_date.getTime() + TimeUnit.HOURS.toMillis(12));

                    if(DateUtils.isSameDay(tw_date, new Date()))
                        info.T= 1;
                } catch (ParseException e) {
                    e.printStackTrace();
                }

                if(!_history_wagers.containsKey(wager_id))
                    _history_wagers.put(wager_id, info);
            }

            updateEnrollHistoryData();
            _query_enroolment_history_index += jsonArray.size();
            if(jsonArray.size() > 0 )
                queryEnrollmentHistory(_query_enroolment_history_index);
            else
                _query_enroolment_history_index = 0;

            return;
        }
    }

    private static void updateEnrollHistoryData(){
        List<EnrollmentInfo> _list_page = new LinkedList<>();
        Json_GodGambler_Enroll_History.clear();

        for(long wagers_id : _history_wagers.keySet()){
            EnrollmentInfo info = _history_wagers.get(wagers_id);

            if(_list_page==null)
                _list_page = new LinkedList<>();

            _list_page.add(info);

            if(_list_page.size()>100){
                Json_GodGambler_Enroll_History.add(GsonObject.toJson(_list_page));
                _list_page = new LinkedList<>();
            }
        }

        if(_list_page.size() > 0)
            Json_GodGambler_Enroll_History.add(GsonObject.toJson(_list_page));
    }

    public static void onBillboardRequest(long actor_id){
        ProtocolData protocolData = new ProtocolData("Billboard");

        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("Today", Json_GodGambler_Today);
        jsonObject.addProperty("Past", Json_GodGambler_Past);
        jsonObject.addProperty("Participator_Today", Json_GodGambler_Participator_Today);
        jsonObject.addProperty("Participator_Past", Json_GodGambler_Participator_Past);

        protocolData.Data = jsonObject.toString();
        ProtocolHandler.sendMessage(actor_id, protocolData);
    }

    public static void onEnrollHistory(long actor_id){
        ProtocolData protocolData = null;

        if(Json_GodGambler_Enroll_History.size()<0){
            protocolData = new ProtocolData("EnrollHistory");
            JsonObject jsonObject = new JsonObject();
            jsonObject.addProperty("TotalPage", Json_GodGambler_Enroll_History.size());
            jsonObject.addProperty("Page", 0);
            jsonObject.addProperty("Data", "[]");
            protocolData.Data = jsonObject.toString();
            ProtocolHandler.sendMessage(actor_id, protocolData);
            return;
        }

        for(int i=0; i<Json_GodGambler_Enroll_History.size(); i++){
            protocolData = new ProtocolData("EnrollHistory");
            JsonObject jsonObject = new JsonObject();
            jsonObject.addProperty("TotalPage", Json_GodGambler_Enroll_History.size());
            jsonObject.addProperty("Page", i+1);
            jsonObject.addProperty("Data", Json_GodGambler_Enroll_History.get(i));
            protocolData.Data = jsonObject.toString();
            ProtocolHandler.sendMessage(actor_id, protocolData);
        }
    }

    public static void update(){
        TickEvent.Update();
        StandardTimeEvent.Update();
    }
}

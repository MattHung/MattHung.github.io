package com.games.baccarat.room;

import com.eject.widget.eventgent.EventBase;
import com.games.baccarat.Entry;
import com.games.baccarat.types.*;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import java.sql.Time;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by matt1201 on 2017/3/13.
 */
public class SettingManger {
    private static final int WHOLE_DAY_SECS = 86400;
    private static DateFormat _df_source = new SimpleDateFormat("yyyy/MM/dd a HH:mm:ss");
    private static DateFormat _df_target_date = new SimpleDateFormat("yyyy-MM-dd");
    private static long _last_applied_to_sql_tick = 0;

    public static Gson GsonObject = new Gson();
    public static SourceSettings DB_Source_Settings = new SourceSettings();

    public static void initial(){
        //reset Session RunNumberOfTimes
        Entry.StandardTimeEvent.AddOnInterval_EveryDay(EventBase.DayOption.MidNight, new Runnable() {
            @Override
            public void run() {
                for(SessionSettingGroup settingGroup : DB_Source_Settings.Settings.values())
                    settingGroup.RanSessions.clear();
            }
        });
    }

    private static void checkSourceSettingExist(SessionSetting setting){
        if(!DB_Source_Settings.Settings.containsKey(setting.RoomID))
            DB_Source_Settings.Settings.put(setting.RoomID, new SessionSettingGroup());

        List<SessionSetting> list_settings = DB_Source_Settings.Settings.get(setting.RoomID).Settings;
        list_settings.add(setting);
    }

    private static void checkApplyToSQL(SessionSetting result){
        if(result==null)
            return;

        if((System.currentTimeMillis() - _last_applied_to_sql_tick) < 1000)
            return;

        String update_query = SQLQuerys.QUERY_GAME_SETTINGS_APPLIED + "= '0'";
        Entry.Instance().queryWagers(update_query);

        int year = result.ApplyDate.get(Calendar.YEAR)==1?0:result.ApplyDate.get(Calendar.YEAR);
        int month = result.ApplyDate.get(Calendar.YEAR)==1?0:result.ApplyDate.get(Calendar.MONTH) + 1;
        int day = result.ApplyDate.get(Calendar.YEAR)==1?0:result.ApplyDate.get(Calendar.DAY_OF_MONTH);

        String applyDate = _df_target_date.format(result.ApplyDate.getTime());
        String applyBegin = result.ApplyTimeBegin.toString();
        String applyEnd = result.ApplyTimeEnd.toString();

        if(applyDate.equals("0001-01-01"))
            applyDate = "0000-00-00";

        update_query = SQLQuerys.QUERY_GAME_SETTINGS_APPLIED + "= 1 " +
                String.format("where RoomID='%d' and DefaultSession='%d' and ApplyDate='%s' and ApplyTimeBegin='%s' and ApplyTimeEnd='%s'",
                        result.RoomID, result.DefaultSession?1:0, applyDate, applyBegin, applyEnd);

        Entry.Instance().queryWagers(update_query);

        _last_applied_to_sql_tick = System.currentTimeMillis();
    }

    public static boolean checkTimeSetConflict(int room_id, int after_minutes){
        List<SessionSetting> list_settings = null;
        try {
            list_settings = new LinkedList<>(DB_Source_Settings.Settings.get(room_id).Settings);
        }catch (Exception e){
            System.out.print(true);
        }

        Calendar cal_now = Calendar.getInstance();
        Calendar cal_after = Calendar.getInstance();

        cal_after.add(Calendar.MINUTE, after_minutes);

        for(int i=list_settings.size()-1; i>=0; i--){
            if(list_settings.get(i).SettingType!=SessionSettingType.TimeSet) {
                list_settings.remove(i);
                continue;
            }

            SessionSetting setting = list_settings.get(i);

            Calendar cal_start = Calendar.getInstance();
            cal_start.setTime(setting.SessionStartTime);

            if(setting.ApplyDate.get(Calendar.YEAR) > 2000)
            {
                if(setting.ApplyDate.get(Calendar.YEAR)!=Calendar.getInstance().get(Calendar.YEAR)){
                    list_settings.remove(i);
                    continue;
                }
                if(setting.ApplyDate.get(Calendar.MONTH)!=Calendar.getInstance().get(Calendar.MONTH)){
                    list_settings.remove(i);
                    continue;
                }
                if(setting.ApplyDate.get(Calendar.DAY_OF_MONTH)!=Calendar.getInstance().get(Calendar.DAY_OF_MONTH)){
                    list_settings.remove(i);
                    continue;
                }
            }

            if(DB_Source_Settings.Settings.get(room_id).RanSessions.contains(getSessionKey(setting.RoomID, setting))){
                list_settings.remove(i);
                continue;
            }
        }

        for(int i=list_settings.size()-1; i>=0; i--){
            SessionSetting setting = list_settings.get(i);
            Calendar cal_start = Calendar.getInstance();
            cal_start.setTime(setting.SessionStartTime);

            if(cal_after.get(Calendar.HOUR_OF_DAY) >=cal_start.get(Calendar.HOUR_OF_DAY))
            if(cal_after.get(Calendar.MINUTE) >=cal_start.get(Calendar.MINUTE))
            if(cal_after.get(Calendar.SECOND) >=cal_start.get(Calendar.SECOND))
                return true;
        }

        return false;
    }

    public static int getSeconds(Calendar cal){
        int result = 0;

        result += cal.get(Calendar.HOUR_OF_DAY) * 3600;
        result += cal.get(Calendar.MINUTE) * 60;
        result += cal.get(Calendar.SECOND);

        return result;
    }

    public static SessionSetting getCurrentSetting(int room_id, SessionSettingType type){
        SessionSettingGroup settingGroup = DB_Source_Settings.Settings.get(room_id);
        List<SessionSetting> list_settings = new LinkedList<>(DB_Source_Settings.Settings.get(room_id).Settings);

        for(int i=list_settings.size()-1; i>=0; i--)
        if(list_settings.get(i).SettingType!=type)
            list_settings.remove(i);

        //sort by setting priority
        list_settings.sort(new Comparator<SessionSetting>() {
            @Override
            public int compare(SessionSetting o1, SessionSetting o2) {
                int result = 0;

                result = Boolean.compare(o2.DefaultSession, o1.DefaultSession);
                if(result!=0)
                    return result;

                result = o1.ApplyDate.compareTo(o2.ApplyDate);
                if(result!=0)
                    return result;

                Calendar cal_start_1 = Calendar.getInstance();
                cal_start_1.setTime(o1.ApplyTimeBegin);
                Calendar cal_start_2 = Calendar.getInstance();
                cal_start_2.setTime(o2.ApplyTimeBegin);

                return cal_start_1.compareTo(cal_start_2);
            }
        });

        SessionSetting result = null;

        for(SessionSetting setting : list_settings)
        {
            if(setting.SettingType == SessionSettingType.None)
                continue;

            Calendar cal_now = Calendar.getInstance();
            Calendar cal_start = Calendar.getInstance();
            cal_start.setTime(setting.ApplyTimeBegin);

            Calendar cal_end = Calendar.getInstance();
            cal_end.setTime(setting.ApplyTimeEnd);

            if(setting.DefaultSession)
                result = setting;

            int time_stamp_now = getSeconds(cal_now);
            int time_stamp_start = getSeconds(cal_start);
            int time_stamp_end = getSeconds(cal_end);

            if(time_stamp_end<time_stamp_start){
                time_stamp_now+=WHOLE_DAY_SECS;
                time_stamp_end+=WHOLE_DAY_SECS;
            }

            if(time_stamp_now>=time_stamp_start)
            if(time_stamp_now<=time_stamp_end) {
                if(setting.ApplyDate.get(Calendar.YEAR) > 2000)
                {
                    if(setting.ApplyDate.get(Calendar.YEAR)!=Calendar.getInstance().get(Calendar.YEAR))
                        continue;
                    if(setting.ApplyDate.get(Calendar.MONTH)!=Calendar.getInstance().get(Calendar.MONTH))
                        continue;
                    if(setting.ApplyDate.get(Calendar.DAY_OF_MONTH)!=Calendar.getInstance().get(Calendar.DAY_OF_MONTH))
                        continue;
                }

                if(setting.SettingType == SessionSettingType.TimeSet)
                if(settingGroup.RanSessions.contains(getSessionKey(setting.RoomID, setting)))
                    continue;

                result = setting;
            }

        }

        checkApplyToSQL(result);
        return result;
    }

    public static void updateSetting(String jsonStr){
        JsonArray jsonArray = GsonObject.fromJson(jsonStr, JsonArray.class);

        Map<Integer, SessionSettingGroup> settings_backup = new HashMap<>(DB_Source_Settings.Settings);
        DB_Source_Settings.Settings.clear();

        for(int i=0; i<jsonArray.size(); i++){
            JsonObject jsonObject = jsonArray.get(i).getAsJsonObject();

            SessionSetting setting = new SessionSetting();

            setting.RoomID = jsonObject.get("RoomID").getAsInt();
            setting.Name = jsonObject.get("Name").getAsString();

            setting.DefaultSession = jsonObject.get("DefaultSession").getAsInt()==1;

            String s_date = jsonObject.get("ApplyDate").getAsString();

            boolean is_pm = false;

            if(s_date.toLowerCase().contains("pm"))
                is_pm = true;
            if(s_date.toLowerCase().contains("下午"))
                is_pm = true;

            Date src_date = null;
            Calendar cal = Calendar.getInstance();

            try {
                src_date = _df_source.parse(s_date);
                cal.setTime(src_date);
                if(is_pm)
                    cal.add(Calendar.HOUR_OF_DAY, 12);

                setting.ApplyDate = cal;
                setting.ApplyTimeBegin =  Time.valueOf(jsonObject.get("ApplyTimeBegin").getAsString());
                setting.ApplyTimeEnd = Time.valueOf(jsonObject.get("ApplyTimeEnd").getAsString());
                setting.SettingType = SessionSettingType.getValue(jsonObject.get("SettingType").getAsInt());

            } catch (Exception e) {
                e.printStackTrace();
            }

            setting.Requirement = jsonObject.get("Requirement").getAsInt();
            setting.RunningMinutes = jsonObject.get("RunningMinutes").getAsInt();
            setting.SessionStartTime = Time.valueOf(jsonObject.get("SessionStartTime").getAsString());

            setting.TotalReward = jsonObject.get("TotalReward").getAsInt();
            setting.Max_enroll_count = jsonObject.get("Max_enroll_count").getAsInt();
            setting.Entrance_fee = jsonObject.get("Entrance_fee").getAsInt();

            setting.Service_fee = jsonObject.get("Service_fee").getAsInt();
            setting.Entrance_fee += setting.Service_fee;

            setting.Initial_chips = jsonObject.get("Initial_chips").getAsInt();
            setting.MinBet = jsonObject.get("MinBet").getAsInt();
            setting.MaxBet = jsonObject.get("MaxBet").getAsInt();

            setting.HallID = jsonObject.get("HallID").getAsInt();
            setting.PassCount = jsonObject.get("PassCount").getAsInt();
            setting.HideCount = jsonObject.get("HideCount").getAsInt();

            for(int rank_index = 1; rank_index<=17; rank_index++){
                String rank_field_name = String.format("Rank%d", rank_index);
                if(jsonObject.get(rank_field_name)==null)
                    continue;
                int rank_award = jsonObject.get(rank_field_name).getAsInt();

                if(rank_award<=0)
                    continue;
                setting.RankReward.add(rank_award);
            }

            checkSourceSettingExist(setting);
        }

        for(int room_id : DB_Source_Settings.Settings.keySet())
        if(settings_backup.containsKey(room_id))
            DB_Source_Settings.Settings.get(room_id).RanSessions = settings_backup.get(room_id).RanSessions;
    }

    private static String getSessionKey(int room_id, SessionSetting setting){
        return String.format("%d_%s", room_id, setting.toString());
    }

    public static void notifySessionOver(int room_id, SessionSetting setting){
        if(DB_Source_Settings.Settings.containsKey(room_id))
            DB_Source_Settings.Settings.get(room_id).RanSessions.add(getSessionKey(room_id, setting));
    }
}

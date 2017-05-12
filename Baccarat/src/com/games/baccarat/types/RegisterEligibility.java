package com.games.baccarat.types;

import com.eject.widget.DebugMessage;
import com.eject.widget.Worker;
import com.eject.widget.http.HttpGetRequestor;
import com.eject.widget.http.HttpPostRequestor;
import com.games.baccarat.Entry;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Created by matt1201 on 2017/3/15.
 */
public class RegisterEligibility {
    public static class RequestParams{
        public int hallid;
        public int userid;
    }

    public static int THREAD_COUNT = 10;
    public static int REQUEST_TIMEOUT = 6 * 1000;

    private static DateFormat _df_target_date = new SimpleDateFormat("yyyy-MM-dd");

    private static Gson gson = new Gson();
    private static Queue<RequestParams> _requests = new LinkedList<>();
    private static Lock _lock_request = new ReentrantLock();
    private static List<Worker> _work_http_io = new LinkedList<>();

    private static Map<Integer, Double> _total_bet_amount = new ConcurrentHashMap<>();

    static {
//        for(int i=0; i<THREAD_COUNT; i++) {
//            _work_http_io.add(new Worker(new Worker.Task() {
//                @Override
//                public void Execute() {
//                    RequestParams[] params = null;
//
//                    _lock_request.lock();
//                    params = _requests.toArray(new RequestParams[0]);
//                    _requests.clear();
//                    _lock_request.unlock();
//
//                    Calendar now  = Calendar.getInstance();
//
//                    //us east timezone
//                    now.add(Calendar.HOUR_OF_DAY, -12);
//
//                    Calendar begin_date = now;
//                    Calendar begin_end = now;
//
//                    begin_date.add(Calendar.DAY_OF_MONTH, -1);
//                    begin_end.add(Calendar.DAY_OF_MONTH, -1);
//
//                    String start_date = _df_target_date.format(begin_date.getTime());
//                    String end_date = _df_target_date.format(begin_end.getTime());
//
//                    for (int i = 0; i < params.length; i++) {
//                        String url = String.format(Entry.API_URL_VALIDBETAMOUNT, params[i].hallid, params[i].userid, start_date, end_date);
//
//                        try {
//                            HttpGetRequestor requestor = new HttpGetRequestor(url, REQUEST_TIMEOUT);
//                            String http_response = requestor.executeSend();
//                            JsonObject jsonObject = gson.fromJson(http_response, JsonObject.class);
//
//                            if(jsonObject.get("result").getAsBoolean())
//                                _total_bet_amount.put(params[i].userid, jsonObject.get("data").getAsJsonObject().get("Betting").getAsDouble());
//
//                        } catch (Exception e) {
//                            DebugMessage.addException(e);
//                        }
//                    }
//                }
//            }));
//        }
    }

    public static boolean checkEligibility(int user_id, int threshold){
        if(user_id==0)
            return false;

        if(Entry.Instance().IsAdministrator(user_id))
            return true;

        if(!_total_bet_amount.containsKey(user_id))
            return false;

        return _total_bet_amount.get(user_id)>=threshold;
    }

    public static void onPlayerEnter(int user_id, int hall_id){
        if(user_id==0)
            return;

        RequestParams params = new RequestParams();
        params.userid = user_id;
        params.hallid = hall_id;

        _lock_request.lock();
        _requests.offer(params);
        _lock_request.unlock();
    }
}

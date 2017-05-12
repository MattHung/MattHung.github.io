package com.games.baccarat.types;

import com.eject.widget.Worker;
import com.eject.widget.http.HttpGetRequestor;
import com.games.baccarat.Entry;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**]
 * Created by matt1201 on 2017/3/15.
 */
public class BetLimitation {
    static class Task{
        public int UserID;
        public String SessionToken;

        public Task(int user_id, String token){
            UserID = user_id;
            SessionToken = token;
        }
    }

    public static class Info{
        public int BL;  //Minimum Limit of single bet
        public int BH;  //Maximum Limit of single bet
        public int P; 	//Maximum Limit for Pair
        public int T; 	//Maximum Limit for Tie

//        public int RH;  //Maximum Limit of single round
//        public int RL;  //Minimum Limit of single round
//        public int SE;  //Maximum Limit for Even/Odd
//        public int OU;  //Maximum Limit for Large/Small
//
//
//        public int BA;  //Maximum Limit for Bonus
//        public int BI;  //Minimum Limit for Bonus
//        public int LH;  //Maximum Limit for Multiple
//        public int LL;  //Minimum Limit for Multiple
    }

    public static int REQUEST_TIMEOUT = 6 * 1000;
    private static Map<Integer, Info> _user_info = new ConcurrentHashMap<>();
    private static Gson gson = new Gson();

    private static Queue<Task> _tasks = new LinkedList<>();
    private static Lock _lock = new ReentrantLock();

    private static Worker _worker = null;

    static {
        _worker= new Worker(new Worker.Task() {
            @Override
            public void Execute() {
                Task[] tasks = null;
                _lock.lock();
                tasks = _tasks.toArray(new Task[0]);
                _tasks.clear();
                _lock.unlock();

                for(int i=0; i<tasks.length; i++){
                    String url = String.format(Entry.API_URL_BETLIMITATION, tasks[i].SessionToken);
                    try {
                        HttpGetRequestor httpGetRequestor = new HttpGetRequestor(url, REQUEST_TIMEOUT);
                        String res = httpGetRequestor.executeSend();

                        JsonObject jsonObject = gson.fromJson(res, JsonObject.class);

                        int user_id = tasks[i].UserID;
                        _user_info.put(user_id, new Info());

                        if(jsonObject.get("result").getAsString().equals("true")){
                            JsonArray jsonArray = jsonObject.get("data").getAsJsonArray();

                            for(int state_index = 0 ;state_index<jsonArray.size(); state_index++){
                                jsonObject = jsonArray.get(state_index).getAsJsonObject();

                                if(jsonObject.get("LimitType").getAsString().equals("BL"))
                                    _user_info.get(user_id).BL = jsonObject.get("LimitValue").getAsInt();
                                if(jsonObject.get("LimitType").getAsString().equals("BH"))
                                    _user_info.get(user_id).BH = jsonObject.get("LimitValue").getAsInt();
                                if(jsonObject.get("LimitType").getAsString().equals("P"))
                                    _user_info.get(user_id).P = jsonObject.get("LimitValue").getAsInt();
                                if(jsonObject.get("LimitType").getAsString().equals("T"))
                                    _user_info.get(user_id).T = jsonObject.get("LimitValue").getAsInt();
                            }
                        }

                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        });
    }

    public static void onPlayerEnter(int user_id, String session_token){
        addCache(user_id, session_token);
    }

    private static void addCache(int user_id, String session_token){
        if(Entry.Instance().IsAdministrator(user_id)){
            Info info = new Info();
            info.BL =1;
            info.BH = 500000;
            info.P = 500000;
            info.T = 500000;
            _user_info.put(user_id, info);
            return;
        }
        _lock.lock();
        _tasks.offer(new Task(user_id, session_token));
        _lock.unlock();
    }

    public static boolean checkBetAmountValid(int user_id, Map<CardTypes, BetInfo> whole_bet_info, int total_amount){
        Info info = getInfo(user_id);

        if(info==null)
            return false;

        if(info.BL==0)
            return false;

        if(total_amount<info.BL)
            return false;
        if(total_amount>info.BH)
            return false;

        if(!checkCardTypeLimitation(whole_bet_info, CardTypes.PlayerPairs, info.P))
            return false;
        if(!checkCardTypeLimitation(whole_bet_info, CardTypes.BankerPairs, info.P))
            return false;

        if(whole_bet_info.containsKey(CardTypes.Draw))
        if(whole_bet_info.get(CardTypes.Draw).getAmount() > info.T)
            return false;

        return true;
    }

    private static boolean checkCardTypeLimitation(Map<CardTypes, BetInfo> whole_bet_info, CardTypes check_type, int limitation){
        if(whole_bet_info.containsKey(check_type))
        if(whole_bet_info.get(check_type).getAmount() > limitation)
            return false;

        return true;
    }

    public static Info getInfo(int user_id){
        if(!_user_info.containsKey(user_id))
            return new Info();

        return _user_info.get(user_id);
    }
}

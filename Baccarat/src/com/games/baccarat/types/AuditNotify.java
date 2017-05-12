package com.games.baccarat.types;

import com.eject.widget.DebugMessage;
import com.eject.widget.Worker;
import com.eject.widget.http.HttpPostRequestor;
import com.games.baccarat.Entry;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.LinkedList;
import java.util.Queue;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Created by matt1201 on 2017/3/14.
 */
public class AuditNotify {
    public static final String Complex_audit = "1"; //打馬倍數

    public static int REQUEST_TIMEOUT = 6 * 1000;
    private static DateFormat _df_source = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");
    private static DateFormat _df_target_date = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    private static Gson gson = new Gson();
    private static Queue<RequestParams> _requests = new LinkedList<>();
    private static Lock _lock_request = new ReentrantLock();
    private static Worker _work_http_io = null;

    public static class RequestParams{
        public String cash_deposit_entry_id;
        public String user_id;
        public String balance;
        public String amount;
        public String deposit_time;
        public String complex_audit = Complex_audit;
        public String commission_check = "Y";
        public String is_rebate = "Y";
    }

    static {
        _work_http_io = new Worker(new Worker.Task() {
            @Override
            public void Execute() {
                RequestParams[] requests = null;
                _lock_request.lock();
                requests = _requests.toArray(new RequestParams[0]);
                _requests.clear();
                _lock_request.unlock();

                if(requests.length<=0)
                    return;

//                curl -X POST 'http://127.0.0.1/api/payment/audit/post.json' --header 'Api-Key:n94u83bp6' -H 'Host: hades.local.dev' -d
//                'Audit=[{"cash_deposit_entry_id": "100000","user_id": "2037705","balance": "9900","amount": "100","doposit_time":
//                "2017-01-11 09:00:00","complex_audit": "200","commission_check": "Y","is_rebate": "Y"},{"cash_deposit_entry_id":
//                "210000","user_id": "8777705","balance": "300","amount": "50","doposit_time": "2017-01-11 09:02:00","complex_audit":
//                "100","commission_check": "Y","is_rebate": "Y"}]'

                String json_send_str = gson.toJson(requests);
                String RequestString = "Audit=" + json_send_str;

                try {
                    HttpPostRequestor requestor = new HttpPostRequestor(Entry.API_URL_AUDIT, RequestString,
                            REQUEST_TIMEOUT, null, "Api-Key", "n94u83bp6");
                    String http_response = requestor.executeSend();
                    System.out.print(true);
                } catch (Exception e) {
                    DebugMessage.addException(e);
                }
            }
        });
    }

    public static void send(JsonObject jsonObject){
        RequestParams params = new RequestParams();

        params.cash_deposit_entry_id = jsonObject.get("id").getAsString();
        params.user_id = jsonObject.get("user_id").getAsString();
        params.balance = jsonObject.get("balance").getAsString();
        params.amount = jsonObject.get("amount").getAsString();

        String str_acc_date = jsonObject.get("created_at").getAsString();
        try {
            Date src_date = _df_source.parse(str_acc_date);
            params.deposit_time = _df_target_date.format(src_date);
        } catch (ParseException e) {
            e.printStackTrace();
        }

        _lock_request.lock();
        _requests.offer(params);
        _lock_request.unlock();
    }
}

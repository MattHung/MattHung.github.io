package com.games.baccarat;

import com.eject.interop.ActorBase;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by matt1201 on 2017/2/22.
 */
public class RankMessage {
    public static class MessageInfo{
        public int Round_id;
        public int Rank;
        public int Award;
        public boolean Quited;

        public MessageInfo(int round_id, int rank, int award, boolean quited){
            Round_id = round_id;
            Rank = rank;
            Award = award;
            Quited = quited;
        }
    }

    private static Map<Integer, MessageInfo> _messages = new ConcurrentHashMap<>();

    public static void add(int user_id, MessageInfo info){
        if(_messages.containsKey(user_id))
            return;

        _messages.put(user_id, info);
    }

    public static void checkMessage(long actor_id){
        int user_id = ActorBase.getUserID(actor_id);

        if(!_messages.containsKey(user_id))
            return;

        MessageInfo info = _messages.get(user_id);
        _messages.remove(user_id);

        Entry.TickEvent.Add(1000, new Runnable() {
            @Override
            public void run() {
                ProtocolHandler.sendRankInfo(actor_id, info.Round_id, info.Rank, info.Award, info.Quited);
            }
        });
    }
}

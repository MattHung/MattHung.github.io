package com.games.baccarat.actor;

import com.eject.AccountData;
import com.eject.custom.types.AccOperationResult;
import com.eject.custom.types.ExchangeRatio;
import com.eject.custom.types.OperationType;
import com.games.baccarat.Entry;
import com.games.baccarat.player.PlayerManager;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by matt1201 on 2016/5/26.
 */
public class ActorManager {
    private static Map<Long, CustomActor> m_Actors = new HashMap<>();

    public static CustomActor getActor(long actorID)
    {
        return m_Actors.containsKey(actorID) ? m_Actors.get(actorID) : null;
    }

    public static CustomActor[] Actors()
    {
        return m_Actors.values().toArray(new CustomActor[0]);
    }


    public static boolean Contains(long ActorID) {
        return m_Actors.get(ActorID) != null;
    }

    public static void Add(String RemoteIP, int RemotePort, long ActorID, AccountData accountData) {
        CustomActor Actor = new CustomActor(RemoteIP, RemotePort, ActorID, accountData);
        m_Actors.put(ActorID, Actor);
        PlayerManager.OnAddActor(Actor);
    }

    public static void Remove(long ActorID, String Reason) {
        CustomActor actor = m_Actors.get(ActorID);
        m_Actors.remove(ActorID);
        PlayerManager.OnRemoveActor(actor);
    }

    public static void onAccResponse(long actor_id, OperationType type, AccOperationResult result, ExchangeRatio Ratio, double value, double Balance){
        if(!Contains(actor_id))
            return;

        switch (type){
            case CardOperation:
                getActor(actor_id).onCardOperationResponse(result, value);
                break;
            default:
                double score = Entry.Instance().GetScore(actor_id);
                getActor(actor_id).onAccResponse(type, result, Ratio, value, Balance);
                break;

        }
    }
}

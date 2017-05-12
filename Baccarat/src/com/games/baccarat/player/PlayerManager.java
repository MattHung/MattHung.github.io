package com.games.baccarat.player;

import com.games.baccarat.actor.CustomActor;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by matt1201 on 2016/5/26.
 */
public class PlayerManager
{
    public static Map<Integer, Player> Players = new HashMap<>();

    public static void OnAddActor(CustomActor Actor)
    {
        int user_id = Actor.UserID();
        if (!Players.containsKey(user_id))
            Players.put(user_id, new Player(user_id));

        Players.get(user_id).OnAddActor(Actor);
    }

    public static void OnRemoveActor(CustomActor Actor)
    {
        if(Actor==null)
            return;
        int user_id = Actor.UserID();
        if (!Players.containsKey(user_id))
            return;
        Players.get(user_id).OnRemoveActor(Actor);
        if (Players.get(user_id).ActorCount() <= 0)
            Players.remove(Actor.UserID());
    }
}
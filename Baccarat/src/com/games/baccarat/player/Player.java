package com.games.baccarat.player;

import com.eject.AccountData;
import com.games.baccarat.actor.CustomActor;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by matt1201 on 2016/6/16.
 */
public class Player {
    private int _user_id = 0;
    public int UserID(){return _user_id;}
    public List<CustomActor> Actors = new LinkedList<>();
    public int ActorCount(){return Actors.size();}
    public AccountData Account(){return Actors.get(0).getAccount(); }
    public Player(int user_id)
    {
        _user_id = user_id;
    }

    public void OnAddActor(CustomActor Actor)
    {
        Actors.add(Actor);
    }

    public void OnRemoveActor(CustomActor Actor)
    {
        Actors.remove(Actor);
    }
}

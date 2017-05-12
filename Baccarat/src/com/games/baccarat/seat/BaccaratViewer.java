package com.games.baccarat.seat;

import com.eject.custom.types.ExchangeRatio;
import com.eject.interop.ActorBase;
import com.games.baccarat.Entry;
import com.games.baccarat.room.IBaccaratRoom;
import com.games.baccarat.types.BetInfo;
import com.games.baccarat.types.CardTypes;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by matt1201 on 2016/12/1.
 */
public class BaccaratViewer {
    private long _actor_id = 0;
    protected Map<CardTypes, BetInfo> _bet_info = new HashMap<>();

    protected IBaccaratRoom _room;

    public Map<CardTypes, BetInfo> getBetInfo(){return _bet_info;}

    public int getTotalBet(){
        int result = 0;
        for(BetInfo betInfo : _bet_info.values())
            result += betInfo.getAmount();

        return result;
    }

    public long getActorID(){return _actor_id;}

    public int getUserID(){return ActorBase.getUserID(_actor_id);}

    public BaccaratViewer(IBaccaratRoom room, long actor_id){
        _room = room;
        set(actor_id);
    }

    public void set(long actor_id){
        _actor_id = actor_id;
    }

    public void bet(int amount, CardTypes area, boolean hide){
        if(!_bet_info.containsKey(area))
            _bet_info.put(area, new BetInfo(area, 0));

        _bet_info.get(area).addAmount(amount);
    }

    public void clear(){
        _actor_id = 0;
        clearBet();
    }

    public void clearBet(){
        _bet_info.clear();
    }

    public void onReturnBet(){
        if(_bet_info.size() <=0 )
            return;

        int totalBet = getTotalBet();

        if(totalBet > 0)
            Entry.Instance().Recompensate(getActorID(), 0, totalBet, new ExchangeRatio(1, 1), null, Entry.OPCODE_CANCEL);

        clearBet();
    }
}

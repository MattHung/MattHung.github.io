package com.games.baccarat.seat;

import com.eject.interop.ProtocolData;
import com.games.baccarat.ProtocolHandler;
import com.games.baccarat.room.Baccarat_GodOfGambler;
import com.games.baccarat.room.IBaccaratRoom;
import com.games.baccarat.types.BetInfo;
import com.games.baccarat.types.CardTypes;
import com.games.baccarat.types.PlayerNote;
import com.google.gson.JsonObject;

/**
 * Created by matt1201 on 2016/12/22.
 */
public class GodOfGamblerSeat extends BaccaratSeat {
    private boolean _hidden_bet = false;
    private int _chips = 0;
    private long _tick_take_seat = 0;
    private long _last_bet_tick = 0;
    private boolean _is_passed = false;
    private PlayerNote _note = PlayerNote.None;

    public long getLastBetTick(){return _last_bet_tick;}
    public PlayerNote getNote(){return _note;}

    public int getBetHideCount(){
        try {
            return ((Baccarat_GodOfGambler) _room).getSession().getParticipator(getUserID()).BET_HIDE_COUNT;
        }catch (Exception e){
            System.out.print(true);
        }

        return 0;
    }
    public int getBetPassCount() {
        try {
            return ((Baccarat_GodOfGambler)_room).getSession().getParticipator(getUserID()).BET_PASS_COUNT ;
        }catch (Exception e){
            System.out.print(true);
        }

        return 0;
    }

    public long Last_postpone_bet_check_tick = 0;

    public long getTakeSeatTime(){return _tick_take_seat;}
    public boolean getPassed(){return _is_passed;}

    public GodOfGamblerSeat(IBaccaratRoom room, int seat_id) {
        super(room, seat_id);
    }

    public int getChips(){return _chips;}

    public void initialChips(int amount){
        _chips = amount;
        sendBetControlInfo();
    }

    public void addChips(int amount){
        _chips += amount;
        BroadcastChipsInfo();
    }

    @Override
    public void takeSeat(long actor_id) {
        super.takeSeat(actor_id);

        _tick_take_seat = System.currentTimeMillis();
        Last_postpone_bet_check_tick = 0;
    }

    @Override
    public void leaveSeat() {
        super.leaveSeat();

        _tick_take_seat = 0;
    }

    @Override
    public void bet(int amount, CardTypes area, boolean hide) {
        super.bet(amount, area, hide);

        _chips-=amount;
        _last_bet_tick = System.currentTimeMillis();

        ((Baccarat_GodOfGambler)_room).updateParticipatorBet(getUserID(), amount);

        if(hide)
        if(!_hidden_bet){
            ((Baccarat_GodOfGambler)_room).updateBetControlCount(getUserID(), getBetHideCount()-1, getBetPassCount());
            sendBetControlInfo();
            _hidden_bet = true;
            _note = PlayerNote.HideBet;
            return;
        }

        BroadcastChipsInfo();
    }

    public void pass(boolean system_bet){
        if(_is_passed)
            return;

        _is_passed = true;
        ((Baccarat_GodOfGambler)_room).updateBetControlCount(getUserID(), getBetHideCount(), getBetPassCount() -1);
        sendBetControlInfo();

        if(!system_bet) {
            _note = PlayerNote.ActivePass;
            _last_bet_tick = System.currentTimeMillis();
        }
        else{
            _note = PlayerNote.PassivePass;
        }
    }

    @Override
    public void setOnline(boolean val) {
        super.setOnline(val);

        if(val)
            _note = PlayerNote.None;
        else
            _note = PlayerNote.Holding;
    }

    @Override
    public void clearBet() {
        super.clearBet();
        _is_passed = false;
        _hidden_bet = false;
        _note = PlayerNote.None;
    }

    public void clearChips(){
        _chips = 0;
    }

    public void BroadcastChipsInfo(){
        ProtocolData protocolData = new ProtocolData("ChipInfo");

        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("SeatID", getSeatID());
        jsonObject.addProperty("User", getUserID());
        jsonObject.addProperty("Chips", getChips());

        protocolData.Data = jsonObject.toString();
        ProtocolHandler.broadcastMessage(_room, protocolData);
    }

    public void sendBetControlInfo(){
        ProtocolData protocolData = new ProtocolData("BetControl");

        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("HideCount", getBetHideCount());
        jsonObject.addProperty("PassCount", getBetPassCount());
        protocolData.Data = jsonObject.toString();
        ProtocolHandler.sendMessage(getActorID(), protocolData);
    }

    @Override
    public void clear() {
        super.clear();
        _chips = 0;
        _is_passed = false;
        _last_bet_tick = 0;
    }

    @Override
    public void onReturnBet() {
        if(_bet_info.size() <=0 )
            return;

        for(BetInfo betInfo : _bet_info.values())
            _chips+=betInfo.getAmount();

        clearBet();

        BroadcastChipsInfo();
    }
}

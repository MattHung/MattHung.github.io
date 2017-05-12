package com.games.baccarat.room;

import com.eject.AccountData;
import com.eject.custom.types.AccOperationResult;
import com.eject.custom.types.ExchangeRatio;
import com.eject.interop.ActorBase;
import com.eject.interop.ProtocolData;
import com.games.baccarat.Entry;
import com.games.baccarat.ProtocolHandler;
import com.games.baccarat.ScannerReceiver;
import com.games.baccarat.actor.ActorManager;
import com.games.baccarat.actor.CustomActor;
import com.games.baccarat.seat.BaccaratSeat;
import com.games.baccarat.seat.BaccaratViewer;
import com.games.baccarat.seat.GodOfGamblerSeat;
import com.games.baccarat.types.*;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * Created by matt1201 on 2016/12/1.
 */
public class Baccarat extends BaccaratBase implements IBaccaratRoom {
    public final static int MAX_SEAT_COUNT = 7;

    private long _tick_begin_deal_card = 0;

    public static Gson GsonObject = new Gson();

    protected Map<Long, BaccaratViewer> _viewers = new HashMap<>();

    protected List<BaccaratSeat> _seats = new LinkedList<BaccaratSeat>();

    public List<BaccaratSeat> getSeats(){
        return _seats;
    }

    public int getOccupiedSeats(){
        int result =0;
        for(int i=1; i<_seats.size(); i++)
        if(_seats.get(i).getActorID()>0)
            result++;

        return result;
    }

    public Map<Long, BaccaratViewer> getViewers(){
        return _viewers;
    }

    public Baccarat(int room_id, int minBet, int maxBet) {
        super(room_id, minBet, maxBet);

        _seats.add(new BaccaratSeat(this, 0));
        for(int i=1; i<=MAX_SEAT_COUNT; i++)
            _seats.add(new BaccaratSeat(this, i));
    }

    @Override
    public boolean contains(long actor_id){
        if(_viewers.containsKey(actor_id))
            return true;

        for(int i=1; i<_seats.size(); i++)
        if(_seats.get(i).getActorID()==actor_id)
            return true;

        return false;
    }

    @Override
    public int RoomID() {
        return getRoomID();
    }

    @Override
    public RoomTypes getType() {
        return RoomTypes.Baccarat;
    }

    @Override
    public CardInfo getCards() {
        return Cards;
    }

    @Override
    public List<BaccaratViewer> getPlayers() {
        List<BaccaratViewer> result = new LinkedList<>();
        result.addAll(_viewers.values());

        for(int i=1; i<_seats.size(); i++)
        if(_seats.get(i).getActorID()>0)
            result.add(_seats.get(i));
        return result;
    }

    @Override
    public RoomPreview getPreview() {
        return _preview;
    }

    @Override
    public void enterRoom(long actor_id) {
        int user_id = ActorBase.getUserID(actor_id);

//        2:已在房間內
        for(BaccaratViewer viewer : _viewers.values())
        if(viewer.getUserID()==user_id) {
            ProtocolHandler.sendEnterResult(actor_id, getRoomID(), 2);
            return;
        }

//        2:已在房間內
        for(int i=0; i<_seats.size(); i++)
        if(_seats.get(i).getUserID()==user_id){
            ProtocolHandler.sendEnterResult(actor_id, getRoomID(), 2);
            return;
        }

        _viewers.put(actor_id, new BaccaratViewer(this, actor_id));
        ProtocolHandler.sendEnterResult(actor_id, getRoomID(), 1);

        sendRoomInfo(actor_id);
    }

    public void leaveSeat(long actor_id, LeaveCause cause){
        if(actor_id<=0)
            return;

        for(int i=0; i<_seats.size(); i++)
        if(_seats.get(i).getActorID() == actor_id){
            if(cause==LeaveCause.Disconnect)
                return;

            ProtocolData protocolData = new ProtocolData("LeaveSeat");
            JsonObject jsonObject = new JsonObject();
            jsonObject.addProperty("SeatID", _seats.get(i).getSeatID());
            jsonObject.addProperty("UserID", _seats.get(i).getUserID());
            jsonObject.addProperty("Cause", cause.getValue());

            protocolData.Data = jsonObject.toString();
            ProtocolHandler.broadcastMessage(this, protocolData);

            _viewers.put(actor_id, new BaccaratViewer(this, actor_id));
            _seats.get(i).leaveSeat();
            return;
        }
    }

    public void kickViewer(long actor_id){
        _viewers.get(actor_id).onReturnBet();
        _viewers.remove(actor_id);
    }

    @Override
    public boolean leaveRoom(long actor_id, LeaveCause cause) {
//        離開房間結果 : LeaveRoom: { Result: 1, UserID:1000, SeatID:1}
        ProtocolData protocolData = new ProtocolData("LeaveRoom");
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("Result", 1);
        jsonObject.addProperty("Cause", cause.getValue());

        boolean result = false;

        for(int i=0; i<_seats.size(); i++)
        if(_seats.get(i).getActorID()==actor_id){
            int User_ID = _seats.get(i).getUserID();

            jsonObject.addProperty("UserID", User_ID);
            jsonObject.addProperty("SeatID", _seats.get(i).getSeatID());

            protocolData.Data = jsonObject.toString();
            ProtocolHandler.broadcastMessage(this, protocolData);
            leaveSeat(actor_id, cause);
            kickViewer(actor_id);
            sendSeatInfo(0);
            result = true;
        }

        if(_viewers.containsKey(actor_id)) {
            BaccaratViewer viewer = _viewers.get(actor_id);
            jsonObject.addProperty("UserID", viewer.getUserID());
            jsonObject.addProperty("SeatID", 0);
            protocolData.Data = jsonObject.toString();
            ProtocolHandler.broadcastMessage(this, protocolData);
            kickViewer(actor_id);
            result = true;
        }

        return result;
    }

    @Override
    public boolean silentLeaveRoom(long actor_id, LeaveCause cause) {
        boolean result = false;
        for(int i=0; i<_seats.size(); i++)
        if(_seats.get(i).getActorID()==actor_id){
            leaveSeat(actor_id, cause);
            kickViewer(actor_id);
            sendSeatInfo(0);
            result = true;
        }

        if(_viewers.containsKey(actor_id)) {
            BaccaratViewer viewer = _viewers.get(actor_id);
            kickViewer(actor_id);
            viewer.clear();
            result = true;
        }

        return result;
    }

    @Override
    public void NextStatus() {
        super.NextStatus();
        sendRoundStatus(0);
    }

    private void sendCard(long actor_id){
        for(int i=0; i < Cards.TableCards.size(); i++)
            sendCard(actor_id, i);
    }

    private void sendCard(long actor_id, int order){
        if(Cards.TableCards.get(order)==null)
            return;

        PokerCard.Card card = Cards.TableCards.get(order);

        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("Order", order);
        jsonObject.addProperty("CardNum", card.ID);
        jsonObject.addProperty("Visible", true);

//        廣播公牌資訊: CardInfo: {"Order":1, "CardNum":1, "Visible":true}
//        Order: 1~6, Player1, Player2
//                    Banker1, Banker2
//                    DrawCard1, DrawCard2
//                    CardNum: 1~52
        ProtocolData protocolData = new ProtocolData("CardInfo");
        protocolData.Data = jsonObject.toString();

        if(actor_id==0)
            ProtocolHandler.broadcastMessage(this, protocolData);
        else
            ProtocolHandler.sendMessage(actor_id, protocolData);
    }

    protected void sendSeatInfo(long actor_id){
        JsonArray jsonArray = new JsonArray();
        for(int i=1; i<=MAX_SEAT_COUNT; i++){
            JsonObject jsonObject = new JsonObject();
            jsonObject.addProperty("SeatID", _seats.get(i).getSeatID());
            jsonObject.addProperty("UserID", _seats.get(i).getUserID());
            jsonArray.add(jsonObject);
        }

        ProtocolData protocolData = new ProtocolData();
        protocolData.Action = "RoomInfo";
        protocolData.Data = jsonArray.toString();

//        廣播房間資訊: RoomInfo: [{"SeatID":1,"UserID":0}]
        if(actor_id==0)
            ProtocolHandler.broadcastMessage(this, protocolData);
        else
            ProtocolHandler.sendMessage(actor_id, protocolData);
    }

    private void sendUserNameInfo(long actor_id){
        for(int i=1; i<_seats.size(); i++) {
            if(_seats.get(i).getActorID() <= 0)
                continue;
            CustomActor actor = ActorManager.getActor(_seats.get(i).getActorID());

            if(actor==null)
                continue;

            AccountData accountData = actor.getAccount();
            ProtocolHandler.sendUserName(this, actor_id, accountData.UserName, accountData.UserID);
        }
    }

    protected void sendDealerInfo(long actor_id){
        JsonObject jsonObject = new JsonObject();

        jsonObject.addProperty("Name", ScannerReceiver.getDealerName(getRoomID()));

        ProtocolData protocolData = new ProtocolData();
        protocolData.Action = "DealerInfo";
        protocolData.Data = jsonObject.toString();

//        廣播荷官資訊: DealerInfo: {"Name":"name"};

        if(actor_id==0)
            ProtocolHandler.broadcastMessage(this, protocolData);
        else
            ProtocolHandler.sendMessage(actor_id, protocolData);
    }

    public void sendRoundStatus(long actor_id){
//        廣播牌局狀態: RoundStatus: {"Status": "RoundStart"}
        ProtocolData protocolData = new ProtocolData("RoundStatus");

        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("Status", _status.toString());

        protocolData.Data = jsonObject.toString();

        if(actor_id==0)
            ProtocolHandler.broadcastMessage(this, protocolData);
        else
            ProtocolHandler.sendMessage(actor_id, protocolData);
    }

    public int getEmptySeatCount(){
        int count = 0;

        for(int i=1; i < _seats.size(); i++)
        if(_seats.get(i).getActorID() == 0)
            count++;
        return count;
    }

    public int getEmptySeatID(){
        for(int i=1; i < _seats.size(); i++)
        if(_seats.get(i).getActorID() == 0)
            return _seats.get(i).getSeatID();

        return 0;
    }

    @Override
    public void sendRoomInfo(long actor_id) {
        sendUserNameInfo(actor_id);
        sendSeatInfo(actor_id);
        sendCountDown(actor_id);
        sendRoundStatus(actor_id);
        sendCard(actor_id);
        sendDealerInfo(actor_id);
        sendBetLimitation(actor_id);

        ProtocolHandler.sendRoundID(this, actor_id);
        ProtocolHandler.sendRoadMap(this, actor_id, getRoadMapStr());
    }

    private void sendBetLimitation(long actor_id){
        BetLimitation.Info info = BetLimitation.getInfo(ActorBase.getUserID(actor_id));

        ProtocolData protocolData = new ProtocolData();
        protocolData.Action = "BetLimitation";
        protocolData.Data = GsonObject.toJson(info, BetLimitation.Info.class);

//        玩家下注限額資訊: BetLimitation: {"BL":0,"BH":1000000,"P":1000000,"T":1000000};
        ProtocolHandler.sendMessage(actor_id, protocolData);
    }

    @Override
    public void takeSeat(long actor_id, int seat_id) {
        if(seat_id<1) {
            ProtocolHandler.sendTakeSeatResult(actor_id, seat_id, 0);
            return;
        }
        if(seat_id>(_seats.size()-1)){
            ProtocolHandler.sendTakeSeatResult(actor_id, seat_id, 0);
            return;
        }

//result:         0:無此房間
//                1:入座成功
//                2:座位已有玩家
        if(!_viewers.containsKey(actor_id)){
            ProtocolHandler.sendTakeSeatResult(actor_id, seat_id, 0);
            return;
        }

        if(_seats.get(seat_id).getActorID() > 0){
            ProtocolHandler.sendTakeSeatResult(actor_id, seat_id, 2);
            return;
        }

        for(int i=0; i < _seats.size(); i++)
        if(_seats.get(i).getActorID() == actor_id){
            ProtocolHandler.sendTakeSeatResult(actor_id, seat_id, 2);
            return;
        }

        _seats.get(seat_id).takeSeat(actor_id);

        if(_viewers.containsKey(actor_id))
        if(_viewers.get(actor_id).getBetInfo().size()>0){
            Map<CardTypes, BetInfo> betInfoMap = _viewers.get(actor_id).getBetInfo();

            for(BetInfo betInfo : betInfoMap.values())
                _seats.get(seat_id).bet(betInfo.getAmount(), betInfo.Area, false);
        }

        ProtocolHandler.sendTakeSeatResult(actor_id, seat_id, 1);

        kickViewer(actor_id);
        sendSeatInfo(0);

        AccountData accountData = ActorManager.getActor(actor_id).getAccount();
        ProtocolHandler.sendUserName(this, 0, accountData.UserName, accountData.UserID);
    }

    public int getSeatID(long actor_id){
        for(int i=0; i<_seats.size(); i++)
        if(_seats.get(i).getActorID()==actor_id)
            return i;

        return 0;
    }

    public boolean checkPlaceBetAmount(long actor_id, int amount, Map<CardTypes, BetInfo> whole_bet_info){
        int result = 0;

        if((_min_bet > 0) || (_max_bet > 0)) {

            //Player
            if(getSeatID(actor_id) > 0) {
                if (amount < _min_bet)
                    result = 6;
                if (amount > _max_bet)
                    result = 6;

//                0317
//                EX：後臺設定投注限紅為10000-500000
//                莊閒最高限額＝500000
//                對子最高限額＝500000*0.1666＝83300
//                和局最高限額＝500000*0.2=100000

                CardTypes checkType = CardTypes.None;

                if(whole_bet_info.containsKey(CardTypes.PlayerPairs))
                    checkType = CardTypes.PlayerPairs;
                if(whole_bet_info.containsKey(CardTypes.BankerPairs))
                    checkType = CardTypes.BankerPairs;
                if(whole_bet_info.containsKey(CardTypes.AnyPairs))
                    checkType = CardTypes.AnyPairs;

                if(checkType!=CardTypes.None)
                if(whole_bet_info.get(checkType).getAmount() > (_max_bet * 0.1666))
                    result = 6;

                if(whole_bet_info.containsKey(CardTypes.Draw))
                if(whole_bet_info.get(CardTypes.Draw).getAmount() > (_max_bet * 0.2))
                    result = 6;

            }else {
            //Viewer
                //check additional bet limitation if viewer

                if (!BetLimitation.checkBetAmountValid(ActorBase.getUserID(actor_id), whole_bet_info, amount))
                    result = 6;
            }
        }

        if(getStatus()!=Status.DealCard)
            result = 3;

//        請求下注: PlaceBet: {UserID:001, BetArea: 1, Amount:10, Result:1}
//        Result: 1:成功
//                2:餘額不足
//                3:非可下注時間
//                4:無效下注區
//                5:下注失敗(API Error)
//                6:無效下注額
        int user_id = ActorManager.getActor(actor_id).UserID();
        if(result!=0) {
            ProtocolData protocol = new ProtocolData("PlaceBet");
            JsonObject jsonObject = new JsonObject();
            jsonObject.addProperty("UserID", user_id);
            jsonObject.addProperty("SeatID", getSeatID(actor_id));
            jsonObject.addProperty("BetArea", CardTypes.None.getValue());
            jsonObject.addProperty("Amount", amount);
            jsonObject.addProperty("Result", result);

            protocol.Data = jsonObject.toString();
            ProtocolHandler.sendMessage(actor_id, protocol);
            return false;
        }

        return true;
    }

    public boolean checkPlaceBet(long actor_id, CardTypes betArea){
        int result = 0;

        if(betArea==CardTypes.None)
            result = 4;

        if(getStatus()!=Status.DealCard)
            result = 3;

//        請求下注: PlaceBet: {UserID:001, BetArea: 1, Amount:10, Result:1}
//        Result: 1:成功
//                2:餘額不足
//                3:非可下注時間
//                4:無效下注區
//                5:下注失敗(API Error)
//                6:無效下注額
        int user_id = ActorManager.getActor(actor_id).UserID();
        if(result!=0) {
            ProtocolData protocol = new ProtocolData("PlaceBet");
            JsonObject jsonObject = new JsonObject();
            jsonObject.addProperty("UserID", user_id);
            jsonObject.addProperty("SeatID", getSeatID(actor_id));
            jsonObject.addProperty("BetArea", betArea.getValue());
            jsonObject.addProperty("Amount", 0);
            jsonObject.addProperty("Result", result);

            protocol.Data = jsonObject.toString();
            ProtocolHandler.sendMessage(actor_id, protocol);
            return false;
        }

        return true;
    }

    public int getPlayerBet(long actor_id){
        int result  =0;

        if(actor_id == 0)
            return 0 ;

        List<BaccaratViewer> players = getPlayers();

        for(BaccaratViewer viewer : players)
        if(viewer.getActorID() == actor_id)
            result += viewer.getTotalBet();

        return result;
    }

    public Map<CardTypes, BetInfo> getPlayerBetInfo(long actor_id, SimpleBetInfo simpleBetInfo){
        Map<CardTypes, BetInfo> result = new HashMap<>();

        if(actor_id == 0)
            return result;

        List<BaccaratViewer> players = getPlayers();

        for(BaccaratViewer viewer : players)
        if(viewer.getActorID() == actor_id) {
            Map<CardTypes, BetInfo> betInfoMap = viewer.getBetInfo();

            for(CardTypes type : betInfoMap.keySet())
                result.put(type, new BetInfo(type, betInfoMap.get(type).getAmount()));
        }

        for(int i=0; i<simpleBetInfo.Bets.size(); i++)
        {
            CardTypes area = simpleBetInfo.Bets.get(i).Area;
            if(!result.containsKey(area))
                result.put(area, new BetInfo(area, 0));

            result.get(area).addAmount(simpleBetInfo.Bets.get(i).getAmount());
        }

        return result;
    }

    @Override
    public void requestPlaceBet(long actor_id, JsonObject recv_jsonObject) {
        JsonArray jsonArray = recv_jsonObject.get("Bet").getAsJsonArray();
        int hide = recv_jsonObject.get("Hide").getAsInt();
        int pass = recv_jsonObject.get("Pass").getAsInt();

        SimpleBetInfo simpleBetInfo = new SimpleBetInfo(getType(), getRoomID(), actor_id, 0, hide);

        int total_amount = 0;

        for(int i=0; i<jsonArray.size(); i++) {
            JsonObject jsonObject = jsonArray.get(i).getAsJsonObject();

            int betArea_id = jsonObject.get("BetArea").getAsInt();
            int amount = jsonObject.get("Amount").getAsInt();

            CardTypes betArea = CardTypes.get(betArea_id);
            if(!checkPlaceBet(actor_id, betArea))
                return;

            CardTypes betType = CardTypes.get(betArea_id);

            simpleBetInfo.Bets.add(new BetInfo(betType, amount));
            total_amount += amount;
        }

        if (!checkPlaceBetAmount(actor_id, total_amount + getPlayerBet(actor_id), getPlayerBetInfo(actor_id, simpleBetInfo)))
            return;

        Entry.Instance().Exchange(actor_id, 0, total_amount, new ExchangeRatio(1, 1), simpleBetInfo, Entry.OPCODE_BETTING);
    }

    @Override
    public void onExchange(AccOperationResult operationResult, long actor_id, int amount, SimpleRoomInfo info) {
        SimpleBetInfo betInfo = (SimpleBetInfo) info;

        ProtocolData protocolData = new ProtocolData("PlaceBet");
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("UserID", ActorBase.getUserID(betInfo.ActorID));
        jsonObject.addProperty("SeatID", getSeatID(actor_id));

        if (operationResult == AccOperationResult.NotEnoughBalance) {
            jsonObject.addProperty("Result", 2);
            protocolData.Data = jsonObject.toString();
            ProtocolHandler.sendMessage(actor_id, protocolData);
            return;
        }

        if (operationResult != AccOperationResult.Success) {
            jsonObject.addProperty("Result", 5);
            protocolData.Data = jsonObject.toString();
            ProtocolHandler.sendMessage(actor_id, protocolData);
            return;
        }

        for(int bet_index=0; bet_index<betInfo.Bets.size(); bet_index++) {
            CardTypes betArea = betInfo.Bets.get(bet_index).Area;

            if (!checkPlaceBet(actor_id, betArea)) {
                Entry.Instance().Recompensate(actor_id, 0, amount, new ExchangeRatio(1, 1), null, Entry.OPCODE_RETURN);
                return;
            }
        }

        for(int bet_index=0; bet_index<betInfo.Bets.size(); bet_index++) {
            CardTypes BetArea = betInfo.Bets.get(bet_index).Area;
            int bet_amount = betInfo.Bets.get(bet_index).getAmount();

            protocolData = new ProtocolData("PlaceBet");
            jsonObject = new JsonObject();

            jsonObject.addProperty("UserID", ActorBase.getUserID(betInfo.ActorID));
            jsonObject.addProperty("SeatID", getSeatID(actor_id));
            jsonObject.addProperty("BetArea", BetArea.getValue());
            jsonObject.addProperty("Amount", bet_amount);
            jsonObject.addProperty("Hide", ((SimpleBetInfo) info).Hide);
            jsonObject.addProperty("Pass", 0);
            jsonObject.addProperty("Result", 1);
            protocolData.Data = jsonObject.toString();

            int seat_id = getSeatID(actor_id);

            if(seat_id > 0){
                //            請求下注: PlaceBet: {UserID:001, BetArea: 1, Amount:10, Result:1}
//            Result: 1:成功
//                    2:餘額不足
//                    3:非可下注時間
//                    4:無效下注區
//                    5:下注失敗(API Error)
                ProtocolHandler.broadcastMessage(this, protocolData);
                _seats.get(seat_id).bet(bet_amount, BetArea, ((SimpleBetInfo) info).Hide > 0);
                continue;
            }

            if (_viewers.containsKey(actor_id)) {
                ProtocolHandler.sendMessage(actor_id, protocolData);
                _viewers.get(actor_id).bet(bet_amount, BetArea, ((SimpleBetInfo) info).Hide > 0);
            }
        }
    }

    @Override
    public void onChangeDealer() {
        sendDealerInfo(0);
    }

    @Override
    public void sendCountDown(long actor_id){
        if(getStatus()!=Status.DealCard)
            return;

        int remain_tick = Status.DealCard.getDuration();

        long elapsed_tick = System.currentTimeMillis() - _tick_begin_deal_card;

        remain_tick -= elapsed_tick;

        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("RemainTick", remain_tick);

//        開始下注: CountDown: {"RemainTick":25000}
        ProtocolData protocolData = new ProtocolData("CountDown", jsonObject.toString());

        if(actor_id==0)
            ProtocolHandler.broadcastMessage(this, protocolData);
        else
            ProtocolHandler.sendMessage(actor_id, protocolData);
    }

    @Override
    public void updateRoom() {
        update();
    }

    @Override
    public void scanner_input(int device_id, PokerCard.Card card) {
        receive_card(device_id, card);
    }

    @Override
    public void dealCard() {
        super.dealCard();

        _tick_begin_deal_card = System.currentTimeMillis();
        sendCountDown(0);
    }

    @Override
    public void onSetCard(int device_id, PokerCard.Card card) {
        super.onSetCard(device_id, card);
        sendCard(0, device_id);
    }

    @Override
    public void onBroadCastResult(List<CardTypes> hit_types) {
        super.onBroadCastResult(hit_types);

        List<CardTypes> win_areas = hit_types;

        JsonArray json_hit_areas = new JsonArray();
        JsonArray json_winners = new JsonArray();

        Map<Integer, BetRecord> betRecords = new HashMap<>();

        BetRecord record = null;

        List<BaccaratViewer> players = getPlayers();

        for(int i=0; i<players.size(); i++){
            record = new BetRecord();
            record.ActorID = players.get(i).getActorID();

            if(players.get(i) instanceof BaccaratSeat)
                record.SeatID = ((BaccaratSeat)players.get(i)).getSeatID();

            if(players.get(i) instanceof GodOfGamblerSeat)
                record.Note = ((GodOfGamblerSeat)players.get(i)).getNote().name();

            record.UserID = players.get(i).getUserID();

            record.BetArea = new HashMap<>();
            record.BetArea.putAll(players.get(i).getBetInfo());

            betRecords.put(record.UserID, record);
        }

        for(int index_area=0; index_area<win_areas.size(); index_area++) {
            JsonObject json_hit_area = new JsonObject();

            json_hit_area.addProperty("HitArea", win_areas.get(index_area).getValue());
            json_hit_areas.add(json_hit_area);

            CardTypes win_area = win_areas.get(index_area);

            for (int i = 0; i < players.size(); i++)
            if (players.get(i).getActorID() > 0)
            if (players.get(i).getBetInfo().containsKey(win_area)) {
                BetInfo betInfo = players.get(i).getBetInfo().get(win_area);

                JsonObject winner = new JsonObject();

                if(players.get(i) instanceof BaccaratSeat)
                    winner.addProperty("SeatID", ((BaccaratSeat)players.get(i)).getSeatID());
                else
                    winner.addProperty("SeatID", 0);

                double ratio = win_area.getWinRatio();

                int banker_point = Cards.TableCards.get(3).Point + Cards.TableCards.get(4).Point + Cards.TableCards.get(6).Point;

                if(win_area==CardTypes.BankerWin)
                if(banker_point==6)
                    ratio = 0.5;

                int WinMoney = (int)(betInfo.getAmount() + betInfo.getAmount() * ratio);

                winner.addProperty("UserID", players.get(i).getUserID());
                winner.addProperty("HitArea", win_area.getValue());
                winner.addProperty("BetAmount", betInfo.getAmount());
                winner.addProperty("WinMoney", WinMoney);

                record = betRecords.get(players.get(i).getUserID());
                record.HitArea.put(win_area, new BetInfo(win_area, WinMoney));

                record.WinMoney += WinMoney;
                json_winners.add(winner);
            }
        }

        //和局時 押莊閒玩家須退還本金
        if(win_areas.contains(CardTypes.Draw)){
            for(BetRecord bet : betRecords.values()){
                if(bet.BetArea.containsKey(CardTypes.BankerWin)) {
                    int bet_amount = bet.BetArea.get(CardTypes.BankerWin).getAmount();
                    bet.WinMoney += bet_amount;

                    bet.HitArea.put(CardTypes.BankerWin, new BetInfo(CardTypes.BankerWin, bet_amount));

                    JsonObject winner = new JsonObject();
                    winner.addProperty("UserID", bet.UserID);
                    winner.addProperty("HitArea", CardTypes.BankerWin.getValue());
                    winner.addProperty("BetAmount", bet_amount);
                    winner.addProperty("WinMoney", bet_amount);
                    json_winners.add(winner);
                }
                if(bet.BetArea.containsKey(CardTypes.PlayerWin)) {
                    int bet_amount = bet.BetArea.get(CardTypes.PlayerWin).getAmount();
                    bet.WinMoney += bet_amount;

                    bet.HitArea.put(CardTypes.PlayerWin, new BetInfo(CardTypes.PlayerWin, bet_amount));

                    JsonObject winner = new JsonObject();
                    winner.addProperty("UserID", bet.UserID);
                    winner.addProperty("HitArea", CardTypes.PlayerWin.getValue());
                    winner.addProperty("BetAmount", bet_amount);
                    winner.addProperty("WinMoney", bet_amount);
                    json_winners.add(winner);
                }
            }
        }

        ProtocolData protocolData = null;

//        廣播牌局結果:GameResult: {"hit_areas":[{"HitArea":2}],"winners":[{"SeatID":1,"UserID":1,"HitArea":2,"WinMoney":20}]}
        JsonObject winner_info = new JsonObject();
        winner_info.add("hit_areas", json_hit_areas);
        winner_info.add("winners", json_winners);
        String json_str = winner_info.toString();
        protocolData = new ProtocolData("GameResult");
        protocolData.Data = json_str;
        ProtocolHandler.broadcastMessage(this, protocolData);


//        廣播路紙: RoadMap: {MapStr:"33-5, 22-5"}
        ProtocolHandler.sendRoadMap(this, 0, getRoadMapStr());

        onBroadCastWinnerInfo(hit_types, betRecords);
    }

    public void onClearBet(){
        for(int i=0; i<_seats.size(); i++)
            _seats.get(i).clearBet();

        for(BaccaratViewer viewer : _viewers.values())
            viewer.clearBet();
    }

    public void onReturnBet(){
        for(int i=0; i<_seats.size(); i++)
            _seats.get(i).onReturnBet();

        for(BaccaratViewer viewer : _viewers.values())
            viewer.onReturnBet();
    }

    @Override
    public void onBroadCastWinnerInfo(List<CardTypes> hit_types, Map<Integer, BetRecord> betResult) {
        super.onBroadCastWinnerInfo(hit_types, betResult);

        for(BetRecord betRecord : betResult.values()){
            int totalBet = 0;

            for(BetInfo betInfo : betRecord.BetArea.values())
                totalBet += betInfo.getAmount();

            if(totalBet<=0)
                continue;

            int payoff = betRecord.WinMoney > 0 ? betRecord.WinMoney : 0;

            Entry.Instance().addBetLog(betRecord.ActorID, getRoundID(), WagersType.ViewerBet.getValue(), totalBet, getRoomID(), totalBet, betRecord.WinMoney, "");

            if(payoff > 0)
                Entry.Instance().Recompensate(betRecord.ActorID, 0, betRecord.WinMoney, new ExchangeRatio(1, 1), null, Entry.OPCODE_PAYOFF);
        }
    }

    @Override
    protected void roundStart() {
        super.roundStart();

        ProtocolHandler.sendRoundID(this, 0);
    }

    @Override
    public void roundOver() {
        super.roundOver();

        onClearBet();

        _tick_begin_deal_card = 0;
    }

    @Override
    public void cancelRound() {
        super.cancelRound();

        ProtocolHandler.broadcastRevokeRound(this);
    }

    @Override
    protected void onClearRoadMap() {
        super.onClearRoadMap();

        ProtocolHandler.broadcastClearRoadMap(this);
    }
}

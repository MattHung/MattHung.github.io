package com.games.baccarat.room;

import com.eject.custom.types.AccOperationResult;
import com.eject.custom.types.ExchangeRatio;
import com.eject.interop.ActorBase;
import com.eject.interop.ProtocolData;
import com.games.baccarat.Entry;
import com.games.baccarat.ProtocolHandler;
import com.games.baccarat.ScannerReceiver;
import com.games.baccarat.record.TableRecord;
import com.games.baccarat.seat.BaccaratSeat;
import com.games.baccarat.seat.BaccaratViewer;
import com.games.baccarat.seat.GodOfGamblerSeat;
import com.games.baccarat.types.*;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import java.util.*;

/**
 * Created by matt1201 on 2016/12/21.
 */
public class Baccarat_GodOfGambler extends Baccarat {
    private int _hand_chips = 0;
//    private int _session_id = 0;
    private SessionSetting _setting;
    private GodOfGambler _session;
    private RoundRecord _round_record = new RoundRecord();

    public RoundRecord getRoundRecord(){return _round_record;}

    public GodOfGambler getSession(){return _session;}
    public int getSessionID(){return _session.getRoomID();}

    @Override
    public RoomTypes getType() {
        return RoomTypes.GodOfGambler;
    }

    @Override
    public int getRoundID() {
        return _session.getRoundID();
    }

    @Override
    public String getRoadMapStr() {
        return _session.getRoadMapStr();
    }

    @Override
    public ShoeInfo getShoeInfo() {
        return _session.getShoeInfo();
    }

    public int getBettedCount(){
        int result = 0;
        for(int i=1; i<=MAX_SEAT_COUNT; i++)
        if(((GodOfGamblerSeat)_seats.get(i)).getLastBetTick() > 0)
            result++;

        return result;
    }

    public Baccarat_GodOfGambler(GodOfGambler session, int room_id, SessionSetting setting) {
        super(room_id, setting.MinBet, setting.MaxBet);

        _setting = setting;
        _session = session;
        _hand_chips = setting.Initial_chips;
        initialSeats();
    }

    private void initialSeats(){
        _seats = new LinkedList<>();

        _seats.add(new GodOfGamblerSeat(this, 0));
        for(int i=1; i<=MAX_SEAT_COUNT; i++)
            _seats.add(new GodOfGamblerSeat(this, i));
    }

    public void initialChips(){
        for(int i=1; i<_seats.size(); i++) {
            GodOfGamblerSeat seat = getGamblerSeat(i);

            if(seat.getActorID()<=0)
                continue;

            seat.initialChips(_hand_chips);
        }
    }

    public GodOfGamblerSeat getGamblerSeat(int seat_id){
        if(seat_id<1)
            return null;
        if(seat_id>_seats.size()-1)
            return null;

        return (GodOfGamblerSeat)_seats.get(seat_id);
    }

    @Override
    public void takeSeat(long actor_id, int seat_id) {
        super.takeSeat(actor_id, seat_id);

        ScannerReceiver.pushParticipateMessage(getSessionID(), _session.getOnlinePlayerCount(),
                _session.getSetting().Max_enroll_count);
    }

    @Override
    public boolean leaveRoom(long actor_id, LeaveCause cause) {
        boolean result = super.leaveRoom(actor_id, cause);

        ScannerReceiver.pushParticipateMessage(getSessionID(), _session.getOnlinePlayerCount(),
                _session.getSetting().Max_enroll_count);

        return result;
    }

    @Override
    public void NextStatus() {}

    @Override
    protected void roundStart() {
        _round_record.clear();

        sendChipInfo(0);

        for(int i=1; i<_seats.size(); i++) {
            GodOfGamblerSeat seat = getGamblerSeat(i);

            if(seat.getActorID()<=0)
                continue;

            GodOfGambler.ParticipateInfo info = _session.getParticipator(seat.getUserID());

            if(info ==null)
                continue;
            seat.sendBetControlInfo();
        }
    }

    public boolean containsUser(int user_id){
        if(user_id==0)
            return false;

        for(int i=1; i<=MAX_SEAT_COUNT; i++)
        if(_seats.get(i).getUserID() == user_id)
            return true;

        return false;
    }

    public boolean restoreSession(long actor_id){
        for(int i=1; i<=MAX_SEAT_COUNT; i++)
        if(_seats.get(i).getActorID() == actor_id) {
            GodOfGamblerSeat seat = getGamblerSeat(i);
            seat.setOnline(true);

            ProtocolHandler.sendRoomList(actor_id, (byte)getType().getValue());

//            進入房間結果 : EnterRoom: { Result: 1, RoomID: 10001, TableID:0}
//                1:成功
            ProtocolHandler.sendEnterResult(actor_id, getSessionID(), getRoomID(), 1, true, false);

//            請求入座結果 : TakeSeat: {SeatID:1, Result:1}
//result:         0:無此房間
//                1:入座成功

            sendRoomInfo(actor_id);
            seat.sendBetControlInfo();
            ProtocolHandler.sendTakeSeatResult(actor_id, _seats.get(i).getSeatID(), 1);
            return true;
        }

        return false;
    }

    public void updateBetControlCount(int user_id, int hide_count, int pass_count){
        _session.getParticipator(user_id).BET_HIDE_COUNT = hide_count;
        _session.getParticipator(user_id).BET_PASS_COUNT = pass_count;
    }

    public void updateParticipatorBet(int user_id, int bet_amount){
        _session.getParticipator(user_id).TOTAL_BET += bet_amount;
    }

    private void postPoneCheckBetLog(){
        long current_tick = System.currentTimeMillis();

        for(int i=1; i<=MAX_SEAT_COUNT; i++){
            BaccaratSeat seat = _seats.get(i);

            if(seat.getActorID() <=0)
                continue;

            long elapsed_tick = (current_tick - ((GodOfGamblerSeat)seat).Last_postpone_bet_check_tick);

            if(elapsed_tick > GodOfGambler.POSTPONT_REQUEST_INTERVAL) {
                Entry.Instance().postPoneCheckBetLog(seat.getActorID());
                ((GodOfGamblerSeat)seat).Last_postpone_bet_check_tick = current_tick;
            }
        }
    }

    @Override
    protected void onIntervalUpdate() {
        super.onIntervalUpdate();
        postPoneCheckBetLog();
    }

    @Override
    protected void onBroadcastCardPoint(List<CardTypes> hit_types) {}

    @Override
    public void roundOver() {
        super.roundOver();

        List<BaccaratViewer> players = getPlayers();

        for(int i=0; i<players.size(); i++)
            Entry.Instance().AddScore(players.get(i).getActorID(), 0);
    }

    public void broadcastMergeTable(int sourceTableID){
//        廣播併桌訊息: MergeTable : {"RoomID":1001, "SourceTable":1000, "DestTable":1001}
        ProtocolData protocolData = new ProtocolData("MergeTable");

        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("RoomID", getSessionID());
        jsonObject.addProperty("SourceTable", sourceTableID);
        jsonObject.addProperty("DestTable", getRoomID());

        protocolData.Data = jsonObject.toString();
        ProtocolHandler.broadcastMessage(this, protocolData);

        List<BaccaratViewer> players = getPlayers();
    }

    public void SetStatus(Status status){
        _status = status;

        switch (getStatus()){
            case Reset:
                break;
            case RoundStart:
                roundStart();
                break;
            case DealCard:
                dealCard();
                break;
            case CheckResult:
                break;
            case RoundOver:
                roundOver();
                break;
        }

        sendRoundStatus(0);
    }

    @Override
    public void enterRoom(long actor_id) {
        int user_id = ActorBase.getUserID(actor_id);

//        2:已在房間內
        for(BaccaratViewer viewer : _viewers.values())
        if(viewer.getUserID()==user_id) {
            ProtocolHandler.sendEnterResult(actor_id, getSessionID(), 2);
            return;
        }

//        2:已在房間內
        for(int i=0; i<_seats.size(); i++)
        if(_seats.get(i).getUserID()==user_id){
            ProtocolHandler.sendEnterResult(actor_id, getSessionID(), 2);
            return;
        }

        _viewers.put(actor_id, new BaccaratViewer(this, actor_id));
        ProtocolHandler.sendEnterResult(actor_id, getSessionID(), getRoomID(), 1, false, !getSession().getIsRunning());

        sendRoomInfo(actor_id);
    }

    @Override
    public void sendRoomInfo(long actor_id) {
        super.sendRoomInfo(actor_id);
        sendChipInfo(actor_id);
    }

    public void sendChipInfo(long actor_id){
        List<BaccaratSeat> seats = getSeats();
        for(int i=1; i<seats.size(); i++) {
            ProtocolData protocolData = new ProtocolData("ChipInfo");

            JsonObject jsonObject = new JsonObject();
            jsonObject.addProperty("SeatID", seats.get(i).getSeatID());
            jsonObject.addProperty("User", seats.get(i).getUserID());
            jsonObject.addProperty("Chips", ((GodOfGamblerSeat)seats.get(i)).getChips());

            protocolData.Data = jsonObject.toString();

            if(actor_id>0)
                ProtocolHandler.sendMessage(actor_id, protocolData);
            else
                ProtocolHandler.broadcastMessage(this, protocolData);
        }
    }

    @Override
    public boolean receive_card(int device_id, PokerCard.Card card) {
        if(getStatus()!=Status.CheckResult)
            return false;

        if(Cards.TableCards.get(device_id)!=null)
            return false;

        onSetCard(device_id, card);
        recordCards();
        return true;
    }

    protected void recordCards(){
        _round_record.Cards.clear();
        for(int i=0; i < Cards.TableCards.size(); i++)
        if(Cards.TableCards.get(i)!=null)
            _round_record.Cards.add(Cards.TableCards.get(i));
    }

    public void clearChips(){
        for(int i=1; i < _seats.size(); i++)
            ((GodOfGamblerSeat)_seats.get(i)).clearChips();
    }

    public int getHaveChipPlayerCount(){
        int result = 0;

        for(int i=0; i < _seats.size(); i++)
        if(((GodOfGamblerSeat)_seats.get(i)).getChips() > 0)
            result ++;

        return result;
    }

    @Override
    public void onBroadCastWinnerInfo(List<CardTypes> hit_types, Map<Integer, BetRecord> betResult) {
        _round_record.PlayerBet = betResult;
        _round_record.HitArea = hit_types;
        _round_record.player_point = Cards.getPlayerPoint();
        _round_record.banker_point = Cards.getBankerPoint();

        recordCards();

        for(BetRecord betRecord : betResult.values()){
            int totalBet = 0;

            for(BetInfo betInfo : betRecord.BetArea.values())
                totalBet += betInfo.getAmount();

            if(totalBet<=0)
                continue;

            //座位上的玩家 增加籌碼
            if(betRecord.SeatID !=0) {
                if (betRecord.WinMoney > 0)
                    ((GodOfGamblerSeat) _seats.get(betRecord.SeatID)).addChips(betRecord.WinMoney);

                continue;
            }

            TableRecord tableRecord = new TableRecord();
            //record table id
            tableRecord.TableID = RoomID();
            tableRecord.player_point = _round_record.player_point;
            tableRecord.banker_point = _round_record.banker_point;

            //record cards
            for(PokerCard.Card card :_round_record.Cards)
                tableRecord.Cards.add(card.ID);

            //record hit area
            tableRecord.HitAreas = _round_record.HitArea;

            JsonObject jsonObject = new JsonObject();
            jsonObject.add("BetRecord", GodOfGambler.GsonObject.toJsonTree(betRecord));
            jsonObject.add("TableRecord", GodOfGambler.GsonObject.toJsonTree(tableRecord));

            int payoff = betRecord.WinMoney > 0 ? betRecord.WinMoney : 0;

            double Commissionable = 0;

            for(BetInfo betInfo : betRecord.BetArea.values()) {
                if (betRecord.HitArea.containsKey(betInfo.Area))
                if (betRecord.BetArea.get(betInfo.Area).getAmount() == betRecord.HitArea.get(betInfo.Area).getAmount())
                    continue;

                Commissionable+= betRecord.BetArea.get(betInfo.Area).getAmount();
            }

            Entry.Instance().addBetLog(betRecord.ActorID, getRoundID(), WagersType.ViewerBet.getValue(), Commissionable,
                    getSessionID(), totalBet, betRecord.WinMoney, jsonObject.toString());

            //旁觀者 洗分
            if(payoff > 0)
                Entry.Instance().Recompensate(betRecord.ActorID, 0, betRecord.WinMoney, new ExchangeRatio(1, 1), null, Entry.OPCODE_PAYOFF);

            _viewers.get(betRecord.ActorID).clearBet();
        }
    }

    private int preCheckBet(JsonArray jsonArray, int seat_id) {
        boolean bet_banker = false;
        boolean bet_player = false;

        for (int i = 0; i < jsonArray.size(); i++) {
            JsonObject jsonObject = jsonArray.get(i).getAsJsonObject();
            int betArea_id = jsonObject.get("BetArea").getAsInt();
            int amount = jsonObject.get("Amount").getAsInt();

            if(CardTypes.get(betArea_id) == CardTypes.BankerWin)
                bet_banker = true;

            if(CardTypes.get(betArea_id) == CardTypes.PlayerWin)
                bet_player = true;
        }

        Map<CardTypes, BetInfo> table_bet = _seats.get(seat_id).getBetInfo();

        for(CardTypes bet_area : table_bet.keySet()){
            if(bet_area == CardTypes.BankerWin)
                bet_banker = true;
            if(bet_area == CardTypes.PlayerWin)
                bet_player = true;
        }

        if(bet_banker)
        if(bet_player)
            return 11;

        if(!bet_banker)
        if(!bet_player)
            return 12;

        return 0;
    }

    public void onViewerRequestPlaceBet(long actor_id, JsonObject recv_jsonObject) {
        JsonArray jsonArray = recv_jsonObject.get("Bet").getAsJsonArray();
        int hide = recv_jsonObject.get("Hide").getAsInt();
        int pass = recv_jsonObject.get("Pass").getAsInt();

        SimpleBetInfo simpleBetInfo = new SimpleBetInfo(getType(), getSessionID(), actor_id, 0, hide);
        simpleBetInfo.TableID = getRoomID();

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
    public void requestPlaceBet(long actor_id, JsonObject recv_jsonObject) {
        int seat_id = getSeatID(actor_id);
        if(seat_id==0) {
            onViewerRequestPlaceBet(actor_id, recv_jsonObject);
            return;
        }

        int user_id = getSeats().get(seat_id).getUserID();

//        請求下注: PlaceBet: {UserID:001, BetArea: 1, Amount:10, Result:1}
//        Result: 1:成功
//                2:餘額不足
//                3:非可下注時間
//                4:無效下注區
//                5:下注失敗(API Error)
//                6:無效下注額
//
//                11:不可同時下注莊家與閒家
//                12:至少需要下注莊家或閒家

        JsonArray jsonArray = recv_jsonObject.get("Bet").getAsJsonArray();
        int hide = recv_jsonObject.get("Hide").getAsInt();
        int pass = recv_jsonObject.get("Pass").getAsInt();

        JsonObject jsonObject = null;

        ProtocolData protocol = new ProtocolData("PlaceBet");
        jsonObject = new JsonObject();

        if(pass > 0){
            ((GodOfGamblerSeat)_seats.get(seat_id)).pass(false);
            jsonObject.addProperty("UserID", user_id);
            jsonObject.addProperty("SeatID", seat_id);
            jsonObject.addProperty("BetArea", 0);
            jsonObject.addProperty("Hide", hide);
            jsonObject.addProperty("Pass", pass);
            jsonObject.addProperty("Amount", 0);
            jsonObject.addProperty("Result", 1);
            protocol.Data = jsonObject.toString();
            ProtocolHandler.broadcastMessage(this, protocol);
            return;
        }

//        if(getGamblerSeat(seat_id).getBetInfo().size() > 0)
//            return;

        CardTypes betArea;
        int amount = 0;

        int total_amount = 0;

        SimpleBetInfo simpleBetInfo = new SimpleBetInfo(getType(), getSessionID(), actor_id, getSeatID(actor_id), hide);
        simpleBetInfo.TableID = getRoomID();

        for(int i=0; i<jsonArray.size(); i++) {
            jsonObject = jsonArray.get(i).getAsJsonObject();
            int betArea_id = jsonObject.get("BetArea").getAsInt();
            amount = jsonObject.get("Amount").getAsInt();

            betArea = CardTypes.get(betArea_id);

            if(hide>1)
                hide = 1;

            if(!checkPlaceBet(actor_id, betArea))
                return;

            total_amount += amount;
            simpleBetInfo.Bets.add(new BetInfo(betArea, amount));
        }

        if(simpleBetInfo.Bets.size() <=0)
            return;

//        2:餘額不足
        if(getGamblerSeat(seat_id).getChips() < total_amount) {
            ProtocolHandler.sendPlaceBetResult(this, actor_id, user_id, seat_id, CardTypes.None, total_amount, 2);
            return;
        }

//        6:無效下注額
        if(!checkPlaceBetAmount(actor_id, total_amount + getGamblerSeat(seat_id).getTotalBet(), getPlayerBetInfo(actor_id, simpleBetInfo)))
            return;

        int pre_check_result = preCheckBet(jsonArray, seat_id);

        if(pre_check_result >0){
            ProtocolHandler.sendPlaceBetResult(this, actor_id, user_id, seat_id, CardTypes.None, total_amount, pre_check_result);
            return;
        }

        if(total_amount>0)
            onExchange(AccOperationResult.Success, actor_id, total_amount, simpleBetInfo);
    }

    public void kickIdle(){
        for(int i= 1; i<_seats.size(); i++) {
            GodOfGamblerSeat seat = ((GodOfGamblerSeat) _seats.get(i));
            if (seat.getActorID() <= 0)
                continue;
            if (seat.getPassed())
                continue;
            if (seat.getBetInfo().size() > 0)
                continue;

            if (seat.getBetPassCount() <= 0) {
                _session.checkRank(_seats.get(i).getActorID(), LeaveCause.KickIdle);
                leaveRoom(_seats.get(i).getActorID(), LeaveCause.KickIdle);
            }
        }
    }

    public void checkPassRound(){
        for(int i= 1; i<_seats.size(); i++) {
            GodOfGamblerSeat seat = ((GodOfGamblerSeat) _seats.get(i));
            if(seat.getActorID() <=0)
                continue;
            if(seat.getPassed())
                continue;
            if(seat.getBetInfo().size() > 0)
                continue;

            seat.pass(true);

            int user_id = seat.getUserID();
            int seat_id = seat.getSeatID();

            ProtocolData protocol = new ProtocolData("PlaceBet");
            JsonObject jsonObject = new JsonObject();
            jsonObject.addProperty("UserID", user_id);
            jsonObject.addProperty("SeatID", seat_id);
            jsonObject.addProperty("BetArea", 0);
            jsonObject.addProperty("Hide", 0);
            jsonObject.addProperty("Pass", seat.getPassed());
            jsonObject.addProperty("Amount", 0);
            jsonObject.addProperty("Result", 1);
            protocol.Data = jsonObject.toString();
            ProtocolHandler.broadcastMessage(this, protocol);
        }
    }

    @Override
    public void onBroadCastResult(List<CardTypes> hit_types) {
        kickIdle();
        checkPassRound();
        super.onBroadCastResult(hit_types);
    }

    public void kickSeat(int seat_id){
        long actor_id = _seats.get(seat_id).getActorID();
        _session.checkRank(actor_id, LeaveCause.KickSeat);
        leaveSeat(actor_id, LeaveCause.KickSeat);
    }

    public void kickAll(boolean silent){
        List<BaccaratViewer> players = getPlayers();

        for(int i=0;i < players.size(); i++) {
            if(silent)
                RoomManager.silentLeaveRoom(players.get(i).getActorID(), LeaveCause.kickAll);
            else
                RoomManager.leaveRoom(players.get(i).getActorID(), LeaveCause.kickAll);
        }
    }

    @Override
    protected void sendDealerInfo(long actor_id) {
        JsonObject jsonObject = new JsonObject();

        jsonObject.addProperty("Name", ScannerReceiver.getDealerName(getSessionID()));

        ProtocolData protocolData = new ProtocolData();
        protocolData.Action = "DealerInfo";
        protocolData.Data = jsonObject.toString();

//        廣播荷官資訊: DealerInfo: {"Name":"name"};

        if(actor_id==0)
            ProtocolHandler.broadcastMessage(this, protocolData);
        else
            ProtocolHandler.sendMessage(actor_id, protocolData);
    }

    public void kickLoser(){
        List<BaccaratSeat> players = new LinkedList<>(_seats);

        for(int i=players.size()-1; i>=0; i--)
        if(players.get(i).getActorID() <=0)
            players.remove(i);

        players.sort(new Comparator<BaccaratSeat>() {
            @Override
            public int compare(BaccaratSeat o1, BaccaratSeat o2) {
                GodOfGamblerSeat seat1 = (GodOfGamblerSeat)o1;
                GodOfGamblerSeat seat2 = (GodOfGamblerSeat)o2;

                if(seat1.getChips()==seat2.getChips())
                    return (int)(seat1.getTakeSeatTime() - seat2.getTakeSeatTime());

                return seat2.getChips() - seat1.getChips();
            }
        });

        if(players.size()<GodOfGambler.CANDIDATE_PER_TURN)
            return;

        for(int i = players.size() -1; i >= GodOfGambler.CANDIDATE_PER_TURN; i--){
            BaccaratSeat loser = players.get(i);
            _session.checkRank(loser.getActorID(), LeaveCause.KickLoser);
            // 2/22 改成淘汰者直接離房
            leaveRoom(loser.getActorID(), LeaveCause.KickLoser);
//            leaveSeat(loser.getActorID(), LeaveCause.KickLoser);
        }
    }

    @Override
    public void leaveSeat(long actor_id, LeaveCause cause) {
        super.leaveSeat(actor_id, cause);
    }

    @Override
    public void cancelRound() {
        if(_event_next_status!=null)
            Entry.TickEvent.Remove(_event_next_status);

        _event_next_status = null;

        _status = Status.RoundOver;
        clearRound();

        onReturnBet();

        ProtocolHandler.broadcastRevokeRound(this);
    }

    @Override
    protected void onClearRoadMap() {
        super.onClearRoadMap();

        ProtocolHandler.broadcastClearRoadMap(this);
    }
}

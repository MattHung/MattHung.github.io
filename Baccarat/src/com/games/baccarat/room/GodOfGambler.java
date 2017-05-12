package com.games.baccarat.room;

import com.eject.custom.types.AccOperationResult;
import com.eject.custom.types.ExchangeRatio;
import com.eject.interop.ActorBase;
import com.eject.interop.ProtocolData;
import com.eject.widget.DebugMessage;
import com.games.baccarat.Entry;
import com.games.baccarat.ProtocolHandler;
import com.games.baccarat.RankMessage;
import com.games.baccarat.ScannerReceiver;
import com.games.baccarat.actor.ActorManager;
import com.games.baccarat.actor.CustomActor;
import com.games.baccarat.billboard.Billboard_GodGambler;
import com.games.baccarat.record.RoundInfo;
import com.games.baccarat.record.SessionRecord;
import com.games.baccarat.record.TableRecord;
import com.games.baccarat.record.TableRecord_Player;
import com.games.baccarat.seat.BaccaratSeat;
import com.games.baccarat.seat.BaccaratViewer;
import com.games.baccarat.seat.GodOfGamblerSeat;
import com.games.baccarat.types.*;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import java.sql.Time;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Created by matt1201 on 2016/12/21.
 */
public class GodOfGambler extends BaccaratBase implements IBaccaratRoom{

    public enum SessionStatus{
        Enrolling("Enrolling"),
        WaitForStart("WaitForStart"),
        Running("Running"),
        Over("Over");

        private String _value;
        public String getValue(){return _value;}
        SessionStatus(String value){
            _value = value;
        }
    }

    public static class GamblerPreview extends RoomPreview implements Cloneable{
        public boolean Quit;
        public String Name;
        public String Status;
        public int Type;
        public String StartTime;

        public int PassCount;
        public int HideCount;

        public int SessionID;
        public int RegisterFee;
        public int Service_fee;
        public int Total_Turn;
        public int Turn_Count;
        public int TotalReward;
        public int ChampionReward;
        public int TotalTickets;
//        public int Enabled;
        public List<String> RegisteredPlayers = new LinkedList<>();
        public List<Integer> RankReward = new LinkedList<>();

        public GamblerPreview clone() throws CloneNotSupportedException {
            return (GamblerPreview)super.clone();
        }
    }

    class TableInfo{
        public int TableID;
        public int SeatID;
        public TableInfo(int tableID, int seatID){
            TableID = tableID;
            SeatID = seatID;
        }
    }

    public class ParticipateInfo{
        public int UserID;
        public int TableID;
        public boolean PaidUp;

        public int BET_HIDE_COUNT = 0;
        public int BET_PASS_COUNT = 0;
        public int TOTAL_BET = 0;

        public ParticipateInfo(int user_id){
            UserID = user_id;
            TableID = 0;
            TOTAL_BET = 0;
            PaidUp = false;
        }
    }

    class RankInfo{
        public int Rank;
        public String UserName;
        public int Bonus;

        public RankInfo(int rank, String user_name, int bonus){
            Rank = rank;
            UserName = user_name;
            Bonus = bonus;
        }
    }

    public static final int NEXT_SESSION_TIMEOUT =  10 * 1000;

    public static final int ROUNDS_PER_TURN = 3;
    public static final int CANDIDATE_PER_TURN = 3;
    public static final int POSTPONT_REQUEST_INTERVAL = 50 * 1000;

    public static Gson GsonObject = new Gson();

    private static int PREPAREROOM_IDENTIFY_SITANDGO = 500000000;
    private static int PREPAREROOM_IDENTIFY_TIMESET = 600000000;

    public static boolean checkIsPrepareRoom(int room_id){
        return (room_id >= PREPAREROOM_IDENTIFY_SITANDGO) || (room_id >= PREPAREROOM_IDENTIFY_TIMESET);
    }

    public static SessionSettingType getPrepareRoomType(int room_id){
        if(room_id >= PREPAREROOM_IDENTIFY_TIMESET)
            return SessionSettingType.TimeSet;
        if(room_id >= PREPAREROOM_IDENTIFY_SITANDGO)
            return SessionSettingType.SitAndGo;

        return SessionSettingType.None;
    }

    public static int getPrepareRoomID(int room_id, SessionSettingType type){
        if(checkIsPrepareRoom(room_id))
            return room_id;

        switch (type) {
            case SitAndGo:
                return PREPAREROOM_IDENTIFY_SITANDGO + room_id;
            case TimeSet:
                return PREPAREROOM_IDENTIFY_TIMESET + room_id;
        }

        return 0;
    }

    public static int getSourceRoomID(int room_id){
        SessionSettingType type = getPrepareRoomType(room_id);
        if(type == SessionSettingType.None)
            return room_id;

        switch (type){
            case SitAndGo:
                return room_id - PREPAREROOM_IDENTIFY_SITANDGO;
            case TimeSet:
                return room_id - PREPAREROOM_IDENTIFY_TIMESET;
        }

        return room_id;
    }

    private SessionSetting _setting = new SessionSetting();

    private HashSet<Integer> _enrolled_list = new HashSet<>();
    private Map<Long, Integer> _viewer = new HashMap<>();
    private Map<Integer, Baccarat_GodOfGambler> _tables = new ConcurrentHashMap<>();
    private Map<Integer, ParticipateInfo> _participator = new ConcurrentHashMap<>();
    private int _round_count = 0;
    private int _turn_count = 0;
    private boolean _check_is_final_turn = false;

    private Map<Integer, Time> _posted_notifications = new ConcurrentHashMap<>();
    private Calendar _last_session_start_datetime = Calendar.getInstance();

    private int TOTAL_TURN_COUNT = 0;

    private SessionStatus _session_status = SessionStatus.Enrolling;
    private SessionRecord _session_record = new SessionRecord();
    private Map<Integer, RankInfo> _rank_info = new HashMap<>();

    public Calendar getLastSessionStartDataTime(){
        return _last_session_start_datetime;
    }

    public boolean enrolled(long actor_id){
        int user_id = ActorBase.getUserID(actor_id);

        return _enrolled_list.contains(user_id);
    }

    public Map<Integer, ParticipateInfo> getParticipator(){return _participator;}
    public ParticipateInfo getParticipator(int user_id){
        if(!_participator.containsKey(user_id))
            return null;
        return _participator.get(user_id);
    }

    public SessionStatus getSessionStatus(){return _session_status;}
    public SessionSetting getSetting(){return _setting;}

    public String getSessionRecord(){return GsonObject.toJson(_session_record);}

    public List<SeatInfo> seats_notify_leave = new LinkedList<>();

    public boolean getIsRunning(){
        return _session_status==SessionStatus.Running;
    }

    public int getOnlinePlayerCount(){
        int result = 0;
        for(Baccarat_GodOfGambler table : _tables.values())
            result+= table.getOccupiedSeats();

        return result;
    }

    public GodOfGambler(int session_id, SessionSetting setting) {
        super(session_id, setting.MinBet, setting.MaxBet);

        _last_session_start_datetime.setTime(new Date(Long.MIN_VALUE));

        _preview = new GamblerPreview();
        setSetting(setting);
        reset();
    }

    public void changeRoomID(int room_id, ShoeInfo shoeInfo, String roadMapStr){
        for(long actor_id : RoomManager.ActorMap.keySet())
        if(RoomManager.ActorMap.get(actor_id) == _room_id)
            RoomManager.ActorMap.put(actor_id, room_id);

        _shoe_info = shoeInfo;
        _road_map_str = roadMapStr;
        _room_id = room_id;
        onChangeDealer();
    }

    public void changeRoomID(int room_id){
        for(long actor_id : RoomManager.ActorMap.keySet())
            if(RoomManager.ActorMap.get(actor_id) == _room_id)
                RoomManager.ActorMap.put(actor_id, room_id);

        _room_id = room_id;
        onChangeDealer();
    }

    public void setSetting(SessionSetting setting){
        _setting = setting;
    }

    public void updateSetting(){
        int room_id = getSourceRoomID(getRoomID());
        SessionSetting setting = SettingManger.getCurrentSetting(room_id, getSetting().SettingType);

        if(setting==null){
            if(((GodOfGambler)(RoomManager.getRooms().get(room_id))).getIsRunning())
                return;
            RoomManager.getRooms().remove(room_id);

            return;
        }

        setSetting(setting);
    }

    public void initialTables(){
        _tables.clear();

        int table_count = (int)Math.ceil(_setting.Max_enroll_count * 1.0f/ Baccarat.MAX_SEAT_COUNT);

        int turn_count = 0;
        int calculate_table_count = table_count;

        while (calculate_table_count > 1) {
            calculate_table_count = (int)Math.ceil(calculate_table_count / 2.0f);
            turn_count++;
        }

        TOTAL_TURN_COUNT = turn_count;

        for(int i=0; i<table_count; i++) {
            int table_id = getSourceRoomID(getRoomID()) * 10000 + i;
            _tables.put(table_id, new Baccarat_GodOfGambler(this, table_id, _setting));
        }
    }

    private void initialBaseChips(){
        _tables.values().forEach(Baccarat_GodOfGambler::initialChips);
    }

    private void checkNotification(int before_minutes){
        if(_posted_notifications.containsKey(before_minutes))
            return;

        Time now = new Time(new Date().getTime());

        Calendar cal_now = Calendar.getInstance();
        cal_now.setTime(now);

        Calendar cal_start_time = Calendar.getInstance();
        cal_start_time.setTime(getSetting().SessionStartTime);

        int all_day_secs_now = SettingManger.getSeconds(cal_now);
        int all_day_secs_start_time = SettingManger.getSeconds(cal_start_time);

        int diff = all_day_secs_start_time - all_day_secs_now;

        if(diff<0)
            return;

        if(diff > (before_minutes * 60))
            return;

        ProtocolHandler.broadcastSessionStart(this, before_minutes);
        _posted_notifications.put(before_minutes, now);
    }

    public void checkNotification(){
        //send notification at last 3 minutes
        checkNotification(3);

        //send notification at last 1 minutes
        checkNotification(1);
    }

    @Override
    public void Start() {
        if(checkIsPrepareRoom(getRoomID()))
            return;

        _last_session_start_datetime = Calendar.getInstance();

        _session_status = SessionStatus.WaitForStart;
        ScannerReceiver.pushSessionStatusMessage(getRoomID(), getSessionStatus());

        if(Entry.DEV_VERSION)
            sessionStart();
    }

    public void sessionStart(){
        if(_session_status!=SessionStatus.WaitForStart)
            return;

        if(getOnlinePlayerCount() <=0) {
            SessionOver();
            return;
        }

        ProtocolHandler.broadcastSessionStart(this, 0);
        _session_status = SessionStatus.Running;
        ScannerReceiver.pushSessionStatusMessage(getRoomID(), getSessionStatus());

        super.Start();
        ProtocolHandler.sendRoundID(this, 0);
        onChangeDealer();

        _round_count = 0;
        _session_record.clear();
    }

    @Override
    protected void roundStart() {
        if((_round_count % ROUNDS_PER_TURN) == 0)
            initialBaseChips();

        updateShoeNum();
    }

    @Override
    public void roundOver() {
        super.roundOver();

        recordSession();

        _round_count++;
        checkMergeTable();
//        kickIdle();
    }

    public void addBetLog(long actorId, int round_id, int table_id, double bet_payoff, String details){
        Entry.Instance().addBetLog(actorId, round_id, WagersType.SessionBet.getValue(), _setting.Entrance_fee,
                table_id, _setting.Entrance_fee, bet_payoff, _setting.Service_fee, details);
    }

    public void recordSession(){
        RoundInfo roundInfo = new RoundInfo();

        for(Baccarat_GodOfGambler table : _tables.values()){
            RoundRecord records = table.getRoundRecord();

            TableRecord tableRecord = new TableRecord();
            //record table id
            tableRecord.TableID = table.RoomID();
            tableRecord.player_point = records.player_point;
            tableRecord.banker_point = records.banker_point;

            //record cards
            for(PokerCard.Card card :records.Cards)
                tableRecord.Cards.add(card.ID);

            //record hit area
            tableRecord.HitAreas = records.HitArea;

            //record player bet
            for(BaccaratSeat player : table.getSeats()){
                if(player.getSeatID() <=0)
                    continue;
                if(player.getActorID() <=0)
                    continue;
                TableRecord_Player log_player = new TableRecord_Player();

                BetRecord betRecord = records.PlayerBet.get(player.getUserID());

                if(betRecord==null)
                    continue;

                GodOfGamblerSeat seat = ((GodOfGamblerSeat) player);
                log_player.Chips = seat.getChips();
                log_player.SeatID = seat.getSeatID();
                log_player.UserID = betRecord.UserID;
                log_player.Record = betRecord;

                tableRecord.Players.add(log_player);
            }

            //record round info
            roundInfo.Tables.add(tableRecord);
            roundInfo.RoundCount = _round_count;
        }

        _session_record.RoundInfo.add(roundInfo);
    }

    private boolean checkSessionInvalid(){
////        //只在第一輪檢查
//        if(_turn_count>0)
//            return false;
//
//        //2017 3/6  更改為在指定回合檢查
//        if(_round_count!=(_setting.PassCount))
//            return false;
//
////        3.報名額滿開賽，但首輪 "參賽人數"未過半
////        則此場比賽取消 報名費退還會員
////        "未參賽"判定：第一輪三局內，無任何下注動作、主動過牌動作
//
//        int total_particepator = _setting.Max_enroll_count;
//
//        int total_betted_count = 0;
//
//        for(Baccarat_GodOfGambler table : _tables.values())
//            total_betted_count += table.getBettedCount();
//
//        if(total_betted_count >= (total_particepator / 2))
//            return false;

        if(_check_is_final_turn)
            return false;

//        3/11 修改成當前參賽玩家未滿足需發放名次數
        return getOnlinePlayerCount() < _setting.RankReward.size();
    }

    private void kickIdle(){
        for(Baccarat_GodOfGambler table : _tables.values())
            table.kickIdle();
    }

    private void checkMergeTable(){
        if((_round_count % ROUNDS_PER_TURN) != 0)
            return;

        _turn_count++;

        int count_before_kick = getOnlinePlayerCount();

        for(Baccarat_GodOfGambler table : _tables.values())
            table.kickLoser();

        int count_after_kick = getOnlinePlayerCount();

        if(count_before_kick!=count_after_kick) {
            mergeTable();
            ProtocolHandler.sendRoundID(this, 0);

            if (checkRunFinalTurn()) {
                _check_is_final_turn = true;
                return;
            }
        }

        checkSessionOver();
    }

    private boolean checkRunFinalTurn(){
        return getOnlinePlayerCount() <= _setting.RankReward.size();
    }

    public void ReturnEntryFee(boolean contain_service_fee){
        int return_amount = 0;
        if(contain_service_fee)
            return_amount = _setting.Entrance_fee;
        else{
            return_amount = _setting.Entrance_fee - _setting.Service_fee;
        }

        JsonObject jsonObject = (JsonObject)GsonObject.toJsonTree(_session_record);
        jsonObject.addProperty("Rank", 0);
        jsonObject.addProperty("Award", 0);
        jsonObject.addProperty("Quited", false);

        String jsonStr = GsonObject.toJson(jsonObject);

        for(Baccarat_GodOfGambler table : _tables.values()) {
            List<BaccaratSeat> seats = table.getSeats();

            for(BaccaratSeat seat : seats)
            if(seat.getActorID() > 0) {
                if(!contain_service_fee)
                    Entry.Instance().addBetLog(seat.getActorID(), getRoundID(), WagersType.ServiceFee.getValue(), _setting.Service_fee,
                            getRoomID(), _setting.Service_fee, 0, _setting.Service_fee, jsonStr);

                Entry.Instance().Recompensate(seat.getActorID(), 0,
                        return_amount,
                        new ExchangeRatio(1, 1), null, Entry.OPCODE_RETURN);
            }
        }
    }

    public void SessionOver(int delay_leave_mill_secs, LeaveCause cause){
        for(Baccarat_GodOfGambler table : _tables.values()) {
            if(cause!=LeaveCause.SessionOver)
                delayNotifyLeave(table, delay_leave_mill_secs, cause);
            table.kickAll(true);
            table.roundOver();
        }

        reset();
        Billboard_GodGambler.updateBillBoard();

        if(getSetting().SettingType==SessionSettingType.TimeSet) {
            _session_status = SessionStatus.Over;
            SettingManger.notifySessionOver(getSourceRoomID(getRoomID()), getSetting());
        }
    }

    public void SessionOver(){
        SessionOver(0, LeaveCause.SessionOver);
    }

    public void checkSessionOver(){
        if(_session_status!=SessionStatus.Running)
            return;

        if(checkReward())
            SessionOver();
    }

    private void mergeTable(){
        List<Baccarat_GodOfGambler> tables = new LinkedList<>(_tables.values());

        List<Long> players = new LinkedList<>();
        for(Baccarat_GodOfGambler table : _tables.values())
        for(BaccaratSeat seat : table.getSeats())
        if(seat.getActorID() > 0)
            players.add(seat.getActorID());

        List<Long> viewers = new LinkedList<>();
        for(Baccarat_GodOfGambler table : _tables.values())
        for(BaccaratViewer viewer : table.getViewers().values())
        if(viewer.getActorID() > 0)
            viewers.add(viewer.getActorID());

        int need_table_count = players.size() / Baccarat.MAX_SEAT_COUNT;
        if(players.size() % Baccarat.MAX_SEAT_COUNT > 0)
            need_table_count+=1;

        for(int i=tables.size()-1; i>=0; i--){
            Baccarat_GodOfGambler table = tables.get(i);
            List<BaccaratViewer> table_players = table.getPlayers();
            for(BaccaratViewer seat : table_players)
            if(seat.getActorID() > 0){
                long actor_id = seat.getActorID();
                table.leaveSeat(actor_id, LeaveCause.MergeTable);
                table.kickViewer(actor_id);
            }
        }

        for(int i=tables.size()-1; i>=need_table_count; i--)
            _tables.remove(tables.get(i).getRoomID());

        for(long actor_id : players) {
            TableInfo tableInfo = getEmptySeat();
            _tables.get(tableInfo.TableID).enterRoom(actor_id);
            _tables.get(tableInfo.TableID).takeSeat(actor_id, tableInfo.SeatID);
            updateParticipator(ActorBase.getUserID(actor_id), _tables.get(tableInfo.TableID).RoomID());
        }

        for(long actor_id : viewers) {
            Baccarat_GodOfGambler table = _tables.entrySet().iterator().next().getValue();
            table.enterRoom(actor_id);
            updateViewer(actor_id, table.RoomID());
        }


        for(Baccarat_GodOfGambler table : _tables.values())
            table.broadcastMergeTable(0);
    }

    private boolean checkReward(){
        List<Baccarat_GodOfGambler> tables = new LinkedList<>(_tables.values());

        int total_players = 0;

        for(int i=0; i<tables.size(); i++)
            total_players += tables.get(i).getOccupiedSeats();

        if(total_players>_setting.RankReward.size())
            return false;

        giveAward(tables);
        broadcastRankInfo();

        return true;
    }

    private void delayNotifyLeave(Baccarat_GodOfGambler table, int delay_millsecs, LeaveCause cause){
        List<BaccaratViewer> players = table.getPlayers();

        for(int i=0; i<players.size(); i++){
            int user_id = players.get(i).getUserID();
            int seat_id = 0;

            if(players.get(i) instanceof GodOfGamblerSeat)
                seat_id = ((GodOfGamblerSeat)players.get(i)).getSeatID();

            SeatInfo seatInfo = new SeatInfo();
            seatInfo.ActorID = players.get(i).getActorID();
            seatInfo.UserId = user_id;
            seatInfo.SeatId = seat_id;

            seats_notify_leave.add(seatInfo);
        }

        Entry.TickEvent.Add(delay_millsecs, new Runnable() {
            @Override
            public void run() {
                for(int i=0; i<seats_notify_leave.size(); i++){
                    int user_id = seats_notify_leave.get(i).UserId;
                    int seat_id = seats_notify_leave.get(i).SeatId;
                    ProtocolHandler.sendLeaveRoom(seats_notify_leave.get(i).ActorID, user_id, seat_id, cause);
                }

                seats_notify_leave.clear();
            }
        });
    }

    private void broadcastRankInfo(){
        String json_str = GsonObject.toJson(_rank_info);
        ProtocolData protocolData = new ProtocolData("SessionRank");
        protocolData.Data = json_str;
        ProtocolHandler.broadcastMessage(this, protocolData);
    }

    public void checkRank(Baccarat_GodOfGambler table, long actor_id, LeaveCause cause){
        if(!getIsRunning())
            return;

        if(cause==LeaveCause.kickAll)
            return;

        int rank = getRank();

        int award = 0;

        int index = rank -1;

        int total_reward = _setting.TotalReward;

        int seat_id = table.getSeatID(actor_id);

        boolean quited = (cause==LeaveCause.Active);

        if(_setting.RankReward.size() > index){
            //      don not give rank to player when player quit
            if(!quited) {
                award = _setting.RankReward.get(index);
                Entry.Instance().Recompensate(actor_id, 0, award, new ExchangeRatio(1, 1),
                        new SimpleRoomInfo(RoomTypes.GodOfGambler, getRoomID()),
                        Entry.OPCODE_AWARD);
            }
        }

        int finalAward = award;

        //斷線保留玩家 訊息存至下次上線時送出
        if(!table.getSeats().get(seat_id).getIsOnline())
            RankMessage.add(table.getSeats().get(seat_id).getUserID(), new RankMessage.MessageInfo(getRoundID(), rank, finalAward, quited));

        Entry.TickEvent.Add(1000, new Runnable() {
            @Override
            public void run() {
                ProtocolHandler.sendRankInfo(actor_id, getRoundID(), rank, finalAward, quited);
            }
        });

        if(finalAward > 0) {
            if(ActorManager.getActor(actor_id)==null)
                try {
                    throw new Exception(String.format("cannot find actor id:%d", actor_id));
                } catch (Exception e) {
                    DebugMessage.addException(e);
                }
            String userName = ActorManager.getActor(actor_id).getAccount().UserName;
            _rank_info.put(rank, new RankInfo(rank, userName, finalAward));
        }

        JsonObject jsonObject = (JsonObject)GsonObject.toJsonTree(_session_record);
        jsonObject.addProperty("Rank", rank);
        jsonObject.addProperty("Award", finalAward);
        jsonObject.addProperty("Quited", quited);

        String jsonStr = GsonObject.toJson(jsonObject);
        addBetLog(actor_id, getRoundID(), getRoomID(), finalAward, jsonStr);
    }

    private void giveAward(List<Baccarat_GodOfGambler> tables){
        List<BaccaratSeat> players = new LinkedList<>();

        for(int i=0; i<tables.size(); i++)
            players.addAll(tables.get(i).getSeats());

        for(int i=players.size()-1; i>=0; i--)
        if(players.get(i).getActorID() <=0)
            players.remove(i);

        players.sort(new Comparator<BaccaratSeat>() {
            @Override
            public int compare(BaccaratSeat o1, BaccaratSeat o2) {
                GodOfGamblerSeat seat1 = (GodOfGamblerSeat)o1;
                GodOfGamblerSeat seat2 = (GodOfGamblerSeat)o2;


                int seat1_total_bet = _participator.get(seat1.getUserID()).TOTAL_BET;
                int seat2_total_bet = _participator.get(seat2.getUserID()).TOTAL_BET;

                if(seat1.getChips() == seat2.getChips()) {
                    if (seat1_total_bet == seat2_total_bet)
                        return (int) (seat1.getTakeSeatTime() - seat2.getTakeSeatTime());

                    return seat2_total_bet - seat1_total_bet;
                }

                return seat2.getChips() - seat1.getChips();
            }
        });

        for(Baccarat_GodOfGambler table : tables)
        for(int i = players.size()-1; i>=0; i--)
            table.kickSeat(players.get(i).getSeatID());
    }

    private void reset(){
        updateRoundID(); // session_id

        for(Baccarat_GodOfGambler table : _tables.values())
            table.kickAll(false);

        _enrolled_list.clear();
        _participator.clear();
        _viewer.clear();
        _tables.clear();
        _session_status = SessionStatus.Enrolling;
        _round_count = 0;
        _turn_count = 0;
        _status = Status.None;
        _rank_info.clear();
        _posted_notifications.clear();
        _check_is_final_turn = false;
        Cards.clear();

        initialTables();
        updateSetting();
        ScannerReceiver.pushRoundStatus(getRoomID(), getStatus());
        ScannerReceiver.pushParticipateMessage(getRoomID(), getOnlinePlayerCount(), getSetting().Max_enroll_count);
    }

    private void updateParticipator(int user_id, int table_id){
        if(_participator.containsKey(user_id))
            _participator.get(user_id).TableID = table_id;
    }

    private void updateViewer(long actor_id, int table_id){
        _viewer.remove(actor_id);
        _viewer.put(actor_id, table_id);
    }

    @Override
    public void NextStatus() {
        _status = _status.Next();

        ScannerReceiver.pushRoundStatus(getRoomID(), getStatus());

        if(getStatus() != Status.RoundStart)
        for(Baccarat_GodOfGambler table : _tables.values())
            table.SetStatus(getStatus());

        switch (getStatus()){
            case Reset:
                break;
            case RoundStart:
                roundStart();
                for(Baccarat_GodOfGambler table : _tables.values())
                    table.SetStatus(getStatus());
                break;
            case DealCard:
                dealCard();
                break;
            case CheckResult:
                checkResult();
                break;
            case RoundOver:
                roundOver();
                break;
        }

        if(_session_status!=SessionStatus.Running)
            return;

        if(getStatus()==Status.None)
            return;

        if(getOnlinePlayerCount()<=0)
            return;

        if(getStatus()==Status.RoundOver)
        if(getIsPausing())
            return;

        if(getStatus().getDuration() > 0)
            _event_next_status = Entry.TickEvent.Add(getStatus().getDuration(), ()->NextStatus());
    }

    @Override
    protected void updatePreview() {
        super.updatePreview();

        GamblerPreview preview = (GamblerPreview)_preview;
        preview.Name = _setting.Name;
        preview.Status = _session_status.toString();
        if(_session_status==SessionStatus.WaitForStart)
            preview.Status = SessionStatus.Running.toString();

        preview.SessionID = getRoundID();
        preview.RegisterFee = _setting.Entrance_fee;
        preview.Service_fee = _setting.Service_fee;
        preview.Total_Turn = TOTAL_TURN_COUNT + 1; //add final turn
        preview.Turn_Count = _turn_count;
        preview.TotalReward = _setting.TotalReward;
        preview.TotalTickets = _setting.Max_enroll_count;
        preview.RankReward = _setting.RankReward;
        preview.Type = _setting.SettingType.getValue();
        preview.StartTime = _setting.SessionStartTime.toString();

        preview.PassCount = getSetting().PassCount;
        preview.HideCount = getSetting().HideCount;

        preview.RegisteredPlayers.clear();

//        preview.Enabled = 1;

        //type of time system
        if(preview.Type==SessionSettingType.TimeSet.getValue())
        {
            Calendar cal_now = Calendar.getInstance();
            Calendar cal_start_time = Calendar.getInstance();
            cal_start_time.setTime(getSetting().SessionStartTime);

            int all_day_secs_now = SettingManger.getSeconds(cal_now);
            int all_day_secs_start_time = SettingManger.getSeconds(cal_start_time);

//            if(all_day_secs_now > all_day_secs_start_time)
//            if(_session_status==SessionStatus.Enrolling)
//                preview.Enabled = 0;
        }

        for(Baccarat_GodOfGambler table : _tables.values()) {
            List<BaccaratSeat> seats = table.getSeats();

            for (int i = 1; i < seats.size(); i++)
            {
                long ActorID = seats.get(i).getActorID();
                if(ActorID==0)
                    continue;
                CustomActor actor = ActorManager.getActor(ActorID);
                if(actor==null)
                    continue;
                String user_name = actor.getAccount().UserName;
                preview.RegisteredPlayers.add(user_name);
            }
        }
    }

    @Override
    public int RoomID() {
        return getRoomID();
    }

    @Override
    public RoomTypes getType() {
        return RoomTypes.GodOfGambler;
    }

    @Override
    public Status getStatus() {
        return _status;
    }

//    @Override
//    public void onBroadCastResult(List<CardTypes> hit_types) {}

    @Override
    public CardInfo getCards() {return Cards;}

    public int getRank(){
        int result = 0;
        for(Baccarat_GodOfGambler table : _tables.values())
            result += table.getOccupiedSeats();

        return result;
    }

    @Override
    public List<BaccaratViewer> getPlayers() {
        List<BaccaratViewer> result = new LinkedList<>();
        for(Baccarat_GodOfGambler table : _tables.values())
            result.addAll(table.getPlayers());

        return result;
    }

    @Override
    public RoomPreview getPreview() {
        return _preview;
    }

    @Override
    public boolean contains(long actor_id) {
        int user_id = ActorBase.getUserID(actor_id);
        return _participator.containsKey(user_id);
    }

    @Override
    public void enterRoom(long actor_id) {
        CustomActor actor = ActorManager.getActor(actor_id);

        ProtocolHandler.sendRoundID(this, 0);

        //有效投注檢查
        if(!RegisterEligibility.checkEligibility(ActorBase.getUserID(actor_id), getSetting().Requirement)) {
//            15:有效投注額不足
            ProtocolHandler.sendEnterResult(actor_id, getRoomID(), 15);
            return;
        }

        //賭神廳只可顯示自己廳的桌次
        if(!Entry.Instance().IsAdministrator(actor.UserID()))
        if(actor.getAccount().HallID != getSetting().HallID)
            return;

//        if(((GamblerPreview)_preview).Enabled==0)
//            return;

        if(!getIsRunning()) {
//            13:人數已滿
            if(getEmptySeat().TableID==0) {
                ProtocolHandler.sendEnterResult(actor_id, getRoomID(), 13);
                return;
            }

            int user_id = ActorBase.getUserID(actor_id);

            if(_enrolled_list.contains(user_id)){
//                14:已報名過此賽事
                ProtocolHandler.sendEnterResult(actor_id, getRoomID(), 14);
                return;
            }

            //duplicate register
            if(_participator.containsKey(user_id)){
//                2:已在房間內
                ProtocolHandler.sendEnterResult(actor_id, getRoomID(), 2);
                return;
            }

            SimpleBetInfo betInfo = new SimpleBetInfo(RoomTypes.GodOfGambler, RoomID(), actor_id, 0, 0);

            ParticipateInfo participateInfo = new ParticipateInfo(user_id);
            _participator.put(user_id, participateInfo);

            participateInfo.BET_HIDE_COUNT = getSetting().HideCount;
            participateInfo.BET_PASS_COUNT = getSetting().PassCount;

            Entry.Instance().Exchange(actor_id, 0, _setting.Entrance_fee, new ExchangeRatio(1, 1), betInfo, Entry.OPCODE_ADMISSION);
//            12:等待入房中
            ProtocolHandler.sendEnterResult(actor_id, getRoomID(), 12);
            return;
        }

        int table_id = getRandomTable();
        _tables.get(table_id).enterRoom(actor_id);
        _viewer.put(actor_id, table_id);
        RoomManager.addActor(actor_id, getRoomID());
    }

    private int getRandomTable(){
        Baccarat_GodOfGambler[] rooms = _tables.values().toArray(new Baccarat_GodOfGambler[0]);
        int index =  ThreadLocalRandom.current().nextInt(0, rooms.length);
        return rooms[index].getRoomID();
    }

    private TableInfo getEmptySeat(){
        int fewest_seat_room_id = 0;
        int seat_id = 0;
        int seat_count = 0;

        for(Baccarat_GodOfGambler room : _tables.values()) {
            int emptyCount = room.getEmptySeatCount();
            if(emptyCount==0)
                continue;

            if (emptyCount > seat_count) {
                fewest_seat_room_id = room.RoomID();
                seat_id = room.getEmptySeatID();
                seat_count = emptyCount;
            }
        }

        return new TableInfo(fewest_seat_room_id, seat_id);
    }

    private int getTableID(long actor_id){
        int user_id = ActorBase.getUserID(actor_id);
        int table_id = 0;

        if(_participator.containsKey(user_id))
            table_id = _participator.get(user_id).TableID;
        if(_viewer.containsKey(actor_id))
            table_id = _viewer.get(actor_id);

        return table_id;
    }

    public int getEnrolledCount(){
        int result = 0;
        for(Baccarat_GodOfGambler table : _tables.values())
            result += table.getOccupiedSeats();

        return result;
    }

    public void checkRank(long actor_id, LeaveCause cause){
        if(actor_id<=0)
            return;

        for(Baccarat_GodOfGambler table : _tables.values()) {
            if(table.getSeatID(actor_id) > 0)
                checkRank(table, actor_id, cause);
        }
    }

    private void setOffline(long actor_id){
        for (Baccarat_GodOfGambler table : _tables.values()) {

            for(int i=1; i<= Baccarat.MAX_SEAT_COUNT; i++)
            if(table.getSeats().get(i).getActorID() == actor_id){
                table.getSeats().get(i).setOnline(false);
                return;
            }
        }
    }

    private boolean onParticipatorLeave(long actor_id, boolean silent, LeaveCause cause){
        int user_id = ActorBase.getUserID(actor_id);

        //斷線會觸發斷線保留 不發放名次
        if(cause == LeaveCause.Disconnect)
        if(getParticipator(user_id)!=null){
            setOffline(actor_id);
            return true;
        }

        boolean found = false;

        if(!getIsRunning())
        if(_participator.containsKey(user_id))
            Entry.Instance().Recompensate(actor_id, 0, _setting.Entrance_fee, new ExchangeRatio(1, 1), null, Entry.OPCODE_RETURN);

        for (Baccarat_GodOfGambler table : _tables.values()) {
            if (table.getSeatID(actor_id) > 0)
                checkRank(table, actor_id, cause);

            if (silent) {
                if (table.silentLeaveRoom(actor_id, cause))
                    found = true;
            } else {
                if (table.leaveRoom(actor_id, cause))
                    found = true;
            }
        }

        if(found)
            _participator.remove(user_id);

        return found;
    }

    private void onViewerLeave(long actor_id, boolean silent, LeaveCause cause){
        for (Baccarat_GodOfGambler table : _tables.values()) {
            Map<Long, BaccaratViewer> viewers = table.getViewers();

            if (viewers.containsKey(actor_id)) {
                BaccaratViewer viewer = viewers.get(actor_id);

                if (viewer.getBetInfo().size() > 0) {
                    int totalBet = viewer.getTotalBet();
                    Entry.Instance().addBetLog(actor_id, getRoundID(), WagersType.ViewerBet.getValue(), totalBet, getRoomID(), totalBet, 0, getSessionRecord());
                }

                if (silent)
                    table.silentLeaveRoom(actor_id, cause);
                else
                    table.leaveRoom(actor_id, cause);

                continue;
            }

            if (silent)
                table.silentLeaveRoom(actor_id, cause);
             else
                table.leaveRoom(actor_id, cause);
        }

        _viewer.remove(actor_id);
    }

    private boolean leaveRoomInternal(long actor_id, boolean silent, LeaveCause cause) {
        boolean result = false;

        result = onParticipatorLeave(actor_id, silent, cause);

        if(!result)
            onViewerLeave(actor_id, silent, cause);

        return result;
    }

    public void clearGOGLeaveMessage(long actor_id){
        for(int i=seats_notify_leave.size() - 1; i>= 0; i--)
        if(seats_notify_leave.get(i).ActorID == actor_id)
            seats_notify_leave.remove(i);
    }

    @Override
    public boolean leaveRoom(long actor_id, LeaveCause cause) {
        boolean result = leaveRoomInternal(actor_id, false, cause);

//        if(cause!=LeaveCause.Disconnect)
//            checkSessionOver();

        if(getIsRunning())
        if(checkSessionInvalid())
        {
            ReturnEntryFee(false);
            SessionOver(1, LeaveCause.SessionAbort);
            return result;
        }

        return result;
    }

    @Override
    public boolean silentLeaveRoom(long actor_id, LeaveCause cause) {
        return leaveRoomInternal(actor_id, true, cause);
    }

    @Override
    public void sendRoomInfo(long actor_id) {
        int table_id = getTableID(actor_id);
        _tables.get(table_id).sendRoomInfo(actor_id);
    }

    @Override
    public void sendCountDown(long actor_id) {}

    @Override
    public void takeSeat(long actor_id, int seat_id) {}

    @Override
    public void requestPlaceBet(long actor_id, JsonObject jsonObject) {
        if(!getIsRunning())
            return;

        int table_id = getTableID(actor_id);
        _tables.get(table_id).requestPlaceBet(actor_id, jsonObject);
    }

    public void restoreSession(long actor_id){
        for(Baccarat_GodOfGambler table : _tables.values())
        if(table.restoreSession(actor_id)) {
            RoomManager.addActor(actor_id, getRoomID());
            return;
        }
    }

    public boolean containsUser(int user_id){
        if(user_id==0)
            return false;

        for(Baccarat_GodOfGambler table : _tables.values())
        if(table.containsUser(user_id))
            return true;

        return false;
    }

    public void checkStart(){
        if(getIsRunning())
            return;

        if(_session_status == SessionStatus.WaitForStart)
            return;

        if(checkIsPrepareRoom(getRoomID()))
            return;

        Time now = new Time(new Date().getTime());

        switch (getSetting().SettingType){
            case SitAndGo:
                if(getEnrolledCount()>= _setting.Max_enroll_count)
                    Start();
                break;
            case TimeSet:
                Calendar cal_now = Calendar.getInstance();
                cal_now.setTime(now);

                Calendar cal_start_time = Calendar.getInstance();
                cal_start_time.setTime(getSetting().SessionStartTime);

                if(getIsRunning())
                    return;

                checkNotification();

                int time_stamp_now = SettingManger.getSeconds(cal_now);
                int time_stamp_start =  SettingManger.getSeconds(cal_start_time);

                if(time_stamp_now < time_stamp_start)
                    return;

                if(getLastSessionStartDataTime().get(Calendar.DAY_OF_YEAR) == Calendar.getInstance().get(Calendar.DAY_OF_YEAR))
                    return;

                Start();
                break;
        }
    }

    @Override
    public void onExchange(AccOperationResult operationResult, long actor_id, int amount, SimpleRoomInfo info) {
        SimpleBetInfo betInfo = (SimpleBetInfo)info;

        Baccarat_GodOfGambler table = _tables.get(betInfo.TableID);

        if(info.TableID > 0)
        if(((SimpleBetInfo) info).SeatID <=0)
        {
            if(!getIsRunning()){
                Entry.Instance().Recompensate(actor_id, 0, amount, new ExchangeRatio(1, 1), null, Entry.OPCODE_RETURN);
                return;
            }
            table.onExchange(operationResult, actor_id, amount, info);
            return;
        }

        int user_id = ActorBase.getUserID(actor_id);

        if(operationResult != AccOperationResult.Success){
            if(betInfo.Bets.size() <=0){
                //                11:入房失敗(兌換分數失敗)
                ProtocolHandler.sendEnterResult(actor_id, betInfo.RoomID, 11);
            }else{
                if(table==null)
                    return;

                //                5:下注失敗(API Error)
                ProtocolHandler.sendPlaceBetResult(table, actor_id, ActorBase.getUserID(betInfo.ActorID)
                                                    , betInfo.SeatID, betInfo.Bets.get(0).Area, amount, 5);

            }

            _participator.remove(user_id);
            return;
        }

        //not start yet, check enrollment process
        if(!getIsRunning()){
            if(betInfo.Bets.size() != 0 )
                return;

            //duplicate register
            if(_participator.get(user_id).TableID!=0)
            {
                if(amount==_setting.Entrance_fee) {
//                    2:已在房間內
                    ProtocolHandler.sendEnterResult(actor_id, betInfo.RoomID, 2);
                    Entry.Instance().Recompensate(actor_id, 0, amount, new ExchangeRatio(1, 1), null, Entry.OPCODE_RETURN);
                }

                return;
            }

            TableInfo tableInfo = getEmptySeat();

            if(tableInfo.TableID==0){
//                13:人數已滿
                ProtocolHandler.sendEnterResult(actor_id, betInfo.RoomID, 13);

                if(amount==_setting.Entrance_fee)
                    Entry.Instance().Recompensate(actor_id, 0, amount, new ExchangeRatio(1, 1), null, Entry.OPCODE_RETURN);

                _participator.remove(user_id);
                return;
            }

            if(_enrolled_list.contains(user_id)){
//                14:已報名過此賽事
                ProtocolHandler.sendEnterResult(actor_id, getRoomID(), 14);

                if(amount==_setting.Entrance_fee)
                    Entry.Instance().Recompensate(actor_id, 0, amount, new ExchangeRatio(1, 1), null, Entry.OPCODE_RETURN);
                return;
            }

            if(getOnlinePlayerCount() >= _setting.Max_enroll_count){
//                13:人數已滿
                ProtocolHandler.sendEnterResult(actor_id, betInfo.RoomID, 13);

                if(amount==_setting.Entrance_fee)
                    Entry.Instance().Recompensate(actor_id, 0, amount, new ExchangeRatio(1, 1), null, Entry.OPCODE_RETURN);

                _participator.remove(user_id);
                return;
            }

            //            1:成功
            _tables.get(tableInfo.TableID).enterRoom(actor_id);

            //            1:入座成功
            _tables.get(tableInfo.TableID).takeSeat(actor_id, (byte)tableInfo.SeatID);
            _participator.get(user_id).TableID = tableInfo.TableID;
            _participator.get(user_id).PaidUp = true;
            _enrolled_list.add(user_id);
            RoomManager.addActor(actor_id, getRoomID());
            return;
        }

        //already start, check bet of viewer
        //check refund
        if(betInfo.Bets.size() == 0) {
            if(amount==_setting.Entrance_fee)
                Entry.Instance().Recompensate(actor_id, 0, amount, new ExchangeRatio(1, 1), null, Entry.OPCODE_RETURN);
            return;
        }

        //check bet
        if(table==null)
            return;

        if(!table.getViewers().containsKey(actor_id))
            return;

        table.onExchange(operationResult, actor_id, amount, info);
    }

    @Override
    public void onChangeDealer() {
        _tables.values().forEach(Baccarat_GodOfGambler::onChangeDealer);
    }

    @Override
    public void updateRoom() {
        _tables.values().forEach(Baccarat_GodOfGambler::updateRoom);

        if(getIsRunning())
        if(getOnlinePlayerCount() <=0)
        if(!getIsPausing())
            reset();
    }

    @Override
    public void scanner_input(int device_id, PokerCard.Card card) {
        for(Baccarat_GodOfGambler table : _tables.values())
            table.scanner_input(device_id, card);

        if(!receive_card(device_id, card))
            return;
        ScannerReceiver.pushReceivedCard(RoomID(), device_id, card.ID);
    }

    @Override
    public void checkResult() {
        boolean hasHandCard = true;

        for(int i=1; i<=4; i++)
            if(Cards.TableCards.get(i)==null) {
                requestCard(i);
                hasHandCard = false;
            }

        if(!hasHandCard)
            return;

        if(checkDrawCard())
            return;

        List<CardTypes> hit_types = CardTypes.analyze(Cards.TableCards);
        onBroadcastCardPoint(hit_types);
        onBroadCastResult(hit_types);

        _tables.values().forEach(Baccarat_GodOfGambler::checkResult);

        _event_next_status = Entry.TickEvent.Add(3000, ()->NextStatus());
    }

    @Override
    public void cancelRound() {
        super.cancelRound();

        for(Baccarat_GodOfGambler table : _tables.values())
            table.cancelRound();
    }

    @Override
    public void clearRoadMap() {
        super.clearRoadMap();

        for(Baccarat_GodOfGambler table : _tables.values())
            table.clearRoadMap();
    }
}

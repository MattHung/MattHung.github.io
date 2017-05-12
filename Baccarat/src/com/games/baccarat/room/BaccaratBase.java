package com.games.baccarat.room;

import com.eject.widget.eventgent.EventHandle;
import com.games.baccarat.Entry;
import com.games.baccarat.ProtocolHandler;
import com.games.baccarat.ScannerReceiver;
import com.games.baccarat.seat.GodOfGamblerSeat;
import com.games.baccarat.types.*;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * Created by matt1201 on 2016/11/28.
 */
public abstract class BaccaratBase {
    public final int DrawCardID_Player = 5;
    public final int DrawCardID_Banker = 6;

    protected int _room_id;
    private long lastUpdateTick = 0;
    private int _round_id = 0;
    private boolean _order_action_clear_road_map = false;
    protected String _road_map_str = "";
    protected ShoeInfo _shoe_info = new ShoeInfo(1, 0);
    private boolean _pausing = false;

    protected int _min_bet;
    protected int _max_bet;
    protected Status _status = Status.None;
    protected EventHandle _event_next_status = null;
    protected RoomPreview _preview = new RoomPreview();

    public String getRoadMapStr(){return _road_map_str;}
    public boolean getIsPausing(){return _pausing;}
    public int getRoundID(){return _round_id;}
    public ShoeInfo getShoeInfo(){return _shoe_info;}
    public CardInfo Cards = new CardInfo();
    public int getRoomID(){return _room_id;}
    public Status getStatus(){return _status;}
    public boolean getOrderedClearMap(){return _order_action_clear_road_map;}

    public BaccaratBase(int room_id, int minBet, int maxBet){
        _room_id = room_id;

        _min_bet = minBet;
        _max_bet = maxBet;

        Entry.TickEvent.AddOnInterval(100, new Runnable() {
            @Override
            public void run() {
                updatePreview();
            }
        });
    }

    public void Start(){
        NextStatus();
    }

    public void update(){
        if((System.currentTimeMillis() - lastUpdateTick) < 1000)
            return;

        onIntervalUpdate();

        lastUpdateTick = System.currentTimeMillis();
    }

    protected void onIntervalUpdate(){

    }

    public void setPause(boolean value) {
        _pausing = value;
    }

    protected void updateRoundID(){
        _round_id = Entry.Instance().nextRoundID();
        ScannerReceiver.pushRoundNumber(_room_id, _round_id);
    }

    protected void updateShoeNum(){
        _shoe_info.nextRound();
        ScannerReceiver.pushShoeNumber(_room_id, _shoe_info);
    }

    protected void updatePreview(){
        _preview.DealerName = ScannerReceiver.getDealerName(getRoomID());
        _preview.RoomID = getRoomID();
        _preview.MinBet = _min_bet;
        _preview.MaxBet = _max_bet;
    }

    public void NextStatus(){
        _status = _status.Next();

        ScannerReceiver.pushRoundStatus(_room_id, getStatus());

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
                checkResult();
                break;
            case RoundOver:
                roundOver();

                if(_pausing)
                    return;
                break;
        }

        if(getStatus().getDuration() > 0)
            Entry.TickEvent.Add(getStatus().getDuration(), ()->NextStatus());
//            _event_next_status = Entry.TickEvent.Add(getStatus().getDuration(), ()->NextStatus());
    }

    public void dealCard(){

    }

    public void onSetCard(int device_id, PokerCard.Card card){
        Cards.set(device_id, card);
    }

    public boolean receive_card(int device_id, PokerCard.Card card){
        if(getStatus()!=Status.CheckResult)
            return false;

        if(Cards.TableCards.get(device_id)!=null)
            return false;

        ScannerReceiver.pushReceivedCard(_room_id, device_id, card.ID);

        onSetCard(device_id, card);

        if(Cards.getCount() >=4)
            checkResult();

        return true;
    }

    private boolean checkDrawCard_Player(){
        if(Cards.TableCards.get(DrawCardID_Player)!=null)
            return false;

        int player_point = Cards.TableCards.get(1).Point + Cards.TableCards.get(2).Point;

        player_point = player_point % 10;

//        閒家
//        起手牌點數總和	補牌規則
//        0	須補牌
//        1	須補牌
//        2	須補牌
//        3	須補牌
//        4	須補牌
//        5	須補牌
//        6	不須補牌
//        7	不須補牌
//        8	「天生贏家」
//        9	「天生贏家」
        switch (player_point){
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                //閒家前兩張牌點數「0」至「5」補牌
                requestCard(DrawCardID_Player);
                return true;
            case 6:
            case 7:
                Cards.TableCards.set(DrawCardID_Player, PokerCard.GetDummy());
                return false;
            case 8:
            case 9:
                Cards.TableCards.set(DrawCardID_Player, PokerCard.GetDummy());
                return false;
        }

        return false;
    }

    private boolean checkDrawCard_Banker(){
        if(Cards.TableCards.get(DrawCardID_Banker)!=null)
            return false;
        if(Cards.TableCards.get(DrawCardID_Player)==null)
            return false;

        int banker_point = Cards.TableCards.get(3).Point + Cards.TableCards.get(4).Point;

        banker_point = banker_point % 10;

        int player_third_card_point = Cards.TableCards.get(DrawCardID_Player).Point;

//        莊家
//        起手牌點數總和	補牌規則
//        0	須補牌
//        1	須補牌
//        2	須補牌
//        3	當閒家補得第三張牌是8，不須補牌；其餘則須補牌
//        4	當閒家補得第三張牌是0.1.8.9，不須補牌；其餘則須補牌
//        5	當閒家補得第三張牌是0.1.2.3.8.9，不須補牌；其餘則須補牌
//        6	當閒家補得第三張牌是0.1.2.3.4.5.8.9，不須補牌；其餘則須補牌
//        7	不須補牌
//        8	「天生贏家」
//        9	「天生贏家」
        switch (banker_point){
            case 0:
            case 1:
            case 2:
                //莊家前兩張牌點數「0」至「2」補牌
                requestCard(DrawCardID_Banker);
                return true;
            case 3://3	當閒家補得第三張牌是8，不須補牌；其餘則須補牌
                if(player_third_card_point==8){
                    Cards.TableCards.set(DrawCardID_Banker, PokerCard.GetDummy());
                    return false;
                }

                requestCard(DrawCardID_Banker);
                return true;
            case 4://4	當閒家補得第三張牌是0.1.8.9，不須補牌；其餘則須補牌
                switch (player_third_card_point){
                    case 0:
                    case 1:
                    case 8:
                    case 9:
                        Cards.TableCards.set(DrawCardID_Banker, PokerCard.GetDummy());
                        return false;
                }

                requestCard(DrawCardID_Banker);
                return true;
            case 5://5	當閒家補得第三張牌是0.1.2.3.8.9，不須補牌；其餘則須補牌
                switch (player_third_card_point){
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 8:
                    case 9:
                        Cards.TableCards.set(DrawCardID_Banker, PokerCard.GetDummy());
                        return false;
                }

                requestCard(DrawCardID_Banker);
                break;
            case 6://6	當閒家補得第三張牌是0.1.2.3.4.5.8.9，不須補牌；其餘則須補牌
                switch (player_third_card_point){
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 8:
                    case 9:
                        Cards.TableCards.set(DrawCardID_Banker, PokerCard.GetDummy());
                        return false;
                }

                requestCard(DrawCardID_Banker);
                break;
            case 7://7	不須補牌
                Cards.TableCards.set(DrawCardID_Banker, PokerCard.GetDummy());
                return false;
            case 8:
            case 9:
                Cards.TableCards.set(DrawCardID_Banker, PokerCard.GetDummy());
                return false;
        }

        return false;
    }

    protected boolean checkDrawCard(){
        checkDrawCard_Player();
        checkDrawCard_Banker();

        if(Cards.TableCards.get(DrawCardID_Player)==null)
            return true;
        if(Cards.TableCards.get(DrawCardID_Banker)==null)
            return true;

        return false;
    }

    public void onBroadCastResult(List<CardTypes> hit_types){
        int player_point = Cards.getPlayerPoint();
        int banker_point = Cards.getBankerPoint();

        //result_id
        List<String> bankerCast = new LinkedList<String>(){{
            add(Cards.TableCards.get(3).getCardCode());
            add(Cards.TableCards.get(4).getCardCode());
            add(Cards.TableCards.get(6).getCardCode());
        }};

        List<String> playerCast = new LinkedList<String>(){{
            add(Cards.TableCards.get(1).getCardCode());
            add(Cards.TableCards.get(2).getCardCode());
            add(Cards.TableCards.get(5).getCardCode());
        }};

        int result_id = CardTypes.FetchStateID3001(bankerCast, playerCast);
        String result_str = String.format("%d-%d", result_id, player_point > banker_point ? player_point : banker_point);
        if(!_road_map_str.equals(""))
            _road_map_str += ",";

        _road_map_str +=result_str;

        if(_road_map_str.length() > 1024)
            _road_map_str = "";
    }

    public void onBroadCastWinnerInfo(List<CardTypes> hit_types, Map<Integer, BetRecord> winners){

    }

    protected void onBroadcastCardPoint(List<CardTypes> hit_types){
        int player_point = Cards.getPlayerPoint();
        int banker_point = Cards.getBankerPoint();

        ScannerReceiver.pushCardPointMessage(getRoomID(), banker_point, player_point, hit_types);
    }

    public void checkResult(){
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

        _event_next_status = Entry.TickEvent.Add(3000, ()->NextStatus());
    }

    protected void requestCard(int device_id){
        ScannerReceiver.pushCardRequest(_room_id, device_id);
    }

    public void clearRoadMap(){
        _order_action_clear_road_map = true;
        _road_map_str = "";
    }

    public void cancelRound(){
        if(_event_next_status!=null)
            Entry.TickEvent.Remove(_event_next_status);

        _event_next_status = null;

        _status = Status.RoundOver;
        clearRound();
        ScannerReceiver.pushRoundStatus(_room_id, getStatus());
    }

    protected void roundStart(){
        updateRoundID();
        updateShoeNum();
    }

    public void roundOver(){
        clearRound();
        checkNextShoe();
    }

    public void clearRound(){
        ScannerReceiver.clear(_room_id);
        Cards.clear();
    }

    private void checkNextShoe(){
        if(!getOrderedClearMap())
            return;

        _shoe_info.nextShoe();
        ScannerReceiver.pushShoeNumber(_room_id, _shoe_info);

        _order_action_clear_road_map = false;
        ScannerReceiver.pushOrderClearRoadMap(_room_id, getOrderedClearMap()?1:0);
        onClearRoadMap();
    }

    protected void onClearRoadMap(){}
}

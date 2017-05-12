package com.games.baccarat;

import com.eject.AccountData;
import com.eject.GameID;
import com.eject.custom.types.AccOperationResult;
import com.eject.custom.types.ExchangeRatio;
import com.eject.custom.types.OperationType;
import com.eject.interop.ActorBase;
import com.eject.interop.GameBridge;
import com.eject.interop.ProtocolData;
import com.eject.widget.DebugMessage;
import com.eject.widget.eventgent.StandardTimeEvent;
import com.eject.widget.eventgent.TickEvent;
import com.games.baccarat.actor.ActorManager;
import com.games.baccarat.billboard.Billboard_GodGambler;
import com.games.baccarat.room.GodOfGambler;
import com.games.baccarat.room.IBaccaratRoom;
import com.games.baccarat.room.RoomManager;
import com.games.baccarat.room.SettingManger;
import com.games.baccarat.types.*;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.File;
import java.nio.ByteBuffer;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * Created by matt1201 on 2016/11/28.
 */
public class Entry extends GameBridge {
    public static boolean DEV_VERSION = true;
    private static Entry m_instance;
    public static Entry Instance(){return m_instance;}

    public static TickEvent TickEvent = new TickEvent();
    public static StandardTimeEvent StandardTimeEvent = new StandardTimeEvent();

    public static final String CONFIG_API_URL = "/config/Baccarat/api.config";;

    public static String API_URL_AUDIT = "";
    public static String API_URL_VALIDBETAMOUNT = "";
    public static String API_URL_BETLIMITATION = "";

    public static final int OPCODE_ADMISSION = 90001 ;
    public static final int OPCODE_AWARD = 90002 ;
    public static final int OPCODE_RETURN = 90003 ;

    public static final int OPCODE_BETTING = 90004 ;
    public static final int OPCODE_PAYOFF = 90005 ;

    public static final int OPCODE_CANCEL = 90007;

    public Entry(){
        m_instance = this;

        loadConfig();
        SettingManger.initial();
        PokerCard.GetRandom();
        Billboard_GodGambler.initialization();

        TickEvent.Add(1, new Runnable() {
            @Override
            public void run() {
                testCard();
            }
        });
    }

    private void testCard(){
        CardInfo Cards = new CardInfo();

        for(int i=0; i<10; i++) {
            Cards.TableCards.set(1, PokerCard.GetRandom());
            Cards.TableCards.set(2, PokerCard.GetRandom());
            Cards.TableCards.set(3, PokerCard.GetRandom());
            Cards.TableCards.set(4, PokerCard.GetRandom());
            Cards.TableCards.set(5, PokerCard.GetDummy());
            Cards.TableCards.set(6, PokerCard.GetDummy());

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

            List<CardTypes> hit_types = CardTypes.analyze(Cards.TableCards);

            int result_id = CardTypes.FetchStateID3001(bankerCast, playerCast);
        }
    }

    private static void loadConfig(){
        try {
            String path = System.getProperty("user.dir") + CONFIG_API_URL;
            File fXmlFile = new File(path);
            DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
            Document doc = dBuilder.parse(fXmlFile);
            doc.getDocumentElement().normalize();

            NodeList nList = doc.getChildNodes().item(0).getChildNodes();

            String field_name;
            String field_value;

            for (int temp = 0; temp < nList.getLength(); temp++) {

                Node node = nList.item(temp);

                String node_name = node.getNodeName();

                switch (node_name){
                    case "param":
                        field_name = ((Element)(node)).getAttribute("name");
                        field_value = ((Element)(node)).getAttribute("value");

                        switch (field_name){
                            case "Audit":
                                API_URL_AUDIT = field_value;
                                break;
                            case "ValidBetAmount":
                                API_URL_VALIDBETAMOUNT = field_value;
                                break;
                            case "BetLimitation":
                                API_URL_BETLIMITATION = field_value;
                                break;
                        }
                        break;
                }
            }
        } catch (Exception e) {
            DebugMessage.addException(e);
        }
    }

    @Override
    public boolean checkRestoreConnection(int user_id) {
        return RoomManager.getRestoreRoomID(user_id) > 0;
    }

    @Override
    public void onPlayerEntered(long actor_id, String remoteIP, int remotePort, AccountData accountData) {
        postPoneCheckBetLog(actor_id);

        ActorManager.Add(remoteIP, remotePort, actor_id, accountData);

        int restore_room_id  = RoomManager.getRestoreRoomID(accountData.UserID);

        if(restore_room_id > 0) {
            BaccaratSave.sendSetting(actor_id);
            RoomManager.restoreSession(actor_id);
            return;
        }

        RankMessage.checkMessage(actor_id);
        RegisterEligibility.onPlayerEnter(accountData.UserID, accountData.HallID);
        BetLimitation.onPlayerEnter(accountData.UserID, accountData.Session_Token);

        TickEvent.Add(1000, new Runnable() {
            @Override
            public void run() {
                BaccaratSave.onPlayerEnter(actor_id);
            }
        });
    }

    @Override
    public void onPlayerLeaved(long actor_id, String reason) {
        RoomManager.leaveRoom(actor_id, LeaveCause.Disconnect);

        int restore_room_id  = RoomManager.getRestoreRoomID(ActorBase.getUserID(actor_id));

        if(restore_room_id==0)
            ActorManager.Remove(actor_id, reason);
    }

    @Override
    public void onReceiveBinary(long actor_id, byte protocolNO, ByteBuffer msg) {

    }

    @Override
    public void onReceiveText(long actor_id, ProtocolData protocol) {
        ProtocolHandler.RecvMessage(actor_id, protocol);
//        sendMessage(actor_id, protocol);
    }

    @Override
    public GameID gameGameID() {
        return GameID.Baccarat;
    }

    @Override
    public void processUpdate() {
        ScannerReceiver.update();
        RoomManager.update();
        TickEvent.Update();
        StandardTimeEvent.Update();
        Billboard_GodGambler.update();
    }

    @Override
    public String onHttpRequest(Map<String, String> map) {
        return null;
    }

    @Override
    public boolean AllowExchange(OperationType opType, long ActorID, double Value, ExchangeRatio Ratio){
        return true;
    }

    @Override
    public void onAccResponse(long actor_id, OperationType type, AccOperationResult result,
                              ExchangeRatio Ratio, double value, double Balance, Object param, String httpRes) {
        RoomManager.onAccResponse(actor_id, type, result, Ratio, value, Balance, (SimpleRoomInfo)param, httpRes);
    }

    @Override
    public void onSystemShutDown() {
        Map<Integer, IBaccaratRoom> rooms  = RoomManager.getRooms();

        for(IBaccaratRoom room : rooms.values())
        if(room instanceof GodOfGambler){
            if(((GodOfGambler) room).getIsRunning())
                ((GodOfGambler) room).ReturnEntryFee(true);

            ((GodOfGambler) room).SessionOver(1, LeaveCause.SystemShutDown);
        }
    }

    @Override
    public void onWagersSqlResponse(String cmd, String sql_result) {
        if(cmd.equals(SQLQuerys.QUERY_GAME_SETTINGS)){
            SettingManger.updateSetting(sql_result);
            return;
        }

        if(cmd.contains(SQLQuerys.QUERY_USER_SETTING)){
            BaccaratSave.onSQLResponse(sql_result);
            return;
        }

        Billboard_GodGambler.postGodGamblerBillboard(cmd, sql_result);
    }
}

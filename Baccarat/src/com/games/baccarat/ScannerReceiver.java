package com.games.baccarat;

import com.eject.socket.client.TcpClient;
import com.eject.widget.Worker;
import com.games.baccarat.room.BaccaratBase;
import com.games.baccarat.room.GodOfGambler;
import com.games.baccarat.room.IBaccaratRoom;
import com.games.baccarat.room.RoomManager;
import com.games.baccarat.types.*;
import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.File;
import java.nio.ByteBuffer;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by matt1201 on 2016/11/28.
 */
public class ScannerReceiver {
    static class CardDetails{
        public String Text;
        public PokerCard.Card Card;

        public void set(String text, PokerCard.Card card){
            Text = text;
            Card = card;
        }

        public void clear(){
            Text = "";
            Card = null;
        }
    }

    static class SourceData{
        private static DateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");

        private String _updateTime;
        private String _dealer_name;
        private Map<Integer, CardDetails> Data = new HashMap<>();
        private List<Integer> CardRequests = new LinkedList<>();

        public int CameraID;

        public boolean getIsPausing(){return RoomManager.checkPausing(CameraID);}
        public String getDealerName(){return _dealer_name;}

        public SourceData(int cameraID){
            _dealer_name="###";
            CameraID = cameraID;
        }

        public void setDealerName(String name){
            _dealer_name = name;
        }

        public void updateData(int device_id, String text){
            if(!Data.containsKey(device_id))
                Data.put(device_id, new CardDetails());

            PokerCard.Card card = PokerCard.mapping(Integer.parseInt(text));
            Data.get(device_id).set(text, card);
            _updateTime = dateFormat.format(new Date());
        }

        public void recordRequest(int device_id){
            if(CardRequests.contains(device_id))
                return;

            CardRequests.add(device_id);
        }

        public void cancelRequest(int device_id){
            if(device_id<0)
                return;
            if(device_id>CardRequests.size()-1)
                return;
            CardRequests.remove(device_id);
        }

        public PokerCard.Card GetCard(int device_id){
            if(!Data.containsKey(device_id))
                return null;

            return Data.get(device_id).Card;
        }

        public void clear(){
            for(Map.Entry<Integer, CardDetails> entry : Data.entrySet())
                entry.getValue().clear();

            CardRequests.clear();
        }
    }

    public final static String Scanner_Command_initial ="initial";
    public final static String Scanner_Command_round_status ="round_status";
    public final static String Scanner_Command_received_card ="received_card";

    public final static String SCANNER_ACTION_HANDSHAKE = "handshake";
    public final static String SCANNER_ACTION_HELLO = "hello";
    public final static String SCANNER_ACTION_CARD = "card";
    public final static String SCANNER_ACTION_DEALER = "dealer";
    public final static String SCANNER_ACTION_PARTICIPATOR = "participator";
    public final static String SCANNER_ACTION_SESSION_STATUS = "session_status";
    public final static String SCANNER_ACTION_CARD_POINT = "card_point";
    public final static String SCANNER_ACTION_PAUSE = "pause";
    public final static String SCANNER_ACTION_UPDATE_SHOE_NUM = "update_shoe_num";
    public final static String SCANNER_ACTION_UPDATE_ROUND_NUM = "update_round_num";
    public final static String SCANNER_ACTION_CLEAR_ROADMAP = "clear_road_map";
    public final static String SCANNER_ACTION_CANCEL_ROUND = "cancel_round";

    public static final String CONFIG_VIDEO_DATA = "/config/Baccarat/video.config";;

    private static final String IDENTIFY_HEADER = "ScannerInput";
    private static final int CONNECT_INTERVAL = 3000;
    private static final int SAYHELLO_INTERVAL = 3000;
    private static long _last_say_hello_tick  = 0;

    private static Map<Integer, SourceData> _source_datas = new HashMap<>();

    private static String _video_data_address;
    private static int _video_data_port;

    private static Worker _worker_connect;

    private static TcpClient.IConnectionEvent _peer_listener = null;
    private static TcpClient _peer;

    static{
        loadConfig();
        initialConnect();
    }

    public static void sayHello(){
        if(_source_datas.size()<=0)
            return;

        for(SourceData source : _source_datas.values()){
            int camera_id = source.CameraID;
            sayHello(camera_id);
        }
    }

    public static void sayHello(int camera_id){
        if(!_source_datas.containsKey(camera_id))
            return;

        if(!RoomManager.getRooms().containsKey(camera_id))
            return;

        IBaccaratRoom room = RoomManager.getRooms().get(camera_id);

        pushScannerMessage(camera_id,
                Scanner_Command_initial,
                room.getStatus().name(),
                new LinkedList<String>(){
                    {
                        add(_source_datas.get(camera_id).getDealerName());

                        for(int i=1; i<room.getCards().TableCards.size(); i++) {
                            if(room.getCards().TableCards.get(i)==null)
                                add(String.valueOf(0));
                            else
                                add(String.valueOf(room.getCards().TableCards.get(i).ID));
                        }
                    }
                });

        List<Integer> card_requests = _source_datas.get(camera_id).CardRequests;

        for(int i=0; i<card_requests.size(); i++)
            pushCardRequest(camera_id, card_requests.get(i));

        pushScannerMessage(camera_id, SCANNER_ACTION_PAUSE, RoomManager.checkPausing(camera_id) ? "1" : "0");

        pushRoundNumber(camera_id, RoomManager.getRooms().get(camera_id).getRoundID());
        pushShoeNumber(camera_id, ((BaccaratBase)RoomManager.getRooms().get(camera_id)).getShoeInfo());
        pushOrderClearRoadMap(camera_id, ((BaccaratBase)RoomManager.getRooms().get(camera_id)).getOrderedClearMap()?1:0);

        if(room.getType() == RoomTypes.GodOfGambler) {
            pushParticipateMessage(camera_id, ((GodOfGambler)room).getOnlinePlayerCount(),
                    ((GodOfGambler)room).getSetting().Max_enroll_count);

            pushSessionStatusMessage(camera_id, ((GodOfGambler)room).getSessionStatus());
        }
    }

    private static void initialConnect(){

//        _worker_connect = new Worker(() -> try_connect(), CONNECT_INTERVAL);

        _peer_listener = new TcpClient.IConnectionEvent() {
            @Override
            public void onConnect() {
                sayHello();
            }

            @Override
            public void onDisconnect() {

            }

            @Override
            public void onReceive(ByteBuffer byteBuffer) {
                try {
                    String msg = new String(Arrays.copyOfRange(byteBuffer.array(), byteBuffer.position(), byteBuffer.position() + byteBuffer.limit()), "Big5");
                    String [] strings = msg.split("/|");

                    if(strings.length<4)
                        return;

                    if(!strings[0].equals(IDENTIFY_HEADER))
                        return;

                    int camera_id = Integer.parseInt(strings[1]);
                    String action = strings[2];
                    IBaccaratRoom room = RoomManager.getRooms().get(camera_id);

                    boolean contained_camera = _source_datas.containsKey(camera_id);

                    checkSource(camera_id);

                    switch (action){
                        case SCANNER_ACTION_HELLO:
                            if(!contained_camera)
                                sayHello(camera_id);
                            break;
                        case SCANNER_ACTION_HANDSHAKE:
                            sayHello(camera_id);
                            break;
                        case SCANNER_ACTION_CARD:
                            String device_name = strings[3];
                            int device_order_id = Integer.parseInt(device_name.substring(0, device_name.indexOf("._")));
                            String text = strings[4];
                            handleInput(camera_id, device_name, device_order_id, text);
                            break;
                        case SCANNER_ACTION_DEALER:
                            String dealer_name = strings[3];
                            _source_datas.get(camera_id).setDealerName(dealer_name);
                            RoomManager.onChangeDealer(camera_id);
                            break;
                        case SCANNER_ACTION_SESSION_STATUS:
                            if(room instanceof GodOfGambler)
                                ((GodOfGambler)room).sessionStart();
                            break;
                        case SCANNER_ACTION_PAUSE:
                            int order_pause = Integer.parseInt(strings[3]);
                            RoomManager.setPause(camera_id, order_pause==1);
                            pushScannerMessage(camera_id, SCANNER_ACTION_PAUSE, RoomManager.checkPausing(camera_id) ? "1" : "0");
                            break;
                        case SCANNER_ACTION_CLEAR_ROADMAP:
                            RoomManager.clearRoadMap(camera_id);
                            pushOrderClearRoadMap(camera_id, ((BaccaratBase)RoomManager.getRooms().get(camera_id)).getOrderedClearMap()?1:0);
                            break;
                        case SCANNER_ACTION_CANCEL_ROUND:
                            RoomManager.cancelRound(camera_id);
                            break;
                    }

                    if(!action.equals(SCANNER_ACTION_CLEAR_ROADMAP))
                        if(!action.equals(SCANNER_ACTION_PAUSE))
                            if(!action.equals(SCANNER_ACTION_CARD)) {
                                String text = "";
                                for (int i = 3; i < strings.length; i++)
                                    text += strings[i] + "|";
                                pushScannerMessage(camera_id, action, text);
                            }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        };
    }

    private static void NewPeer(){
        try {
            _peer = new TcpClient(_peer_listener);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void pushCardRequest(int camera_id, int device_id){
        boolean autoDeal = false;

        if((device_id==1))
            autoDeal = true;
        if((device_id==2))
            autoDeal = true;

        if((device_id==3))
            autoDeal = true;
        if((device_id==4))
            autoDeal = true;
        if((device_id==5))
            autoDeal = true;
        if((device_id==6))
            autoDeal = true;

        checkSource(camera_id);

        if(autoDeal){
            Entry.TickEvent.Add(100, () -> {
                RoomManager.receive_card(camera_id, device_id, PokerCard.GetRandom());
            });
            return;
        }

        String msg = String.format("%d|card_request|%d", camera_id, device_id);
        pushMessage(msg);

        _source_datas.get(camera_id).recordRequest(device_id);
    }

    public static void pushSessionStatusMessage(int camera_id, GodOfGambler.SessionStatus status){
        pushScannerMessage(camera_id, SCANNER_ACTION_SESSION_STATUS, status.toString());
    }

    public static void pushParticipateMessage(int camera_id, int ccu, int max_count){
        String msg = String.format("%d|%d", ccu, max_count);
        pushScannerMessage(camera_id, SCANNER_ACTION_PARTICIPATOR, msg);
    }

    public static void pushCardPointMessage(int camera_id, int banker, int player, List<CardTypes> hit_types){
        String msg = String.format("%d|%d", banker, player);
        for(int i=0; i<hit_types.size(); i++)
            msg += String.format("|%s", hit_types.get(i).name());
        pushScannerMessage(camera_id, SCANNER_ACTION_CARD_POINT, msg);
    }

    public static void pushScannerMessage(int camera_id, String action, String text){
        if(GodOfGambler.checkIsPrepareRoom(camera_id))
            return;
        String msg = String.format("%d|%s|%s", camera_id, action, text);
        pushMessage(msg);
    }

    public static void pushScannerMessage(int camera_id, String action, String status, List<String> text){
        if(GodOfGambler.checkIsPrepareRoom(camera_id))
            return;

        String msg = status + "|";
        for(int i=0; i<text.size(); i++)
            msg += String.format("%s|", text.get(i));

        pushScannerMessage(camera_id, action, msg);
    }

    public static void pushOrderClearRoadMap(int camera_id, int ordered){
        String msg = String.format("%d", ordered);
        pushScannerMessage(camera_id, SCANNER_ACTION_CLEAR_ROADMAP, msg);
    }

    public static void pushRoundNumber(int camera_id, int round_id){
        String msg = String.format("%d", round_id);
        pushScannerMessage(camera_id, SCANNER_ACTION_UPDATE_ROUND_NUM, msg);
    }

    public static void pushShoeNumber(int camera_id, ShoeInfo shoeInfo){
        String msg = String.format("%d|%d", shoeInfo.getShoeNum(), shoeInfo.getRoundNum());
        pushScannerMessage(camera_id, SCANNER_ACTION_UPDATE_SHOE_NUM, msg);
    }

    public static void pushRoundStatus(int camera_id, Status status){
        String msg = status.name();

        if(status==Status.DealCard)
            msg += String.format("|%d", status.getDuration());
        pushScannerMessage(camera_id, Scanner_Command_round_status, msg);
    }

    public static String getDealerName(int camera_id){
        if(!_source_datas.containsKey(camera_id))
            return "";

        return _source_datas.get(camera_id).getDealerName();
    }

    public static void pushReceivedCard(int camera_id, int device_id, int card_id){
        String text =String.format("%d|%d", device_id, card_id);
        pushScannerMessage(camera_id, SCANNER_ACTION_CARD, text);

        _source_datas.get(camera_id).cancelRequest(device_id);
    }

    public static void pushMessage(String msg){
        if(_peer==null)
            return;

        try {
            byte[] binary = msg.getBytes("UTF-8");
//            byte[] binary = msg.getBytes();
            ByteBuffer buffer = ByteBuffer.allocate(binary.length);
            buffer = buffer.put(binary);
            _peer.send(buffer);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void checkSource(int camera_id){
        if(!_source_datas.containsKey(camera_id))
            _source_datas.put(camera_id, new SourceData(camera_id));
    }

    private static void handleInput(int camera_id, String device, int device_id, String text){
        if(RoomManager.getRoomStatus(camera_id)!=Status.CheckResult)
            return;
        if(_source_datas.get(camera_id).Data.containsKey(device_id))
        if(!_source_datas.get(camera_id).Data.get(device_id).Text.equals(""))
            return;

        _source_datas.get(camera_id).updateData(device_id, text);

        RoomManager.receive_card(camera_id, device_id, _source_datas.get(camera_id).GetCard(device_id));
    }

    private static void loadConfig(){
        String path = System.getProperty("user.dir") + CONFIG_VIDEO_DATA;
        File fXmlFile = new File(path);
        DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder dBuilder = null;
        try {
            dBuilder = dbFactory.newDocumentBuilder();

            Document doc = dBuilder.parse(fXmlFile);
            doc.getDocumentElement().normalize();
            NodeList nList = doc.getElementsByTagName("param");

            for(int i=0; i < nList.getLength(); i++){
                Node node = nList.item(i);

                NamedNodeMap attr = node.getAttributes();

                _video_data_address = attr.getNamedItem("address").getNodeValue();
                _video_data_port = Integer.parseInt(attr.getNamedItem("port").getNodeValue());
                break;
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void try_connect(){
        if (_peer!=null)
        if (_peer.connected())
            return;

        NewPeer();
        _peer.connect(_video_data_address, _video_data_port);
    }

    public static void update(){
        _peer.update_peers();
        keepSayHello();
    }

    public static void keepSayHello(){
        if((System.currentTimeMillis() - _last_say_hello_tick) < SAYHELLO_INTERVAL)
            return;

        sayHello();

        _last_say_hello_tick = System.currentTimeMillis();
    }

    public static void clear(int camera_id){
        if(!_source_datas.containsKey(camera_id))
            return;

        _source_datas.get(camera_id).clear();
    }

    public static PokerCard.Card GetCard(int camera_id, int device_id){
        return PokerCard.GetRandom();
//        return _source_datas.get(camera_id).GetCard(device_id);
    }
}

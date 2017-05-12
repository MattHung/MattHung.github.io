using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Reflection;
using System.IO;
using NetworkLibrary;
using Widget;
using System.Collections;
using Newtonsoft.Json;
using System.Xml;
using SocketClient;
using Newtonsoft.Json.Linq;
using System.Net;
using System.Windows.Forms;
using ClientSocket.peer;

namespace ClientSocket
{   
    public class LoginParam
    {
        public string SessionID;
        public int HallID;
        public string UserName;
        public int UserID;        
        public string Browser;
        public string OSType;
    }

    public struct ProtocolText
    {
        public int GameID;
        public string Detail;
    }

    public abstract class PeerBase
    {
        public class ProtocolText
        {
            public int GameID;
            public string Action;
            public string Detail;

            public ProtocolText(int gameID, string action, string detail)
            {
                GameID = gameID;
                Action = action;
                Detail = detail;
            }
        }

        public const int SystemProtocalHeader = 0;
        private const int ConnectTimeOut = 5000;
                
        protected WebSocket m_Socket = null;        
        public LoginParam LoginParameter { get; protected set; }
        public double Score { get; protected set; }
        public double Balance { get; protected set; }

        public string AdditionInfo { get; protected set; }

        public int RoomID;
        public int SeatID;

        public ClientSocket.Types.AccountData AccountSave { get; protected set; }
        private bool m_Connected = false;
        private CriticalSection m_Critical_Connected = new CriticalSection();        
        
        public bool Connected
        {
            get
            {
                bool result = false;
                m_Critical_Connected.Enter();                
                result = m_Connected;                
                m_Critical_Connected.Leave();
                return result;
            }
        }
        public string RemoteIP { get; private set; }
        public int RemotePort { get; private set; }

        public int GameID { get; private set; }
        public int ID { get; private set; }

        protected abstract void RequestLogin();

        public PeerBase(int id, int gameID, string remoteIP, int remotePort)
        {   
            ID = id;
            GameID = gameID;

            RemoteIP = remoteIP;
            RemotePort = remotePort;

            m_Socket = new WebSocket(string.Format("ws://{0}:{1}", RemoteIP, RemotePort));            
            m_Socket.OnOpen += m_Socket_OnOpen;
            m_Socket.OnClose += m_Socket_OnClose;
        }

        void m_Socket_OnClose(object sender, OnDisconnectEvent e)
        {
            OnDisconnect();
        }

        void m_Socket_OnOpen(object sender, OnConnectEvent e)
        {            
            OnConnect();
        }
        
        public void Connect()
        {
            if (Connected)
                return;
            
            m_Socket.Connect();
        }

        public void Disconnect()
        {
            if (m_Socket != null)
                m_Socket.Close();
        }

        
        public virtual void Update() { }
        public virtual void OnConnect() 
        {
            RequestLogin();

            m_Critical_Connected.Enter();
            m_Connected = true;
            m_Critical_Connected.Leave();            
        }
        public virtual void OnDisconnect() {
            m_Critical_Connected.Enter();
            m_Connected = false;
            m_Critical_Connected.Leave();
        }
        public virtual void OnResponseLogin(byte res, ClientSocket.Types.AccountData accountData) { }
        public virtual void OnResponseEnterGame(byte res) { }
        public virtual void OnRecvSystemMessagee(string Message) { }
        public virtual void Recompensate(){}

        public int ExchangeRatio_MIN = 0;
        public int ExchangeRatio_MAX = 0;        
    }

    public class PeerManager
    {
        //public const int GAMEID = 30101;
        public const int GAMEID = 35101;

        public const int ROOM_UPDATE_INTERVAL = 1 * 1000;        

        public const string SAVE_SESSIONID = "../Config/session_id_cache.xml";
        //public const string API_MOBILE_LOGIN = "http://bm-dev.vir888.net/app/WebService/view/display.php/MobileLogin?username={0}&password={1}&platform={2}&domaincode={3}&ip={4}";
        public const string API_MOBILE_LOGIN = "http://bm.vir999.com/app/WebService/view/display.php/MobileLogin?username={0}&password={1}&platform={2}&domaincode={3}&ip={4}";

        //public const string API_MOBILE_LOGIN = "http://bm.test.04vip.com/app/WebService/view/display.php/MobileLogin?username={0}&password={1}&platform={2}&domaincode={3}&ip={4}";
        
        private ulong _last_update_room_list_tick = 0;
        private const ulong BatchLoginInterval = 100;        
        private const int BatchLoginCount=1;
        public const int ServerPort=61230;
        public string ServerIP { get; private set; }
        private static PeerManager m_Instance = new PeerManager();
        public static PeerManager Instance { get { return m_Instance; } }
        private Queue<int> m_LoginTasks = new Queue<int>();
        private ulong m_LastLoginTick = 0;
        public Dictionary<int, PeerBase> Peers = new Dictionary<int, PeerBase>();

        public List<LoginParam> _Accounts = new List<LoginParam>();

        public LoginParam LoginArg
        {
            get
            {
                return _Accounts[new Random().Next(_Accounts.Count)];                
                //return _Accounts[0];                
            }
        }

        public int PeerCount { get; private set; }

        public PeerBase this[int PeerID] { get { return Peers.ContainsKey(PeerID) ? Peers[PeerID] : null; } }

        public PeerManager()
        {
            //dev account            
            //RequestSessionID(129499058, "rmbtest", "qwe123", "esb");  //rmb帳號
            //RequestSessionID(129499060, "jp1test", "qwe123", "esb");  //日幣帳號

            //RequestSessionID(40194985, "erichuang816", "a723598", "esb");    //Party of Test            

            //test account                        
            //RequestSessionID(148499949, "play03", "426bj4", "esb");    //CNY
            //RequestSessionID(148499966, "dsn010", "1234qwer", "esb");  //USD
            //RequestSessionID(1786111, "jekkicba", "426bj4", "esb");    //CNY            
            

            //RequestSessionID(148499949, "she07", "she123", "esb");    //CNY
            //RequestSessionID(148499949, "valar", "qwe123", "esb");    //CNY


            //RequestSessionID(148513422, "pmomatt01", "qaz123", "esb");
            //RequestSessionID(148499947, "play02", "426bj4", "esb");
            //RequestSessionID(148499964, "dsn008", "1234qwer", "esb"); //VND
            //RequestSessionID(148499966, "pmomasa", "1234qwer", "liv");  //Prepaid Card

            //RequestSessionID(148749450, "jay1234", "1qaz2wsx", "esb");


            //RequestSessionID(148513805, "2d001", "qwe123", "esb");

            //RequestSessionID(148513442, "pmonora", "426bj4", "esb");
            //RequestSessionID(148513444, "pmohelen", "426bj4", "esb");
            //RequestSessionID(148513445, "pmojeff", "426bj4", "esb");

            //RequestSessionID(148522870, "pmonora2", "426bj4", "esb");
            //RequestSessionID(148522871, "pmohelen2", "426bj4", "esb");
            //RequestSessionID(148522872, "pmojeff2", "426bj4", "esb");

            //RequestSessionID(148749441, "pmonora3", "426bj4", "esb");    //CNY

            //production accountA
            //RequestSessionID(154533232, "rdmatt", "qaz123", "bin");    //CNY
            //RequestSessionID(137776286, "pmo003", "0okm9ijn", "bin");    //CNY            
            //RequestSessionID(40194985, "jekkicc", "qwe123", "esb");    //CNY            
            AddRobotAccount();
        }

        private void AddRobotAccount()
        {
            int user_id = 1000;
            for (int i = user_id; i < user_id + 1000; i++)
            {
                LoginParam param = new LoginParam();

                param.HallID = 6;
                param.UserID = i;
                param.UserName = string.Format("user_{0}", i);
                param.OSType = "bbin";
                param.Browser = "bbin";
                param.SessionID = "bbin";

                _Accounts.Add(param);
            }
        }

        private void RequestSessionID(int user_id, string user_name, string password, string domainCode)
        {
            //"http://bm.vir999.net/app/WebService/view/display.php/MobileLogin?username={0}&password={1}&platform={2}&lobby=15&domaincode={3}&ip={4}";            

            string mobile_login = string.Format(API_MOBILE_LOGIN, user_name, password, 0, domainCode, "127.0.0.1");
            
            ulong Timeout = 10000;

            Stream responseStream = null;
            StreamReader streamReader = null;

            HttpWebRequest req = null;
            HttpWrapper httpWrapper = null;
            string data;

            LoginParam param = new LoginParam();
                        
            param.HallID = 6;
            param.UserID = user_id;
            param.UserName = user_name;
            param.OSType = "bbin";
            param.Browser = "bbin";
            param.SessionID = "bbin";

            _Accounts.Add(param);

            req = (HttpWebRequest)HttpWebRequest.Create(mobile_login);
            req.ContentType = "application/x-www-form-urlencoded";
            req.Method = "GET";

            httpWrapper = new HttpWrapper(req, null, Timeout);
            httpWrapper.Event_OnResponse = delegate(HttpWebRequest Request, HttpWebResponse Response, object Param, ulong ElapseTime)
            {
                try
                {
                    responseStream = Response.GetResponseStream();
                    streamReader = new StreamReader(responseStream, Encoding.GetEncoding("UTF-8"));
                    data = streamReader.ReadToEnd();

                    JObject jobj = JObject.Parse(data);

                    if (jobj["result"].ToString().ToLower() == "true")
                    {
                        if (jobj["data"] != null)
                        {
                            param.HallID = Convert.ToInt32(JObject.Parse(jobj["data"].ToString())["HallID"]);
                            param.UserID = Convert.ToInt32(JObject.Parse(jobj["data"].ToString())["UserID"]); ;
                            param.UserName = JObject.Parse(jobj["data"].ToString())["UserName"].ToString();
                            param.SessionID = JObject.Parse(jobj["data"].ToString())["session_token"].ToString();


                            Form1.Instance.ShowMessage(string.Format("user session initialed : {0}", param.UserName));
                        }
                    }
                    else
                    {
                        Form1.Instance.ShowMessage(JObject.Parse(jobj["data"].ToString())["Message"].ToString());
                    }
                    
                    CacheSessionID(LoginArg.UserName, LoginArg.UserID, LoginArg.HallID, LoginArg.SessionID);
                }
                catch (Exception e)
                {
                    ExceptionRecorder.Add(e);
                }
            };

            httpWrapper.Event_OnTimeout = delegate(HttpWebRequest Request, object Param)
            {
                Form1.Instance.ShowMessage("mobile login timeout");
            };

            httpWrapper.Event_OnFailed = delegate(HttpWebRequest Request, object Param, ulong ElapseTime)
            {
                Form1.Instance.ShowMessage("mobile login failed");
            };

            httpWrapper.Execute();
        }

        private LoginParam LoadCacheSessionID()
        {
            if (!File.Exists(SAVE_SESSIONID))
                return new LoginParam();

            LoginParam result = new LoginParam();

            XmlDocument config = new XmlDocument();
            config.Load(SAVE_SESSIONID);
            XmlElement configuration = config.SelectSingleNode("save") as XmlElement;

            result.UserName = configuration.ChildNodes[0].Attributes[1].Value;
            result.UserID = Convert.ToInt32(configuration.ChildNodes[0].Attributes[2].Value);
            result.HallID = Convert.ToInt32(configuration.ChildNodes[0].Attributes[3].Value);
            result.SessionID = configuration.ChildNodes[0].Attributes[4].Value;

            return result;
        }

        private void CacheSessionID(string user_name, int user_id, int hall_id, string session_id)
        {
            if (!File.Exists(SAVE_SESSIONID))
                return;

            XmlDocument config = new XmlDocument();
            config.Load(SAVE_SESSIONID);
            XmlElement configuration = config.SelectSingleNode("save") as XmlElement;

            configuration.ChildNodes[0].Attributes[1].Value = user_name;
            configuration.ChildNodes[0].Attributes[2].Value = user_id.ToString();
            configuration.ChildNodes[0].Attributes[3].Value = hall_id.ToString();

            configuration.ChildNodes[0].Attributes[4].Value = session_id;
            config.Save(SAVE_SESSIONID);
        }

        public PeerBase CreatePeer(int id, int gameID, string ServerIP, int ServerPort)
        {
            return new GodGamblerPeer(id, gameID, ServerIP, ServerPort);
        }

        public void Update()
        {             
            ProcessLogin();

            foreach (PeerBase peer in Peers.Values)
                peer.Update();

            UpdateRoomList();
        }

        public void UpdateRoomList()
        {
            if ((SystemCounter.TickCount64 - _last_update_room_list_tick) < ROOM_UPDATE_INTERVAL)
                return;

            _last_update_room_list_tick = SystemCounter.TickCount64;

            foreach (PeerBase peer in Peers.Values)
            if (peer.Connected)
            {
                (peer as JsonPeer).SendMessage("RoomList", 
                    new JObject(new JProperty("RoomType", 2)));
                return;
            }
        }

        public void SetRemoteIP(string ipAddress)
        {
            ServerIP = ipAddress;
        }

        ulong GetElapseTick(ulong beignTick)
        {
            return SystemCounter.TickCount64 - beignTick;
        }


        private void ProcessLogin()
        {
            if (GetElapseTick(m_LastLoginTick) < BatchLoginInterval)
                return;

            int Count = Math.Min(BatchLoginCount, m_LoginTasks.Count);
            if (Count == 0)
                return;

            for (int i = 0; i < Count; i++)
            {
                int id=m_LoginTasks.Dequeue();
                
                int PeerID = Peers.Count + 1;
                PeerBase peer = CreatePeer(Peers.Count + 1, GAMEID, ServerIP, ServerPort);
                Peers.Add(PeerID, peer);
                peer.Connect();
            }

            m_LastLoginTick = SystemCounter.TickCount64;
        }

        public void AddPeer(int Count)
        {   
            for(int i=0; i<Count; i++)
                m_LoginTasks.Enqueue(0);
        }
    }
}

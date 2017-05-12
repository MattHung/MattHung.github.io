using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SocketClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;

namespace ClientSocket
{
    public class JsonPeer : PeerBase
    {
        public class ProtocolData
        {
            public string Action;
            public string Data;

            public ProtocolData(string action)
            {
                Action = action;
                Data = "";
            }
        }

        private Dictionary<string, MethodInfo> m_RecvMethods = new Dictionary<string,MethodInfo>();

        public JsonPeer(int id, int gameID, string remoteIP, int remotePort)
            : base(id, gameID, remoteIP, remotePort)
        {
            m_Socket.OnTextMessage += m_Socket_OnTextMessage; ;
            Initial();
        }

        private List<MethodInfo> GetMethods()
        {
            List<MethodInfo> result = new List<MethodInfo>();
            Type type = GetType();

            while (type != null)
            {
                MethodInfo[] methods = type.UnderlyingSystemType.GetMethods(BindingFlags.NonPublic | BindingFlags.Instance);
                result.AddRange(methods);
                type = type.BaseType;
            }

            return result;
        }

        private void Initial()
        {
            MethodInfo[] methods = GetMethods().ToArray();

            for (int i = 0; i < methods.Length; i++)
            {
                if (!methods[i].Name.Contains("action_"))
                    continue;

                string action = methods[i].Name.Replace("action_", "");

                if (m_RecvMethods.ContainsKey(action))
                    continue;

                m_RecvMethods.Add(action, methods[i]);
            }
        }

        void m_Socket_OnTextMessage(object sender, TextMessageEvent e)
        {
            OnReceive(m_Socket, e.Text);
        }

        private void OnReceive(WebSocket Sender, string Message)
        {
            ProtocolText protocolText = null;

            protocolText = JsonConvert.DeserializeObject<ProtocolText>(Message);

            if (protocolText.GameID == 0)
            {
                SytemRecv(protocolText.Detail);
                return;
            }

            JObject jobj = JObject.Parse(protocolText.Detail);
            string action = jobj["Action"].ToString();

            if (!m_RecvMethods.ContainsKey(action))
                return;

            string json_str = jobj["Data"].ToString();

            JToken token = JToken.Parse(json_str);

            switch (token.Type)
            {
                case JTokenType.Object:
                    m_RecvMethods[action].Invoke(this, new object[] { protocolText, token as JObject });
                    break;
                case JTokenType.Array:
                    m_RecvMethods[action].Invoke(this, new object[] { protocolText, token as JArray });
                    break;
            }            
        }

        private void SytemRecv(string Message)
        {
            byte res = 0;

            JObject jobj = JObject.Parse(Message);

            int kind = Convert.ToInt32(jobj["subHeader"].ToString());

            if (jobj["res"] != null)
                res = Convert.ToByte(jobj["res"].ToString());
            switch (kind)
            {
                case 1://1:登入結果:  登入結果(1)
                    // 登入結果: 1 登入成功 + 玩家資料結構(Json)
                    //               2 登入失敗(api error) + error(s)
                    //               4 登入失敗(api 資訊不正確)  + error(s)                              
                    //               12 重複登入   
                    //               20:登入失敗-停押
                    //               21:登入失敗-停用
                    //               22:登入失敗-停權
                    //               23:登入失敗-凍結                    

                    if (res == 1)
                    {
                        var JsonStr = jobj["data"].ToString();
                        this.AccountSave = JsonConvert.DeserializeObject<ClientSocket.Types.AccountData>(JsonStr);
                    }

                    OnResponseLogin(res, AccountSave);

                    break;

                case 2://2:選擇遊戲結果:  選擇結果(1)
                    switch (res)
                    {
                        case 1://1:進入遊戲成功
                            break;

                        case 2://2:無此遊戲
                            break;
                    }

                    OnResponseEnterGame(res);
                    break;
                case 200://200:玩家斷線: 訊息(s)
                    string reason = jobj["reason"].ToString();
                    break;

                case 255://255:資產相關種類: OperationType(1) + request_succeed(1) + 換取額度(d8), 剩餘額度(d8)
                    // OperationType:  1:取得額度
                    //                 2:換取額度
                    //                 3:歸還額度

                    int operationType = Convert.ToInt32(jobj["opType"].ToString());
                    int succeed = Convert.ToInt32(jobj["succeed"].ToString());
                    double credit = Convert.ToDouble(jobj["credit"].ToString());
                    double balance = Convert.ToDouble(jobj["balance"].ToString());
                    break;
                default:
                    break;
            }
        }

        protected override void RequestLogin()
        {
            RequestLogin(PeerManager.Instance.LoginArg);
        }

        public void Recompensate()
        {

            //255:資產相關種類: OperationType(1) + 換分比min(4) +  換分比max(4) + 換取額度(d8)
            JObject jobj = new JObject();
            jobj.Add("subHeader", 255);

            jobj.Add("OperationType", 3);
            jobj.Add("Ratio_Min", 1);
            jobj.Add("Ratio_Max", 1);
            jobj.Add("Credit", 168);

            SendMessageInternal(0, jobj);
        }

        public void RequestLogin(LoginParam arg)
        {
            LoginParameter = arg;

            //0:基本功能: Option(1)            
            //    1:要求登入: GameID(4) +SessionID(s) + Platform(1) + HallID(4) + UserName(s) + UserID(4) + Browser(s) + OSType(s)

            JObject jobj = new JObject();
            jobj.Add("subHeader", 1);

            jobj.Add("GameID", GameID);
            jobj.Add("SessionID", LoginParameter.SessionID);
            jobj.Add("Platform", 1);
            jobj.Add("HallID", LoginParameter.HallID);
            jobj.Add("UserName", LoginParameter.UserName);
            jobj.Add("UserID", LoginParameter.UserID);
            jobj.Add("Browser", LoginParameter.Browser);
            jobj.Add("OSType", LoginParameter.OSType);

            SendMessageInternal(0, jobj);
        }

        private void SendMessageInternal(int HeadNO, JObject jobj)
        {
            if (m_Socket == null)
                return;
            
            ProtocolText requuest = new ProtocolText(HeadNO, "", jobj.ToString());
            string send_json = JsonConvert.SerializeObject(requuest);
            m_Socket.Send(send_json);
        }

        public void SendMessage(string action, JObject data)
        {
            string details = data.ToString();
            JObject jobj = new JObject();
            jobj.Add("Action", action);
            jobj.Add("Data", details);

            SendMessageInternal(GameID, jobj);            
        }

        public void SendMessage(string action, JArray data)
        {
            string details = data.ToString();
            JObject jobj = new JObject();
            jobj.Add("Action", action);
            jobj.Add("Data", details);

            SendMessageInternal(GameID, jobj);
        }

    }
}

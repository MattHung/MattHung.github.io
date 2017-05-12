using NetworkLibrary;
using Newtonsoft.Json;
using SocketClient;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Windows.Forms;
using Widget;

namespace ClientSocket
{
    public class BinaryPeer : PeerBase
    {
        private const int MaxProtocalNo = 1000;        
        private MethodInfo m_SystemRecv = null;
        private MethodInfo[] m_RecvMethods = new MethodInfo[MaxProtocalNo + 1];

        public BinaryPeer(int id, int gameID, string remoteIP, int remotePort)
            : base(id, gameID, remoteIP, remotePort)
        {
            m_Socket.OnBinaryMessage += m_Socket_OnBinaryMessage;
            Initial();
        }

        void m_Socket_OnBinaryMessage(object sender, BinaryMessageEvent e)
        {
            OnReceive(m_Socket, e.Stream);
        }

        private void Initial()
        {
            m_SystemRecv = typeof(BinaryPeer).GetMethod("SytemRecv", BindingFlags.NonPublic | BindingFlags.Instance);

            for (int i = 0; i <= MaxProtocalNo; i++)
                m_RecvMethods[i] = GetType().UnderlyingSystemType.GetMethod(string.Format("Recv_{0}", i), BindingFlags.NonPublic | BindingFlags.Instance);
        }

        protected override void RequestLogin()
        {
            RequestLogin(PeerManager.Instance.LoginArg);
        }

        public void Exchange()
        {
            //255:資產相關種類: OperationType(1) + 換分比min(4) +  換分比max(4) + 換取額度(d8)
            MemoryStream msg = new MemoryStream();
            ProtocolBuilder.Encode_FromByte(msg, 255);
            ProtocolBuilder.Encode_FromByte(msg, 2);
            ProtocolBuilder.Encode_FromInt(msg, ExchangeRatio_MIN);
            ProtocolBuilder.Encode_FromInt(msg, ExchangeRatio_MAX);
            ProtocolBuilder.Encode_FromDouble(msg, exchange_value);

            SendMessageInternal(0, msg);

            Console.WriteLine(string.Format("send exchange money = {0} at {1}", exchange_value, DateTime.Now.ToString()));
        }

        public void Recompensate()
        {
            //255:資產相關種類: OperationType(1) + 換分比min(4) +  換分比max(4) + 換取額度(d8)
            MemoryStream msg = new MemoryStream();
            ProtocolBuilder.Encode_FromByte(msg, 255);
            ProtocolBuilder.Encode_FromByte(msg, 3);
            ProtocolBuilder.Encode_FromInt(msg, ExchangeRatio_MIN);
            ProtocolBuilder.Encode_FromInt(msg, ExchangeRatio_MAX);
            ProtocolBuilder.Encode_FromDouble(msg, 999999999);
            //ProtocolBuilder.Encode_FromDouble(msg, Score);
            //ProtocolBuilder.Encode_FromDouble(msg, exchange_value);

            SendMessageInternal(0, msg);
        }

        private void SytemRecv(MemoryStream Message)
        {
            //0:基本功能            
            byte kind = ProtocolBuilder.Decode_ToByte(Message);
            MemoryStream Response = new MemoryStream();
            byte res = 0;

            switch (kind)
            {
                case 0://0:選擇對象伺服器結果(Contoller->Client): 是否成功(bool)
                    break;

                case 1://1:登入結果:  登入結果(1)                     
                    //1:登入結果:  GameID(4) + 登入結果(1) 
                    //登入結果: 1 登入成功 + 玩家資料結構(Json)
                    //              2 登入失敗(api error) + error(s)
                    //              4 登入失敗(api 資訊不正確) + error(s)
                    //              12 重複登入	

                    res = ProtocolBuilder.Decode_ToByte(Message);
                    AccountSave = default(ClientSocket.Types.AccountData);


                    switch (res)
                    {
                        case 1:
                            string JsonStr = ProtocolBuilder.Decode_ToString(Message);

                            AccountSave = JsonConvert.DeserializeObject<ClientSocket.Types.AccountData>(JsonStr);

                            //0:基本功能: Option(1)
                            //   2:選擇遊戲: GameID(4) 
                            ProtocolBuilder.Encode_FromByte(Response, 2);
                            ProtocolBuilder.Encode_FromInt(Response, GameID);
                            SendMessageInternal(0, Response);
                            break;
                        case 2:
                        case 4:
                            string error = ProtocolBuilder.Decode_ToString(Message);
                            Console.WriteLine(error);
                            MessageBox.Show(error);
                            break;
                    }

                    OnResponseLogin(res, AccountSave);
                    break;

                case 2://2:選擇遊戲結果:  選擇結果(1)
                    res = ProtocolBuilder.Decode_ToByte(Message);
                    switch (res)
                    {
                        case 1://1:進入遊戲成功
                            break;

                        case 2://2:無此遊戲
                            break;
                    }

                    OnResponseEnterGame(res);
                    break;

                case 200://玩家斷線: 訊息(s)
                    string msg = ProtocolBuilder.Decode_ToString(Message);
                    MessageBox.Show(msg);
                    break;

                case 255://255:資產相關種類: OperationType(1) + request_succeed(1) + 換取額度(d8), 剩餘額度(d8)
                    //OperationType: 1:取得額度
                    //               2:換取額度
                    //               3:歸還額度

                    byte OperationType = ProtocolBuilder.Decode_ToByte(Message);
                    byte succedd = ProtocolBuilder.Decode_ToByte(Message);

                    Score = -1;
                    Balance = -1;
                    if (succedd == 1)
                    {
                        Score = ProtocolBuilder.Decode_ToDouble(Message);
                        Balance = ProtocolBuilder.Decode_ToDouble(Message);

                        //Console.WriteLine(string.Format("recv exchange score = {0} at {1}", Score, DateTime.Now.ToString()));
                    }

                    if (Score == 0)
                        Exchange();

                    break;
            }
        }

        public void RequestLogin(LoginParam arg)
        {
            LoginParameter = arg;
            //0:基本功能: Option(1)            
            //    1:要求登入: GameID(4) +SessionID(s) + Platform(1) + HallID(4) + UserName(s) + UserID(4) + Browser(s) + OSType(s)
            MemoryStream Message = new MemoryStream();
            ProtocolBuilder.Encode_FromByte(Message, 1);
            ProtocolBuilder.Encode_FromInt(Message, GameID);
            ProtocolBuilder.Encode_FromString(Message, LoginParameter.SessionID);
            ProtocolBuilder.Encode_FromByte(Message, 1);
            ProtocolBuilder.Encode_FromInt(Message, LoginParameter.HallID);
            ProtocolBuilder.Encode_FromString(Message, LoginParameter.UserName);
            ProtocolBuilder.Encode_FromInt(Message, LoginParameter.UserID);
            ProtocolBuilder.Encode_FromString(Message, LoginParameter.Browser);
            ProtocolBuilder.Encode_FromString(Message, LoginParameter.OSType);
            SendMessageInternal(0, Message);
        }

        public void RefreshAsset()
        {
            //255:資產相關種類: OperationType(1) + 換分比min(4) +  換分比max(4) + 換取額度(d8)
            MemoryStream msg = new MemoryStream();
            ProtocolBuilder.Encode_FromByte(msg, 255);
            ProtocolBuilder.Encode_FromByte(msg, 1);
            ProtocolBuilder.Encode_FromInt(msg, 0);
            ProtocolBuilder.Encode_FromInt(msg, 0);
            ProtocolBuilder.Encode_FromDouble(msg, 0);

            SendMessageInternal(0, msg);
        }

        //int exchange_value = 50 * 10000;
        int exchange_value = 1000;
        //int exchange_value = Int32.MaxValue;

        private void OnReceive(WebSocket Sender, MemoryStream Message)
        {
            if (Message.Length <= 0)
                return;

            int Header = ProtocolBuilder.Decode_ToInt(Message);

            try
            {
                object[] objs = null;

                if (Header == SystemProtocalHeader)
                {
                    objs = new object[1] { Message };
                    m_SystemRecv.Invoke(this, objs);
                    return;
                }

                byte ProtocalNO = ProtocolBuilder.Decode_ToByte(Message);

                objs = new object[1] { Message };

                if (ProtocalNO >= 0)
                    if (ProtocalNO < m_RecvMethods.Length)
                        if (m_RecvMethods[ProtocalNO] != null)
                            m_RecvMethods[ProtocalNO].Invoke(this, objs);
            }
            catch (Exception e)
            {
                ExceptionRecorder.Add(e);
            }
        }

        private void SendMessageInternal(int HeadNO, MemoryStream Message)
        {
            if (m_Socket == null)
                return;
            MemoryStream Msg = new MemoryStream();
            ProtocolBuilder.Encode_FromInt(Msg, HeadNO);
            Msg.Write(Message.GetBuffer(), 0, (int)Message.Length);
            m_Socket.Send(Msg.ToArray());
        }

        public void SendMessage(byte ProtocalNO, MemoryStream Message)
        {
            MemoryStream Msg = new MemoryStream();
            ProtocolBuilder.Encode_FromByte(Msg, ProtocalNO);
            Msg.Write(Message.GetBuffer(), 0, (int)Message.Length);
            SendMessageInternal(GameID, Msg);
        }

    }
}

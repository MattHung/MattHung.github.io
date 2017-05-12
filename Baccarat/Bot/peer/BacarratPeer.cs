using ClientSocket.seat;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ClientSocket
{
    public class BacarratPeer : JsonPeer
    {        
        public const int ROOM_TYPE = 2;
        
        private static Random RANDOM = new Random(new Guid().GetHashCode());
        private string _status = "none";

        protected List<string> _room_list = new List<string>();
        protected List<BacarratSeat> _seats = new List<BacarratSeat>();       

        public BacarratPeer(int id, int game_id, string remoteIP, int remotePort)
            :base(id, game_id, remoteIP, remotePort)
        {

            for (int i = 0; i <= 7; i++)
                _seats.Add(CreateSeat(i));
        }

        protected virtual BacarratSeat CreateSeat(int seat_id)
        {
            return new BacarratSeat(seat_id);
        }

        public override void OnResponseEnterGame(byte res)
        {
            base.OnResponseEnterGame(res);

            int room_id = Form1.Instance.GetSelectedRoomID();

            if (room_id <= 0)
                return;

            SendMessage("EnterRoom", new JObject(
                new JProperty("RoomID", room_id)
                ));
        }

        public override void Update()
        {
            base.Update();
            UpdateAdditionInfo();
        }

        protected virtual void UpdateAdditionInfo()
        {
            AdditionInfo = string.Format(" Status: {0}", _status);
        }

        private void requestSeat(int seat_id)
        {
            //請求入座: TakeSeat: {RoomID: 10001, SeatID:1}
            SendMessage("TakeSeat", new JObject(
                new JProperty("RoomID", RoomID),
                new JProperty("SeatID", seat_id)
                ));
        }

        private void action_RoomList(ProtocolText proto, JObject content)
        {
            _room_list.Clear();

            JArray array = content["Rooms"] as JArray;

            int room_id = 0;

            for (int i = 0; i < array.Count; i++)
            {
                JObject jobj = array[i] as JObject;

                room_id = Convert.ToInt32(jobj["RoomID"].ToString());
                int tickets = Convert.ToInt32(jobj["TotalTickets"].ToString());
                _room_list.Add(string.Format("{0} / {1}", room_id, tickets));
            }

            Form1.Instance.UpdateRoomList(_room_list);
        }

        private void action_RoundStatus(ProtocolText proto, JObject content)
        {
            _status = content["Status"].ToString();
        }

        protected virtual void action_EnterRoom(ProtocolText proto, JObject content)
        {            
            int result = Convert.ToInt32(content["Result"].ToString());

            if (result != 1)
                return;


            RoomID = Convert.ToInt32(content["RoomID"].ToString());
        }

        private void action_LeaveRoom(ProtocolText proto, JObject content)
        {
            int result = Convert.ToInt32(content["Result"].ToString());

            if (result != 1)
                return;

            int user_id = Convert.ToInt32(content["UserID"].ToString());
            int seat_id = Convert.ToInt32(content["SeatID"].ToString());

            _seats[seat_id].Clear();

            if(user_id==AccountSave.UserID)
            {
                RoomID = 0;
                SeatID = 0;
            }
        }

        private void action_TakeSeat(ProtocolText proto, JObject content)
        {            
            int result = Convert.ToInt32(content["Result"].ToString());

            if (result != 1)
                return;

            SeatID = Convert.ToInt32(content["SeatID"].ToString());
        }
        
        private void action_RoomInfo(ProtocolText proto, JArray content)
        {
            for (int i = 0; i < content.Count; i++)
            {
                JObject jobj = content[i] as JObject;

                int seat_id = Convert.ToInt32(jobj["SeatID"].ToString());
                int user_id = Convert.ToInt32(jobj["UserID"].ToString());

                _seats[seat_id].TakeSeat(user_id);
            }

            if (SeatID == 0)
            {
                for(int i=1; i<_seats.Count; i++)
                if (_seats[i].UserID == 0)
                {
                    requestSeat(i);
                    return;
                }
            }
        }

        private void action_CountDown(ProtocolText proto, JObject content)
        {
            int reaminTicks = Convert.ToInt32(content["RemainTick"].ToString());

            //請求下注: PlaceBet: {BetArea: 1, Amount:10}
            //SendMessage("PlaceBet", new JObject(
            //    new JProperty("BetArea", RANDOM.Next(1, 4)),
            //    new JProperty("Amount", 10),
            //    new JProperty("Hide", RANDOM.Next(0, 2)),
            //    new JProperty("Pass", 0)
            //    ) );

            //請求下注: PlaceBet: {Hide:0, Pass: 0, Bet: [{BetArea: 1, Amount:10}]}

            if (!Form1.Instance.AutoBet)
                return;

            JObject jobg = new JObject();
            jobg.Add("Hide", RANDOM.Next(0, 2));
            jobg.Add("Pass", RANDOM.Next(0, 2));

            JArray data = new JArray();
            data.Add(new JObject(
                new JProperty("BetArea", RANDOM.Next(1, 4)),
                new JProperty("Amount", Form1.Instance.GetBetAmount())
                ));

            jobg.Add("Bet", data);
            
            SendMessage("PlaceBet", jobg);
        }
    }
}

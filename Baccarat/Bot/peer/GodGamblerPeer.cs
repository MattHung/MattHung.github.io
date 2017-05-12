using ClientSocket.seat;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ClientSocket.peer
{
    public class GodGamblerPeer :BacarratPeer
    {
        public int TableID { get; private set; }
        public GodGamblerPeer(int id, int game_id, string remoteIP, int remotePort)
            : base(id, game_id, remoteIP, remotePort)
        {
        }

        protected override BacarratSeat CreateSeat(int seat_id)
        {
            return new GodGamblerSeat(seat_id);
        }

        protected override void UpdateAdditionInfo()
        {
            base.UpdateAdditionInfo();

            
            AdditionInfo += string.Format(" TableID:{0}", TableID);

            if (SeatID>0)
                AdditionInfo += string.Format("  chip: {0}", (_seats[SeatID] as GodGamblerSeat).Chips);
        }

        protected override void action_EnterRoom(PeerBase.ProtocolText proto, JObject content)
        {
            base.action_EnterRoom(proto, content);

            TableID = Convert.ToInt32(content["TableID"].ToString());
        }

        //廣播籌碼資訊: ChipInfo : {"SeatID":1,"User":1384,"Chips":300000}
        private void action_ChipInfo(ProtocolText proto, JObject content)
        {
            int seat_id = Convert.ToInt32(content["SeatID"].ToString());
            int amount = Convert.ToInt32(content["Chips"].ToString());

            (_seats[seat_id] as GodGamblerSeat).BuyIn(amount);
        }
    }
}

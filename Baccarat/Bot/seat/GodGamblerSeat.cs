using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ClientSocket.seat
{
    public class GodGamblerSeat :BacarratSeat
    {
        public int Chips { get; private set; }

        public GodGamblerSeat(int seat_id)
            :base(seat_id)
        {
            
        }

        public void BuyIn(int amount)
        {
            Chips = amount;
        }

        public override void Clear()
        {
            base.Clear();
            Chips = 0;
        }
    }
}

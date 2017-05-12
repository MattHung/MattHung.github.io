using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ClientSocket.seat
{
    public class BacarratSeat
    {
        public int SeatID { get; private set; }
        public int UserID { get; private set; }

        public BacarratSeat(int seat_id)
        {
            SeatID = seat_id;
        }

        public void TakeSeat(int user_id)
        {
            UserID = user_id;
        }

        public virtual void Clear()
        {
            UserID = 0;
        }
    }
}

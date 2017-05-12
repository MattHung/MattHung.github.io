using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ClientSocket
{
    public class Types
    {
        public struct AccountData
        {
            public int UserID;
            public int HallID;
            public String UserName;
            public double Balance;
            public String PayWay;
            public int SCID;
            public int COID;
            public int SAID;
            public int AGID;
            public int SCRate;
            public int CORate;
            public int SARate;
            public int AGRate;
            public String Currency;
        }

        public class fish_data
        {
            public int Type;
            public int Speed;

            public int Width;
            public int Height;
        }
    }
}

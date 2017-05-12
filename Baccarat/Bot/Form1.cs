using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using System.IO;
using System.Diagnostics;
using NetworkLibrary;
using System.Reflection;
using Widget;
using System.Net;
using EventAgent;
using System.Threading;
using Newtonsoft.Json;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using ClientSocket.peer;
using Newtonsoft.Json.Linq;

namespace ClientSocket
{
    public partial class Form1 : Form
    {
        public static Point[] CANNON_POSITION = { new Point(0, 0), new Point(0, 0), new Point(0, 0), new Point(0, 0) };
        public const int SCENE_FARM_WIDTH = 1920;
        public const int SCENE_FARM_HEIGHT = 1080;
        public const int SCENE_WIDTH = SCENE_FARM_WIDTH * 2;
        public const int SCENE_HEIGHT = SCENE_FARM_HEIGHT * 2;
        public const double SCREEN_RATIO = 1280f / SCENE_WIDTH;
        private Bitmap _image_bg = new Bitmap(@"resources\bg.jpg");
        private Dictionary<string, Bitmap> m_Image_caches = new Dictionary<string, Bitmap>();
        private Dictionary<int, Bitmap> _Image_bullets = new Dictionary<int, Bitmap>();
        private Dictionary<int, Bitmap> _Image_bullets_net = new Dictionary<int, Bitmap>();
        private Dictionary<int, Bitmap> _image_fishes = new Dictionary<int, Bitmap>();
        public static Bitmap Image_cannon_up = new Bitmap(@"resources\gun_up.png");
        public static Bitmap Image_cannon_down = new Bitmap(@"resources\gun_down.png");
                
        private Worker _work_render = null;
        private Worker _work_socket = null;
        
        private CriticalSection m_Critical_Current_SelectedIndex = new CriticalSection();
        private int m_Current_SelectedIndex = 0;
        private int m_current_fps = 0;
        
        public static string StartupCommand_PressureTest = "PresureTest";
        public static bool PressureTestMode = false;
                
        public int FPS { get;private set; }
        
        public int SelectedPeerID
        {
            get
            {
                int result = -1;

                if (list_players.SelectedIndex >= 0)
                {
                    string text = list_players.Items[list_players.SelectedIndex].ToString();

                    result = Convert.ToInt32(text.Split(':')[0]);
                }

                return result;
            }
        }
        public TickEvent TickEvent = new TickEvent();
        public StandardTimeEvent StandardTimeEvent = new StandardTimeEvent();

        public bool AutoBet = false;

        public static Form1 Instance = null;

        public static Random RandomObject = new Random(Environment.TickCount);

        private int _current_selected_room_id = 0;
        public int GetSelectedRoomID()
        {
            return _current_selected_room_id;
        }

        public int GetBetAmount()
        {
            int result = 0;

            int.TryParse(textBox1.Text, out result);

            return result;
        }

        public void UpdateRoomList(List<string> room_list)
        {
            this.Invoke(new Action(() =>
                    {
                        cb_room_list.Items.Clear();

                        for (int i = 0; i < room_list.Count; i++)
                            cb_room_list.Items.Add(room_list[i]);

                        int str_index = cb_room_list.Text.IndexOf("/");

                        if (str_index > -1)
                        {
                            int room_id = Convert.ToInt32(cb_room_list.Text.Substring(0, str_index));

                            _current_selected_room_id = room_id;
                        }
                    }
                ));
        }

        public Form1(string[] args)
        {
            Instance = this;
            InitializeComponent();
         
            SocketClient.SocketClient.Initialization();
            ExceptionRecorder.Initialization();

            if (args.Length > 0)
                if (args[0] == StartupCommand_PressureTest)
                {
                    PressureTestMode = true;
                    Text = "(PressureTestMode) " + Text;
                    TickEvent.Add(1000, Btn_Start.PerformClick);
                    TickEvent.Add((ulong)(RandomObject.Next(10 * 1000, 40 * 1000)), Environment.Exit, Environment.ExitCode);
                }

            int workerThreads;
            int completionPortThreads;
            ThreadPool.GetMaxThreads(out workerThreads, out completionPortThreads);
            ThreadPool.SetMaxThreads(workerThreads, 10);
                        
            HttpWrapper.Initialization();

            _work_render = new Worker(OnRender, true, 30);
            _work_socket = new Worker(SocketClient.SocketClient.Update, true, 10);
            
            TB_IP.SelectedIndex = 0;
            updateAutoBetValue();
        }

        public void ShowMessage(string msg)
        {
            Invoke((MethodInvoker)delegate
            {
                toolStripStatusLabel1.Text = msg;
                statusStrip1.Refresh();
            });
        }

        private void Form1_FormClosing(object sender, FormClosingEventArgs e)
        {
            
        }
        
        private void timer1_Tick(object sender, EventArgs e)
        {
            try
            {                
                PeerManager.Instance.Update();

                if (PeerManager.Instance.LoginArg.SessionID != "")
                if (Btn_Start.Enabled!=true)
                    Btn_Start.Enabled = true;

                ExceptionRecorder.ExecuteOutput();                

                m_Critical_Current_SelectedIndex.Enter();
                m_Current_SelectedIndex = list_players.SelectedIndex;
                m_Critical_Current_SelectedIndex.Leave();

                TickEvent.Update();
                StandardTimeEvent.Update();
            }
            catch (Exception ex)
            {
                ExceptionRecorder.Add(ex);
            }
        }

        private void timer_Control_Tick(object sender, EventArgs e)
        {
            try
            {   
                UpdateControls();
                
            }
            catch (Exception ex)
            {
                ExceptionRecorder.Add(ex);
            }
        }

        private void timer_ui_Tick(object sender, EventArgs e)
        {
            try
            {
                OnUpdateUI();
            }
            catch (Exception ex)
            {
                ExceptionRecorder.Add(ex);
            }
        }

        private void Btn_Start_Click(object sender, EventArgs e)
        {
            IPAddress IP = Dns.GetHostAddresses(TB_IP.Text)[0];

            if (IP == null)
            {
                MessageBox.Show("Invalid IPAddress", "Error");
                return;
            }

            int Count = 0;
            if (!Int32.TryParse(TB_BotCount.Text, out Count))
                return;
            if (Count == 0)
                return;
            
            PeerManager.Instance.SetRemoteIP(TB_IP.Text);
            PeerManager.Instance.AddPeer(Count);
        }

        private BacarratPeer getPeer()
        {
            int selected_index = -1;
            m_Critical_Current_SelectedIndex.Enter();
            selected_index = m_Current_SelectedIndex; ;
            m_Critical_Current_SelectedIndex.Leave();

            int peer_id = selected_index + 1;

            if (PeerManager.Instance.Peers.ContainsKey(peer_id))
                return PeerManager.Instance.Peers[peer_id] as BacarratPeer;

            return null;
        }

        private void UpdateControls()
        {
            BacarratPeer peer = getPeer();
        }      

        private void OnUpdateUI()
        {
            lb_player_count.Text = String.Format("Count : {0}", PeerManager.Instance.Peers.Count);

            int peer_index = 0;

            foreach (BacarratPeer peer in PeerManager.Instance.Peers.Values)
            {
                string info = string.Format("{0}: Room:{1} Seat:{2} $:{3} Balance:{4}", peer.ID, peer.RoomID, peer.SeatID, peer.Score, peer.Balance);

                if (peer.AdditionInfo != string.Empty)
                    info += string.Format(" Addition: {0}", peer.AdditionInfo);

                peer_index++;
                if (list_players.Items.Count < peer_index)
                    list_players.Items.Add(info);

                string str_peer_index = peer_index.ToString();

                while (str_peer_index.Length < 3)
                    str_peer_index = "0" + str_peer_index;

                if (info != list_players.Items[peer_index - 1].ToString())
                    list_players.Items[peer_index - 1] = info;
            }
        }      

        private void DrawFPS(Graphics g)
        {
            using (Font font1 = new Font("Arial", 10, FontStyle.Regular, GraphicsUnit.Point))
            {
                int top = 0;
                Rectangle rect1 = new Rectangle((int)0, (int)top, 100, 30);

                // Create a StringFormat object with the each line of text, and the block
                // of text centered on the page.
                StringFormat stringFormat = new StringFormat();
                stringFormat.Alignment = StringAlignment.Near;
                stringFormat.LineAlignment = StringAlignment.Near;

                // Draw the text and the surrounding rectangle.
                g.DrawString(FPS.ToString(), font1, Brushes.Red, rect1);
            }
        }    

        private void OnRender()
        {
            try
            {
                //if (pictureBox1 != null)
                //    pictureBox1.Invalidate();
            }
            catch (Exception e)
            {
                ExceptionRecorder.Add(e);
            }
        }
       

        private void Btn_Close_Click(object sender, EventArgs e)
        {
            if (MessageBox.Show("Exit Application ??", "WARNING", MessageBoxButtons.YesNo) == DialogResult.Yes)
                Environment.Exit(Environment.ExitCode);
        }

        private void timer_rest_fps_Tick(object sender, EventArgs e)
        {
            FPS = m_current_fps;
            m_current_fps = 0;
        }

        private void button7_Click(object sender, EventArgs e)
        {
         
        }

        private void button1_Click(object sender, EventArgs e)
        {
            foreach(GodGamblerPeer peer in PeerManager.Instance.Peers.Values){
                peer.SendMessage("LeaveRoom", new JObject(
                            new JProperty("RoomID", peer.RoomID)
                            ));

            }
        }

        private void checkBox1_CheckedChanged(object sender, EventArgs e)
        {
            updateAutoBetValue();
        }

        private void updateAutoBetValue()
        {
            AutoBet = checkBox1.Checked;
        }

        private void button6_Click(object sender, EventArgs e)
        {
            foreach (GodGamblerPeer peer in PeerManager.Instance.Peers.Values)
            {
                peer.Recompensate();
                return;
            }
        }
    }
}

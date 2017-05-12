namespace ClientSocket
{
    partial class Form1
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            this.Btn_Start = new System.Windows.Forms.Button();
            this.timer1 = new System.Windows.Forms.Timer(this.components);
            this.TB_BotCount = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.timer_Control = new System.Windows.Forms.Timer(this.components);
            this.panel1 = new System.Windows.Forms.Panel();
            this.label3 = new System.Windows.Forms.Label();
            this.listBox1 = new System.Windows.Forms.ListBox();
            this.listBox2 = new System.Windows.Forms.ListBox();
            this.label4 = new System.Windows.Forms.Label();
            this.Btn_Close = new System.Windows.Forms.Button();
            this.timer_ui = new System.Windows.Forms.Timer(this.components);
            this.tabControl1 = new System.Windows.Forms.TabControl();
            this.tabPage1 = new System.Windows.Forms.TabPage();
            this.list_players = new System.Windows.Forms.ListBox();
            this.lb_player_count = new System.Windows.Forms.Label();
            this.button2 = new System.Windows.Forms.Button();
            this.button3 = new System.Windows.Forms.Button();
            this.button4 = new System.Windows.Forms.Button();
            this.button5 = new System.Windows.Forms.Button();
            this.timer_rest_fps = new System.Windows.Forms.Timer(this.components);
            this.statusStrip1 = new System.Windows.Forms.StatusStrip();
            this.toolStripStatusLabel1 = new System.Windows.Forms.ToolStripStatusLabel();
            this.TB_IP = new System.Windows.Forms.ComboBox();
            this.cb_room_list = new System.Windows.Forms.ComboBox();
            this.button1 = new System.Windows.Forms.Button();
            this.checkBox1 = new System.Windows.Forms.CheckBox();
            this.button6 = new System.Windows.Forms.Button();
            this.textBox1 = new System.Windows.Forms.TextBox();
            this.label2 = new System.Windows.Forms.Label();
            this.panel1.SuspendLayout();
            this.tabControl1.SuspendLayout();
            this.tabPage1.SuspendLayout();
            this.statusStrip1.SuspendLayout();
            this.SuspendLayout();
            // 
            // Btn_Start
            // 
            this.Btn_Start.Enabled = false;
            this.Btn_Start.Location = new System.Drawing.Point(172, 26);
            this.Btn_Start.Name = "Btn_Start";
            this.Btn_Start.Size = new System.Drawing.Size(196, 23);
            this.Btn_Start.TabIndex = 0;
            this.Btn_Start.Text = "Add";
            this.Btn_Start.UseVisualStyleBackColor = true;
            this.Btn_Start.Click += new System.EventHandler(this.Btn_Start_Click);
            // 
            // timer1
            // 
            this.timer1.Enabled = true;
            this.timer1.Interval = 10;
            this.timer1.Tick += new System.EventHandler(this.timer1_Tick);
            // 
            // TB_BotCount
            // 
            this.TB_BotCount.Location = new System.Drawing.Point(439, 2);
            this.TB_BotCount.Name = "TB_BotCount";
            this.TB_BotCount.Size = new System.Drawing.Size(104, 22);
            this.TB_BotCount.TabIndex = 7;
            this.TB_BotCount.Text = "1";
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(376, 8);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(54, 12);
            this.label1.TabIndex = 8;
            this.label1.Text = "BotCount:";
            // 
            // timer_Control
            // 
            this.timer_Control.Enabled = true;
            this.timer_Control.Interval = 10;
            this.timer_Control.Tick += new System.EventHandler(this.timer_Control_Tick);
            // 
            // panel1
            // 
            this.panel1.BackColor = System.Drawing.Color.Honeydew;
            this.panel1.Controls.Add(this.label3);
            this.panel1.Controls.Add(this.listBox1);
            this.panel1.Location = new System.Drawing.Point(729, 15);
            this.panel1.Name = "panel1";
            this.panel1.Size = new System.Drawing.Size(816, 567);
            this.panel1.TabIndex = 8;
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(12, 11);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(38, 12);
            this.label3.TabIndex = 1;
            this.label3.Text = "Total:0";
            // 
            // listBox1
            // 
            this.listBox1.FormattingEnabled = true;
            this.listBox1.ItemHeight = 12;
            this.listBox1.Location = new System.Drawing.Point(14, 24);
            this.listBox1.Name = "listBox1";
            this.listBox1.Size = new System.Drawing.Size(230, 520);
            this.listBox1.TabIndex = 0;
            // 
            // listBox2
            // 
            this.listBox2.FormattingEnabled = true;
            this.listBox2.Location = new System.Drawing.Point(20, 35);
            this.listBox2.Name = "listBox2";
            this.listBox2.Size = new System.Drawing.Size(703, 537);
            this.listBox2.TabIndex = 6;
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Font = new System.Drawing.Font("PMingLiU", 11.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(136)));
            this.label4.Location = new System.Drawing.Point(20, 12);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(75, 15);
            this.label4.TabIndex = 7;
            this.label4.Text = "TotalCount:";
            // 
            // Btn_Close
            // 
            this.Btn_Close.Location = new System.Drawing.Point(549, 2);
            this.Btn_Close.Name = "Btn_Close";
            this.Btn_Close.Size = new System.Drawing.Size(76, 41);
            this.Btn_Close.TabIndex = 11;
            this.Btn_Close.Text = "Close";
            this.Btn_Close.UseVisualStyleBackColor = true;
            this.Btn_Close.Click += new System.EventHandler(this.Btn_Close_Click);
            // 
            // timer_ui
            // 
            this.timer_ui.Enabled = true;
            this.timer_ui.Tick += new System.EventHandler(this.timer_ui_Tick);
            // 
            // tabControl1
            // 
            this.tabControl1.Controls.Add(this.tabPage1);
            this.tabControl1.Location = new System.Drawing.Point(16, 54);
            this.tabControl1.Name = "tabControl1";
            this.tabControl1.SelectedIndex = 0;
            this.tabControl1.Size = new System.Drawing.Size(751, 741);
            this.tabControl1.TabIndex = 16;
            // 
            // tabPage1
            // 
            this.tabPage1.Controls.Add(this.list_players);
            this.tabPage1.Location = new System.Drawing.Point(4, 22);
            this.tabPage1.Name = "tabPage1";
            this.tabPage1.Padding = new System.Windows.Forms.Padding(3);
            this.tabPage1.Size = new System.Drawing.Size(743, 715);
            this.tabPage1.TabIndex = 0;
            this.tabPage1.Text = "Game";
            this.tabPage1.UseVisualStyleBackColor = true;
            // 
            // list_players
            // 
            this.list_players.FormattingEnabled = true;
            this.list_players.ItemHeight = 12;
            this.list_players.Location = new System.Drawing.Point(0, -1);
            this.list_players.Name = "list_players";
            this.list_players.Size = new System.Drawing.Size(737, 712);
            this.list_players.TabIndex = 17;
            // 
            // lb_player_count
            // 
            this.lb_player_count.AutoSize = true;
            this.lb_player_count.Location = new System.Drawing.Point(323, 58);
            this.lb_player_count.Name = "lb_player_count";
            this.lb_player_count.Size = new System.Drawing.Size(46, 12);
            this.lb_player_count.TabIndex = 18;
            this.lb_player_count.Text = "count : 0";
            // 
            // button2
            // 
            this.button2.Location = new System.Drawing.Point(435, 813);
            this.button2.Name = "button2";
            this.button2.Size = new System.Drawing.Size(168, 23);
            this.button2.TabIndex = 17;
            this.button2.Tag = "180/180/360";
            this.button2.Text = "Simulator_Cannon1";
            this.button2.UseVisualStyleBackColor = true;
            // 
            // button3
            // 
            this.button3.Location = new System.Drawing.Point(609, 812);
            this.button3.Name = "button3";
            this.button3.Size = new System.Drawing.Size(168, 23);
            this.button3.TabIndex = 18;
            this.button3.Tag = "180/180/360";
            this.button3.Text = "Simulator_Cannon2";
            this.button3.UseVisualStyleBackColor = true;
            // 
            // button4
            // 
            this.button4.Location = new System.Drawing.Point(783, 811);
            this.button4.Name = "button4";
            this.button4.Size = new System.Drawing.Size(168, 23);
            this.button4.TabIndex = 19;
            this.button4.Tag = "0/0/180";
            this.button4.Text = "Simulator_Cannon3";
            this.button4.UseVisualStyleBackColor = true;
            // 
            // button5
            // 
            this.button5.Location = new System.Drawing.Point(957, 811);
            this.button5.Name = "button5";
            this.button5.Size = new System.Drawing.Size(168, 23);
            this.button5.TabIndex = 20;
            this.button5.Tag = "0/0/180";
            this.button5.Text = "Simulator_Cannon4";
            this.button5.UseVisualStyleBackColor = true;
            // 
            // timer_rest_fps
            // 
            this.timer_rest_fps.Enabled = true;
            this.timer_rest_fps.Interval = 1000;
            this.timer_rest_fps.Tick += new System.EventHandler(this.timer_rest_fps_Tick);
            // 
            // statusStrip1
            // 
            this.statusStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.toolStripStatusLabel1});
            this.statusStrip1.Location = new System.Drawing.Point(0, 801);
            this.statusStrip1.Name = "statusStrip1";
            this.statusStrip1.Size = new System.Drawing.Size(803, 22);
            this.statusStrip1.TabIndex = 30;
            this.statusStrip1.Text = "statusStrip1";
            // 
            // toolStripStatusLabel1
            // 
            this.toolStripStatusLabel1.Name = "toolStripStatusLabel1";
            this.toolStripStatusLabel1.Size = new System.Drawing.Size(0, 17);
            // 
            // TB_IP
            // 
            this.TB_IP.FormattingEnabled = true;
            this.TB_IP.Items.AddRange(new object[] {
            "127.0.0.1",
            "103.240.216.95",
            "10.251.31.146",
            "10.251.31.149",
            "fishjoy-gsz.com"});
            this.TB_IP.Location = new System.Drawing.Point(99, 2);
            this.TB_IP.Name = "TB_IP";
            this.TB_IP.Size = new System.Drawing.Size(226, 20);
            this.TB_IP.TabIndex = 18;
            // 
            // cb_room_list
            // 
            this.cb_room_list.FormattingEnabled = true;
            this.cb_room_list.Location = new System.Drawing.Point(16, 28);
            this.cb_room_list.Name = "cb_room_list";
            this.cb_room_list.Size = new System.Drawing.Size(141, 20);
            this.cb_room_list.TabIndex = 31;
            // 
            // button1
            // 
            this.button1.Location = new System.Drawing.Point(631, 2);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(132, 41);
            this.button1.TabIndex = 32;
            this.button1.Text = "LeaveRoom";
            this.button1.UseVisualStyleBackColor = true;
            this.button1.Click += new System.EventHandler(this.button1_Click);
            // 
            // checkBox1
            // 
            this.checkBox1.AutoSize = true;
            this.checkBox1.Checked = true;
            this.checkBox1.CheckState = System.Windows.Forms.CheckState.Checked;
            this.checkBox1.Location = new System.Drawing.Point(12, 8);
            this.checkBox1.Name = "checkBox1";
            this.checkBox1.Size = new System.Drawing.Size(63, 16);
            this.checkBox1.TabIndex = 33;
            this.checkBox1.Text = "AutoBet";
            this.checkBox1.UseVisualStyleBackColor = true;
            this.checkBox1.CheckedChanged += new System.EventHandler(this.checkBox1_CheckedChanged);
            // 
            // button6
            // 
            this.button6.Location = new System.Drawing.Point(775, 4);
            this.button6.Name = "button6";
            this.button6.Size = new System.Drawing.Size(28, 23);
            this.button6.TabIndex = 34;
            this.button6.Text = "r";
            this.button6.UseVisualStyleBackColor = true;
            this.button6.Click += new System.EventHandler(this.button6_Click);
            // 
            // textBox1
            // 
            this.textBox1.Location = new System.Drawing.Point(441, 28);
            this.textBox1.Name = "textBox1";
            this.textBox1.Size = new System.Drawing.Size(100, 22);
            this.textBox1.TabIndex = 35;
            this.textBox1.Text = "11000";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(378, 31);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(59, 12);
            this.label2.TabIndex = 36;
            this.label2.Text = "BetAmount";
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 12F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(803, 823);
            this.ControlBox = false;
            this.Controls.Add(this.label2);
            this.Controls.Add(this.textBox1);
            this.Controls.Add(this.button6);
            this.Controls.Add(this.checkBox1);
            this.Controls.Add(this.button1);
            this.Controls.Add(this.cb_room_list);
            this.Controls.Add(this.TB_IP);
            this.Controls.Add(this.statusStrip1);
            this.Controls.Add(this.lb_player_count);
            this.Controls.Add(this.button5);
            this.Controls.Add(this.button4);
            this.Controls.Add(this.button3);
            this.Controls.Add(this.button2);
            this.Controls.Add(this.tabControl1);
            this.Controls.Add(this.Btn_Close);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.TB_BotCount);
            this.Controls.Add(this.Btn_Start);
            this.DoubleBuffered = true;
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.Fixed3D;
            this.KeyPreview = true;
            this.Name = "Form1";
            this.Text = "Bot";
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.Form1_FormClosing);
            this.panel1.ResumeLayout(false);
            this.panel1.PerformLayout();
            this.tabControl1.ResumeLayout(false);
            this.tabPage1.ResumeLayout(false);
            this.statusStrip1.ResumeLayout(false);
            this.statusStrip1.PerformLayout();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button Btn_Start;
        private System.Windows.Forms.Timer timer1;
        private System.Windows.Forms.TextBox TB_BotCount;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Timer timer_Control;
        private System.Windows.Forms.Panel panel1;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.ListBox listBox1;
        private System.Windows.Forms.ListBox listBox2;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.Button Btn_Close;
        private System.Windows.Forms.Timer timer_ui;
        private System.Windows.Forms.TabControl tabControl1;
        private System.Windows.Forms.TabPage tabPage1;
        private System.Windows.Forms.Label lb_player_count;
        private System.Windows.Forms.ListBox list_players;
        private System.Windows.Forms.Button button2;
        private System.Windows.Forms.Button button3;
        private System.Windows.Forms.Button button4;
        private System.Windows.Forms.Button button5;
        private System.Windows.Forms.Timer timer_rest_fps;
        private System.Windows.Forms.StatusStrip statusStrip1;
        private System.Windows.Forms.ToolStripStatusLabel toolStripStatusLabel1;
        private System.Windows.Forms.ComboBox TB_IP;
        private System.Windows.Forms.ComboBox cb_room_list;
        private System.Windows.Forms.Button button1;
        private System.Windows.Forms.CheckBox checkBox1;
        private System.Windows.Forms.Button button6;
        private System.Windows.Forms.TextBox textBox1;
        private System.Windows.Forms.Label label2;
    }
}


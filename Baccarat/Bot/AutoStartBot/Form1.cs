using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;

namespace AutoStartBot
{
    public partial class Form1 : Form
    {
        public static string StartupCommand_PressureTest = "PresureTest";
        public const string ExeLocation = "ClientSocket.exe";
        public Form1()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {

            switch (((Button)sender).Text)
            {
                case "Start":
                    timer1.Enabled = true;
                    StartBotApplication();
                    ((Button)sender).Text = "Stop";
                    break;
                case "Stop":
                    timer1.Enabled = false;
                    ((Button)sender).Text = "Start";
                    break;
            }
        }

        private void timer1_Tick(object sender, EventArgs e)
        {
            StartBotApplication();
        }

        private void StartBotApplication()
        {
            ProcessStartInfo startInfo = new ProcessStartInfo(ExeLocation);
            startInfo.Arguments = StartupCommand_PressureTest;
            Process.Start(startInfo);
        }
    }
}

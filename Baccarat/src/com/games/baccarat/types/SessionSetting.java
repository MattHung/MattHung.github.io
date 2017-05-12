package com.games.baccarat.types;

import java.sql.Time;
import java.util.Calendar;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

/**
 * Created by matt1201 on 2016/12/22.
 */
public class SessionSetting {
    public String Name;
    public boolean DefaultSession;
    public int Requirement;
    public Calendar ApplyDate;
    public Time ApplyTimeBegin;
    public Time ApplyTimeEnd;
    public SessionSettingType SettingType;
    public int RunningMinutes;

    public Time SessionStartTime;
    public int TotalReward;
    public List<Integer> RankReward = new LinkedList<>();

    public int HallID;
    public int PassCount;
    public int HideCount;

    public int RoomID;
    public int Max_enroll_count = 0;
    public int Entrance_fee = 0;
    public int Service_fee = 0;
    public int Initial_chips = 0;

    public int MinBet = 0;
    public int MaxBet = 0;

    public int PassTimes = 0;   //過牌次數
    public int HideTimes = 0;   //暗注次數
    public int ResumeTimes =0;  //斷線離局次數 (EX離開時間不可超過2局，若超過則自動淘汰)

    @Override
    public String toString() {
        return String.format("%s :%s-%s", String.format("%d/%d/%d",
                ApplyDate.get(Calendar.YEAR), ApplyDate.get(Calendar.MONTH) + 1, ApplyDate.get(Calendar.DAY_OF_MONTH)),
                ApplyTimeBegin, ApplyTimeEnd);
    }
}

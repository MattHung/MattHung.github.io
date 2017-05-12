package com.games.baccarat.types;

/**
 * Created by matt1201 on 2017/1/17.
 */
public class SQLQuerys {
    public static String QUERY_PARTICIPATOR_CMD_TODAY = "select count(*) as count from Wagers\n" +
            " where GameType = %d\n" +
            "and WagersType = 1\n" +
            "and DATE(DATE_ADD(WagersDate, INTERVAL 12 HOUR)) = DATE(Now())";
    public static String QUERY_PARTICIPATOR_CMD_PAST = "select count(*) as count from Wagers\n" +
            " where GameType = %d\n" +
            "and WagersType = 1\n" +
            "and DATE(DATE_ADD(WagersDate, INTERVAL 12 HOUR)) < DATE(Now())";
    public static String QUERY_RANK_CMD_TODAY = "select UserID, AuthNumber as UserName, (Payoff + BetAmount) as Payoff, DATE_ADD(WagersDate, INTERVAL 12 HOUR) as dateTime " +
            "from Wagers\n" +
            "where GameType = %d\n" +
            "and WagersType = 1\n" +
            "and DATE(DATE_ADD(WagersDate, INTERVAL 12 HOUR)) = '%s'\n" +
            "and Payoff > 0\n" +
            "order by Payoff \n" +
            "desc limit 100";
    public static String QUERY_RANK_CMD_PAST = "select DATE(DATE_ADD(WagersDate, INTERVAL 12 HOUR)) as Date, count(*) as Count, Max(PayOff + BetAmount) as HighestAward from Wagers\n" +
            "where GameType = %d\n" +
            " and Payoff > 0 \n" +
            " and WagersType = 1\n" +
            "and DATE(DATE_ADD(WagersDate, INTERVAL 12 HOUR)) < '%s'\n" +
            " group by DATE(DATE_ADD(WagersDate, INTERVAL 12 HOUR))\n" +
            " limit 100";

    public static String QUERY_GAME_SETTINGS = "select * from setting_gog";

    public static String QUERY_USER_SETTING = "users";

    public static String QUERY_GAME_SETTINGS_APPLIED = "update setting_gog set Applied";

    public static String QUERY_ENROLLMENT_HISTORY = "select WagersID, AuthNumber as UserName, (BetAmount - Balance) as EntranceFee, RoundSerial, WagersDate, Date(WagersDate) as Date from Wagers\n" +
            " where GameType = %d\n" +
            "and WagersType = 1\n" +
            "and DATE(WagersDate) <= DATE(DATE_SUB(Now(), INTERVAL 12 HOUR))\n" +
            "and DATE(WagersDate) >= DATE(DATE_SUB(DATE_SUB(Now(), INTERVAL 12 HOUR), INTERVAL 7 DAY))";

//    public static String QUERY_ENROLLMENT_HISTORY = "select WagersID, AuthNumber as UserName, (BetAmount - setting_gog.Service_fee) EntranceFee, RoundSerial, WagersDate, Date(WagersDate) as Date from Wagers, setting_gog\n" +
//            " where GameType = %d\n" +
//            "and WagersType = 1\n" +
//            "and Wagers.GameCode = setting_gog.RoomID\n" +
//            "and DATE(WagersDate) <= DATE(DATE_SUB(Now(), INTERVAL 12 HOUR))\n" +
//            "and DATE(WagersDate) >= DATE(DATE_SUB(DATE_SUB(Now(), INTERVAL 12 HOUR), INTERVAL 7 DAY))";
}

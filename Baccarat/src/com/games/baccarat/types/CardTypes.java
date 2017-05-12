package com.games.baccarat.types;

import java.util.Comparator;
import java.util.LinkedList;
import java.util.List;

/**
 * Created by matt1201 on 2016/12/1.
 */
public enum CardTypes {
    None(0, 0),
    Draw(1, 8),
    PlayerWin(2, 1),
    BankerWin(3, 1),
    BankerPairs(4, 11),
    PlayerPairs(5, 11),
    AnyPairs(6, 1),
    PerfectPairs(7, 1),
    Big(8, 1),
    Small(9, 1),
    SuperSixPoint(10, 1);

    private int _value;
    private double _win_ratio;
    public int getValue(){return _value;}
    public double getWinRatio(){return _win_ratio;}

    CardTypes(int value, double win_ratio){
        _value = value;
        _win_ratio= win_ratio;
    }

    public static CardTypes get(int value){
        CardTypes[] types = CardTypes.values();

        for(int i=0; i<types.length; i++)
        if(types[i].getValue()==value)
            return types[i];

        return CardTypes.None;
    }

    public static List<CardTypes> analyze(List<PokerCard.Card> cards){

        List<CardTypes> result = new LinkedList<>();

//        「莊對」指莊的起手牌為同數字或英文字母。
//        「閒對」指閒的起手牌為同數字或英文字母。
//        「任意對子」指莊或閒的起手牌為同數字或英文字母。
//        「完美對子」指莊或閒的起手牌為同花色且同數字或同花色且同英文字母。
//        「大」指當局開牌張數總和5張牌或6張牌為大。
//        「小」指當局開牌張數總和4張牌為小。
//        「超級六」僅開放於免傭百家樂，指莊家點數為6點且贏閒家。

        int player_point = cards.get(1).Point + cards.get(2).Point + cards.get(5).Point;
        int banker_point = cards.get(3).Point + cards.get(4).Point + cards.get(6).Point;

        player_point = player_point % 10;
        banker_point = banker_point % 10;

        //check point
        if(player_point == banker_point)
            result.add(CardTypes.Draw);
        if(player_point > banker_point)
            result.add(CardTypes.PlayerWin);
        if(player_point < banker_point)
            result.add(CardTypes.BankerWin);

        boolean player_pair = false;
        boolean banker_pair = false;

        //player pairs
        if(cards.get(1).Number == cards.get(2).Number) {
            result.add(CardTypes.PlayerPairs);
            player_pair = true;
        }

        //banker pairs
        if(cards.get(3).Number == cards.get(4).Number) {
            result.add(CardTypes.BankerPairs);
            banker_pair = true;
        }

        //any pairs
        if(player_pair || banker_pair)
            result.add(CardTypes.AnyPairs);

        //perfect pairs
        if(((cards.get(1).Point == cards.get(2).Point) && (cards.get(1).Style == cards.get(2).Style)) ||
           ((cards.get(3).Point == cards.get(4).Point) && (cards.get(3).Style == cards.get(4).Style))){
            result.add(PerfectPairs);
        }

        int valid_count = 0;
        for(int i=0; i<cards.size(); i++)
        if(cards.get(i)!=null)
        if(cards.get(i).Point > 0)
            valid_count++;

        //big
        if(valid_count>=5)
            result.add(CardTypes.Big);
        //small
        if(valid_count<5)
            result.add(CardTypes.Small);

//        SuperSixPoint
        if(banker_point==6)
        if(result.contains(CardTypes.BankerWin))
            result.add(CardTypes.SuperSixPoint);

        return result;
    }

//    # 百家樂 轉換牌組為結果 ID
    public static int FetchStateID3001(List<String> bankerCast, List<String> playerCast){
//        六張牌範例
//            bankerCast=S.13,S.11,H.1
//            playerCast=H.1,C.2,C.5
//
//        四張牌範例
//            bankerCast=S.3,C.4,
//            playerCast=D.10,S.6,

//        List(P_Card1, P_Card2, P_Card3) = explode(",", playerCast);
//        List(B_Card1, B_Card2, B_Card3) = explode(",", bankerCast);

        Object P_Card1 = playerCast.get(0);
        Object P_Card2 = playerCast.get(1);
        Object P_Card3 = playerCast.size() > 2 ? playerCast.get(2) : "";

        Object B_Card1 = bankerCast.get(0);
        Object B_Card2 = bankerCast.get(1);
        Object B_Card3 = bankerCast.size() > 2 ? bankerCast.get(2) : "";

        int Pair = 0;
        int Fruit = 0;
        int Big = 0;

        int B_Points = 0;
        int P_Points = 0;

        boolean B_IsOdd = false;
        boolean P_IsOdd = false;
        int OddEven = 0;
        int JPStateID  = 0;

        int Perfect=0;

        if( P_Card1.equals("") || P_Card2.equals("") || B_Card1.equals("") || B_Card2.equals("") ){
            Pair = 0;
            Fruit = 0;
            Big = 0;
            B_Points = 0;
            P_Points = 0;
        } else {
            if(P_Card3.equals("")) P_Card3 = "back";
            if(B_Card3.equals("")) B_Card3 = "back";

//			## 大小判斷
            if(!(B_Card3.equals("back")))Big = 0;
            else if(!(P_Card3.equals("back")))Big = 0;
			else Big = 12;

            if(B_Card3.equals("back")) B_Card3 = 0;
            if(P_Card3.equals("back")) P_Card3 = 0;

//			#花色
            String B_Color1 = B_Card1.toString().substring(0,1);
            String B_Color2 = B_Card2.toString().substring(0,1);
            String P_Color1 = P_Card1.toString().substring(0,1);
            String P_Color2 = P_Card2.toString().substring(0,1);

//			#點數
            P_Card1 = Integer.parseInt(P_Card1.toString().substring(2, P_Card1.toString().length()));
            P_Card2 = Integer.parseInt(P_Card2.toString().substring(2, P_Card2.toString().length()));
            P_Card3 = P_Card3.toString().length() > 1 ? Integer.parseInt(P_Card3.toString().substring(2, P_Card3.toString().length())) : 0;

            B_Card1 = Integer.parseInt(B_Card1.toString().substring(2, B_Card1.toString().length()));
            B_Card2 = Integer.parseInt(B_Card2.toString().substring(2, B_Card2.toString().length()));
            B_Card3 = B_Card3.toString().length() > 1 ? Integer.parseInt(B_Card3.toString().substring(2, B_Card3.toString().length())) : 0;

            if(B_Card1.equals(B_Card2) && P_Card1.equals(P_Card2)){
                Pair = 3;	//Banker / Player Pair
                if(P_Color1.equals(P_Color2) || B_Color1.equals(B_Color2)){
//                    #完美對子
                    Perfect=96;
                }
            }else if(B_Card1.equals(B_Card2)){
                Pair = 1;	//Banker Pair
                if(B_Color1.equals(B_Color2)){
                    Perfect=96;
                }
            }else if(P_Card1.equals(P_Card2)){
                Pair = 2;	//Player Pair
                if(P_Color1.equals(P_Color2)){
                    Perfect=96;
                }
            }else{
                Pair = 0;
                Perfect = 0;
            }

            if((Integer.parseInt(P_Card1.toString())) >= 10) P_Card1 = 0;
            if((Integer.parseInt(P_Card2.toString())) >= 10) P_Card2 = 0;
            if((Integer.parseInt(P_Card3.toString())) >= 10) P_Card3 = 0;
            if((Integer.parseInt(B_Card1.toString())) >= 10) B_Card1 = 0;
            if((Integer.parseInt(B_Card2.toString())) >= 10) B_Card2 = 0;
            if((Integer.parseInt(B_Card3.toString())) >= 10) B_Card3 = 0;

            B_Points = (Integer.parseInt(B_Card1.toString()) +
                        Integer.parseInt(B_Card2.toString()) +
                        Integer.parseInt(B_Card3.toString())) % 10;

            P_Points = (Integer.parseInt(P_Card1.toString()) +
                        Integer.parseInt(P_Card2.toString()) +
                        Integer.parseInt(P_Card3.toString())) % 10;

            if(B_Points > P_Points){
                Fruit = 1;	//Banker
            }else if(P_Points > B_Points){
                Fruit = 5;	//Player
            }else if(P_Points == B_Points){
                Fruit = 9;	//Tie
            }

            //單雙
            if(( B_Points % 2 ) > 0) B_IsOdd = true; //莊單
            else B_IsOdd = false; //莊雙
            if(( P_Points%2 ) > 0 )P_IsOdd = true; //閒單
            else P_IsOdd = false; //閒雙

            if( B_IsOdd && P_IsOdd ) OddEven = 0; //莊閒單
            else if( B_IsOdd && !P_IsOdd )OddEven = 24; //莊單閒雙
            else if( !B_IsOdd && P_IsOdd )OddEven = 48; //莊雙閒單
            else if( !B_IsOdd && !P_IsOdd )OddEven = 72; //莊閒雙

            //JP判斷
            JPStateID = 0;
        }

        return Pair + Fruit + Big + OddEven + Perfect;
    }
}

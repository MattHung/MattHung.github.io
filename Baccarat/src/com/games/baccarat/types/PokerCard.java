package com.games.baccarat.types;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Created by matt1201 on 2016/11/28.
 */
public class PokerCard {
    public enum Style{
        None(0),
        Spade(1),
        Heart(2),
        Diamond(3),
        Club(4);

        private int _value = 0;
        public int getValue(){return _value;}

        Style(int value){
            _value = value;
        }
    }

    public static class Card{
        public int ID;
        public Style Style;
        public int Point;
        public int Number;

        public String getCardCode(){
            String style ="";

            switch (Style){
                case Spade:
                    style ="S";
                    break;
                case Heart:
                    style ="H";
                    break;
                case Diamond:
                    style ="D";
                    break;
                case Club:
                    style ="C";
                    break;
                default:
                    return "";
            }

            return String.format("%s.%d", style, Point, Number);
        }

        public Card(int id, Style style, int point, int number){
            ID = id;
            Style = style;

            point = Math.min(point, 10);
            Point = point;
            Number = number;
        }
    }

    public static final int SPADE_A = 10105;
    public static final int HEART_A = 20106;
    public static final int DIAMOND_A = 40108;
    public static final int CLUB_A = 30107;

    public static final int MAX_NUMBER = 13;
    public static final int CardBase1 = 104;
    public static final int CardBase2 = 66;
    private static Map<Integer, Integer> _scanner_map = new HashMap<>();
    private static List<Card> _cards_sample = new LinkedList<>();

    public static Card GetRandom(){
        int index = ThreadLocalRandom.current().nextInt(1, _cards_sample.size());
        return _cards_sample.get(index);
    }

    public static Card GetCard(int card_id){
        return _cards_sample.get(card_id);
    }

    public static Card GetDummy(){
        return _cards_sample.get(0);
    }

    PokerCard(){}

    static{
        generate_scanner_map(SPADE_A, 1);
        generate_scanner_map(HEART_A, 14);
        generate_scanner_map(DIAMOND_A, 27);
        generate_scanner_map(CLUB_A, 40);

        _cards_sample.add(new Card(0, Style.None, 0, -1));
        generate_card(Style.Spade);
        generate_card(Style.Heart);
        generate_card(Style.Diamond);
        generate_card(Style.Club);
    }

    private static void generate_scanner_map(int card_ace, int id){
        for(int i=1; i<=MAX_NUMBER; i++) {
            _scanner_map.put(card_ace, id);

            if(i != 9)
                card_ace += CardBase1;
            else
                card_ace += CardBase2;
            id++;
        }
    }

    private static void generate_card(Style style){
        for(int i=1; i<=MAX_NUMBER; i++)
            _cards_sample.add(new Card(_cards_sample.size(), style, i, i));
    }

    public static Card mapping(int scanner_code){
        if(!_scanner_map.containsKey(scanner_code))
            return null;
        int card_id = _scanner_map.get(scanner_code);
        return _cards_sample.get(card_id);
    }
}

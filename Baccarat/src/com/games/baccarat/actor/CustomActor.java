package com.games.baccarat.actor;

import com.eject.AccountData;
import com.eject.custom.types.AccOperationResult;
import com.eject.custom.types.AccResponseType;
import com.eject.custom.types.ExchangeRatio;
import com.eject.custom.types.OperationType;
import com.eject.interop.ActorBase;
import com.games.baccarat.Entry;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by matt1201 on 2016/5/26.
 */
public class CustomActor extends ActorBase{
    public enum CheckCardResult{
        OnCardOperation,
        NoEn
    }

    private double _balance = 0;

    private boolean _on_card_operation = false;
    private int _rent_card_point = 0;
    private AccOperationResult _last_card_operation_result = AccOperationResult.None;

    public String RemoteIP;
    public int RemotePort;
    public Map<String, Double> Wallet = new HashMap<>();
    public ExchangeRatio ExchangeRatio = null;

    public double get_balance(){return _balance;}

    public boolean get_on_card_opereratioin(){return _on_card_operation;}

    public boolean get_have_rent_card_limitation(){return getAccount().Enabled_card;}

    public long LastEnterRoomTime = 0;


    public void onCardOperationResponse(AccOperationResult result, double value){
        _on_card_operation = false;

        switch (result){
            case Success:
                _rent_card_point++;
                break;
            case NotEnoughBalance:
                break;
            default:
//                System.out.println(String.format("%s at %s", result.toString(), new Date().toString()));
                break;
        }

        _last_card_operation_result = result;
    }

    public CustomActor(String remoteIP, int remotePort, long id, AccountData accountData)
    {
        super(id, accountData);

        Wallet.put(getAccount().PayWay, 0.0);

        RemoteIP = remoteIP;
        RemotePort = remotePort;
        RefreshAsset();
    }

    public void RefreshAsset()
    {
        if(Entry.Instance().IsAdministrator(UserID()))
            return;

        Entry.Instance().GetBalance(ID(), null);
    }

    public void onAccResponse(OperationType type, AccOperationResult result, ExchangeRatio ratio, double value, double Balance){

        if(result!=AccOperationResult.Success)
            return;

        _balance = Balance;

        switch (type){
            case Exchange:
                _balance-=value;

                if(ratio!=null)
                    ExchangeRatio= ratio;
                break;
            case Recompensate:
                _balance+=value;

                if(ratio!=null)
                    ExchangeRatio= ratio;
                break;
        }
    }
}

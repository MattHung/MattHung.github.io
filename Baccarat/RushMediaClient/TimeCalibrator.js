/**
 * Created by matt1201 on 2015/12/17.
 */

 TimeCalibrator = function(){
 	this._localDatumTick=0;
 	this._remoteDatumTick=0;

 	this.synchronize = function(remoteTick){
 		this._remoteDatumTick = parseInt(remoteTick);
 		this._localDatumTick = (new Date()).getTime();
 	}.bind(this);

 	this.checkTimeStamp = function(timeStamp){
 		var remoteTick = this.getRemoteTick();
 		if((timeStamp-100)>remoteTick)
 			return false;

 		return true;
 	}.bind(this);

 	this.getRemoteTick = function(){
 		var localElapsedTick = (new Date()).getTime() - this._localDatumTick;
 		return this._remoteDatumTick + localElapsedTick;
 	}.bind(this);
 }
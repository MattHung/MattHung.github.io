/**
 * Created by Matt Hung on 2016/12/6.
 */

BaccaratCard = cc.Class.extend({
	ID:0,
	Visible:false, 

	ctor:function(id, visible) {
		this.ID = id;
		this.Visible = visible;
	}
});
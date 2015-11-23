function table_item(name){
    this.Name=name;
    this.Cell=new Array();
    this.Count=0;

    this.Add=function(innerhtml){
        var cell_id=name+'_'+this.Count;

        this.Cell[cell_id]=innerhtml;
        this.Count=this.Count+1;
        return cell_id;
    };

    this.Show=function() {
        var count=0;
        var result='';

        result+='<tr>';

        for(var key in this.Cell) {
            result += '<td id="' + key + '">' + this.Cell[key] + '</td>';
            count+=1;
        }

        result+='</tr>';

        return result;
    };

    this.Set=function(index, innerhtml)
    {
        var key=name+'_'+index;
        if(!$.inArray(key, this.Cell))
            return;

        this.Cell[key]=innerhtml;
        this.Apply(key)
    };

    this.Apply=function(cell_key){
        if(!$.inArray(cell_key, this.Cell))
            return;

        $('#'+cell_key).html(this.Cell[cell_key]);
    }
}

function simple_table(name, owner){
    this.Name=name;
    this.Owner=owner;
    this.Headers=new Array();
    this.Items=new Array();

    this.Show=function(){
        var result='<table class="table table-bordered table-striped table-hover btn-group-justified"  style="font-size:90%">';

        if(this.Headers.length>0) {
            result+='<thead>' + '<tr>';

            var maxColumnCount = 0;

            for (var key in this.Items)
                maxColumnCount = Math.max(maxColumnCount, this.Items[key].Count);

            for (var i = 0; i < maxColumnCount; i++) {
                switch (i < this.Headers.length) {
                    case true:
                        result += '<th>' + this.Headers[i] + '</th>';
                        break;
                    case false:
                        result += '<th></th>';
                        break;
                }
            }
            result += '</div>';

            result += '</tr>' +
            '</thead>';
        }

        result+='<tbody id="'+this.Name+'_info">';

        for(var key in this.Items)
            result+=this.Items[key].Show();

        result+='</tbody>'+
        '</table>';

        //result+='<br>';

        $('#'+this.Owner).append(result);
    };

    this.Add=function(itemName){
        this.Items[itemName]=new table_item(itemName);
    };

    for(var i=2; i<arguments.length; i++)
        this.Headers.push(arguments[i]);
}






/**
 * Created by Matt Hung on 2016/4/2.
 */

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/classes/binary-parser [rev. #1]

BinaryParser = function(bigEndian, allowExceptions){
    this.bigEndian = bigEndian, this.allowExceptions = allowExceptions;
};
with({p: BinaryParser.prototype}){
    p.encodeFloat = function(number, precisionBits, exponentBits){
        var resultBytes=[];

        var bias = Math.pow(2, exponentBits - 1) - 1, minExp = -bias + 1, maxExp = bias, minUnnormExp = minExp - precisionBits,
            status = isNaN(n = parseFloat(number)) || n == -Infinity || n == +Infinity ? n : 0,
            exp = 0, len = 2 * bias + 1 + precisionBits + 3, bin = new Array(len),
            signal = (n = status !== 0 ? 0 : n) < 0, n = Math.abs(n), intPart = Math.floor(n), floatPart = n - intPart,
            i, lastBit, rounded, j, result;
        for(i = len; i; bin[--i] = 0);
        for(i = bias + 2; intPart && i; bin[--i] = intPart % 2, intPart = Math.floor(intPart / 2));
        for(i = bias + 1; floatPart > 0 && i; (bin[++i] = ((floatPart *= 2) >= 1) - 0) && --floatPart);
        for(i = -1; ++i < len && !bin[i];);
        if(bin[(lastBit = precisionBits - 1 + (i = (exp = bias + 1 - i) >= minExp && exp <= maxExp ? i + 1 : bias + 1 - (exp = minExp - 1))) + 1]){
            if(!(rounded = bin[lastBit]))
                for(j = lastBit + 2; !rounded && j < len; rounded = bin[j++]);
            for(j = lastBit + 1; rounded && --j >= 0; (bin[j] = !bin[j] - 0) && (rounded = 0));
        }
        for(i = i - 2 < 0 ? -1 : i - 3; ++i < len && !bin[i];);

        (exp = bias + 1 - i) >= minExp && exp <= maxExp ? ++i : exp < minExp &&
        (exp != bias + 1 - len && exp < minUnnormExp && this.warn("encodeFloat::float underflow"), i = bias + 1 - (exp = minExp - 1));
        (intPart || status !== 0) && (this.warn(intPart ? "encodeFloat::float overflow" : "encodeFloat::" + status),
            exp = maxExp + 1, i = bias + 2, status == -Infinity ? signal = 1 : isNaN(status) && (bin[i] = 1));
        for(n = Math.abs(exp + bias), j = exponentBits + 1, result = ""; --j; result = (n % 2) + result, n = n >>= 1);
        for(n = 0, j = 0, i = (result = (signal ? "1" : "0") + result + bin.slice(i, i + precisionBits).join("")).length, r = [];
            i; n += (1 << j) * result.charAt(--i), j == 7 && (r[r.length] = String.fromCharCode(n), resultBytes[r.length-1] = n, n = 0), j = (j + 1) % 8);
        r[r.length] = n ? String.fromCharCode(n) : "";
        // return (this.bigEndian ? r.reverse() : r).join("");
        return (this.bigEndian ? resultBytes.reverse() : resultBytes);
    };
    p.encodeInt = function(number, bits, signed){
        var resultBytes=[];

        var digits = bits / 8;

        var max = Math.pow(2, bits), r = [];
        (number >= max || number < -(max >> 1)) && this.warn("encodeInt::overflow") && (number = 0);
        number < 0 && (number += max);
        for(; number; r[r.length] = String.fromCharCode(number % 256),  resultBytes[r.length-1] = (number % 256), number = Math.floor(number / 256));
        for(bits = -(-bits >> 3) - r.length; bits--; r[r.length] = "\0");
        // return (this.bigEndian ? r.reverse() : r).join("");

        for(var i = resultBytes.length; i<digits; i++)
            resultBytes.push(0);
        return (this.bigEndian ? resultBytes.reverse() : resultBytes);
    };
    p.decodeFloat = function(data, precisionBits, exponentBits){
        var b = ((b = new this.Buffer(this.bigEndian, data)).checkBuffer(precisionBits + exponentBits + 1), b),
            bias = Math.pow(2, exponentBits - 1) - 1, signal = b.readBits(precisionBits + exponentBits, 1),
            exponent = b.readBits(precisionBits, exponentBits), significand = 0,
            divisor = 2, curByte = b.buffer.length + (-precisionBits >> 3) - 1,
            byteValue, startBit, mask;
        do
            for(byteValue = b.buffer[ ++curByte ], startBit = precisionBits % 8 || 8, mask = 1 << startBit;
                mask >>= 1; (byteValue & mask) && (significand += 1 / divisor), divisor *= 2);
        while(precisionBits -= startBit);
        return exponent == (bias << 1) + 1 ? significand ? NaN : signal ? -Infinity : +Infinity
            : (1 + signal * -2) * (exponent || significand ? !exponent ? Math.pow(2, -bias + 1) * significand
            : Math.pow(2, exponent - bias) * (1 + significand) : 0);
    };
    p.decodeInt = function(data, bits, signed){
        var b = new this.Buffer(this.bigEndian, data), x = b.readBits(0, bits), max = Math.pow(2, bits);
        //return signed && x >= max / 2 ? x : x - max;
        return signed && x >= max / 2 ? x - max : x;
    };
    with({p: (p.Buffer = function(bigEndian, buffer){
        this.bigEndian = bigEndian || 0, this.buffer = [], this.setBuffer(buffer);
    }).prototype}){
        p.readBits = function(start, length){
            //shl fix: Henri Torgemane ~1996 (compressed by Jonas Raoni)
            function shl(a, b){
                for(++b; --b; a = ((a %= 0x7fffffff + 1) & 0x40000000) == 0x40000000 ? a * 2 : (a - 0x40000000) * 2 + 0x7fffffff + 1);
                return a;
            }
            if(start < 0 || length <= 0)
                return 0;
            this.checkBuffer(start + length);
            for(var offsetLeft, offsetRight = start % 8, curByte = this.buffer.length - (start >> 3) - 1,
                    lastByte = this.buffer.length + (-(start + length) >> 3), diff = curByte - lastByte,
                    sum = ((this.buffer[ curByte ] >> offsetRight) & ((1 << (diff ? 8 - offsetRight : length)) - 1))
                        + (diff && (offsetLeft = (start + length) % 8) ? (this.buffer[ lastByte++ ] & ((1 << offsetLeft) - 1))
                        << (diff-- << 3) - offsetRight : 0); diff; sum += shl(this.buffer[ lastByte++ ], (diff-- << 3) - offsetRight)
            );
            return sum;
        };
        p.setBuffer = function(data){
            if(data){
                //for(var l, i = l = data.length, b = this.buffer = new Array(l); i; b[l - i] = data.charCodeAt(--i));

                for(var l, i = l = data.length, b = this.buffer = new Array(l); i; b[l - i] = data[--i]);
                //this.bigEndian && b.reverse();
            }
        };
        p.hasNeededBits = function(neededBits){
            return this.buffer.length >= -(-neededBits >> 3);
        };
        p.checkBuffer = function(neededBits){
            if(!this.hasNeededBits(neededBits))
                throw new Error("checkBuffer::missing bytes");
        };
    }
    p.warn = function(msg){
        if(this.allowExceptions)
            throw new Error(msg);
        return 1;
    };

    p.fromSmall = function(number){return this.encodeInt(number, 8, true);};
    p.fromByte = function(number){return this.encodeInt(number, 8, false);};
    p.fromWord = function(number){return this.encodeInt(number, 16, true);};
    p.fromShort = function(number){return this.encodeInt(number, 16, false);};
    p.fromInt = function(number){return this.encodeInt(number, 32, true);};
    p.fromDWord = function(number){return this.encodeInt(number, 32, false);};
    p.fromLong = function(number){return this.encodeInt(number, 64, true);};
    p.fromFloat = function(number){return this.encodeFloat(number, 23, 8);};
    p.fromDouble = function(number){return this.encodeFloat(number, 52, 11);};

    p.toSmall = function(data){return this.decodeInt(data, 8, true);};
    p.toByte = function(data){return this.decodeInt(data, 8, false);};
    p.toWord = function(data){return this.decodeInt(data, 16, true);};
    p.toShort = function(data){return this.decodeInt(data, 16, false);};
    p.toInt = function(data){return this.decodeInt(data, 32, true);};
    p.toDWord = function(data){return this.decodeInt(data, 32, false);};
    p.toLong = function(data){return this.decodeInt(data, 64, true);};
    p.toFloat = function(data){return this.decodeFloat(data, 23, 8);};
    p.toDouble = function(data){return this.decodeFloat(data, 52, 11);};
}

MemoryStream=function(){
    this._position=0;
    this._buffer=[];

    this.concatenate=function(array){
        var newBuffer = new Uint8Array(this._buffer.length + array.length);
        newBuffer.set(this._buffer, 0);
        newBuffer.set(array, this._buffer.length);
        this._buffer = newBuffer;
        this._position = this._buffer.length-1;
    }.bind(this);

    this.initialBuffer = function(buffer){
        this._buffer=buffer;
        this._position=0;
    }.bind(this)

    this.getData = function(){
        return this._buffer;
    }.bind(this);

    this.getPosition = function() {
        return this._position;
    }.bind(this);

    this.setPosition = function(position){
        this._position = position;
    }.bind(this);

    this.getLength = function(){
        return this._buffer.length;
    }.bind(this);
};

Uint8Array.prototype.slice = function(start, end){
    var result = Array.from(this);

    result = result.slice(start, end);
    return result;
};

ProtocolBuilder = (function(){
    this._parser = new BinaryParser(false, true);

    this._decode_get_buffer= function(memoryStream, typeSize){
        if((memoryStream.getPosition() + typeSize)> memoryStream.getLength())
            throw Error("Invalid Length");

        return memoryStream.getData().slice(memoryStream.getPosition(), memoryStream.getPosition() + typeSize);
    }.bind(this);

    this.Encode_FromBool = function(memoryStream, value){
        var binaryValue = this._parser.fromByte(value?1:0);
        memoryStream.concatenate(binaryValue);
    }.bind(this);

    this.Encode_FromEnum = function(memoryStream, value){
        this.Encode_FromString(memoryStream, "u1");
        var binaryValue = this._parser.fromByte(value);
        memoryStream.concatenate(binaryValue);
    }.bind(this);

    this.Encode_FromByte = function(memoryStream, value){
        var binaryValue = this._parser.fromByte(value);
        memoryStream.concatenate(binaryValue);
    }.bind(this);

    this.Encode_FromShort = function(memoryStream, value){
        var binaryValue = this._parser.fromWord(value);
        memoryStream.concatenate(binaryValue);
    }.bind(this);

    this.Encode_FromUShort = function(memoryStream, value){
        var binaryValue = this._parser.fromShort(value);
        memoryStream.concatenate(binaryValue);
    }.bind(this);

    this.Encode_FromInt = function(memoryStream, value){
        var binaryValue = this._parser.fromInt(value);
        memoryStream.concatenate(binaryValue);
    }.bind(this);

    this.Encode_FromInt64 = function(memoryStream, value){
        var binaryValue = this._parser.fromLong(value);
        memoryStream.concatenate(binaryValue);
    }.bind(this);

    this.Encode_FromDouble = function(memoryStream, value){
        var binaryValue = this._parser.fromDouble(value);
        memoryStream.concatenate(binaryValue);
    }.bind(this);

    this.Encode_FromString =function(memoryStream, value) {
        var utf8 = unescape(encodeURIComponent(value));

        var arr = [];
        for (var i = 0; i < utf8.length; i++)
            arr.push(utf8.charCodeAt(i));

        this.Encode_FromInt(memoryStream, arr.length);
        memoryStream.concatenate(arr);
    }.bind(this);

    this.Decode_ToBool = function(memoryStream){
        return (this.Decode_ToByte(memoryStream)>0)?true:false;
    }.bind(this);

    this.Decode_ToEnum = function(memoryStream){
        var typeSize=1;

        var header = this.Decode_ToString(memoryStream);

        var buffer =this._decode_get_buffer(memoryStream, typeSize);
        var value = this._parser.toByte(buffer);
        memoryStream.setPosition(memoryStream.getPosition() + typeSize);
        return value;
    }.bind(this);

    this.Decode_ToByte = function(memoryStream){
        var typeSize=1;

        var buffer =this._decode_get_buffer(memoryStream, typeSize);
        var value = this._parser.toByte(buffer);
        memoryStream.setPosition(memoryStream.getPosition() + typeSize);
        return value;
    }.bind(this);

    this.Decode_ToShort = function(memoryStream){
        var typeSize=2;

        var buffer =this._decode_get_buffer(memoryStream, typeSize);
        var value = this._parser.toWord(buffer);
        memoryStream.setPosition(memoryStream.getPosition() + typeSize);
        return value;
    }.bind(this);

    this.Decode_ToUShort = function(memoryStream){
        var typeSize=2;

        var buffer =this._decode_get_buffer(memoryStream, typeSize);
        var value = this._parser.toShort(buffer);
        memoryStream.setPosition(memoryStream.getPosition() + typeSize);
        return value;
    }.bind(this);

    this.Decode_ToInt = function(memoryStream){
        var typeSize=4;

        var buffer =this._decode_get_buffer(memoryStream, typeSize);
        var value = this._parser.toInt(buffer);
        memoryStream.setPosition(memoryStream.getPosition() + typeSize);
        return value;
    }.bind(this);

    this.Decode_ToUInt = function(memoryStream){
        var typeSize=4;

        var buffer =this._decode_get_buffer(memoryStream, typeSize);
        var value = this._parser.toDWord(buffer);
        memoryStream.setPosition(memoryStream.getPosition() + typeSize);
        return value;
    }.bind(this);

    this.Decode_ToInt64 = function(memoryStream){
        var typeSize=8;

        var buffer =this._decode_get_buffer(memoryStream, typeSize);
        var value = 0;

        for ( var i = buffer.length - 1; i >= 0; i--)
            value = (value * 256) + buffer[i];

        memoryStream.setPosition(memoryStream.getPosition() + typeSize);
        return value;
    }.bind(this);

    this.Decode_ToDouble = function(memoryStream){
        var typeSize=8;

        var buffer =this._decode_get_buffer(memoryStream, typeSize);
        var value = this._parser.toDouble(buffer);
        memoryStream.setPosition(memoryStream.getPosition() + typeSize);
        return value;
    }.bind(this);

    this.Decode_ToString = function(memoryStream){
        var len = this.Decode_ToInt(memoryStream);
        var buffer =this._decode_get_buffer(memoryStream, len);
        var encodedString = String.fromCharCode.apply(null, buffer),
            decodedString = decodeURIComponent(escape(encodedString));
        memoryStream.setPosition(memoryStream.getPosition() + len);
        return decodedString;

    }.bind(this);

    this.Decode_ValueType =function(sample, element, memoryStream){
        //byte
        if((typeof sample[element]) == "number"){
            if((typeof sample[element]>=0) && (typeof sample[element]<=255)){
                sample[element] = this.Decode_ToByte(memoryStream);
                return true;
            }
        }

        //boolean
        if((typeof sample[element]) == "boolean"){
            sample[element] = this.Decode_ToBool(memoryStream);
            return true;
        }

        //uShort
        if((typeof sample[element]) == "number"){
            if((typeof sample[element]>=0) && (typeof sample[element]<=65535)){
                sample[element] = this.Decode_ToUShort(memoryStream);
                return true;
            }
        }

        //Short
        if((typeof sample[element]) == "number"){
            if((typeof sample[element]>=-32768) && (typeof sample[element]<=32767)){
                sample[element] = this.Decode_ToUShort(memoryStream);
                return true;
            }
        }

        //uInt
        if((typeof sample[element]) == "number"){
            if((typeof sample[element]>=0) && (typeof sample[element]<=Math.pow(2, 32)-1)){
                sample[element] = this.Decode_ToUInt(memoryStream);
                return true;
            }
        }

        //Int
        if((typeof sample[element]) == "number"){
            if((typeof sample[element]>=Math.pow(2, 31) * -1) && (typeof sample[element]<=Math.pow(2, 31)-1)){
                sample[element] = this.Decode_ToUInt(memoryStream);
                return true;
            }
        }

        //Int64
        if((typeof sample[element]) == "number"){
            if((typeof sample[element]>=Math.pow(2, 52) * -1) && (typeof sample[element]<=Math.pow(2, 53)-1)){
                sample[element] = this.Decode_ToUInt(memoryStream);
                return true;
            }
        }

        //uInt64
        if((typeof sample[element]) == "number"){
            if((typeof sample[element]>=0) && (typeof sample[element]<=Math.pow(2, 53)-1)){
                sample[element] = this.Decode_ToUInt(memoryStream);
                return true;;
            }
        }

        //double
        if((typeof sample[element]) == "float"){
            sample[element] = this.Decode_ToDouble(memoryStream);
            return true;
        }

        //string
        if((typeof sample[element]) == "string"){
            sample[element] = this.Decode_ToString(memoryStream);
            return true;
        }

    }.bind(this);

    this.Decode_ToValueStruct =function(sample, memoryStream){
        for(var element in sample) {
            if (!sample.hasOwnProperty(element))
                continue;

            this.Decode_ValueType(sample, element, memoryStream);
        }
    }.bind(this);

    return{
        Encode_FromBool:this.Encode_FromBool,
        Encode_FromEnum:this.Encode_FromEnum,
        Encode_FromByte:this.Encode_FromByte,
        Encode_FromShort:this.Encode_FromShort,
        Encode_FromUShort:this.Encode_FromUShort,
        Encode_FromInt:this.Encode_FromInt,
        Encode_FromInt64:this.Encode_FromInt64,
        Encode_FromDouble:this.Encode_FromDouble,
        Encode_FromString:this.Encode_FromString,

        Decode_ToBool:this.Decode_ToBool,
        Decode_ToEnum:this.Decode_ToEnum,
        Decode_ToByte:this.Decode_ToByte,
        Decode_ToShort:this.Decode_ToShort,
        Decode_ToUShort:this.Decode_ToUShort,
        Decode_ToInt:this.Decode_ToInt,
        Decode_ToUInt:this.Decode_ToUInt,
        Decode_ToInt64:this.Decode_ToInt64,
        Decode_ToDouble:this.Decode_ToDouble,
        Decode_ToString:this.Decode_ToString
    }
})();

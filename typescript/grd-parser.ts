///<reference path='css.ts' />
///<reference path='simple-object-creater.ts' />
///<reference path='gradient.ts' />
module PSDGradient{
    export class BaseT{
        offset;
        value;
        byte_length;
        parse(stream):any{
            this.offset = stream.tell();
            var ret = this._parse(stream);
            this.byte_length = stream.tell() - this.offset;
            return ret;
        }
        _parse(stream):any{
            throw new Error("need override _parse method");
        }
    }

    export class BoolT extends BaseT{
        _parse(stream){
            this.value = stream.readUint8();
            return this.value;
        }
    }

    export class LongT extends BaseT{
        _parse(stream){
            this.value = stream.readInt32();
            return this.value;
        };
    }

    export class StringT extends BaseT{
        length;

        constructor(length){
            this.length = length;
            super();
        }

        _parse(stream){
            this.value = stream.readString(this.length);
            return this.value;
        };
    }

    export class DoubT extends BaseT{
        _parse(stream){
            this.value = stream.readFloat64();
            return this.value;
        }
    }
    export class UntFT extends BaseT{
        type;
        _parse(stream){
            this.type = new StringT(4).parse(stream);
            this.value = new DoubT().parse(stream);
            return this.value;
        }
    }

    export class UnicodeT extends BaseT{
        length;

        constructor(length){
            this.length = length;
            super();
        }

        _parse(stream){
            this.value = stream.readWideString(this.length);
            return this.value;
        }
    }

    export class TdtdT extends BaseT{
        length;
        _parse(stream){
            this.length =  new LongT().parse(stream);
            this.value = stream.read(this.length);
            return this.value;
        }
    }

    export class TextT extends BaseT{
        length;
        _parse(stream){
            this.length =  new LongT().parse(stream);
            this.value = new UnicodeT(this.length).parse(stream);
            return this.value;
        }
    }

    export class EnumT extends BaseT{
        length;
        type;
        length2;
        _parse(stream){
            this.length = new LongT().parse(stream) || 4;
            this.type = new StringT(this.length).parse(stream);
            this.length2 = new LongT().parse(stream) || 4;
            this.value = new StringT(this.length2).parse(stream);
            return this;
        }
    }

    export class KeyValueT extends BaseT{
        length;
        name;

        constructor(length = 4){
            this.length = length;
            super();
        }

        _parse(stream){
            this.name = new StringT(this.length).parse(stream);
            this.value = new Discriptor().parse(stream);
            return this;
        }
    }

    export class ObjcT extends BaseT{
        length;
        name;
        typename_length;
        typename;
        property_count;
        values;

        _parse(stream){
            this.length = new LongT().parse(stream) || 4;
            this.name = new UnicodeT(this.length).parse(stream);
            this.typename_length = new LongT().parse(stream) || 4;
            this.typename = new StringT(this.typename_length).parse(stream);
            this.property_count = new LongT().parse(stream);
            this.values = [];
            for(var i =0 ;i < this.property_count;i++){
                var key_length = new LongT().parse(stream) || 4;
                var v = new KeyValueT(key_length);
                v.parse(stream);
                this.values.push(v);
            }
            return this;
        }
    }

    export class VlLsT extends BaseT{
        length;
        values;
        _parse(stream){
            this.length = new LongT().parse(stream);
            this.values = [];
            for(var i =0 ;i < this.length;i++){
                this.values.push(new Discriptor().parse(stream));
            }
            return this;
        }
    }

    export class Discriptor extends BaseT{

        static types = {
            "Objc" : ObjcT,
            "VlLs" : VlLsT,
            "doub" : DoubT,
            "UntF" : UntFT,
            "TEXT" : TextT,
            "enum" : EnumT,
            "long" : LongT,
            "bool" : BoolT,
            "tdtd" : TdtdT
        };

        key;

        _parse(stream){
            this.key = new StringT(4).parse(stream);
            var type = Discriptor.types[this.key];
            if (type == undefined){
                throw new Error("not support Discriptor type :" + this.key);
            }
            this.value = new type();
            this.value.parse(stream);
            return this;
        }
    }

    //TODO header validate

    export class IncrementParser {
        length;
        index;
        stream;
        grdl;

        gradientCreator = new GradientCreator();
        simpleObjcectCreator = new SimpleObjectCreator();

        constructor(stream){
            this.setStream(stream);
        }
        setStream(stream){
            this.stream = stream;
            this.length = -1;
            this.index = 0;
            this.grdl = undefined;
        }

        setup(){
            this._headerParse(this.stream);
        }

        _headerParse(stream){
            stream.seek(32); // skip header
            var grdl = new KeyValueT();
            grdl.name = new StringT(4).parse(stream);

            var dis = new Discriptor();
            dis.key = new StringT(4).parse(stream);
            grdl.value = dis;

            var vl = new VlLsT();
            vl.length = new LongT().parse(stream);
            dis.value = vl;

            var values = [];
            vl.values = values;
            this.grdl = grdl;
            this.length =vl.length;
            this.index = 0;
        }

        hasNext(){
            return this.index < this.length;
        }

        buildGradient(parsed_obj){
            var object = this.simpleObjcectCreator.walk(parsed_obj);
            var grad_data = object["Objc"]["values"]["Grad"]["Objc"];
            var grad = this.gradientCreator.createGradient(grad_data);
            grad.buildGradientStop();
            return grad;
        }

        parse(){
            this.index++;
            var gradient = new Discriptor().parse(this.stream);
            return this.buildGradient(gradient)
        }
    }

    export class GrdParser{

        simpleParse(stream){
            stream.seek(32); // skip header
            return new KeyValueT().parse(stream);
        }

        incrementParse(stream, callback){
            stream.seek(32); // skip header
            var grdl = new KeyValueT();
            grdl.name = new StringT(4).parse(stream);

            var dis = new Discriptor();
            dis.key = new StringT(4).parse(stream);
            grdl.value = dis;

            var vl = new VlLsT();
            vl.length = new LongT().parse(stream);
            dis.value = vl;

            var values = [];
            vl.values = values;

            var parse_fn = (index) => {

                if (index < vl.length){
                    var next = () => {
                        parse_fn(index+1)
                    };
                    var gradient = new Discriptor().parse(stream);
                    if(callback  != null){
                        callback(gradient, index, vl.length, next);
                    }
                }
            }
            parse_fn(0);
            return grdl;
        }

        parse(stream, callback){
            var gradientCreator = new GradientCreator();
            var simpleObjcectCreator = new SimpleObjectCreator();

            var fn = (parsed_obj, index, length, next) => {

                var grad;
                try{
                    var object = simpleObjcectCreator.walk(parsed_obj);
                    var grad_data = object["Objc"]["values"]["Grad"]["Objc"];
                    grad = gradientCreator.createGradient(grad_data);
                    grad.buildGradientStop();
                }catch(ex){
                    console.log(ex.message);
                }

                callback(grad, index, length, next);
            };

            return this.incrementParse(stream, fn);
        }
    }
}
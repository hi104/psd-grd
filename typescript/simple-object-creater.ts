module PSDGradient{
    export class SimpleObjectCreator{

        static simple_types = [
            "LongT",
            "StringT",
            "DoubT",
            "UnicodeT",
            "BoolT",
            "TextT"];

        is_simple_type(obj_type){
            return SimpleObjectCreator.simple_types.some((type) => type == obj_type );
        }

        //
        //get contructor name
        //
        //http://stackoverflow.com/questions/332422/how-do-i-get-the-name-of-an-objects-type-in-javascript
        //
        static getTypeName(obj) {
            var funcNameRegex = /function (.{1,})\(/;
            var results = (funcNameRegex).exec((obj).constructor.toString());
            return (results && results.length > 1) ? results[1] : "";
        };

        walk(obj){
            var obj_type = SimpleObjectCreator.getTypeName(obj);//obj.constructor.name;

            if (this.is_simple_type(obj_type)){
                return obj.value;
            }
            else if (obj_type == "UntFT"){
                return {
                    type : obj.type,
                    value : obj.value
                };
            }
            else if (obj_type == "KeyValueT"){
                var ret = {};
                ret[obj.name] = this.walk(obj.value);
                return ret;
            }
            else if (obj_type == "EnumT"){
                return {
                    type : obj.type,
                    value : obj.value
                };
            }
            else if (obj_type == "ObjcT"){

                var values = obj.values.reduce((accum, value) =>{
                    var props = this.walk(value);
                    for (var prop in props){
                        accum[prop] = props[prop];
                    }
                    return accum;
                }, {});

                return {
                    name : obj.name,
                    typename : obj.typename,
                    values : values
                };
            }
            else if (obj_type == "VlLsT"){
                return obj.values.map((value) => {
                    return this.walk(value);
                });
            }
            else if (obj_type == "Discriptor"){
                var ret = {};
                ret[obj.key] = this.walk(obj.value);
                return ret;
            }
            else{
                throw new Error("SimpleObjectCreator not support type:" + obj_type);
            }
        }
    }
}
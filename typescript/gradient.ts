module PSDGradient{
    export class Gradient{
        obj_name;
        name;
        clrs;
        trns;
        gradient_stops;

        buildGradientStop(){
            this.gradient_stops = this.clrs.map((clr)=>{
                var grad = new GradientStop();
                grad.color_stop = clr;
                grad.opacity = this.getOpacity(clr, this.trns);
                return grad;
            })
        }

        getOpacity(clr, trns){
            var index = -1;
            for (var i =0; i<trns.length; i++){
                var t = trns[i];
                if (t.lctn >= clr.lctn ){
                    index = i;
                    break;
                }
            }
            if (index == 0){
                return trns[0].opacity;
            }
            else if (index == -1){
                return trns[trns.length-1].opacity;
            }
            else{
                var pre  = trns[index-1];
                var next = trns[index];
                return this.loctOpacity(pre, next, clr.lctn);
            }
        }

        loctOpacity(trns, trns2, lctn){
            var w_lctn = trns2.lctn - trns.lctn;
            var h_lctn = trns2.opacity - trns.opacity;

            if (w_lctn == 0){
                return trns.opacity;
            }else{
                var m = h_lctn / w_lctn;
                var b = trns.opacity - (m * trns.lctn);
                // y = mx  + b
                return m * lctn + b;
            }
        }
    }

    export class ColorStop{
        color_obj;
        lctn ;
        mdpn;
        type;
    }

    export class TransparencyStop{
        opacity;
        lctn;
        mdpn;
    }

    export class GradientStop{
        opacity;
        color_stop;
    }

    export class ColorObj{
        color;
        type;
    }

    export class RGBColor{
        r;
        g;
        b;
    }

    export class HSBColor{
        hue;
        saturation;
        brigtness;
    }


    export class GradientCreator{

        createTransparencyStops(list){

            var transparency_stops = [];
            list.forEach((e)=>{
                var trans_stop = new TransparencyStop();
                var obj = e["Objc"];
                var values = obj["values"];
                trans_stop.opacity = values["Opct"]["UntF"]["value"];
                trans_stop.lctn = values["Lctn"]["long"];
                trans_stop.mdpn = values["Mdpn"]["long"];
                transparency_stops.push(trans_stop);
            })
            return transparency_stops;
        }
        createRGBColor(color_data){
            var color = new RGBColor();
            var color_data_values = color_data["values"];
            color.r = color_data_values["Rd  "]["doub"];
            color.g = color_data_values["Grn "]["doub"];
            color.b = color_data_values["Bl  "]["doub"];
            return color;
        }

        createHSBColor(color_data){
            var color = new HSBColor();
            var color_data_values = color_data["values"];
            color.hue = color_data_values["H   "]["UntF"]["value"];
            color.saturation = color_data_values["Strt"]["doub"];
            color.brigtness = color_data_values["Brgh"]["doub"];
            return color;
        }

        createColorStops(list){
            var color_stops = [];
            list.forEach((e)=>{
                var color_stop = new ColorStop();

                var obj = e["Objc"];
                var values = obj["values"];
                color_stop.type = values["Type"];
                color_stop.lctn = values["Lctn"]["long"];
                color_stop.mdpn = values["Mdpn"]["long"];

                var color_obj = new ColorObj();
                var color_data = values["Clr "]["Objc"];
                color_obj.type = color_data["typename"];
                if (color_obj.type =="RGBC"){
                    color_obj.color = this.createRGBColor(color_data);
                }else if (color_obj.type =="HSBC"){
                    color_obj.color = this.createHSBColor(color_data);
                }else{
                    //TODO
                }

                color_stop.color_obj = color_obj;
                color_stops.push(color_stop);
            })
            return color_stops;
        }

        createGradient(d){
            var values = d["values"];
            var grad = new Gradient();
            grad.obj_name = d["name"];
            grad.name = values["Nm  "]["TEXT"];
            grad.clrs =  this.createColorStops(values["Clrs"]["VlLs"]);
            grad.trns = this.createTransparencyStops(values["Trns"]["VlLs"]);
            return grad;
        }
    }
}
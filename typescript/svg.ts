module PSDGradient{
    export class SVGCreator{

        create(grad, options){
            var begin_tag ='<linearGradient id="#id">'
            if(options && options.id){
                begin_tag = begin_tag.replace('#id', options.id)
            }
            else{
                begin_tag = begin_tag.replace('id="#id"', "")
            }
            var end_tag ='</linearGradient>'
            var stops =  this.createGradeientStops(grad).map((e) =>{
                return "    " + e;
            }).join("\n");
            return [begin_tag, stops, end_tag].join("\n");

        }

        createGradeientStops(grad_obj){
            return grad_obj.gradient_stops.map((grad) =>{
                var color = grad.color_stop.color_obj.color;
                var lctn = (grad.color_stop.lctn * 100) / 4096;
                var opacity = grad.opacity / 100;
                if(grad.color_stop.color_obj.type == "RGBC"){
                    var rgba = [
                        Math.round(color.r),
                        Math.round(color.g),
                        Math.round(color.b),
                        opacity].join(', ');
                    return "<stop stop-color='rgba(#rgba)' offset='#lctn%'/>".replace("#rgba", rgba).replace("#lctn", lctn.toString());
                }else{
                    var hsla = [Math.round(color.hue).toString(),
                                Math.round(color.saturation).toString() + "%",
                                Math.round(color.brigtness).toString() + "%" ,
                                opacity.toString()].join(', ');
                    return "<stop stop-color='hsla(#hsla)' offset='#lctn%'/>".replace("#hsla", hsla).replace("#lctn", lctn.toString());
                }
            });
        }
    }
}
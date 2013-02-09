module PSDGradient{
    export class CSSCreator{

        createGradientStyle(grad, options){

            var vendors = ["-webkit-", "-moz-","-o-", "-ms-"];
            var background = '  background: #{prefix}linear-gradient(top,';

            var prefixs = vendors.map((e) =>{
                return background.replace("#{prefix}", e);
            });

            prefixs.push("  linear-gradient(to bottom,");

            var stops =  this.createGradeientStops(grad).map((e) =>{
                return "    " + e;
            }).join(",\n");
            var styles = prefixs.map((e) => {
                return [e, stops, "  );"].join("\n");
            });

            return styles.join("\n");
        }

        createGradientCss(grad, options){
            var selector = options.selector + "{";
            var css = [
                selector,
                this.createGradientStyle(grad, options),
                "}"].join("\n");
            return css;
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
                    return "rgba(#rgba) #lctn%".replace("#rgba", rgba).replace("#lctn", lctn.toString());
                }else{
                    var hsla = [Math.round(color.hue).toString(),
                                Math.round(color.saturation).toString() + "%",
                                Math.round(color.brigtness).toString() + "%" ,
                                opacity.toString()].join(', ');
                    return "hsla(#hsla) #lctn%".replace("#hsla", hsla).replace("#lctn", lctn.toString());
                }
            });
        }
    }
}
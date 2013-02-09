
var gradients;
var cssUtil;
var gradientCssCreator;

function checkSupportFileApi(){
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        return true;
    } else {
        alert('The File APIs are not fully supported in this browser.');
        return false;
    }
}


function showFileInfo(files){
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                    f.size,  '</li>');
    }
    document.getElementById('file-list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.target.files; //
    showFileInfo(files);
    readFile(files[0]);
}

function handleFileDrop(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files;
    showFileInfo(files);
    readFile(files[0]);
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

function readFile(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
        var uint8_array = new Uint8Array(e.target.result);
        start_parse(new PSD.StreamReader(uint8_array));
    };

    reader.readAsArrayBuffer(file);
}

var CssUtil = (function() {

    function CssUtil() {}

    CssUtil.prototype.createCSSRule = function(id, style_text) {
        var head = document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        style.type = 'text/css';
        style.id = id;
        style.className = "gradient-style";
        var css = style_text;
        if (style.styleSheet){
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        head.appendChild(style);
    };

    return CssUtil;

})();

var timeoutFn;

function start_parse(stream_reader){
    clearTimeout(timeoutFn); // cancel if parsing

    $("#gradient-panel").empty();
    $(".gradient-style").remove();
    gradients = {};

    var cssCreator = new PSDGradient.CSSCreator();
    var parser = new PSDGradient.IncrementParser(stream_reader);
    parser.setup();

    var parse = function(){
        if(parser.hasNext()){
            var index = parser.index;
            var grad_id = "grad-" + index.toString();
            try{
                var gradient = parser.parse();

                var css = cssCreator.createGradientCss(gradient, {selector:"." + grad_id});
                cssUtil.createCSSRule(grad_id, css);

                var elm = $("<div></div>").addClass("gradient grid "+ grad_id);
                elm.data("grad", grad_id);
                elm.appendTo($("#gradient-panel"));

                gradients[grad_id] = gradient;

                if($(".active").length ==0){
                    selectGradient($("." + grad_id));
                }

            }catch(ex){
                console.log("create gradient error:" + ex.message);
            }

            timeoutFn = setTimeout(function () {
                parse();
            }, 0);
        }
    };

    parse();
}


function selectGradient(elem){
    var css_id = $(elem).data("grad");
    $(".active").removeClass("active");
    elem.addClass("active");
    $("#sample-box").attr("class", css_id);
    var style = gradientCssCreator.createGradientStyle(gradients[css_id]);
    $("#grad-info").val(style);
}

$(function(){
    gradientCssCreator = new PSDGradient.CSSCreator();
    cssUtil = new CssUtil();

    if(checkSupportFileApi()){
        var dropZone = document.getElementById('drop_zone');
        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('drop', handleFileDrop, false);
    }
    document.getElementById('files').addEventListener('change', handleFileSelect, false);

    $("#sample-box-wrap").resizable();
    $(document).on("click", ".gradient", function(e){
        selectGradient($(this));

    });
});
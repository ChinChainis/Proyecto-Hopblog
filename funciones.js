
const canvas = document.getElementById("canvas");

canvas.width = window.innerHeight -60;
canvas.height = 400;

let context = canvas.getContext("2d");
let start_background_color = "white";
context.fillStyle = start_background_color;
context.fillRect(0,0,canvas.width,canvas.height);

let draw_color = "black";
let draw_width = "2";
let is_drawing = false;

let frame_array = []
let index_frame = 0;
let num_frames = 1;

let restore_array = [];
let index = -1;


function change_color(element){
   draw_color = element.style.background;
}


canvas.addEventListener("touchstart",start, false);
canvas.addEventListener("touchmove",draw, false);
canvas.addEventListener("mousedown",start, false);
canvas.addEventListener("mousemove",draw, false);

canvas.addEventListener("touchend",stop, false);
canvas.addEventListener("mouseup",stop, false);
canvas.addEventListener("mouseout",stop, false);

/*
window.onload = function() {
   primerframe();
 };

function primerframe(){
   index_frame+=1;
   console.log(index_frame);
}*/


function start(event){
   is_drawing = true;

   context.beginPath();
   context.moveTo(event.clientX - canvas.offsetLeft, 
                  event.clientY - canvas.offsetTop);
   event.preventDefault();
}

function draw(event){
   if (is_drawing) {
      context.lineTo(event.clientX - canvas.offsetLeft, 
                     event.clientY - canvas.offsetTop);
      context.strokeStyle = draw_color;
      context.lineWidth = draw_width;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.stroke();
   }
   event.preventDefault();
}

function stop(event) {
   if (is_drawing){
      context.stroke();
      context.closePath();
      is_drawing=false;
   }

   if(event.type != 'mouseout'){
      event.preventDefault();
      restore_array.push(context.getImageData(0, 0, canvas.width, canvas.height));

      console.log(index_frame);

      //array de dibujos
      frame_array[index_frame]=restore_array;

      //frame_array[index_frame][index] = 0;
      //frame_array.splice(index_frame,0,restore_array);
      //console.log(frame_array[index_frame][0]);

      index += 1;
   }

   console.log(frame_array);
}

function undo(){
   if (index <= 0){
      clear_canvas();
   } else {
      console.log("indice antes undo: ",index);

      index -= 1;
      frame_array[index_frame].pop();

      //frame_array[index_frame] = restore_array;
      console.log("ultimo dibujo: ",frame_array[index_frame][index]);
      context.putImageData(frame_array[index_frame][index], 0,0);
   }

}

function clear_canvas(){
   context.fillStyle = start_background_color;
   context.clearRect(0, 0, canvas.width, canvas.height);
   context.fillRect(0, 0, canvas.width, canvas.height);

   restore_array = [];
   index = -1;
   frame_array[index_frame] = []
}

// https://stackoverflow.com/questions/10673122/how-to-save-canvas-as-an-image-with-canvas-todataurl
// Save | Download image
function downloadImage(data, filename = 'untitled.jpeg') {
   var a = document.createElement('a');
   a.href = data;
   a.download = filename;
   document.body.appendChild(a);
   a.click();
}
/*
// Convert canvas to image
document.getElementById('btn-download').addEventListener("click", function(e) {
   //console.log("holaaa");

   var canvas = document.querySelector('canvas');

   var dataURL = canvas.toDataURL("image/jpeg", 1.0);

   downloadImage(dataURL, 'my-canvas.jpeg');
});*/

document.getElementById('btn-download-PNG').addEventListener("click", function(e) {
   //console.log("holaaa");
   let downloadLink = document.createElement('a');
   downloadLink.setAttribute('download', 'canvas.png');
   var canvas = document.querySelector('canvas');
   canvas.toBlob(blob => {
     let url = URL.createObjectURL(blob);
     downloadLink.setAttribute('href', url);
     downloadLink.click();
   });
});


document.getElementById('btn-video').addEventListener("click", function(e) {
   console.log(num_frames);
   var pics = [];
   for (let i = 0; i < num_frames; i++) {
      console.log("holaaa");
      var tamtotal = frame_array[i].length - 1;
      context.putImageData(frame_array[i][tamtotal], 0,0);  
      var nomarchivo = 'frame' + i + '.png';
      var a = document.createElement('a');
      pics.push(a);
      //a.click();

      let downloadLink = document.createElement('a');
      downloadLink.setAttribute('download', nomarchivo);
      var canvas = document.querySelector('canvas');
      canvas.toBlob(blob => {
        let url = URL.createObjectURL(blob);
        downloadLink.setAttribute('href', url);
        downloadLink.click();
      });

   } 
   console.log(pics);
   //https://www.geeksforgeeks.org/how-to-generate-video-from-images-in-html5/

   //https://stackoverflow.com/questions/42798219/pipe-multiple-jpgs-into-an-animated-gif-using-node-js

});


document.getElementById('btn-next').addEventListener("click", function(e) {
   //console.log("holaaa");
   index_frame += 1;
   if (index_frame >= num_frames){
      clear_canvas();
      num_frames += 1;
      index = -1;
      restore_array = [];
      console.log("num. frames: ",num_frames);
   }else if(frame_array[index_frame].length >= 1){
      console.log("frame: ",index_frame);
      console.log("indice: ",index);
      index = frame_array[index_frame].length - 1;
      context.putImageData(frame_array[index_frame][index], 0,0);       
   }else{
      index = 0;
   }
   console.log("frame: ",index_frame);
   console.log("indice: ",index);
});

document.getElementById('btn-before').addEventListener("click", function(e) {
   if (index_frame > 0){
      index_frame -= 1;
      if(frame_array[index_frame].length >= 1){
         index = frame_array[index_frame].length - 1;
         console.log("frame: ",index_frame);
         console.log("indice: ",index);
         context.putImageData(frame_array[index_frame][index], 0,0);    
      }else{
         index = 0;
      }
   }
   console.log("frame: ",index_frame);
   console.log("indice: ",index);
});

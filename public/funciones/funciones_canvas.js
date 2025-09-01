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

var idvid= 0;
var nombvid= "";



var tmpspan= document.getElementById('spanpag');
tmpspan.textContent = index_frame + 1;

var tmpspant= document.getElementById('spantot');
tmpspant.textContent = num_frames;

var spanloading= document.getElementById('spanload');

function change_color(element){
   draw_color = element.style.background;
}

function borra_color(element){
   draw_color = "white";
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
      if(draw_width == 3){
         context.lineWidth = draw_width*2;
      }else{
         context.lineWidth = draw_width;
      }
      
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

      //array de dibujos
      frame_array[index_frame]=restore_array;

      //frame_array[index_frame][index] = 0;
      //frame_array.splice(index_frame,0,restore_array);

      index += 1;
   }

}

function undo(){
   if (index <= 0){
      clear_canvas();
   } else {

      index -= 1;
      frame_array[index_frame].pop();

      //frame_array[index_frame] = restore_array;
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

   var canvas = document.querySelector('canvas');

   var dataURL = canvas.toDataURL("image/jpeg", 1.0);

   downloadImage(dataURL, 'my-canvas.jpeg');
});*/

/*document.getElementById('btn-download-PNG').addEventListener("click", function(e) {
   var pics = [];

   for (let i = 0; i < num_frames; i++) {
      var tamtotal = frame_array[i].length - 1;
      context.putImageData(frame_array[i][tamtotal], 0,0);  
      var nomarchivo = 'frame' + i + '.png';
      var a = document.createElement('a');
      var canvas = document.querySelector('canvas');
      //var datosimg = canvas.toDataURL().split(';base64,')[1];
      var datosimg =  canvas.toDataURL("image/base64", 1.0);
      pics.push(datosimg);
      //pics.push(frame_array[i]);
      //pics.push(a);
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

});*/

function sleep(ms){
   return new Promise(resolve => setTimeout(resolve,ms));
}

function envioframes(id_rand,numnote){

      idvid = id_rand;
      nombvid = numnote;

      //let listaframesstrings = [];
      //https://proyecto-hopblog.onrender.com/
      //"http://127.0.0.1:3000/frames/"+id_rand+"/"+numnote
      const apiCall = (posact) => fetch("https://proyecto-hopblog.onrender.com/frames/"+id_rand+"/"+numnote, {
            method: "POST",
            headers: {
            'Content-Type': 'application/json'
            },
            /*body: JSON.stringify({
               listf : content,
            })*/
            body: "[" + JSON.stringify(posact+1) + "," + JSON.stringify(datosimg) + "]"//btoa( unescape(encodeURIComponent (JSON.stringify(pics))) )
         })
         .then( res => res.json() ) 
         .then( data => console.log(data) )
         .catch( error => console.error(error) );   
/*
      for (let i = 0; i < num_frames; i++) {

         var tamtotal = frame_array[i].length - 1;
         context.putImageData(frame_array[i][tamtotal], 0,0);  
         var canvas = document.querySelector('canvas');
         var datosimg =  canvas.toDataURL("image/base64", 1.0);

         listaframesstrings.push("[" + JSON.stringify(i+1) + "," + JSON.stringify(datosimg) + "]");

         if(i%2==0 && i!=num_frames-1 && i!=0){
            apiCall(listaframesstrings);
            listaframesstrings = [];
            listaframesstrings.push("[" + JSON.stringify(i+1) + "," + JSON.stringify(datosimg) + "]");
         }         

      }
      apiCall(listaframesstrings);*/
      
      for (let i = 0; i < num_frames; i++) {

         var tamtotal = frame_array[i].length - 1;
         context.putImageData(frame_array[i][tamtotal], 0,0);  
         var canvas = document.querySelector('canvas');
         //var datosimg = canvas.toDataURL().split(';base64,')[1];
         var datosimg =  canvas.toDataURL("image/base64", 1.0);
         //pics.push(datosimg);

         apiCall(i);
      }

}

function renderizavid(id_rand,numnote){
   //fetch("http://127.0.0.1:3000/creavideo/"+id_rand+"/"+numnote);
   //"https://proyecto-hopblog.onrender.com/creavideo/"
   window.location.href = "https://proyecto-hopblog.onrender.com/creavideo/"+id_rand+"/"+numnote;
}

function renderizaprev(id_rand,numnote){
   spanloading.textContent = "";

   window.location.href = "https://proyecto-hopblog.onrender.com/preview/"+id_rand+"/"+numnote;
}



document.getElementById('btn-video').addEventListener("click", function(e) {
   var pics = [];
   /*
   for (let i = 0; i < num_frames; i++) {
      var tamtotal = frame_array[i].length - 1;
      context.putImageData(frame_array[i][tamtotal], 0,0);  
      var nomarchivo = 'frame' + i + '.png';
      var a = document.createElement('a');
      var canvas = document.querySelector('canvas');
      //var datosimg = canvas.toDataURL().split(';base64,')[1];
      var datosimg =  canvas.toDataURL("image/base64", 1.0);
      pics.push(datosimg);
   } */

   //var datosimg =  canvas.toDataURL("image/jpeg", 1.0);
   spanloading.textContent = "por favor espera!";

   const arrayDestinedForServer = [ "A", 42, false ]; // This would be your cArray

   const form = document.querySelector("form");
   let id_rand = Math.random() * (100000 - 10000) + 10000;

   form.addEventListener("submit", e =>{
      e.preventDefault();
      let numnote = (document.getElementById("fname").value).replace(/ /g,"_");

      let tiempotot = num_frames * 2500;

      const myPromise = new Promise((resolve) => {

            envioframes(id_rand,numnote);

      });
      myPromise
      .then(setTimeout(() => { renderizavid(id_rand,numnote)}, tiempotot))
      .then(setTimeout(() => { renderizaprev(id_rand,numnote)}, tiempotot+2000));

   })


});

/*document.getElementById('btn-form').addEventListener("click", function(e) {
   console.log("dentro form");
   // The Array that will be send to the server:
  const arrayDestinedForServer = [ "A", 42, false ]; // This would be your cArray

  const form = document.querySelector("form");

  // Handle the form's submit event (when the button Submit gets clicked)
  form.addEventListener("submit", e =>{
      // Prevent the default HTML form submission behavior:
      e.preventDefault();
      console.log((document.getElementById("fname").value).replace(/ /g,"_"));
      let numnote = (document.getElementById("fname").value).replace(/ /g,"_");
      fetch("http://localhost:3000/notes/id:"+numnote);

   })
});*/
/*
document.getElementById('btn-preview').addEventListener("click", function(e) {
   window.location.href = "http://127.0.0.1:3000/preview/"+idvid+"/"+nombvid;
});*/

document.getElementById('btn-next').addEventListener("click", function(e) {
   index_frame += 1;
   tmpspan.textContent = index_frame + 1;
   
   if (index_frame >= num_frames){
      clear_canvas();
      num_frames += 1;
      //index = -1;
      tmpspant.textContent = num_frames;

      restore_array = [];
   }else{
      index = frame_array[index_frame].length - 1;
      context.putImageData(frame_array[index_frame][index], 0,0);  
   }
   
   /*else if(frame_array[index_frame].length >= 1){
      index = frame_array[index_frame].length - 1;
      context.putImageData(frame_array[index_frame][index], 0,0);       
   }else{
      index = 0;
   }*/
   console.log("frame: ",index_frame);
   //console.log("indice: ",index);
});

document.getElementById('btn-before').addEventListener("click", function(e) {
   if (index_frame > 0){
      
      index_frame -= 1;
      tmpspan.textContent = index_frame + 1;

      if(frame_array[index_frame].length == 0){
         console.log("tope alcanzado");
      }
      if(frame_array[index_frame].length >= 1){
         index = frame_array[index_frame].length - 1;
         //console.log("frame: ",index_frame);
         //console.log("indice: ",index);
         context.putImageData(frame_array[index_frame][index], 0,0); 
               
      }else{
         index = 0;
      }
   }
   else{
      console.log("No hay más frames");
   }

});

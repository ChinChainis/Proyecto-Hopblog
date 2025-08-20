
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

   //console.log(frame_array);
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

/*document.getElementById('btn-download-PNG').addEventListener("click", function(e) {
   console.log(num_frames);
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
      //console.log(pics);
      //pics.push(frame_array[i]);
      //pics.push(a);
      //a.click();
      //console.log("datos: " + JSON.stringify(datosimg));
      //console.log("pics: " + JSON.stringify(pics));


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

      const apiCall = (posact) => fetch("http://127.0.0.1:3000/frames/"+id_rand+"/"+numnote, {
            method: "POST",
            headers: {
            'Content-Type': 'application/json'
            },
            body: "[" + JSON.stringify(posact+1) + "," + JSON.stringify(datosimg) + "]"//btoa( unescape(encodeURIComponent (JSON.stringify(pics))) )
         })
         .then( res => res.json() ) 
         .then( data => console.log(data) )
         .catch( error => console.error(error) );   


      for (let i = 0; i < num_frames; i++) {

         var tamtotal = frame_array[i].length - 1;
         context.putImageData(frame_array[i][tamtotal], 0,0);  
         var canvas = document.querySelector('canvas');
         //var datosimg = canvas.toDataURL().split(';base64,')[1];
         var datosimg =  canvas.toDataURL("image/base64", 1.0);
         //pics.push(datosimg);
         console.log('frame numeroo: ', i+1);

         apiCall(i);
      }
}

function renderizavid(id_rand,numnote){
   fetch("http://127.0.0.1:3000/creavideo/"+id_rand+"/"+numnote);
}

function renderizaprev(id_rand,numnote){
   spanloading.textContent = "";

   window.location.href = "http://127.0.0.1:3000/preview/"+id_rand+"/"+numnote;
}



document.getElementById('btn-video').addEventListener("click", function(e) {
   console.log(num_frames);
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

   console.log("dentro form ");
   const arrayDestinedForServer = [ "A", 42, false ]; // This would be your cArray

   const form = document.querySelector("form");
   let id_rand = Math.random() * (100000 - 10000) + 10000;

   form.addEventListener("submit", e =>{
      e.preventDefault();
      let numnote = (document.getElementById("fname").value).replace(/ /g,"_");

      let tiempotot = num_frames * 2500;

      //const myPromise = new Promise((resolve) => {
         //setTimeout(envioframes(id_rand,numnote),tiempotot);
         //setTimeout(() => {
            // Other things to do before completion of the promise
            //envioframes(id_rand,numnote);
            // The fulfillment value of the promise
            //resolve(renderizavid(id_rand,numnote));
         //   resolve(envioframes(id_rand,numnote));
         //}, tiempotot);
      //});
      //myPromise
      //.then(setTimeout(() => { renderizavid(id_rand,numnote)}, tiempotot))
      /*.then(setTimeout(() => { renderizaprev(id_rand,numnote)}, tiempotot*4))*/;
      //myPromise.then(renderizavid(id_rand,numnote)).catch( error => console.error(error) );
      //myPromise.then(renderizavid(id_rand,numnote)).catch( error => console.error(error) ); 
      //envioframes(id_rand,numnote).then(() => { return renderizavid(id_rand,numnote) }).then((result) => { console.log(result)});

         ;
      idvid = id_rand;
      nombvid = numnote;

      const apiCall = (posact) => fetch("http://127.0.0.1:3000/frames/"+id_rand+"/"+numnote, {
            method: "POST",
            headers: {
            'Content-Type': 'application/json'
            },
            body: "[" + JSON.stringify(posact+1) + "," + JSON.stringify(datosimg) + "]"//btoa( unescape(encodeURIComponent (JSON.stringify(pics))) )
         })
         .then( res => res.json() ) 
         .then( data => console.log(data) )
         .catch( error => console.error(error) );   


      for (let i = 0; i < num_frames; i++) {

         var tamtotal = frame_array[i].length - 1;
         context.putImageData(frame_array[i][tamtotal], 0,0);  
         var nomarchivo = 'frame' + i + '.png';
         var a = document.createElement('a');
         var canvas = document.querySelector('canvas');
         //var datosimg = canvas.toDataURL().split(';base64,')[1];
         var datosimg =  canvas.toDataURL("image/base64", 1.0);
         //pics.push(datosimg);
         console.log('frame numeroo: ', i+1);
         /*fetch("http://127.0.0.1:3000/frames/"+id_rand+"/"+numnote, {
            method: "POST",
            headers: {
            'Content-Type': 'application/json'
            },
            body: "[" + JSON.stringify(i+1) + "," + JSON.stringify(datosimg) + "]"//btoa( unescape(encodeURIComponent (JSON.stringify(pics))) )
         })
         .then( res => res.json() ) 
         .then( data => console.log(data) )
         .catch( error => console.error(error) );   */
         apiCall(i);

      };
      console.log("fin bucle");
      frame_array = []
      index_frame = 0;
      //poner tiempo de espera equivalente al número de frames?
      let tiemp = (num_frames*2500);
      setTimeout(function(){
         
         fetch("http://127.0.0.1:3000/creavideo/"+id_rand+"/"+numnote);
         
      }, tiemp);
      //console.log('tiemp: ',tiemp);
      let tiemp2 = tiemp * 5;
      setTimeout(function(){
         spanloading.textContent = "";

         window.location.href = "http://127.0.0.1:3000/preview/"+id_rand+"/"+numnote;
      }, tiemp2);
   })
   //console.log("pic",pics);
   //https://www.geeksforgeeks.org/how-to-generate-video-from-images-in-html5/

   //https://stackoverflow.com/questions/42798219/pipe-multiple-jpgs-into-an-animated-gif-using-node-js

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

document.getElementById('btn-preview').addEventListener("click", function(e) {
   window.location.href = "http://127.0.0.1:3000/preview/"+idvid+"/"+nombvid;
});

document.getElementById('btn-next').addEventListener("click", function(e) {
   //console.log("holaaa");
   index_frame += 1;
   tmpspan.textContent = index_frame + 1;
   
   if (index_frame >= num_frames){
      clear_canvas();
      num_frames += 1;
      //index = -1;
      tmpspant.textContent = num_frames;

      restore_array = [];
      console.log("num. frames: ",num_frames);
   }else{
      console.log("frame: ",index_frame);
      //console.log("indice: ",index);
      index = frame_array[index_frame].length - 1;
      context.putImageData(frame_array[index_frame][index], 0,0);  
   }
   
   /*else if(frame_array[index_frame].length >= 1){
      console.log("frame: ",index_frame);
      //console.log("indice: ",index);
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
         console.log("aa");
      }
      if(frame_array[index_frame].length >= 1){
         index = frame_array[index_frame].length - 1;
         console.log("frame: ",index_frame);
         console.log("indice: ",index);
         context.putImageData(frame_array[index_frame][index], 0,0); 
               
      }else{
         index = 0;
      }
   }
   else{
      console.log("frena que no hay más");
   }
   console.log("frame: ",index_frame);
   console.log("indice: ",index);
});

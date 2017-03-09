var currently_dragged;
var working_area;
function drag_start(event) {
  console.log("drag_start");
  currently_dragged=event.target;
  var rect = currently_dragged.getBoundingClientRect();
  if(currently_dragged.parentNode.className=="toolcontainer"){
    var replacement_tool=currently_dragged.cloneNode(true);
    replacement_tool.addEventListener('dragstart',drag_start,false);
    currently_dragged.parentNode.appendChild(replacement_tool);
  }
  working_area.appendChild(currently_dragged);
  currently_dragged.style.left=Math.floor(rect.left)+"px";
  currently_dragged.style.top=Math.floor(rect.top)+"px";
  currently_dragged.style.position="absolute";
  var style = window.getComputedStyle(event.target, null);
  event.dataTransfer.setData("text/plain",
  (parseInt(style.getPropertyValue("left"),10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"),10) - event.clientY));
}
function drag_over(event) {
  event.preventDefault();
  return false;
}
function drop(event) {
  console.log("drop "+event.target.id);
  if(event.target.id=="working_area"){
    event.target.appendChild(currently_dragged);
  }else if(event.target.id=="toolbar"){
    currently_dragged.parentNode.removeChild(currently_dragged);
  }
  var offset = event.dataTransfer.getData("text/plain").split(',');
  currently_dragged.style.left = (event.clientX + parseInt(offset[0],10)) + 'px';
  currently_dragged.style.top = (event.clientY + parseInt(offset[1],10)) + 'px';
  event.preventDefault();
  return false;
}
window.onload=function(){
  working_area=document.getElementById("working_area");
  var tools = document.querySelectorAll(".tool");
  for (var i = 0; i < tools.length; i++) {
      tools[i].addEventListener('dragstart',drag_start,false);
      working_area.addEventListener('dragover',drag_over,false);
      working_area.addEventListener('drop',drop,false);
  }

}

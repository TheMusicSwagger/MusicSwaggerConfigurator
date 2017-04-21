var working_area, toolbar, canvas, context; // global vars

var tool_counter = 0;
var pseudo_link_counter = 0;
var link_counter = 0;

window.onload = function () {
    // getting basic elements
    working_area = document.getElementById("working_area");
    canvas = document.getElementById("main_cavas");
    toolbar = document.getElementById("toolbar");

    // adding drag functionality to tools
    var tools = toolbar.querySelectorAll(".tool");
    for (var i = 0; i < tools.length; i++) {
        tools[i].addEventListener("dragover", drag_over, false);
        tools[i].addEventListener("dragstart", drag_start, false);
    }
    working_area.addEventListener("dragover", drag_over, false);
    working_area.addEventListener("drop", drop, false);
    toolbar.addEventListener("dragover", drag_over, false);
    toolbar.addEventListener("drop", drop, false);

    // preparing canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context = canvas.getContext("2d");
};

window.onresize = function (event) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    update_links();
};


function get_link_id(link) {
    var s = link.getAttribute("id").split("_");
    return s[s.length - 1];
}

function remove_link(id) {
    var link0 = document.getElementById("link_0_" + id),
        link1 = document.getElementById("link_0_" + id);
    link0.parentNode.appendChild(create_pseudo_link());
    link1.parentNode.appendChild(create_pseudo_link());
    link0.parentNode.removeChild(link0);
    link1.parentNode.removeChild(link1);
}

function get_formatted_data(div, other) {
    // data to be send to the drop
    // uid|data... (sep with "," for example old coords)
    var data = "";
    data += div.getAttribute("id") + "|";
    data += other.join(",");
    return data;
}

function parse_formatted_data(data) {
    var r1 = data.split("|");
    var id = r1[0];
    var other = r1[1].split(",");
    return [id, other];
}

function create_pseudo_link() {
    var pseudo_link = document.createElement("div");
    pseudo_link.setAttribute("class", "pseudo_link");
    pseudo_link.setAttribute("draggable", "true");
    pseudo_link.setAttribute("id", "pseudo_link_" + pseudo_link_counter.toString());
    pseudo_link.addEventListener("dragstart", drag_start, false);
    pseudo_link.addEventListener("dragover", drag_over, false);
    pseudo_link.addEventListener("drop", drop, false);
    pseudo_link_counter++;
    return pseudo_link;
}

function drop(event) {
    event.preventDefault();
    var pdata = parse_formatted_data(event.dataTransfer.getData("text/plain"));
    var drop_target = event.target;
    var drop_target_class = drop_target.getAttribute("class");
    console.log(pdata);
    var currently_dragged = document.getElementById(pdata[0]);
    var current_class = currently_dragged.getAttribute("class");
    console.log("Drop : " + current_class + " -> " + drop_target_class);
    if (current_class == "tool") {
        if (drop_target_class == "working_area") {
            var offset = pdata[1];
            currently_dragged.style.left = (event.clientX + parseInt(offset[0], 10)) + "px";
            currently_dragged.style.top = (event.clientY + parseInt(offset[1], 10)) + "px";
        } else if (drop_target_class == "toolbar") {
            var links = currently_dragged.querySelector(".link");
            for (var i = 0; i < links.length; i++) {
                remove_link(links[i].getAttribute("id"));
            }
            currently_dragged.parentNode.removeChild(currently_dragged);
        }
    } else if (current_class == "pseudo_link") {
        var parent_from = currently_dragged.parentNode;
        if (drop_target_class == "pseudo_link" || drop_target == "link_container") {
            var parent_target = drop_target;
            if (drop_target_class == "pseudo_link") {
                parent_target = drop_target.parentNode;
            }
            // create real links
            var link0 = document.createElement("div"),
                link1;
            link0.setAttribute("class", "link");
            link0.setAttribute("draggable", "true");
            link0.addEventListener("dragstart", drag_start, false);
            link0.addEventListener("dragover", drag_over, false);
            link0.addEventListener("drop", drop, false);

            link1 = link0.cloneNode(true);

            link0.setAttribute("id", "link_0_" + link_counter.toString());
            link1.setAttribute("id", "link_1_" + link_counter.toString());

            parent_from.appendChild(link0);
            parent_target.appendChild(link1);
            // remove pseudo_links
            parent_from.removeChild(currently_dragged);
            parent_target.removeChild(drop_target);

            // link created
            link_counter++;
        }
    } else if (current_class == "link") {
        if (drop_target_class == "link" || drop_target_class == "link_container") {
            var container = drop_target;
            if (drop_target_class == "link") {
                container = drop_target.parentNode;
            }
            remove_link(get_link_id(currently_dragged));
        }

    }
    update_links();
}

function drag_over(event) {
    event.preventDefault();
}

function drag_start(event) {
    var currently_dragged = event.target;
    var current_class = currently_dragged.getAttribute("class");
    console.log("Drag : " + current_class);
    if (current_class == "tool") {
        if (currently_dragged.parentNode.getAttribute("class") == "toolcontainer") {
            // tool is in the toolbar
            // replacing tool
            var replacement_tool = currently_dragged.cloneNode(true);
            replacement_tool.addEventListener("dragstart", drag_start, false);


            // getting rect and setting css
            var rect = currently_dragged.getBoundingClientRect();
            currently_dragged.style.left = Math.floor(rect.left) + "px";
            currently_dragged.style.top = Math.floor(rect.top) + "px";
            currently_dragged.style.position = "absolute";

            // replace tool
            currently_dragged.parentNode.appendChild(replacement_tool);
            working_area.appendChild(currently_dragged);


            // set id of tool
            currently_dragged.setAttribute("id", currently_dragged.getAttribute("id") + "_" + tool_counter.toString())

            // create links
            var links = currently_dragged.querySelectorAll(".link_container");
            for (var i = 0; i < links.length; i++) {

                links[i].appendChild(create_pseudo_link());
                links[i].addEventListener("dragover", drag_over, false);
                links[i].addEventListener("drop", drop, false);
            }
            // added a tool
            tool_counter++;
        }
        // give original position
        var style = window.getComputedStyle(currently_dragged, null);
        event.dataTransfer.setData("text/plain", get_formatted_data(currently_dragged, [parseInt(style.getPropertyValue("left"), 10) - event.clientX, parseInt(style.getPropertyValue("top"), 10) - event.clientY]));
    } else if (current_class == "link") {
        event.dataTransfer.setData("text/plain", get_formatted_data(currently_dragged, []));
    } else if (current_class == "pseudo_link") {
        event.dataTransfer.setData("text/plain", get_formatted_data(currently_dragged, []));
    }
}

function update_links() {
    clearCanvas();
    for (var i = 0; i < link_counter; i++) {
        new drawLineBetweenDiv(document.getElementById("link_0_" + i.toString()), document.getElementById("link_1_" + i.toString()));
    }
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function drawLineBetweenDiv(div1, div2) {
    context.strokeStyle = 'orange';
    context.lineWidth = 4;
    context.lineCap = "round";
    context.beginPath();
    var rect1 = div1.getBoundingClientRect();
    var rect2 = div2.getBoundingClientRect();
    context.moveTo(rect1.left + ((rect1.right - rect1.left) / 2), rect1.top + ((rect1.bottom - rect1.top) / 2));
    context.lineTo(rect2.left + ((rect2.right - rect2.left) / 2), rect2.top + ((rect2.bottom - rect2.top) / 2));
    context.stroke();
}


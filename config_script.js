var working_area, toolbar, canvas, context, save_form, config_input; // global vars

var tool_counter = 1;
var pseudo_link_counter = 1;
var link_counter = 0;
// for the tools, pseudo_links and links to have an unique identifier
// (out is 0 at the beginning for tool and pseudo_link)

var available_links = [];
var available_boxes = ["output"];
// needed to know which box and link are on the page
// (output will always be available)

window.onload = function () {
    /*
        Event to wait for the page to be loaded before executing the code
    */
    // getting basic elements
    working_area = document.getElementById("working_area");
    canvas = document.getElementById("main_cavas");
    toolbar = document.getElementById("toolbar");
    save_form = document.getElementById("save_form");
    config_input = document.getElementById("config_input");


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
    /*
        Event to handle the resizing of the window
    */
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    update_links();
};


function get_link_id(link) {
    /*
        returns the link id number based on his id
    */
    var s = link.getAttribute("id").split("_");
    return s[s.length - 1];
}

function remove_link(id) {
    /*
        Function that does the stuff to remove a link and replace it with a pseudo_link
    */
    var index = available_links.indexOf(id);
    if (index > -1) {
        var link0 = document.getElementById("link_0_" + id),
            link1 = document.getElementById("link_1_" + id);
        link0.parentNode.appendChild(create_pseudo_link());
        link1.parentNode.appendChild(create_pseudo_link());
        link0.parentNode.removeChild(link0);
        link1.parentNode.removeChild(link1);
        available_links.splice(index, 1);
    } else {
        console.log("Link doesn't exists !");
    }
    console.log(available_links);
}

function remove_box(box) {
    /*
        Used to destroy a box and the links attached to it
    */

    var index = available_boxes.indexOf(box.getAttribute("id"));
    if (index > -1)
        var links = box.querySelectorAll(".link");
    if (links != null) {
        for (var i = 0; i < links.length; i++) {
            remove_link(get_link_id(links[i]));
        }
        box.parentNode.removeChild(box);
        available_boxes.splice(index, 1);
    } else {
        console.log("Box doesn't exists !");
    }
    console.log(available_boxes);
}

function get_formatted_data(div, other) {
    /*
        Encode the data to be able to attach the data to a drag event (to store the old position of an object for exemple)
    */
    // data to be send to the drop
    // uid|data... (sep with "," for example old coords)
    var data = "";
    data += div.getAttribute("id") + "|";
    data += other.join(",");
    return data;
}

function parse_formatted_data(data) {
    /*
        function used to retreive data encoded by get_formatted_data
    */
    var r1 = data.split("|");
    var id = r1[0];
    var other = r1[1].split(",");
    return [id, other];
}

function create_pseudo_link() {
    /*
        function to help creating a pseudo_link when a link is destroyed or when a new object is created
    */
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
    /*
        Event triggered when a drop occurs (after a drag_start)
    */
    event.stopPropagation();
    var pdata = parse_formatted_data(event.dataTransfer.getData("text/plain"));
    var drop_target = event.target;
    var drop_target_class = drop_target.getAttribute("class");
    var currently_dragged = document.getElementById(pdata[0]);
    var current_class = currently_dragged.getAttribute("class");
    console.log("Drop : " + current_class + " -> " + drop_target_class);
    if (current_class == "tool") {
        if (drop_target_class == "toolbar" || (drop_target_class == "tool" && drop_target.parentNode.getAttribute("class") == "toolcontainer")) {
            remove_box(currently_dragged);
        } else {
            var offset = pdata[1];
            currently_dragged.style.left = (event.clientX + parseInt(offset[0], 10)) + "px";
            currently_dragged.style.top = (event.clientY + parseInt(offset[1], 10)) + "px";
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
            available_links.push(link_counter.toString());
            link_counter++;
        }
    } else if (current_class == "link") {
        if (drop_target_class == "link" || drop_target_class == "link_container") {
            var container = drop_target;
            if (drop_target_class == "link") {
                container = drop_target.parentNode;
            }
            remove_link(get_link_id(container.childNodes[0]));
        } else if (drop_target_class == "working_area" || drop_target_class == "toolbar") {
            remove_link(get_link_id(currently_dragged));
        }
    }
    update_links();
    event.preventDefault();
}

function drag_over(event) {
    /*
        To be able to drag an object
    */
    event.preventDefault();
}

function drag_start(event) {
    /*
        Event triggered when a drag is started
    */
    event.stopPropagation();
    var currently_dragged = event.target;
    var current_class = currently_dragged.getAttribute("class");
    console.log("Drag : " + current_class + " " + currently_dragged.getAttribute("id"));
    if (current_class == "tool") {
        if (currently_dragged.parentNode.getAttribute("class") == "toolcontainer") {
            // tool is in the toolbar
            // replacing tool
            var replacement_tool = currently_dragged.cloneNode(true);
            replacement_tool.addEventListener("dragover", drag_over, false);
            replacement_tool.addEventListener("dragstart", drag_start, false);


            // getting rect and setting css
            var rect = currently_dragged.getBoundingClientRect();
            currently_dragged.style.left = Math.floor(rect.left) + "px";
            currently_dragged.style.top = Math.floor(rect.top) + "px";
            currently_dragged.style.position = "absolute";

            // replace tool
            currently_dragged.parentNode.appendChild(replacement_tool);
            working_area.appendChild(currently_dragged);

            // make links_container visible
            currently_dragged.querySelector(".links_container").setAttribute("style", "display:flex");


            // set id of tool
            currently_dragged.setAttribute("id", currently_dragged.getAttribute("id") + "_" + tool_counter.toString())
            currently_dragged.setAttribute("data-boxid", tool_counter.toString())

            // store the new box into the available_boxes
            available_boxes.push(currently_dragged.getAttribute("id"));

            // create links
            var links = currently_dragged.querySelectorAll(".link_container");
            for (var i = 0; i < links.length; i++) {

                links[i].appendChild(create_pseudo_link());
                links[i].addEventListener("dragover", drag_over, false);
                links[i].addEventListener("drop", drop, false);
                links[i].setAttribute("data-linkid", i);
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
    /*
        do the stuff to display links
    */
    clear_canvas();
    available_links.forEach(function (e) {
        new draw_line_between_div("link_0_" + e, "link_1_" + e);
    });
}

function clear_canvas() {
    /*
        Clears the canvas to be able to redraw on it
    */
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function draw_line_between_div(id_div1, id_div2) {
    /*
        draw a line between two links 
    */
    var div1 = document.getElementById(id_div1),
        div2 = document.getElementById(id_div2);
    if (div1 == null) {
        console.log("Div1 not found : " + id_div1);
        return;
    }
    if (div2 == null) {
        console.log("Div2 not found : " + id_div2);
        return;
    }
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

function get_link_tool_number(linkid) {
    /*
        return the tool id where the link is attached
    */
    var parent = document.getElementById(linkid).parentNode;
    while (true) {
        if (parent.getAttribute("class") == "tool") {
            return parent.getAttribute("data-boxid");
        }
        parent = parent.parentNode;
    }
}

function get_link_number(linkid) {
    /*
        return the number of the link_container of a link object
    */
    return document.getElementById(linkid).parentNode.getAttribute("data-linkid");
}

function get_linked(index) {
    /*
        return the two tools linked by the link number "index" and also on which link_container the link is attached to.
    */
    var link1 = "link_0_" + index.toString(),
        link2 = "link_1_" + index.toString();
    return [{
            "boxid": get_link_tool_number(link1),
            "linkid": get_link_number(link1)
    },
        {
            "boxid": get_link_tool_number(link2),
            "linkid": get_link_number(link2)
    }];
}

function save_data() {
    /*
        Format and send the data to the save page to store infos about the configuration in the database
    */
    var dataDict = {};
    var links = [];
    for (var i = 0; i < available_links.length; i++) {
        var lks = get_linked(available_links[i]);
        var linkdata = {
            "BOX_ID_1": lks[0]["boxid"],
            "LINK_ID_1": lks[0]["linkid"],
            "BOX_ID_2": lks[1]["boxid"],
            "LINK_ID_2": lks[1]["linkid"]
        };
        // json data to send
        // array("LINKS"=>array(array("BOX_ID_1"=>"1","LINK_ID_1"=>"1","BOX_ID_2"=>"2","LINK_ID_2"=>"1")),
        // "BOXES"=>array(array("TYPE"=>"IN","BOX_ID"=>"1","SPEC_PARAM"=>"hello"),array("TYPE"=>"OUT","BOX_ID"=>"2","SPEC_PARAM"=>"hello2"))
        //)
        links.push(linkdata);
    }
    dataDict["LINKS"] = links;
    var boxes = [];
    for (var i = 0; i < available_boxes.length; i++) {
        var box = document.getElementById(available_boxes[i]);
        var boxdata = {
            "TYPE": box.getAttribute("data-toolid"),
            "BOX_ID": box.getAttribute("data-boxid")
        }
        var input = box.querySelector("input");
        if (input) {
            boxdata["SPEC_PARAM"] = input.value;
        } else {
            boxdata["SPEC_PARAM"] = "";
        }
        boxes.push(boxdata);
    }
    dataDict["BOXES"] = boxes;
    console.log(dataDict);
    console.log(JSON.stringify(dataDict));
    config_input.setAttribute("value", JSON.stringify(dataDict));
    save_form.submit();
}

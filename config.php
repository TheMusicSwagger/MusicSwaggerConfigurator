<!DOCTYPE html>

<?php
    $db=new PDO("mysql:host=localhost;dbname=musicswagger;charset=utf8", "root", "");
?>

    <html>

    <head>
        <meta charset="utf-8" />
        <title>Config Page</title>
        <link rel="stylesheet" type="text/css" href="config_style.css">
        <script src="config_script.js"></script>
    </head>

    <body>
        <div id="toolbar" class="toolbar">
            <?php
            //available_tools
            $response = $db->query("SELECT * FROM available_tools");
            while($data = $response->fetch()){
                echo '<div class="toolcontainer">';
                echo '<div draggable="true" class="tool" id="tool_0" data-toolid="'.$data['type'].'">';
                echo $data['name'];
                echo '<div class="links_container">';
                echo '<div class="inputs">';
                if($data['need_input']==1){
                    echo '<input class="boxinput" type="text" />';
                }
                for($i=0;$i<$data['inputs'];$i++){
                    echo '<div class="link_container"></div>';
                }
                echo '</div>';
                echo '<div class="outputs">';
                for($i=0;$i<$data['outputs'];$i++){
                    echo '<div class="link_container"></div>';
                }
                echo '</div>';
                echo '</div>';
                echo '</div>';
                echo '</div>';
                
            }
        ?>
        </div>
        <div id="working_area" class="working_area">
            <div data-boxid="0" class="tool" id="output" data-toolid="OUT">
                Output
                <div class="links_container" style="display:flex">
                    <div class="inputs">
                        <div data-linkid="0" class="link_container">
                            <div id="pseudo_link_0" draggable="true" class="pseudo_link"></div>
                        </div>
                    </div>
                    <div class="outputs"></div>
                </div>
            </div>
        </div>
        <canvas id="main_cavas"></canvas>
        <button type="button" id="save_button" onclick="save_data()">Save !</button>
        <form method="post" action="/save.php" id="save_form">
            <input type="hidden" name="config" id="config_input" value="" />
        </form>
    </body>

    </html>

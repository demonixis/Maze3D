(function() {
      var width = window.innerWidth * 0.995;
      var height = window.innerHeight * 0.995;
      var canvasContainer = document.getElementById("canvasContainer");

      var renderer, camera , scene;
      var input, miniMap, levelHelper, CameraHelper;
      var stats;

      var textures = new Array(4);
      var textLoaded = false;
      var map = new Array();
      var running = true;

      function initializeEngine ()
      {
          renderer = new THREE.WebGLRenderer({antialias: true});
          renderer.setSize(width, height);
          renderer.setClearColorHex(0xEEEEEE, 1.0);
          renderer.clear();

          scene = new THREE.Scene();

          camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
          camera.position.y = 50;
          scene.add(camera);
          
          stats = new Stats();
          stats.domElement.style.position = "absolute";
          stats.domElement.style.bottom = "0px";

          textures[0] = THREE.ImageUtils.loadTexture("assets/images/textures/grate02.jpg");
          textures[1] = THREE.ImageUtils.loadTexture("assets/images/textures/slab03.jpg");
          textures[2] = THREE.ImageUtils.loadTexture("assets/images/textures/aztec01.jpg");
          textures[3] = THREE.ImageUtils.loadTexture("assets/images/textures/tarmac02.jpg");
          
          Demonixis.GraphicsHelper.repeatTexture(textures[0], {x:16, y:16});
          Demonixis.GraphicsHelper.repeatTexture(textures[1], {x:16, y:16});
          
          document.getElementById("canvasContainer").appendChild(stats.domElement);
          document.getElementById("canvasContainer").appendChild(renderer.domElement);
          
          input = new Demonixis.Input();
          levelHelper = new Demonixis.GameHelper.LevelHelper();
          cameraHelper = new Demonixis.GameHelper.CameraHelper(camera);
      }


      function initializeScene () 
      { 
          miniMap = new Demonixis.Gui.MiniMap(map[0].length, map.length, "canvasContainer");
          miniMap.create();

          var plateformeSize = {width: (map[0].length * 100), height: (map.length * 100) };
          var sol = new THREE.Mesh(new THREE.CubeGeometry(plateformeSize.width, 5, plateformeSize.height), new THREE.MeshPhongMaterial({map: textures[0]}));
          sol.overdraw = true;
          sol.position.set(-50, 1, -50);
          scene.add(sol);
          
          var plafond = new THREE.Mesh(new THREE.CubeGeometry(plateformeSize.width, 5, plateformeSize.height), new THREE.MeshPhongMaterial({map: textures[1]}));
          plafond.position.set(-50, 100, -50);
          plafond.overdraw = true;
          scene.add(plafond);
          
          // Affichage de la map
          for (var y = 0, ly = map.length; y < ly; y++)
          {
              for (var x = 0, lx = map[x].length; x < lx; x++)
              {
                  var size = { x: 100, y: 100, z: 100 };

                  var position = {
                      x: -plateformeSize.width / 2 + size.x * x,
                      y: 50,
                      z: -plateformeSize.height / 2 + size.z * y
                  };

                  if (x == 0 && y == 0) 
                  {
                      cameraHelper.origin.x = position.x;
                      cameraHelper.origin.y = position.y;
                      cameraHelper.origin.z = position.z;
                  }

                  if (map[y][x] > 1)
                  {
                      var id = map[y][x];
                      var o3d = Demonixis.GraphicsHelper.createCube(new THREE.MeshBasicMaterial({map: textures[id]}), position, size);
                      scene.add(o3d);
                  }     
                  if (map[y][x] == "D")
                  {
                      camera.position.set(position.x, position.y, position.z);

                      cameraHelper.origin.position.x = position.x;
                      cameraHelper.origin.position.y = position.y;
                      cameraHelper.origin.position.z = position.z;
                      cameraHelper.origin.position.mapX = x;
                      cameraHelper.origin.position.mapY = y;
                      cameraHelper.origin.position.mapZ = 0;
                  }  
                  
                  miniMap.draw(x, y, map[y][x]);
              }
          }

          // Gestion de l'éclairage
          var ambientLight = new THREE.AmbientLight(0xF6FF4F);
          scene.add(ambientLight);

          var directionalLight = new THREE.DirectionalLight(0xffffff);
          directionalLight.position.set(1, 1, 1).normalize();
          scene.add(directionalLight);
      }


      function update () 
      {
          if (input.keys.up)
          {
              moveCamera("up");
          }

          if (input.keys.down)
          {
               moveCamera("down");
          }

          if (input.keys.left)
          {
              moveCamera("left");
          }

          if (input.keys.right)
          {
              moveCamera("right");
          }

          // Cas du virtual pad
          var params = {rotation: Math.PI / 2, translation: 100 };
          if (input.joykeys.up) {
              moveCamera("up", params);
          }

          if (input.joykeys.down) {
               moveCamera("down", params);
          }

          if (input.joykeys.left) {
              moveCamera("left", params);
          }

          if (input.joykeys.right) {
              moveCamera("right", params);
          }

          stats.update();
      }

      function draw ()
      {
          renderer.render(scene, camera);
      }


      function moveCamera(direction, delta)
      {
          var collide = false;
          var position = {x: camera.position.x, z: camera.position.z};
          var rotation = camera.rotation.y;
          var offset = 50;
          
          var moveParamaters = {
              translation: (typeof delta != "undefined") ? delta.translation : cameraHelper.translation,
              rotation: (typeof delta != "undefined") ? delta.rotation : cameraHelper.rotation 
          };

          switch (direction)
          {
              case "up":
                  position.x -= Math.sin(-camera.rotation.y) * -moveParamaters.translation;
                  position.z -= Math.cos(-camera.rotation.y) * moveParamaters.translation;
                  break;
              case "down":
                  position.x -= Math.sin(camera.rotation.y) * -moveParamaters.translation;
                  position.z += Math.cos(camera.rotation.y) * moveParamaters.translation;
                  break;
              case "left":
                  rotation += moveParamaters.rotation;
                  break;
              case "right":
                  rotation -= moveParamaters.rotation;
                  break;
          }      
          
          // Position actuelle dans la map
          var tx = Math.abs(Math.floor(((cameraHelper.origin.x + (camera.position.x * -1)) / 100)));
          var ty = Math.abs(Math.floor(((cameraHelper.origin.z + (camera.position.z * -1)) / 100)));
          
          // Futur position
          var newTx = Math.abs(Math.floor(((cameraHelper.origin.x + (position.x * -1) + (offset)) / 100)));
          var newTy = Math.abs(Math.floor(((cameraHelper.origin.z + (position.z * -1) + (offset)) / 100)));
          
          // Fix pour ne pas sortir de l'écran
          if (newTx >= map[0].length) { newTx = map[0].length; }
          if (newTx < 0) { newTx = 0; }
          if (newTy >= map.length) { newTy = map.length; }
          if (newTy < 0) { newTy = 0; }
          
          if (map[newTy][newTx] != 1 && !isNaN(map[newTy][newTx])) 
          {
              collide = true;
          }
          else if (map[newTy][newTx] == "A") // A fixer
          {
              // La partie est terminée 
              running = false;
          }

          if (collide == false)    
          {
              camera.rotation.y = rotation;
              camera.position.x = position.x;
              camera.position.z = position.z;
              
              miniMap.update({x: newTx, y: newTy});
          }
          else
          {
              document.getElementById("bumpSound").play();
          }
      }

      function mainLoop (time)
      {
          if (running)
          {
              update();
              draw(); 
              window.requestAnimationFrame(mainLoop, renderer.domElement);
          }
          else
          {
            endScreen();
          }
      }



      function endScreen()
      {
        if (levelHelper.isFinished || levelHelper.isMobile)
        {
          alert("Bravo la partie est finie\n\nMerci d'avoir testé cette démo");
          document.location.href = "https://plus.google.com/u/0/114532615363095107351/posts"; 
        }
        else
        {
          // Supprimer tous les enfants
          for (var i = 0, l = scene.children.length; i < l; i++)
          {
              scene.remove(scene.children[i]);
          }
          renderer.clear();
          scene = new THREE.Scene();
          scene.add(camera);
          loadLevel(levelHelper.getNext());
          running = true;
        }
      }

      // Chargement d'un niveau
      function loadLevel(level)
      {
          var ajax = new XMLHttpRequest();
          ajax.open("GET", "assets/maps/maze3d-" + level + ".json", true);
          ajax.onreadystatechange = function()
          {
              if(ajax.readyState == 4)
              {
                map = JSON.parse(ajax.responseText);
                launch();
              }
          }
          ajax.send(null);
      }

      // Lancement du jeu
      function launch()
      {
          initializeScene();
          mainLoop();
      }

      window.onload = function() 
      {  
        initializeEngine();

        var level = 1; // Paramètre GET
        if (level > 0 || level <= levelHelper.count)
        {
          levelHelper.current = level;
          levelHelper.next = level + 1;
          loadLevel(level);
        }
        else
        {
          levelHelper.current = 1;
          levelHelper.next = 2;
          loadLevel(1);
        } 
      }
    })();
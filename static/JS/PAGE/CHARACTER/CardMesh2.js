/**
 * Created by lz on 2018/10/19.
 */
/*在这里使用一种更简化的卡片网格，并且对这个网格添加隐形的外边界和物理仿真器*/
CardMesh2=function()
{
    newland.object.call(this);
}
CardMesh2.prototype=new newland.object();
CardMesh2.prototype.init=function(param,scene)
{
    //param = param || {};
    if(!param||!param.card)
    {
        alert("卡牌初始化失败");
        return;
    }
    //this.owner=param.owner;
    this.ownerMesh=param.ownerMesh;
    this.uuid= param.card.uuid;
    this.jsonstate= JSON.parse(param.card.jsonstate);//这里还需要再parse一次！！！！
    var jsonstate=this.jsonstate;
    this.belongto=this.jsonstate.belongto?this.jsonstate.belongto:"world";
    this.ispublic= param.card.ispublic;
    this.state=this.jsonstate.state?this.jsonstate.state:"inheap";//非world用户的unit也可能在heap里？？
    if(!param.card.jsonp||param.card.jsonp=="")
    {
        param.card.jsonp="{}";
    }
    //param.card.jsonp=(param.card.jsonp==""?"{}":param.card.jsonp);
    //建立网格
    this.width=param.width;
    this.height=param.height;
    //显示纹理
    var mesh_card=new BABYLON.MeshBuilder.CreatePlane("mesh_card"+this.uuid
        ,{height:this.height,width:this.width
            ,sideOrientation: BABYLON.Mesh.DOUBLESIDE},scene);
    mesh_card.renderingGroupId=2;
    //物理外套
    var mesh_cardp=new BABYLON.MeshBuilder.CreateBox("mesh_cardp"+this.uuid
        ,{width:this.width,height:this.height,depth:0.1},scene);
    mesh_cardp.renderingGroupId=0;
    mesh_card.parent=mesh_cardp;
    mesh_cardp.content=mesh_card;
    mesh_cardp.isPickable=false;//规定只有显示纹理可以pick
    mesh_cardp.card=this;
    this.mesh=mesh_cardp;
    //从侧面看需要显示一条边线
    var path_line=[new BABYLON.Vector3(this.width/2,this.height/2,0),
        new BABYLON.Vector3(this.width/2,-this.height/2,0),
        new BABYLON.Vector3(-this.width/2,-this.height/2,0),
        new BABYLON.Vector3(-this.width/2,this.height/2,0),
        new BABYLON.Vector3(this.width/2,this.height/2,0),];
    var mesh_line = BABYLON.MeshBuilder.CreateTube("mesh_line" + this.uuid, {
        path: path_line,
        radius: 0.02,
        updatable: false
    }, scene);
    //mesh_line.isPickable=false
    mesh_line.renderingGroupId=2;
    mesh_line.parent=mesh_cardp;
    mesh_cardp.line=mesh_line;
    mesh_line.material=MyGame.materials.mat_black;
    //通过逻辑判断，确定card的属性、网格的位置、纹理、物理效果
    if(MyGame.userid=="world")//裁判看到所有
    {
        this.name = param.card.name;
        this.jsonp= JSON.parse(param.card.jsonp);
        this.mainpic= param.card.mainpic;
        this.mainback= param.card.mainback;
        this.comment= this.owner+"_"+param.card.comment;
        if(this.state=="inheap")
        {
            arr_cardheap.push(this);
            var y_start=arr_cardheap.length*0.11;
            mesh_cardp.position=new BABYLON.Vector3(0,y_start,0);
            mesh_cardp.rotation=new BABYLON.Vector3(Math.PI/2,0,0);
            mesh_cardp.physicsImpostor = new BABYLON.PhysicsImpostor(mesh_cardp, BABYLON.PhysicsImpostor.BoxImpostor
                , { mass: 1, restitution: 0.001 ,friction:300,move:false}, scene);
        }
        else //world不会有inhand状态，不是inheap就是inphysic
        {//不再堆里也不在手里，应用查到的初始化位置
            mesh_cardp.position=newland.MakeVector3(jsonstate.posx,jsonstate.posy,jsonstate.posz,0,10,0);
            mesh_cardp.rotation=newland.MakeVector3(jsonstate.rotx,jsonstate.roty,jsonstate.rotz,Math.PI/2,0,0);
            mesh_cardp.physicsImpostor = new BABYLON.PhysicsImpostor(mesh_cardp, BABYLON.PhysicsImpostor.BoxImpostor
                , { mass: 1, restitution: 0.001 ,friction:300,move:false}, scene);
        }
    }
    else {
        if(this.belongto==MyGame.userid)
        {
            this.name = param.card.name;
            this.jsonp= JSON.parse(param.card.jsonp);
            this.mainpic= param.card.mainpic;
            this.mainback= param.card.mainback;
            this.comment= this.owner+"_"+param.card.comment;
        }
        else
        {
            if((this.ispublic+"")=="0")
            {
                this.name = "?";
                this.jsonp= null;
                this.mainpic= "../../ASSETS/PIC/cardback/link.jpg";//未知目标的正面也显示为背面！
                this.mainback= "../../ASSETS/PIC/cardback/link.jpg";
                this.comment= this.owner+"_"+"?";
            }
            else {
                this.name = param.card.name;
                this.jsonp= JSON.parse(param.card.jsonp);
                this.mainpic= param.card.mainpic;
                this.mainback= param.card.mainback;
                this.comment= this.owner+"_"+param.card.comment;
            }
        }
        if(this.state=="inheap")
        {
            //arr_cardheap.push(this);//arr_cardheap只由world管理？？！！
            //var y_start=arr_cardheap.length*0.11;
            //mesh_cardp.position=new BABYLON.Vector3(0,y_start,0);
            //mesh_cardp.rotation=new BABYLON.Vector3(Math.PI/2,0,0);
            mesh_cardp.position=newland.MakeVector3(jsonstate.posx,jsonstate.posy,jsonstate.posz,0,10,0);
            mesh_cardp.rotation=newland.MakeVector3(jsonstate.rotx,jsonstate.roty,jsonstate.rotz,Math.PI/2,0,0);
        }
        else if(this.state="inhand")
        {
            mesh_cardp.parent=this.ownerMesh.mesh.handpoint;//@@@@需要调试,注有父网格存在时不能使用物理引擎
            this.ownerMesh.cardinhand.push(this);
        }
        else if(this.state="inphysic")//虽说在物理状态中，但他的物理运动由world场景决定
        {
            mesh_cardp.position=newland.MakeVector3(jsonstate.posx,jsonstate.posy,jsonstate.posz,0,10,0);
            mesh_cardp.rotation=newland.MakeVector3(jsonstate.rotx,jsonstate.roty,jsonstate.rotz,Math.PI/2,0,0);
            mesh_cardp.physicsImpostor = new BABYLON.PhysicsImpostor(mesh_cardp, BABYLON.PhysicsImpostor.BoxImpostor
                , { mass: 1, restitution: 0.001 ,friction:300,move:false}, scene);
        }
    }

    this.scene = param.scene;
    this.isPicked=false;//这个卡片是否被选中

        //双面纹理
        //var materialf = new BABYLON.StandardMaterial(this.uuid + "cardf", this.scene);//测试用卡片纹理
        if (MyGame.materials[this.name])//通过名称来判断这一种材质是否已经被初始化过。
        {
            mesh_card.material = MyGame.materials[this.name];
        }
        else {
            var materialf = new BABYLON.StandardMaterial(this.name + "cardf", scene);
            materialf.diffuseTexture = new BABYLON.Texture(this.mainpic, scene);
            materialf.diffuseTexture.hasAlpha = false;
            materialf.backFaceCulling = true;
            materialf.bumpTexture =MyGame.textures["grained_uv"];
            materialf.useLogarithmicDepth = true;
            //materialf.diffuseTexture.hasAlpha=true;
            //materialf.useAlphaFromDiffuseTexture=true;
            materialf.freeze();
            MyGame.materials[this.name] = materialf;
            mesh_card.material =materialf;
        }

}
//完整的删除一个card对象的所有内容
CardMesh2.prototype.dispose=function()
{
    this.state="disposeing";
    if(this.mesh.physicsImpostor)
    {
        this.mesh.physicsImpostor.dispose();
        this.mesh.physicsImpostor=null;
    }
    this.mesh.content.dispose();
    this.mesh.line.dispose();
    this.mesh.dispose();
    /*if(this.belongto)
    {
        var arr=[];
        if(this.belongto==userid)
        {
            arr=MyGame.arr_units;
        }
        else {
            arr=MyGame.arr_webplayers[this.belongto].arr_units;
        }
        //var len=arr.length;
        for(var i=0;i<arr.length;i++)
        {
            var card=arr[i];
            if(card.uuid==this.uuid)
            {
                arr.splice(i,1);
                i--
            }
        }
    }*/
}



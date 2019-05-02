/**
 * Created by lz on 2018/3/12.
 */
//加上日期表示它不是通用的工具库
/**
 * Created by lz on 2017/11/28.
 */
var first_pick=true;//进入画面获得焦点的第一下鼠标左键操作，不应该触发发射、抓牌、选取等操作
//这里是处理键盘鼠标等各种操作，并进行转发的代码
function InitMouse()
{
    scene.onPointerDown=onMouseDown;
    scene.onPointerMove=onMouseMove;
    scene.onPointerUp=onMouseUp;

    canvas.addEventListener("blur",function(evt){//监听失去焦点
        releaseKeyState();
        first_pick=true;
    })
    canvas.addEventListener("focus",function(evt){//改为监听获得焦点，因为调试失去焦点时事件的先后顺序不好说
        releaseKeyState();
    })

}
function onMouseDown(evt)
{
    if(!first_pick)
    {
        var width = engine.getRenderWidth();//这种pick专用于first_lock锁定光标模式！！！！
        var height = engine.getRenderHeight();
        var pickInfo = scene.pick(width/2, height/2, null, false, MyGame.Cameras.camera0);//点击信息，取屏幕中心信息而不是鼠标信息！！
        if(MyGame.init_state==1&&MyGame.flag_view=="first_lock")//在用host方法移动相机时，部分禁用了原本的相机控制
        {
            cancelPropagation(evt);
            cancelEvent(evt);
            if(userid=="world")
            {
                ThrowSomeBall();//world用户可以扔一些盒子做测试
            }
        }
    }

}
function onMouseMove(evt)
{
    var width = engine.getRenderWidth();
    var height = engine.getRenderHeight();
    var pickInfo = scene.pick(width/2, height/2, null, false, MyGame.Cameras.camera0);//点击信息
    if(MyGame.flag_view=="first_ani")
    {
        cancelPropagation(evt);
        cancelEvent(evt);
        return;
    }
}
function onMouseUp(evt)
{
    if(!first_pick)
    {

    }
}

function onKeyDown(event)
{//在播放动画时禁用所有的按键、鼠标效果
    if(MyGame.flag_view=="first_ani")
    {
        cancelPropagation(event);
        cancelEvent(event);
        return;
    }
    if(MyGame.flag_view=="first_lock"||MyGame.flag_view=="first_pick")//||MyGame.flag_view=="first_free")
    {
        cancelEvent(event);//覆盖默认按键响应
        var keyCode = event.keyCode;
        var ch = String.fromCharCode(keyCode);//键码转字符
        MyGame.arr_keystate[keyCode]=1;
        /*按键响应有两种，一种是按下之后立即生效的，一种是保持按下随时间积累的，第一种放在这里调度，第二种放在响应的控制类里*/
        if(keyCode==18||keyCode==27)//alt切换释放锁定->改为切换view
        {
            if(MyGame.flag_view=="first_lock")//在first_lock时按下alt，则清空所有遮罩(在first_lock时没有遮罩？ )显示显示手牌
            {
                MyGame.player.changePointerLock2("first_pick");
            }
            else if(MyGame.flag_view=="first_pick")
            {
                MyGame.player.changePointerLock2("first_lock");//光标锁定是比较迟生效的？
            }
        }
    }
}
function onKeyUp(event)
{
    if(MyGame.flag_view=="first_ani")
    {
        cancelPropagation(event);
        cancelEvent(event);
        return;
    }
    if(MyGame.flag_view=="first_lock"||MyGame.flag_view=="first_pick")//||MyGame.flag_view=="first_free")//光标锁定情况下的第一人称移动
    {
        //if(MyGame.flag_view=="first_lock")
        //{
            cancelEvent(event);//覆盖默认按键响应
        //}
        var keyCode = event.keyCode;
        var ch = String.fromCharCode(keyCode);//键码转字符
        MyGame.arr_keystate[keyCode]=0;
    }
}
function releaseKeyState()//将所有激活的按键状态置为0
{
    for(key in MyGame.arr_keystate)
    {
        MyGame.arr_keystate[key]=0;
    }
}
var pickedCard=null;
//这是相机控制所必不可少的
function CameraClick(_this,evt)
{
    if(first_pick)
    {
        //first_pick=false;
        //return;
    }
    if(MyGame.init_state==1||MyGame.init_state==2)//点击canvas则锁定光标，在因为某种原因在first_lock状态脱离焦点后用来恢复焦点
    {//锁定指针时，用来抓牌，注意first_ani状态不允许操作
        if(MyGame.flag_view=="first_lock")
        {
            canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
            if (canvas.requestPointerLock) {//恢复焦点
                canvas.requestPointerLock();

                MyGame.flag_view="first_lock";

                _this.centercursor.isVisible=true;
                first_pick=false;
            }
            if(MyGame.init_state==1&&!first_pick)
            {
                var width = engine.getRenderWidth();
                var height = engine.getRenderHeight();
                var pickInfo = scene.pick(width/2, height/2, null, false, MyGame.Cameras.camera0);
                if(pickInfo.hit&&userid!="world")
                {
                    cancelPropagation(evt);
                    cancelEvent(evt);
                    var mesh=pickInfo.pickedMesh;
                    if(mesh.name.substr(0,9)=="mesh_card"||mesh.name.substr(0,9)=="mesh_line")
                    {
                        var card=mesh.parent.card;
                        //card.isPicked=true;
                        if(card.belongto=="world"&&card.state=="inheap")//属于world且在牌堆中
                        {
                            //在未经过world确定前，card的属性不会改变
                            //MyGame.flag_view="first_ani";
                            pickedCard=card;
                            var obj_msg={};
                            obj_msg.type="catchcard";//发起抓牌请求
                            obj_msg.uuid=card.uuid;
                            obj_msg.userid=userid;
                            sendMessage(JSON.stringify(obj_msg));
                        }
                    }
                    else if(pickedCard&&MyGame.player.centercursor.color=="orange"&&userid!="world")//处于瞄准状态并且有选中的card
                    {
                        //在发生变化之前先通知world用户
                        var obj_msg={};
                        obj_msg.type="playoutcard";//发起抓牌请求,world接着向所有用户发送playcardback
                        obj_msg.uuid=pickedCard.uuid;
                        obj_msg.userid=userid;
                        sendMessage(JSON.stringify(obj_msg));

                        //pickedCard.mesh.scaling=new BABYLON.Vector3(1,1,1);
                        //下面也可以换成0向量和自身网格
                        //pickedCard.mesh.position=newland.vecToGlobal(pickedCard.mesh.position.clone(),pickedCard.mesh.parent);
                        //pickedCard.mesh.parent=null;
                        //newland.MoveWithAni();
                        //pickedCard.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(pickedCard.mesh, BABYLON.PhysicsImpostor.BoxImpostor
                        //   , { mass: 1, restitution: 0.5 ,friction:0.9,move:true}, scene);
                    }
                }


            }
        }
        else//在非锁定光标时，click监听似乎不会被相机阻断
        {
            if(MyGame.flag_view=="first_ani")//由程序控制视角的动画时间
            {
                cancelPropagation(evt);
                cancelEvent(evt);
                return;
            }
            var pickInfo = scene.pick(scene.pointerX, scene.pointerY, null, false, MyGame.Cameras.camera0);//点击信息，取屏幕中心信息而不是鼠标信息！！
            if(MyGame.init_state==1&&MyGame.flag_view=="first_pick")
            {//锁定视角有可能是在操作手牌，也有可能是正在棋盘上显示各种遮罩
                if(pickInfo.hit&&pickInfo.pickedMesh.name.substr(0,9)=="mesh_card")
                {
                    var mesh=pickInfo.pickedMesh;
                    cancelPropagation(evt);
                    cancelEvent(evt);
                    if(pickedCard&&MyGame.player.centercursor.color=="orange")
                    {
                        pickedCard.mesh.line.material=MyGame.materials.mat_black;
                        pickedCard.mesh.position.y=0;
                        MyGame.player.centercursor.color="blue";
                        pickedCard=null;
                    }
                    var mesh=pickInfo.pickedMesh;
                    var card=mesh.parent.card;
                    if(card.state=="inhand")
                    {
                        //PickCard(card);//选择一张手牌
                        mesh.parent.position.y+=0.2;
                        mesh.parent.line.material=MyGame.materials.mat_orange;
                        MyGame.player.centercursor.color="orange";
                        //MyGame.player.changePointerLock2("first_lock");
                        pickedCard=card;
                    }

                }
                else if(pickedCard&&MyGame.player.centercursor.color=="orange")
                {

                    pickedCard.mesh.line.material=MyGame.materials.mat_black;
                    pickedCard.mesh.position.y=0;
                    MyGame.player.centercursor.color="blue";
                    pickedCard=null;
                }
            }
        }
    }
}


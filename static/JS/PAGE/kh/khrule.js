/**
 * Created by lz on 2019/3/19.
 */
var arr_balls={};//考虑到需要选择性的删除其中的元素，使用对象形式比数组形式更好！！！！
var count_balls=0;
function ThrowSomeBall()
{
    //var mesh_ball=new BABYLON.MeshBuilder.CreateSphere("mesh_ball"+count_balls,{size:1},scene);
    var mesh_ball=new BABYLON.MeshBuilder.CreateBox("mesh_ball"+count_balls,{size:1},scene);
    count_balls++;
    mesh_ball.timeRemain=20000;//发射出的小球只保留10s
    var mat_rendom = new BABYLON.StandardMaterial("mat_rendom"+count_balls, this.scene);
    mat_rendom.diffuseColor = new BABYLON.Color3(Math.random(),Math.random(),Math.random());
    mesh_ball.material=mat_rendom;
    //使用Box仿真器时经常发生穿过事件
    mesh_ball.physicsImpostor = new BABYLON.PhysicsImpostor(mesh_ball, BABYLON.PhysicsImpostor.BoxImpostor
        , { mass: 1, restitution: 0.5 ,friction:0.9,move:true}, scene);
    //从ballman的手部发出
    mesh_ball.position=newland.vecToGlobal(MyGame.player.mesh.ballman.handpoint.position.clone(),MyGame.player.mesh);
    mesh_ball.renderingGroupId=2;
    arr_balls[mesh_ball.name]=mesh_ball;
    //使用射线，设定球的初始运动方式，射线是pickinginfo 的更普遍的运用方式
    var forward = new BABYLON.Vector3(0,0,1);
    forward = newland.vecToGlobal(forward, MyGame.player.mesh);
    var direction = forward.subtract(MyGame.player.mesh.position);
    direction = BABYLON.Vector3.Normalize(direction).scale(100);
    var direction2=BABYLON.Vector3.Normalize(forward).scale(100);

    mesh_ball.physicsImpostor.setLinearVelocity(direction);
    //使用“力”也同样会发生y方向逆转，而且似乎水平速度也变成垂直速度了(用力时要小一些，direction不能乘以100)
    //mesh_ball.physicsImpostor.applyImpulse(direction, mesh_ball.getAbsolutePosition().clone());

    console.log(mesh_ball.name+":"+mesh_ball.physicsImpostor.getLinearVelocity().x+","
        +mesh_ball.physicsImpostor.getLinearVelocity().y+","+mesh_ball.physicsImpostor.getLinearVelocity().z);

}
//重新排列手牌列表中的所有手牌
function ArrangeHandCard(cardinhand)
{
    var len=cardinhand.length;
    for(var i=0;i<len;i++)
    {
        var mesh=cardinhand[i].mesh;
        mesh.scaling=new BABYLON.Vector3(0.3,0.3,0.3);
        mesh.position.z=-i*0.1+(len*0.1)/2;
        mesh.position.x=0.6*i-(len*0.6)/2;
        mesh.position.y=0;
        //var pos=mesh.position.clone();
        var pos=new BABYLON.Vector3(0,0.5,-3);
        mesh.lookAt(pos);
    }
}
//将card的所属权交给另一个用户，从1到2
function ChangeCardsBelone(userid1,userid2,currentcard)
{
    //var arr1=user1.arr_units;
    var arr1=[];
    var arr2=[];
    if(userid1==MyGame.userid)//如果user1是本clinet的实际操作用户
    {
        arr1=MyGame.arr_units;
    }
    else if(userid1!="world")
    {
        arr1=MyGame.arr_webplayers[userid1].arr_units;
    }
    else
    {
        arr1=MyGame.arr_worldunits;
    }
    if(userid2==MyGame.userid)//如果user1是本clinet的实际操作用户
    {
        arr2=MyGame.arr_units;
    }
    else if(userid2!="world")
    {
        arr2=MyGame.arr_webplayers[userid2].arr_units;
    }
    else {
        arr2=MyGame.arr_worldunits;
    }
    for(var i=0;i<arr1.length;i++)
    {
        var card=arr1[i];
        if(card.uuid==currentcard.uuid)
        {
            arr1.splice(i,1);
            break;
        }
    }
    arr2.push(currentcard);
    currentcard.belongto=userid2;
}

package com.websocket.http;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.JSONArray;
import com.websocket.netty.NettyConfig;
import com.websocket.pojo.WsUser;
import com.websocket.util.MyNettyUtil;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.annotation.RequestScope;

import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by lz on 2019/3/7.
 */
@Controller
@ResponseBody
public class HttpController {
    private SimpleDateFormat df=new SimpleDateFormat("yyyy-MM-dd");
    private String str_gzrq=df.format(new Date());

    //这是强行弄成像servlet一样了
    //@RequestMapping("/Login.ashx")
    public String HandleLogin(@RequestBody String str_param)throws Exception
    {//取整个http请求的body
        Map<String, String> mapParam = MyNettyUtil.SplitParam(str_param);
        String str_func=mapParam.get("func");
        JSONObject obj_json=new JSONObject();
        try{
            switch(str_func)
            {
                case "get_login":
                {
                    String str_czyid=mapParam.get("czyid");
                    String str_czymm=mapParam.get("czymm");
                    int flag=0;//是否找到这个用户id
                    //检查用户map中是否有这个用户，如果有则验证密码，并把用户的资源交给这个会话管理
                    // ，如果没有用户则用这个用户名和密码新建一个用户
                    for (Map.Entry<String, WsUser> entry : NettyConfig.mapUser.entrySet()) {//对于图里的每个对象，注意这和js用key来遍历是不同的！！
                        if(entry.getKey().equals(str_czyid))//如果在在线用户图里找到这个用户id
                        {
                            WsUser user=entry.getValue();
                            if(str_czymm.equals(user.passWord))
                            {
                                obj_json.put("state","OK");
                                obj_json.put("token",user.token);
                                flag=1;
                                //str_res="OK";
                                break;
                            }
                            else
                            {
                                obj_json.put("state","Exception");
                                obj_json.put("content","这个用户名已经被占用，请换一个用户名或者输入正确的密码");
                                break;
                            }

                        }
                    }
                    if(flag==0)//没有找到用户
                    {
                        WsUser user=new WsUser(str_czyid,str_czymm);
                        user.token=UUID.randomUUID().toString();
                        NettyConfig.mapUser.put(str_czyid,user);
                        obj_json.put("state","OK");
                        obj_json.put("token",user.token);

                    }
                    break;
                }
                case "check_session":
                {
                    String str_czyid=mapParam.get("czyid");
                    String str_token=mapParam.get("token");
                    int flag=0;//是否找到这个用户id
                    //检查用户map中是否有这个用户，如果有则返回工作日期等前端需要的属性，如果没找到则告知前端重新登录
                    for (Map.Entry<String, WsUser> entry : NettyConfig.mapUser.entrySet()) {//对于图里的每个对象，注意这和js用key来遍历是不同的！！
                        if(entry.getKey().equals(str_czyid))//如果在在线用户图里找到这个用户id
                        {
                            WsUser user=entry.getValue();
                            if(user.token.equals(str_token))
                            {
                                obj_json.put("state","OK");
                                str_gzrq=df.format(new Date());
                                JSONObject obj_json2=new JSONObject();
                                obj_json2.put("dlrq",str_gzrq);
                                obj_json.put("content",obj_json2);
                            }
                            else
                            {
                                obj_json.put("state","NotOnline");
                                obj_json.put("content","token失效");
                            }
                            flag=1;
                            break;
                        }
                    }
                    if(flag==0)//没有找到用户
                    {
                        obj_json.put("state","NotOnline");
                        obj_json.put("content","没有找到要控制的用户，请重新登录吧");
                    }
                    break;
                }
                case "quit_session":
                {
                    String str_czyid=mapParam.get("czyid");
                    String str_token=mapParam.get("token");
                    int flag=0;//是否找到这个用户id
                    //检查用户map中是否有这个用户，如果有则从用户Map中删除这个用户
                    for (Map.Entry<String, WsUser> entry : NettyConfig.mapUser.entrySet()) {//对于图里的每个对象，注意这和js用key来遍历是不同的！！
                        if(entry.getKey().equals(str_czyid))//如果在在线用户图里找到这个用户id
                        {
                            WsUser user=entry.getValue();
                            if(user.token.equals(str_token))
                            {
                                obj_json.put("state","Logout");
                            }
                            else
                            {
                                obj_json.put("state","NotOnline");
                                obj_json.put("content","token失效");
                            }
                            flag=1;
                            break;
                        }
                    }
                    if(flag==0)//没有找到用户
                    {
                        obj_json.put("state","NotOnline");
                        obj_json.put("content","没有找到要登出的用户，请重新登录吧");
                    }
                    break;
                }
                default:
                {
                    obj_json.put("state","Exception");
                    obj_json.put("content","没有找到请求的方法");
                    break;
                }
            }
        }
        catch(Exception e)
        {
            e.printStackTrace();
            obj_json.put("state","Exception");
            obj_json.put("content",e.toString());

        }
        return JSON.toJSONString(obj_json);
    }
}
